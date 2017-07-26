/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { AtomSet, AtomSetSeq, Context } from '../query/data'
import { UniqueArrayBuilder, sortAsc, FastMap } from '../utils/collections'

export class HashAtomSetSeqBuilder {
    private atomSets: AtomSet[] = [];
    private byHash = FastMap.create<number, AtomSet[]>();

    add(atomSet: AtomSet) {
        const hash = atomSet.hashCode;

        if (this.byHash.has(hash)) {
            const sets = this.byHash.get(hash)!;

            for (const set of sets) {
                if (AtomSet.areEqual(atomSet, set)) return this;
            }

            this.atomSets[this.atomSets.length] = atomSet;
            sets[sets.length] = atomSet;
        } else {
            this.atomSets[this.atomSets.length] = atomSet;
            this.byHash.set(hash, [atomSet]);
        }

        return this;
    }

    getSeq() {
        return AtomSetSeq(this.ctx, this.atomSets);
    }

    constructor(private ctx: Context) { }
}