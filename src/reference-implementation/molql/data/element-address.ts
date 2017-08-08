/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import { Model } from '../../molecule/data'

interface ElementAddress { dataIndex: number, atom: number, residue: number, chain: number, entity: number }
function ElementAddress(): ElementAddress { return { dataIndex: 0, atom: 0, residue: 0, chain: 0, entity: 0 }; }

namespace ElementAddress {
    export function setAtom(model: Model, address: ElementAddress, atomIndex: number) {
        const { atoms: { dataIndex, residueIndex }, residues: { chainIndex }, chains: { entityIndex } } = model;
        address.atom = atomIndex;
        address.dataIndex = dataIndex[atomIndex];
        address.residue = residueIndex[atomIndex];
        address.chain = chainIndex[address.residue];
        address.entity = entityIndex[address.chain];
    }

    export function setAtomLayer(model: Model, address: ElementAddress, atomIndex: number) {
        const { atoms: { dataIndex } } = model;
        address.atom = atomIndex;
        address.dataIndex = dataIndex[atomIndex];
    }

    export function setResidueLayer(model: Model, address: ElementAddress, residueIndex: number) {
        const { residues: { atomStartIndex }, atoms: { dataIndex } } = model;
        address.atom = atomStartIndex[residueIndex];
        address.dataIndex = dataIndex[address.atom];
        address.residue = residueIndex;
    }

    export function setChainLayer(model: Model, address: ElementAddress, chainIndex: number) {
        const { residues: { atomStartIndex }, chains: { residueStartIndex }, atoms: { dataIndex } } = model;
        address.chain = chainIndex;
        address.residue = residueStartIndex[chainIndex];
        address.atom = atomStartIndex[address.residue];
        address.dataIndex = dataIndex[address.atom];
    }

    export function setEntityLayer(model: Model, address: ElementAddress, entityIndex: number) {
        const { residues: { atomStartIndex }, chains: { residueStartIndex }, entities: { chainStartIndex }, atoms: { dataIndex } } = model;
        address.entity = entityIndex;
        address.chain = chainStartIndex[entityIndex];
        address.residue = residueStartIndex[address.chain];
        address.atom = atomStartIndex[address.residue];
        address.dataIndex = dataIndex[address.atom];
    }
}

export default ElementAddress