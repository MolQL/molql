/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../environment'
import Expression from '../expression'
import Context from '../context'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import { UniqueArrayBuilder, sortAsc, FastSet } from '../../../utils/collections'
import { Model } from '../../../molecule/data'

type Selection = Expression<AtomSelection>

export function queryEach(env: Environment, selection: Selection, query: Selection): AtomSelection {
    const builder = AtomSelection.uniqueBuilder();
    for (const atomSet of AtomSelection.atomSets(selection(env))){
        const ctx = Context.ofAtomSet(env.context, atomSet);
        for (const mappedAtomSet of AtomSelection.atomSets(query(Environment(ctx)))) {
            builder.add(mappedAtomSet);
        }
    }
    return builder.getSelection();
}

export function intersectBy(env: Environment, selection: Selection, by: Selection): AtomSelection {
    const mask = AtomSelection.getMask(by(env));
    const builder = AtomSelection.uniqueBuilder();
    for (const atomSet of AtomSelection.atomSets(selection(env))) {
        const indices = AtomSet.atomIndices(atomSet);
        let count = 0;
        for (const a of indices) {
            if (mask.has(a)) count++;
        }
        if (!count) continue;

        const intersection = new Int32Array(count);
        let offset = 0;
        for (const a of indices) {
            if (mask.has(a)) intersection[offset++] = a;
        }
        builder.add(AtomSet(intersection));
    }
    return builder.getSelection();
}

export function exceptBy(env: Environment, selection: Selection, by: Selection): AtomSelection {
    const mask = AtomSelection.getMask(by(env));
    const builder = AtomSelection.uniqueBuilder();
    for (const atomSet of AtomSelection.atomSets(selection(env))) {
        const indices = AtomSet.atomIndices(atomSet);
        let count = 0;
        for (const a of indices) {
            if (!mask.has(a)) count++;
        }
        if (!count) continue;

        const complement = new Int32Array(count);
        let offset = 0;
        for (const a of indices) {
            if (!mask.has(a)) complement[offset++] = a;
        }
        builder.add(AtomSet(complement));
    }
    return builder.getSelection();
}


export function unionBy(env: Environment, selection: Selection, by: Selection): AtomSelection {const atomCount = env.context.model.atoms.count;
    const atomSets = AtomSelection.atomSets(selection(env));
    const glue = by(env);

    const occurenceCount = new Int32Array(atomCount);
    for (const atomSet of atomSets) {
        for (const a of AtomSet.atomIndices(atomSet)) {
            occurenceCount[a]++;
        }
    }
    let totalOccurences = 0;
    const occurentOffsets = new Int32Array(atomCount);
    let offset = 0;
    for (const oc of occurenceCount as any as number[]) {
        occurentOffsets[offset++] = totalOccurences;
        totalOccurences += oc;
    }

    let setIndex = 0;
    const atomMap = new Int32Array(totalOccurences);
    const atomFill = new Int32Array(atomCount);
    for (const atomSet of atomSets) {
        for (const a of AtomSet.atomIndices(atomSet)) {
            offset = occurentOffsets[a] + atomFill[a];
            atomFill[a]++;
            atomMap[offset] = setIndex;
        }
        setIndex++;
    }

    const builder = AtomSelection.uniqueBuilder();
    for (const glueSet of AtomSelection.atomSets(glue)) {
        const toGlue = UniqueArrayBuilder<number>();
        for (const g of AtomSet.atomIndices(glueSet)) {
            const o = occurentOffsets[g];
            for (let i = 0, _i = occurenceCount[g]; i < _i; i++) {
                const key = atomMap[o + i];
                UniqueArrayBuilder.add(toGlue, key, key);
            }
        }

        const indices = UniqueArrayBuilder<number>();
        let cnt = 0;
        for (const atomSetIndex of toGlue.array) {
            for (const a of AtomSet.atomIndices(atomSets[atomSetIndex])) {
                cnt++;
                UniqueArrayBuilder.add(indices, a, a);
            }
        }
        builder.add(AtomSet(sortAsc(indices.array)));
    }

    return builder.getSelection();
}

export function union(env: Environment, selection: Selection): AtomSelection {
    return AtomSelection([AtomSelection.toAtomSet(selection(env))]);
}

export interface ClusterParams {
    selection: Selection,
    minDist?: Expression<number>,
    maxDist: Expression<number>,
    minSize?: Expression<number>,
    maxSize?: Expression<number>
}

interface ClusterCtx {
    minDist: number,
    maxDist: number,
    minSize: number,
    maxSize: number,
    selection: AtomSelection,
    builder: AtomSelection.Builder,
    model: Model
}

function clusterAround(ctx: ClusterCtx, a: AtomSet, included: number[], candidates: number[]) {
    const depth = included.length;
    if (depth >= ctx.minSize) {
        ctx.builder.add(a);
    }
    if (depth >= ctx.maxSize || depth >= candidates.length) {
        return;
    }

    const { minDist, maxDist } = ctx;
    const atomSets = AtomSelection.atomSets(ctx.selection);

    const lastIncluded = included[included.length - 1];
    for (const bI of candidates) {
        if (bI <= lastIncluded) continue;

        const b = atomSets[bI];

        let canInclude = true;
        for (const iI of included) {
            const dist = AtomSet.distance(ctx.model, b, atomSets[iI]);
            if (dist < minDist || dist > maxDist) {
                canInclude = false;
                break;
            }
        }
        if (!canInclude) continue;

        included.push(bI);
        clusterAround(ctx, AtomSet.union(a, b), included, candidates);
        included.pop();
    }
}

function _cluster(ctx: ClusterCtx) {
    let i = 0;
    const lookup = AtomSelection.lookup3d(ctx.model, ctx.selection);
    for (const atomSet of AtomSelection.atomSets(ctx.selection)) {
        const candidates = lookup.queryAtomSet(atomSet, ctx.maxDist);
        sortAsc(candidates);
        clusterAround(ctx, atomSet, [i], candidates);
        i++;
    }
}

export function cluster(env: Environment, params: ClusterParams): AtomSelection {
    const cCtx: ClusterCtx = {
        selection: params.selection(env),
        minDist: (params.minDist && params.minDist(env)) || 0,
        maxDist: (params.maxDist && params.maxDist(env)),
        minSize: Math.max((params.minSize && params.minSize(env)) || 2, 2),
        maxSize: (params.maxSize && params.maxSize(env)) || Number.POSITIVE_INFINITY,
        builder: AtomSelection.linearBuilder(),
        model: env.context.model
    };
    _cluster(cCtx);
    return cCtx.builder.getSelection();
}

export function includeSurroundings(env: Environment, selection: Selection, radius: Expression<number>, wholeResidues?: Expression<boolean>): AtomSelection {
    const src = selection(env);
    const { model, mask } = env.context;
    const findWithin = Model.spatialLookup(model).find(mask);
    const r = radius(env);
    const asResidues = wholeResidues && !!wholeResidues(env);
    const { x, y, z } = model.positions;
    const { residueIndex } = model.atoms;
    const { atomStartIndex, atomEndIndex } = model.residues;

    const builder = AtomSelection.uniqueBuilder();
    const includedResides = FastSet.create<number>();

    for (const atomSet of AtomSelection.atomSets(src)) {
        const atoms = UniqueArrayBuilder<number>();
        for (const a of AtomSet.atomIndices(atomSet)) {
            const { count, indices } = findWithin(x[a], y[a], z[a], r);
            for (let i = 0, _i = count; i < _i; i++) {
                const b = indices[i];
                if (asResidues) {
                    const rI = residueIndex[b];
                    if (includedResides.has(rI)) continue;
                    includedResides.add(rI);
                    for (let j = atomStartIndex[rI], _j = atomEndIndex[rI]; j < _j; j++) {
                        if (!mask.has(j)) continue;
                        UniqueArrayBuilder.add(atoms, j, j);
                    }
                } else {
                    UniqueArrayBuilder.add(atoms, b, b);
                }
            }
        }
        builder.add(AtomSet(sortAsc(atoms.array)));
    }

    return builder.getSelection();
}