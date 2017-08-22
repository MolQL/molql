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
import { FastSet } from '../../../utils/collections'
import { getAtomSetProperties } from './filters'

import AtomSetIt = AtomSet.Iterator;

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

    //const atoms = AtomSet.atomIndices(slots.atomSet);
    const it = AtomSetIt.forSet(slots.atomSet);
    const element = env.slots.element;

    ElementAddress.setAtom(context.model, element, it.value);
    slots.atomSetReducer = initial(env);

    for (let a = it.value; !it.done; a = it.next().value) {
        ElementAddress.setAtom(context.model, element, a);
        slots.atomSetReducer = value(env);
    }
    const ret = slots.atomSetReducer;
    Environment.unlockSlot(env, 'element');
    Environment.unlockSlot(env, 'atomSetReducer');
    return ret;
}

export function propertySet(env: Environment, prop: Expression) {
    return getAtomSetProperties(env, env.slots.atomSet, prop, FastSet.create<any>())
}