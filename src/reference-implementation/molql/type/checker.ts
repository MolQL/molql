/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Expression from '../../../mini-lisp/expression'
import Type from '../../../molql/type'
import exprFormatter from '../../mini-lisp/expression-formatter'
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
        if (!assignType(ctx, expr, l, type)) notAssignable(ctx, hint, expr, l, type);
    } else if (Expression.isApply(expr) && Expression.isLiteral(expr.head)) {
        const symbol = getSymbol(symbols, expr.head);
        const argsCtx: TypeContext = FastMap.create();
        assignArguments(symbols, argsCtx, symbol.id, expr.args, symbol.args);
        const t = resolveType(argsCtx, symbol.type);
        if (!assignType(ctx, expr, t, type)) notAssignable(ctx, hint, expr, t, type);
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

function notAssignable(ctx: TypeContext, hint: string, expr: Expression, a: Type, b: Type) {
    const e = exprFormatter(expr).substr(0, 10).replace(/\n.*/g, '');
    const oneof = b.kind === 'oneof' ? ` Value must be one of: ${Type.oneOfValues(b).join(', ')}.` : '';
    throwError(`${hint}${!!hint ? ': ' : ''}type '${format(resolveType(ctx, a))}' in '${e}' is not assignable to '${format(resolveType(ctx, b))}'.${oneof}`);
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
        let isArrayLike = true, i = 0, isAnyRest = false;
        let optionalCount = 0;
        for (const k of keys) {
            const arg = (args.map as any)[k] as Argument;
            if (isNaN(k as any) || +k !== i) isArrayLike = false;
            if (arg.isOptional) optionalCount++;
            if (arg.isRest) isAnyRest = true;
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
            if (!(args.map as any)[k]) {
                if (isNaN(k as any) || !isAnyRest) throwError(`'${symbolId}': unknown arg ':${k}'.`);
            }
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
        case 'any-value':
        case 'oneof': return false;
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

function assignType(ctx: TypeContext, value: Expression, a: Type, b: Type): boolean {
    if (a.kind === 'variable') {
        let t = a.type;
        if (a.isConstraint) {
            if (ctx.has(a.name)) t = ctx.get(a.name)!.type;
            else return assignType(ctx, value, b, a);
        }
        return assignType(ctx, value, t, b);
    }

    switch (b.kind) {
        case 'any': return true;
        case 'any-value': return a.kind === 'value' || a.kind === 'any-value' || a.kind === 'oneof';
        case 'value': {
            if (a.kind === 'value') return a.name === b.name && a.namespace === b.namespace;
            else if (a.kind === 'oneof') return a.type.name === b.name && a.type.namespace === b.namespace;
            return false;
        }
        case 'container': return a.kind === 'container' && a.name === b.name && a.namespace === b.namespace && assignType(ctx, value, a.child, b.child);
        case 'union': {
            if (a.kind === 'union') {
                for (let t of a.types) {
                    if (!assignType(ctx, value, t, b)) return false;
                }
                return true;
            } else {
                for (let t of b.types) {
                    if (!assignType(ctx, value, a, t)) return true;
                }
                return false;
            }
        }
        case 'oneof': {
            if (a.kind === 'oneof') {
                if (a.namespace === b.namespace && a.name === b.name) return true;
                const keys = Object.keys(a.values);
                let hasAll = true;
                for (const k of keys) {
                    if (a.values[k] && !b.values[k]) {
                        hasAll = false;
                        break;
                    }
                }
                if (hasAll) return true;
                if (Expression.isLiteral(value) && b.values[value as any]) return true;
                return false;
            } else if (Expression.isLiteral(value)) {
                return !!b.values[value as any];
            } else return true;
        }
        case 'variable': {
            if (!assignType(ctx, value, a, b.type)) return false;
            if (ctx.has(b.name)) {
                const e = ctx.get(b.name)!;
                if (b.isConstraint && !assignType(ctx, value, a, e.type)) return false;
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