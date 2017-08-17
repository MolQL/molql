/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import _Environment from '../../mini-lisp/environment'
import ElementAddress from '../data/element-address'
import BondAddress from '../data/bond-address'
import AtomSet from '../data/atom-set'
import Runtime from '../runtime'
import Context from './context'

export interface Slots {
    element: ElementAddress,
    atomSet: AtomSet,
    bond: BondAddress,
    atomSetReducer: any
}

interface Environment extends _Environment<Context> {
    slots: Slots
    slotLocks: { [S in keyof Slots]: boolean }
}

function Environment(context: Context): Environment {
    return {
        symbolTable: Runtime,
        context,
        slots: { element: ElementAddress(), atomSet: AtomSet([]), bond: BondAddress(), atomSetReducer: void 0 },
        slotLocks: { element: false, atomSet: false, bond: false, atomSetReducer: false }
    };
}

namespace Environment {
    export function lockSlot({ slotLocks }: Environment, slot: keyof Slots) {
        if (slotLocks[slot]) throw new Error(`Slot '${slot}' is already locked.`);
        slotLocks[slot] = true;
    }

    export function unlockSlot({ slotLocks }: Environment, slot: keyof Slots) {
        if (!slotLocks[slot]) throw new Error(`Slot '${slot}' is not locked.`);
        slotLocks[slot] = false;
    }
}

export default Environment