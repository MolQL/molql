/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type'
import { Arguments, Argument } from '../../mini-lisp/symbol'
import { symbol } from './helpers'

export namespace Types {
    export type List<T = any> = ArrayLike<T>
    export type Set<T = any> = { has(e: T): boolean }

    export const A = Type.Variable('a');
    export const Regex = Type.Value<RegExp>('Core', 'Regex');

    export const Set = <T extends Type>(t?: T) => Type.Container<Set<T['@type']>>('Core', 'Set', t || A);
    export const List = <T extends Type>(t?: T) => Type.Container<List<T['@type']>>('Core', 'List', t || A);
    export const Fn = <T extends Type>(t?: T) => Type.Container<(env: any) => T['@type']>('Core', 'Fn', t || A);
}

function unaryOp<T extends Type>(type: T, description?: string) {
    return symbol(Arguments.Dictionary({ 0: Argument(type) }), type, description);
}

function binOp<T extends Type>(type: T, description?: string) {
    return symbol(Arguments.List(type, { nonEmpty: true }), type, description);
}

function binRel<A extends Type, T extends Type>(src: A, target: T, description?: string) {
    return symbol(Arguments.Dictionary({
        0: Argument(src),
        1: Argument(src)
    }), target, description);
}

const type = {
    '@header': 'Types',
    bool: symbol(Arguments.Dictionary({ 0: Argument(Type.AnyValue) }), Type.Bool, 'Convert a value to boolean.'),
    num: symbol(Arguments.Dictionary({ 0: Argument(Type.AnyValue) }), Type.Num, 'Convert a value to number.'),
    str: symbol(Arguments.Dictionary({ 0: Argument(Type.AnyValue) }), Type.Str, 'Convert a value to string.'),
    regex: symbol(
        Arguments.Dictionary({
            0: Argument(Type.Str, { description: 'Expression' }),
            1: Argument(Type.Str, { isOptional: true, description: `Flags, e.g. 'i' for ignore case` })
        }), Types.Regex, 'Creates a regular expression from a string using the ECMAscript syntax.'),

    list: symbol(Arguments.List(Types.A), Types.List()),
    set: symbol(Arguments.List(Types.A), Types.Set())
};

const logic = {
    '@header': 'Logic',
    not: unaryOp(Type.Bool),
    and: binOp(Type.Bool),
    or: binOp(Type.Bool),
};

const ctrl = {
    '@header': 'Control',
    eval: symbol(Arguments.Dictionary({ 0: Argument(Types.Fn(Types.A)) }), Types.A, 'Evaluate a function.'),
    fn: symbol(Arguments.Dictionary({ 0: Argument(Types.A) }), Types.Fn(Types.A), 'Wrap an expression to a "lazy" function.'),
    if: symbol(Arguments.Dictionary({
        0: Argument(Type.Bool, { description: 'Condition' }),
        1: Argument(Type.Variable('a'), { description: 'If true' }),
        2: Argument(Type.Variable('b'), { description: 'If false' })
    }), Type.Union(Type.Variable('a'), Type.Variable('b')))
};

const rel = {
    '@header': 'Relational',
    eq: binRel(Type.Variable('a', Type.AnyValue), Type.Bool),
    neq: binRel(Type.Variable('a', Type.AnyValue), Type.Bool),
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

const math = {
    '@header': 'Math',
    add: binOp(Type.Num),
    sub: binOp(Type.Num),
    mult: binOp(Type.Num),
    div: binRel(Type.Num, Type.Num),
    pow: binRel(Type.Num, Type.Num),
    mod: binRel(Type.Num, Type.Num),

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

const str = {
    '@header': 'Strings',
    concat: binOp(Type.Str),
    match: symbol(Arguments.Dictionary({ 0: Argument(Types.Regex), 1: Argument(Type.Str) }), Type.Bool)
};

const list = {
    '@header': 'Lists',
    getAt: symbol(Arguments.Dictionary({ 0: Argument(Types.List()), 1: Argument(Type.Num) }), Types.A)
};

const set = {
    '@header': 'Sets',
    has: symbol(Arguments.Dictionary({ 0: Argument(Types.Set()), 1: Argument(Types.A) }), Type.Bool)
};

export default {
    '@header': 'Language Primitives',
    type,
    logic,
    ctrl,
    rel,
    math,
    str,
    list,
    set
}


