/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as P from 'parsimmon'

import * as h from '../helper'
import { OperatorList } from '../types'

import properties from './properties'
import operators from './operators'
import keywords from './keywords'
import functions from './functions'

import Transpiler from '../transpiler'
import B from '../../molql/builder'

// const propertiesDict = h.getPropertyRules(properties)

// <, <=, = or ==, >=, >, and !=
const numericComparisons: OperatorList = [
  {
    '@desc': 'value comparisons',
    '@examples': [],
    name: '=',
    abbr: ['=='],
    type: h.binaryLeft,
    rule: P.alt( h.infixOp(/==|=|!=|>|<|>=|<=/), P.whitespace.result('=')),
    map: (op, e1, e2) => {
      // TODO very brittle...
      // console.log(op, e1, e2)
      if(e1.head === 'structure.atom-property.macromolecular.label_atom_id') e2 = B.atomName(e2)
      if(e2.head === 'structure.atom-property.macromolecular.label_atom_id') e1 = B.atomName(e1)
      if(e1.head === 'structure.atom-property.core.element-symbol') e2 = B.es(e2)
      if(e2.head === 'structure.atom-property.core.element-symbol') e1 = B.es(e1)
      switch (op) {
        case '=':
        case '==':
          return B.core.rel.eq([e1, e2])
        case '!=': return B.core.rel.neq([e1, e2])
        case '>': return B.core.rel.gr([e1, e2])
        case '<': return B.core.rel.lt([e1, e2])
        case '>=': return B.core.rel.gre([e1, e2])
        case '<=': return B.core.rel.lte([e1, e2])
        default: throw new Error(`value operator '${op}' not supported`);
      }
    }
  },
  // {
  //   '@desc': 'numeric less than comparison',
  //   '@examples': [],
  //   name: '<',
  //   type: h.binaryLeft,
  //   rule: h.infixOp(/</),
  //   map: (op, e1, e2) => B.core.rel.lt([e1, e2])
  // },
  // {
  //   '@desc': 'default numeric equality comparison',
  //   '@examples': [],
  //   name: '=',
  //   type: h.binaryLeft,
  //   rule: P.whitespace,
  //   map: (op, e1, e2) => B.core.rel.eq([e1, e2])
  // }
]

// lt, le, eq, ge, gt, and ne, =~
// const stringComparisons: OperatorList = [
//   {
//     '@desc': 'string less than comparison',
//     '@examples': [],
//     type: h.binaryLeft,
//     rule: h.infixOp(/lt/i),
//     map: (op, e1, e2) => B.core.rel.lt([e1, e2])
//   }
// ]


const lang = P.createLanguage({
  Parens: function (r) {
    return P.alt(
      r.Parens,
      r.Operator,
      r.Expression
    ).wrap(P.string('('), P.string(')'))
  },

  Expression: function(r) {
    return P.alt(
      // r.NamedAtomProperties,
      r.ValueQuery,
      r.Keywords,
    )
  },

  NamedAtomProperties: function() {
    return P.alt(...h.getNamedPropertyRules(properties))
  },

  Keywords: () => P.alt(...h.getKeywordRules(keywords)),

  Operator: function(r) {
    return h.combineOperators(operators, P.alt(r.Parens, r.Expression, r.ValueQuery))
  },

  Query: function(r) {
    return P.alt(
      // r.ValueQuery,
      P.alt(
        r.Operator,
        r.Parens,
        r.Expression
      ).trim(P.optWhitespace)
    )
  },

  Number: function () {
    return P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/)
      .map(Number)
      .desc('number')
  },

  String: function () {
    const w = h.getReservedWords(properties, keywords, operators)
      .sort(h.strLenSortFn).map(h.escapeRegExp).join('|')
    return P.regex(new RegExp(`^(?!(${w}))[A-Z0-9_]+$`, 'i'))
    // return P.regexp(/[a-zA-Z0-9]+/)
    //   .desc('string')
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
    return P.alt(...h.getPropertyNameRules(properties))
  },

  ValueOperator: function(r) {
    return h.combineOperators(numericComparisons, P.alt(r.ValueParens, r.ValueExpressions))
    // const next = P.alt(r.ValueParens, r.ValueExpressions, r.ValueOperator)
    // return P.alt(...numericComparisons.map(o => {
    //   const map = o.isUnsupported ? h.makeError(`operator '${o.name}' not supported`) : o.map
    //   return o.type(o.rule, next, map)
    // }))
  },

  ValueExpressions: function(r) {
    return P.alt(
      r.ValueFunctions,
      r.Value,
      r.ValuePropertyNames
    )
  },

  ValueFunctions: function(r) {
    return P.alt(...h.getFunctionRules(functions, r.ValueExpressions))
  },

  ValueQuery: function(r) {
    return P.alt(
      r.ValueOperator,
      // r.ValueParens,
      // r.ValueExpression
    ).trim(P.optWhitespace)
  }
})

const transpiler: Transpiler = str => lang.Query.tryParse(str)
export default transpiler
