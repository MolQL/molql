/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Invariants = { [id: string]: any }
type Iterator<T = any> = { value: T, isIterating: boolean, '@parent'?: Iterator, '@invariants'?: Invariants }

function Iterator(): Iterator { return { value: void 0, isIterating: false, '@parent': void 0, '@invariants': void 0 }; }

namespace Iterator {
    function noNestedIterators() {
        throw new Error('Nested iterators of the same type are not supported, son.');
    }

    export function begin<T>(iterator: Iterator, initialValue?: T, parent?: Iterator): Iterator<T> {
        if (iterator.isIterating) noNestedIterators();

        iterator.isIterating = true;
        iterator.value = initialValue;
        iterator['@invariants'] = Object.create(null);
        iterator['@parent'] = parent;
        return iterator;
    }

    export function end(iterator: Iterator) {
        iterator.isIterating = false;
        iterator.value = void 0;
        iterator['@invariants'] = void 0;
        iterator['@parent'] = void 0;
    }

    export function getInvariant(iterator: Iterator, id: number): any {
        const invariants = iterator['@invariants'];
        const inv = invariants && invariants[id];
        if (inv) return inv;
        const parent = iterator['@parent']
        return parent && getInvariant(parent, id);
    }

    export function setInvariant(iterator: Iterator, id: number, value: any) {
        iterator['@invariants']![id] = value;
    }
}

export default Iterator;