/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as P from 'parsimmon'

import * as h from '../helper'
// import { AtomGroupArgs } from '../types'

// import properties from './properties'
import operators from './operators'
import keywords from './keywords'

import Transpiler from '../transpiler'
// import B from '../../molql/builder'

const lang = P.createLanguage({
  Parens: function (r) {
    return P.string('(')
      .then(P.alt(r.Parens, r.Operator, r.Expression))
      .skip(P.string(')'))
  },

  Expression: function(r) {
    return P.alt(
      r.Keywords
    )
  },

  Keywords: () => P.alt(...h.getKeywordRules(keywords)),

  Operator: function(r) {
    return h.combineOperators(operators, P.alt(r.Parens, r.Expression))
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
