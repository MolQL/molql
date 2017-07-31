/*
 * Copyright (c) 2017 David Sehnal contributors, licensed under MIT, See LICENSE file for more info.
 */

import Type from './type-system'

export type Arguments = Arguments.None | Arguments.List | Arguments.Dictionary

export namespace Arguments {
    export type None = { kind: 'none' }
    export const None: None = { kind: 'none' }

    export type List = { kind: 'list', type: Type.Value, description?: string }
    export function List(type: Type.Value, description?: string): List { return { kind: 'list', type, description } }

    export interface Argument { type: Type.Value, isOptional: boolean, description?: string }
    export function Argument(type: Type.Value, isOptional?: boolean, description?: string): Argument { return { type, isOptional: !!isOptional, description } }

    export type Dictionary = { kind: 'dictionary', map: { [name: string]: Argument } }
    export function Dictionary(map: { [name: string]: Argument }): Dictionary { return { kind: 'dictionary', map } }
}

interface Symbol {
    namespace: string,
    name: string,
    type: Type,
    arguments: Arguments,
    description?: string
}

function Symbol(namespace: string, name: string, type: Type, args: Arguments, description?: string): Symbol { return { namespace, name, type, arguments: args, description } }

export default Symbol

