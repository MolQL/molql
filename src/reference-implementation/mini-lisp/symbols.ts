/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbol from '../../mini-lisp/symbol'
import Environment from './environment'
import RuntimeExpression from './expression'

export type RuntimeArguments<C = any, T = any> = RuntimeArguments.Array<C, T> | RuntimeArguments.Dictionary<C, T>

export namespace RuntimeArguments {
    export type Array<C, T> = RuntimeExpression<C, T>[]
    export type Dictionary<C, T> = { [A in keyof T]: RuntimeExpression<C, T[A]> }
}

type SymbolRuntime<C = {}, A extends RuntimeArguments<C, any> = RuntimeArguments<C, any>, T = any> = (env: Environment<C>, args: A) => T

namespace SymbolRuntime {
    export interface Info<C = {}, A extends RuntimeArguments<C, any> = RuntimeArguments<C, any>, T = any> {
        readonly symbol: Symbol,
        readonly runtime: SymbolRuntime<C, A, T>,
        readonly isStatic: boolean
    }
}

function SymbolRuntime<C, A, T>(symbol: Symbol, runtime: SymbolRuntime<C, A, T>, isStatic = false): SymbolRuntime.Info<C, A, T> {
    return { symbol, runtime, isStatic }
}

export type SymbolTable = { readonly [id: string]: SymbolRuntime.Info }

export default SymbolRuntime