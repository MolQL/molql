/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as mmCIF from './mmcif'
import SpatialLookup from '../utils/spatial-lookup'

export const enum SecondaryStructureType {
    None = 0,
    StructConf = 1,
    StructSheetRange = 2,
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

export interface Model {
    moleculeId: string,
    id: number,
    data: {
        atom_site: mmCIF.Category<mmCIF.AtomSite>,
        entity: mmCIF.Category<mmCIF.Entity>,
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
}

export interface Molecule {
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
}