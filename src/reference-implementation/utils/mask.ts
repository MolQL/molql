/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { FastSet } from './collections'

interface Mask {
    size: number;
    has(i: number): boolean;
}

namespace Mask {
    class EmptyMask implements Mask {
        has(i: number) { return false; }
        constructor(public size: number) { }
    }

    class SingletonMask implements Mask {
        has(i: number) { return i === this.idx; }
        constructor(private idx: number, public size: number) { }
    }

    class BitMask implements Mask {
        has(i: number) { return <any>this.mask[i]; }
        constructor(private mask: Int8Array, public size: number) { }
    }

    class AllMask implements Mask {
        has(i: number) { return true; }
        constructor(public size: number) { }
    }

    export function always(size: number) {
        return new AllMask(size);
    }

    export function never(size: number) {
        return new EmptyMask(size);
    }

    export function ofSet(set: FastSet<number>): Mask {
        return set;
    }

    export function ofIndices(totalCount: number, indices: ArrayLike<number>): Mask {
        const len = indices.length;
        if (len === 0) return new EmptyMask(totalCount);
        if (len === 1) return new SingletonMask(indices[0], totalCount);
        const f = len / totalCount;
        if (f < 1 / 12) {
            const set = FastSet.create();
            for (const i of (indices as number[])) set.add(i);
            return set;
        }

        const mask = new Int8Array(totalCount);
        for (const i of (indices as number[])) {
            mask[i] = 1;
        }
        return new BitMask(mask, len);
    }

    export function hasAny(mask: Mask, xs: number[]) {
        for (const x of xs) {
            if (mask.has(x)) return true;
        }
        return false;
    }
}

export default Mask;