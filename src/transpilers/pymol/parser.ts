/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as P from 'parsimmon'
import * as h from '../helper'

import Transpiler from '../transpiler'
import B from '../../molql/builder'
import Expression from '../../mini-lisp/expression'

const Q = h.QueryBuilder

const _ = P.optWhitespace
const __ = P.whitespace
const slash = P.string('/')

const reFloat = /[-+]?[0-9]*\.?[0-9]+/
const rePosInt = /[0-9]+/

function listMap(x: string) { return x.split('+') }
function rangeMap(x: string) {
  const [min, max] = x.split('-').map(parseInt)
  return {min, max}
}
function listOrRangeMap(x: string) {
  return x.includes('-') ? rangeMap(x) : listMap(x).map(parseInt)
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
    level: 'residue-test', property: B.ammp('auth_seq_id')
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

const properties: {[k: string]: P.Parser<any>} = {}
const namedPropertiesList: P.Parser<any>[] = []
Object.keys(propertiesSpec).forEach( name => {
  const ps = propertiesSpec[name]
  const rule = P.regex(ps.regex).map(x => Q.test(ps.property, ps.map(x)))
  const short = h.escapeRegExp(ps.short)
  const nameRule = P.regex(RegExp(`${name}|${short}`, 'i')).trim(_)
  const groupMap = (x: any) => B.struct.generator.atomGroups({[ps.level]: x})
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

function ofOp (name: string, short?: string) {
  const op = short ? `${name}|${h.escapeRegExp(short)}` : name
  const re = RegExp(`(${op})\\s+([-+]?[0-9]*\\.?[0-9]+)\\s+OF`, 'i')
  return h.infixOp(re, 2).map(parseFloat)
}

const opList = [
  {
    // Selects atoms that are not included in s1.
    // NOT s1
    type: h.prefix,
    rule: P.alt(P.regex(/NOT/i).skip(__), P.string('!').skip(_)),
    map: Q.invert
  },
  {
    // Selects atoms included in both s1 and s2.
    // s1 AND s2
    type: h.binaryLeft,
    rule: h.infixOp(/AND|&/i),
    map: Q.intersect
  },
  {
    // Selects atoms included in either s1 or s2.
    // s1 OR s2
    type: h.binaryLeft,
    rule: h.infixOp(/OR|\|/i),
    map: Q.merge
  },
  {
    // Selects atoms in s1 whose identifiers name, resi, resn, chain and segi
    // all match atoms in s2.
    // s1 IN s2
    type: h.binaryLeft,
    rule: h.infixOp(/IN/i),
    map: (op: string, s1: Expression, s2: Expression) => [op, s1, s2]
  },
  {
    // Selects atoms in s1 whose identifiers name and resi match atoms in s2.
    // s1 LIKE s2
    type: h.binaryLeft,
    rule: h.infixOp(/LIKE|l\./i),
    map: (op: string, s1: Expression, s2: Expression) => [op, s1, s2]
  },
  {
    // Selects all atoms whose van der Waals radii are separated from the
    // van der Waals radii of s1 by a minimum of X Angstroms.
    // s1 GAP X
    type: h.postfix,
    rule: h.postfixOp(/GAP\s+([-+]?[0-9]*\.?[0-9]+)/i, 1).map(parseFloat),
    map: (distance: number, target: Expression) => {
      return B.struct.filter.within({
        selection: B.struct.generator.atomGroups(),
        target,
        radius: B.core.math.add([distance, B.acp('x')]) // TODO replace by vdw
      })
    }
  },
  {
    // Selects atoms with centers within X Angstroms of the center of any atom ins1.
    // s1 AROUND X
    type: h.postfix,
    rule: h.postfixOp(/(AROUND|a\.)\s+([-+]?[0-9]*\.?[0-9]+)/i, 2).map(parseFloat),
    map: (radius: number, target: Expression) => {
      return B.struct.filter.within({
        selection: B.struct.generator.atomGroups(), target, radius
      })
    }
  },
  {
    // Expands s1 by all atoms within X Angstroms of the center of any atom in s1.
    // s1 EXPAND X
    type: h.postfix,
    rule: h.postfixOp(/(EXPAND|x\.)\s+([-+]?[0-9]*\.?[0-9]+)/i, 2).map(parseFloat),
    map: (radius: number, selection: Expression) => {
      return B.struct.modifier.includeSurroundings({ selection, radius })
    }
  },
  {
    // Selects atoms in s1 that are within X Angstroms of any atom in s2.
    // s1 WITHIN X OF s2
    type: h.binaryLeft,
    rule: ofOp('WITHIN', 'w.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.filter.within({ selection, target, radius })
    }
  },
  {
    // Same as within, but excludes s2 from the selection
    // (and thus is identical to s1 and s2 around X).
    // s1 NEAR_TO X OF s2
    type: h.binaryLeft,
    rule: ofOp('NEAR_TO', 'nto.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.modifier.exceptBy({
        selection: B.struct.filter.within({ selection, target, radius }),
        by: target
      })
    }
  },
  {
    // Selects atoms in s1 that are at least X Anstroms away from s2.
    // s1 BEYOND X OF s2
    type: h.binaryLeft,
    rule: ofOp('BEYOND', 'be.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.modifier.intersectBy({
        selection,
        by: B.struct.generator.queryInSelection({
          selection: B.struct.modifier.includeSurroundings({ selection: target, radius }),
          query: B.struct.generator.atomGroups(),
          'in-complement': true
        })
      })
    }
  },
  {
    // Expands selection to complete residues.
    // BYRES s1
    type: h.prefix,
    rule: h.prefixOp(/BYRES|br\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // Expands selection to complete molecules.
    // BYMOLECULE s1
    type: h.prefix,
    rule: h.prefixOp(/BYMOLECULE|bm\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // Expands selection to complete fragments.
    // BYFRAGMENT s1
    type: h.prefix,
    rule: h.prefixOp(/BYFRAGMENT|bf\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // Expands selection to complete segments.
    // BYSEGMENT s1
    type: h.prefix,
    rule: h.prefixOp(/BYSEGMENT|bs\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // Expands selection to complete objects.
    // BYOBJECT s1
    type: h.prefix,
    rule: h.prefixOp(/BYOBJECT|bo\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // Expands selection to unit cell.
    // BYCELL s1
    type: h.prefix,
    rule: h.prefixOp(/BYCELL/i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // All rings of size ≤ 7 which have at least one atom in s1
    // BYRING s1
    type: h.prefix,
    rule: h.prefixOp(/BYRING/i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // Selects atoms directly bonded to s1, excludes s1.
    // NEIGHBOUR s1
    type: h.prefix,
    rule: h.prefixOp(/NEIGHBOUR|nbr\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // Selects atoms directly bonded to s1, may include s1.
    // BOUND_TO s1
    type: h.prefix,
    rule: h.prefixOp(/BOUND_TO|bto\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    // Extends s1 by X bonds connected to atoms in s1.
    // s1 EXTEND X
    type: h.postfix,
    rule: h.postfixOp(/(EXTEND|xt\.)\s+([0-9]+)/i, 2),
    map: (count: string, selection: Expression) => [count, selection]
  }
]



function atomSelectionQuery(x: any) {
  const tests: h.AtomGroupArgs = {}
  const props: {[k: string]: any[]} = {}

  for(let k in x){
    const ps = propertiesSpec[k]
    if (!ps){
      console.warn(`property '${k}' not supported, value '${x[k]}'`)
      continue
    }
    if (x[k] === null) continue
    if (!props[ps.level]) props[ps.level] = []
    props[ps.level].push(x[k])
  }

  for(let p in props){
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

  Expression: function(r) {
    return P.alt(
      r.AtomSelectionMacro.map(atomSelectionQuery),
      r.NamedAtomProperties,
      r.Pepseq,
      r.Rep
    )
  },

  AtomSelectionMacro: function(r) {
    return P.alt(
      slash.then(P.alt(
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi).skip(slash),
          orNull(p.chain).skip(slash),
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {object: x[0], segi: x[1], chain: x[2], resi: x[3], name: x[4]}}),
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi).skip(slash),
          orNull(p.chain).skip(slash),
          orNull(p.resi)
        ).map(x => {return {object: x[0], segi: x[1], chain: x[2], resi: x[3]}}),
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi).skip(slash),
          orNull(p.chain)
        ).map(x => {return {object: x[0], segi: x[1], chain: x[2]}}),
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi)
        ).map(x => {return {object: x[0], segi: x[1]}}),
        P.seq(
          orNull(r.Object)
        ).map(x => {return {object: x[0]}}),
      )),
      P.alt(
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi).skip(slash),
          orNull(p.chain).skip(slash),
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {object: x[0], segi: x[1], chain: x[2], resi: x[3], name: x[4]}}),
        P.seq(
          orNull(p.segi).skip(slash),
          orNull(p.chain).skip(slash),
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {segi: x[0], chain: x[1], resi: x[2], name: x[3]}}),
        P.seq(
          orNull(p.chain).skip(slash),
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {chain: x[0], resi: x[1], name: x[2]}}),
        P.seq(
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {resi: x[0], name: x[1]}}),
      )
    )
  },

  NamedAtomProperties: function() {
    return P.alt(...namedPropertiesList)
  },

  Object: () => P.regex(/[a-zA-Z0-9+]+/),

  // Selects peptide sequence matching upper-case one-letter
  // sequence SEQ (see also FindSeq).
  // PEPSEQ seq
  Pepseq: () => P.regex(/(PEPSEQ|ps\.)\s+([a-z]+)/i, 2),

  // Selects atoms which show representation rep.
  // REP rep
  Rep: () => P.regex(/REP\s+(spheres|lines)/i, 1),

  Operator: function(r) {
    return h.combineOperators(opList, P.alt(r.Parens, r.Expression))
  },

  Query: function(r) {
    return P.alt(
      r.Operator,
      r.Parens,
      r.Expression
    ).trim(_)
  }
})

const transpiler: Transpiler = str => B.evaluate(lang.Query.tryParse(str))
export default transpiler
