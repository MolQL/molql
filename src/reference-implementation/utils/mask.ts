/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { FastSet } from './collections'

interface Mask {
    has(i: number): boolean;
}

namespace Mask {
    class EmptyMask implements Mask {
        has(i: number) { return false; }
        constructor() { }
    }

    class SingletonMask implements Mask {
        has(i: number) { return i === this.idx; }
        constructor(private idx: number) { }
    }

    class BitMask implements Mask {
        private length: number;
        has(i: number) { return i < this.length && !!this.mask[i] as any; }
        constructor(private mask: number[]) { this.length = mask.length;  }
    }

    class AllMask implements Mask {
        has(i: number) { return true; }
        constructor() { }
    }

    export const always = new AllMask();
    export const never = new EmptyMask();

    export function ofSet(set: FastSet<number>): Mask {
        return set;
    }

    export function ofIndices(totalCount: number, indices: ArrayLike<number>): Mask {
        const len = indices.length;
        if (len === 0) return new EmptyMask();
        if (len === 1) return new SingletonMask(indices[0]);
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
        return new BitMask(mask as any);
    }

    export function ofMask(mask: number[]): Mask {
        return new BitMask(mask);
    }

    export function hasAny(mask: Mask, xs: number[]) {
        for (const x of xs) {
            if (mask.has(x)) return true;
        }
        return false;
    }
}

export default Mask;