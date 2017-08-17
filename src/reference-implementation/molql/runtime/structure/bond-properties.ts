/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import MolQL from '../../../../molql/symbol-table'
import SymbolRuntime from '../../symbol'
import { BondAnnotation } from '../../../molecule/data'

function rt(runtime: SymbolRuntime) { return runtime; }

export function createType(t: string) {
    switch (t.toLowerCase()) {
        case 'covalent': return BondAnnotation.Covalent;
        case 'metallic': return BondAnnotation.Metallic;
        case 'ion': return BondAnnotation.Ion;
        case 'hydrogen': return BondAnnotation.Hydrogen;
        default: return BondAnnotation.Unknown;
    }
}

export const Properties: { [P in keyof typeof MolQL.structure.bondProperty]?: SymbolRuntime } = {
    type: rt((env, v) => {
        const a = env.slots.bond.annotation;
        if (a >= BondAnnotation.Covalent && a <= BondAnnotation.Covalent6) return BondAnnotation.Covalent;
        return a;
    }),
    order: rt((env, v) => {
        const a = env.slots.bond.annotation;
        if (a >= BondAnnotation.Covalent1 && a <= BondAnnotation.Covalent6) return a as number;
        return 1;
    })
}