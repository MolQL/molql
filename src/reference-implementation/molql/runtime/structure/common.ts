/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import Expression from '../expression'
import BondAddress from '../../data/bond-address'
import { Bonds } from '../../../molecule/data'
import { getRingFingerprint } from '../../../molecule/topology/rings/collection'

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