/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Type<T = any> =
    | Type.Value<T>
    | Type.Optional<T>

namespace Type {
    export interface Value<T = any> { kind: 'value', name: string, parent?: Value, '@type': T }
    export function Value<T>(name: string, parent?: Value): Value<T> { return { kind: 'value', name, parent, '@type': 0 as any } }

    export const AnyValue = Value('value');
    export const LiteralValue = Value<number | string | boolean>('value', AnyValue);
    export const Bool = Value<boolean>('bool', LiteralValue);
    export const Num = Value<number>('number', LiteralValue);
    export const Str = Value<string>('string', LiteralValue);

    export interface Optional<T = any> { kind: 'optional', type: Value<T>, '@type'?: T }
    export function Optional<T>(type: Value): Optional<T> { return { kind: 'optional', type, '@type': 0 as any } }

    //export interface Dictionary<T extends { [name: string]: any }> { kind: 'dictionary', map: { [name: string]: Type }, '@type': T  }
//    export function Dictionary<T extends { [name: string]: any }>(map: { [name: string]: Type }): Dictionary<T> { return { kind: 'dictionary', map, '@type': 0 as any } }
}

export default Type