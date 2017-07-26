/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import Symbols, { SymbolRuntime } from '../runtime/symbols'
import RuntimeExpression from '../runtime/expression'
import Environment from '../runtime/environment'
//import Runtime, { RuntimeExpression } from '../runtime/symbols'

interface CompileContext {
    id: number
}

function getRuntime(name: string): SymbolRuntime {
    if (!Symbols[name]) throw new Error(`Could not find implementation of symbol '${name}'.`);
    return Symbols[name];
}

function wrap(ctx: CompileContext, f: RuntimeExpression) {
    return RuntimeExpression(f, { id: ctx.id++ });
}

function value(ctx: CompileContext, v: any): RuntimeExpression {
    return RuntimeExpression(v, { id: ctx.id++, hint: 'const' });
}

function symbol(ctx: CompileContext, runtime: SymbolRuntime): RuntimeExpression {
    return RuntimeExpression(runtime, { id: ctx.id++, hint: 'const' });
}

function _apply(expression: RuntimeExpression, slots: any[]): RuntimeExpression {
    return function (env) { slots[0] = env; return expression(env).apply(null, slots); };
}

function apply(expression: RuntimeExpression, args: RuntimeExpression[]): RuntimeExpression {
    // An optimization to call a function directly for a low number of arguments.
    switch (args.length) {
        case 0: return function (env) { return expression(env)(env); };
        case 1: return function (env) { return expression(env)(env, args[0]); };
        case 2: return function (env) { return expression(env)(env, args[0], args[1]); };
        case 3: return function (env) { return expression(env)(env, args[0], args[1], args[2]); };
        case 4: return function (env) { return expression(env)(env, args[0], args[1], args[2], args[3]); };
        case 5: return function (env) { return expression(env)(env, args[0], args[1], args[2], args[3], args[4]); };
        default: return _apply(expression, [void 0, ...args]);
    }
}

function onlyStringLiteralsCanBeApplied() {
    throw new Error('Only string literals can be applied.');
}

function _compile(ctx: CompileContext, expr: Expression, isSymbol: boolean): RuntimeExpression {
    if (Expression.isLiteral(expr)) {
        if (isSymbol) {
            if (typeof expr !== 'string') onlyStringLiteralsCanBeApplied();
            return symbol(ctx, getRuntime(expr as string));
        }
        return value(ctx, expr);
    }

    const head = _compile(ctx, expr.symbol, true);
    if (!expr.args || !expr.args.length) return wrap(ctx, head);

    const slots: any[] = [];
    if (expr.args) for (let i = 0; i < expr.args.length; i++) slots[i] = _compile(ctx, expr.args[i], false);
    return wrap(ctx, apply(head, slots));
}

export default function compile(expr: Expression): RuntimeExpression {
    return _compile({ id: 0 }, expr, false);
}