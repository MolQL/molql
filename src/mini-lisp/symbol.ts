/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Expression from './expression'

export type ExpressionArguments = { [name: string]: Expression | undefined } | ArrayLike<Expression>

interface Symbol { (args: ExpressionArguments): Expression, id: string }

export type SymbolMap = { [id: string]: Symbol | undefined }

export default Symbol

