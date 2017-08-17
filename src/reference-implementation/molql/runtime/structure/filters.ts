/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import Expression from '../expression'
import AtomSet from '../../data/atom-set'
import ElementAddress from '../../data/element-address'
import AtomSelection from '../../data/atom-selection'
import { FastSet } from '../../../utils/collections'
import { Model } from '../../../molecule/data'

type Selection = Expression<AtomSelection>

export function pick(env: Environment, selection: Selection, pred: Expression<boolean>) {
    const sel = selection(env);
    const ret = AtomSelection.linearBuilder();

    Environment.lockSlot(env, 'atomSet');
    const { slots } = env;
    for (const atomSet of AtomSelection.atomSets(sel)) {
        slots.atomSet = atomSet;
        if (pred(env)) ret.add(atomSet);
    }
    Environment.unlockSlot(env, 'atomSet');
    return ret.getSelection();
}

export function getAtomSetProperties(env: Environment, atomSet: AtomSet, prop: Expression, set: FastSet<any>) {
    const { model } = env.context;
    Environment.lockSlot(env, 'element');
    const element = env.slots.element;
    for (const i of AtomSet.atomIndices(atomSet)) {
        ElementAddress.setAtom(model, element, i);
        const p = prop(env);
        if (p !== void 0) set.add(p);
    }
    Environment.unlockSlot(env, 'element');
    return set;
}

function getAtomSelectionProperties(env: Environment, selection: Selection, prop: Expression) {
    const set = FastSet.create<any>();
    Environment.lockSlot(env, 'atomSet');
    const { slots } = env;
    for (const atomSet of AtomSelection.atomSets(selection(env))) {
        slots.atomSet = atomSet;
        getAtomSetProperties(env, atomSet, prop, set);
    }
    Environment.unlockSlot(env, 'atomSet');
    return set;
}

export function withSameAtomProperties(env: Environment, selection: Selection, source: Selection, prop: Expression) {
    const sel = selection(env);
    const propSet = getAtomSelectionProperties(env, source, prop);
    const ret = AtomSelection.linearBuilder();
    Environment.lockSlot(env, 'atomSet');
    const { slots } = env;
    for (const atomSet of AtomSelection.atomSets(sel)) {
        slots.atomSet = atomSet;
        const props = getAtomSetProperties(env, atomSet, prop, FastSet.create());
        if (FastSet.isSubset(props, propSet)) ret.add(atomSet);
    }
    Environment.unlockSlot(env, 'atomSet');
    return ret.getSelection();
}

export function within(env: Environment, selection: Selection, target: Selection, radius: Expression<number>, invert?: Expression<boolean>) {
    const sel = selection(env);
    const mask = AtomSelection.getMask(target(env));
    const checkWithin = Model.spatialLookup(env.context.model).check(mask);
    const r = radius(env);
    const { x, y, z } = env.context.model.positions;
    const inverted = (!!invert && !!invert(env));

    const ret = AtomSelection.linearBuilder();
    if (inverted) {
        for (const atomSet of AtomSelection.atomSets(sel)) {
            let include = true;
            for (const a of AtomSet.atomIndices(atomSet)) {
                if (checkWithin(x[a], y[a], z[a], r)) {
                    include = false;
                    break;
                }
            }
            if (include) ret.add(atomSet);
        }
    } else {
        for (const atomSet of AtomSelection.atomSets(sel)) {
            for (const a of AtomSet.atomIndices(atomSet)) {
                if (checkWithin(x[a], y[a], z[a], r)) {
                    ret.add(atomSet);
                    break;
                }
            }
        }
    }
    return ret.getSelection();
}