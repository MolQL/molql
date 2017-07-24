/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import CIF from 'ciftools.js'

export type AtomSiteColumn =
    | 'group_PDB'
    | 'id'
    | 'type_symbol'
    | 'label_atom_id'
    | 'label_alt_id'
    | 'label_comp_id'
    | 'label_asym_id'
    | 'label_seq_id'
    | 'pdbx_PDB_ins_code'
    | 'Cartn_x'
    | 'Cartn_y'
    | 'Cartn_z'
    | 'occupancy'
    | 'B_iso_or_equiv'
    | 'auth_atom_id'
    | 'auth_comp_id'
    | 'auth_asym_id'
    | 'auth_seq_id'
    | 'pdbx_PDB_model_num'

export const AtomSiteColumns: AtomSiteColumn[] = [
      'group_PDB'
    , 'id'
    , 'type_symbol'
    , 'label_atom_id'
    , 'label_alt_id'
    , 'label_comp_id'
    , 'label_asym_id'
    , 'label_seq_id'
    , 'pdbx_PDB_ins_code'
    , 'Cartn_x'
    , 'Cartn_y'
    , 'Cartn_z'
    , 'occupancy'
    , 'B_iso_or_equiv'
    , 'auth_atom_id'
    , 'auth_comp_id'
    , 'auth_asym_id'
    , 'auth_seq_id'
    , 'pdbx_PDB_model_num'
]

export type ColumnMap = { [name in AtomSiteColumn]: CIF.Column };

export interface Atoms {
    dataIndex: number[],
    residueIndex: number[],
    count: number
}

export interface Residues {
    atomStartIndex: number[],
    atomEndIndex: number[],
    chainIndex: number[],
    count: number
}

export interface Chains {
    residueStartIndex: number[],
    residueEndIndex: number[],
    count: number
}

export interface Model {
    id: number,
    data: ColumnMap,
    atoms: Atoms,
    residues: Residues
    chains: Chains
}

export interface Molecule {
    id: string,
    models: Model[]
}

function createModel(columns: ColumnMap, startRow: number, rowCount: number): Model {
    const dataIndex: number[] = [], residueIndex: number[] = [];
    const atomStartIndex: number[] = [], atomEndIndex: number[] = [], chainIndex: number[] = [];
    const residueStartIndex: number[] = [], residueEndIndex: number[] = [];

    const { auth_asym_id, auth_seq_id, pdbx_PDB_ins_code, pdbx_PDB_model_num } = columns;

    let atom = 0, residue = 0, chain = 0;
    let residueStartAtom = 0;
    let chainStartResidue = 0;

    let currentResidueRow = startRow, currentChainRow = startRow;

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

    return {
        id: pdbx_PDB_model_num.getInteger(startRow),
        atoms: { dataIndex, residueIndex, count: atom },
        residues: { atomStartIndex, atomEndIndex, chainIndex, count: residue },
        chains: { residueStartIndex, residueEndIndex, count: chain },
        data: columns
    };
}

export function parseCIF(data: string): Molecule {
    const file = CIF.Text.parse(data);
    if (file.isError) throw new Error(file.toString());
    const dataBlock = file.result.dataBlocks[0];
    if (!dataBlock) throw new Error('No data block found.');
    const atom_site = dataBlock.getCategory('_atom_site');
    if (!atom_site) throw new Error('_atom_site missing.');

    const columns: ColumnMap = Object.create(null);
    for (const c of AtomSiteColumns) columns[c] = atom_site.getColumn(c);
    const models: Model[] = [];
    let modelStartIndex = 0;
    while (modelStartIndex < atom_site.rowCount) {
        const model = createModel(columns, modelStartIndex, atom_site.rowCount);
        models.push(model);
        modelStartIndex += model.atoms.count;
    }
    return { id: dataBlock.header, models };
}