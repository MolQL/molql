/*
 * Copyright (c) 2017 David Sehnal contributors, licensed under MIT, See LICENSE file for more info.
 */

import Type from './type'

export type Argument<T extends Type>  = { type: T, isOptional: boolean, isRest: boolean, defaultValue: T['@type'] | undefined, description: string | undefined }
export function Argument<T extends Type>(type: T, params?: { description?: string, defaultValue?: T['@type'], isOptional?: boolean, isRest?: boolean }): Argument<T> {
    const { description = void 0, isOptional = false, isRest = false, defaultValue = void 0 } = params || {}
    return { type, isOptional, isRest, defaultValue, description };
}

export type Arguments<T extends { [key: string]: any } = {}> =
    | Arguments.List<T>
    | Arguments.Dictionary<T>

export namespace Arguments {
    export const None: Arguments = Dictionary({});

    export interface Dictionary<T extends { [key: string]: any } = {}, Traits = {}> {
        kind: 'dictionary',
        map: { [P in keyof T]: Argument<T[P]> },
        '@type': T
    }
    export function Dictionary<Map extends { [key: string]: Argument<any> }>(map: Map): Arguments<{ [P in keyof Map]: Map[P]['type']['@type'] }> {
        return { kind: 'dictionary', map, '@type': 0 as any };
    }

    export interface List<T extends { [key: string]: any } = {}, Traits = {}> { kind: 'list', type: Type, '@type': T }
    export function List<T extends Type>(type: T, description?: string): Arguments<{ [key: string]: T['@type'] }> {
        return { kind: 'list', type, '@type': 0 as any };
    }
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

export function isSymbol(x: any): x is Symbol {
    const s = x as Symbol;
    return typeof s === 'object' && s.arguments && typeof s.name === 'string' && typeof s.namespace === 'string' && !!s.type && !!s.arguments;
}

export default Symbol

