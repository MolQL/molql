/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

type Iterator<T = any> = { value: T, '@isIterating': boolean }

function Iterator(): Iterator { return { value: void 0, '@isIterating': false }; }

namespace Iterator {
    function noNestedIterators() {
        throw new Error('Iterators of the same type cannot be nested.');
    }

    export function begin<T>(iterator: Iterator, initialValue?: T): Iterator<T> {
        if (iterator['@isIterating']) noNestedIterators();

        iterator['@isIterating'] = true;
        iterator.value = initialValue;
        return iterator;
    }

    export function end(iterator: Iterator) {
        iterator['@isIterating'] = false;
        iterator.value = void 0;
    }
}

export default Iterator;