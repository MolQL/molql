/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import AtomSet from '../query/atom-set'
import AtomSetSeq from '../query/atom-set-seq'
import Context from '../query/context'
import Environment from './environment'
import Iterator from './iterator'
import RuntimeExpression from './expression'
import { FastMap } from '../utils/collections'

import ElementAddress = Context.ElementAddress

type Pred = RuntimeExpression<boolean>

export type GeneratorParams = {
    entityP: Pred,
    chainP: Pred,
    residueP: Pred,
    atomP: Pred,
    groupBy?: RuntimeExpression
}

function atomGroupsIterator<BuildCtx>(env: Environment, { entityP, chainP, residueP, atomP }: GeneratorParams, onAtom: (ctx: BuildCtx, i: number) => void, builderCtx: BuildCtx) {
    const atoms: number[] = [];

    const ctx = env.queryCtx;
    const { mask } = ctx;
    const { model } = env.queryCtx;
    const { chainStartIndex, chainEndIndex, count: entityCount } = model.entities;
    const { residueStartIndex, residueEndIndex } = model.chains;
    const { atomStartIndex, atomEndIndex } = model.residues;
    const { dataIndex } = model.atoms;

    const iterator = Iterator.begin(env.element, Context.ElementAddress());
    const element = iterator.value;
    for (let eI = 0; eI < entityCount; eI++) {
        ElementAddress.setEntity(ctx, element, eI);
        if (!entityP(env)) continue;

        for (let cI = chainStartIndex[eI], _cI = chainEndIndex[eI]; cI < _cI; cI++) {
            ElementAddress.setChain(ctx, element, cI);
            if (!chainP(env)) continue;

            for (let rI = residueStartIndex[cI], _rI = residueEndIndex[cI]; rI < _rI; rI++) {
                ElementAddress.setResidue(ctx, element, rI);
                if (!residueP(env)) continue;

                for (let aI = atomStartIndex[rI], _aI = atomEndIndex[rI]; aI < _aI; aI++) {
                    if (!mask.has(aI)) continue;

                    ElementAddress.setAtom(ctx, element, aI);
                    if (!atomP(env)) continue;

                    onAtom(builderCtx, aI);
                }
            }
        }
    }
    Iterator.end(iterator);
}

type FlatCtx = { atoms: number[] }
function onFlatAtom(ctx: FlatCtx, i: number) { ctx.atoms.push(i); }

type GroupCtx = { env: Environment, groupBy: RuntimeExpression, groups: FastMap<number, number[]>, atomSetSeq: number[][] }
function onGroupAtom({ env, groupBy, groups, atomSetSeq }: GroupCtx, i: number) {
    const key = groupBy(env);
    let atomSet: number[];
    if (groups.has(key)) atomSet = groups.get(key)!;
    else { atomSet = []; groups.set(key, atomSet); atomSetSeq.push(atomSet); }
    atomSet.push(i);
}

export function atomGroupsGenerator(env: Environment, params: GeneratorParams): AtomSetSeq {
    if (params.groupBy) {
        const ctx: GroupCtx = { env, groupBy: params.groupBy, groups: FastMap.create(), atomSetSeq: [] };
        atomGroupsIterator(env, params, onGroupAtom, ctx);
        const result = AtomSetSeq.uniqueAtomSetSeqBuilder(env.queryCtx);
        for (const set of ctx.atomSetSeq) {
            result.add(AtomSet.ofUnsortedIndices(env.queryCtx, set));
        }
        return result.getSeq();
    } else {
        const ctx: FlatCtx = { atoms: [] };
        atomGroupsIterator(env, params, onFlatAtom, ctx);
        if (ctx.atoms.length) return AtomSetSeq(env.queryCtx, [AtomSet(env.queryCtx, ctx.atoms)]);
        return AtomSetSeq(env.queryCtx, []);
    }
}