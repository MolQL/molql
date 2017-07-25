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
    export function isLiteral(e: Expression): e is Expression.Literal { return !(e as Apply).head && !(e as Apply).args; }

    function formatLiteral(e: Literal, prefix: string) {
        if (typeof e === 'string') {
            return prefix + (e.indexOf(' ') >= 0 ? `\`${e}\`` : e);
        }
        return `${prefix}${e}`;
    }

    function _format(e: Expression, lines: string[], prefix: string): string[] {
        if (isLiteral(e)) {
            lines.push(formatLiteral(e, prefix));
            return lines;
        }
        const head = _format(e.head, [], '');
        if (!e.args || !e.args.length) {
            head.forEach(l => lines.push(`${prefix}${l}`));
            return lines;
        }
        if (e.args.every(a => isLiteral(a))) {
            const args = e.args.map(a => formatLiteral(a as Literal, '')).join(' ');
            if (head.length === 1) {
                lines.push(`${prefix}(${head[0]} ${args})`);
            } else {
                head.forEach(l => lines.push(`${prefix}${l}`));
                lines.push(args);
            }
            return lines;
        }
        const newPrefix = prefix + '  ';
        if (head.length === 1) {
            lines.push(`${prefix}(${head[0]}`);
        } else {
            lines.push(`${prefix}(`);
            head.forEach(l => lines.push(`${newPrefix}${l}`));
        }
        let idx = 0;
        for (const a of e.args) {
            idx++;
            _format(a, lines, newPrefix);
            if (idx === e.args.length) lines[lines.length - 1] += ')';
        }
        return lines;
    }

    export function format(e: Expression) {
        const lines: string[] = [];
        _format(e, lines, '');
        return lines.join('\n');
    }
}

export default Expression