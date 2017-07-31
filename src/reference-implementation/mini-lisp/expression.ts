/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from './environment'

type RuntimeExpression<C = any, T = any> = (env: Environment<C>) => T

export interface ExpressionInfo {
    isConst?: boolean
}

namespace RuntimeExpression {
    export function constant<C, T>(c: T): RuntimeExpression<C, T> {
        return function (env) { return c; };
    }

    export function func<C, T>(f: (env: Environment<C>) => T): RuntimeExpression<C, T> {
        return function (env) { return f(env); };
    }
}

export default RuntimeExpression