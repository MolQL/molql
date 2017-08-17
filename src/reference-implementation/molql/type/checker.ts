/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Expression from '../../../mini-lisp/expression'
import Type from '../../../molql/type'
import format from './formatter'
import { SymbolMap, Argument, Arguments } from '../../../molql/symbol'
import { FastMap, UniqueArrayBuilder } from '../../utils/collections'

export default function (symbols: SymbolMap, expr: Expression, type?: Type) {
    typeCheck(symbols, FastMap.create(), expr, type || Type.Any, '');
}

type TypeContextEntry = { type: Type, seen: UniqueArrayBuilder<Type> }
type TypeContext = FastMap<string, TypeContextEntry>

function typeCheck(symbols: SymbolMap, ctx: TypeContext, expr: Expression, type: Type, hint: string) {
    if (Expression.isLiteral(expr)) {
        const l = getLiteralType(expr);
        if (!assignType(ctx, l, type)) notAssignable(ctx, hint, l, type);
    } else if (Expression.isApply(expr) && Expression.isLiteral(expr.head)) {
        const symbol = getSymbol(symbols, expr.head);
        const argsCtx: TypeContext = FastMap.create();
        assignArguments(symbols, argsCtx, symbol.id, expr.args, symbol.args);
        const t = resolveType(argsCtx, symbol.type);
        if (!assignType(ctx, t, type)) notAssignable(ctx, hint, t, type);
    }
}

function getSymbol(symbols: SymbolMap, head: any) {
    const symbol = symbols[head as string];
    if (!symbol) throwError(`'${head}': symbol not found.`);
    return symbol!;
}

function throwError(msg: string) {
    throw new Error(msg);
}

function notAssignable(ctx: TypeContext, hint: string, a: Type, b: Type) {
    throwError(`${hint}${!!hint ? ': ' : ''}type '${format(resolveType(ctx, a))}' is not assignable to '${format(resolveType(ctx, b))}'.`);
}

function assignArguments(symbols: SymbolMap, ctx: TypeContext, symbolId: string, exprArgs: Expression.Arguments | undefined, args: Arguments): void {
    if (args.kind === 'list') {
        if (!exprArgs) {
            if (args.nonEmpty) throwError(`'${symbolId}': at least one argument required.`);
            return;
        }
        if (!Expression.isArgumentsArray(exprArgs)) {
            throwError(`'${symbolId}': accepts array arguments (got object).`);
            return;
        }
        if (args.nonEmpty && !exprArgs.length) throwError(`'${symbolId}': at least one argument required.`);
        let i = 0;
        for (const a of exprArgs) {
            typeCheck(symbols, ctx, a, args.type, `'${symbolId}', arg ${i++}`);
        }
    } else {
        const keys = Object.keys(args.map);
        let isArrayLike = true, i = 0;
        let optionalCount = 0;
        for (const k of keys) {
            const arg = (args.map as any)[k] as Argument;
            if (isNaN(k as any) || +k !== i) isArrayLike = false;
            if (arg.isOptional) optionalCount++;
            i++;
        }

        if (!exprArgs) {
            if (i - optionalCount > 0) throwError(`'${symbolId}': argument(s) required.`);
            return;
        }

        if (Expression.isArgumentsArray(exprArgs)) {
            if (exprArgs.length < i - optionalCount) {
                throwError(`'${symbolId}': more arguments required.`);
            }
        }

        for (const k of Object.keys(exprArgs)) {
            if (!(args.map as any)[k]) throwError(`'${symbolId}': unknown arg ':${k}'.`);
        }

        for (const k of keys) {
            const arg = (args.map as any)[k] as Argument;
            const e = (exprArgs as any)[k];
            if (e === void 0) {
                if (!arg.isOptional) throwError(`'${symbolId}': arg ':${k}' is required.`);
                continue;
            }
            typeCheck(symbols, ctx, e, arg.type, `'${symbolId}', arg ':${k}'`);
        }
    }
}

function hasVariables(type: Type): boolean {
    switch (type.kind) {
        case 'variable': return true;
        case 'value':
        case 'any':
        case 'any-value': return false;
        case 'container': return hasVariables(type.child);
        case 'union': {
            for (let t of type.types) {
                if (hasVariables(t)) return true;
            }
            return false;
        }
    }
}

function getLiteralType(expr: Expression.Literal) {
    switch (typeof expr) {
        case 'number': return Type.Num;
        case 'string': return Type.Str;
        case 'boolean': return Type.Bool;
        default: return Type.Any;
    }
}

function assignType(ctx: TypeContext, a: Type, b: Type): boolean {
    if (a.kind === 'variable') {
        let t = a.type;
        if (a.isConstraint) {
            if (ctx.has(a.name)) t = ctx.get(a.name)!.type;
            else return assignType(ctx, b, a);
        }
        return assignType(ctx, t, b);
    }

    switch (b.kind) {
        case 'any': return true;
        case 'any-value': return a.kind === 'value' || a.kind === 'any-value';
        case 'value': return a.kind === 'value' && a.name === b.name && a.namespace === b.namespace;
        case 'container': return a.kind === 'container' && a.name === b.name && a.namespace === b.namespace && assignType(ctx, a.child, b.child);
        case 'union': {
            if (a.kind === 'union') {
                for (let t of a.types) {
                    if (!assignType(ctx, t, b)) return false;
                }
                return true;
            } else {
                for (let t of b.types) {
                    if (!assignType(ctx, a, t)) return true;
                }
                return false;
            }
        }
        case 'variable': {
            if (!assignType(ctx, a, b.type)) return false;
            if (ctx.has(b.name)) {
                const e = ctx.get(b.name)!;
                if (b.isConstraint && !assignType(ctx, a, e.type)) return false;
                if (UniqueArrayBuilder.add(e.seen, format(a), a)) e.type = Type.Union(e.seen.array);
            } else {
                const e: TypeContextEntry = { type: a, seen: UniqueArrayBuilder() };
                UniqueArrayBuilder.add(e.seen, format(a), a);
                ctx.set(b.name, e);
            }
            return true;
        }
    }
}

function _resolve(this: TypeContext, c: Type) { return resolveType(this, c) }
function resolveType(ctx: TypeContext, t: Type): Type {
    if (!hasVariables(t)) return t;

    switch (t.kind) {
        case 'variable': {
            if (ctx.has(t.name)) return ctx.get(t.name)!.type;
            return t;
        }
        case 'container': return Type.Container(t.namespace, t.name, resolveType(ctx, t.child));
        case 'union': return Type.Union(t.types.map(_resolve, ctx));
        default: return t;
    }
}