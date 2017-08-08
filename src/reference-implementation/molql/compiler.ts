/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Compiler, { CompiledExpression } from '../mini-lisp/compiler'
import Context from './runtime/context'
import Runtime from './symbols'
import { SymbolMap } from '../../molql/symbols'

export type Compiled<T = any> = CompiledExpression<Context, T>
export default Compiler<Context>(SymbolMap, Runtime)