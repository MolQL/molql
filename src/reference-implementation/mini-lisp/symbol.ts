/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbol, { Arguments } from '../../mini-lisp/symbol'
import Environment from './environment'
import RuntimeExpression from './expression'

export type RuntimeArguments<C = any, T extends Arguments = Arguments> = { [P in keyof T['@type']]: RuntimeExpression<T['@type'][P]> } & T['@traits']

//RuntimeArguments.Dictionary<C, any> | RuntimeArguments.Array<C, any>

// export namespace RuntimeArguments {
//     export type Dictionary<C = any, T = any> = { [A in keyof T]: RuntimeExpression<C, T[A]> }
//     export type Array<C = any, T = any> = RuntimeExpression<C, T>[]
// }

type SymbolRuntime<C = {}, A extends Arguments = Arguments, T = any> = (env: Environment<C>, args: RuntimeArguments<C, A>) => T

namespace SymbolRuntime {
    export interface Info<C = {}, A extends Arguments = Arguments, T = any> {
        readonly symbol: Symbol,
        readonly runtime: SymbolRuntime<C, A, T>,
        readonly attributes: Attributes
    }

    export interface Attributes { isStatic: boolean }
}

function SymbolRuntime<S extends Symbol, T>(symbol: S, attributes: Partial<SymbolRuntime.Attributes> = {}) {
    const { isStatic = false } = attributes;
    return <C>(runtime: (env: Environment<C>, args: RuntimeArguments<C, S['arguments']>) => T): SymbolRuntime.Info<C, S['arguments'], T> =>
        ({ symbol, runtime, attributes: { isStatic } });
    // return {
    //     ofMap<C>(runtime: (env: Environment<C>, args: RuntimeArguments.Dictionary<C, A>) => T): SymbolRuntime.Info<C, T> {
    //         return { symbol, runtime, attributes: { isStatic } }
    //     },
    //     ofArray<C>(runtime: (env: Environment<C>, args: RuntimeArguments.Array<C, A>) => T): SymbolRuntime.Info<C, T> {
    //         return { symbol, runtime, attributes: { isStatic } }
    //     },
    //     none<C>(runtime: (env: Environment<C>, args: never) => T): SymbolRuntime.Info<C, T> {
    //         return { symbol, runtime, attributes: { isStatic } }
    //     }
    // }
}

export type SymbolTable = { readonly [id: string]: SymbolRuntime.Info }

export default SymbolRuntime