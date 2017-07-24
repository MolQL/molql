import * as Query from '../query'
import * as QueryUtils from './query'
import { FastMap } from './collections'
import { RuntimeExpression } from '../runtime'

const elementSymbolCache: { [value: string]: string } = Object.create(null);

export function normalizeElementSymbol(symbol: any): string {
    let val = elementSymbolCache[symbol];
    if (val) return val;
    val = typeof symbol === 'string' ? symbol.toUpperCase() : `${symbol}`.toUpperCase();
    elementSymbolCache[symbol] = val;
    return val;
}

export function nonGroupingGenerator(ctx: Query.Context, pred?: RuntimeExpression): Query.AtomSetSeq {
    const atoms: number[] = [];
    Query.Iterator.begin(ctx.element, Query.Iterator.Element())
    for (let i = 0, _i = ctx.model.atoms.count; i < _i; i++) {
        if (!ctx.mask.has(i)) continue;
        Query.Iterator.setAtomElement(ctx, i);
        if (!pred || pred(ctx)) atoms.push(i);
    }
    Query.Iterator.end(ctx.element);
    return Query.AtomSetSeq(ctx, [Query.AtomSet(ctx, atoms)]);
}

export function groupingGenerator(ctx: Query.Context, pred: RuntimeExpression, groupBy: RuntimeExpression): Query.AtomSetSeq {
    const groups = FastMap.create<number, number[]>();
    const atomSetSeq: number[][] = [];

    Query.Iterator.begin(ctx.element, Query.Iterator.Element())
    for (let i = 0, _i = ctx.model.atoms.count; i < _i; i++) {
        if (!ctx.mask.has(i)) continue;
        Query.Iterator.setAtomElement(ctx, i);
        if (!pred(ctx)) continue;

        const key = groupBy(ctx);
        let atomSet: number[];
        if (groups.has(key)) atomSet = groups.get(key)!;
        else { atomSet = []; groups.set(key, atomSet); atomSetSeq.push(atomSet); }
        atomSet.push(i);
    }
    Query.Iterator.end(ctx.element);

    const result = new QueryUtils.HashAtomSetSeqBuilder(ctx);
    for (const set of atomSetSeq) {
        result.add(QueryUtils.AtomSet.ofUnsortedIndices(ctx, set));
    }

    return result.getSeq();
}