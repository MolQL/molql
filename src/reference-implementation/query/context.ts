/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import * as MolData from '../molecule/data'
import Mask from '../utils/mask'
import AtomSet from './atom-set'
import AtomSetSeq from './atom-set-seq'

interface Context {
    readonly model: MolData.Model,
    readonly data: MolData.Model['data'],
    readonly mask: Mask
}

function Context(model: MolData.Model, mask: Mask): Context {
    return { model, data: model.data, mask };
}

namespace Context {
    export interface ElementAddress { atom: number, residue: number, chain: number, entity: number }
    export function ElementAddress(): ElementAddress { return { atom: 0, residue: 0, chain: 0, entity: 0 }; }

    export function ofAtomSet(model: MolData.Model, atomSet: AtomSet) {
        return Context(model, Mask.ofIndices(model.atoms.count, atomSet.atomIndices));
    }

    export function ofAtomSetSeq(model: MolData.Model, atomSetSeq: AtomSetSeq) {
        const mask = new Set<number>();
        for (const atomSet of atomSetSeq.atomSets) {
            for (const a of atomSet.atomIndices) {
                mask.add(a);
            }
        }
        return Context(model, mask);
    }

    export function ofModel(model: MolData.Model) {
        return Context(model, Mask.always(model.atoms.count));
    }

    // export namespace ElementAddress {
    //     export function setAtom(ctx: Context, address: ElementAddress, atomIndex: number) {
    //         const { atoms: { residueIndex }, residues: { chainIndex }, chains: { entityIndex } } = ctx.model;
    //         address.atom = atomIndex;
    //         address.residue = residueIndex[atomIndex];
    //         address.chain = chainIndex[address.residue];
    //         address.entity = entityIndex[address.chain];
    //     }

    //     export function setResidue(ctx: Context, address: ElementAddress, residueIndex: number) {
    //         const { residues: { atomStartIndex, chainIndex }, chains: { entityIndex } } = ctx.model;
    //         address.atom = atomStartIndex[residueIndex];
    //         address.residue = residueIndex;
    //         address.chain = chainIndex[residueIndex];
    //         address.entity = entityIndex[address.chain];
    //     }

    //     export function setChain(ctx: Context, address: ElementAddress, chainIndex: number) {
    //         const { residues: { atomStartIndex }, chains: { residueStartIndex, entityIndex } } = ctx.model;
    //         address.chain = chainIndex;
    //         address.entity = entityIndex[chainIndex];
    //         address.residue = residueStartIndex[chainIndex];
    //         address.atom = atomStartIndex[address.residue];
    //     }

    //     export function setEntity(ctx: Context, address: ElementAddress, entityIndex: number) {
    //         const { residues: { atomStartIndex }, chains: { residueStartIndex }, entities: { chainStartIndex } } = ctx.model;
    //         address.entity = entityIndex;
    //         address.chain = chainStartIndex[entityIndex];
    //         address.residue = residueStartIndex[address.chain];
    //         address.atom = atomStartIndex[address.residue];
    //     }
    // }
}

export default Context;