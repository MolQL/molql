/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../../../mini-lisp/environment'
import RuntimeExpression from '../../../mini-lisp/expression'
import { FastMap } from '../../../utils/collections'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import ElementAddress from '../../data/element-address'
import Context from '../context'
import Iterator from '../iterator'

type Pred = RuntimeExpression<Context, boolean>
type Env = Environment<Context>

export type GeneratorParams = {
    entityTest: Pred,
    chainTest: Pred,
    residueTest: Pred,
    atomTest: Pred,
    groupBy: RuntimeExpression<Context, any>
}

type GroupCtx = {
    env: Env,
    groupBy: RuntimeExpression<Context>,
    groups: FastMap<number, number[]>,
    selection: number[][]
}

function atomGroupsIterator(env: Env, { entityTest, chainTest, residueTest, atomTest }: GeneratorParams, groupCtx: GroupCtx) {
    const ctx = env.context;
    const { model, mask } = ctx;
    const { chainStartIndex, chainEndIndex, count: entityCount } = model.entities;
    const { residueStartIndex, residueEndIndex } = model.chains;
    const { atomStartIndex, atomEndIndex } = model.residues;

    const element = Context.beginIterateElemement(ctx);
    for (let eI = 0; eI < entityCount; eI++) {
        ElementAddress.setEntityLayer(model, element, eI);
        if (!entityTest(env)) continue;

        for (let cI = chainStartIndex[eI], _cI = chainEndIndex[eI]; cI < _cI; cI++) {
            ElementAddress.setChainLayer(model, element, cI);
            if (!chainTest(env)) continue;

            for (let rI = residueStartIndex[cI], _rI = residueEndIndex[cI]; rI < _rI; rI++) {
                ElementAddress.setResidueLayer(model, element, rI);
                if (!residueTest(env)) continue;

                for (let aI = atomStartIndex[rI], _aI = atomEndIndex[rI]; aI < _aI; aI++) {
                    if (!mask.has(aI)) continue;

                    ElementAddress.setAtomLayer(model, element, aI);
                    if (!atomTest(env)) continue;

                    groupAtom(groupCtx, aI);
                }
            }
        }
    }
    Context.endIterateElement(ctx);
}

function groupAtom({ env, groupBy, groups, selection }: GroupCtx, i: number) {
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

function alwaysTrue(env: Environment) { return true; }
function groupByAtom(env: Environment) { return env.context.element.value.atom; }

export function atomGroupsGenerator(env: Environment, params: Partial<GeneratorParams>): AtomSelection {
    const {
        entityTest = alwaysTrue,
        chainTest = alwaysTrue,
        residueTest = alwaysTrue,
        atomTest = alwaysTrue,
        groupBy = groupByAtom
    } = params;

    const groupCtx: GroupCtx = { env, groupBy, groups: FastMap.create(), selection: [] };
    atomGroupsIterator(env, { entityTest, chainTest, residueTest, atomTest, groupBy }, groupCtx);
    const result = AtomSelection.linearBuilder();
    for (const set of groupCtx.selection) {
        result.add(AtomSet(set));
    }
    return result.getSelection();
}