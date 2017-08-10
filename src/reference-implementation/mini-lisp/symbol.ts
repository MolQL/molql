/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbol from '../../mini-lisp/symbol'
import Environment from './environment'
import RuntimeExpression from './expression'

export type RuntimeArguments = ArrayLike<RuntimeExpression> | { [name: string]: RuntimeExpression | undefined }

type SymbolRuntime = (env: Environment, args: RuntimeArguments) => any

namespace SymbolRuntime {
    export interface Info {
        readonly symbol: Symbol,
        readonly runtime: SymbolRuntime,
        readonly attributes: Attributes
    }

    export interface Attributes { isStatic: boolean }
}

function SymbolRuntime(symbol: Symbol, attributes: Partial<SymbolRuntime.Attributes> = {}) {
    const { isStatic = false } = attributes;
    return (runtime: SymbolRuntime): SymbolRuntime.Info => {
        return ({ symbol, runtime, attributes: { isStatic } });
    };
}

export type SymbolRuntimeTable = { readonly [id: string]: SymbolRuntime.Info }

export default SymbolRuntime