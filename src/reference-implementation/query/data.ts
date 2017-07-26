/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import * as MolData from '../molecule/data'
import Mask from '../utils/mask'
import { UniqueArrayBuilder, sortAsc, FastMap } from '../utils/collections'

export interface AtomAddress { atom: number, residue: number, chain: number, entity: number }

export interface AtomSet {
    readonly context: Context,
    readonly hashCode: number,
    readonly atomIndices: ReadonlyArray<number>,
    readonly residueIndices: ReadonlyArray<number>,
    readonly chainIndices: ReadonlyArray<number>,
    readonly entityIndices: ReadonlyArray<number>,
    readonly center: [number, number, number],
    readonly radius: number
}

export function AtomSet(ctx: Context, indices: number[]): AtomSet { return new AtomSetImpl(ctx, indices); }

export type AtomSetSeq = { context: Context, atomSets: AtomSet[] }
export function AtomSetSeq(context: Context, atomSets: AtomSet[]): AtomSetSeq { return { context, atomSets }; }

export interface Context {
    readonly model: MolData.Model,
    readonly data: MolData.Model['data'],
    readonly mask: Mask
}

export function Context(model: MolData.Model, mask: Mask): Context {
    return { model, data: model.data, mask };
}

export namespace Context {
    export function ofAtomSet(model: MolData.Model, atomSet: AtomSet) {
        return Context(model, Mask.ofIndices(model.atoms.count, atomSet.atomIndices));
    }

    export function ofAtomSetSeq(model: MolData.Model, atomSetSeq: AtomSetSeq) {
        const mask = new Set<number>();
        for (const atomSet of atomSetSeq.atomSets) {
            for (const a of atomSet.atomIndices) {
                mask.add(a);
            }
        }
        return Context(model, mask);
    }

    export function ofModel(model: MolData.Model) {
        return Context(model, Mask.always(model.atoms.count));
    }
}

class AtomSetImpl implements AtomSet {
    private _hashCode = 0;
    private _hashComputed = false;
    /**
     * The hash code of the fragment.
     */
    get hashCode() {
        if (this._hashComputed) return this._hashCode;

        let code = 23;
        for (let i of this.atomIndices) {
            code = (31 * code + i) | 0;
        }

        this._hashCode = code;
        this._hashComputed = true;

        return code;
    }

    get residueIndices(): number[] {
        this.computeIndices();
        return this._residueIndices;
    }

    get chainIndices(): number[] {
        this.computeIndices();
        return this._chainIndices;
    }

    get entityIndices(): number[] {
        this.computeIndices();
        return this._chainIndices;
    }

    constructor(public context: Context, public atomIndices: ReadonlyArray<number>) {
    }

    private _residueIndices: number[];
    private _chainIndices: number[];
    private _entityIndices: number[];

    private computeIndices() {
        if (this._residueIndices) return;

        const residueIndices = UniqueArrayBuilder<number>();
        const chainIndices = UniqueArrayBuilder<number>();
        const entityIndices = UniqueArrayBuilder<number>();
        const rIndices = this.context.model.atoms.residueIndex;
        const cIndices = this.context.model.residues.chainIndex;
        const eIndices = this.context.model.chains.entityIndex;

        for (const i of this.atomIndices) { UniqueArrayBuilder.add(residueIndices, rIndices[i], rIndices[i]); }
        for (const i of residueIndices.array) { UniqueArrayBuilder.add(chainIndices, cIndices[i], cIndices[i]); }
        for (const i of chainIndices.array) { UniqueArrayBuilder.add(entityIndices, eIndices[i], eIndices[i]); }

        this._residueIndices = residueIndices.array;
        this._chainIndices = chainIndices.array;
        this._entityIndices = entityIndices.array;
    }

    private _center: [number, number, number] = [0.1, 0.1, 0.1]
    private _radius: number = -1;
    private computeBoundary() {
        if (this._radius >= 0) return;

        const { x, y, z } = this.context.model.positions;
        for (const i of this.atomIndices) {
            throw 'implement me properly'
        }
    }

    get center() {
        this.computeBoundary();
        return this._center;
    }

    get radius() {
        this.computeBoundary();
        return this._radius;
    }
}

export namespace AtomSet {
    export function areEqual(a: AtomSet, b: AtomSet) {
        const xs = a.atomIndices, ys = b.atomIndices;
        if (xs.length !== ys.length) return false;
        for (let i = 0, _i = xs.length; i < _i; i++) {
            if (xs[i] !== ys[i]) return false;
        }
        return true;
    }

    export function ofUnsortedIndices(ctx: Context, indices: number[]): AtomSet {
        return AtomSet(ctx, sortAsc(indices));
    }

    export function distance(a: AtomSet, b: AtomSet) {
        return 0;
    }

    function atomDistanceSq(x: number[], y: number[], z: number[], i: number, j: number) {
        const dx = x[i] - x[j], dy = y[i] - y[j], dz = z[i] - z[j];
        return dx * dx + dy * dy + dz * dz;
    }

    export function areWithin(a: AtomSet, b: AtomSet, maxDistance: number) {
        const dSq = maxDistance * maxDistance;
        const { x, y, z } = a.context.model.positions;
        for (const i of a.atomIndices) {
            for (const j of b.atomIndices) {
                if (atomDistanceSq(x, y, z, i, j) < dSq) return true;
            }
        }
        return false;
    }
}

export namespace AtomSetSeq {
    export function flatten(seq: AtomSetSeq): AtomSet {
        if (!seq.atomSets.length) return AtomSet(seq.context, []);
        if (seq.atomSets.length === 1) return seq.atomSets[0];

        const atoms = UniqueArrayBuilder<number>();
        for (const set of seq.atomSets) {
            for (const atom of set.atomIndices) {
                UniqueArrayBuilder.add(atoms, atom, atom);
            }
        }
        return AtomSet(seq.context, sortAsc(atoms.array));
    }
}