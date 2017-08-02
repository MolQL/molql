/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { UniqueArrayBuilder, sortAsc, FastMap, FastSet } from '../../utils/collections'
import Mask from '../../utils/mask'
import Context from '../runtime/context'
import AtomSet from './atom-set'

interface AtomSelection { '@type'?: 'atom-selection' }

function AtomSelection(atomSets: AtomSet[]): AtomSelection { return AtomSelectionImpl(atomSets); }

interface AtomSelectionImpl extends AtomSelection {
    atomSets: AtomSet[]
}

function AtomSelectionImpl(atomSets: AtomSet[]): AtomSelectionImpl { return { atomSets }; }

namespace AtomSelection {
    export const empty = AtomSelection([]);

    export function atomSets(selection: AtomSelection) { return (selection as AtomSelectionImpl).atomSets; }

    export function toAtomSet(seq: AtomSelection): AtomSet {
        const sets = atomSets(seq);
        const length = sets.length;
        if (!length) return AtomSet.empty;
        if (length === 1) return sets[0];

        const mask = getMask(seq);
        const atoms = new Int32Array(mask.size);
        mask.forEach((i, ctx) => ctx!.atoms[ctx!.offset++] = i, { atoms, offset: 0 });
        return AtomSet(sortAsc(atoms));
    }

    export function getMask(seq: AtomSelection): Mask {
        const sets = atomSets(seq);
        if (!sets.length) return Mask.never;
        if (sets.length === 1) return AtomSet.getMask(sets[0]);

        let estSize = 0, max = 0;
        for (const atomSet of sets) {
            estSize += AtomSet.count(atomSet);
            for (const i of AtomSet.atomIndices(atomSet)) {
                if (i > max) max = i;
            }
        }

        if ((estSize / max) > (1 / 12)) {
            const mask = new Uint8Array(max + 1);
            let size = 0;
            for (const atomSet of sets) {
                for (const a of AtomSet.atomIndices(atomSet)) {
                    if (mask[a]) continue;
                    mask[a] = 1;
                    size++;
                }
            }
            return Mask.ofMask(mask as any as number[], size);
        } else {
            const mask = FastSet.create<number>();
            for (const atomSet of sets) {
                for (const a of AtomSet.atomIndices(atomSet)) {
                    mask.add(a);
                }
            }
            return Mask.ofSet(mask);
        }
    }

    export interface Builder { add(atomSet: AtomSet): Builder, getSelection(): AtomSelection }

    class LinearSelectionBuilder implements Builder {
        private atomSets: AtomSet[] = [];

        add(atomSet: AtomSet) {
            this.atomSets.push(atomSet);
            return this;
        }

        getSelection() {
            return AtomSelection(this.atomSets);
        }

        constructor() { }
    }

    class HashSelectionBuilder implements Builder {
        private atomSets: AtomSet[] = [];
        private byHash = FastMap.create<number, AtomSet[]>();

        add(atomSet: AtomSet) {
            const hash = AtomSet.hashCode(atomSet);

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

        getSelection() {
            return AtomSelection(this.atomSets);
        }

        constructor() { }
    }

    export function uniqueBuilder(): Builder {
        return new HashSelectionBuilder();
    }

    export function linearBuilder(): Builder {
        return new LinearSelectionBuilder();
    }
}

export default AtomSelection