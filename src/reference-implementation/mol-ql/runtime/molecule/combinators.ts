/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../environment'
import Expression from '../expression'
import AtomSelection from '../../data/atom-selection'

type VarArgs<T = any> = { [key: string]: Expression<T> }

export function intersect(env: Environment, selectionArgs: VarArgs<AtomSelection>) {
    const keys = Object.keys(selectionArgs);
    if (keys.length === 0) return AtomSelection.empty;
    if (keys.length === 1) return selectionArgs[keys[0]](env);

    const selections = keys.map(k => selectionArgs[k]);
    const sequences = selections.map(s => s(env));
    let pivotIndex = 0, pivotLength = AtomSelection.atomSets(sequences[0]).length;
    for (let i = 1; i < sequences.length; i++) {
        const len = AtomSelection.atomSets(sequences[i]).length;
        if (len < pivotLength) {
            pivotIndex = i;
            pivotLength = len;
        }
    }

    const pivotSet = AtomSelection.Set.ofSelection(sequences[pivotIndex]);
    const foundSet = new AtomSelection.Set();

    for (let pI = 0; pI < sequences.length; pI++) {
        if (pI === pivotIndex) continue;
        for (const atomSet of AtomSelection.atomSets(sequences[pI])) {
            if (pivotSet.has(atomSet)) foundSet.add(atomSet);
        }
    }

    const ret = AtomSelection.linearBuilder();
    for (const atomSet of AtomSelection.atomSets(sequences[pivotIndex])) {
        if (foundSet.has(atomSet)) ret.add(atomSet);
    }
    return ret;
}

export function merge(env: Environment, selections: VarArgs<AtomSelection>) {
    const ret = AtomSelection.uniqueBuilder();
    for (const key of Object.keys(selections)) {
        const sel = selections[key];
        for (const atomSet of AtomSelection.atomSets(sel(env))) {
            ret.add(atomSet);
        }
    }
    return ret;
}

export function near(env: Environment, selections: VarArgs): AtomSelection {
    // TODO: implement
    throw 'near: not imlemented';
}