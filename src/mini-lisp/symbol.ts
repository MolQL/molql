/*
 * Copyright (c) 2017 David Sehnal contributors, licensed under MIT, See LICENSE file for more info.
 */

import Type from './type-system'

export type Arguments = Arguments.None | Arguments.List | Arguments.Dictionary

export namespace Arguments {
    export type None = { kind: 'none' }
    export const None: None = { kind: 'none' }

    export type List = { kind: 'list', type: Type.Value, description?: string, '@type': any[] }
    export function List(type: Type.Value, description?: string): List { return { kind: 'list', type, description } as List; }

    export type Argument  =
        | { kind: 'required', type: Type.Value, description?: string }
        | { kind: 'optional', type: Type.Value, defaultValue: any, description?: string }

    export function Argument(type: Type.Value, description?: string): Argument {
        return { kind: 'required', type, description };
    }

    export function OptionalArgument(type: Type.Value, defaultValue: any, description?: string): Argument {
        return { kind: 'optional', type, defaultValue, description };
    }

    export type Dictionary = { kind: 'dictionary', map: { [name: string]: Argument } }
    export function Dictionary(map: { [name: string]: Argument }): Dictionary { return { kind: 'dictionary', map } }
}

interface Symbol<A = any, T = any> {
    '@arg-type': A,
    '@ret-type': T,
    id: string,
    namespace: string,
    name: string,
    type: Type,
    arguments: Arguments,
    description?: string
}

function Symbol<A, T>(name: string, type: Type, args: Arguments, description?: string) {
    return { id: '', namespace: '', name, type, arguments: args, description, '@arg-type': void 0 as any } as Symbol<A, T>;
}

export default Symbol

