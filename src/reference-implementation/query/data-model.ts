/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import * as Molecule from '../molecule/model'
import * as Helpers from './helpers'
import Mask from '../utils/mask'

export interface AtomSet {
    readonly context: Context,
    readonly hashCode: number,
    readonly atomIndices: ReadonlyArray<number>,
    readonly residueIndices: ReadonlyArray<number>,
    readonly chainIndices: ReadonlyArray<number>
}

export function AtomSet(ctx: Context, indices: number[]): AtomSet { return new Helpers.AtomSet(ctx, indices); }

export interface AtomSetSeq { readonly context: Context, readonly atomSets: ReadonlyArray<AtomSet> }
export function AtomSetSeq(context: Context, atomSets: AtomSet[]): AtomSetSeq { return { context, atomSets }; }

export interface Iterator<T> { value: T }

export function Iterator<T>(): Iterator<T> {
    const impl: Iterator<T> & { stack: T[] } = { value: void 0 as any, stack: [] };
    return impl;
}

export namespace Iterator {
    interface Impl extends Iterator<any> { stack: any[] }
    export interface Element { atom: number, residue: number, chain: number }
    export function Element(): Element { return { atom: 0, residue: 0, chain: 0 } }

    export function begin<T>(iterator: Iterator<T>, initial: T | undefined) {
        if (iterator.value) (iterator as Impl).stack.push(iterator.value);
        iterator.value = initial as any;
        return initial;
    }

    export function end<T>(iterator: Iterator<T>) {
        iterator.value = void 0 as any;
        if ((iterator as Impl).stack.length) (iterator as Impl).stack.pop();
    }

    export function setAtomElement(ctx: Context, atomIndex: number) {
        const { atoms: { residueIndex }, residues: { chainIndex } } = ctx.model;
        const element = ctx.element.value!;
        element.atom = atomIndex;
        element.residue = residueIndex[atomIndex];
        element.chain = chainIndex[element.residue];
    }

    export function setResidueElement(ctx: Context, residue: number) {
        const { residues: { atomStartIndex, chainIndex } } = ctx.model;
        const element = ctx.element.value!;
        element.atom = atomStartIndex[residue];
        element.residue = residue;
        element.chain = chainIndex[residue];
    }

    export function setChainElement(ctx: Context, chain: number) {
        const { residues: { atomStartIndex }, chains: { residueStartIndex } } = ctx.model;
        const element = ctx.element.value!;
        element.chain = chain;
        element.residue = residueStartIndex[chain];
        element.atom = atomStartIndex[element.residue];
    }

    export function beginSlot(ctx: Context, index: number, initialValue?: any) {
        const { slots } = ctx;
        let slot = slots[index];
        if (slot) {
            begin(slot, initialValue);
        } else {
            slot = Iterator<any>();
            slots[index] = slot;
            begin(slot, initialValue);
        }
        return slot;
    }

    export function endSlot(ctx: Context, index: number) {
        end(ctx.slots[index]);
    }
}

export interface Context {
    readonly model: Molecule.Model,
    readonly columns: Molecule.ColumnMap,
    readonly mask: Mask,

    element: Iterator<Iterator.Element>,
    atomSet: Iterator<AtomSet>,
    slots: { [index: number]: Iterator<any> }
}

export function Context(model: Molecule.Model, mask: Mask): Context {
    return {
        model,
        columns: model.data,
        mask,

        element: Iterator<Iterator.Element>(),
        atomSet: Iterator<AtomSet>(),
        slots: Object.create(null)
    };
}

export namespace Context {
    export interface Element { atom: number, residue: number, chain: number }

    export function ofAtomSet(model: Molecule.Model, atomSet: AtomSet) {
        return Context(model, Mask.ofIndices(model.atoms.count, atomSet.atomIndices));
    }

    export function ofAtomSetSeq(model: Molecule.Model, atomSetSeq: AtomSetSeq) {
        const mask = new Set<number>();
        for (const atomSet of atomSetSeq.atomSets) {
            for (const a of atomSet.atomIndices) {
                mask.add(a);
            }
        }
        return Context(model, mask);
    }

    export function ofModel(model: Molecule.Model) {
        return Context(model, Mask.always(model.atoms.count));
    }
}