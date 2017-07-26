/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import RuntimeInfo, { SymbolRuntime } from '../runtime/symbols'
import RuntimeExpression from '../runtime/expression'
import Environment from '../runtime/environment'
import * as Optimizer from './optimizer'

export default function compile(expr: Expression): RuntimeExpression {
    return _compile({ id: 0, staticEnv: Environment() }, expr, false).runtime;
}

export type CompiledExpression =
    | { kind: 'value', runtime: RuntimeExpression }
    | { kind: 'symbol', runtime: RuntimeExpression, info: SymbolRuntime.Info }
    | { kind: 'apply', runtime: RuntimeExpression, head: CompiledExpression, args: CompiledExpression[] }

export namespace CompiledExpression {
    export function value(runtime: RuntimeExpression): CompiledExpression { return { kind: 'value', runtime } }
    export function symbol(runtime: RuntimeExpression, info: SymbolRuntime.Info ): CompiledExpression { return { kind: 'symbol', runtime, info } }
    export function apply(runtime: RuntimeExpression, head: CompiledExpression, args: CompiledExpression[]): CompiledExpression {
        return { kind: 'apply', runtime, head, args };
    }
}

export interface CompileContext {
    id: number,
    staticEnv: Environment
}


function getRuntimeInfo(name: string): SymbolRuntime.Info {
    if (!RuntimeInfo[name]) throw new Error(`Could not find implementation of symbol '${name}'.`);
    return RuntimeInfo[name];
}

export function value(ctx: CompileContext, v: any): CompiledExpression {
    return CompiledExpression.value(RuntimeExpression(v, { id: ctx.id++, hint: 'const' }));
}

export function symbol(ctx: CompileContext, info: SymbolRuntime.Info): CompiledExpression {
    return CompiledExpression.symbol(RuntimeExpression(info.runtime, { id: ctx.id++, hint: 'const' }), info);
}

function apply(ctx: CompileContext, head: CompiledExpression, args: CompiledExpression[]): CompiledExpression {
    // non-optimized version would work like this:
    //   const slots = [void 0, ...args.map(a => a.runtime)];
    //   const f = head.runtime;
    //   return RuntimeExpression(function (env) { slots[0] = env; return f(env).apply(null, slots); }, { id: ctx.id++ });
    return Optimizer.apply(ctx, head, args);
}

function onlyStringLiteralsCanBeApplied() {
    throw new Error('Only string literals can be applied.');
}

function _compile(ctx: CompileContext, expr: Expression, isSymbol: boolean): CompiledExpression {
    if (Expression.isLiteral(expr)) {
        if (isSymbol) {
            if (typeof expr !== 'string') onlyStringLiteralsCanBeApplied();
            return symbol(ctx, getRuntimeInfo(expr as string));
        }
        return value(ctx, expr);
    }

    const head = _compile(ctx, expr.symbol, true);
    if (!expr.args || !expr.args.length) return head;

    const slots: any[] = [];
    if (expr.args) for (let i = 0; i < expr.args.length; i++) slots[i] = _compile(ctx, expr.args[i], false);
    return apply(ctx, head, slots);
}