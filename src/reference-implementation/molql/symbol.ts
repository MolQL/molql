/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbol, { Arguments } from '../../molql/symbol'
import Environment from './runtime/environment'
import RuntimeExpression from '../mini-lisp/expression'

type Ctx = Environment['context']

export type RuntimeArguments<Args extends Arguments = Arguments> =
    { length?: number } & { [P in keyof Args['@type']]: RuntimeExpression<Ctx, Args['@type'][P]> }

type SymbolRuntime<A extends Arguments = Arguments, T = any> = (env: Environment, args: RuntimeArguments<A>) => T

namespace SymbolRuntime {
    export interface Info<A extends Arguments = Arguments, T = any> {
        readonly symbol: Symbol,
        readonly runtime: SymbolRuntime<A, T>,
        readonly attributes: Attributes
    }

    export interface Attributes { isStatic: boolean }
}

function SymbolRuntime<S extends Symbol>(symbol: S, attributes: Partial<SymbolRuntime.Attributes> = {}) {
    const { isStatic = false } = attributes;
    return (runtime: SymbolRuntime<S['args'], S['type']['@type']>): SymbolRuntime.Info<S['args'], S['type']['@type']> => {
        return ({ symbol, runtime, attributes: { isStatic } });
    };
}

export type SymbolRuntimeTable = { readonly [id: string]: SymbolRuntime.Info }

export default SymbolRuntime