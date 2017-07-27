/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from './environment'
import Iterator from './iterator'
import SymbolRuntime from './symbols'

export type RuntimeExpression<T = any> = (env: Environment) => T

export interface RuntimeInfo {
    isConst?: boolean
}

function evaluate(f: RuntimeExpression): RuntimeExpression {
    return function(env) { return f(env); }
}

function evaluateConst(v: any): RuntimeExpression {
    // Leaving out the "env" definition in the following code makes the runtime up to 20% slower.
    // ...fun stuff :)
    return function (env) { return v; };
}

export function RuntimeExpression(f: RuntimeExpression | SymbolRuntime | string | boolean | number | object, info: RuntimeInfo): RuntimeExpression {
    if (info.isConst) return evaluateConst(f);
    return evaluate(f as RuntimeExpression);
}

export default RuntimeExpression;