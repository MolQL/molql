/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import * as P from 'parsimmon'
import * as h from '../helper'

import Transpiler from '../transpiler'
import B from '../../../molql/builder'

const Q = h.QueryBuilder

const _ = P.optWhitespace
const __ = P.whitespace
const slash = P.string('/')

const reFloat = /[-+]?[0-9]*\.?[0-9]+/
const rePosInt = /[0-9]+/

function listMap(x: string) { return x.split('+') }
function rangeMap(x: string) {
    const [min, max] = x.split('-')
    return { min, max }
}
function listOrRangeMap(x: string) {
    return x.includes('-') ? rangeMap(x) : listMap(x)
}
function elementListMap(x: string) {
    return x.split('+').map(B.struct.type.elementSymbol)
}

interface PropertySpec {
    isNumeric?: boolean
    short: string
    regex: RegExp
    map: (s: string) => any
    level: 'atom-test' | 'residue-test' | 'chain-test' | 'entity-test'
    property: any
    value?: Function
}

const propertiesSpec: { [k: string]: PropertySpec } = {
    symbol: {
        short: 'e.', regex: /[a-zA-Z+]+/, map: listMap,
        level: 'atom-test', property: B.acp('elementSymbol')
    },
    name: {
        short: 'n.', regex: /[a-zA-Z0-9+]+/, map: listMap,
        level: 'atom-test', property: B.ammp('label_atom_id')
    },
    resn: {
        short: 'r.', regex: /[a-zA-Z0-9+]+/, map: listMap,
        level: 'residue-test', property: B.ammp('label_comp_id')
    },
    resi: {
        short: 'i.', regex: /[0-9+-]+/, map: listOrRangeMap,
        level: 'residue-test', property: B.ammp('label_seq_id')
    },
    alt: {
        short: 'alt', regex: /[a-zA-Z0-9+]+/, map: listMap,
        level: 'atom-test', property: B.ammp('label_alt_id')
    },
    chain: {
        short: 'c.', regex: /[a-zA-Z0-9+]+/, map: listMap,
        level: 'chain-test', property: B.ammp('auth_asym_id')
    },
    segi: {
        short: 's.', regex: /[a-zA-Z0-9+]+/, map: listMap,
        level: 'chain-test', property: B.ammp('label_asym_id')
    },
    // flag: { short: 'f.', regex: /[0-9]+/, map: intMap, level: 'atom' },  // ???
    // numeric_type: { short: 'nt.', regex: /[0-9]+/, map: intMap, level: 'atom' },
    text_type: {
        short: 'tt.', regex: /[a-zA-Z0-9+]+/, map: elementListMap,
        level: 'atom-test', property: B.acp('elementSymbol')
    },
    id: {
        short: 'id', regex: rePosInt, map: parseInt,
        level: 'atom-test', property: B.ammp('id')
    },
    // index: { short: 'idx.', regex: rePosInt, map: intMap, level: 'atom' },
    // ss: { short: 'ss', regex: /[a-zA-Z+]+/, map: listMap, level: 'residue' }

    b: {
        isNumeric: true,
        short: 'b', regex: reFloat, map: parseFloat,
        level: 'atom-test', property: B.ammp('B_iso_or_equiv')
    },
    q: {
        isNumeric: true,
        short: 'q', regex: reFloat, map: parseFloat,
        level: 'atom-test', property: B.ammp('occupancy')
    },
    formal_charge: {
        isNumeric: true,
        short: 'fc.', regex: reFloat, map: parseFloat,
        level: 'atom-test', property: B.ammp('pdbx_formal_charge')
    },
    // partial_charge: { 
    //   isNumeric: true,
    //   short: 'pc.', regex: reFloat, map: parseFloat,
    //   level: 'atom-test', property: B.acp('partialCharge')
    // }
}

const properties: { [k: string]: P.Parser<any> } = {}
const namedPropertiesList: P.Parser<any>[] = []
Object.keys(propertiesSpec).forEach(name => {
    const ps = propertiesSpec[name]
    const rule = P.regex(ps.regex).map(x => Q.test(ps.property, ps.map(x)))
    const short = h.escapeRegExp(ps.short)
    const nameRule = P.regex(RegExp(`${name}|${short}`, 'i')).trim(_)
    const groupMap = (x: any) => B.struct.generator.atomGroups({ [ps.level]: x })
    if (ps.isNumeric) {
        namedPropertiesList.push(
            nameRule.then(P.seq(
                P.regex(/>=|<=|=|!=|>|</).trim(_),
                P.regex(ps.regex).map(ps.map)
            )).map(x => Q.test(ps.property, { op: x[0], val: x[1] })).map(groupMap)
        )
    } else {
        properties[name] = rule
        namedPropertiesList.push(nameRule.then(rule).map(groupMap))
    }
})

const p = properties

function orNull(rule: P.Parser<any>) {
    return rule.or(P.of(null))
}

const not = P.alt(P.regex(/NOT/i).skip(__), P.string('!').skip(_))
const and = __.then(P.regex(/AND/i).skip(__))
const or = __.then(P.regex(/OR/i).skip(__))

const opList = [
    { type: h.prefix, rule: not, map: Q.invert },
    { type: h.binaryLeft, rule: and, map: Q.intersect },
    { type: h.binaryLeft, rule: or, map: Q.merge }
]

function atomSelectionQuery(x: any) {
    const tests: h.AtomGroupArgs = {}
    const props: { [k: string]: any[] } = {}

    for (let k in x) {
        const ps = propertiesSpec[k]
        if (!ps) {
            console.warn(`property '${k}' not supported, value '${x[k]}'`)
            continue
        }
        if (x[k] === null) continue
        if (!props[ps.level]) props[ps.level] = []
        props[ps.level].push(x[k])
    }

    for (let p in props) {
        tests[p] = Q.and(props[p])
    }

    return B.struct.generator.atomGroups(tests)
}

const lang = P.createLanguage({
    Integer: () => P.regexp(/-?[0-9]+/).map(Number).desc('integer'),

    Parens: function (r) {
        return P.string('(')
            .then(P.alt(r.Parens, r.Operator, r.Expression))
            .skip(P.string(')'))
    },

    Expression: function (r) {
        return P.alt(
            r.AtomSelectionMacro.map(atomSelectionQuery),
            r.NamedAtomProperties
        )
    },

    AtomSelectionMacro: function (r) {
        return P.alt(
            slash.then(P.alt(
                P.seq(
                    orNull(r.Object).skip(slash),
                    orNull(p.segi).skip(slash),
                    orNull(p.chain).skip(slash),
                    orNull(p.resi).skip(slash),
                    orNull(p.name)
                ).map(x => { return { object: x[0], segi: x[1], chain: x[2], resi: x[3], name: x[4] } }),
                P.seq(
                    orNull(r.Object).skip(slash),
                    orNull(p.segi).skip(slash),
                    orNull(p.chain).skip(slash),
                    orNull(p.resi)
                ).map(x => { return { object: x[0], segi: x[1], chain: x[2], resi: x[3] } }),
                P.seq(
                    orNull(r.Object).skip(slash),
                    orNull(p.segi).skip(slash),
                    orNull(p.chain)
                ).map(x => { return { object: x[0], segi: x[1], chain: x[2] } }),
                P.seq(
                    orNull(r.Object).skip(slash),
                    orNull(p.segi)
                ).map(x => { return { object: x[0], segi: x[1] } }),
                P.seq(
                    orNull(r.Object)
                ).map(x => { return { object: x[0] } }),
            )),
            P.alt(
                P.seq(
                    orNull(r.Object).skip(slash),
                    orNull(p.segi).skip(slash),
                    orNull(p.chain).skip(slash),
                    orNull(p.resi).skip(slash),
                    orNull(p.name)
                ).map(x => { return { object: x[0], segi: x[1], chain: x[2], resi: x[3], name: x[4] } }),
                P.seq(
                    orNull(p.segi).skip(slash),
                    orNull(p.chain).skip(slash),
                    orNull(p.resi).skip(slash),
                    orNull(p.name)
                ).map(x => { return { segi: x[0], chain: x[1], resi: x[2], name: x[3] } }),
                P.seq(
                    orNull(p.chain).skip(slash),
                    orNull(p.resi).skip(slash),
                    orNull(p.name)
                ).map(x => { return { chain: x[0], resi: x[1], name: x[2] } }),
                P.seq(
                    orNull(p.resi).skip(slash),
                    orNull(p.name)
                ).map(x => { return { resi: x[0], name: x[1] } }),
            )
        )
    },

    NamedAtomProperties: function () {
        return P.alt(...namedPropertiesList)
    },

    Object: () => P.regex(/[a-zA-Z0-9+]+/),

    Operator: function (r) {
        return h.combineOperators(opList, P.alt(r.Parens, r.Expression))
        // return h.binaryLeft(
        //         r.Or,
        //         h.binaryLeft(
        //           r.And,
        //           h.prefix(
        //             r.Not,
        //             P.alt(r.Parens, r.Expression),
        //             Q.invert
        //           ),
        //           Q.intersect
        //         ),
        //         Q.merge
        //       )
    },

    Query: function (r) {
        return P.alt(
            r.Operator,
            r.Parens,
            r.Expression
        ).trim(_)
    }
})

const transpiler: Transpiler = str => B.evaluate(lang.Query.tryParse(str))
export default transpiler
