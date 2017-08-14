/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import Expression from '../expression'
import Context from '../context'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import ElementAddress from '../../data/element-address'

export function atomCount(env: Environment) {
    return AtomSet.count(env.slots.atomSet);
}

export function countQuery(env: Environment, query: Expression<AtomSelection>) {
    const sel = query(Environment(Context.ofAtomSet(env.context, env.slots.atomSet)))
    return AtomSelection.atomSets(sel).length;
}

export function accumulateAtomSet(env: Environment, initial: Expression<any>, value: Expression<any>) {
    const { context, slots } = env;
    Environment.lockSlot(env, 'atomSetReducer');
    Environment.lockSlot(env, 'element');

    const atoms = AtomSet.atomIndices(slots.atomSet);
    const element = env.slots.element;

    ElementAddress.setAtom(context.model, element, atoms[0]);
    slots.atomSetReducer = initial(env);

    for (const a of atoms) {
        ElementAddress.setAtom(context.model, element, a);
        slots.atomSetReducer = value(env);
    }
    const ret = slots.atomSetReducer;
    Environment.unlockSlot(env, 'element');
    Environment.unlockSlot(env, 'atomSetReducer');
    return ret;
}