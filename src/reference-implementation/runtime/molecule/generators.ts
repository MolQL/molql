/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import AtomSet from '../../query/atom-set'
import AtomSelection from '../../query/atom-selection'
import Context from '../../query/context'
import Environment from '../environment'
import Iterator from '../iterator'
import RuntimeExpression from '../expression'
import { FastMap } from '../../utils/collections'

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
    const ctx = env.queryCtx;
    const { mask } = ctx;
    const { model } = env.queryCtx;
    const { chainStartIndex, chainEndIndex, count: entityCount } = model.entities;
    const { residueStartIndex, residueEndIndex } = model.chains;
    const { atomStartIndex, atomEndIndex } = model.residues;

    const element = Environment.beginIterateElemement(env);
    for (let eI = 0; eI < entityCount; eI++) {
        ElementAddress.setEntityLayer(ctx, element, eI);
        if (!entityP(env)) continue;

        for (let cI = chainStartIndex[eI], _cI = chainEndIndex[eI]; cI < _cI; cI++) {
            ElementAddress.setChainLayer(ctx, element, cI);
            if (!chainP(env)) continue;

            for (let rI = residueStartIndex[cI], _rI = residueEndIndex[cI]; rI < _rI; rI++) {
                ElementAddress.setResidueLayer(ctx, element, rI);
                if (!residueP(env)) continue;

                for (let aI = atomStartIndex[rI], _aI = atomEndIndex[rI]; aI < _aI; aI++) {
                    if (!mask.has(aI)) continue;

                    ElementAddress.setAtomLayer(ctx, element, aI);
                    if (!atomP(env)) continue;

                    onAtom(builderCtx, aI);
                }
            }
        }
    }
    Environment.endIterateElement(env);
}

type GroupCtx = { env: Environment, groupBy: RuntimeExpression, groups: FastMap<number, number[]>, selection: number[][] }
function onGroupAtom({ env, groupBy, groups, selection }: GroupCtx, i: number) {
    const key = groupBy(env);
    if (key === void 0) return;
    let atomSet: number[];
    if (groups.has(key)) {
        atomSet = groups.get(key)!;
    } else {
        atomSet = [];
        groups.set(key, atomSet);
        selection.push(atomSet);
    }
    atomSet.push(i);
}

function groupByAtom(env: Environment) { return env.element.value.atom; }

export function atomGroupsGenerator(env: Environment, params: GeneratorParams): AtomSelection {
    const groupBy = params.groupBy || groupByAtom;
    const ctx: GroupCtx = { env, groupBy, groups: FastMap.create(), selection: [] };
    atomGroupsIterator(env, params, onGroupAtom, ctx);
    const result = AtomSelection.linearBuilder();
    for (const set of ctx.selection) {
        result.add(AtomSet(set));
    }
    return result.getSelection();
}