/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import SymbolRuntime from '../runtime/symbols'
import RuntimeExpression from '../runtime/expression'
import Environment from '../runtime/environment'
import Optimizer from './optimizer'

const { isLiteral, isSymbol } = Expression;

function Compiler(expr: Expression): RuntimeExpression {
    return Compiler.compile({ staticEnv: Environment() }, expr).runtime;
}

namespace Compiler {
    export type CompiledExpression =
        | { kind: 'value', runtime: RuntimeExpression }
        | { kind: 'symbol', runtime: RuntimeExpression, info: SymbolRuntime.Info }
        | { kind: 'apply', runtime: RuntimeExpression }

    export namespace CompiledExpression {
        export function value(runtime: RuntimeExpression): CompiledExpression { return { kind: 'value', runtime } }
        export function symbol(runtime: RuntimeExpression, info: SymbolRuntime.Info ): CompiledExpression { return { kind: 'symbol', runtime, info } }
        export function apply(runtime: RuntimeExpression): CompiledExpression {
            return { kind: 'apply', runtime };
        }
    }

    export interface CompileContext {
        staticEnv: Environment
    }

    function getRuntimeInfo(name: string): SymbolRuntime.Info {
        if (!SymbolRuntime[name]) throw new Error(`Could not find implementation of symbol '${name}'.`);
        return SymbolRuntime[name];
    }

    export function value(ctx: CompileContext, v: any): CompiledExpression {
        return CompiledExpression.value(RuntimeExpression(v, { isConst: true }));
    }

    export function symbol(ctx: CompileContext, info: SymbolRuntime.Info): CompiledExpression {
        return CompiledExpression.symbol(RuntimeExpression(info.runtime, { isConst: true }), info);
    }

    export function apply(ctx: CompileContext, head: CompiledExpression, args: CompiledExpression[]): CompiledExpression {
        // non-optimized version would work similar to this:
        //   const slots = [void 0, ...args.map(a => a.runtime)];
        //   const f = head.runtime;
        //   return RuntimeExpression(function (env) { slots[0] = env; return f(env).apply(null, slots); }, { id: ctx.id++ });
        return Optimizer(ctx, head, args);
    }

    function onlyStringLiteralsCanBeApplied() {
        throw new Error('Only string literals can be applied.');
    }

    export function compile(ctx: CompileContext, expr: Expression): CompiledExpression {
        if (isLiteral(expr)) {
            return value(ctx, expr);
        }

        if (isSymbol(expr)) {
            return symbol(ctx, getRuntimeInfo(expr.symbol));
        }

        const head = compile(ctx, expr.head);
        const slots: any[] = [];
        if (expr.args) for (let i = 0; i < expr.args.length; i++) slots[i] = compile(ctx, expr.args[i]);
        return apply(ctx, head, slots);
    }
}

export default Compiler