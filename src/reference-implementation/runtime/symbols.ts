/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbols, { SymbolInfo } from '../../language/symbols'
import { FastSet, FastMap } from '../utils/collections'
import Environment from './environment'
import RuntimeExpression from './expression'

// import * as Query from '../query/data-model'
// import * as RuntimeHelpers from '../runtime/helpers'
// import * as QueryHelpers from '../query/helpers'

// export type RuntimeExpression<T = any> = (env: Environment, ...args: RuntimeExpression[]) => T

export type SymbolRuntime<T = any> = (env: Environment, ...args: RuntimeExpression[]) => T

export type Attribute =
    | 'static-expr' // static expressions are independent from context if their children are also independent from context.
    | 'loop-invariant' // can be cached in loops becuase it will always yield the same answer

const staticAttribute: Attribute[] = ['static-expr']

type CompileInfo = [SymbolInfo, SymbolRuntime] | [SymbolInfo, SymbolRuntime, Attribute[]]
const symbols: CompileInfo[] = [
    ////////////////////////////////////
    // Primitives

    // ============= CONSTRUCTORS =============
    [
        Symbols.primitive.constructor.list,
        function (env) {
            const list: any[] = [];
            for (let i = 1; i < arguments.length; i++) list[list.length] = arguments[i](env);
            return list;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.constructor.set,
        function(env) {
            const set = FastSet.create();
            for (let i = 1; i < arguments.length; i++) set.add(arguments[i](env));
            return set;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.constructor.map,
        function (env) {
            const map = FastMap.create<any, any>();
            for (let i = 1; i < arguments.length; i += 2) map.set(arguments[i](env), arguments[i + 1](env));
            return map;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.constructor.regex,
        (env, expr, flags) => new RegExp(expr(env), flags ? flags(env) : ''),
        staticAttribute
    ],

    // ============= FUNCTIONAL =============
    [
        Symbols.primitive.functional.partial,
        function (env, f: RuntimeExpression<Function>) {
            const func = f(env);
            const first: any[] = [void 0];
            for (let i = 2; i < arguments.length; i++) first[i - 1] = arguments[i];
            return function (env: Environment) {
                const second = [...first];
                second[0] = env;
                for (let i = 1; i < arguments.length; i++) second.push(arguments[i]);
                return func.apply(null, second);
            };
        }
    ],
    [Symbols.primitive.functional.slot, (env, index: RuntimeExpression<number>) => env.slots[index(env)].value],

    // ============= OPERATORS =============
    [Symbols.primitive.operator.logic.not, (env, x) => !x(env), staticAttribute],
    [
        Symbols.primitive.operator.logic.and,
        function (env) {
            for (let i = 1; i < arguments.length; i++) if (!arguments[i](env)) return false;
            return true;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.operator.logic.or,
        function (env) {
            for (let i = 1; i < arguments.length; i++) if (arguments[i](env)) return true;
            return false;
        },
        staticAttribute
    ],

    [Symbols.primitive.operator.relational.eq, (env, x, y) => x(env) === y(env), staticAttribute],
    [Symbols.primitive.operator.relational.neq, (env, x, y) => x(env) !== y(env), staticAttribute],
    [Symbols.primitive.operator.relational.lt, (env, x, y) => x(env) < y(env), staticAttribute],
    [Symbols.primitive.operator.relational.lte, (env, x, y) => x(env) <= y(env), staticAttribute],
    [Symbols.primitive.operator.relational.gr, (env, x, y) => x(env) > y(env), staticAttribute],
    [Symbols.primitive.operator.relational.gre, (env, x, y) => x(env) >= y(env), staticAttribute],
    [
        Symbols.primitive.operator.relational.inRange,
        (env, x, a, b) => { const v = x(env); return v >= a(env) && v <= b(env) },
        staticAttribute
    ],

    [
        Symbols.primitive.operator.arithmetic.add,
        function(env) {
            let ret = 0;
            for (let i = 1; i < arguments.length; i++) ret += arguments[i](env);
            return ret;
        },
        staticAttribute
    ],
    [Symbols.primitive.operator.arithmetic.sub, (env, x, y) => x(env) - y(env), staticAttribute],
    [Symbols.primitive.operator.arithmetic.minus, (env, x) => -x(env), staticAttribute],
    [
        Symbols.primitive.operator.arithmetic.mult,
        function(env) {
            let ret = 1;
            for (let i = 1; i < arguments.length; i++) ret *= arguments[i](env);
            return ret;
        },
        staticAttribute
    ],
    [Symbols.primitive.operator.arithmetic.div, (env, x, y) => x(env) / y(env), staticAttribute],
    [Symbols.primitive.operator.arithmetic.pow, (env, x, y) => Math.pow(x(env), y(env)), staticAttribute],
    [
        Symbols.primitive.operator.arithmetic.min,
        function(env) {
            let ret = 0;
            for (let i = 1; i < arguments.length; i++) ret = Math.min(arguments[i](env), ret);
            return ret;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.operator.arithmetic.max,
        function(env) {
            let ret = 0;
            for (let i = 1; i < arguments.length; i++) ret = Math.max(arguments[i](env), ret);
            return ret;
        },
        staticAttribute
    ],
    unary(Symbols.primitive.operator.arithmetic.floor, Math.floor),
    unary(Symbols.primitive.operator.arithmetic.ceil, Math.ceil),
    unary(Symbols.primitive.operator.arithmetic.roundInt, Math.round),
    unary(Symbols.primitive.operator.arithmetic.abs, Math.abs),
    unary(Symbols.primitive.operator.arithmetic.sin, Math.sin),
    unary(Symbols.primitive.operator.arithmetic.cos, Math.cos),
    unary(Symbols.primitive.operator.arithmetic.tan, Math.tan),
    unary(Symbols.primitive.operator.arithmetic.asin, Math.asin),
    unary(Symbols.primitive.operator.arithmetic.acos, Math.acos),
    unary(Symbols.primitive.operator.arithmetic.atan, Math.atan),
    [Symbols.primitive.operator.arithmetic.atan2, (env, x, y) => Math.atan2(x(env), y(env)), staticAttribute],
    unary(Symbols.primitive.operator.arithmetic.sinh, Math.sinh),
    unary(Symbols.primitive.operator.arithmetic.cosh, Math.cosh),
    unary(Symbols.primitive.operator.arithmetic.tanh, Math.tanh),
    unary(Symbols.primitive.operator.arithmetic.exp, Math.exp),
    unary(Symbols.primitive.operator.arithmetic.log, Math.log),
    unary(Symbols.primitive.operator.arithmetic.log10, Math.log10),

    [
        Symbols.primitive.operator.string.concat,
        function(env) {
            const ret: string[] = [];
            for (let i = 1; i < arguments.length; i++) ret.push('' + arguments[i](env));
            return ret.join('');
        },
        staticAttribute
    ],

    [
        Symbols.primitive.operator.collections.inSet,
        (env, set: RuntimeExpression<FastSet<any>>, v) => set(env).has(v(env)),
        staticAttribute
    ],
    [
        Symbols.primitive.operator.collections.mapGet,
        (env, map: RuntimeExpression<FastMap<any, any>>, key, def) => {
            const m = map(env), k = key(env);
            if (m.has(k)) return m.get(k);
            return def(env);
        },
        staticAttribute
    ],

    // ////////////////////////////////////
    // // Structure

    // // ============= CONSTRUCTORS =============
    // [
    //     Symbols.structure.constructor.elementSymbol,
    //     (env, s: RuntimeExpression<string>) => RuntimeHelpers.normalizeElementSymbol(s(env)),
    //     staticAttribute
    // ],

    // // ============= ATOM PROPERTIES =============
    // [
    //     Symbols.structure.property.atom.uniqueId,
    //     env => env.element.value.atom
    // ],
    // [
    //     Symbols.structure.property.atom.id,
    //     env => env.columns.id.getInteger(env.element.value.atom)
    // ],
    // [
    //     Symbols.structure.property.atom.label_atom_id,
    //     env => env.columns.label_asym_id.getString(env.element.value.atom)
    // ],
    // [
    //     Symbols.structure.property.atom.type_symbol,
    //     env => RuntimeHelpers.normalizeElementSymbol(env.columns.type_symbol.getString(env.element.value.atom))
    // ],
    // [
    //     Symbols.structure.property.atom.B_iso_or_equiv,
    //     env => env.columns.B_iso_or_equiv.getFloat(env.element.value.atom)
    // ],

    // // ============= RESIDUE PROPERTIES =============
    // [
    //     Symbols.structure.property.residue.uniqueId,
    //     env => env.element.value.residue
    // ],
    // [
    //     Symbols.structure.property.residue.label_comp_id,
    //     env => env.columns.label_comp_id.getString(env.element.value.atom)
    // ],
    // [
    //     Symbols.structure.property.residue.label_seq_id,
    //     env => env.columns.label_seq_id.getInteger(env.element.value.atom)
    // ],

    // // ============= CHAIN PROPERTIES =============
    // [
    //     Symbols.structure.property.chain.label_asym_id,
    //     env => env.columns.label_asym_id.getString(env.element.value.atom)
    // ],

    // // ============= ATOM SET PROPERTIES =============
    // [
    //     Symbols.structure.property.atomSet.atomCount,
    //     env => env.atomSet.value.atomIndices.length
    // ],
    // [
    //     Symbols.structure.property.atomSet.reduce,
    //     (env, f: RuntimeExpression<any>, initial: RuntimeExpression<any>) => {
    //         const slot = Query.Iterator.beginSlot(env, 0, initial(env));
    //         Query.Iterator.begin(env.element, Query.Iterator.Element());
    //         for (const atom of env.atomSet.value.atomIndices) {
    //             Query.Iterator.setAtomElement(env, atom);
    //             slot.value = f(env);
    //         }
    //         const reduced = slot.value;
    //         Query.Iterator.endSlot(env, 0);
    //         Query.Iterator.end(env.element);
    //         return reduced;
    //     }
    // ],

    // // ============= ATOM SEQ SEQ PROPERTIES =============
    // [
    //     Symbols.structure.property.atomSetSeq.length,
    //     (env, seq: RuntimeExpression<Query.AtomSetSeq>) => seq(env).atomSets.length
    // ],

    // // ============= PRIMITIVES =============    
    // [
    //     Symbols.structure.primitive.modify,
    //     (env, seq: RuntimeExpression<Query.AtomSetSeq>, f: RuntimeExpression<Query.AtomSetSeq>) => {
    //         const result = new QueryHelpers.HashAtomSetSeqBuilder(env);
    //         const iterator = env.atomSet;
    //         Query.Iterator.begin(iterator, void 0);
    //         for (const src of seq(env).atomSets) {
    //             iterator.value = src;
    //             for (const set of f(env).atomSets) {
    //                 result.add(set);
    //             }
    //         }
    //         Query.Iterator.end(iterator);
    //         return result.getSeq();
    //     }
    // ],
    // [
    //     Symbols.structure.primitive.inContext,
    //     (env, newenv: RuntimeExpression<Query.Context>, query: RuntimeExpression<Query.AtomSetSeq>) => {
    //         if (env.element.value || env.atomSet.value) throw new Error('Context cannot be changed inside a generator or modifier query.');
    //         return query(newenv(env));
    //     }
    // ],

    // // ============= GENERATORS =============
    // [
    //     Symbols.structure.generator.atomGroups,
    //     (env, pred: RuntimeExpression, grouping?: RuntimeExpression) => {
    //         if (grouping) return RuntimeHelpers.groupingGenerator(env, pred, grouping);
    //         return RuntimeHelpers.nonGroupingGenerator(env, pred);
    //     }
    // ],

    // // ============= MODIFIERS =============
    // [
    //     Symbols.structure.modifier.filter,
    //     (env, pred: RuntimeExpression<boolean>) => {
    //         if (pred(env)) return Query.AtomSetSeq(env, [env.atomSet.value]);
    //         return Query.AtomSetSeq(env, []);
    //     }
    // ],
];

function unary(symbol: SymbolInfo, f: (v: any) => any): CompileInfo {
    return [symbol, (env, v) => f(v(env)), staticAttribute];
}

const { table, attributes } = (function () {
    const table: { [name: string]: SymbolRuntime } = Object.create(null);
    const attributes: { [name: string]: Attribute[] } = Object.create(null);
    for (const s of symbols) {
        const name = s[0].name;
        if (table[name]) {
            throw new Error(`You've already implemented ${name}, dummy.`);
        }
        table[name] = s[1];
        if (s[2]) attributes[name] = s[2] as Attribute[];
    }
    return { table, attributes };
})();

export const Attributes = attributes;
export default table;