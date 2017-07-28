/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import SymbolRuntime from '../runtime/symbols'
import RuntimeExpression from '../runtime/expression'
import Environment from '../runtime/environment'
import Optimizer from './optimizer'

const { isLiteral, isSymbol } = Expression;

function Compiler<T = any>(expr: Expression): RuntimeExpression<T> {
    return Compiler.compile({ staticEnv: Environment() }, expr).runtime;
}

namespace Compiler {
    export type CompiledExpression =
        | { kind: 'value', runtime: RuntimeExpression, value: any }
        | { kind: 'symbol', runtime: RuntimeExpression, info: SymbolRuntime.Info }
        | { kind: 'apply', runtime: RuntimeExpression }

    export namespace CompiledExpression {
        export function value(value: any): CompiledExpression { return { kind: 'value', runtime: RuntimeExpression(value, { isConst: true }), value } }
        export function symbol(info: SymbolRuntime.Info): CompiledExpression { return { kind: 'symbol', info, runtime: RuntimeExpression(info.runtime, { isConst: true }) } }
        export function apply(runtime: RuntimeExpression): CompiledExpression { return { kind: 'apply', runtime }; }
    }

    export interface CompileContext {
        staticEnv: Environment
    }

    function getRuntimeInfo(name: string): SymbolRuntime.Info {
        if (!SymbolRuntime[name]) throw new Error(`Could not find implementation of symbol '${name}'.`);
        return SymbolRuntime[name];
    }

    export function value(v: any): CompiledExpression {
        return CompiledExpression.value(v);
    }

    export function symbol(ctx: CompileContext, info: SymbolRuntime.Info): CompiledExpression {
        return CompiledExpression.symbol(info);
    }

    export function apply(ctx: CompileContext, head: CompiledExpression, args: CompiledExpression[]): CompiledExpression {
        // non-optimized version would work similar to this:
        //   const slots = [void 0, ...args.map(a => a.runtime)];
        //   const f = head.runtime;
        //   return RuntimeExpression(function (env) { slots[0] = env; return f(env).apply(null, slots); }, { });
        return Optimizer(ctx, head, args);
    }

    function literalsCannotBeApplied() {
        throw new Error('Only symbols and apply expressions can be applied.');
    }

    export function compile(ctx: CompileContext, expr: Expression): CompiledExpression {
        if (isLiteral(expr)) {
            return value(expr);
        }

        if (isSymbol(expr)) {
            return symbol(ctx, getRuntimeInfo(expr.symbol));
        }

        const head = compile(ctx, expr.head);
        if (head.kind === 'value') literalsCannotBeApplied();

        const args: any[] = [];
        if (expr.args) for (let i = 0; i < expr.args.length; i++) args[i] = compile(ctx, expr.args[i]);

        if (head.kind === 'symbol' && head.info.compile) {
            return head.info.compile(ctx, ...args);
        }
        return apply(ctx, head, args);
    }
}

export default Compiler