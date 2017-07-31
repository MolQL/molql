/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Type =
    | Type.Any
    | Type.Value
    | Type.List
    | Type.Dictionary
    | Type.Or
    | Type.Optional
    | Type.Fn

namespace Type {
    export interface Any { kind: 'any' }
    export const Any: Any = { kind: 'any' }

    export interface Empty { kind: 'empty' }
    export const Empty: Empty = { kind: 'empty' }

    export interface Value { kind: 'value', name: string, parent?: Value }
    export function Value(name: string, parent?: Value): Value { return { kind: 'value', name, parent } }

    export const AnyValue = Value('value');
    export const Bool = Value('bool', AnyValue);
    export const Num = Value('number', AnyValue);
    export const Str = Value('string', AnyValue);

    export interface List { kind: 'list', type: Type }
    export function List(type: Type = Any): List { return { kind: 'list', type } }

    export interface Dictionary { kind: 'dictionary', map: { [name: string]: Type } }
    export function Dictionary(map: { [name: string]: Type }): Dictionary { return { kind: 'dictionary', map } }

    export interface Or { kind: 'or', types: Type[] }
    export function Or(...types: Type[]): Or { return { kind: 'or', types } }

    export interface Optional { kind: 'optional', type: Type }
    export function Optional(type: Type): Optional { return { kind: 'optional', type } }

    export interface Fn { kind: 'fn', from: Type, to: Type }
    export function Fn(from: Type, to: Type): Fn { return { kind: 'fn', from, to } }
}

export default Type