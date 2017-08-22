/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import Expression from '../expression'
import BondAddress from '../../data/bond-address'
import { Bonds } from '../../../structure/data'
import ElementAddress from '../../data/element-address'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
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

/** this locks 'element' slot in the environment. */
export function maxAtomValueInSelection(env: Environment, selection: AtomSelection, prop: Expression<number>) {
    const { model } = env.context;

    Environment.lockSlot(env, 'element');
    const element = env.slots.element;
    let ret = 0;
    for (const atomSet of AtomSelection.atomSets(selection)) {
        for (const a of AtomSet.atomIndices(atomSet)) {
            ElementAddress.setAtom(model, element, a);
            const v = prop(env);
            if (v > ret) ret = v;
        }
    }
    Environment.unlockSlot(env, 'element');
    return ret;
}