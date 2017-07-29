/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { UniqueArrayBuilder, sortAsc, FastMap, FastSet } from '../utils/collections'
import Mask from '../utils/mask'
import Context from './context'
import AtomSet from './atom-set'

type AtomSelection = { context: Context, atomSets: AtomSet[] }
function AtomSelection(context: Context, atomSets: AtomSet[]): AtomSelection { return { context, atomSets }; }

namespace AtomSelection {
    export function flatten(seq: AtomSelection): AtomSet {
        if (!seq.atomSets.length) return AtomSet(seq.context, []);
        if (seq.atomSets.length === 1) return seq.atomSets[0];

        const mask = getMask(seq);
        const atoms = new Int32Array(mask.size) ;
        let offset = 0;
        for (let i = 0, _i = seq.context.model.atoms.count; i < _i ; i++) {
            if (mask.has(i)) atoms[offset++] = i;
        }
        return AtomSet(seq.context, sortAsc(atoms));
    }

    export function getMask(seq: AtomSelection) {
        const count = seq.context.model.atoms.count;
        if (!seq.atomSets.length) return Mask.never;
        if (seq.atomSets.length === 1) return Mask.ofUniqueIndices(count, seq.atomSets[0].atomIndices);

        let estSize = 0;
        for (const atomSet of seq.atomSets) {
            estSize += atomSet.atomIndices.length;
        }

        if ((estSize / count) > (1 / 12)) {
            const mask = new Uint8Array(count);
            let size = 0;
            for (const atomSet of seq.atomSets) {
                for (const a of atomSet.atomIndices) {
                    if (mask[a]) continue;
                    mask[a] = 1;
                    size++;
                }
            }
            return Mask.ofMask(mask as any as number[], size);
        } else {
            const mask = FastSet.create<number>();
            for (const atomSet of seq.atomSets) {
                for (const a of atomSet.atomIndices) {
                    mask.add(a);
                }
            }
            return Mask.ofSet(mask);
        }
    }

    export interface Builder { add(atomSet: AtomSet): Builder, getSeq(): AtomSelection }

    class LinearSelectionBuilder implements Builder {
        private atomSets: AtomSet[] = [];

        add(atomSet: AtomSet) {
            this.atomSets.push(atomSet);
            return this;
        }

        getSeq() {
            return AtomSelection(this.ctx, this.atomSets);
        }

        constructor(private ctx: Context) { }
    }

    class HashSelectionBuilder implements Builder {
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
            return AtomSelection(this.ctx, this.atomSets);
        }

        constructor(private ctx: Context) { }
    }

    export function uniqueBuilder(ctx: Context): Builder {
        return new HashSelectionBuilder(ctx);
    }

    export function linearBuilder(ctx: Context): Builder {
        return new LinearSelectionBuilder(ctx);
    }
}

export default AtomSelection