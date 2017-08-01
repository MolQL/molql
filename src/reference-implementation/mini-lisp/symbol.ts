/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbol from '../../mini-lisp/symbol'
import Environment from './environment'
import RuntimeExpression from './expression'

export type RuntimeArguments<C = any> = RuntimeArguments.Dictionary<C, any> | RuntimeArguments.Array<C, any>

export namespace RuntimeArguments {
    export type Dictionary<C = any, T = any> = { [A in keyof T]: RuntimeExpression<C, T[A]> }
    export type Array<C = any, T = any> = RuntimeExpression<C, T>[]
}

type SymbolRuntime<C = {}, T = any> = (env: Environment<C>, args: RuntimeArguments<C>) => T

namespace SymbolRuntime {
    export interface Info<C = {}, T = any> {
        readonly symbol: Symbol,
        readonly runtime: SymbolRuntime<C, T>,
        readonly attributes: Attributes
    }

    export interface Attributes { isStatic: boolean }
}

function SymbolRuntime<A, T>(symbol: Symbol<A, T>, attributes: Partial<SymbolRuntime.Attributes> = {}) {
    const { isStatic = false } = attributes;
    return {
        dict<C>(runtime: (env: Environment<C>, args: RuntimeArguments.Dictionary<C, A>) => T): SymbolRuntime.Info<C, T> {
            return { symbol, runtime, attributes: { isStatic } }
        },
        array<C>(runtime: (env: Environment<C>, args: RuntimeArguments.Array<C, A>) => T): SymbolRuntime.Info<C, T> {
            return { symbol, runtime, attributes: { isStatic } }
        },
        none<C>(runtime: (env: Environment<C>, args: never) => T): SymbolRuntime.Info<C, T> {
            return { symbol, runtime, attributes: { isStatic } }
        }
    }
}

export type SymbolTable = { readonly [id: string]: SymbolRuntime.Info }

export default SymbolRuntime