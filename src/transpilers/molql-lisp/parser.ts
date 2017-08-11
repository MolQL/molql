/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as P from 'parsimmon'

import Transpiler from '../transpiler'
import Expression from '../../mini-lisp/expression'
import { SymbolMap } from './symbols'
import B from '../../molql/builder'

const ws = P.regex(/[\n\r\s]*/)

function getSymbol(name: string) {
  const s = SymbolMap[name] && SymbolMap[name]!.symbol;
  return s && s.id;
}

const lang = P.createLanguage({
  Expression: function (r) {
    return P.seq(r.Symbol, P.alt(r.NamedArgList, r.ArgList))
  },

  Arg: function (r) {
    return P.alt(
      r.Boolean,
      r.Number,
      r.String,
      r.QuotedString,
      r.List
    )
      .trim(ws)
  },

  ArgList: function (r) {
    return r.Arg.many()
  },

  ArgName: function () {
    return P.regexp(/:([a-zA-Z0-9_.-]+)/, 1).trim(ws)
      .desc('arg-name')
  },

  NamedArg: function (r) {
    return P.seq(r.ArgName, r.Arg).trim(ws)
  },

  NamedArgList: function (r) {
    return P.seq(
      P.lookahead(P.regex(/[\n\r\s]+:/)),
      r.NamedArg.many()
    ).map((x: any) => {
      const namedArgs: { [key: string]: any } = {}
      x[1].forEach((a: any) => { namedArgs[a[0]] = a[1] })
      return namedArgs
    })
  },

  Symbol: function () {
    return P.regexp(/[^\s'`,@()\[\]';]+/)  // /[a-zA-Z_-][a-zA-Z0-9_.-]+/)
      .map(x => {
        const s = getSymbol(x)
        if (!s) {
          throw new Error(`'${x}': unknown symbol.`)
        }
        return getSymbol(x)
      })
      .desc('symbol')
  },

  String: function () {
    return P.regexp(/[a-zA-Z_-]+[a-zA-Z0-9_.-]*/)
      .desc('string')
  },

  QuotedString: function () {
    return P.string('`')
      .then(P.regexp(/[^`]*/))
      .skip(P.string('`'))
      .desc('quoted-string')
  },

  Number: function () {
    return P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/)
      .map(Number)
      .desc('number')
  },

  Boolean: function () {
    return P.alt(
      P.regexp(/true/i).result(true),
      P.regexp(/false/i).result(false)
    ).desc('boolean')
  },

  List: function (r) {
    return r.Expression
      .wrap(P.string('('), P.string(')'))
      .map((x: any) => {
        if (x[1] && (x[1].length || Object.keys(x[1]).length)) {
          return Expression.Apply(x[0], x[1]);
        } else {
          return Expression.Apply(x[0])
        }
      })
  },

  Query: function (r) {
    return r.List.trim(ws)
  }
})

const transpiler: Transpiler = str => B.evaluate(lang.Query.tryParse(str))
export default transpiler
