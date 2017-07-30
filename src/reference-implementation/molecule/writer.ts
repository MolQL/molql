
/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import CIF from 'ciftools.js'
import { Model } from './data'

interface WriterContext {
    model: Model,
    atomIndices: ArrayLike<number>
}

interface AtomSiteData {
    columns: Model['data']['atom_site'],
    positions: Model['positions'],
    dataIndex: number[],
    index: number[],
    modelId: string
}

type FieldDesc<T> = CIF.FieldDesc<T>

import E = CIF.Binary.Encoder
const Encoders = {
    strings: E.by(E.stringArray),
    coordinates1: E.by(E.fixedPoint(10)).and(E.delta).and(E.integerPacking),
    coordinates3: E.by(E.fixedPoint(1000)).and(E.delta).and(E.integerPacking),
    occupancy: E.by(E.fixedPoint(100)).and(E.delta).and(E.runLength).and(E.byteArray),
    ids: E.by(E.delta).and(E.runLength).and(E.integerPacking),
    byteArray: E.by(E.byteArray),
    float64: E.by(E.byteArray)
}

function _atom_site(ctx: WriterContext): CIF.CategoryInstance<AtomSiteData> {
    const fields: FieldDesc<AtomSiteData>[] = [
        { name: 'group_PDB', string: (data, i) => data.columns.group_PDB.getString(data.dataIndex[i]) },
        { name: 'id', string: (data, i) => data.columns.id.getString(data.dataIndex[i]), number: (data, i) => data.columns.id.getInteger(data.dataIndex[i]), typedArray: Int32Array, encoder: Encoders.ids },

        { name: 'type_symbol', string: (data, i) => data.columns.type_symbol.getString(data.dataIndex[i]) },

        { name: 'label_atom_id', string: (data, i) => data.columns.label_atom_id.getString(data.dataIndex[i]) },
        { name: 'label_alt_id', string: (data, i) => data.columns.label_alt_id.getString(data.dataIndex[i]), presence: (data, i) => data.columns.label_alt_id.getValuePresence(data.dataIndex[i]) },
        { name: 'label_comp_id', string: (data, i) => data.columns.label_comp_id.getString(data.dataIndex[i]) },
        { name: 'label_asym_id', string: (data, i) => data.columns.label_asym_id.getString(data.dataIndex[i]) },
        { name: 'label_entity_id', string: (data, i) => data.columns.label_entity_id.getString(data.dataIndex[i]) },
        { name: 'label_seq_id', string: (data, i) => data.columns.label_seq_id.getString(data.dataIndex[i]), number: (data, i) => data.columns.label_seq_id.getInteger(data.dataIndex[i]), typedArray: Int32Array, encoder: Encoders.ids, presence: (data, i) => data.columns.label_seq_id.getValuePresence(data.dataIndex[i]) },


        { name: 'pdbx_PDB_ins_code', string: (data, i) => data.columns.pdbx_PDB_ins_code.getString(data.dataIndex[i]), presence: (data, i) => data.columns.pdbx_PDB_ins_code.getValuePresence(data.dataIndex[i]) },

        { name: 'Cartn_x', string: (data, i) => '' + Math.round(1000 * data.positions.x[data.index[i]]) / 1000, number: (data, i) => data.positions.x[data.index[i]], typedArray: Float32Array, encoder: Encoders.coordinates3 },
        { name: 'Cartn_y', string: (data, i) => '' + Math.round(1000 * data.positions.y[data.index[i]]) / 1000, number: (data, i) => data.positions.y[data.index[i]], typedArray: Float32Array, encoder: Encoders.coordinates3 },
        { name: 'Cartn_z', string: (data, i) => '' + Math.round(1000 * data.positions.z[data.index[i]]) / 1000, number: (data, i) => data.positions.z[data.index[i]], typedArray: Float32Array, encoder: Encoders.coordinates3 },

        { name: 'occupancy', string: (data, i) => data.columns.occupancy.getString(data.dataIndex[i]), number: (data, i) => data.columns.occupancy.getFloat(data.dataIndex[i]), typedArray: Float32Array, encoder: Encoders.occupancy },
        { name: 'B_iso_or_equiv', string: (data, i) => data.columns.B_iso_or_equiv.getString(data.dataIndex[i]), number: (data, i) => data.columns.B_iso_or_equiv.getFloat(data.dataIndex[i]), typedArray: Float32Array, encoder: Encoders.occupancy },

        { name: 'pdbx_formal_charge', string: (data, i) => data.columns.pdbx_formal_charge.getString(data.dataIndex[i]), number: (data, i) => data.columns.pdbx_formal_charge.getInteger(data.dataIndex[i]), typedArray: Int32Array, presence: (data, i) => data.columns.pdbx_formal_charge.getValuePresence(data.dataIndex[i]), encoder: Encoders.byteArray },

        { name: 'auth_atom_id', string: (data, i) => data.columns.auth_atom_id.getString(data.dataIndex[i]) },
        { name: 'auth_comp_id', string: (data, i) => data.columns.auth_comp_id.getString(data.dataIndex[i]) },
        { name: 'auth_asym_id', string: (data, i) => data.columns.auth_asym_id.getString(data.dataIndex[i]) },
        { name: 'auth_seq_id', string: (data, i) => data.columns.auth_seq_id.getString(data.dataIndex[i]), number: (data, i) => data.columns.auth_seq_id.getInteger(data.dataIndex[i]), typedArray: Int32Array, encoder: Encoders.ids, presence: (data, i) => data.columns.auth_seq_id.getValuePresence(data.dataIndex[i]) },

        { name: 'pdbx_PDB_model_num', string: (data, i) => data.modelId }
    ];

    const dataIndex = new Int32Array(ctx.atomIndices.length);
    const _dataIndex = ctx.model.atoms.dataIndex, aI = ctx.atomIndices;
    for (let i = 0; i < aI.length; i++) {
        dataIndex[i] = _dataIndex[aI[i]];
    }

    return {
        data: { columns: ctx.model.data.atom_site, positions: ctx.model.positions, dataIndex, index: aI, modelId: '' + ctx.model.id },
        count: ctx.atomIndices.length,
        desc: {
            name: '_atom_site',
            fields
        }
    };
}

function stringWriter() {
    const data: string[] = [];
    return {
        stream: <CIF.OutputStream>{
            writeString(str) {
                data.push(str);
                return true;
            },
            writeBinary(data): boolean {
                throw Error('not implemented');
            }
        },
        data
    };
}

export default function to_mmCIF_string(model: Model, atomIndices: ArrayLike<number>) {
    const writer = new CIF.Text.Writer();
    const ctx: WriterContext = { model, atomIndices };
    writer.startDataBlock(model.moleculeId);
    writer.writeCategory(_atom_site, [ctx]);
    writer.encode();
    const result = stringWriter();
    writer.flush(result.stream);
    return result.data.join('');
}