/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../environment'
import Context from '../context'
import Expression from '../expression'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'

type VarArgs<T = any> = { [key: string]: Expression<Expression<T>> }

export function intersect(env: Environment, selectionArgs: VarArgs<AtomSelection>) {
    const keys = Object.keys(selectionArgs);
    if (keys.length === 0) return AtomSelection.empty;
    if (keys.length === 1) return selectionArgs[keys[0]](env);

    const selections = keys.map(k => selectionArgs[k]);
    const sequences = selections.map(s => s(env)(env));
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
        const sel = selections[key](env)(env);
        for (const atomSet of AtomSelection.atomSets(sel)) {
            ret.add(atomSet);
        }
    }
    return ret;
}

interface ClusterCtx {
    model: Context['model'],
    matrix: Float64Array,
    selections: AtomSelection[],
    candidates: number[][],
    location: number[],
    builder: AtomSelection.Builder,
    width: number
}

function clusterCheck(ctx: ClusterCtx, depth: number) {
    const { location, selections, model, matrix, width } = ctx;
    const toCheck = AtomSelection.atomSets(selections[depth])[location[depth]];
    for (let i = 0; i < depth; i++) {
        const atomSet = AtomSelection.atomSets(selections[i])[location[i]];
        const dist = AtomSet.distance(model, toCheck, atomSet)
        if (dist === 0 && AtomSet.areEqual(toCheck, atomSet)) return false;
        const maxDist = matrix[i * width + depth], minDist = matrix[depth * width + i];
        if (dist > maxDist || dist < minDist) return false;
    }
    return true;
}

function clusterAround(ctx: ClusterCtx, depth: number) {
    const { location, selections, width } = ctx;
    if (depth >= location.length) {
        let set = AtomSelection.atomSets(selections[0])[location[0]];
        for (let i = 1; i < width; i++) {
            set = AtomSet.union(set, AtomSelection.atomSets(selections[i])[location[i]]);
        }
        ctx.builder.add(set);
        return;
    }

    const candidates = ctx.candidates[depth];
    for (let i = 0, _i = candidates.length; i < _i; i++) {
        location[depth] = candidates[i];
        if (clusterCheck(ctx, depth)) clusterAround(ctx, depth + 1);
    }
}

function cluster(env: Environment, matrix: Float64Array, selections: AtomSelection[]) {
    const ctx: ClusterCtx = {
        model: env.context.model,
        matrix,
        selections,
        builder: AtomSelection.uniqueBuilder(),
        candidates: [],
        location: [],
        width: selections.length
    }
    for (let i = 0; i < ctx.width; i++) {
        ctx.location[i] = 0;
        ctx.candidates[i] = [];
    }
    const lookups = selections.slice(1).map(s => AtomSelection.lookup3d(ctx.model, s));
    const first = AtomSelection.atomSets(selections[0]);
    for (let i = 0; i < first.length; i++) {
        ctx.location[0] = i;
        const set = first[i];
        let empty = false;
        for (let j = 1; j < ctx.width; j++) {
            ctx.candidates[j] = lookups[j - 1].queryAtomSet(set, matrix[j]);
            if (!ctx.candidates[j].length) {
                empty = true;
                break;
            }
        }
        if (empty) continue;
        clusterAround(ctx, 1);
    }
    return ctx.builder.getSelection();
}

export function distanceCluster(env: Environment,
        matrix: Expression<ArrayLike<ArrayLike<number>>>,
        selections: Expression<ArrayLike<Expression<AtomSelection>>>): AtomSelection {
    const atomSelections: AtomSelection[] = [];
    const selList = selections(env);
    for (let i = 0; i < selList.length; i++) {
        const sel = selList[i](env);
        if (!AtomSelection.atomSets(sel).length) return AtomSelection.empty;
        atomSelections.push(sel);
    }
    const w = atomSelections.length;
    const m = new Float64Array(w * w);
    const rows = matrix(env);
    for (let i = 0; i < w; i++) {
        const row = rows[i];
        for (let j = 0; j < w; j++) {
            m[i * w + j] = row[j];
        }
    }
    return cluster(env, m, atomSelections);
}