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
import Compiler from '../../compiler/compiler'
import { ElementSymbol, Model } from '../../molecule/data'
import { StaticAtomProperties } from '../../../language/properties'
import * as MolQueryProperties from './properties'

import ElementAddress = Context.ElementAddress

export function pick(env: Environment, selection: RuntimeExpression<AtomSelection>, pred: RuntimeExpression<boolean>) {
    const sel = selection(env);
    const ret = AtomSelection.linearBuilder();
    const iterarator = Iterator.begin(env.atomSet);
    for (const atomSet of AtomSelection.atomSets(sel)) {
        iterarator.value = atomSet;
        if (pred(env)) ret.add(atomSet);
    }
    Iterator.end(iterarator);
    return ret.getSeq();
}

export function withProperties(env: Environment, selection: RuntimeExpression<AtomSelection>, source: RuntimeExpression<AtomSelection>, prop: RuntimeExpression<any>) {
    const sel = selection(env);
    const propSet = MolQueryProperties.selectionPropertySet(env, prop, source(env));
    const ret = AtomSelection.linearBuilder();
    for (const atomSet of AtomSelection.atomSets(sel)) {
        const props = MolQueryProperties.atomSetPropertySet(env, prop, atomSet);
        if (props.isSubset(propSet)) ret.add(atomSet);
    }
    return ret.getSeq();
}

export function within(env: Environment, selection: RuntimeExpression<AtomSelection>, target: RuntimeExpression<AtomSelection>, radius: RuntimeExpression<number>) {
    const sel = selection(env);
    const mask = AtomSelection.getMask(target(env));
    const checkWithin = Model.spatialLookup(env.model).check(mask);
    const r = radius(env);
    const { x, y, z } = env.model.positions;

    const ret = AtomSelection.linearBuilder();
    for (const atomSet of AtomSelection.atomSets(sel)) {
        for (const a of AtomSet.atomIndices(atomSet)) {
            if (checkWithin(x[a], y[a], z[a], r)) {
                ret.add(atomSet);
                break;
            }
        }
    }
    return ret.getSeq();
}

export function findInAtomSet(env: Environment, query: RuntimeExpression) {
    const newEnv = Environment(Context.ofAtomSet(env.queryCtx, env.atomSet.value));
    return query(Environment(Context.ofAtomSet(env.queryCtx, env.atomSet.value)));
}