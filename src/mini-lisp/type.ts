/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

interface Type<T = any> { name: string, parent?: Type, '@type': T }

function Type<T>(name: string, parent?: Type): Type<T> { return { name, parent, '@type': 0 as any } }

namespace Type {
    export const Any = Type<any>('Any');
    export const LiteralValue = Type<number | string | boolean>('Value', Any);

    export const Bool = Type<boolean>('Bool', LiteralValue);
    export const Num = Type<number>('Number', LiteralValue);
    export const Str = Type<string>('String', LiteralValue);
}

export default Type