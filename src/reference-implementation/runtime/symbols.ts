// /*
//  * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
//  */

// import Symbols, { SymbolInfo } from '../../language/symbols'
// import Environment from './environment'
// import Context from '../query/context'
// import RuntimeExpression from './expression'
// import { ElementSymbol } from '../molecule/data'
// import AtomSet from '../query/atom-set'
// import AtomSelection from '../query/atom-selection'
// import { atomGroupsGenerator } from './molecule/generators'
// import * as MolQueryProperties from './molecule/properties'
// import * as MolQueryFilters from './molecule/filters'
// import * as MolQueryModifiers from './molecule/modifiers'
// import { FastSet, FastMap } from '../utils/collections'
// import Compiler from '../compiler/compiler'

// namespace SymbolRuntime {
//     export type Func = (env: Environment, ...args: RuntimeExpression[]) => any
//     export type Compile = (ctx: Compiler.CompileContext, ...args: Compiler.CompiledExpression[]) => Compiler.CompiledExpression

//     export type Attribute =
//         | 'static-expr' // static expressions are independent from context if their children are also independent from context.

//     export interface Info {
//         symbol: SymbolInfo,
//         runtime: Func,
//         compile: Compile | undefined,
//         attributes: Attribute[]
//     }
// }

// type SymbolRuntimeDefinition = {
//     runtime: SymbolRuntime.Func,
//     compile?: SymbolRuntime.Compile,
//     attributes?: SymbolRuntime.Attribute[]
// }

// type CompileInfo = [SymbolInfo, SymbolRuntimeDefinition]
// const symbolDefinitions: CompileInfo[] = [
//     ////////////////////////////////////
//     // Primitives

//     // ============= CONSTRUCTORS =============
//     [Symbols.primitive.type.bool, staticFunc((env, v) => !!v(env))],
//     [Symbols.primitive.type.number, staticFunc((env, v) => +v(env))],
//     [Symbols.primitive.type.str, staticFunc((env, v) => '' + v(env))],
//     [
//         Symbols.primitive.type.list,
//         staticFunc(function (env) {
//             const list: any[] = [];
//             for (let i = 1; i < arguments.length; i++) list[list.length] = arguments[i](env);
//             return list;
//         })
//     ],
//     [
//         Symbols.primitive.type.set,
//         staticFunc(function(env) {
//             const set = FastSet.create<any>();
//             for (let i = 1; i < arguments.length; i++) set.add(arguments[i](env));
//             return set;
//         })
//     ],
//     [
//         Symbols.primitive.type.map,
//         staticFunc(function (env) {
//             const map = FastMap.create<any, any>();
//             for (let i = 1; i < arguments.length; i += 2) map.set(arguments[i](env), arguments[i + 1](env));
//             return map;
//         })
//     ],
//     [Symbols.primitive.type.regex, staticFunc((env, expr, flags) => new RegExp(expr(env), flags ? flags(env) : ''))],

//     // ============= OPERATORS =============

//     // ============= LOGIC ================
//     [Symbols.primitive.operator.logic.not, staticFunc((env, x) => !x(env))],
//     [
//         Symbols.primitive.operator.logic.and,
//         staticFunc(function (env) {
//             for (let i = 1; i < arguments.length; i++) if (!arguments[i](env)) return false;
//             return true;
//         })
//     ],
//     [
//         Symbols.primitive.operator.logic.or,
//         staticFunc(function (env) {
//             for (let i = 1; i < arguments.length; i++) if (arguments[i](env)) return true;
//             return false;
//         })
//     ],

//     // ============= RELATIONAL ================
//     [Symbols.primitive.operator.relational.eq, staticFunc((env, x, y) => x(env) === y(env))],
//     [Symbols.primitive.operator.relational.neq, staticFunc((env, x, y) => x(env) !== y(env))],
//     [Symbols.primitive.operator.relational.lt, staticFunc((env, x, y) => x(env) < y(env))],
//     [Symbols.primitive.operator.relational.lte, staticFunc((env, x, y) => x(env) <= y(env))],
//     [Symbols.primitive.operator.relational.gr, staticFunc((env, x, y) => x(env) > y(env))],
//     [Symbols.primitive.operator.relational.gre, staticFunc((env, x, y) => x(env) >= y(env))],
//     [Symbols.primitive.operator.relational.inRange, staticFunc((env, x, a, b) => { const v = x(env); return v >= a(env) && v <= b(env) })],

//     // ============= ARITHMETIC ================
//     [
//         Symbols.primitive.operator.arithmetic.add,
//         staticFunc(function(env) {
//             let ret = 0;
//             for (let i = 1; i < arguments.length; i++) ret += arguments[i](env);
//             return ret;
//         })
//     ],
//     [Symbols.primitive.operator.arithmetic.sub, staticFunc((env, x, y) => x(env) - y(env))],
//     [Symbols.primitive.operator.arithmetic.minus, staticFunc((env, x) => -x(env))],
//     [
//         Symbols.primitive.operator.arithmetic.mult,
//         staticFunc(function(env) {
//             let ret = 1;
//             for (let i = 1; i < arguments.length; i++) ret *= arguments[i](env);
//             return ret;
//         })
//     ],
//     [Symbols.primitive.operator.arithmetic.div, staticFunc((env, x, y) => x(env) / y(env))],
//     [Symbols.primitive.operator.arithmetic.pow, staticFunc((env, x, y) => Math.pow(x(env), y(env)))],
//     [
//         Symbols.primitive.operator.arithmetic.min,
//         staticFunc(function(env) {
//             let ret = 0;
//             for (let i = 1; i < arguments.length; i++) ret = Math.min(arguments[i](env), ret);
//             return ret;
//         })
//     ],
//     [
//         Symbols.primitive.operator.arithmetic.max,
//         staticFunc(function(env) {
//             let ret = 0;
//             for (let i = 1; i < arguments.length; i++) ret = Math.max(arguments[i](env), ret);
//             return ret;
//         })
//     ],
//     [Symbols.primitive.operator.arithmetic.floor, unaryFunc(Math.floor)],
//     [Symbols.primitive.operator.arithmetic.ceil, unaryFunc(Math.ceil)],
//     [Symbols.primitive.operator.arithmetic.roundInt, unaryFunc(Math.round)],
//     [Symbols.primitive.operator.arithmetic.abs, unaryFunc(Math.abs)],
//     [Symbols.primitive.operator.arithmetic.sin, unaryFunc(Math.sin)],
//     [Symbols.primitive.operator.arithmetic.cos, unaryFunc(Math.cos)],
//     [Symbols.primitive.operator.arithmetic.tan, unaryFunc(Math.tan)],
//     [Symbols.primitive.operator.arithmetic.asin, unaryFunc(Math.asin)],
//     [Symbols.primitive.operator.arithmetic.acos, unaryFunc(Math.acos)],
//     [Symbols.primitive.operator.arithmetic.atan, unaryFunc(Math.atan)],
//     [Symbols.primitive.operator.arithmetic.atan2, staticFunc((env, x, y) => Math.atan2(x(env), y(env)))],
//     [Symbols.primitive.operator.arithmetic.sinh, unaryFunc(Math.sinh)],
//     [Symbols.primitive.operator.arithmetic.cosh, unaryFunc(Math.cosh)],
//     [Symbols.primitive.operator.arithmetic.tanh, unaryFunc(Math.tanh)],
//     [Symbols.primitive.operator.arithmetic.exp, unaryFunc(Math.exp)],
//     [Symbols.primitive.operator.arithmetic.log, unaryFunc(Math.log)],
//     [Symbols.primitive.operator.arithmetic.log10, unaryFunc(Math.log10)],

//     // ============= STRING ================
//     [
//         Symbols.primitive.operator.string.concat,
//         staticFunc(function(env) {
//             const ret: string[] = [];
//             for (let i = 1; i < arguments.length; i++) ret.push('' + arguments[i](env));
//             return ret.join('');
//         })
//     ],
//     [
//         Symbols.primitive.operator.string.match,
//         staticFunc((env, regex: RuntimeExpression<RegExp>, str: RuntimeExpression<string>) => regex(env).test(str(env)))
//     ],

//     // ============= SET ================
//     [Symbols.primitive.operator.set.has, staticFunc((env, set: RuntimeExpression<Set<any>>, v) => set(env).has(v(env)))],

//     // ============= MAP ================
//     [
//         Symbols.primitive.operator.map.get,
//         staticFunc((env, map: RuntimeExpression<Map<any, any>>, key, def) => {
//             const m = map(env), k = key(env);
//             if (m.has(k)) return m.get(k);
//             return def(env);
//         })
//     ],

//     ////////////////////////////////////
//     // Structure

//     // ============= CONSTRUCTORS =============
//     [Symbols.structure.constructor.elementSymbol, staticFunc((env, s: RuntimeExpression<string>) => ElementSymbol(s(env)))],

//     // ============= ATTRIBUTES =============
//     [Symbols.structure.property.atomStatic, compiledFunc((ctx, name) => MolQueryProperties.staticAtomProperty(ctx, getCompiledValue(name)))],

//     // ============= GENERATORS =============
//     [
//         Symbols.structure.generator.atomGroups,
//         func((env, entityP, chainP, residueP, atomP, groupBy) => atomGroupsGenerator(env, { entityP, chainP, residueP, atomP,  groupBy }))
//     ],

//     // ============= FILTERS =============
//     [Symbols.structure.filter.pick, func(MolQueryFilters.pick)],
//     [Symbols.structure.filter.within, func(MolQueryFilters.within)],
//     [Symbols.structure.filter.withSameProperties, func(MolQueryFilters.withProperties)],

//     // ============= MODIFIERS =============
//     [Symbols.structure.modifier.queryEach, func(MolQueryModifiers.queryEach)],
//     [Symbols.structure.modifier.includeSurroundings, func(MolQueryModifiers.includeSurroundings)],

//     // ============= ATOM SETS =============
//     [Symbols.structure.atomSet.atomCount, func(env => AtomSet.count(env.atomSet.value))],
//     [Symbols.structure.atomSet.reduce.accumulator, func(MolQueryProperties.accumulateAtomSet)],
//     [Symbols.structure.atomSet.reduce.value, func(env => env.atomSetReducer.value)],
// ];

// function func(runtime: SymbolRuntime.Func): SymbolRuntimeDefinition {
//     return { runtime }
// }

// function staticFunc(runtime: SymbolRuntime.Func): SymbolRuntimeDefinition {
//     return { runtime, attributes: ['static-expr'] }
// }

// function compiledFunc(compile: SymbolRuntime.Compile): SymbolRuntimeDefinition {
//     return { runtime: (env) => { throw new Error('Cannot execute runtime of a compiled symbol.') }, compile, attributes: ['static-expr'] }
// }

// function getCompiledValue(e: Compiler.CompiledExpression) {
//     if (e.kind === 'value') return e.value;
//     throw new Error('Expected value.');
// }

// function unaryFunc(f: (v: any) => any): SymbolRuntimeDefinition {
//     return staticFunc((env, v) => f(v(env)));
// }

// export const SymbolTable: SymbolRuntime.Info[] = [];
// const SymbolRuntime = (function () {
//     const table: { [name: string]: SymbolRuntime.Info } = Object.create(null);
//     for (const s of symbolDefinitions) {
//         const name = s[0].name;
//         if (table[name]) {
//             throw new Error(`You've already implemented ${name}, dummy.`);
//         }
//         const info: SymbolRuntime.Info = { symbol: s[0], runtime: s[1].runtime, attributes: s[1].attributes || [], compile: s[1].compile };
//         table[name] = info;
//         SymbolTable.push(info);
//     }
//     return table;
// })();

// type SymbolRuntime = typeof SymbolRuntime
// export default SymbolRuntime