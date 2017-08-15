/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Compiler, { CompiledExpression } from '../mini-lisp/compiler'
import Context from './runtime/context'
import Expression from '../../mini-lisp/expression'
import { SymbolMap } from '../../molql/symbol-table'
import typeChecker from './type/checker'
import * as MolQLStructure from '../../molql/symbol-table/structure'
import B from '../../molql/builder'
import Environment from './runtime/environment'
import AtomSelection from './data/atom-selection'

export type Compiled<T = any> = CompiledExpression<Context, T>
const _compile = Compiler<Context>(SymbolMap, Environment);

function compile(e: Expression, kind?: 'query'): CompiledExpression<Context, AtomSelection>;
function compile<T = any>(e: Expression, kind?: 'any'): CompiledExpression<Context, T>;
function compile<T = any>(e: Expression, kind: 'query' | 'any' = 'any') {
    if (kind === 'query') {
        typeChecker(SymbolMap, e, MolQLStructure.Types.AtomSelectionQuery);
        return _compile<T>(B.evaluate(e));
    } else {
        typeChecker(SymbolMap, e);
        return _compile<T>(e);
    }
}

export default compile;