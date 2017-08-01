/*
 * Copyright (c) 2017 David Sehnal contributors, licensed under MIT, See LICENSE file for more info.
 */

import Type from './type-system'

export type Argument<T extends Type>  = { type: T, defaultValue?: any, description?: string }
export function Argument<T extends Type>(type: T, description?: string, defaultValue?: T['@type'], ): Argument<T> {
    return { type, defaultValue, description };
}

export type Arguments<T extends { [key: string]: any, [key: number]: any } = {}, Traits = {}> =
    | Arguments.List<T, Traits>
    | Arguments.Dictionary<T, Traits>
    | Arguments.None<T, Traits>

export namespace Arguments {
    type ArgMap = { [key: string]: Argument<any>, [key: number]: Argument<any> }

    export type None<T extends { [key: string]: any, [key: number]: any } = {}, Traits = {}> = { kind: 'none', '@type': T, '@traits': Traits }
    export const None: Arguments = { kind: 'none', '@type': 0 as any, '@traits': 0 as any }

    export interface Dictionary<T extends { [key: string]: any, [key: number]: any } = {}, Traits = {}> {
        kind: 'dictionary',
        map: { [P in keyof T]: Argument<T[P]> },
        '@type': T,
        '@traits': Traits
    }
    export function Dictionary<Map extends ArgMap>(map: Map): Arguments<{ [P in keyof Map]: Map[P]['type']['@type'] }> {
        return { kind: 'dictionary', map, '@type': 0 as any, '@traits': 0 as any };
    }

    export interface List<T extends { [key: string]: any, [key: number]: any } = {}, Traits = {}> {
        kind: 'list',
        type: Type.Value,
        '@type': T,
        '@traits': { length: number }
    }
    export function List<T extends Type.Value>(type: T, description?: string): Arguments<{ [key: number]: T['@type'] }, { length: number }> {
        return { kind: 'list', type, '@type': 0 as any, '@traits': 0 as any };
    }


    // export type List = { kind: 'list', type: Type.Value, description?: string, '@type': any[] }
    // export function List(type: Type.Value, description?: string): List { return { kind: 'list', type, description } as List; }
    // export type Argument<T>  = { type: Type<T>, defaultValue?: any, description?: string }
    // export function Argument<T>(type: Type<T>, defaultValue?: any, description?: string): Argument<T> {
    //     return { type, defaultValue, description };
    // }
    // type DictBase = { [key: string]: any, [key: number]: any }
    // export type Dictionary<T extends DictBase> = { kind: 'dictionary', map: { [P in keyof T]: Argument<T[P]> } }
    // export function Dictionary<T extends DictBase>(map: { [P in keyof T]: Argument<T[P]> }): Dictionary<T> { return { kind: 'dictionary', map } }
}

type x = keyof string

interface Symbol<A extends Arguments = Arguments, T extends Type = Type> {
    id: string,
    namespace: string,
    name: string,
    type: T,
    arguments: A,
    description?: string
}

function Symbol<A extends Arguments, T extends Type>(name: string, args: A, type: T, description?: string) {
    return { id: '', namespace: '', name, type, arguments: args, description, '@arg-type': void 0 as any } as Symbol<A, T>;
}

export default Symbol

