/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbols, { SymbolInfo } from '../../language/symbols'
import * as Query from '../query/data-model'
import * as RuntimeHelpers from '../runtime/helpers'
import * as QueryHelpers from '../query/helpers'

export type RuntimeExpression<T = any> = (ctx: Query.Context, ...args: RuntimeExpression[]) => T

export type Attribute = 'const-expr'

const constAttribute: Attribute[] = ['const-expr']

const symbols: ([SymbolInfo, RuntimeExpression] | [SymbolInfo, RuntimeExpression, Attribute[]])[] = [
    ////////////////////////////////////
    // Primitives
    [Symbols.primitive.constructor.list, (ctx, ...xs) => {
        const list: any[] = [];
        for (const x of xs) list[list.length] = x(ctx);
        return list;
    }, constAttribute],
    [Symbols.primitive.constructor.set, (ctx, ...xs) => {
        const set = new Set<any>();
        for (const x of xs) set.add(x(ctx));
        return set;
    }, constAttribute],
    [Symbols.primitive.constructor.map, (ctx, ...xs) => {
        const map = new Map<any, any>();
        for (let i = 0; i < xs.length; i += 2) map.set(xs[i](ctx), xs[i + 1](ctx));
        return map;
    }, constAttribute],

    [Symbols.primitive.functional.applyPartial, (ctx, f, ...xs) => {
        const func = f(ctx) as Function;
        const xArgs = xs.map(RuntimeHelpers.applyArg, ctx);
        return (ctx: Query.Context, ...ys: RuntimeExpression[]) => {
            const yArgs = ys.map(RuntimeHelpers.applyArg, ctx);
            return func.apply(null, [ctx, ...xArgs, ...yArgs]);
        };
    }],
    [Symbols.primitive.functional.slot, (ctx, index: RuntimeExpression<number>) => ctx.slots[index(ctx)].current],

    [Symbols.primitive.operator.not, (ctx, x) => !x(ctx), constAttribute],
    [Symbols.primitive.operator.and, (ctx, ...xs) => {
        for (const x of xs) if (!x(ctx)) return false;
        return true;
    }, constAttribute],
    [Symbols.primitive.operator.or, (ctx, ...xs) => {
        for (const x of xs) if (x(ctx)) return true;
        return false;
    }, constAttribute],
    [Symbols.primitive.operator.eq, (ctx, x, y) => x(ctx) === y(ctx), constAttribute],
    [Symbols.primitive.operator.neq, (ctx, x, y) => x(ctx) !== y(ctx), constAttribute],
    [Symbols.primitive.operator.lt, (ctx, x, y) => x(ctx) < y(ctx), constAttribute],
    [Symbols.primitive.operator.lte, (ctx, x, y) => x(ctx) <= y(ctx), constAttribute],
    [Symbols.primitive.operator.gr, (ctx, x, y) => x(ctx) > y(ctx), constAttribute],
    [Symbols.primitive.operator.gre, (ctx, x, y) => x(ctx) >= y(ctx), constAttribute],
    [Symbols.primitive.operator.plus, (ctx, ...xs) => {
        let ret = 0;
        for (const x of xs) ret += x(ctx);
        return ret;
    }, constAttribute],
    [Symbols.primitive.operator.div, (ctx, x, y) => x(ctx) / y(ctx), constAttribute],
    [Symbols.primitive.operator.inRange, (ctx, x, a, b) => { const v = x(ctx); return v >= a(ctx) && v <= b(ctx) }, constAttribute],

    ////////////////////////////////////
    // Structure
    [Symbols.structure.constructor.elementSymbol, (ctx, s: RuntimeExpression<string>) => RuntimeHelpers.normalizeElementSymbol(s(ctx)), constAttribute],

    [Symbols.structure.property.atom.id, ctx => ctx.columns.id.getInteger(ctx.element.current.atom)],
    [Symbols.structure.property.atom.label_atom_id, ctx => ctx.columns.label_asym_id.getString(ctx.element.current.atom)],
    [Symbols.structure.property.atom.type_symbol, ctx => RuntimeHelpers.normalizeElementSymbol(ctx.columns.type_symbol.getString(ctx.element.current.atom))],
    [Symbols.structure.property.atom.B_iso_or_equiv, ctx => ctx.columns.B_iso_or_equiv.getFloat(ctx.element.current.atom)],
    [Symbols.structure.property.residue.uniqueId, ctx => ctx.element.current.residue],
    [Symbols.structure.property.residue.label_comp_id, ctx => ctx.columns.label_comp_id.getString(ctx.element.current.atom)],
    [Symbols.structure.property.residue.label_seq_id, ctx => ctx.columns.label_seq_id.getInteger(ctx.element.current.atom)],
    [Symbols.structure.property.chain.label_asym_id, ctx => ctx.columns.label_asym_id.getString(ctx.element.current.atom)],

    [Symbols.structure.property.atomSet.atomCount, ctx => ctx.atomSet.current.atomIndices.length],
    [Symbols.structure.property.atomSet.reduce, (ctx, f: RuntimeExpression<any>, initial: RuntimeExpression<any>) => {
        const slot = Query.Iterator.beginSlot(ctx, 0, initial(ctx));
        Query.Iterator.begin(ctx.element, Query.Iterator.Element());
        for (const atom of ctx.atomSet.current.atomIndices) {
            Query.Iterator.setAtomElement(ctx, atom);
            slot.current = f(ctx);
        }
        const reduced = slot.current;
        Query.Iterator.endSlot(ctx, 0);
        Query.Iterator.end(ctx.element);
        return reduced;
    }],
    [Symbols.structure.property.atomSetSeq.length, (ctx, seq: RuntimeExpression<Query.AtomSetSeq>) => seq(ctx).atomSets.length],

    [Symbols.structure.primitive.generate, (ctx, pred: RuntimeExpression<boolean>, grouping?: RuntimeExpression) => {
        if (grouping) return RuntimeHelpers.groupingGenerator(ctx, pred, grouping);
        return RuntimeHelpers.nonGroupingGenerator(ctx, pred);
    }],
    [Symbols.structure.primitive.modify, (ctx, seq: RuntimeExpression<Query.AtomSetSeq>, f: RuntimeExpression<Query.AtomSetSeq>) => {
        const result = new QueryHelpers.HashAtomSetSeqBuilder(ctx);
        const iterator = ctx.atomSet;
        Query.Iterator.begin(iterator, void 0);
        for (const src of seq(ctx).atomSets) {
            iterator.current = src;
            for (const set of f(ctx).atomSets) {
                result.add(set);
            }
        }
        Query.Iterator.end(iterator);
        return result.getSeq();
    }],
    [Symbols.structure.primitive.inContext, (ctx, newCtx: RuntimeExpression<Query.Context>, query: RuntimeExpression<Query.AtomSetSeq>) => {
        if (ctx.element.current || ctx.atomSet.current) throw new Error('Context cannot be changed inside a generator or modifier query.');
        return query(newCtx(ctx));
    }],
    [Symbols.structure.modifier.filter, (ctx, pred: RuntimeExpression<boolean>) => {
        if (pred(ctx)) return Query.AtomSetSeq(ctx, [ctx.atomSet.current]);
        return Query.AtomSetSeq(ctx, []);
    }],
];

const { table, attributes } = (function () {
    const table: { [name: string]: RuntimeExpression } = Object.create(null);
    const attributes: { [name: string]: Attribute[] } = Object.create(null);
    for (const s of symbols) {
        table[s[0].name] = s[1];
        if (s[2]) attributes[s[0].name] = s[2] as Attribute[];
    }
    return { table, attributes };
})();

export const Attributes = attributes;
export default table;