/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as P from 'parsimmon'

import * as h from '../helper'
import { AtomGroupArgs, OperatorList } from '../types'

import properties from './properties'
import { structureMap } from './properties'
import operators from './operators'
import keywords from './keywords'

import Transpiler from '../transpiler'
import B from '../../molql/builder'

// <, <=, =, >=, >, !=, and LIKE
const valueOperators: OperatorList = [
  {
    '@desc': 'value comparisons',
    '@examples': [],
    name: '=',
    abbr: ['=='],
    type: h.binaryLeft,
    rule: P.regex(/\s*(LIKE|>=|<=|=|!=|>|<)\s*/i, 1),
    map: (op, e1, e2) => {
      // console.log(op, e1, e2)
      let expr
      if (e1 === 'structure') {
        expr = B.core.flags.hasAny([B.ammp('secondaryStructureFlags'), structureMap(e2)])
      } else if (e2 === 'structure') {
        expr = B.core.flags.hasAny([B.ammp('secondaryStructureFlags'), structureMap(e1)])
      } else if (e1.head === 'core.type.regex') {
        expr = B.core.str.match([ e1, B.core.type.str([e2]) ])
      } else if (e2.head === 'core.type.regex') {
        expr = B.core.str.match([ e2, B.core.type.str([e1]) ])
      } else if (op.toUpperCase() === 'LIKE') {
        if (e1.head) {
          expr = B.core.str.match([
            B.core.type.regex([`^${e2}$`, 'i']),
            B.core.type.str([e1])
          ])
        } else {
          expr = B.core.str.match([
            B.core.type.regex([`^${e1}$`, 'i']),
            B.core.type.str([e2])
          ])
        }
      }
      if (e1.head === 'structure.atom-property.macromolecular.label_atom_id') e2 = B.atomName(e2)
      if (e2.head === 'structure.atom-property.macromolecular.label_atom_id') e1 = B.atomName(e1)
      if (e1.head === 'structure.atom-property.core.element-symbol') e2 = B.es(e2)
      if (e2.head === 'structure.atom-property.core.element-symbol') e1 = B.es(e1)
      if (!expr) {
        switch (op) {
          case '=':
            expr = B.core.rel.eq([e1, e2])
            break
          case '!=':
            expr = B.core.rel.neq([e1, e2])
            break
          case '>':
            expr = B.core.rel.gr([e1, e2])
            break
          case '<':
            expr = B.core.rel.lt([e1, e2])
            break
          case '>=':
            expr = B.core.rel.gre([e1, e2])
            break
          case '<=':
            expr = B.core.rel.lte([e1, e2])
            break
          default: throw new Error(`value operator '${op}' not supported`);
        }
      }
      return B.struct.generator.atomGroups({ 'atom-test': expr })
    }
  }
]

function atomExpressionQuery (x: any[]) {
  const [resno, inscode, chainname, atomname, altloc, ] = x[1]
  const tests: AtomGroupArgs = {}

  if (chainname) {
    // should be configurable, there is an option in Jmol to use auth or label
    tests['chain-test'] = B.core.rel.eq([ B.ammp('auth_asym_id'), chainname ])
  }

  const resProps = []
  if (resno) resProps.push(B.core.rel.eq([ B.ammp('auth_seq_id'), resno ]))
  if (inscode) resProps.push(B.core.rel.eq([ B.ammp('pdbx_PDB_ins_code'), inscode ]))
  if (resProps.length) tests['residue-test'] = h.andExpr(resProps)

  const atomProps = []
  if (atomname) atomProps.push(B.core.rel.eq([ B.ammp('auth_atom_id'), atomname ]))
  if (altloc) atomProps.push(B.core.rel.eq([ B.ammp('label_alt_id'), altloc ]))
  if (atomProps.length) tests['atom-test'] = h.andExpr(atomProps)

  return B.struct.generator.atomGroups(tests)
}

const lang = P.createLanguage({
  Integer: () => P.regexp(/-?[0-9]+/).map(Number).desc('integer'),

  Parens: function (r) {
    return P.alt(
      r.Parens,
      r.Operator,
      r.Expression
    ).wrap(P.string('('), P.string(')'))
  },

  Expression: function(r) {
    return P.alt(
      r.Keywords,

      r.Resno.lookahead(P.regex(/\s*(?!(LIKE|>=|<=|!=|[:^%/.=><]))/i)).map(x => B.struct.generator.atomGroups({
        'residue-test': B.core.rel.eq([ B.ammp('auth_seq_id'), x ])
      })),
      r.AtomExpression.map(atomExpressionQuery),

      r.ValueQuery,

      r.Element.map((x: string) => B.struct.generator.atomGroups({
        'atom-test': B.core.rel.eq([ B.acp('elementSymbol'), B.struct.type.elementSymbol(x) ])
      })),
      r.Resname.map((x: string) => B.struct.generator.atomGroups({
        'residue-test': B.core.rel.eq([ B.ammp('label_comp_id'), x ])
      })),
    )
  },

  Operator: function(r) {
    return h.combineOperators(operators, P.alt(r.Parens, r.Expression))
  },

  AtomExpression: function(r) {
    return P.seq(
      P.lookahead(r.AtomPrefix),
      P.seq(
        r.Resno.or(P.of(null)),
        r.Inscode.or(P.of(null)),
        r.Chainname.or(P.of(null)),
        r.Atomname.or(P.of(null)),
        r.Altloc.or(P.of(null)),
        r.Model.or(P.of(null))
      )
    )
  },

  AtomPrefix: () => P.regex(/[0-9:^%/.]/).desc('atom-prefix'),

  Chainname: () => P.regex(/:([A-Za-z]{1,3})/, 1).desc('chainname'),
  Model: () => P.regex(/\/([0-9]+)/, 1).map(Number).desc('model'),
  Element: () => P.regex(/_([A-Za-z]{1,3})/, 1).desc('element'),
  Atomname: () => P.regex(/\.([a-zA-Z0-9]{1,4})/, 1).map(B.atomName).desc('atomname'),
  Resname: () => P.regex(/[a-zA-Z0-9]{1,4}/).desc('resname'),
  Resno: (r) => r.Integer.desc('resno'),
  Altloc: () => P.regex(/%([a-zA-Z0-9])/, 1).desc('altloc'),
  Inscode: () => P.regex(/\^([a-zA-Z0-9])/, 1).desc('inscode'),

  // BracketedResname: function (r) {
  //   return P.regex(/\.([a-zA-Z0-9]{1,4})/, 1)
  //     .desc('bracketed-resname')
  //   // [0SD]
  // },

  // ResnoRange: function (r) {
  //   return P.regex(/\.([\s]){1,3}/, 1)
  //     .desc('resno-range')
  //   // 123-200
  //   // -12--3
  // },

  Keywords: () => P.alt(...h.getKeywordRules(keywords)),

  Query: function(r) {
    return P.alt(
      r.Operator,
      r.Parens,
      r.Expression
    ).trim(P.optWhitespace)
  },

  Number: function () {
    return P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/)
      .map(Number)
      .desc('number')
  },

  String: function () {
    const w = h.getReservedWords(properties, keywords, operators)
      .sort(h.strLenSortFn).map(h.escapeRegExp).join('|')
    return P.alt(
      P.regex(new RegExp(`(?!(${w}))[A-Z0-9_]+`, 'i')),
      P.regex(/'((?:[^"\\]|\\.)*)'/, 1),
      P.regex(/"((?:[^"\\]|\\.)*)"/, 1).map(x => B.core.type.regex([`^${x}$`, 'i']))
    )
  },

  Value: function (r) {
    return P.alt(r.Number, r.String)
  },

  ValueParens: function (r) {
    return P.alt(
      r.ValueParens,
      r.ValueOperator,
      r.ValueExpressions
    ).wrap(P.string('('), P.string(')'))
  },

  ValuePropertyNames: function() {
    return P.alt(...h.getPropertyNameRules(properties, /LIKE|>=|<=|=|!=|>|<|\)|\s/i))
  },

  ValueOperator: function(r) {
    return h.combineOperators(valueOperators, P.alt(r.ValueParens, r.ValueExpressions))
  },

  ValueExpressions: function(r) {
    return P.alt(
      r.Value,
      r.ValuePropertyNames
    )
  },

  ValueQuery: function(r) {
    return P.alt(
      r.ValueOperator.map(x => {
        if (x.head) {
          if (x.head.startsWith('structure.generator')) return x
        } else {
          if (typeof x === 'string' && x.length <= 4) {
            return B.struct.generator.atomGroups({
              'residue-test': B.core.rel.eq([ B.ammp('label_comp_id'), x ])
            })
          }
        }
        throw new Error(`values must be part of an comparison, value '${x}'`)
      })
    )
  }
})

const transpiler: Transpiler = str => lang.Query.tryParse(str)
export default transpiler
