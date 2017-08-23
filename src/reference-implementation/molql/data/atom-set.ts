/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { sortAsc } from '../../utils/collections'
import { Model } from '../../structure/data'
import Mask from '../../utils/mask'

type AtomSet = number | ArrayAtomSet

function AtomSet(indices: number | ArrayLike<number>): AtomSet {
    if (typeof indices === 'number') return indices;
    if (indices.length === 1) return indices[0];
    return ArrayAtomSet(indices as ReadonlyArray<number>);
}

interface ArrayAtomSet {
    atomIndices: ReadonlyArray<number>
    hashCodeComputed: boolean,
    hashCode: number,
    //hierarchy: { residueIndices: number[], chainIndices: number[], entityIndices: number[] } | undefined,
    boundingSphere: { center: [number, number, number], radius: number } | undefined
}

function ArrayAtomSet(indices: ArrayLike<number>): ArrayAtomSet {
    return {
        atomIndices: indices as ReadonlyArray<number>,
        hashCode: 0,
        hashCodeComputed: false,
        boundingSphere: void 0
    };
}

namespace AtomSet {
    export interface Iterator {
        [Symbol.iterator](): Iterator,
        done: boolean;
        value: number;
        next(): { done: boolean, value: number }
        reset(atomSet: AtomSet): Iterator;
    }

    class IteratorImpl implements Iterator {
        done = true;
        value = 0;

        private atomSet: AtomSet = void 0 as any;
        private index: number = -1;
        private length: number = 0;

        [Symbol.iterator]() { return this };

        next() {
            const index = ++this.index;
            if (typeof this.atomSet === 'number') {
                this.done = this.index > 0;
            } else {
                if (index >= this.length) {
                    this.done = true;
                } else {
                    this.value = this.atomSet.atomIndices[index];
                }
            }
            return this;
        }

        reset(atomSet: AtomSet) {
            if (typeof atomSet === 'number') {
                this.value = atomSet;
                this.length = 1;
            } else {
                const ind = atomSet.atomIndices;
                this.value = ind[0];
                this.length = ind.length;
            }
            this.done = false;
            this.atomSet = atomSet;
            this.index = -1;
            return this;
        }
    }

    export function Iterator(): Iterator { return new IteratorImpl(); }

    export namespace Iterator {
        export function start(it: Iterator, atomSet: AtomSet) { return it.reset(atomSet).next().value; }
    }

    export function count(a: AtomSet) {
        return typeof a === 'number' ? 1 : a.atomIndices.length;
    }

    export function toIndices(a: AtomSet): ReadonlyArray<number> {
        return typeof a === 'number' ? [a] : a.atomIndices;
    }

    export function getMask(a: AtomSet) {
        return typeof a === 'number' ? Mask.singleton(a) : Mask.ofUniqueIndices(a.atomIndices);
    }

    const itA = Iterator(), itB = Iterator();
    export function areEqual(a: AtomSet, b: AtomSet) {
        const cnt = count(a);
        if (cnt !== count(b)) return false;
        Iterator.start(itA, a);
        Iterator.start(itB, b);
        for (let i = 0; i < cnt; i++) {
            if (itA.value !== itB.value) return false;
            itA.next();
            itB.next();
        }
        return true;
    }

    export function ofUnsortedIndices(indices: number[]): AtomSet {
        return AtomSet(sortAsc(indices));
    }

    export function atomDistanceSq(x: number[], y: number[], z: number[], i: number, j: number) {
        const dx = x[i] - x[j], dy = y[i] - y[j], dz = z[i] - z[j];
        return dx * dx + dy * dy + dz * dz;
    }

    function computeHashCode(atomSet: ArrayAtomSet) {
        let code = 23;
        for (const i of atomSet.atomIndices) {
            code = (31 * code + i) | 0;
        }
        atomSet.hashCode = code;
        atomSet.hashCodeComputed = true;
        return code;
    }

    export function hashCode(atomSet: AtomSet) {
        if (typeof atomSet === 'number') return atomSet;
        if (atomSet.hashCodeComputed) return atomSet.hashCode!;
        return computeHashCode(atomSet);
    }

    // export function hierarchy(model: Model, atomSet: AtomSet) {
    //     const impl = atomSet as AtomSetImpl;
    //     if (impl.hierarchy) return impl.hierarchy;

    //     const residueIndices = UniqueArrayBuilder<number>();
    //     const chainIndices = UniqueArrayBuilder<number>();
    //     const entityIndices = UniqueArrayBuilder<number>();
    //     const rIndices = model.atoms.residueIndex;
    //     const cIndices = model.residues.chainIndex;
    //     const eIndices = model.chains.entityIndex;

    //     for (const i of impl.atomIndices) { UniqueArrayBuilder.add(residueIndices, rIndices[i], rIndices[i]); }
    //     for (const i of residueIndices.array) { UniqueArrayBuilder.add(chainIndices, cIndices[i], cIndices[i]); }
    //     for (const i of chainIndices.array) { UniqueArrayBuilder.add(entityIndices, eIndices[i], eIndices[i]); }

    //     impl.hierarchy = { residueIndices: residueIndices.array, chainIndices: chainIndices.array, entityIndices: entityIndices.array };
    //     return impl.hierarchy;
    // }

    function computeBoundingSphere(model: Model, atomSet: ArrayAtomSet) {
        const { x, y, z } = model.positions;
        if (atomSet.atomIndices.length === 1) {
            const i = atomSet.atomIndices[0];
            atomSet.boundingSphere = { center: [x[i], y[i], z[i]], radius: 0 };
            return atomSet.boundingSphere;
        }

        const center: [number, number, number] = [0, 0, 0];
        for (const i of atomSet.atomIndices) {
            center[0] += x[i];
            center[1] += y[i];
            center[2] += z[i];
        }
        center[0] *= 1 / atomSet.atomIndices.length;
        center[1] *= 1 / atomSet.atomIndices.length;
        center[2] *= 1 / atomSet.atomIndices.length;
        let radius = 0;
        for (const i of atomSet.atomIndices) {
            const dx = center[0] - x[i], dy = center[1] - y[i], dz = center[2] - z[i];
            radius = Math.max(dx * dx + dy * dy + dz * dz, radius);
        }
        atomSet.boundingSphere = { center, radius };
        return atomSet.boundingSphere;
    }

    export function boundingSphere(model: Model, atomSet: AtomSet) {
        if (typeof atomSet === 'number') {
            const { x, y, z } = model.positions;
            return { center: [x[atomSet], y[atomSet], z[atomSet]], radius: 0 };
        }

        if (atomSet.boundingSphere) return atomSet.boundingSphere;
        return computeBoundingSphere(model, atomSet);
    }

    export function distance(model: Model, a: AtomSet, b: AtomSet) {
        if (a === b) return 0;
        let distSq = Number.POSITIVE_INFINITY;
        const { x, y, z } = model.positions;
        for (let i = Iterator.start(itA, a); !itA.done; i = itA.next().value) {
            for (let j = Iterator.start(itB, b); !itB.done; j = itB.next().value) {
                const d = atomDistanceSq(x, y, z, i, j);
                if (d < distSq) distSq = d;
            }
        }
        return Math.sqrt(distSq);
    }

    export function areWithin(model: Model, a: AtomSet, b: AtomSet, maxDistance: number) {
        if (a === b) return true;
        const dSq = maxDistance * maxDistance;
        const { x, y, z } = model.positions;

        for (let i = Iterator.start(itA, a); !itA.done; i = itA.next().value) {
            for (let j = Iterator.start(itB, b); !itB.done; j = itB.next().value) {
                if (atomDistanceSq(x, y, z, i, j) <= dSq) return true;
            }
        }
        return false;
    }

    export function union(a: AtomSet, b: AtomSet): AtomSet {
        const la = count(a), lb = count(b);

        let i = 0, j = 0, resultSize = 0;

        Iterator.start(itA, a);
        Iterator.start(itB, b);

        while (i < la && j < lb) {
            const x = itA.value, y = itB.value;
            resultSize++;
            if (x < y) { itA.next(); i++; }
            else if (x > y) { itB.next(); j++; }
            else { i++; j++; itA.next(); itB.next(); }
        }
        resultSize += Math.max(la - i, lb - j);

        const indices = new Int32Array(resultSize);
        let offset = 0;
        i = 0;
        j = 0;
        Iterator.start(itA, a);
        Iterator.start(itB, b);
        while (i < la && j < lb) {
            const x = itA.value, y = itB.value;
            resultSize++;
            if (x < y) { indices[offset++] = x; i++; itA.next(); }
            else if (x > y) { indices[offset++] = y; j++; itB.next(); }
            else { indices[offset++] = x; i++; j++; itA.next(); itB.next();  }
        }
        for (; i < la; i++) { indices[offset++] = itA.value; itA.next(); }
        for (; j < lb; j++) { indices[offset++] = itB.value; itB.next(); }

        return AtomSet(indices);
    }
}

export default AtomSet