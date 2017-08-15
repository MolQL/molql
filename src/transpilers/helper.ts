/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as P from 'parsimmon'
import B from '../molql/builder'
import Expression from '../mini-lisp/expression'

// TODO replace by type
export interface AtomGroupArgs {
  [index: string]: any
  'entity-test'?: Expression
  'chain-test'?: Expression
  'residue-test'?: Expression
  'atom-test'?: Expression
  'groupBy'?: Expression
}

export function escapeRegExp(s: String){
  return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
}

// Takes a parser for the prefix operator, and a parser for the base thing being
// parsed, and parses as many occurrences as possible of the prefix operator.
// Note that the parser is created using `P.lazy` because it's recursive. It's
// valid for there to be zero occurrences of the prefix operator.
export function prefix(operatorsParser: P.Parser<any>, nextParser: P.Parser<any>, mapFn: any) {
  let parser: P.Parser<any> = P.lazy(() => {
    return P.seq(operatorsParser, parser)
      .map(x => mapFn(...x))
      .or(nextParser)
  })
  return parser
}

// Ideally this function would be just like `PREFIX` but reordered like
// `P.seq(parser, operatorsParser).or(nextParser)`, but that doesn't work. The
// reason for that is that Parsimmon will get stuck in infinite recursion, since
// the very first rule. Inside `parser` is to match parser again. Alternatively,
// you might think to try `nextParser.or(P.seq(parser, operatorsParser))`, but
// that won't work either because in a call to `.or` (aka `P.alt`), Parsimmon
// takes the first possible match, even if subsequent matches are longer, so the
// parser will never actually look far enough ahead to see the postfix
// operators.
export function postfix(operatorsParser: P.Parser<any>, nextParser: P.Parser<any>, mapFn: any) {
  // Because we can't use recursion like stated above, we just match a flat list
  // of as many occurrences of the postfix operator as possible, then use
  // `.reduce` to manually nest the list.
  //
  // Example:
  //
  // INPUT  :: "4!!!"
  // PARSE  :: [4, "factorial", "factorial", "factorial"]
  // REDUCE :: ["factorial", ["factorial", ["factorial", 4]]]
  return P.seqMap(
    nextParser,
    operatorsParser.many(),
    (x, suffixes) =>
      suffixes.reduce((acc, x) => {
        return mapFn(x, acc)
      }, x)
  )
}

// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// right. (e.g. 1^2^3 is 1^(2^3) not (1^2)^3)
export function binaryRight(operatorsParser: P.Parser<any>, nextParser: P.Parser<any>) {
  let parser: P.Parser<any> = P.lazy(() =>
    nextParser.chain(next =>
      P.seq(
        operatorsParser,
        P.of(next),
        parser
      ).or(P.of(next))
    )
  )
  return parser
}

// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// left. (e.g. 1-2-3 is (1-2)-3 not 1-(2-3))
export function binaryLeft(operatorsParser: P.Parser<any>, nextParser: P.Parser<any>, mapFn: Function) {
  // We run into a similar problem as with the `POSTFIX` parser above where we
  // can't recurse in the direction we want, so we have to resort to parsing an
  // entire list of operator chunks and then using `.reduce` to manually nest
  // them again.
  //
  // Example:
  //
  // INPUT  :: "1+2+3"
  // PARSE  :: [1, ["+", 2], ["+", 3]]
  // REDUCE :: ["+", ["+", 1, 2], 3]
  return P.seqMap(
    nextParser,
    P.seq(operatorsParser, nextParser).many(),
    (first, rest) => {
      return rest.reduce((acc, ch) => {
        let [op, another] = ch;
        return mapFn(op, acc, another)
      }, first)
    }
  )
}

/**
 * combine operators of decreasing binding strength
 */
export function combineOperators (opList: any[], rule: P.Parser<any>) {
  const x = opList.reduce(
    (acc, level) => {
      const map = level.isUnsupported ? makeError(`operator '${level.name}' not supported`) : level.map
      return level.type(level.rule, acc, map)
    },
    rule
  )
  return x
}

export function infixOp (re: RegExp, group: number = 0) {
  return P.whitespace.then(P.regex(re, group).skip(P.whitespace))
}

export function prefixOp (re: RegExp, group: number = 0) {
  return P.regex(re, group).skip(P.whitespace)
}

export function postfixOp (re: RegExp, group: number = 0) {
  return P.whitespace.then(P.regex(re, group))
}

export function makeError (msg: string) {
  return function() {
    throw new Error(msg)
  }
}

export namespace QueryBuilder {
  export function and (selections: any[]) {
    if (selections.length === 1){
      return selections[0]
    }else if (selections.length > 1) {
      return B.core.logic.and(selections)
    }else {
      return undefined
    }
  }

  export function test (property: any, args: any) {
    if (args && args.op !== undefined && args.val !== undefined) {
      const opArgs = [ property, args.val ]
      switch (args.op) {
        case '=': return B.core.rel.eq(opArgs)
        case '!=': return B.core.rel.neq(opArgs)
        case '>': return B.core.rel.gr(opArgs)
        case '<': return B.core.rel.lt(opArgs)
        case '>=': return B.core.rel.gre(opArgs)
        case '<=': return B.core.rel.lte(opArgs)
        default: throw new Error(`operator '${args.op}' not supported`);
      }
    } else if (args && args.min !== undefined && args.max !== undefined) {
      return B.core.rel.inRange([ property, args.min, args.max ])
    } else if (!Array.isArray(args)) {
      return B.core.rel.eq([ property, args ])
    } else if (args.length > 1) {
      return B.core.set.has([ B.core.type.set(args), property ])
    } else {
      return B.core.rel.eq([ property, args[0] ])
    }
  }

  export function invert (op: string, selection: Expression) {
    return B.struct.generator.queryInSelection({
      selection, query: B.struct.generator.atomGroups(), 'in-complement': true
    })
  }

  export function merge (op: string, acc: Expression, another: Expression) {
    return B.struct.combinator.merge([acc, another])
  }

  export function intersect (op: string, acc: Expression, another: Expression) {
    return B.struct.modifier.intersectBy({ selection: acc, by: another })
  }
}
