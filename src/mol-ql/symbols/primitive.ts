/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type-system'
import Symbol, { Arguments } from '../../mini-lisp/symbol'
import { symbol } from './helpers'

import Arg = Arguments.Argument
import OptArg = Arguments.OptionalArgument

export namespace Types {
    export type Set = { has(e: any): boolean }
    export type Map = { has(key: any): boolean, get(key: any): any }
    export const Set = Type.Value('set', Type.AnyValue);
    export const Map = Type.Value('map', Type.AnyValue);
    export const Regex = Type.Value('regex', Type.AnyValue);
}

function unaryOp<A>(type: Type.Value, description?: string) {
    return symbol<{ value: A }, A>(type, { arguments: Arguments.Dictionary({ value: Arg(type) }), description });
}

function binOp<A>(type: Type.Value, description?: string) {
    return symbol<A[], A>(type, { arguments: Arguments.List(type), description });
}

function binRel<A, T>(src: Type.Value, target: Type.Value, description?: string) {
    return symbol<{ a: A, b: A }, T>(target, { arguments: Arguments.Dictionary({ a: Arg(src), b: Arg(src) }), description });
}

const type = {
    '@header': 'Types',
    bool: symbol<{ value: any }, boolean>(Type.Bool, { arguments: Arguments.Dictionary({ value: Arg(Type.AnyValue) }) }),
    num: symbol<{ value: any }, number>(Type.Num, { arguments: Arguments.Dictionary({ value: Arg(Type.AnyValue) }) }),
    str: symbol<{ value: any }, string>(Type.Str, { arguments: Arguments.Dictionary({ value: Arg(Type.AnyValue) }) }),

    set: symbol<any[], Types.Set>(Types.Set, { arguments: Arguments.List(Type.AnyValue) }),
    map: symbol<any[], Types.Map>(Types.Map, { arguments: Arguments.List(Type.AnyValue), description: 'Create a map from a list of key value pairs, e.g. (map 1 "x" 2 "y").' }),
    regex: symbol<{ expression: string, flags?: string }, RegExp>(Types.Regex, {
        arguments: Arguments.Dictionary({ expression: Arg(Type.Str), flags: OptArg(Type.Str, '') }),
        description: 'Creates a regular expression from a string using the ECMAscript syntax.'
    })
};

const operator = {
    '@header': 'Operators',
    logic: {
        '@header': 'Logic',
        not: unaryOp<boolean>(Type.Bool),
        and: binOp<boolean>(Type.Bool),
        or: binOp<boolean>(Type.Bool),
    },

    controlFlow: {
        '@header': 'Control Flow',
        if: symbol<{ cond: boolean, ifTrue: any, ifFalse: any }, any>(Type.AnyValue, { arguments: Arguments.Dictionary({ cond: Arg(Type.Bool), ifTrue: Arg(Type.AnyValue), ifFalse: Arg(Type.AnyValue) }) })
    },

    arithmetic: {
        '@header': 'Arithmetic',
        add: binOp<number>(Type.Num),
        sub: binOp<number>(Type.Num),
        mult: binOp<number>(Type.Num),
        div: binRel<number, number>(Type.Num, Type.Num),
        pow: binRel<number, number>(Type.Num, Type.Num),

        min: binOp<number>(Type.Num),
        max: binOp<number>(Type.Num),

        floor: unaryOp<number>(Type.Num),
        ceil: unaryOp<number>(Type.Num),
        roundInt: unaryOp<number>(Type.Num),
        abs: unaryOp<number>(Type.Num),
        sin: unaryOp<number>(Type.Num),
        cos: unaryOp<number>(Type.Num),
        tan: unaryOp<number>(Type.Num),
        asin: unaryOp<number>(Type.Num),
        acos: unaryOp<number>(Type.Num),
        atan: unaryOp<number>(Type.Num),
        atan2: binRel<number, number>(Type.Num, Type.Num),
        sinh: unaryOp<number>(Type.Num),
        cosh: unaryOp<number>(Type.Num),
        tanh: unaryOp<number>(Type.Num),
        exp: unaryOp<number>(Type.Num),
        log: unaryOp<number>(Type.Num),
        log10: unaryOp<number>(Type.Num)
    },

    relational: {
        '@header': 'Relational',
        eq: binRel<any, boolean>(Type.AnyValue, Type.Bool),
        neq: binRel<any, boolean>(Type.AnyValue, Type.Bool),
        lt: binRel<number, boolean>(Type.Num, Type.Bool),
        lte: binRel<number, boolean>(Type.Num, Type.Bool),
        gr: binRel<number, boolean>(Type.Num, Type.Bool),
        gre: binRel<number, boolean>(Type.Num, Type.Bool),
        inRange: symbol<{ min: number, max: number, value: number }, boolean>(Type.Bool, { arguments: Arguments.Dictionary({ min: Arg(Type.Num), max: Arg(Type.Num), value: Arg(Type.Num) }) }),
    },

    string: {
        '@header': 'Strings',
        concat: binOp<string>(Type.Str),
        match: symbol<{ regex: RegExp, value: string }, boolean>(Type.Bool, { arguments: Arguments.Dictionary({ regex: Arg(Types.Regex), value: Arg(Type.Str) }) })
    },

    set: {
        '@header': 'Sets',
        has: symbol<{ set: Types.Set, value: any }, boolean>(Type.Bool, { arguments: Arguments.Dictionary({ set: Arg(Types.Set), value: Arg(Type.AnyValue) }) })
    },

    map: {
        '@header': 'Maps',
        has: symbol<{ map: Types.Map, key: any }, any>(Type.Bool, { arguments: Arguments.Dictionary({ map: Arg(Types.Map), key: Arg(Type.AnyValue) }) }),
        get: symbol<{ map: Types.Map, key: any, default: any }, any>(Type.Bool, { arguments: Arguments.Dictionary({ map: Arg(Types.Map), key: Arg(Type.AnyValue), default: Arg(Type.AnyValue) }) })
    }
}

export default { '@header': 'Langauge Primitives', type, operator }


