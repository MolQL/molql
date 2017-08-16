/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as mmCIF from './mmcif'
import SpatialLookup from '../utils/spatial-lookup'
import computeBonds from './bonds/compute'

export const enum SecondaryStructureType {
    None = 0,
    StructConf = 1,
    StructSheetRange = 2,
}

export const enum BondType {
    None = -1,

    Unknown = 0,

    Single = 1,
    Double = 2,
    Triple = 3,
    Aromatic = 4,

    DisulfideBridge = 5,

    Metallic = 6,
    Ion = 7,
    Hydrogen = 8
}

export interface Atoms {
    dataIndex: number[],
    residueIndex: number[],
    count: number
}

export interface Residues {
    atomStartIndex: number[],
    atomEndIndex: number[],
    secondaryStructureType: number[],
    secondaryStructureIndex: number[]
    key: number[],
    chainIndex: number[],
    count: number
}

export interface Chains {
    residueStartIndex: number[],
    residueEndIndex: number[],
    entityIndex: number[],
    key: number[],
    count: number
}

export interface Entities {
    chainStartIndex: number[],
    chainEndIndex: number[],
    dataIndex: number[],
    key: number[],
    count: number
}

export interface Bonds {
    /**
     * Where bonds for atom A start and end.
     * Start at 2 * idx, end at 2 * idx + 1
     */
    atomBondOffsets: number[],
    bondsByAtom: number[],
    typesByAtom: number[],

    /** Monotonous */
    atomA: number[],
    atomB: number[],
    type: BondType[],
    count: number
}

export interface Model {
    moleculeId: string,
    id: number,
    data: {
        atom_site: mmCIF.Category<mmCIF.AtomSite>,
        entity: mmCIF.Category<mmCIF.Entity>,
        bonds: {
            structConn: mmCIF.Category<mmCIF.StructConn>,
            chemCompBond: mmCIF.Category<mmCIF.ChemCompBond>
        },
        secondaryStructure: {
            structConf: mmCIF.Category<mmCIF.StructConf>,
            sheetRange: mmCIF.Category<mmCIF.StructSheetRange>
        }
    },
    positions: { x: number[], y: number[], z: number[] },
    atoms: Atoms,
    residues: Residues,
    chains: Chains,
    entities: Entities,
    '@spatialLookup': SpatialLookup | undefined,
    '@bonds': Bonds | undefined
}

export interface Structure {
    id: string,
    models: Model[]
}

export type ElementSymbol = string

const elementSymbolCache: { [value: string]: string } = Object.create(null);
export function ElementSymbol(symbol: any): string {
    let val = elementSymbolCache[symbol];
    if (val) return val;
    val = typeof symbol === 'string' ? symbol.toUpperCase() : `${symbol}`.toUpperCase();
    elementSymbolCache[symbol] = val;
    return val;
}

export type ResidueIdentifier = string
export namespace ResidueIdentifier {
    export function auth(chain: string, seq_num: number, ins_code?: string | null): ResidueIdentifier {
        if (ins_code) {
            return `${chain} ${seq_num} ${ins_code}`;
        }
        return `${chain} ${seq_num}`;
    }

    export function label(entity: string, chain: string, seq_num: number, ins_code?: string | null): ResidueIdentifier {
        if (ins_code) {
            return `${entity} ${chain} ${seq_num || '.'} ${ins_code}`;
        }
        return `${entity} ${chain} ${seq_num || '.'}`;
    }

    export function authOfResidueIndex(model: Model, residueIndex: number) {
        const row = model.atoms.dataIndex[model.residues.atomStartIndex[residueIndex]];
        const { atom_site } = model.data;
        return auth(atom_site.auth_asym_id.getString(row)!, atom_site.auth_seq_id.getInteger(row), atom_site.pdbx_PDB_ins_code.getString(row));
    }

    export function labelOfResidueIndex(model: Model, residueIndex: number) {
        const row = model.atoms.dataIndex[model.residues.atomStartIndex[residueIndex]];
        const { atom_site } = model.data;
        return label(atom_site.label_entity_id.getString(row)!, atom_site.label_asym_id.getString(row)!, atom_site.label_seq_id.getInteger(row), atom_site.pdbx_PDB_ins_code.getString(row));
    }
}

export namespace Model {
    export function spatialLookup(model: Model): SpatialLookup {
        if (model['@spatialLookup']) return model['@spatialLookup']!;
        const lookup = SpatialLookup(model.positions);
        model['@spatialLookup'] = lookup;
        return lookup;
    }

    export function bonds(model: Model): Bonds {
        if (model['@bonds']) return model['@bonds']!;
        const bonds = computeBonds(model);
        model['@bonds'] = bonds;
        return bonds;
    }

    export function findResidueIndexByLabel(model: Model, asymId: string, seqNumber: number, insCode: string | null) {
        const { residueStartIndex, residueEndIndex, count: cCount } = model.chains;
        const { atomStartIndex } = model.residues;
        const { dataIndex } = model.atoms;
        const { label_asym_id, label_seq_id, pdbx_PDB_ins_code } = model.data.atom_site;

        for (let cI = 0; cI < cCount; cI++) {
            let idx = dataIndex[atomStartIndex[residueStartIndex[cI]]];
            if (!label_asym_id.stringEquals(idx, asymId)) continue;
            for (let rI = residueStartIndex[cI], _r = residueEndIndex[cI]; rI < _r; rI++) {
                idx = dataIndex[atomStartIndex[rI]];
                if (label_seq_id.getInteger(idx) === seqNumber && (!insCode || pdbx_PDB_ins_code.stringEquals(idx, insCode))) {
                    return rI;
                }
            }
        }
        return -1;
    }

    export function findAtomIndexByLabelName(model: Model, residueIndex: number, atomName: string, altLoc: string | null) {
        const { atomStartIndex, atomEndIndex } = model.residues;
        const { dataIndex } = model.atoms;
        const { label_atom_id, label_alt_id } = model.data.atom_site;

        for (let i = atomStartIndex[residueIndex], _i = atomEndIndex[residueIndex]; i <= _i; i++) {
            const idx = dataIndex[i];
            if (label_atom_id.stringEquals(idx, atomName) && (!altLoc || label_alt_id.stringEquals(idx, altLoc))) return i;
        }
        return -1;
    }
}