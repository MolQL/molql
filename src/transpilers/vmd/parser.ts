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
    '@desc': 'numeric less than comparison',
    '@examples': [],
    name: '<',
    type: h.binaryLeft,
    rule: h.infixOp(/</i),
    map: (op, e1, e2) => B.core.rel.lt([e1, e2])
  }
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
      r.NamedAtomProperties,
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
      r.ValueQuery,
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

  Value: function (r) {
    return P.alt(r.Number)
  },

  ValueParens: function (r) {
    return P.alt(
      r.ValueParens,
      r.ValueOperator,
      r.ValueExpressions
    ).wrap(P.string('('), P.string(')'))
  },

  ValuePropertyNames: function() {
    return P.alt(...h.getNumericPropertyNameRules(properties))
  },

  ValueOperator: function(r) {
    return h.combineOperators(numericComparisons, P.alt(r.ValueParens, r.ValueExpressions))
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
