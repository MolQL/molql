/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

type Expression =
    | Expression.Literal
    | Expression.Symbol

namespace Expression {
    export type Literal = string | number | boolean
    export interface Symbol { readonly symbol: string | Symbol, readonly args?: Expression[] }

    export function symbol(symbol: string | Symbol, args?: Expression[]): Symbol { return { symbol, args }; }
}

export default Expression