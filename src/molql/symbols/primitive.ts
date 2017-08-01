/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type-system'
import Symbol, { Arguments, Argument } from '../../mini-lisp/symbol'
import { symbol } from './helpers'

export namespace Types {
    export type Set = { has(e: any): boolean }
    export type Map = { has(key: any): boolean, get(key: any): any }
    export const Set = Type.Value<Set>('set', Type.AnyValue);
    export const Map = Type.Value<Map>('map', Type.AnyValue);
    export const Regex = Type.Value<RegExp>('regex', Type.AnyValue);
}

function unaryOp<T extends Type>(type: T, description?: string) {
    return symbol(type, { arguments: Arguments.Dictionary({ 0: Argument(type) }), description });
}

function binOp<T extends Type.Value>(type: T, description?: string) {
    return symbol(type, { arguments: Arguments.List(type), description });
}

function binRel<A, T>(src: Type.Value, target: Type.Value, description?: string) {
    return symbol(target, { arguments: Arguments.Dictionary({ 0: Argument(src), 1: Argument(src) }), description });
}

const type = {
    '@header': 'Types',
    bool: symbol(Type.Bool, { arguments: Arguments.Dictionary({ 0: Argument(Type.AnyValue) }) }),
    num: symbol(Type.Num, { arguments: Arguments.Dictionary({ 0: Argument(Type.AnyValue) }) }),
    str: symbol(Type.Str, { arguments: Arguments.Dictionary({ 0: Argument(Type.AnyValue) }) }),

    set: symbol(Types.Set, { arguments: Arguments.List(Type.AnyValue) }),
    map: symbol(Types.Map, { arguments: Arguments.List(Type.AnyValue), description: 'Create a map from a list of key value pairs, e.g. (map 1 "x" 2 "y").' }),
    regex: symbol(Types.Regex, {
        arguments: Arguments.Dictionary({ expression: Argument(Type.Str), flags: Argument(Type.Optional(Type.Str)) }),
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
        if: symbol(Type.AnyValue, { arguments: Arguments.Dictionary({ cond: Argument(Type.Bool), ifTrue: Argument(Type.AnyValue), ifFalse: Argument(Type.AnyValue) }) })
    },

    arithmetic: {
        '@header': 'Arithmetic',
        add: binOp(Type.Num),
        sub: binOp(Type.Num),
        mult: binOp(Type.Num),
        div: binRel<number, number>(Type.Num, Type.Num),
        pow: binRel<number, number>(Type.Num, Type.Num),

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
        inRange: symbol(Type.Bool, { arguments: Arguments.Dictionary({
            0: Argument(Type.Num, 'Minumum value'), 1: Argument(Type.Num, 'Maximum value'), 2: Argument(Type.Num, 'Value to test') })
        }),
    },

    string: {
        '@header': 'Strings',
        concat: binOp(Type.Str),
        match: symbol(Type.Bool, { arguments: Arguments.Dictionary({ 0: Argument(Types.Regex), 1: Argument(Type.Str) }) })
    },

    set: {
        '@header': 'Sets',
        has: symbol(Type.Bool, { arguments: Arguments.Dictionary({ 0: Argument(Types.Set), 1: Argument(Type.AnyValue) }) })
    },

    map: {
        '@header': 'Maps',
        has: symbol(Type.Bool, { arguments: Arguments.Dictionary({ 0: Argument(Types.Map), 1: Argument(Type.AnyValue) }) }),
        get: symbol(Type.Bool, { arguments: Arguments.Dictionary({ 0: Argument(Types.Map), 1: Argument(Type.AnyValue), 2: Argument(Type.AnyValue, 'Default value if key is not present.') }) })
    }
}

export default { '@header': 'Langauge Primitives', type, operator }


