/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
const { isLiteral, isSymbol } = Expression

export function lispFormat(e: Expression) {
    const lines: string[] = [];
    _format(e, lines, '');
    return lines.join('\n');
}

function isValueLike(e: Expression) {
    if (isLiteral(e)) return true;
    return typeof e.symbol === 'string' && (!e.args || !e.args.length);
}

function formatValueLike(e: Expression, prefix: string) {
    if (isLiteral(e)) {
        if (typeof e === 'string') {
            return prefix + (/\s/.test(e) ? `${prefix}\`${e}\`` : e);
        }
        return `${prefix}${e}`;
    }
    return `${prefix}${e.symbol}`;
}

function _format(e: Expression, lines: string[], prefix: string): string[] {
    if (isLiteral(e)) {
        lines.push(formatValueLike(e, prefix));
        return lines;
    }
    const symbol = _format(e.symbol, [], '');
    if (!e.args || !e.args.length) {
        symbol.forEach(l => lines.push(`${prefix}${l}`));
        return lines;
    }
    if (e.args.every(a => isValueLike(a))) {
        const args = e.args.map(a => formatValueLike(a, '')).join(' ');
        if (symbol.length === 1) {
            lines.push(`${prefix}(${symbol[0]} ${args})`);
        } else {
            symbol.forEach(l => lines.push(`${prefix}${l}`));
            lines.push(args);
        }
        return lines;
    }
    const newPrefix = prefix + '  ';
    if (symbol.length === 1) {
        lines.push(`${prefix}(${symbol[0]}`);
    } else {
        lines.push(`${prefix}(`);
        symbol.forEach(l => lines.push(`${newPrefix}${l}`));
    }
    let idx = 0;
    for (const a of e.args) {
        idx++;
        _format(a, lines, newPrefix);
        if (idx === e.args.length) lines[lines.length - 1] += ')';
    }
    return lines;
}