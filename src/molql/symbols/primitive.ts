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
    return symbol(Arguments.Dictionary({ 0: Argument(type) }), type, description);
}

function binOp<T extends Type.Value>(type: T, description?: string) {
    return symbol(Arguments.List(type), type, description);
}

function binRel<A, T>(src: Type.Value, target: Type.Value, description?: string) {
    return symbol(Arguments.Dictionary({ 0: Argument(src), 1: Argument(src) }), target, description);
}

const type = {
    '@header': 'Types',
    bool: symbol(Arguments.Dictionary({ 0: Argument(Type.AnyValue) }), Type.Bool),
    num: symbol(Arguments.Dictionary({ 0: Argument(Type.AnyValue) }), Type.Num),
    str: symbol(Arguments.Dictionary({ 0: Argument(Type.AnyValue) }), Type.Str),

    set: symbol(Arguments.List(Type.AnyValue), Types.Set),
    map: symbol(Arguments.List(Type.AnyValue), Types.Map, 'Create a map from a list of key value pairs, e.g. (map 1 "x" 2 "y").'),
    regex: symbol(
        Arguments.Dictionary({ expression: Argument(Type.Str), flags: Argument(Type.Optional(Type.Str)) }),
        Types.Regex,
        'Creates a regular expression from a string using the ECMAscript syntax.')
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
        if: symbol(Arguments.Dictionary({ cond: Argument(Type.Bool), ifTrue: Argument(Type.AnyValue), ifFalse: Argument(Type.AnyValue) }), Type.AnyValue)
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
        inRange: symbol(Arguments.Dictionary({
            0: Argument(Type.Num, 'Minimum value'), 1: Argument(Type.Num, 'Maximum value'), 2: Argument(Type.Num, 'Value to test') }),
            Type.Bool),
    },

    string: {
        '@header': 'Strings',
        concat: binOp(Type.Str),
        match: symbol(Arguments.Dictionary({ 0: Argument(Types.Regex), 1: Argument(Type.Str) }), Type.Bool)
    },

    set: {
        '@header': 'Sets',
        has: symbol(Arguments.Dictionary({ 0: Argument(Types.Set), 1: Argument(Type.AnyValue) }), Type.Bool)
    },

    map: {
        '@header': 'Maps',
        has: symbol(Arguments.Dictionary({ 0: Argument(Types.Map), 1: Argument(Type.AnyValue) }), Type.Bool),
        get: symbol(Arguments.Dictionary({ 0: Argument(Types.Map), 1: Argument(Type.AnyValue), 2: Argument(Type.AnyValue, 'Default value if key is not present.') }), Type.AnyValue)
    }
}

export default { '@header': 'Langauge Primitives', type, operator }


