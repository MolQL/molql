/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../environment'
import Expression from '../expression'
import Context from '../context'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import ElementAddress from '../../data/element-address'
import Slot from '../slot'

export function atomCount(env: Environment) {
    return AtomSet.count(env.context.atomSet.value);
}

export function countQuery(env: Environment, query: Expression<AtomSelection>) {
    const sel = query(Environment(Context.ofAtomSet(env.context, env.context.atomSet.value)))
    return AtomSelection.atomSets(sel).length;
}

function noNestedAccumulators() {
    throw new Error('atom-set accumulators cannot be nested.');
}

export function accumulateAtomSet(env: Environment, initial: Expression<any>, value: Expression<any>) {
    const ctx = env.context;
    const slot = ctx.atomSetReducer;
    if (Slot.depth(slot) > 0) noNestedAccumulators();

    const atoms = AtomSet.atomIndices(ctx.atomSet.value);
    const element = Context.beginIterateElemement(ctx);
    ElementAddress.setAtom(ctx.model, element, atoms[0]);
    Slot.push(ctx.atomSetReducer, initial(env));

    for (const a of atoms) {
        ElementAddress.setAtom(ctx.model, element, a);
        slot.value = value(env);
    }
    Context.endIterateElement(ctx);
    return Slot.pop(slot);
}