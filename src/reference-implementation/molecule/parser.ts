
/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import CIF from 'ciftools.js'
import * as mmCIF from './mmcif'
import { Molecule, Model, SecondaryStructureType } from './data'
import { FastMap } from '../utils/collections'

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

        let newEntity = !label_entity_id.areValuesEqual(currentEntityRow, i);
        let newChain = newEntity || !auth_asym_id.areValuesEqual(currentChainRow, i);
        let newResidue = newChain
            || !auth_seq_id.areValuesEqual(currentResidueRow, i)
            || !pdbx_PDB_ins_code.areValuesEqual(currentResidueRow, i);

        if (newResidue) {
            atomStartIndex.push(residueStartAtom)
            atomEndIndex.push(atom);
            chainIndex.push(chain)
            residueStartAtom = atom;
            residue++;
            currentResidueRow = i;
        }

        if (newChain) {
            residueStartIndex.push(chainStartResidue);
            residueEndIndex.push(residue);
            entityIndex.push(entity);
            currentChainRow = i;
            chainStartResidue = residue;
            chain++;
        }

        if (newEntity) {
            chainStartIndex.push(entityStartChain);
            chainEndIndex.push(chain);
            currentEntityRow = i;
            entityStartChain = chain;
            entity++;
        }

        dataIndex.push(i);
        x.push(Cartn_x.getFloat(i));
        y.push(Cartn_y.getFloat(i));
        z.push(Cartn_z.getFloat(i));
        residueIndex.push(residue);

        atom++;
    }


    // finish residue
    atomStartIndex.push(residueStartAtom)
    atomEndIndex.push(atom);
    chainIndex.push(chain);

    // finish chain
    residueStartIndex.push(chainStartResidue);
    residueEndIndex.push(residue + 1);
    entityIndex.push(entity);

    // finish entity
    chainStartIndex.push(entityStartChain);
    chainEndIndex.push(chain + 1);

    residue++;
    chain++;
    entity++;

    const secondaryStructureType: number[] = new Uint8Array(residue) as any;
    const secondaryStructureIndex: number[] = new Int32Array(residue) as any;

    return {
        id: pdbx_PDB_model_num.getInteger(startRow),
        atoms: { dataIndex, residueIndex, count: atom },
        residues: { atomStartIndex, atomEndIndex, secondaryStructureType, secondaryStructureIndex, chainIndex, count: residue, key: new Int32Array(residue) as any },
        chains: { residueStartIndex, residueEndIndex, entityIndex, count: chain, key: new Int32Array(residue) as any },
        entities: { chainStartIndex, chainEndIndex, count: entity, key: new Int32Array(residue) as any },
        positions: { x, y, z },
        data,
        '@spatialLookup': void 0
    };
}

function getElementKey(map: FastMap<string | number, number>, key: string | number) {
    if (map.has(key)) return map.get(key)!;
    const ret = map.size;
    map.set(key, ret);
    return ret;
}

function getElementSubstructureKeyMap(map: FastMap<number, FastMap<string, number>>, key: number) {
    if (map.has(key)) return map.get(key)!;
    const ret = FastMap.create<string, number>();
    map.set(key, ret);
    return ret;
}

function assignKeys(model: Model) {
    const entityMap = FastMap.create<string, number>();
    const chainMaps = FastMap.create<number, FastMap<string, number>>();
    const residueMaps = FastMap.create<number, FastMap<string, number>>();

    const { dataIndex } = model.atoms;
    const { key: residueKey, atomStartIndex } = model.residues;
    const { key: chainKey, residueStartIndex, residueEndIndex } = model.chains;
    const { key: entityKey, count: entityCount, chainStartIndex, chainEndIndex  } = model.entities;

    const { label_entity_id, auth_asym_id, auth_seq_id, pdbx_PDB_ins_code } = model.data.atom_site;

    for (let eI = 0; eI < entityCount; eI++) {
        const chainStart = chainStartIndex[eI], chainEnd = chainEndIndex[eI];
        let dataRow = dataIndex[atomStartIndex[residueStartIndex[chainStart]]];

        const eKey = getElementKey(entityMap, label_entity_id.getString(dataRow)!);
        entityKey[eI] = eKey;
        const chainMap = getElementSubstructureKeyMap(chainMaps, eKey);
        for (let cI = chainStart; cI < chainEnd; cI++) {
            const residueStart = residueStartIndex[cI], residueEnd = residueEndIndex[cI];
            dataRow = dataIndex[atomStartIndex[residueStart]];

            const cKey = getElementKey(chainMap, auth_asym_id.getString(dataRow)!);
            chainKey[cI] = cKey;
            const residueMap = getElementSubstructureKeyMap(residueMaps, cKey);
            for (let rI = residueStart; rI < residueEnd; rI++) {
                dataRow = dataIndex[atomStartIndex[rI]];
                residueKey[rI] = getElementKey(residueMap, pdbx_PDB_ins_code.getValuePresence(dataRow) !== CIF.ValuePresence.Present
                    ? auth_seq_id.getInteger(dataRow)
                    : `${auth_seq_id.getInteger(dataRow)} ${pdbx_PDB_ins_code.getString(dataRow)}`);
            }
        }
    }
}

type SecondaryStructureEntry = {
    startSeqNumber: number,
    startInsCode: string | null,
    endSeqNumber: number,
    endInsCode: string | null,
    type: SecondaryStructureType,
    rowIndex: number
}
type SecondaryStructureMap = FastMap<string, FastMap<number, SecondaryStructureEntry>>

function extendSecondaryStructureMap<T extends mmCIF.StructConf | mmCIF.StructSheetRange>(cat: mmCIF.Category<T>, type: SecondaryStructureType, map: SecondaryStructureMap) {
    if (!cat.rowCount) return;

    const { beg_label_asym_id, beg_label_seq_id, pdbx_beg_PDB_ins_code } = cat;
    const { end_label_seq_id, pdbx_end_PDB_ins_code } = cat;

    for (let i = 0; i < cat.rowCount; i++) {
        const entry: SecondaryStructureEntry = {
            startSeqNumber: beg_label_seq_id.getInteger(i),
            startInsCode: pdbx_beg_PDB_ins_code.getString(i),
            endSeqNumber: end_label_seq_id.getInteger(i),
            endInsCode: pdbx_end_PDB_ins_code.getString(i),
            type,
            rowIndex: i
        };

        const asymId = beg_label_asym_id.getString(i)!;
        if (map.has(asymId)) {
            map.get(asymId)!.set(entry.startSeqNumber, entry);
        } else {
            map.set(asymId, FastMap.ofArray([[entry.startSeqNumber, entry]]));
        }
    }

    return map;
}

function assignSecondaryStructureEntry(model: Model, entry: SecondaryStructureEntry, resStart: number, resEnd: number) {
    const { atomStartIndex, secondaryStructureIndex, secondaryStructureType } = model.residues;
    const { dataIndex } = model.atoms;
    const { label_seq_id, pdbx_PDB_ins_code } = model.data.atom_site;
    const { endSeqNumber, endInsCode, rowIndex, type } = entry;

    let rI = resStart;
    while (rI < resEnd) {
        const atomRowIndex = dataIndex[atomStartIndex[rI]];
        const seqNumber = label_seq_id.getInteger(atomRowIndex);

        if ((seqNumber > endSeqNumber) ||
            (seqNumber === endSeqNumber && pdbx_PDB_ins_code.getString(atomRowIndex) === endInsCode)) {
            break;
        }

        secondaryStructureIndex[rI] = rowIndex;
        secondaryStructureType[rI] = type;
        rI++;
    }
}

function assignSecondaryStructure(model: Model) {
    const map: SecondaryStructureMap = FastMap.create();
    extendSecondaryStructureMap(model.data.secondaryStructure.structConf, SecondaryStructureType.StructConf, map);
    extendSecondaryStructureMap(model.data.secondaryStructure.sheetRange, SecondaryStructureType.StructSheetRange, map);

    const { residueStartIndex, residueEndIndex, count: chainCount } = model.chains;
    const { atomStartIndex } = model.residues;
    const { dataIndex } = model.atoms;
    const { label_asym_id, label_seq_id, pdbx_PDB_ins_code } = model.data.atom_site;

    for (let cI = 0; cI < chainCount; cI++) {
        const resStart = residueStartIndex[cI], resEnd = residueEndIndex[cI];
        const asymId = label_asym_id.getString(dataIndex[atomStartIndex[resStart]])!;

        if (map.has(asymId)) {
            const entries = map.get(asymId)!;

            for (let rI = resStart; rI < resEnd; rI++) {
                let atomRowIndex = dataIndex[atomStartIndex[rI]];
                let seqNumber = label_seq_id.getInteger(atomRowIndex);
                if (entries.has(seqNumber)) {
                    const entry = entries.get(seqNumber)!;
                    let insCode = pdbx_PDB_ins_code.getString(atomRowIndex);
                    if (entry.startInsCode !== insCode) continue;
                    assignSecondaryStructureEntry(model, entry, rI, resEnd);
                }
            }
        }
    }
}

export default function parseCIF(cifData: string): Molecule {
    const file = CIF.Text.parse(cifData);
    if (file.isError) throw new Error(file.toString());
    const dataBlock = file.result.dataBlocks[0];
    if (!dataBlock) throw new Error('No data block found.');

    const data: Model['data'] = {
        atom_site: mmCIF.Category(dataBlock.getCategory('_atom_site'), mmCIF.AtomSite),
        entity: mmCIF.Category(dataBlock.getCategory('_entity'), mmCIF.Entity),
        secondaryStructure: {
            structConf: mmCIF.Category(dataBlock.getCategory('_struct_conf'), mmCIF.StructConf),
            sheetRange: mmCIF.Category(dataBlock.getCategory('_struct_sheet_range'), mmCIF.StructSheetRange)
        }
    };

    const models: Model[] = [];
    let modelStartIndex = 0;
    while (modelStartIndex < data.atom_site.rowCount) {
        const model = createModel(data, modelStartIndex, data.atom_site.rowCount);
        assignKeys(model);
        assignSecondaryStructure(model);
        models.push(model);
        modelStartIndex += model.atoms.count;
    }
    return { id: dataBlock.header, models };
}