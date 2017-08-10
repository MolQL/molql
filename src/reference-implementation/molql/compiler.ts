/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Compiler, { CompiledExpression } from '../mini-lisp/compiler'
import Context from './runtime/context'
import Runtime from './runtime'
import Expression from '../../mini-lisp/expression'
import { SymbolMap } from '../../molql/symbol-table'
import typeChecker from './type-checker'

export type Compiled<T = any> = CompiledExpression<Context, T>
const _compile = Compiler<Context>(SymbolMap, Runtime)

export default function compile<T = any>(e: Expression) {
    typeChecker(SymbolMap, e);
    return _compile<T>(e);
}