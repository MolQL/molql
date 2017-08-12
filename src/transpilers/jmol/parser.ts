/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as P from 'parsimmon'
import * as h from '../helper'

import Transpiler from '../transpiler'
import B from '../../molql/builder'

const Q = h.QueryBuilder

function atomExpressionQuery (x: any[]) {
  const [resno, inscode, chainname, atomname, altloc, ] = x[1]
  const tests: h.AtomGroupArgs = {}

  if (chainname) {
    // should be configurable, there is an option in Jmol to use auth or label
    tests['chain-test'] = B.core.rel.eq([ B.ammp('auth_asym_id'), chainname ])
  }

  const resProps = []
  if (resno) resProps.push(B.core.rel.eq([ B.ammp('auth_seq_id'), resno ]))
  if (inscode) resProps.push(B.core.rel.eq([ B.ammp('pdbx_PDB_ins_code'), inscode ]))
  if (resProps.length) tests['residue-test'] = Q.and(resProps)

  const atomProps = []
  if (atomname) atomProps.push(B.core.rel.eq([ B.ammp('auth_atom_id'), atomname ]))
  if (altloc) atomProps.push(B.core.rel.eq([ B.ammp('label_alt_id'), altloc ]))
  if (atomProps.length) tests['atom-test'] = Q.and(atomProps)

  return B.struct.generator.atomGroups(tests)
}

const _ = P.optWhitespace
const __ = P.whitespace

const opList = [
  {
    // Selects atoms that are not included in s1.
    type: h.prefix,
    rule: P.alt(P.regex(/NOT/i).skip(__), P.string('!').skip(_)),
    map: Q.invert
  },
  {
    // Selects atoms included in both s1 and s2.
    type: h.binaryLeft,
    rule: h.infixOp(/AND|&/i),
    map: Q.intersect
  },
  {
    // Selects atoms included in either s1 or s2.
    type: h.binaryLeft,
    rule: h.infixOp(/OR|\|/i),
    map: Q.merge
  }
]

const lang = P.createLanguage({
  Integer: () => P.regexp(/-?[0-9]+/).map(Number).desc('integer'),

  Parens: function (r) {
    return P.string('(')
      .then(P.alt(r.Parens, r.Operator, r.Expression))
      .skip(P.string(')'))
  },

  Expression: function(r) {
    return P.alt(
      r.AtomExpression.map(atomExpressionQuery),

      r.Element.map((x: string) => B.struct.generator.atomGroups({
        'atom-test': B.core.rel.eq([ B.acp('elementSymbol'), B.struct.type.elementSymbol(x) ])
      })),

      r.Resname.map((x: string) => B.struct.generator.atomGroups({
        'residue-test': B.core.rel.eq([ B.ammp('label_comp_id'), x ])
      })),
    )
  },

  Not: () => {
    return P.alt(
      P.regex(/NOT/i).skip(__),
      P.string('!').skip(_)
    )
  },
  And: () => {
    return __.then(P.regex(/AND/i).skip(__))
  },
  Or: () => {
    return __.then(P.regex(/OR/i).skip(__))
  },

  Operator: function(r) {
    return h.combineOperators(opList, P.alt(r.Parens, r.Expression))
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

  AtomPrefix: () => P.regex(/[-0-9:^%/.]/).desc('atom-prefix'),

  Chainname: () => P.regex(/:([A-Za-z]{1,3})/, 1).desc('chainname'),
  Model: () => P.regex(/\/([0-9]+)/, 1).map(Number).desc('model'),
  Element: () => P.regex(/_([A-Za-z]{1,3})/, 1).desc('element'),
  Atomname: () => P.regex(/\.([a-zA-Z0-9]{1,4})/, 1).desc('atomname'),
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
