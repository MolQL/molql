
import * as P from 'parsimmon'

import Transpiler from '../transpiler'
import MolQL from '../../../mol-ql/symbols'
import { SymbolMap } from '../../../mol-ql/symbols'

const _ = P.regex(/[\n\r\s]*/)
// const __ = P.regex(/[\n\r\s]+/)

const maps: any = [
  ['', SymbolMap],
  
  ['', MolQL.core.logic],
  ['', MolQL.core.rel],
  ['', MolQL.core.math],
  ['set.', MolQL.core.set],
  ['map.', MolQL.core.map],

  ['', MolQL.structure.generator],
  ['', MolQL.structure.atomProperty.core],
  ['mmcif.', MolQL.structure.atomProperty.macromolecular],

  ['make.', MolQL.core.type],
  ['make.', MolQL.structure.type],
]

function getSymbol(name: string) {
  for (let i = 0; i < maps.length; ++i) {
    const [prefix, m] = maps[i]
    if (prefix && name.startsWith(prefix)) name = name.substr(prefix.length)
    if (name in m) return m[name].id
  }
  return undefined
}

const lang = P.createLanguage({
  Expression: function(r) {
    return P.seq(r.Symbol, P.alt(r.NamedArgList, r.ArgList))
  },

  Arg: function(r) {
    return P.alt(
        r.Boolean,
        r.Number,
        r.String,
        r.QuotedString,
        r.List
      )
      .trim(_)
  },

  ArgList: function(r) {
    return r.Arg.many()
  },

  ArgName: function() {
    return P.regexp(/:([a-zA-Z0-9_.-]+)/, 1).trim(_)
      .desc('arg-name')
  },

  NamedArg: function(r) {
    return P.seq(r.ArgName, r.Arg).trim(_)
  },

  NamedArgList: function(r) {
    return P.seq(
      P.lookahead(P.regex(/[\n\r\s]+:/)),
      r.NamedArg.many()
    ).map((x: any) => {
      const namedArgs: { [key: string]: any } = {}
      x[1].forEach((a: any) => { namedArgs[a[0]] = a[1] })
      return namedArgs
    })
  },

  Symbol: function() {
    return P.regexp(/[a-zA-Z_-][a-zA-Z0-9_.-]+/)
    .map(x => {
      const s = getSymbol(x)
      if (s === undefined) {
        throw new Error(`symbol '${x}' not available`)
      }
      return s
    })
    .desc('symbol')
  },

  String: function() {
    return P.regexp(/[a-zA-Z_-]+[a-zA-Z0-9_.-]*/)
      .desc('string')
  },

  QuotedString: function() {
    return P.string('`')
      .then(P.regexp(/[^`]*/))
      .skip(P.string('`'))
      .desc('quoted-string')
  },

  Number: function() {
    return P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/)
      .map(Number)
      .desc('number')
  },

  Boolean: function() {
    return P.alt(
        P.regexp(/true/i).result(true),
        P.regexp(/false/i).result(false)
      ).desc('boolean')
  },

  List: function(r) {
    return r.Expression
      .wrap(P.string('('), P.string(')'))
      .map((x: any) => {
        if (x[1] && (x[1].length || Object.keys(x[1]).length)) {
          return { head: x[0], args: x[1] }
        } else {
          return { head: x[0] }
        }
      })
  },

  Query: function(r) {
    return r.List.trim(_)
  }
})

const transpiler: Transpiler = str => lang.Query.tryParse(str)
export default transpiler
