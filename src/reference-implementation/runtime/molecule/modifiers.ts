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
import { UniqueArrayBuilder, sortAsc, FastSet } from '../../utils/collections'
import { Model } from '../../molecule/data'
import { StaticAtomProperties } from '../../../language/properties'

import ElementAddress = Context.ElementAddress

export function queryEach(env: Environment, selection: RuntimeExpression<AtomSelection>, map: RuntimeExpression<AtomSelection>): AtomSelection {
    const builder = AtomSelection.uniqueBuilder();
    for (const atomSet of AtomSelection.atomSets(selection(env))){
        const ctx = Context.ofAtomSet(env.queryCtx, atomSet);
        for (const mappedAtomSet of AtomSelection.atomSets(map(Environment(ctx)))) {
            builder.add(mappedAtomSet);
        }
    }
    return builder.getSeq();
}

export function includeSurroundings(env: Environment, source: RuntimeExpression<AtomSelection>, radius: RuntimeExpression<number>, wholeResidues?: RuntimeExpression<boolean>): AtomSelection {
    const src = source(env);
    const mask = env.queryCtx.mask;
    const findWithin = Model.spatialLookup(env.model).find(mask);
    const r = radius(env);
    const asResidues = wholeResidues && !!wholeResidues(env);
    const { x, y, z } = env.model.positions;
    const { residueIndex } = env.model.atoms;
    const { atomStartIndex, atomEndIndex } = env.model.residues;

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

    return builder.getSeq();
}

export function intersectBy(env: Environment, selection: RuntimeExpression<AtomSelection>, by: RuntimeExpression<AtomSelection>): AtomSelection {
    return selection(env);
}

export function unionBy(env: Environment, selection: RuntimeExpression<AtomSelection>, by: RuntimeExpression<AtomSelection>): AtomSelection {
    return selection(env);
}

export function complement(env: Environment, selection: RuntimeExpression<AtomSelection>, by: RuntimeExpression<AtomSelection>): AtomSelection {
    const builder = AtomSelection.linearBuilder();
    const atomCount = env.model.atoms.count;
    const ctxMask = env.queryCtx.mask;

    for (const atomSet of AtomSelection.atomSets(selection(env))){
        if (AtomSet.count(atomSet) >= ctxMask.size) continue;
        const mask = AtomSet.getMask(atomSet);
        let count = 0;
        for (let i = 0; i < atomCount; i++) {
            if (!mask.has(i) && ctxMask.has(i)) count++;
        }
        if (!count) continue;
        const indices = new Int32Array(count);
        let offset = 0;
        for (let i = 0; i < atomCount; i++) {
            if (!mask.has(i) && ctxMask.has(i)) indices[offset++] = i;
        }
        builder.add(AtomSet(indices));
    }
    return builder.getSeq();
}