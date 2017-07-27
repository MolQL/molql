/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'

const { isLiteral, isSymbol, isApply } = Expression;

export default function lispFormat(e: Expression) {
    const lines: string[] = [];
    _format(e, lines, '');
    return lines.join('\n');
}

function isValueLike(e: Expression): e is Expression.Literal | Expression.Symbol {
    if (isLiteral(e) || isSymbol(e)) return true;
    return isSymbol(e.head) && (!e.args || !e.args.length);
}

function formatValueLike(e: Expression, prefix: string) {
    if (isLiteral(e)) {
        if (typeof e === 'string') {
            return prefix + (/\s/.test(e) ? `${prefix}\`${e}\`` : e);
        }
        return `${prefix}${e}`;
    } else if (isSymbol(e)) {
        return `${prefix}${e.symbol}`;
    }
    return `${prefix}(${(e.head as Expression.Symbol).symbol})`;
}

function _format(e: Expression, lines: string[], prefix: string): string[] {
    if (isValueLike(e)) {
        lines.push(formatValueLike(e, prefix));
        return lines;
    }
    const head = _format(e.head, [], '');
    if (!e.args || !e.args.length) {
        head.forEach(l => lines.push(`${prefix}${l}`));
        return lines;
    }

    if (e.args.every(a => isValueLike(a))) {
        const args = e.args.map(a => formatValueLike(a, '')).join(' ');
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
    let idx = 0, prevValueLike = false;
    for (const a of e.args) {
        idx++;
        if (isValueLike(a) && prevValueLike) lines[lines.length - 1] += formatValueLike(a, ' ');
        else _format(a, lines, newPrefix);
        prevValueLike = isValueLike(a);
        if (idx === e.args.length) lines[lines.length - 1] += ')';
    }
    return lines;
}