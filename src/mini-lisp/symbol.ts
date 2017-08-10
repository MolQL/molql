/*
 * Copyright (c) 2017 David Sehnal contributors, licensed under MIT, See LICENSE file for more info.
 */

import Expression from './expression'

export type ExpressionArguments = { [name: string]: Expression | undefined } | { [index: number]: Expression, length: number }

interface Symbol {
    (args: ExpressionArguments): Expression,
    id: string,
}

export type SymbolMap = { [id: string]: Symbol | undefined }

export default Symbol

