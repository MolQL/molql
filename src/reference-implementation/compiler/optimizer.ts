/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import { SymbolRuntime } from '../runtime/symbols'
import RuntimeExpression from '../runtime/expression'
import Environment from '../runtime/environment'
import * as Compiler from './compile'

import CompiledExpression = Compiler.CompiledExpression

function _apply(head: RuntimeExpression, slots: any[]): RuntimeExpression {
    return function (env) { slots[0] = env; return head(env).apply(null, slots); };
}

function compileRuntime(head: RuntimeExpression, args: RuntimeExpression[]): RuntimeExpression {
    // An optimization to call a function directly for a low number of arguments.
    // results in about 15% faster function calls.
    switch (args.length) {
        case 0: return function (env) { return head(env)(env); };
        case 1: return function (env) { return head(env)(env, args[0]); };
        case 2: return function (env) { return head(env)(env, args[0], args[1]); };
        case 3: return function (env) { return head(env)(env, args[0], args[1], args[2]); };
        case 4: return function (env) { return head(env)(env, args[0], args[1], args[2], args[3]); };
        case 5: return function (env) { return head(env)(env, args[0], args[1], args[2], args[3], args[4]); };
        default: return _apply(head, [void 0, ...args]);
    }
}

function isStatic(expr: CompiledExpression) {
    return expr.kind === 'value' || (expr.kind === 'symbol' && expr.info.attributes.indexOf('static-expr') >= 0);
}

function isLoopInvariant(expr: CompiledExpression) {
    return expr.kind === 'value' || (expr.kind === 'symbol' && expr.info.attributes.indexOf('loop-invariant') >= 0);
}

export function apply(ctx: Compiler.CompileContext, head: CompiledExpression, args: CompiledExpression[]): CompiledExpression {
    const runtime = compileRuntime(head.runtime, args.map(a => a.runtime));

    // collapse static nodes
    if (isStatic(head) && args.every(a => isStatic(a))) {
        const value = runtime(ctx.staticEnv);
        return Compiler.value(ctx, value);
    }

    return CompiledExpression.apply(RuntimeExpression(runtime, { id: ctx.id++, hint: isLoopInvariant(head) ? 'loop-invariant' : void 0 }), head, args);
}