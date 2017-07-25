/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import Runtime, { RuntimeExpression } from '../runtime/symbols'

function value(v: any): RuntimeExpression {
    return function (ctx) { return v; };
}

function symbol(name: string): RuntimeExpression {
    if (!Runtime[name]) throw new Error(`Could not find implementation of symbol '${name}'.`);
    return Runtime[name];
}

function applySymbol(symbol: RuntimeExpression, slots: any[]): RuntimeExpression {
    return function (ctx) { slots[0] = ctx; return symbol.apply(null, slots); };
}

function applyExpression(expression: RuntimeExpression, slots: any[]): RuntimeExpression {
    // An optimization to call a function directly for a low number of arguments.
    switch (slots.length) {
        case 1: return function (ctx) { return expression(ctx)(ctx); };
        case 2: return function (ctx) { return expression(ctx)(ctx, slots[1]); };
        case 3: return function (ctx) { return expression(ctx)(ctx, slots[1], slots[2]); };
        case 4: return function (ctx) { return expression(ctx)(ctx, slots[1], slots[2], slots[3]); };
        case 5: return function (ctx) { return expression(ctx)(ctx, slots[1], slots[2], slots[3], slots[4]); };
        case 6: return function (ctx) { return expression(ctx)(ctx, slots[1], slots[2], slots[3], slots[4], slots[5]); };
        default: return function (ctx) { slots[0] = ctx; return expression(ctx).apply(null, slots); };
    }
}

function applyRuntime(runtime: RuntimeExpression, slots: any[]): RuntimeExpression {
    // An optimization to call a function directly for a low number of arguments.
    // Plus an optimization to call runtime directly.
    switch (slots.length) {
        case 1: return function (ctx) { return runtime(ctx); };
        case 2: return function (ctx) { return runtime(ctx, slots[1]); };
        case 3: return function (ctx) { return runtime(ctx, slots[1], slots[2]); };
        case 4: return function (ctx) { return runtime(ctx, slots[1], slots[2], slots[3]); };
        case 5: return function (ctx) { return runtime(ctx, slots[1], slots[2], slots[3], slots[4]); };
        case 6: return function (ctx) { return runtime(ctx, slots[1], slots[2], slots[3], slots[4], slots[5]); };
        default: return function (ctx) { slots[0] = ctx; return runtime.apply(null, slots); };
    }
}

function _compile(expr: Expression, isHead: boolean): RuntimeExpression {
    if (Expression.isLiteral(expr)) {
        return isHead && typeof expr === 'string' ? symbol(expr) : value(expr);
    }

    const head = _compile(expr.symbol, true);
    if (!expr.args || !expr.args.length) return head;

    const slots: any[] = [void 0];
    if (expr.args) for (let i = 0; i < expr.args.length; i++) slots[i + 1] = _compile(expr.args[i], false);
    return typeof expr.symbol === 'string' ? applyRuntime(symbol(expr.symbol), slots) : applyExpression(head, slots);
}

export default function compile(expr: Expression): RuntimeExpression {
    return _compile(expr, false);
}