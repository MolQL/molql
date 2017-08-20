/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as P from 'parsimmon'

import Transpiler from '../transpiler'
import Expression from '../../mini-lisp/expression'
import { SymbolMap, MolQLScriptSymbol } from './symbols'
import B from '../../molql/builder'

const ws = P.regex(/[\n\r\s]*/)

// function getSymbol(name: string): MolQLScriptSymbol {
//   const s = SymbolMap[name] && SymbolMap[name]!.symbol;
// }

function getSymbolExpression(s: MolQLScriptSymbol, args?: any) {
  switch (s.kind) {
    case 'alias': return args ? Expression.Apply(s.symbol.id, args) : Expression.Apply(s.symbol.id);
    case 'macro': return s.translate(args);
  }
}

const lang = P.createLanguage({
  Expression: function (r) {
    return P.seq(r.Symbol, r.ArgList, r.NamedArgList)
  },

  Arg: function (r) {
    return P.seq(
      P.lookahead(P.regex(/[^:]/)),
      P.alt(
        // order matters
        r.AtomName,
        r.ElementSymbol,
        r.Boolean,
        r.Number,
        r.String,
        r.QuotedString,
        r.ListSymbol,
        r.SetSymbol,
        r.List
      )
    ).map((x: any) => x[1]).trim(ws)
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
    return r.NamedArg.many()
      .map((xs: any) => {
        const namedArgs: { [key: string]: any } = {}
        xs.forEach((a: any) => { namedArgs[a[0]] = a[1] })
        return namedArgs
      })
  },

  Symbol: function () {
    return P.regexp(/[^\s'`,@()\[\]{}';:]+/)  // /[a-zA-Z_-][a-zA-Z0-9_.-]+/)
      .map(x => {
        const s = SymbolMap[x];
        if (!s) {
          throw new Error(`'${x}': unknown symbol.`);
        }
        return s;
      })
      .desc('symbol')
  },

  String: function () {
    return P.regexp(/[a-zA-Z_-]+[a-zA-Z0-9_.-]*/)
      .map(x => {
        const s = SymbolMap[x];
        if (s) return getSymbolExpression(s);
        return x;
      }).desc('string')
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

  // '[a, b, c]' => core.list([a, b, c])
  ListSymbol: function (r) {
    return r.ArgList
      .wrap(P.string('['), P.string(']'))
      .map(B.core.type.list)
      .desc('list-symbol')
  },

  // '{a, b, c}' => core.set([a, b, c])
  SetSymbol: function (r) {
    return r.ArgList
      .wrap(P.string('{'), P.string('}'))
      .map(B.core.type.set)
      .desc('set-symbol')
  },

  // _XYZ -> type.elementSymbol XYZ
  ElementSymbol: function (r) {
    return P.seq(P.string('_'), P.regex(/[0-9a-zA-Z]+/))
      .map(x => B.struct.type.elementSymbol([x[1]]))
      .desc('element-symbol')
  },

  // // '&e' => core.ctrl.fn(e)
  // FnSymbol: function (r) {
  //   return P.string('&').skip(ws)
  //     .then(P.alt(r.Expression, r.ListSymbol, r.SetSymbol))
  //     .map(B.core.ctrl.fn)
  //     .desc('fn-symbol')
  // },

  // '.e' => struct.type.atomName(e)
  AtomName: function (r) {
    return P.string('.')
      .then(P.alt(r.String, r.QuotedString, r.Number))
      .map(B.atomName)
      .desc('identifier')
  },

  List: function (r) {
    return r.Expression
      .wrap(P.string('('), P.string(')'))
      .map(x => {
        const array: any[] = x[1];
        const named: any = x[2];

        if (named && Object.keys(named).length) {
          if (array) {
            for (let i = 0; i < array.length; i++) named[i] = array[i];
          }
          return getSymbolExpression(x[0], named);
        } else if (array && array.length) {
          return getSymbolExpression(x[0], x[1]);
        } else {
          return getSymbolExpression(x[0])
        }
      })
      .desc('list')
  },

  Query: function (r) {
    return r.List.trim(ws)
  }
})

const reComment = /;[^\n\r]*[\n\r]/g

const transpiler: Transpiler = str => lang.Query.tryParse(str.replace(reComment, '\n'))

export default transpiler
