/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Type<T = any> = Type.Any | Type.Variable<T> | Type.Value<T> | Type.Container<T> | Type.Union<T>

namespace Type {
    export interface Any { kind: 'any',  '@type': any }
    export interface Variable<T> { kind: 'variable', name: string, type: Type, '@type': any }
    export interface Value<T> { kind: 'value', namespace: string, name: string, parent: Value<any> | undefined, '@type': T }
    export interface Container<T> { kind: 'container', namespace: string, name: string, child: Type, '@type': T }
    export interface Union<T> { kind: 'union', types: Type[], '@type': T }

    export function Variable<T = any>(name: string, type?: Type): Variable<T> { return { kind: 'variable', name, type: type || Any } as any; }
    export function Value<T>(namespace: string, name: string, parent?: Value<any>): Value<T> { return { kind: 'value', namespace, name, parent } as any; }
    export function Container<T>(namespace: string, name: string, child: Type): Container<T> { return { kind: 'container', namespace, name, child } as any; }
    export function Union<T>(...types: Type[]): Union<T> { return { kind: 'union', types } as any; }

    export const Any: Type<any> = { kind: 'any' } as any;

    export const AnyValue = Value<any>('', 'Value');

    export const Bool = Value<boolean>('', 'Bool', AnyValue);
    export const Num = Value<number>('', 'Number', AnyValue);
    export const Str = Value<string>('', 'String', AnyValue);

    export const LiteralValue = Union<number | string | boolean>(Bool, Num, Str);
}

export default Type