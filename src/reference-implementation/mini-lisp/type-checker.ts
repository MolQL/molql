/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../mini-lisp/expression'
import Type from '../../mini-lisp/type'
import { SymbolMap /*, Argument, Arguments */ } from '../../mini-lisp/symbol'

export default function typeCheck(symbols: SymbolMap, expr: Expression, type?: Type) {
    //_typeCheck(symbols, expr, type || Type.Any, '');
}

// function _typeCheck(symbols: SymbolMap, expr: Expression, type: Type, hint: string) {
//     const t = getType(symbols, expr);
//     if (!isTypeAssignable(t, type)) {
//         throwError(`${hint}${!!hint ? ': ' : ''}expected ${type.name}, got ${t.name}.`);
//     }
//     if (Expression.isApply(expr) && Expression.isLiteral(expr.head)) {
//         const symbol = getSymbol(symbols, expr.head);
//         isAssignableTo(symbols, symbol.id, expr.args, symbol.args);
//     }
//     return t;
// }

// function getSymbol(symbols: SymbolMap, head: any) {
//     const symbol = symbols[head as string];
//     if (!symbol) throwError(`'${head}': symbol not found.`);
//     return symbol!;
// }

// function throwError(msg: string) {
//     throw new Error(msg);
// }

// function isAssignableTo(symbols: SymbolMap, symbolId: string, exprArgs: Expression.Arguments | undefined, args: Arguments) {
//     if (args.kind === 'list') {
//         if (!exprArgs) {
//             if (args.nonEmpty) throwError(`'${symbolId}': at least one argument required.`);
//             return;
//         }
//         if (!Expression.isArgumentsArray(exprArgs)) {
//             throwError(`'${symbolId}': accepts array arguments (got object).`);
//             return;
//         }
//         if (args.nonEmpty && !exprArgs.length) throwError(`'${symbolId}': at least one argument required.`);
//         let i = 0;
//         for (const a of exprArgs) {
//             _typeCheck(symbols, a, args.type, `'${symbolId}', arg ${i++}`);
//         }
//     } else {
//         const keys = Object.keys(args.map);
//         if (!exprArgs) {
//             if (keys.length && !keys.every(k => ((args.map as any)[k] as Argument).isOptional)) throwError(`'${symbolId}': argument(s) required.`);
//             return;
//         }
//         let isArrayLike = true, i = 0;
//         for (const k of keys) {
//             if (isNaN(k as any) || +k !== i) {
//                 isArrayLike = false;
//                 break;
//             }
//             i++;
//         }

//         if (Expression.isArgumentsArray(exprArgs)) {
//             if (!isArrayLike) {
//                 throwError(`'${symbolId}': accepts object/named arguments (got object).`);
//             }
//             if (exprArgs.length < i) {
//                 throwError(`'${symbolId}': more arguments required.`);
//             }
//         }

//         const typeVariables: { [name: string]: Type } = Object.create(null);
//         for (const k of keys) {
//             const arg = (args.map as any)[k] as Argument;
//             const e = (exprArgs as any)[k];
//             if (e === void 0) {
//                 if (!arg.isOptional) throwError(`'${symbolId}': arg ':${k}' is required.`);
//                 continue;
//             }
//             const t = _typeCheck(symbols, e, arg.type, `'${symbolId}', arg ':${k}'`);
//             if (arg.typeName) {
//                 if (typeVariables[arg.typeName]) {
//                     if (!isTypeAssignable(t, typeVariables[arg.typeName])) {
//                         throwError(`'${symbolId}', arg ':${k}': exprected ${typeVariables[arg.typeName].name}, got ${t.name}.`);
//                     }
//                 } else {
//                     typeVariables[arg.typeName] = t;
//                 }
//             }
//         }
//     }
// }

// function getType(symbols: SymbolMap, expr: Expression) {
//     if (Expression.isLiteral(expr)) {
//         switch (typeof expr) {
//             case 'number': return Type.Num;
//             case 'string': return Type.Str;
//             case 'boolean': return Type.Bool;
//             default: return Type.Any;
//         }
//     }
//     if (Expression.isLiteral(expr.head)) {
//         const symbol = getSymbol(symbols, expr.head);
//         if (!symbol) throwError(`'${expr.head}': symbol not found.`);

//         return symbol.type;
//     }
//     return Type.Any;
// }

// function isTypeAssignable(a: Type, b: Type) {
//     if (!a.parent) return true;
//     let current: Type | undefined = a;
//     while (current) {
//         if (current.name === b.name && current.namespace === b.namespace) return true;
//         current = current.parent;
//     }
//     return false;
// }

