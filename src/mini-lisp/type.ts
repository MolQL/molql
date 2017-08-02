/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

interface Type<T = any> { name: string, parent?: Type, '@type': T }

function Type<T>(name: string, parent?: Type): Type<T> { return { name, parent, '@type': 0 as any } }

namespace Type {
    export const Any = Type<any>('value');
    export const LiteralValue = Type<number | string | boolean>('value', Any);

    export const Bool = Type<boolean>('bool', LiteralValue);
    export const Num = Type<number>('number', LiteralValue);
    export const Str = Type<string>('string', LiteralValue);
}

export default Type