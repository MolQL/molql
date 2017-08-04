/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../environment'
import Expression from '../expression'
import Context from '../context'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import { UniqueArrayBuilder, sortAsc, FastSet } from '../../../utils/collections'
import Mask from '../../../utils/mask'
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

export function queryComplement(env: Environment, selection: Selection, query: Selection): AtomSelection {
    const selectionMask = AtomSelection.getMask(selection(env));
    const complementCtx = Context(env.context.model, Mask.complement(selectionMask, env.context.mask));
    return query(Environment(complementCtx));
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


export function unionBy(env: Environment, selection: Selection, by: Selection): AtomSelection {
    const atomCount = env.context.model.atoms.count;
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
            const o = atomMap[occurentOffsets[g]];
            for (let i = 0, _i = occurenceCount[g]; i < _i; i++) {
                const key = atomMap[o + i];
                UniqueArrayBuilder.add(toGlue, key, key);
            }
        }

        const indices = UniqueArrayBuilder<number>();
        for (const atomSetIndex of toGlue.array) {
            for (const a of AtomSet.atomIndices(atomSets[atomSetIndex])) {
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

export function cluster(env: Environment, selection: Selection, radius: Expression<number>): AtomSelection {
    // TODO: implement me
    throw new Error('cluster: not implmented');
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