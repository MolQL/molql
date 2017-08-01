/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

interface Type<T = any> { kind: 'value', name: string, parent?: Type, '@type': T }

function Type<T>(name: string, parent?: Type): Type<T> { return { kind: 'value', name, parent, '@type': 0 as any } }

namespace Type {
    export const AnyValue = Type<any>('value');
    export const LiteralValue = Type<number | string | boolean>('value', AnyValue);
    export const Bool = Type<boolean>('bool', LiteralValue);
    export const Num = Type<number>('number', LiteralValue);
    export const Str = Type<string>('string', LiteralValue);
}

export default Type