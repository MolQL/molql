/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Environment from '../environment'
import Expression from '../expression'
import Context from '../context'
import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import { UniqueArrayBuilder, sortAsc, FastSet, FastMap } from '../../../utils/collections'
import Mask from '../../../utils/mask'
import { Model, Bonds } from '../../../structure/data'
import ElementAddress from '../../data/element-address'
import BondAddress from '../../data/bond-address'
import { defaultBondTest, testBond, BondTest } from './common'

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

export interface IncludeSurroundingsParams {
    selection: Selection,
    radius: Expression<number>,
    atomRadius?: Expression<number>,
    wholeResidues?: Expression<boolean>
}

export function includeSurroundings(env: Environment, params: IncludeSurroundingsParams): AtomSelection {
    const src = params.selection(env);
    const { model, mask } = env.context;
    const findWithin = Model.spatialLookup(model).find(mask);
    const r = params.radius(env);
    const asResidues = !!params.wholeResidues && !!params.wholeResidues(env);
    const { x, y, z } = model.positions;
    const { residueIndex } = model.atoms;
    const { atomOffset } = model.residues;

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
                    for (let j = atomOffset[rI], _j = atomOffset[rI + 1]; j < _j; j++) {
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

interface ExpandConnectedCtx {
    env: Environment,
    model: Model,
    bonds: Bonds,
    mask: Mask,
    slot: BondAddress,
    test: BondTest
}

function _expandFrontierAtoms({ env, mask, bonds, test, slot }: ExpandConnectedCtx, frontier: number[], atoms: UniqueArrayBuilder<number>) {
    const newFrontier: number[] = [];
    const { neighbor, offset: bondAtomOffset, order, flags } = bonds;
    for (const a of frontier) {
        const start = bondAtomOffset[a], end = bondAtomOffset[a + 1];
        for (let i = start; i < end; i++) {
            const b = neighbor[i];
            if (mask.has(b) && testBond(env, slot, a, b, order[i], flags[i], test) && UniqueArrayBuilder.add(atoms, b, b)) newFrontier[newFrontier.length] = b;
        }
    }
    return newFrontier;
}

function _expandAtoms(ctx: ExpandConnectedCtx, atomSet: AtomSet, numLayers: number) {
    if (!numLayers) return atomSet;

    const result = UniqueArrayBuilder<number>();
    let frontier = AtomSet.atomIndices(atomSet) as number[];

    for (const a of frontier) UniqueArrayBuilder.add(result, a, a);

    for (let i = 0; i < numLayers; i++) {
        frontier = _expandFrontierAtoms(ctx, frontier, result);
    }
    sortAsc(result.array);
    return AtomSet(result.array);
}

function _expandFrontierResidues({ env, model, mask, bonds, test, slot }: ExpandConnectedCtx, frontier: number[], residues: UniqueArrayBuilder<number>) {
    const newFrontier: number[] = [];
    const { neighbor, offset: bondAtomOffset, order, flags } = bonds;

    const { atomOffset } = model.residues;
    const { residueIndex } = model.atoms;

    for (const rI of frontier) {
        for (let a = atomOffset[rI], _a = atomOffset[rI + 1]; a < _a; a++) {
            if (!mask.has(a)) continue;

            const start = bondAtomOffset[a], end = bondAtomOffset[a + 1];
            for (let i = start; i < end; i++) {
                const b = neighbor[i];
                if (!mask.has(b)) continue;

                const r = residueIndex[b];
                if (testBond(env, slot, a, b, order[i], flags[i], test) && UniqueArrayBuilder.add(residues, r, r)) newFrontier[newFrontier.length] = r;
            }
        }
    }
    return newFrontier;
}

function _expandResidues(ctx: ExpandConnectedCtx, atomSet: AtomSet, numLayers: number) {
    if (!numLayers) return atomSet;

    const { atomOffset } = ctx.model.residues;
    const { residueIndex } = ctx.model.atoms;

    const residues = UniqueArrayBuilder<number>();
    let frontier: number[] = [];

    for (const a of AtomSet.atomIndices(atomSet)) {
        const rI = residueIndex[a];
        if (UniqueArrayBuilder.add(residues, rI, rI)) frontier[frontier.length] = rI;
    }

    for (let i = 0; i < numLayers; i++) {
        frontier = _expandFrontierResidues(ctx, frontier, residues);
    }

    const { mask } = ctx;
    sortAsc(residues.array);
    const atoms: number[] = [];
    for (let rI of residues.array) {
        for (let a = atomOffset[rI], _a = atomOffset[rI + 1]; a < _a; a++) {
            if (mask.has(a)) atoms[atoms.length] = a;
        }
    }

    return AtomSet(atoms);
}

export interface IncludeConnectedParams {
    selection: Selection,
    bondTest?: Expression<boolean>,
    layerCount?: Expression<number>,
    wholeResidues?: Expression<boolean>
}

export function includeConnected(env: Environment, { selection, layerCount, wholeResidues, bondTest }: IncludeConnectedParams): AtomSelection {
    const src = selection(env);
    const { model, mask } = env.context;
    const bonds = Model.bonds(model);
    const numLayers = Math.max(0, layerCount ? layerCount(env) : 1);
    const asResidues = !!wholeResidues && !!wholeResidues(env);
    const test = bondTest || defaultBondTest;

    const builder = AtomSelection.uniqueBuilder();

    Environment.lockSlot(env, 'bond');

    const ctx: ExpandConnectedCtx = {
        env,
        bonds,
        model,
        mask,
        slot: env.slots.bond,
        test
    };

    for (const atomSet of AtomSelection.atomSets(src)) {
        if (asResidues) builder.add(_expandResidues(ctx, atomSet, numLayers));
        else builder.add(_expandAtoms(ctx, atomSet, numLayers));
    }
    Environment.unlockSlot(env, 'bond');

    return builder.getSelection();
}

export function expandProperty(env: Environment, selection: Selection, property: Expression<any>): AtomSelection {
    const { context } = env;

    const src = selection(env);
    const propertyToSetMap: FastMap<any, UniqueArrayBuilder<number>> = FastMap.create();

    Environment.lockSlot(env, 'element');
    const element = env.slots.element;

    let index = 0;
    const sets: number[][] = [];
    for (const atomSet of AtomSelection.atomSets(src)) {
        for (const a of AtomSet.atomIndices(atomSet)) {
            ElementAddress.setAtom(context.model, element, a);
            const p = property(env);
            if (propertyToSetMap.has(p)) UniqueArrayBuilder.add(propertyToSetMap.get(p)!, index, index);
            else {
                const ub = UniqueArrayBuilder<number>();
                UniqueArrayBuilder.add(ub, index, index);
                propertyToSetMap.set(p, ub);
            }
        }
        sets[index] = [];
        index++;
    }

    const { mask } = context;

    for (let i = 0, _i = context.model.atoms.count; i < _i; i++) {
        if (!mask.has(i)) continue;

        ElementAddress.setAtom(context.model, element, i);
        const p = property(env);
        if (!propertyToSetMap.has(p)) continue;
        for (const setIndex of propertyToSetMap.get(p)!.array) sets[setIndex].push(i);
    }
    Environment.unlockSlot(env, 'element');

    const builder = AtomSelection.uniqueBuilder();
    for (const set of sets) builder.add(AtomSet(set));
    return builder.getSelection();
}