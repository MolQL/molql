/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { SymbolTable } from './symbol'

interface Environment<T = any> {
    readonly symbolTable: SymbolTable,
    readonly context: T
}

function Environment<T>(symbolTable: SymbolTable, context: T): Environment<T> {
    return { symbolTable, context };
}

export default Environment