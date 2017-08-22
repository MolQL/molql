/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { sortAsc, FastMap, FastSet } from '../../utils/collections'
import Mask from '../../utils/mask'
import { Model } from '../../structure/data'
import SpatialLookup, { FindFunc } from '../../utils/spatial-lookup'
import AtomSet from './atom-set'

import AtomSetIt = AtomSet.Iterator

interface AtomSelection { '@type'?: 'atom-selection' }

function AtomSelection(atomSets: AtomSet[]): AtomSelection { return AtomSelectionImpl(atomSets); }

interface AtomSelectionImpl extends AtomSelection {
    atomSets: AtomSet[]
}

function AtomSelectionImpl(atomSets: AtomSet[]): AtomSelectionImpl { return { atomSets }; }

namespace AtomSelection {
    export const empty = AtomSelection([]);

    export function atomSets(selection: AtomSelection) { return (selection as AtomSelectionImpl).atomSets; }

    export function getAtomIndices(seq: AtomSelection): ReadonlyArray<number> {
        const sets = atomSets(seq);
        const length = sets.length;
        if (!length) return [];
        if (length === 1) return AtomSet.toIndices(sets[0]);

        const mask = getMask(seq);
        const atoms = new Int32Array(mask.size);
        mask.forEach((i, ctx) => ctx!.atoms[ctx!.offset++] = i, { atoms, offset: 0 });
        return sortAsc(atoms) as any;
    }

    export function getMask(seq: AtomSelection): Mask {
        const sets = atomSets(seq);
        if (!sets.length) return Mask.never;
        if (sets.length === 1) return AtomSet.getMask(sets[0]);

        const it = AtomSetIt();

        let estSize = 0, max = 0;
        for (const atomSet of sets) {
            estSize += AtomSet.count(atomSet);
            for (let a = AtomSetIt.start(it, atomSet); !it.done; a = it.next().value) {
                if (a > max) max = a;
            }
        }

        if ((estSize / max) > (1 / 12)) {
            const mask = new Uint8Array(max + 1);
            let size = 0;
            for (const atomSet of sets) {
                for (let a = AtomSetIt.start(it, atomSet); !it.done; a = it.next().value) {
                    if (mask[a]) continue;
                    mask[a] = 1;
                    size++;
                }
            }
            return Mask.ofMask(mask as any as boolean[], size);
        } else {
            const mask = FastSet.create<number>();
            for (const atomSet of sets) {
                for (let a = AtomSetIt.start(it, atomSet); !it.done; a = it.next().value) {
                    mask.add(a);
                }
            }
            return Mask.ofSet(mask);
        }
    }

    export interface Builder { add(atomSet: AtomSet): void, getSelection(): AtomSelection }

    class LinearSelectionBuilder implements Builder {
        private atomSets: AtomSet[] = [];

        add(atomSet: AtomSet) {
            this.atomSets.push(atomSet);
        }

        getSelection() {
            return AtomSelection(this.atomSets);
        }

        constructor() { }
    }

    class HashSelectionBuilder implements Builder {
        private atomSets: AtomSet[] = [];
        private selectionSet = new Set();

        add(atomSet: AtomSet) {
            if (this.selectionSet.add(atomSet)) {
                this.atomSets.push(atomSet);
            }
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

    export class Set {
        private byHash = FastMap.create<number, AtomSet[]>();

        add(atomSet: AtomSet) {
            const hash = AtomSet.hashCode(atomSet);
            if (this.byHash.has(hash)) {
                const sets = this.byHash.get(hash)!;

                for (const set of sets) {
                    if (AtomSet.areEqual(atomSet, set)) return false;
                }
                sets[sets.length] = atomSet;
                return true;
            } else {
                this.byHash.set(hash, [atomSet]);
                return true;
            }
        }

        has(atomSet: AtomSet) {
            const hash = AtomSet.hashCode(atomSet);
            if (this.byHash.has(hash)) {
                const sets = this.byHash.get(hash)!;
                for (const set of sets) {
                    if (AtomSet.areEqual(atomSet, set)) return true;
                }
            }
            return false;
        }

        static ofSelection(atomSelection: AtomSelection) {
            const set = new Set();
            for (const atomSet of atomSets(atomSelection)) {
                set.add(atomSet);
            }
            return set;
        }
    }

    export class Lookup3d {
        private lookup: FindFunc;
        private mask: Mask;
        private maxRadius: number = 0;

        queryAtomSet(a: AtomSet, radius: number): number[]  {
            const { center, radius: bsRadius } = AtomSet.boundingSphere(this.model, a);
            const { count, indices } = this.lookup(center[0], center[1], center[2], this.maxRadius + bsRadius + radius)
            const atomSets = AtomSelection.atomSets(this.selection);

            const setIndices: number[] = [];
            for (let i = 0; i < count; i++) {
                const b = atomSets[indices[i]];
                const d = AtomSet.distance(this.model, a, b);
                if (d < radius) {
                    setIndices.push(indices[i]);
                }
            }

            return setIndices;
        }

        constructor(private model: Model, private selection: AtomSelection) {
            const sets = atomSets(selection);
            const positions = {
                x: new Float32Array(sets.length),
                y: new Float32Array(sets.length),
                z: new Float32Array(sets.length)
            };
            let radius = 0, i = 0;
            for (const set of sets) {
                const bs = AtomSet.boundingSphere(model, set);
                positions.x[i] = bs.center[0];
                positions.y[i] = bs.center[1];
                positions.z[i] = bs.center[2];
                i++;
                if (bs.radius > radius) radius = bs.radius;
            }
            this.maxRadius = radius;
            this.mask = Mask.always(sets.length);
            this.lookup = SpatialLookup(positions).find(Mask.always(sets.length));
        }
    }

    export function lookup3d(model: Model, selection: AtomSelection) {
        return new Lookup3d(model, selection);
    }
}

export default AtomSelection