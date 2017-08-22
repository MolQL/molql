/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { sortAsc } from '../../utils/collections'
import { Model } from '../../structure/data'
import Mask from '../../utils/mask'

type AtomSet = number | ArrayAtomSet

function AtomSet(indices: ArrayLike<number>): AtomSet {
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
    export function singleton(a: number): AtomSet { return a; }

    export function count(a: AtomSet) {
        return typeof a === 'number' ? 1 : a.atomIndices.length;
    }

    export function getIndices(a: AtomSet): ReadonlyArray<number> {
        return typeof a === 'number' ? [a] : a.atomIndices;
    }

    // export function atomIndices(a: AtomSet) {
    //     return (a as AtomSetImpl).atomIndices;
    // }

    export function getMask(a: AtomSet) {
        return typeof a === 'number' ? Mask.singleton(a) : Mask.ofUniqueIndices(a.atomIndices);
    }

    const gItA = Iterator(), gItB = Iterator();
    export function areEqual(a: AtomSet, b: AtomSet) {
        const cnt = count(a);
        if (cnt !== count(b)) return false;
        Iterator.init(gItA, a);
        Iterator.init(gItB, b);
        for (let i = 0; i < cnt; i++) {
            if (gItA.value !== gItB.value) return false;
            Iterator.getNext(gItA);
            Iterator.getNext(gItB);
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

    export function hashCode(atomSet: AtomSet) {
        if (typeof atomSet === 'number') return atomSet;

        if (atomSet.hashCodeComputed) return atomSet.hashCode!;
        let code = 23;
        for (const i of atomSet.atomIndices) {
            code = (31 * code + i) | 0;
        }
        atomSet.hashCode = code;
        atomSet.hashCodeComputed = true;
        return code;
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

    export function boundingSphere(model: Model, atomSet: AtomSet) {
        const { x, y, z } = model.positions;
        if (typeof atomSet === 'number') {
            return { center: [x[atomSet], y[atomSet], z[atomSet]], radius: 0 };
        }

        if (atomSet.boundingSphere) return atomSet.boundingSphere;


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

    export function distance(model: Model, a: AtomSet, b: AtomSet) {
        if (a === b) return 0;
        let distSq = Number.POSITIVE_INFINITY;
        const { x, y, z } = model.positions;
        for (let i = Iterator.init(gItA, a); !gItA.done; i = Iterator.getNext(gItA)) {
            for (let j = Iterator.init(gItB, b); !gItB.done; j = Iterator.getNext(gItB)) {
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

        for (let i = Iterator.init(gItA, a); !gItA.done; i = Iterator.getNext(gItA)) {
            for (let j = Iterator.init(gItB, b); !gItB.done; j = Iterator.getNext(gItB)) {
                if (atomDistanceSq(x, y, z, i, j) <= dSq) return true;
            }
        }
        return false;
    }

    export function union(a: AtomSet, b: AtomSet): AtomSet {
        //const xs = (a as AtomSetImpl).atomIndices, ys = (b as AtomSetImpl).atomIndices;
        const la = count(a), lb = count(b);

        let i = 0, j = 0, resultSize = 0;

        Iterator.init(gItA, a);
        Iterator.init(gItB, b);

        while (i < la && j < lb) {
            const x = gItA.value, y = gItB.value;
            resultSize++;
            if (x < y) { Iterator.getNext(gItA); i++; }
            else if (x > y) { Iterator.getNext(gItB); j++; }
            else { i++; j++; Iterator.getNext(gItA); Iterator.getNext(gItB); }
        }
        resultSize += Math.max(la - i, lb - j);

        const indices = new Int32Array(resultSize);
        let offset = 0;
        i = 0;
        j = 0;
        Iterator.init(gItA, a);
        Iterator.init(gItB, b);
        while (i < la && j < lb) {
            const x = gItA.value, y = gItB.value;
            resultSize++;
            if (x < y) { indices[offset++] = x; i++; Iterator.getNext(gItA); }
            else if (x > y) { indices[offset++] = y; j++; Iterator.getNext(gItB); }
            else { indices[offset++] = x; i++; j++;  Iterator.getNext(gItA); Iterator.getNext(gItB);  }
        }
        for (; i < la; i++) { indices[offset++] = gItA.value; Iterator.getNext(gItA); }
        for (; j < lb; j++) { indices[offset++] = gItB.value; Iterator.getNext(gItB); }

        return AtomSet(indices);
    }

    export interface Iterator {
        done: boolean,
        value: number
    }

    interface IteratorImpl extends Iterator {
        atomSet: AtomSet,
        index: number,
        count: number
    }

    export function Iterator(): Iterator { const it: IteratorImpl = { done: true, value: 0, atomSet: void 0 as any, index: 0, count: 0 }; return it as Iterator; }

    export namespace Iterator {
        export function getNext(iterator: Iterator) {
            if (typeof (iterator as IteratorImpl).atomSet === 'number') {
                iterator.done = true;
                return iterator.value;

            }
            const index = ++(iterator as IteratorImpl).index;
            if (index >= (iterator as IteratorImpl).count) {
                iterator.done = true;
            } else {
                iterator.value = ((iterator as IteratorImpl).atomSet as ArrayAtomSet).atomIndices[index];
            }
            return iterator.value;
        }

        export function init(iterator: Iterator, atomSet: AtomSet) {
            if (typeof atomSet === 'number') {
                iterator.value = atomSet;
                (iterator as IteratorImpl).count = 1;
            } else {
                const ind = atomSet.atomIndices;
                iterator.value = ind[0];
                (iterator as IteratorImpl).count = ind.length;
            }
            iterator.done = false;
            (iterator as IteratorImpl).atomSet = atomSet;
            (iterator as IteratorImpl).index = 0;
            return iterator.value;
        }

        export function forSet(atomSet: AtomSet): Iterator {
            if (typeof atomSet === 'number') { 
                const it: IteratorImpl = { done: false, value: atomSet, atomSet, index: 0, count: 1 };
                return it as Iterator;
            } else {
                const ind = atomSet.atomIndices;
                const it: IteratorImpl = { done: false, value: ind[0], atomSet, index: 0, count: ind.length };
                return it as Iterator;
            }
        }
    }
}

export default AtomSet