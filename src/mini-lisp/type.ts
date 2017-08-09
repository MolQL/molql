/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Type<T = any> = Type.Any | Type.AnyValue | Type.Variable<T> | Type.Value<T> | Type.Container<T> | Type.Union<T>

namespace Type {
    export interface Any { kind: 'any',  '@type': any }
    export interface Variable<T> { kind: 'variable', name: string, type: Type, '@type': any }
    export interface AnyValue { kind: 'any-value', '@type': any }
    export interface Value<T> { kind: 'value', namespace: string, name: string, '@type': T }
    export interface Container<T> { kind: 'container', namespace: string, name: string, child: Type, '@type': T }
    export interface Union<T> { kind: 'union', types: Type[], '@type': T }

    export function Variable<T = any>(name: string, type?: Type): Variable<T> { return { kind: 'variable', name, type: type || Any } as any; }
    export function Value<T>(namespace: string, name: string): Value<T> { return { kind: 'value', namespace, name } as any; }
    export function Container<T>(namespace: string, name: string, child: Type): Container<T> { return { kind: 'container', namespace, name, child } as any; }
    export function Union<T>(...types: Type[]): Union<T> { return { kind: 'union', types } as any; }

    export const Any: Any = { kind: 'any' } as any;
    export const AnyValue: AnyValue = { kind: 'any-value' } as any;

    export const Bool = Value<boolean>('', 'Bool');
    export const Num = Value<number>('', 'Number');
    export const Str = Value<string>('', 'String');
}

export default Type