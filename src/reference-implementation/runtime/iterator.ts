/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Invariants = { [id: string]: any }
type Iterator<T = any> = { value: T, isIterating: boolean, _parent?: Iterator, _invariants: Invariants }

function Iterator(): Iterator { return { value: void 0, isIterating: false, _parent: void 0, _invariants: void 0 as any }; }

namespace Iterator {
    function noNestedIterators() {
        throw new Error('Nested iterators are not supported.');
    }

    export function begin<T>(iterator: Iterator, initialValue?: T, parent?: Iterator): Iterator<T> {
        if (iterator.isIterating) noNestedIterators();

        iterator.isIterating = true;
        iterator.value = initialValue;
        iterator._invariants = Object.create(null);
        iterator._parent = parent;
        return iterator;
    }

    export function end(iterator: Iterator) {
        iterator.isIterating = false;
        iterator.value = void 0;
        iterator._invariants = void 0 as any;
        iterator._parent = void 0;
    }

    export function getInvariant<T = any>({ _invariants, _parent }: Iterator, id: number): T | undefined {
        const inv = _invariants && _invariants[id];
        if (inv) return inv;
        return _parent && getInvariant(_parent, id);
    }

    export function setInvariant({ _invariants }: Iterator, id: number, value: any) {
        _invariants[id] = value;
    }
}

export default Iterator;