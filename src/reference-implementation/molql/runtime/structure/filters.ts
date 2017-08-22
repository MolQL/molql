/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import Expression from '../expression'
import AtomSet from '../../data/atom-set'
import ElementAddress from '../../data/element-address'
import AtomSelection from '../../data/atom-selection'
import { FastSet } from '../../../utils/collections'
import Mask from '../../../utils/mask'
import { Model } from '../../../structure/data'
import { defaultBondTest, testBond, maxAtomValueInSelection } from './common'

type Selection = Expression<AtomSelection>

export function pick(env: Environment, selection: Selection, pred: Expression<boolean>) {
    const sel = selection(env);
    const ret = AtomSelection.linearBuilder();

    Environment.lockSlot(env, 'atomSet');
    const { slots } = env;
    for (const atomSet of AtomSelection.atomSets(sel)) {
        slots.atomSet = atomSet;
        if (pred(env)) ret.add(atomSet);
    }
    Environment.unlockSlot(env, 'atomSet');
    return ret.getSelection();
}

export function getAtomSetProperties(env: Environment, atomSet: AtomSet, prop: Expression, set: FastSet<any>) {
    const { model } = env.context;
    Environment.lockSlot(env, 'element');
    const element = env.slots.element;
    for (const i of AtomSet.atomIndices(atomSet)) {
        ElementAddress.setAtom(model, element, i);
        const p = prop(env);
        if (p !== void 0) set.add(p);
    }
    Environment.unlockSlot(env, 'element');
    return set;
}

function getAtomSelectionProperties(env: Environment, selection: Selection, prop: Expression) {
    const set = FastSet.create<any>();
    Environment.lockSlot(env, 'atomSet');
    const { slots } = env;
    for (const atomSet of AtomSelection.atomSets(selection(env))) {
        slots.atomSet = atomSet;
        getAtomSetProperties(env, atomSet, prop, set);
    }
    Environment.unlockSlot(env, 'atomSet');
    return set;
}

export function withSameAtomProperties(env: Environment, selection: Selection, source: Selection, prop: Expression) {
    const sel = selection(env);
    const propSet = getAtomSelectionProperties(env, source, prop);
    const ret = AtomSelection.linearBuilder();
    Environment.lockSlot(env, 'atomSet');
    const { slots } = env;
    for (const atomSet of AtomSelection.atomSets(sel)) {
        slots.atomSet = atomSet;
        const props = getAtomSetProperties(env, atomSet, prop, FastSet.create());
        if (FastSet.isSubset(props, propSet)) ret.add(atomSet);
    }
    Environment.unlockSlot(env, 'atomSet');
    return ret.getSelection();
}

export function areIntersectedBy(env: Environment, selection: Selection, by: Selection): AtomSelection {
    const mask = AtomSelection.getMask(by(env));
    const builder = AtomSelection.linearBuilder();
    for (const atomSet of AtomSelection.atomSets(selection(env))) {
        for (const a of AtomSet.atomIndices(atomSet)) {
            if (mask.has(a)) {
                builder.add(atomSet);
                break;
            }
        }
    }
    return builder.getSelection();
}

interface WithinContext {
    env: Environment,
    selection: AtomSelection,
    target: AtomSelection,
    minRadius: number,
    maxRadius: number,
    invert: boolean,
    atomRadius: Expression<number>
}
function withinMaxRadius({ env, selection, target, maxRadius, invert }: WithinContext) {
    const { model } = env.context;
    const { x, y, z } = model.positions;
    const mask = AtomSelection.getMask(target);
    const checkWithin = Model.spatialLookup(env.context.model).check(mask);
    const ret = AtomSelection.linearBuilder();

    for (const atomSet of AtomSelection.atomSets(selection)) {
        let withinRadius = false;
        for (const a of AtomSet.atomIndices(atomSet)) {
            if (checkWithin(x[a], y[a], z[a], maxRadius)) {
                withinRadius = true;
                break;
            }
        }
        if (withinRadius) {
            if (!invert) ret.add(atomSet);
        } else if (invert) ret.add(atomSet);
    }

    return ret.getSelection();
}


export interface AreWithinWithAtomRadiusContext {
    env: Environment,
    model: Model,
    slot: ElementAddress,
    minRadius: number,
    maxRadius: number,
    atomRadius: Expression<number>
}

export function areWithinWithAtomRadius(ctx: AreWithinWithAtomRadiusContext, a: AtomSet, b: AtomSet) {
    if (a === b) return 0;
    const { env, model, slot, minRadius, maxRadius, atomRadius } = ctx;
    let dist = Number.POSITIVE_INFINITY;
    const { x, y, z } = model.positions;
    const xs = AtomSet.atomIndices(a), ys = AtomSet.atomIndices(b);
    for (const i of xs) {
        ElementAddress.setAtom(model, slot, i);
        const rA = atomRadius(env);
        for (const j of ys) {
            ElementAddress.setAtom(model, slot, j);
            const rB = atomRadius(env);
            let d = Math.sqrt(AtomSet.atomDistanceSq(x, y, z, i, j)) - rA - rB;
            if (d < 0) d = 0;
            if (d < minRadius) return false;
            if (d < dist) dist = d;
        }
    }
    return dist <= maxRadius;
}

function withinMinMaxRadius({ env, selection, target, minRadius, maxRadius, atomRadius, invert }: WithinContext) {
    const { model } = env.context;
    const ret = AtomSelection.linearBuilder();

    const maxAtomRadiusSrc = maxAtomValueInSelection(env, selection, atomRadius);
    const maxAtomRadiusTarget = maxAtomValueInSelection(env, target, atomRadius);
    const targetLookup = AtomSelection.lookup3d(model, target);
    const radius = maxRadius + maxAtomRadiusSrc + maxAtomRadiusTarget;
    const targetSets = AtomSelection.atomSets(target);

    Environment.lockSlot(env, 'element');
    const element = env.slots.element;

    const distCtx: AreWithinWithAtomRadiusContext = {
        env,
        model,
        atomRadius,
        maxRadius,
        minRadius,
        slot: element
    }

    for (const atomSet of AtomSelection.atomSets(selection)) {
        const within = targetLookup.queryAtomSet(atomSet, radius);

        let withinRadius = false;
        for (const setIndex of within) {
            if (areWithinWithAtomRadius(distCtx, atomSet, targetSets[setIndex])) {
                withinRadius = true;
            }
        }

        if (withinRadius) {
            if (!invert) ret.add(atomSet);
        } else if (invert) ret.add(atomSet);
    }

    Environment.unlockSlot(env, 'element');

    return ret.getSelection();
}

function _zeroRadius(env: Environment) { return 0; }

export interface WithinParams {
    selection: Selection,
    target: Selection,
    minRadius?: Expression<number>,
    maxRadius: Expression<number>,
    atomRadius?: Expression<number>,
    invert?: Expression<boolean>
}

export function within(env: Environment, params: WithinParams) {
    const ctx: WithinContext = {
        env,
        selection: params.selection(env),
        target: params.target(env),
        maxRadius: params.maxRadius(env),
        minRadius: params.minRadius ? params.minRadius(env) : 0,
        atomRadius: params.atomRadius || _zeroRadius,
        invert: params.invert ? params.invert(env) : false,
    }

    if (ctx.minRadius === 0 && ctx.atomRadius === _zeroRadius) {
        return withinMaxRadius(ctx);
    } else {
        return withinMinMaxRadius(ctx);
    }
}

export type IsConnectedToParams = {
    selection: Selection,
    target: Selection,
    bondTest?: Expression<boolean>,
    disjunct?: Expression<boolean>,
    invert?: Expression<boolean>
}

export function isConnectedTo(env: Environment, { selection, target, disjunct, invert, bondTest }: IsConnectedToParams) {
    const { model } = env.context;

    const sel = selection(env);
    const { neighbor, offset: bondAtomOffset, order, flags } = Model.bonds(model);
    const targetMask = AtomSelection.getMask(target(env));
    const disjuncted = disjunct ? !!disjunct(env) : false;
    const inverted = (!!invert && !!invert(env));
    const test = bondTest || defaultBondTest;

    Environment.lockSlot(env, 'bond');
    const { bond } = env.slots;

    const ret = AtomSelection.linearBuilder();
    for (const atomSet of AtomSelection.atomSets(sel)) {
        const setMask = disjuncted ? AtomSet.getMask(atomSet) : Mask.never;
        let isConnected = false;
        for (const a of AtomSet.atomIndices(atomSet)) {
            const start = bondAtomOffset[a], end = bondAtomOffset[a + 1];
            for (let t = start; t < end; t++) {
                const b = neighbor[t];
                if (targetMask.has(b)) {
                    if (!disjuncted || !setMask.has(b)) {
                        if (testBond(env, bond, a, b, order[t], flags[t], test)) {
                            isConnected = true;
                            break;
                        }
                    }
                }
            }
            if (isConnected) break;
        }

        if (isConnected) {
            if (!inverted) ret.add(atomSet);
        } else if (inverted) {
            if (disjuncted) {
                let isFullSubset = true;
                for (const a of AtomSet.atomIndices(atomSet)) {
                    if (!targetMask.has(a)) {
                        isFullSubset = false;
                        break;
                    }
                }
                if (!isFullSubset) ret.add(atomSet);
            } else {
                ret.add(atomSet);
            }
        }
    }
    Environment.unlockSlot(env, 'bond');
    return ret.getSelection();
}