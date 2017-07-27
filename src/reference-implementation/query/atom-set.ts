/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { UniqueArrayBuilder, sortAsc } from '../utils/collections'
import Context from './context'

interface AtomSet {
    readonly context: Context,
    readonly hashCode: number,
    readonly atomIndices: ReadonlyArray<number>,
    readonly residueIndices: ReadonlyArray<number>,
    readonly chainIndices: ReadonlyArray<number>,
    readonly entityIndices: ReadonlyArray<number>,
    readonly boundingSphere: { center: [number, number, number], radius: number }
}

function AtomSet(ctx: Context, indices: number[]): AtomSet { return new AtomSetImpl(ctx, indices); }

class AtomSetImpl implements AtomSet {
    private _hashCode = 0;
    private _hashComputed = false;

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

    private _boundingSphere: AtomSet['boundingSphere'] | undefined = void 0;
    private computeBoundingSphere() {
        if (this._boundingSphere) return this._boundingSphere;

        const { x, y, z } = this.context.model.positions;
        const center: AtomSet['boundingSphere']['center'] = [0, 0, 0];
        for (const i of this.atomIndices) {
            center[0] += x[i];
            center[1] += y[i];
            center[2] += z[i];
        }
        center[0] *= 1 / this.atomIndices.length;
        center[1] *= 1 / this.atomIndices.length;
        center[2] *= 1 / this.atomIndices.length;
        let radius = 0;
        for (const i of this.atomIndices) {
            const dx = center[0] - x[i], dy = center[1] - y[i], dz = center[2] - z[i];
            radius = Math.max(dx * dx + dy * dy + dz * dz, radius);
        }
        this._boundingSphere = { center, radius };
    }

    get boundingSphere() {
        return this.computeBoundingSphere()!;
    }
}

namespace AtomSet {
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

export default AtomSet