/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type'
import { Arguments, Argument } from '../../mini-lisp/symbol'
import { symbol } from './helpers'

export namespace Types {
    export type List = { [index: string]: any, [index: number]: any, length: number }
    export type Set = { has(e: any): boolean }
    export type Map = { has(key: any): boolean, get(key: any): any }
    export const List = Type<List>('List', Type.Any);
    export const Set = Type<Set>('Set', Type.Any);
    export const Map = Type<Map>('Map', Type.Any);
    export const Regex = Type<RegExp>('Regex', Type.Any);
}

function unaryOp<T extends Type>(type: T, description?: string) {
    return symbol(Arguments.Dictionary({ 0: Argument(type) }), type, description);
}

function binOp<T extends Type>(type: T, description?: string) {
    return symbol(Arguments.List(type), type, description);
}

function binRel<A extends Type, T extends Type>(src: A, target: T, description?: string) {
    return symbol(Arguments.Dictionary({ 0: Argument(src), 1: Argument(src) }), target, description);
}

const type = {
    '@header': 'Types',
    bool: symbol(Arguments.Dictionary({ 0: Argument(Type.Any) }), Type.Bool),
    num: symbol(Arguments.Dictionary({ 0: Argument(Type.Any) }), Type.Num),
    str: symbol(Arguments.Dictionary({ 0: Argument(Type.Any) }), Type.Str),
    regex: symbol(
        Arguments.Dictionary({
            0: Argument(Type.Str, { description: 'Expression' }),
            1: Argument(Type.Str, { isOptional: true, description: `Flags, e.g. 'i' for ignore case` })
        }), Types.Regex, 'Creates a regular expression from a string using the ECMAscript syntax.'),

    list: symbol(Arguments.List(Type.Any), Types.List),
    set: symbol(Arguments.List(Type.Any), Types.Set),
    map: symbol(Arguments.List(Type.Any), Types.Map, 'Create a map from a list of key value pairs, e.g. (map 1 "x" 2 "y").')
};


const logic = {
    '@header': 'Logic',
    not: unaryOp(Type.Bool),
    and: binOp(Type.Bool),
    or: binOp(Type.Bool),
};

const ctrl = {
    '@header': 'Control Flow',
    if: symbol(Arguments.Dictionary({
        0: Argument(Type.Bool, { description: 'Condition' }),
        1: Argument(Type.Any, { description: 'If true' }),
        2: Argument(Type.Any, { description: 'If false' })
    }), Type.Any)
};

const math = {
    '@header': 'Math',
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
    sqrt: unaryOp(Type.Num),
    sin: unaryOp(Type.Num),
    cos: unaryOp(Type.Num),
    tan: unaryOp(Type.Num),
    asin: unaryOp(Type.Num),
    acos: unaryOp(Type.Num),
    atan: unaryOp(Type.Num),
    sinh: unaryOp(Type.Num),
    cosh: unaryOp(Type.Num),
    tanh: unaryOp(Type.Num),
    exp: unaryOp(Type.Num),
    log: unaryOp(Type.Num),
    log10: unaryOp(Type.Num),
    atan2: binRel(Type.Num, Type.Num)
};

const rel = {
    '@header': 'Relational',
    eq: binRel(Type.Any, Type.Bool),
    neq: binRel(Type.Any, Type.Bool),
    lt: binRel(Type.Num, Type.Bool),
    lte: binRel(Type.Num, Type.Bool),
    gr: binRel(Type.Num, Type.Bool),
    gre: binRel(Type.Num, Type.Bool),
    inRange: symbol(Arguments.Dictionary({
        0: Argument(Type.Num, { description: 'Value to test' }),
        1: Argument(Type.Num, { description: 'Minimum value' }),
        2: Argument(Type.Num, { description: 'Maximum value' })
    }), Type.Bool, 'Check if the value of the 1st argument is >= 2nd and <= 3rd.'),
};

const str = {
    '@header': 'Strings',
    concat: binOp(Type.Str),
    match: symbol(Arguments.Dictionary({ 0: Argument(Types.Regex), 1: Argument(Type.Str) }), Type.Bool)
};

const set = {
    '@header': 'Sets',
    has: symbol(Arguments.Dictionary({ 0: Argument(Types.Set), 1: Argument(Type.Any) }), Type.Bool)
};

const map = {
    '@header': 'Maps',
    has: symbol(Arguments.Dictionary({ 0: Argument(Types.Map), 1: Argument(Type.Any) }), Type.Bool),
    get: symbol(Arguments.Dictionary({
        0: Argument(Types.Map),
        1: Argument(Type.LiteralValue, { description: 'Key' }),
        2: Argument(Type.Any, { description: 'Default value if key is not present' })
    }), Type.Any)
};

export default {
    '@header': 'Language Primitives',
    type,
    logic,
    ctrl,
    math,
    rel,
    str,
    set,
    map
}


