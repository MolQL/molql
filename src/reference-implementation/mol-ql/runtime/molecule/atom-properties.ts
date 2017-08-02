/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import MolQL from '../../../../mol-ql/symbols'
import SymbolRuntime from '../../../mini-lisp/symbol'
import Context from '../context'
import { ElementSymbol, ResidueIdentifier } from '../../../molecule/data'

function prop(runtime: SymbolRuntime<Context>) { return runtime; }

const properties: { [P in keyof typeof MolQL.structure.atomProperty]?: SymbolRuntime<Context> } = {
    // ================= KEYS =================

    atomKey: prop((env, v) => env.context.element.value.atom),
    residueKey: prop((env, v) => env.context.model.residues.key[env.context.element.value.residue]),
    chainKey: prop((env, v) => env.context.model.chains.key[env.context.element.value.chain]),
    entityKey: prop((env, v) => env.context.model.entities.key[env.context.element.value.entity]),

    residueId: prop((env, v) => ResidueIdentifier.ofResidueIndex(env.context.model, env.context.element.value.residue)),

    // ================= mmCIF =================

    group_PDB: prop((env, v) => env.context.atom_site.group_PDB.getString(env.context.element.value.dataIndex) || ''),
    id: prop((env, v) => env.context.atom_site.id.getString(env.context.element.value.dataIndex) || ''),

    type_symbol: prop((env, v) => ElementSymbol(env.context.atom_site.type_symbol.getString(env.context.element.value.dataIndex)) || ''),

    label_atom_id: prop((env, v) => env.context.atom_site.label_atom_id.getString(env.context.element.value.dataIndex) || ''),
    label_alt_id: prop((env, v) => env.context.atom_site.label_alt_id.getString(env.context.element.value.dataIndex) || ''),
    label_asym_id: prop((env, v) => env.context.atom_site.label_asym_id.getString(env.context.element.value.dataIndex) || ''),
    label_comp_id: prop((env, v) => env.context.atom_site.label_comp_id.getString(env.context.element.value.dataIndex) || ''),
    label_seq_id: prop((env, v) => env.context.atom_site.label_seq_id.getInteger(env.context.element.value.dataIndex)),

    pdbx_PDB_ins_code: prop((env, v) => env.context.atom_site.pdbx_PDB_ins_code.getString(env.context.element.value.dataIndex) || ''),
    pdbx_formal_charge: prop((env, v) => env.context.atom_site.pdbx_formal_charge.getInteger(env.context.element.value.dataIndex)),

    Cartn_x: prop((env, v) => env.context.model.positions.x[env.context.element.value.atom]),
    Cartn_y: prop((env, v) => env.context.model.positions.y[env.context.element.value.atom]),
    Cartn_z: prop((env, v) => env.context.model.positions.z[env.context.element.value.atom]),

    occupancy: prop((env, v) => env.context.atom_site.occupancy.getFloat(env.context.element.value.dataIndex)),
    B_iso_or_equiv: prop((env, v) => env.context.atom_site.B_iso_or_equiv.getFloat(env.context.element.value.dataIndex)),

    auth_asym_id: prop((env, v) => env.context.atom_site.auth_asym_id.getString(env.context.element.value.dataIndex) || ''),
    auth_atom_id: prop((env, v) => env.context.atom_site.auth_atom_id.getString(env.context.element.value.dataIndex) || ''),
    auth_comp_id: prop((env, v) => env.context.atom_site.auth_comp_id.getString(env.context.element.value.dataIndex) || ''),
    auth_seq_id: prop((env, v) => env.context.atom_site.auth_seq_id.getInteger(env.context.element.value.dataIndex)),

    pdbx_PDB_model_num: prop((env, v) => env.context.model.id),

    // ================= OTHER =================
    isHet: prop((env, v) => !env.context.atom_site.group_PDB.stringEquals(env.context.element.value.dataIndex, 'ATOM')),
}

export default properties