/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import AtomSet from '../../query/atom-set'
import AtomSelection from '../../query/atom-selection'
import Context from '../../query/context'
import Environment from '../environment'
import Iterator from '../iterator'
import Slot from '../slot'
import RuntimeExpression from '../expression'
import { Set } from 'immutable'

import ElementAddress = Context.ElementAddress

function _atomSetPropertySet(env: Environment, atomSet: AtomSet, prop: RuntimeExpression, set: Set<any>) {
    const ctx = env.queryCtx;
    const iterator = Iterator.begin(env.element, ElementAddress());
    const element = iterator.value;
    for (const a of atomSet.atomIndices) {
        ElementAddress.setAtomFull(ctx, element, a);
        set.add(prop(env));
    }
    Iterator.end(iterator);

    return set;
}

export function atomSetPropertySet(env: Environment, prop: RuntimeExpression) {
    return _atomSetPropertySet(env, env.atomSet.value, prop, Set().asMutable()).asImmutable();
}

export function selectionPropertySet(env: Environment, prop: RuntimeExpression, selection: AtomSelection) {
    const set = Set().asMutable();
    for (const atomSet of selection.atomSets) {
        _atomSetPropertySet(env, atomSet, prop, set);
    }
    return set.asImmutable();
}

export function accumulateAtomSet(env: Environment, f: RuntimeExpression, initial: RuntimeExpression) {
    const ctx = env.queryCtx;
    const slot = Slot.push(env.atomSetReducer, initial(env));
    const iterator = Iterator.begin(env.element, ElementAddress());
    const element = iterator.value;
    for (const a of env.atomSet.value.atomIndices) {
        ElementAddress.setAtomFull(ctx, element, a);
        slot.value = f(env);
    }
    const reduced = slot.value;
    Slot.pop(slot);
    Iterator.end(iterator);
    return reduced;
}