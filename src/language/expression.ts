/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

type Expression =
    | Expression.Literal
    | Expression.Symbol
    | Expression.Apply

namespace Expression {
    export type Literal = string | number | boolean
    export interface Symbol { readonly symbol: string }
    export interface Apply { readonly head: Symbol | Apply, readonly args?: Expression[] }

    export function symbol(symbol: string): Symbol { return { symbol }; }
    export function apply(head: Symbol | Apply, args?: Expression[]): Apply { return { head, args }; }

    export function isLiteral(e: Expression): e is Expression.Literal { return !isApply(e) && !isSymbol(e); }
    export function isSymbol(e: Expression): e is Expression.Symbol { return typeof (e as Expression.Symbol).symbol === 'string'; }
    export function isApply(e: Expression): e is Expression.Apply { return !!(e as Expression.Apply).head; }
}

export default Expression