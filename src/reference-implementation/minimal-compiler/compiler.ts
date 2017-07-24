/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import Runtime, { RuntimeExpression } from '../runtime/symbols'

function compileSymbol(name: string) {
    if (!Runtime[name]) throw new Error(`Could not find symbol '${name}'.`);
    return Runtime[name];
}

function compileApply(symbol: RuntimeExpression, slots: any[]): RuntimeExpression {
    return function (ctx) { slots[0] = ctx; return symbol.apply(null, slots); };
}

function compileValue(v: any): RuntimeExpression {
    return function (ctx) { return v; };
}

export default function compile(expr: Expression): RuntimeExpression {
    if (Expression.isLiteral(expr)) {
        return compileValue(expr);
    }
    const symbol = compileSymbol(expr.symbol);
    if (!expr.args || !expr.args.length) return symbol;
    const slots: any[] = [void 0];
    for (let i = 0; i < expr.args.length; i++) slots[i + 1] = compile(expr.args[i]);
    return compileApply(symbol, slots);
}