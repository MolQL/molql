/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../environment'
import Expression from '../expression'
import Context from '../context'
import Iterator from '../iterator'
import AtomSet from '../../data/atom-set'
import ElementAddress from '../../data/element-address'
import AtomSelection from '../../data/atom-selection'
import { FastSet } from '../../../utils/collections'
import { Model } from '../../../molecule/data'

type Selection = Expression<AtomSelection>

export function pick(env: Environment, selection: Selection, pred: Expression<boolean>) {
    const sel = selection(env);
    const ret = AtomSelection.linearBuilder();
    const iterarator = Iterator.begin(env.context.atomSet);
    for (const atomSet of AtomSelection.atomSets(sel)) {
        iterarator.value = atomSet;
        if (pred(env)) ret.add(atomSet);
    }
    Iterator.end(iterarator);
    return ret.getSelection();
}

function isSubset(a: FastSet<any>, b: FastSet<any>) {
    const _ctx = { b, count: 0 };
    a.forEach((e, ctx) => {
        if (!ctx!.b.has(e)) return false;
        ctx!.count++;
    }, _ctx);
    return _ctx.count === a.size;
}

function getAtomSetProperties(env: Environment, atomSet: AtomSet, prop: Expression, set: FastSet<any>) {
    const { model } = env.context;
    const element = Context.beginIterateElemement(env.context);
    for (const i of AtomSet.atomIndices(atomSet)) {
        ElementAddress.setAtom(model, element, i);
        const p = prop(env);
        if (p !== void 0) set.add(p);
    }
    Context.endIterateElement(env.context);
    return set;
}

function getAtomSelectionProperties(env: Environment, selection: Selection, prop: Expression) {
    const set = FastSet.create<any>();
    const iterator = Iterator.begin(env.context.atomSet);
    for (const atomSet of AtomSelection.atomSets(selection(env))) {
        iterator.value = atomSet;
        getAtomSetProperties(env, atomSet, prop, set);
    }
    Iterator.end(iterator);
    return set;
}

export function withProperties(env: Environment, selection: Selection, source: Selection, prop: Expression) {
    const sel = selection(env);
    const propSet = getAtomSelectionProperties(env, source, prop);
    const ret = AtomSelection.linearBuilder();
    const iterator = Iterator.begin(env.context.atomSet);
    for (const atomSet of AtomSelection.atomSets(sel)) {
        iterator.value = atomSet;
        const props = getAtomSetProperties(env, atomSet, prop, FastSet.create());
        if (isSubset(props, propSet)) ret.add(atomSet);
    }
    Iterator.end(iterator);
    return ret.getSelection();
}

export function within(env: Environment, selection: Selection, target: Selection, radius: Expression<number>) {
    const sel = selection(env);
    const mask = AtomSelection.getMask(target(env));
    const checkWithin = Model.spatialLookup(env.context.model).check(mask);
    const r = radius(env);
    const { x, y, z } = env.context.model.positions;

    const ret = AtomSelection.linearBuilder();
    for (const atomSet of AtomSelection.atomSets(sel)) {
        for (const a of AtomSet.atomIndices(atomSet)) {
            if (checkWithin(x[a], y[a], z[a], r)) {
                ret.add(atomSet);
                break;
            }
        }
    }
    return ret.getSelection();
}