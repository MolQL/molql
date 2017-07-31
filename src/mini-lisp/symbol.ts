/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

import Type from './type-system'

export type Arguments = Arguments.None | Arguments.List | Arguments.Dictionary

export namespace Arguments {
    type Base = { description?: string }

    export type None = { kind: 'none' }
    export const None: None = { kind: 'none' }

    export type List = { kind: 'list', type: Type.Value, description?: string }
    export function List(type: Type.Value, description?: string): List { return { kind: 'list', type, description } }

    export interface Argument { name: string, type: Type.Value, description?: string }
    export function Argument(name: string, type: Type.Value, description?: string): Argument { return { name, type, description } }

    export type Dictionary = { kind: 'dictionary', map: { [name: string]: Argument } } & Base
    export function Dictionary(map: { [name: string]: Argument }, description?: string): Dictionary { return { kind: 'dictionary', map, description } }
}

interface Symbol {
    namespace: string,
    name: string,
    arguments: Arguments,
    description?: string
}

function Symbol(namespace: string, name: string, args?: Arguments, description?: string): Symbol { return { namespace, name, arguments: args || Arguments.None, description } }

export default Symbol

