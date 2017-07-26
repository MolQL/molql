/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

export type Expression =
    | Expression.Literal
    | Expression.Symbol

export namespace Expression {
    export type Literal = string | number | boolean
    export interface Symbol { readonly symbol: string | Symbol, readonly args?: Expression[] }

    export function symbol(symbol: string | Symbol, args?: Expression[]): Symbol { return { symbol, args }; }
    export function isLiteral(e: Expression): e is Expression.Literal { return !(e as Symbol).symbol && !(e as Symbol).args; }
    export function isSymbol(e: Expression): e is Expression.Symbol { return !isLiteral(e); }
}

export default Expression