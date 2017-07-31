/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type-system'
import Symbol, { Arguments } from '../../mini-lisp/symbol'
import { symbol } from './helpers'

import Arg = Arguments.Argument

export namespace Types {
    export const Set = Type.Value('set', Type.AnyValue);
    export const Map = Type.Value('map', Type.AnyValue);
    export const Regex = Type.Value('regex', Type.AnyValue);
}

function unaryOp(type: Type.Value, description?: string) {
    return symbol(type, { arguments: Arguments.Dictionary({ value: Arg(type) }), description });
}

function binOp(type: Type.Value, description?: string) {
    return symbol(type, { arguments: Arguments.List(type), description });
}

function binRel(src: Type.Value, target: Type.Value, description?: string) {
    return symbol(target, { arguments: Arguments.Dictionary({ a: Arg(src), b: Arg(src) }), description });
}

const type = {
    '@header': 'Types',
    bool: symbol(Type.Bool, { arguments: Arguments.Dictionary({ value: Arg(Type.AnyValue) }) }),
    num: symbol(Type.Num, { arguments: Arguments.Dictionary({ value: Arg(Type.AnyValue) }) }),
    str: symbol(Type.Str, { arguments: Arguments.Dictionary({ value: Arg(Type.AnyValue) }) }),

    set: symbol(Types.Set, { arguments: Arguments.List(Type.AnyValue) }),
    map: symbol(Types.Map, { arguments: Arguments.List(Type.AnyValue), description: 'Create a map from a list of key value pairs, e.g. (map 1 "x" 2 "y").' }),
    regex: symbol(Types.Regex, {
        arguments: Arguments.Dictionary({ expression: Arg(Type.Str), flags: Arg(Type.Str, true) }),
        description: 'Creates a regular expression from a string using the ECMAscript syntax.'
    })
};

const operator = {
    '@header': 'Operators',
    logic: {
        '@header': 'Logic',
        not: unaryOp(Type.Bool),
        and: binOp(Type.Bool),
        or: binOp(Type.Bool),
    },

    controlFlow: {
        '@header': 'Control Flow',
        if: symbol(Type.AnyValue, { arguments: Arguments.Dictionary({ cond: Arg(Type.Bool), ifTrue: Arg(Type.AnyValue), ifFalse: Arg(Type.AnyValue) }) })
    },

    arithmetic: {
        '@header': 'Arithmetic',
        add: binOp(Type.Num),
        sub: binOp(Type.Num),
        mult: binOp(Type.Num),
        div: binRel(Type.Num, Type.Num),
        pow: binRel(Type.Num, Type.Num),

        min: binOp(Type.Num),
        max: binOp(Type.Num),

        floor: unaryOp(Type.Num),
        ceil: unaryOp(Type.Num),
        roundInt: unaryOp(Type.Num),
        abs: unaryOp(Type.Num),
        sin: unaryOp(Type.Num),
        cos: unaryOp(Type.Num),
        tan: unaryOp(Type.Num),
        asin: unaryOp(Type.Num),
        acos: unaryOp(Type.Num),
        atan: unaryOp(Type.Num),
        atan2: binRel(Type.Num, Type.Num),
        sinh: unaryOp(Type.Num),
        cosh: unaryOp(Type.Num),
        tanh: unaryOp(Type.Num),
        exp: unaryOp(Type.Num),
        log: unaryOp(Type.Num),
        log10: unaryOp(Type.Num)
    },

    relational: {
        '@header': 'Relational',
        eq: binRel(Type.AnyValue, Type.Bool),
        neq: binRel(Type.AnyValue, Type.Bool),
        lt: binRel(Type.Num, Type.Bool),
        lte: binRel(Type.Num, Type.Bool),
        gr: binRel(Type.Num, Type.Bool),
        gre: binRel(Type.Num, Type.Bool),
        inRange: symbol(Type.Num, { arguments: Arguments.Dictionary({ min: Arg(Type.Num), max: Arg(Type.Num), value: Arg(Type.Num) }) }),
    },

    string: {
        '@header': 'Strings',
        concat: binOp(Type.Str),
        match: symbol(Type.Str, { arguments: Arguments.Dictionary({ regex: Arg(Types.Regex), value: Arg(Type.Str) }) })
    },

    set: {
        '@header': 'Sets',
        has: symbol(Type.Bool, { arguments: Arguments.Dictionary({ set: Arg(Types.Set), value: Arg(Type.Str) }) })
    },

    map: {
        '@header': 'Maps',
        get: symbol(Type.Bool, { arguments: Arguments.Dictionary({ map: Arg(Types.Map), key: Arg(Type.AnyValue), default: Arg(Type.AnyValue) }) })
    }
}

export default { '@header': 'Langauge Primitives', type, operator }


