/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { UniqueArrayBuilder, sortAsc } from '../../utils/collections'
import { Model } from '../../molecule/data'
import Mask from '../../utils/mask'

interface AtomSet { '@kind'?: 'atom-set' }

function AtomSet(indices: ArrayLike<number>): AtomSet { return AtomSetImpl(indices as ReadonlyArray<number>); }

interface AtomSetImpl extends AtomSet {
    atomIndices: ReadonlyArray<number>
    hashCodeComputed: boolean,
    hashCode: number,
    hierarchy: { residueIndices: number[], chainIndices: number[], entityIndices: number[] } | undefined,
    boundingSphere: { center: [number, number, number], radius: number } | undefined
}

function AtomSetImpl(indices: ArrayLike<number>): AtomSetImpl {
    return {
        atomIndices: indices as ReadonlyArray<number>,
        hashCode: 0,
        hashCodeComputed: false,
        hierarchy: void 0,
        boundingSphere: void 0
    };
}

namespace AtomSet {
    export const empty = AtomSet([]);

    export function count(a: AtomSet) {
        return (a as AtomSetImpl).atomIndices.length;
    }

    export function atomIndices(a: AtomSet) {
        return (a as AtomSetImpl).atomIndices;
    }

    export function getMask(a: AtomSet) {
        return Mask.ofUniqueIndices((a as AtomSetImpl).atomIndices);
    }

    export function areEqual(a: AtomSet, b: AtomSet) {
        const xs = (a as AtomSetImpl).atomIndices, ys = (b as AtomSetImpl).atomIndices;
        if (xs.length !== ys.length) return false;
        if ((a as AtomSetImpl).hashCodeComputed && (b as AtomSetImpl).hashCodeComputed && hashCode(a) !== hashCode(b)) {
            return false;
        }
        for (let i = 0, _i = xs.length; i < _i; i++) {
            if (xs[i] !== ys[i]) return false;
        }
        return true;
    }

    export function ofUnsortedIndices(indices: number[]): AtomSet {
        return AtomSet(sortAsc(indices));
    }

    function atomDistanceSq(x: number[], y: number[], z: number[], i: number, j: number) {
        const dx = x[i] - x[j], dy = y[i] - y[j], dz = z[i] - z[j];
        return dx * dx + dy * dy + dz * dz;
    }

    export function hashCode(atomSet: AtomSet) {
        const impl = atomSet as AtomSetImpl;
        if (impl.hashCodeComputed) return impl.hashCode!;
        let code = 23;
        for (const i of impl.atomIndices) {
            code = (31 * code + i) | 0;
        }
        impl.hashCode = code;
        impl.hashCodeComputed = true;
        return code;
    }

    export function hierarchy(model: Model, atomSet: AtomSet) {
        const impl = atomSet as AtomSetImpl;
        if (impl.hierarchy) return impl.hierarchy;

        const residueIndices = UniqueArrayBuilder<number>();
        const chainIndices = UniqueArrayBuilder<number>();
        const entityIndices = UniqueArrayBuilder<number>();
        const rIndices = model.atoms.residueIndex;
        const cIndices = model.residues.chainIndex;
        const eIndices = model.chains.entityIndex;

        for (const i of impl.atomIndices) { UniqueArrayBuilder.add(residueIndices, rIndices[i], rIndices[i]); }
        for (const i of residueIndices.array) { UniqueArrayBuilder.add(chainIndices, cIndices[i], cIndices[i]); }
        for (const i of chainIndices.array) { UniqueArrayBuilder.add(entityIndices, eIndices[i], eIndices[i]); }

        impl.hierarchy = { residueIndices: residueIndices.array, chainIndices: chainIndices.array, entityIndices: entityIndices.array };
        return impl.hierarchy;
    }

    export function boundingSphere(model: Model, atomSet: AtomSet) {
        const impl = atomSet as AtomSetImpl;
        if (impl.boundingSphere) return impl.boundingSphere;

        const { x, y, z } = model.positions;

        if (impl.atomIndices.length === 1) {
            const i = impl.atomIndices[0];
            impl.boundingSphere = { center: [x[i], y[i], z[i]], radius: 0 };
            return impl.boundingSphere;
        }

        const center: [number, number, number] = [0, 0, 0];
        for (const i of impl.atomIndices) {
            center[0] += x[i];
            center[1] += y[i];
            center[2] += z[i];
        }
        center[0] *= 1 / impl.atomIndices.length;
        center[1] *= 1 / impl.atomIndices.length;
        center[2] *= 1 / impl.atomIndices.length;
        let radius = 0;
        for (const i of impl.atomIndices) {
            const dx = center[0] - x[i], dy = center[1] - y[i], dz = center[2] - z[i];
            radius = Math.max(dx * dx + dy * dy + dz * dz, radius);
        }
        impl.boundingSphere = { center, radius };
        return impl.boundingSphere;
    }

    export function distance(model: Model, a: AtomSet, b: AtomSet) {
        if (a === b) return 0;
        let distSq = Number.POSITIVE_INFINITY;
        const { x, y, z } = model.positions;
        const xs = atomIndices(a), ys = atomIndices(b);
        for (const i of xs) {
            for (const j of ys) {
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

        const xs = atomIndices(a), ys = atomIndices(b);
        for (const i of xs) {
            for (const j of ys) {
                if (atomDistanceSq(x, y, z, i, j) <= dSq) return true;
            }
        }
        return false;
    }

    export function union(a: AtomSet, b: AtomSet): AtomSet {
        const xs = atomIndices(a), ys = atomIndices(b);
        const la = xs.length, lb = ys.length;

        let i = 0, j = 0, count = 0;

        while (i < la && j < lb) {
            const x = xs[i], y = ys[j];
            count++;
            if (x < y) i++;
            else if (x > y) j++;
            else { i++; j++; }
        }
        count += Math.max(la - i, lb - j);

        const indices = new Int32Array(count);
        let offset = 0;
        i = 0;
        j = 0;
        while (i < la && j < lb) {
            const x = xs[i], y = ys[j];
            count++;
            if (x < y) { indices[offset++] = x; i++; }
            else if (x > y) { indices[offset++] = y; j++; }
            else { indices[offset++] = x; i++; j++; }
        }
        for (; i < la; i++) indices[offset++] = xs[i];
        for (; j < lb; j++) indices[offset++] = ys[j];

        return AtomSet(indices);
    }
}

export default AtomSet