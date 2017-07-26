/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbols, { SymbolInfo } from '../../language/symbols'
import { FastSet, FastMap } from '../utils/collections'
import * as Query from '../query/data-model'
import * as RuntimeHelpers from '../runtime/helpers'
import * as QueryHelpers from '../query/helpers'

export type RuntimeExpression<T = any> = (ctx: Query.Context, ...args: RuntimeExpression[]) => T

export type Attribute =
    'static-expr' // static expressions are independent from context if their children are also independent from context.

const staticAttribute: Attribute[] = ['static-expr']

const symbols: ([SymbolInfo, RuntimeExpression] | [SymbolInfo, RuntimeExpression, Attribute[]])[] = [
    ////////////////////////////////////
    // Primitives

    // ============= CONSTRUCTORS =============
    [
        Symbols.primitive.constructor.list,
        function (ctx) {
            const list: any[] = [];
            for (let i = 1; i < arguments.length; i++) list[list.length] = arguments[i](ctx);
            return list;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.constructor.set,
        function(ctx) {
            const set = FastSet.create();
            for (let i = 1; i < arguments.length; i++) set.add(arguments[i](ctx));
            return set;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.constructor.map,
        function (ctx) {
            const map = FastMap.create<any, any>();
            for (let i = 1; i < arguments.length; i += 2) map.set(arguments[i](ctx), arguments[i + 1](ctx));
            return map;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.constructor.regex,
        (ctx, expr, flags) => new RegExp(expr(ctx), flags ? flags(ctx) : ''),
        staticAttribute
    ],

    // ============= FUNCTIONAL =============
    [
        Symbols.primitive.functional.partial,
        function (ctx, f: RuntimeExpression) {
            const first: any[] = [void 0];
            for (let i = 2; i < arguments.length; i++) first[i - 1] = arguments[i];
            return function (ctx: Query.Context) {
                const second = [...first];
                second[0] = ctx;
                for (let i = 1; i < arguments.length; i++) second.push(arguments[i]);
                return f.apply(null, second);
            };
        }
    ],
    [Symbols.primitive.functional.slot, (ctx, index: RuntimeExpression<number>) => ctx.slots[index(ctx)].value],

    // ============= OPERATORS =============
    [Symbols.primitive.operator.logic.not, (ctx, x) => !x(ctx), staticAttribute],
    [
        Symbols.primitive.operator.logic.and,
        function (ctx) {
            for (let i = 1; i < arguments.length; i++) if (!arguments[i](ctx)) return false;
            return true;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.operator.logic.or,
        function (ctx) {
            for (let i = 1; i < arguments.length; i++) if (arguments[i](ctx)) return true;
            return false;
        },
        staticAttribute
    ],

    [Symbols.primitive.operator.relational.eq, (ctx, x, y) => x(ctx) === y(ctx), staticAttribute],
    [Symbols.primitive.operator.relational.neq, (ctx, x, y) => x(ctx) !== y(ctx), staticAttribute],
    [Symbols.primitive.operator.relational.lt, (ctx, x, y) => x(ctx) < y(ctx), staticAttribute],
    [Symbols.primitive.operator.relational.lte, (ctx, x, y) => x(ctx) <= y(ctx), staticAttribute],
    [Symbols.primitive.operator.relational.gr, (ctx, x, y) => x(ctx) > y(ctx), staticAttribute],
    [Symbols.primitive.operator.relational.gre, (ctx, x, y) => x(ctx) >= y(ctx), staticAttribute],
    [
        Symbols.primitive.operator.relational.inRange,
        (ctx, x, a, b) => { const v = x(ctx); return v >= a(ctx) && v <= b(ctx) },
        staticAttribute
    ],

    [
        Symbols.primitive.operator.arithmetic.add,
        function(ctx) {
            let ret = 0;
            for (let i = 1; i < arguments.length; i++) ret += arguments[i](ctx);
            return ret;
        },
        staticAttribute
    ],
    [Symbols.primitive.operator.arithmetic.sub, (ctx, x, y) => x(ctx) - y(ctx), staticAttribute],
    [
        Symbols.primitive.operator.arithmetic.mult,
        function(ctx) {
            let ret = 1;
            for (let i = 1; i < arguments.length; i++) ret *= arguments[i](ctx);
            return ret;
        },
        staticAttribute
    ],
    [Symbols.primitive.operator.arithmetic.div, (ctx, x, y) => x(ctx) / y(ctx), staticAttribute],
    [Symbols.primitive.operator.arithmetic.pow, (ctx, x, y) => Math.pow(x(ctx), y(ctx)), staticAttribute],
    [
        Symbols.primitive.operator.arithmetic.min,
        function(ctx) {
            let ret = 0;
            for (let i = 1; i < arguments.length; i++) ret = Math.min(arguments[i](ctx), ret);
            return ret;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.operator.arithmetic.max,
        function(ctx) {
            let ret = 0;
            for (let i = 1; i < arguments.length; i++) ret = Math.max(arguments[i](ctx), ret);
            return ret;
        },
        staticAttribute
    ],
    [
        Symbols.primitive.operator.string.concat,
        function(ctx) {
            const ret: string[] = [];
            for (let i = 1; i < arguments.length; i++) ret.push('' + arguments[i](ctx));
            return ret.join('');
        },
        staticAttribute
    ],

    [
        Symbols.primitive.operator.collections.inSet,
        (ctx, set: RuntimeExpression<FastSet<any>>, v) => set(ctx).has(v(ctx)),
        staticAttribute
    ],
    [
        Symbols.primitive.operator.collections.mapGet,
        (ctx, map: RuntimeExpression<FastMap<any, any>>, key, def) => {
            const m = map(ctx), k = key(ctx);
            if (m.has(k)) return m.get(k);
            return def(ctx);
        },
        staticAttribute
    ],

    ////////////////////////////////////
    // Structure

    // ============= CONSTRUCTORS =============
    [
        Symbols.structure.constructor.elementSymbol,
        (ctx, s: RuntimeExpression<string>) => RuntimeHelpers.normalizeElementSymbol(s(ctx)),
        staticAttribute
    ],

    // ============= ATOM PROPERTIES =============
    [
        Symbols.structure.property.atom.uniqueId,
        ctx => ctx.element.value.atom
    ],
    [
        Symbols.structure.property.atom.id,
        ctx => ctx.columns.id.getInteger(ctx.element.value.atom)
    ],
    [
        Symbols.structure.property.atom.label_atom_id,
        ctx => ctx.columns.label_asym_id.getString(ctx.element.value.atom)
    ],
    [
        Symbols.structure.property.atom.type_symbol,
        ctx => RuntimeHelpers.normalizeElementSymbol(ctx.columns.type_symbol.getString(ctx.element.value.atom))
    ],
    [
        Symbols.structure.property.atom.B_iso_or_equiv,
        ctx => ctx.columns.B_iso_or_equiv.getFloat(ctx.element.value.atom)
    ],

    // ============= RESIDUE PROPERTIES =============
    [
        Symbols.structure.property.residue.uniqueId,
        ctx => ctx.element.value.residue
    ],
    [
        Symbols.structure.property.residue.label_comp_id,
        ctx => ctx.columns.label_comp_id.getString(ctx.element.value.atom)
    ],
    [
        Symbols.structure.property.residue.label_seq_id,
        ctx => ctx.columns.label_seq_id.getInteger(ctx.element.value.atom)
    ],

    // ============= CHAIN PROPERTIES =============
    [
        Symbols.structure.property.chain.label_asym_id,
        ctx => ctx.columns.label_asym_id.getString(ctx.element.value.atom)
    ],

    // ============= ATOM SET PROPERTIES =============
    [
        Symbols.structure.property.atomSet.atomCount,
        ctx => ctx.atomSet.value.atomIndices.length
    ],
    [
        Symbols.structure.property.atomSet.reduce,
        (ctx, f: RuntimeExpression<any>, initial: RuntimeExpression<any>) => {
            const slot = Query.Iterator.beginSlot(ctx, 0, initial(ctx));
            Query.Iterator.begin(ctx.element, Query.Iterator.Element());
            for (const atom of ctx.atomSet.value.atomIndices) {
                Query.Iterator.setAtomElement(ctx, atom);
                slot.value = f(ctx);
            }
            const reduced = slot.value;
            Query.Iterator.endSlot(ctx, 0);
            Query.Iterator.end(ctx.element);
            return reduced;
        }
    ],

    // ============= ATOM SEQ SEQ PROPERTIES =============
    [
        Symbols.structure.property.atomSetSeq.length,
        (ctx, seq: RuntimeExpression<Query.AtomSetSeq>) => seq(ctx).atomSets.length
    ],

    // ============= PRIMITIVES =============    
    [
        Symbols.structure.primitive.modify,
        (ctx, seq: RuntimeExpression<Query.AtomSetSeq>, f: RuntimeExpression<Query.AtomSetSeq>) => {
            const result = new QueryHelpers.HashAtomSetSeqBuilder(ctx);
            const iterator = ctx.atomSet;
            Query.Iterator.begin(iterator, void 0);
            for (const src of seq(ctx).atomSets) {
                iterator.value = src;
                for (const set of f(ctx).atomSets) {
                    result.add(set);
                }
            }
            Query.Iterator.end(iterator);
            return result.getSeq();
        }
    ],
    [
        Symbols.structure.primitive.inContext,
        (ctx, newCtx: RuntimeExpression<Query.Context>, query: RuntimeExpression<Query.AtomSetSeq>) => {
            if (ctx.element.value || ctx.atomSet.value) throw new Error('Context cannot be changed inside a generator or modifier query.');
            return query(newCtx(ctx));
        }
    ],

    // ============= GENERATORS =============
    [
        Symbols.structure.generator.atomGroups,
        (ctx, pred: RuntimeExpression, grouping?: RuntimeExpression) => {
            if (grouping) return RuntimeHelpers.groupingGenerator(ctx, pred, grouping);
            return RuntimeHelpers.nonGroupingGenerator(ctx, pred);
        }
    ],

    // ============= MODIFIERS =============
    [
        Symbols.structure.modifier.filter,
        (ctx, pred: RuntimeExpression<boolean>) => {
            if (pred(ctx)) return Query.AtomSetSeq(ctx, [ctx.atomSet.value]);
            return Query.AtomSetSeq(ctx, []);
        }
    ],
];

const { table, attributes } = (function () {
    const table: { [name: string]: RuntimeExpression } = Object.create(null);
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