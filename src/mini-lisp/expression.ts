/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

type Expression =
    | Expression.Literal
    | Expression.Apply

namespace Expression {
    export type Literal = string | number | boolean
    export interface Symbol { readonly symbol: string }
    export type Arguments = Expression[] | { [name: string]: Expression }
    export interface Apply { readonly head: Symbol | Apply, readonly args?: Arguments }

    export function Apply(head: Symbol | Apply, args?: Arguments): Apply { return { head, args }; }

    export function isArgumentsArray(e: Arguments): e is Expression[] { return e instanceof Array; }
    export function isArgumentsMap(e: Arguments): e is { [name: string]: Expression } { return !(e instanceof Array); }
    export function isLiteral(e: Expression): e is Expression.Literal { return !isApply(e); }
    export function isApply(e: Expression): e is Expression.Apply { return !!(e as Expression.Apply).head && typeof e === 'object'; }
}

export default Expression