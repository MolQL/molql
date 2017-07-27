/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Iterator from './iterator'
import Slot from './slot'
import Context from '../query/context'
import AtomSet from '../query/atom-set'

interface Environment {
    readonly queryCtx: Context,

    readonly atom: Iterator<Context.ElementAddress>,
    readonly atomSet: Iterator<AtomSet>,
    readonly iterator: Slot<Iterator>,
    readonly slots: { [index: number]: Slot }
}

function Environment(queryCtx?: {}): Environment {
    return { queryCtx: queryCtx as any, atom: Iterator(), atomSet: Iterator(), iterator: Slot(), slots: Object.create(null) };
}

namespace Environment {
    export function beginSlot({ slots }: Environment, i: number) {
        let slot = slots[i];
        if (!slot) {
            slot = Slot();
            slots[i] = slot;
        }
        return Slot.push(slot);
    }

    export function endSlot({ slots }: Environment, i: number) {
        Slot.pop(slots[i]);
    }

    export function beginIterator<T>(env: Environment, iterator: Iterator<T>, initialValue?: T) {
        Iterator.begin(iterator, initialValue, env.iterator.value);
        Slot.push(env.iterator, iterator);
        return iterator;
    }

    export function endIterator(env: Environment, iterator: Iterator) {
        Iterator.end(iterator);
        Slot.pop(env.iterator);
    }
}

export default Environment;