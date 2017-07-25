/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

export type Expression =
    | Expression.Literal
    | Expression.Apply

export namespace Expression {
    export type Literal = string | number | boolean
    export type Apply = { head: Expression, args?: Expression[] }

    export function apply(head: Expression, args?: Expression[]): Apply { return { head, args }; }
    export function isLiteral(e: Expression): e is Expression.Literal { return typeof (e as any).symbol !== 'string'; }

    export function format(e: Expression): string {
        if (isLiteral(e)) {
            if (typeof e === 'string') {
                return `\`${e}\``;
            }
            return `${e}`;
        }
        if (!e.args || !e.args.length) return `${e.head}`;
        return `(${e.head} ${e.args.map(a => format(a)).join(' ')})`;
    }
}

export default Expression