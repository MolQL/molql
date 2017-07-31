/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../mini-lisp/expression'
import Environment from './environment'
import RuntimeExpression from './expression'
import SymbolRuntime, { SymbolTable, RuntimeArguments } from './symbols'

type Compiler<C> = <T>(expression: Expression) => RuntimeExpression<C, T>
function Compiler<C>(symbolTable: SymbolTable): Compiler<C> {
    const env = Environment(symbolTable, void 0);
    return expression => compile(env, expression).runtime;
}

type CompiledExpression = { isConst: boolean, runtime: RuntimeExpression }

namespace CompiledExpression {
    export function Const(value: any): CompiledExpression { return { isConst: true, runtime: RuntimeExpression.constant(value) } }
    export function Dynamic(runtime: RuntimeExpression): CompiledExpression { return { isConst: false, runtime } }
}

type CompiledArguments = CompiledExpression[] | { [name: string]: CompiledExpression }

function noRuntimeFor(symbol: string) {
    throw new Error(`Could not find runtime for symbol '${symbol}'.`);
}

function applySymbolStatic(runtime: SymbolRuntime, args: RuntimeArguments) {
    return CompiledExpression.Dynamic(env => runtime(env, args))
}

function applySymbolDynamic(head: RuntimeExpression, args: RuntimeArguments) {
    return CompiledExpression.Dynamic(env => {
        const value = head(env);
        const symbol = env.symbolTable[value];
        if (!symbol) noRuntimeFor(value);
        return symbol.runtime(env, args);
    })
}

function apply(env: Environment, head: CompiledExpression, args: RuntimeArguments, constArgs: boolean): CompiledExpression {
    if (head.isConst) {
        const value = head.runtime(env);
        const symbol = env.symbolTable[value];
        if (!symbol) throw new Error(`Could not find runtime for symbol '${value}'.`);
        if (symbol.isStatic && constArgs) return CompiledExpression.Const(symbol.runtime(env, args));
        return applySymbolStatic(symbol.runtime, args);
    }
    return applySymbolDynamic(head.runtime, args);
}

function compile(env: Environment, expression: Expression): CompiledExpression {
    if (Expression.isLiteral(expression)) {
        return CompiledExpression.Const(expression);
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