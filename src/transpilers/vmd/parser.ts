/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as P from 'parsimmon'

import * as h from '../helper'
// import { AtomGroupArgs } from '../types'

import properties from './properties'
import operators from './operators'
import keywords from './keywords'
// import functions from './functions'

import Transpiler from '../transpiler'
// import B from '../../molql/builder'

// const propertiesDict = h.getPropertyRules(properties)

const lang = P.createLanguage({
  Parens: function (r) {
    return P.string('(')
      .then(P.alt(r.Parens, r.Operator, r.Expression))
      .skip(P.string(')'))
  },

  Expression: function(r) {
    return P.alt(
      r.NamedAtomProperties,
      r.Keywords,
      r.Functions
    )
  },

  Number: function () {
    return P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/)
      .map(Number)
      .desc('number')
  },

  NamedAtomProperties: function() {
    return P.alt(...h.getNamedPropertyRules(properties))
  },

  Keywords: () => P.alt(...h.getKeywordRules(keywords)),

  Operator: function(r) {
    return h.combineOperators(operators, P.alt(r.Parens, r.Expression))
  },

  Functions: function(r) {
    return P.alt(
      P.string('sqr')
        .skip(P.regex(/\(\s*/))
        .then(P.alt(r.Number))
        .skip(P.regex(/\s*\)/))
    )
  },

  Query: function(r) {
    return P.alt(
      r.Operator,
      r.Parens,
      r.Expression
    ).trim(P.optWhitespace)
  }
})

const transpiler: Transpiler = str => lang.Query.tryParse(str)
export default transpiler
