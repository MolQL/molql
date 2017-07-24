import * as Query from '../query'
import { UniqueArrayBuilder, sortAsc, FastMap } from './collections'

export class AtomSet implements Query.AtomSet {
    private _hashCode = 0;
    private _hashComputed = false;
    /**
     * The hash code of the fragment.
     */
    get hashCode() {
        if (this._hashComputed) return this._hashCode;

        let code = 23;
        for (let i of this.atomIndices) {
            code = (31 * code + i) | 0;
        }

        this._hashCode = code;
        this._hashComputed = true;

        return code;
    }

    get residueIndices(): number[] {
        this.computeIndices();
        return this._residueIndices;
    }

    get chainIndices(): number[] {
        this.computeIndices();
        return this._chainIndices;
    }

    constructor(public context: Query.Context, public atomIndices: ReadonlyArray<number>) {
    }

    private _residueIndices: number[];
    private _chainIndices: number[];
    private _entityIndices: number[];

    private computeIndices() {
        if (this._residueIndices) return;

        const residueIndices = UniqueArrayBuilder<number>();
        const chainIndices = UniqueArrayBuilder<number>();
        const rIndices = this.context.model.atoms.residueIndex;
        const cIndices = this.context.model.residues.chainIndex;

        for (const i of this.atomIndices) { UniqueArrayBuilder.add(residueIndices, rIndices[i], rIndices[i]); }
        for (const i of residueIndices.array) { UniqueArrayBuilder.add(chainIndices, cIndices[i], cIndices[i]); }

        this._residueIndices = sortAsc(residueIndices.array);
        this._chainIndices = sortAsc(chainIndices.array);
    }
}

export namespace AtomSet {
    export function areEqual(a: Query.AtomSet, b: Query.AtomSet) {
        const xs = a.atomIndices, ys = b.atomIndices;
        if (xs.length != ys.length) return false;
        for (let i = 0, _i = xs.length; i < _i; i++) {
            if (xs[i] !== ys[i]) return false;
        }
        return true;
    }

    export function ofUnsortedIndices(ctx: Query.Context, indices: number[]): Query.AtomSet {
        return Query.AtomSet(ctx, sortAsc(indices));
    }

    export function distance(a: Query.AtomSet, b: Query.AtomSet) {
        return 0;
    }

    export function areWithin(a: Query.AtomSet, b: Query.AtomSet, maxDistance: number) {
        return 0;
    }
}

export class AtomSetSeqBuilder {
    private atomSets: Query.AtomSet[] = [];

    add(f: Query.AtomSet) {
        this.atomSets[this.atomSets.length] = f;
    }

    getSeq() {
        return Query.AtomSetSeq(this.ctx, this.atomSets);
    }

    constructor(private ctx: Query.Context) { }
}

/**
 * A builder that includes only unique atom sets.
 */
export class HashAtomSetSeqBuilder {
    private atomSets: Query.AtomSet[] = [];
    private byHash = FastMap.create<number, Query.AtomSet[]>();

    add(atomSet: Query.AtomSet) {
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
        return Query.AtomSetSeq(this.ctx, this.atomSets);
    }

    constructor(private ctx: Query.Context) {
    }
}