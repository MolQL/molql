/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../mini-lisp/expression'
import Environment from './environment'
import RuntimeExpression from './expression'
import SymbolRuntime, { SymbolTable, RuntimeArguments } from './symbol'

export type CompiledExpression<C, T> = (ctx: C) => T

type Compiler<C> = <T>(expression: Expression) => CompiledExpression<C, T>
function Compiler<C>(symbolTable: SymbolTable): Compiler<C> {
    const env = Environment(symbolTable, void 0);
    return expression => wrap(symbolTable, compile(env, expression).runtime);
}

type CompileResult = { isConst: boolean, runtime: RuntimeExpression }

namespace CompileResult {
    export function Const(value: any): CompileResult { return { isConst: true, runtime: RuntimeExpression.constant(value) } }
    export function Dynamic(runtime: RuntimeExpression): CompileResult { return { isConst: false, runtime } }
}

type CompiledArguments = CompileResult[] | { [name: string]: CompileResult }

function wrap<C, T>(symbolTable: SymbolTable, runtime: RuntimeExpression<C, T>) {
    return (ctx: C) => runtime(Environment(symbolTable, ctx));
}

function noRuntimeFor(symbol: string) {
    throw new Error(`Could not find runtime for symbol '${symbol}'.`);
}

function applySymbolStatic(runtime: SymbolRuntime, args: RuntimeArguments) {
    return CompileResult.Dynamic(env => runtime(env, args))
}

function applySymbolDynamic(head: RuntimeExpression, args: RuntimeArguments) {
    return CompileResult.Dynamic(env => {
        const value = head(env);
        const symbol = env.symbolTable[value];
        if (!symbol) noRuntimeFor(value);
        return symbol.runtime(env, args);
    })
}

function apply(env: Environment, head: CompileResult, args: RuntimeArguments, constArgs: boolean): CompileResult {
    if (head.isConst) {
        const value = head.runtime(env);
        const symbol = env.symbolTable[value];
        if (!symbol) throw new Error(`Could not find runtime for symbol '${value}'.`);
        if (symbol.attributes.isStatic && constArgs) return CompileResult.Const(symbol.runtime(env, args));
        return applySymbolStatic(symbol.runtime, args);
    }
    return applySymbolDynamic(head.runtime, args);
}

function compile(env: Environment, expression: Expression): CompileResult {
    if (Expression.isLiteral(expression)) {
        return CompileResult.Const(expression);
    }

    const head = compile(env, expression.head);
    if (!expression.args) {
        return apply(env, head, [], true);
    } else if (Expression.isArgumentsArray(expression.args)) {
        const args = [];
        let constArgs = false;
        for (const arg of expression.args) {
            const compiled = compile(env, arg);
            constArgs = constArgs && compiled.isConst;
            args.push(compiled.runtime);
        }
        return apply(env, head, args, constArgs);
    } else {
        const args = Object.create(null);
        let constArgs = false;
        for (const key of Object.keys(expression.args)) {
            const compiled = compile(env, expression.args[key]);
            constArgs = constArgs && compiled.isConst;
            args[key] = compiled.runtime;
        }
        return apply(env, head, args, constArgs);
    }
}

export default Compiler