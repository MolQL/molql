/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { SymbolRuntimeTable } from './symbol'

interface Environment<T = any> {
    readonly symbolTable: SymbolRuntimeTable,
    readonly context: T
}

// function Environment<T>(symbolTable: SymbolRuntimeTable, context: T): Environment<T> {
//     return { symbolTable, context };
// }

export default Environment