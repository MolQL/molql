/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import MolQL from '../../../../molql/symbol-table'
import SymbolRuntime, { RuntimeArguments, forEachPositionalArg } from '../../symbol'
import Environment from '../environment'
import Expression from '../expression'
import { BondFlag } from '../../../structure/data'

function rt(runtime: SymbolRuntime) { return runtime; }

export function createFlags(env: Environment, args: RuntimeArguments) {
    return forEachPositionalArg(args, { flag: BondFlag.None }, (f, ctx) => {
        switch (('' + f(env)).toLowerCase()) {
            case 'covalent': ctx.flag |= BondFlag.Covalent; break;
            case 'metallic': ctx.flag |= BondFlag.MetallicCoordination; break;
            case 'ion': ctx.flag |= BondFlag.Ion; break;
            case 'hydrogen': ctx.flag |= BondFlag.Hydrogen; break;
            case 'sulfide': ctx.flag |= BondFlag.Sulfide; break;
            case 'aromatic': ctx.flag |= BondFlag.Aromatic; break;
            case 'computed': ctx.flag |= BondFlag.Computed; break;
        }
    }).flag;
}

export const Properties: { [P in keyof typeof MolQL.structure.bondProperty]?: SymbolRuntime } = {
    order: rt((env, v) => env.slots.bond.order)
}

export function hasFlags(env: Environment, flags: Expression<number>, partial?: Expression<boolean>) {
    const fs = flags(env);
    if (partial ? !!partial(env) : true) return !fs || (env.slots.bond.flags & fs) !== 0;
    return (env.slots.bond.flags & fs) === fs;
}