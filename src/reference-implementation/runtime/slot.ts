/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

interface Slot<T = any> { value?: T, '@stack': T[] }

function Slot<T = any>(): Slot<T> { return { value: void 0 as any, '@stack': [] }; }

namespace Slot {
    export function push<T>(slot: Slot<T>, value?: T): Slot<T> {
        if (slot.value !== void 0) slot['@stack'].push(slot.value);
        slot.value = value;
        return slot;
    }
    export function pop(slot: Slot) {
        const stack = slot['@stack'];
        slot.value = stack.length ? stack.pop() : void 0;
        return slot.value;
    }
}

export default Slot;