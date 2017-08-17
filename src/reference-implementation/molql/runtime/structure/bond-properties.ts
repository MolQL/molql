/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import MolQL from '../../../../molql/symbol-table'
import SymbolRuntime from '../../symbol'
import Environment from '../environment'
import Expression from '../expression'
import { BondFlag } from '../../../molecule/data'

function rt(runtime: SymbolRuntime) { return runtime; }

export function createFlags(env: Environment, fs: Expression<string>[]) {
    let ret = BondFlag.None
    for (const f of fs) {
        switch (('' + f(env)).toLowerCase()) {
            case 'covalent': ret |= BondFlag.Covalent; break;
            case 'metallic': ret |= BondFlag.MetallicCoordination; break;
            case 'ion': ret |= BondFlag.Ion; break;
            case 'hydrogen': ret |= BondFlag.Hydrogen; break;
            case 'sulfide': ret |= BondFlag.Sulfide; break;
            case 'aromatic': ret |= BondFlag.Aromatic; break;
            case 'computed': ret |= BondFlag.Computed; break;
        }
    }
    return ret;
}

export const Properties: { [P in keyof typeof MolQL.structure.bondProperty]?: SymbolRuntime } = {
    order: rt((env, v) => env.slots.bond.order)
}

export function hasFlags(env: Environment, flags: Expression<number>, partial?: Expression<boolean>) {
    const fs = flags(env);
    if (partial ? !!partial(env) : true) return !fs || (env.slots.bond.flags & fs) !== 0;
    return (env.slots.bond.flags & fs) === fs;
}