/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import Expression from '../expression'
import BondAddress from '../../data/bond-address'
import { Bonds, Model } from '../../../structure/data'
import ElementAddress from '../../data/element-address'
import AtomSet from '../../data/atom-set'
import { getRingFingerprint } from '../../../structure/topology/rings/collection'

export type BondTest = (env: Environment) => boolean

export function defaultBondTest(env: Environment) {
    return Bonds.isCovalent(env.slots.bond.flags);
}

export function testBond(env: Environment, slot: BondAddress, a: number, b: number, order: number, flags: number, test: BondTest) {
    slot.atomA = a;
    slot.atomB = b;
    slot.order = order;
    slot.flags = flags;
    return test(env);
}

export function ringFingerprint(env: Environment, elements: Expression<string>[]) {
    const els: string[] = [];
    for (const e of elements) els.push(e(env));
    return getRingFingerprint(els);
}

export function entityType(type: string) {
    const t = (type || '').toLowerCase();
    switch (t) {
        case 'polymer':
        case 'non-polymer':
        case 'water': return 'water';
        default: return 'unknown';
    }
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
    const minRadiusSq = minRadius * minRadius;
    let distSq = Number.POSITIVE_INFINITY;
    const { x, y, z } = model.positions;
    const xs = AtomSet.atomIndices(a), ys = AtomSet.atomIndices(b);
    for (const i of xs) {
        ElementAddress.setAtom(model, slot, i);
        const rA = atomRadius(env);
        for (const j of ys) {
            ElementAddress.setAtom(model, slot, j);
            const rB = atomRadius(env);
            let d = AtomSet.atomDistanceSq(x, y, z, i, j) - rA - rB;
            if (d < 0) d = 0;
            if (d < minRadiusSq) return false;
            if (d < distSq) distSq = d;
        }
    }
    return distSq <= maxRadius * maxRadius;
}