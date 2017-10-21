/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

interface LinkedIndex {
    head: number,
    prev: number[],
    next: number[]
}

function LinkedIndex(size: number): LinkedIndex {
    const ret: LinkedIndex = {
        head: size > 0 ? 0 : -1,
        prev: new Int32Array(size) as any as number[],
        next: new Int32Array(size) as any as number[],
    };

    for (let i = 0; i < size; i++) {
        ret.next[i] = i + 1;
        ret.prev[i] = i - 1;
    }
    ret.prev[0] = -1;
    ret.next[size - 1] = -1;

    return ret;
}

namespace LinkedIndex {
    export function has(idx: LinkedIndex, i: number) {
        return idx.prev[i] >= 0 || idx.next[i] >= 0 || idx.head === i;
    }

    export function remove(index: LinkedIndex, i: number) {
        const { prev, next } = index;
        const p = prev[i], n = next[i];
        if (p >= 0) {
            next[p] = n;
            prev[i] = -1;
        }
        if (n >= 0) {
            prev[n] = p;
            next[i] = -1;
        }
        if (i === index.head) {
            if (p < 0) index.head = n;
            else index.head = p;
        }
    }
}

export default LinkedIndex;