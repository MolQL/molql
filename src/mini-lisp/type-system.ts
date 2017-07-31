/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Type =
    | Type.Any
    | Type.Empty
    | Type.Value
    | Type.List
    | Type.Dictionary
    | Type.Optional

namespace Type {
    export interface Any { kind: 'any' }
    export const Any: Any = { kind: 'any' }

    export interface Empty { kind: 'empty' }
    export const Empty: Empty = { kind: 'empty' }

    export interface Value { kind: 'value', name: string, parent?: Value }
    export function Value(name: string, parent?: Value): Value { return { kind: 'value', name, parent } }

    export const AnyValue = Value('value');
    export const LiteralValue = Value('value', AnyValue);
    export const Bool = Value('bool', LiteralValue);
    export const Num = Value('number', LiteralValue);
    export const Str = Value('string', LiteralValue);

    export interface List { kind: 'list', type: Type }
    export function List(type: Type = Any): List { return { kind: 'list', type } }

    export interface Dictionary { kind: 'dictionary', map: { [name: string]: Type } }
    export function Dictionary(map: { [name: string]: Type }): Dictionary { return { kind: 'dictionary', map } }

    export interface Optional { kind: 'optional', type: Type }
    export function Optional(type: Type): Optional { return { kind: 'optional', type } }
}

export default Type