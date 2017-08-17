/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import BondAddress from '../../data/bond-address'
import { Bonds, BondAnnotation } from '../../../molecule/data'

export type BondTest = (env: Environment) => boolean

export function defaultBondTest(env: Environment) {
    return Bonds.isCovalent(env.slots.bond.annotation);
}

export function testBond(env: Environment, slot: BondAddress, a: number, b: number, annotation: BondAnnotation, test: BondTest) {
    slot.atomA = a;
    slot.atomB = b;
    slot.annotation = annotation;
    return test(env);
}