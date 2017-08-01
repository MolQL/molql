/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbol from '../../mini-lisp/symbol'
import Environment from './environment'
import RuntimeExpression from './expression'

export type RuntimeArguments<C = any, T = any> = { [A in keyof T]: RuntimeExpression<C, T[A]> }

type SymbolRuntime<C = {}, A = any, T = any> = (env: Environment<C>, args: RuntimeArguments<C, A>) => T

namespace SymbolRuntime {
    export interface Info<C = {}, A = any, T = any> {
        readonly symbol: Symbol,
        readonly runtime: SymbolRuntime<C, A, T>,
        readonly isStatic: boolean
    }

    export type Constructor<A, T> = <C>(runtime: SymbolRuntime<C, A, T>, isStatic?: boolean) => Info<C, A, T>
}

function SymbolRuntime<A, T>(symbol: Symbol<A, T>): SymbolRuntime.Constructor<A, T> {
    return function<C>(runtime: SymbolRuntime<C, A, T>, isStatic = false): SymbolRuntime.Info<C, A, T> {
        return { symbol, runtime, isStatic }
    }
}

export type SymbolTable = { readonly [id: string]: SymbolRuntime.Info }

export default SymbolRuntime