/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Expression =
    | Expression.Literal
    | Expression.Apply

namespace Expression {
    export type Literal = string | number | boolean | null
    export type Arguments = Expression[] | { [name: string]: Expression }
    export interface Apply { readonly head: Expression, readonly args?: Arguments }

    export function Apply(head: Expression, args?: Arguments): Apply { return args ? { head, args } : { head }; }

    export function isArgumentsArray(e: Arguments): e is Expression[] { return e instanceof Array; }
    export function isArgumentsMap(e: Arguments): e is { [name: string]: Expression } { return !(e instanceof Array); }
    export function isLiteral(e: Expression): e is Expression.Literal { return !isApply(e); }
    export function isApply(e: Expression): e is Expression.Apply { return !!(e as Expression.Apply).head && typeof e === 'object'; }
}

export default Expression