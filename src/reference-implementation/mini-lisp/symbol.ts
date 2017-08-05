/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbol, { Arguments } from '../../mini-lisp/symbol'
import Environment from './environment'
import RuntimeExpression from './expression'

export type RuntimeArguments<C = any, Args extends Arguments = Arguments> =
    { length?: number } & { [P in keyof Args['@type']]: RuntimeExpression<C, Args['@type'][P]> }

type SymbolRuntime<C = {}, A extends Arguments = Arguments, T = any> = (env: Environment<C>, args: RuntimeArguments<C, A>) => T

namespace SymbolRuntime {
    export interface Info<C = {}, A extends Arguments = Arguments, T = any> {
        readonly symbol: Symbol,
        readonly runtime: SymbolRuntime<C, A, T>,
        readonly attributes: Attributes
    }

    export interface Attributes { isStatic: boolean }
}

function SymbolRuntime<S extends Symbol>(symbol: S, attributes: Partial<SymbolRuntime.Attributes> = {}) {
    const { isStatic = false } = attributes;
    return <C>(runtime: SymbolRuntime<C, S['args'], S['type']['@type']>): SymbolRuntime.Info<C, S['args'], S['type']['@type']> => {
        return ({ symbol, runtime, attributes: { isStatic } });
    };
}

export type SymbolTable = { readonly [id: string]: SymbolRuntime.Info }

export default SymbolRuntime