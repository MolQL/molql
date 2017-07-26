
/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import CIF from 'ciftools.js'
import * as mmCIF from './mmcif'
import { Molecule, Model } from './data'

type Data = Model['data']

function createModel(data: Data, startRow: number, rowCount: number): Model {
    const dataIndex: number[] = [], residueIndex: number[] = [];
    const atomStartIndex: number[] = [], atomEndIndex: number[] = [], chainIndex: number[] = [];
    const x: number[] = [], y: number[] = [], z: number[] = [];
    const residueStartIndex: number[] = [], residueEndIndex: number[] = [], entityIndex: number[] = [];
    const chainStartIndex: number[] = [], chainEndIndex: number[] = [];

    const { auth_asym_id, auth_seq_id, pdbx_PDB_ins_code, pdbx_PDB_model_num, label_entity_id, Cartn_x, Cartn_y, Cartn_z } = data.atom_site;

    let atom = 0, residue = 0, chain = 0, entity = 0;
    let residueStartAtom = 0;
    let chainStartResidue = 0;
    let entityStartChain = 0;

    let currentResidueRow = startRow, currentChainRow = startRow, currentEntityRow = startRow;

    for (let i = startRow; i < rowCount; i++) {
        if (!pdbx_PDB_model_num.areValuesEqual(startRow, i)) break;

        let newChain = !auth_asym_id.areValuesEqual(currentChainRow, i);
        let newResidue = newChain
            || !auth_seq_id.areValuesEqual(currentResidueRow, i)
            || !pdbx_PDB_ins_code.areValuesEqual(currentResidueRow, i);

        if (newResidue) {
            atomStartIndex.push(residueStartAtom)
            atomEndIndex.push(atom + 1);
            chainIndex.push(chain)
            residueStartAtom++;
            residue++;
            currentResidueRow = i;
        }

        if (newChain) {
            residueStartIndex.push(chainStartResidue);
            residueEndIndex.push(residue);
            currentChainRow = i;
            chain++;
        }

        dataIndex.push(i);
        x.push(Cartn_x.getFloat(i));
        y.push(Cartn_y.getFloat(i));
        z.push(Cartn_z.getFloat(i));
        residueIndex.push(residue);

        atom++;
    }

    if (atom > residueStartAtom) {
        atomStartIndex.push(residueStartAtom)
        atomEndIndex.push(atom);
        residueStartIndex.push(chainStartResidue);
        residueEndIndex.push(residue);
        chainIndex.push(chain);
    }

    const secondaryStructureType:number[] = new Uint8Array(residue) as any;
    const secondaryStructureIndex:number[] = new Int32Array(residue) as any;

    return {
        id: pdbx_PDB_model_num.getInteger(startRow),
        atoms: { dataIndex, residueIndex, count: atom },
        residues: { atomStartIndex, atomEndIndex, secondaryStructureType, secondaryStructureIndex, chainIndex, count: residue },
        chains: { residueStartIndex, residueEndIndex, entityIndex, count: chain },
        entities: { chainStartIndex, chainEndIndex, count: entity },
        positions: { x, y, z },
        data
    };
}

function assignSecondaryStructure(model: Model) {

}

export function parseCIF(cifData: string): Molecule {
    const file = CIF.Text.parse(cifData);
    if (file.isError) throw new Error(file.toString());
    const dataBlock = file.result.dataBlocks[0];
    if (!dataBlock) throw new Error('No data block found.');

    const data: Model['data'] = {
        atom_site: mmCIF.Category(dataBlock.getCategory('_atom_site'), mmCIF.AtomSite),
        entity: mmCIF.Category(dataBlock.getCategory('_entity'), mmCIF.Entity),
        secondaryStructure: [
            mmCIF.Category(dataBlock.getCategory('_struct_conf'), mmCIF.StructConf),
            mmCIF.Category(dataBlock.getCategory('_struct_sheet_range'), mmCIF.StructSheetRange)
        ]
    };

    const models: Model[] = [];
    let modelStartIndex = 0;
    while (modelStartIndex < data.atom_site.rowCount) {
        const model = createModel(data, modelStartIndex, data.atom_site.rowCount);
        assignSecondaryStructure(model);
        models.push(model);
        modelStartIndex += model.atoms.count;
    }
    return { id: dataBlock.header, models };
}