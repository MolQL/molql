/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { FastSet, sortAsc } from './collections'

interface Mask {
    '@type': 'mask'
    size: number;
    has(i: number): boolean;
    /** in-order iteration of all "masked elements". */
    forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx): void;
}

namespace Mask {
    class EmptyMask implements Mask {
        '@type': 'mask'
        size = 0;
        has(i: number) { return false; }
        forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx) { }
        constructor() { }
    }

    class SingletonMask implements Mask {
        '@type': 'mask'
        size = 1;
        has(i: number) { return i === this.idx; }
        forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx) { f(this.idx, ctx); }
        constructor(private idx: number) { }
    }

    class BitMask implements Mask {
        '@type': 'mask'
        private length: number;
        has(i: number) { return i < this.length && !!this.mask[i] as any; }

        private _forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx: Ctx | undefined) {
            for (let i = 0; i < this.length; i++) {
                if (this.mask[i]) f(i, ctx);
            }
        }
        forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx) {
            this._forEach(f, ctx);
        }
        constructor(private mask: number[], public size: number) { this.length = mask.length;  }
    }

    class AllMask implements Mask {
        '@type': 'mask'
        has(i: number) { return true; }
        private _forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx: Ctx | undefined) {
            for (let i = 0; i < this.size; i++) {
                f(i, ctx);
            }
        }
        forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx) {
            this._forEach(f, ctx);
        }
        constructor(public size: number) { }
    }

    class SetMask implements Mask {
        '@type': 'mask'
        private _flat: number[] | undefined = void 0;
        size: number;
        has(i: number) { return this.set.has(i); }

        private _forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx: Ctx | undefined) {
            for (const idx of this._flat!) {
                f(idx, ctx);
            }
        }
        private flatten() {
            if (this._flat) return;
            const indices = new Int32Array(this.size);
            this.set.forEach((i, ctx) => ctx!.indices[ctx!.offset++] = i, { indices, offset: 0 });
            sortAsc(indices);
            this._flat = indices as any as number[];
        }
        forEach<Ctx>(f: (i: number, ctx?: Ctx) => void, ctx?: Ctx) {
            this._forEach(f, ctx);
        }
        constructor(private set: FastSet<number>) {
            this.size = 0;
        }
    }

    export function always(size: number) { return new AllMask(size); }
    export const never = new EmptyMask();

    export function ofSet(set: FastSet<number>): Mask {
        return new SetMask(set);
    }

    export function ofUniqueIndices(indices: ArrayLike<number>): Mask {
        const len = indices.length;
        if (len === 0) return new EmptyMask();
        if (len === 1) return new SingletonMask(indices[0]);

        let max = 0;
        for (const i of (indices as number[])) {
            if (i > max) max = i;
        }
        if (len === max) return new AllMask(len);

        const f = len / max;
        if (f < 1 / 12) {
            const set = FastSet.create<number>();
            for (const i of (indices as number[])) set.add(i);
            return new SetMask(set);
        }

        const mask = new Int8Array(max + 1);
        let size = 0;
        for (const i of (indices as number[])) {
            mask[i] = 1;
        }
        return new BitMask(mask as any, indices.length);
    }

    export function ofMask(mask: number[], size: number): Mask {
        return new BitMask(mask, size);
    }

    export function hasAny(mask: Mask, xs: number[]) {
        for (const x of xs) {
            if (mask.has(x)) return true;
        }
        return false;
    }
}

export default Mask;