/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import Expression from '../expression'
import { FastMap, FastSet, sortAsc } from '../../../utils/collections'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import ElementAddress from '../../data/element-address'
import Context from '../context'
import { Model } from '../../../molecule/data'
import Mask from '../../../utils/mask'

type Pred = Expression<boolean>

export type GeneratorParams = {
    entityTest: Pred,
    chainTest: Pred,
    residueTest: Pred,
    atomTest: Pred,
    groupBy: Expression<any>
}

type GroupCtx = {
    env: Environment,
    groupBy: Expression,
    groups: FastMap<number, number[]>,
    selection: number[][]
}

function atomGroupsIterator(env: Environment, { entityTest, chainTest, residueTest, atomTest }: GeneratorParams, groupCtx: GroupCtx) {
    const ctx = env.context;
    const { model, mask } = ctx;
    const { chainOffset, count: entityCount } = model.entities;
    const { residueOffset } = model.chains;
    const { atomOffset } = model.residues;

    Environment.lockSlot(env, 'element');
    const element = env.slots.element;
    for (let eI = 0; eI < entityCount; eI++) {
        ElementAddress.setEntityLayer(model, element, eI);
        if (!entityTest(env)) continue;

        for (let cI = chainOffset[eI], _cI = chainOffset[eI + 1]; cI < _cI; cI++) {
            ElementAddress.setChainLayer(model, element, cI);
            if (!chainTest(env)) continue;

            for (let rI = residueOffset[cI], _rI = residueOffset[cI + 1]; rI < _rI; rI++) {
                ElementAddress.setResidueLayer(model, element, rI);
                if (!residueTest(env)) continue;

                for (let aI = atomOffset[rI], _aI = atomOffset[rI + 1]; aI < _aI; aI++) {
                    if (!mask.has(aI)) continue;

                    ElementAddress.setAtomLayer(model, element, aI);
                    if (!atomTest(env)) continue;

                    groupAtom(groupCtx, aI);
                }
            }
        }
    }
    Environment.unlockSlot(env, 'element');
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
function groupByAtom(env: Environment) { return env.slots.element.atom; }

function groupAtomsSingleton(env: Environment, atomTest: Pred) {
    const ctx = env.context;
    const { model, mask } = ctx;

    const result = AtomSelection.linearBuilder();
    Environment.lockSlot(env, 'element');
    const element = env.slots.element;
    for (let i = 0, _i = model.atoms.count; i < _i; i++) {
        if (!mask.has(i)) continue;
        if (atomTest === alwaysTrue) {
             result.add(AtomSet([i]));
        } else {
            ElementAddress.setAtom(model, element, i);
            if (atomTest(env)) result.add(AtomSet([i]));
        }
    }
    Environment.unlockSlot(env, 'element');
    return result.getSelection();
}

export function atomGroupsGenerator(env: Environment, params: Partial<GeneratorParams>): AtomSelection {
    if (!params.residueTest && !params.chainTest && !params.entityTest && !params.groupBy) {
        return groupAtomsSingleton(env, params.atomTest || alwaysTrue);
    }

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

export function querySelection(env: Environment, selection: Expression<AtomSelection>, query: Expression<AtomSelection>, inComplement?: Expression<boolean>): AtomSelection {
    if (inComplement && inComplement(env)) {
        const selectionMask = AtomSelection.getMask(selection(env));
        const complementCtx = Context(env.context.model, Mask.complement(selectionMask, env.context.mask));
        return query(Environment(complementCtx));
    } else {
        return query(Environment(Context.ofAtomSelection(env.context.model, selection(env))))
    }
}

export function rings(env: Environment, fingerprints: Expression<string>[]) {
    const rings = Model.rings(env.context.model);
    const ret = AtomSelection.linearBuilder();

    if (fingerprints.length) {
        const set = FastSet.ofArray(fingerprints.map(f => f(env)));
        set.forEach(fp => {
            const rs = rings.byFingerprint.get(fp);
            if (!rs) return;
            for (const rI of rs) {
                const r = rings.all[rI];
                const xs: number[] = [];
                for (let i = 0, _i = r.length; i < _i; i++) xs[xs.length] = r[i];
                ret.add(AtomSet(sortAsc(xs)));
            }
        });
    } else {
        for (const r of rings.all) {
            // copy and sort it
            const xs: number[] = [];
            for (let i = 0, _i = r.length; i < _i; i++) xs[xs.length] = r[i];
            ret.add(AtomSet(sortAsc(xs)));
        }
    }
    return ret.getSelection();
}

export function empty(env: Environment) { return AtomSelection.empty }