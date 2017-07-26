/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from './environment'
import Iterator from './iterator'
import { SymbolRuntime } from './symbols'

export type RuntimeExpression<T = any> = (env: Environment) => T

export interface RuntimeInfo {
    id: number,
    hint?: 'loop-invariant' | 'const'
}

function evalLoopInvariant(f: RuntimeExpression, id: number): RuntimeExpression {
    return function (env) {
        const iterator = env.iterator.value;
        if (!iterator) return f(env);
        const cached = Iterator.getInvariant(iterator, id);
        if (!cached) {
            const value = f(env);
            Iterator.setInvariant(iterator, id, value);
            return value;
        }
        return cached;
    }
}

function evalBasic(f: RuntimeExpression): RuntimeExpression {
    return function(env) { return f(env); }
}

function evalConst(v: any): RuntimeExpression {
    // Leaving out the "env" definition in the following code makes the runtime up to 20% slower.
    // ...fun stuff :)
    return function (env) { return v; };
}

export function RuntimeExpression(f: RuntimeExpression | SymbolRuntime | string | boolean | number | object, info: RuntimeInfo): RuntimeExpression {
    switch (info.hint) {
        case 'const': return evalConst(f);
        case 'loop-invariant': return evalLoopInvariant(f as RuntimeExpression, info.id);
        default: return evalBasic(f as RuntimeExpression);
    }
}

export default RuntimeExpression;