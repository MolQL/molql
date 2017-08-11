/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import MolQL from '../../../../molql/symbol-table'
import SymbolRuntime from '../../symbol'
import { ElementSymbol, ResidueIdentifier } from '../../../molecule/data'

function prop(runtime: SymbolRuntime) { return runtime; }

export const Core: { [P in keyof typeof MolQL.structure.atomProperty.core]?: SymbolRuntime } = {
    elementSymbol: prop((env, v) => ElementSymbol(env.context.atom_site.type_symbol.getString(env.context.element.value.dataIndex) || '')),

    x: prop((env, v) => env.context.model.positions.x[env.context.element.value.atom]),
    y: prop((env, v) => env.context.model.positions.y[env.context.element.value.atom]),
    z: prop((env, v) => env.context.model.positions.z[env.context.element.value.atom]),

    atomKey: prop((env, v) => env.context.element.value.atom),
}

export const Macromolecular: { [P in keyof typeof MolQL.structure.atomProperty.macromolecular]?: SymbolRuntime } = {
    // ================= IDENTIFIERS =================
    labelResidueId: prop((env, v) => ResidueIdentifier.labelOfResidueIndex(env.context.model, env.context.element.value.residue)),
    authResidueId: prop((env, v) => ResidueIdentifier.authOfResidueIndex(env.context.model, env.context.element.value.residue)),

    // ================= KEYS =================
    residueKey: prop((env, v) => env.context.model.residues.key[env.context.element.value.residue]),
    chainKey: prop((env, v) => env.context.model.chains.key[env.context.element.value.chain]),
    entityKey: prop((env, v) => env.context.model.entities.key[env.context.element.value.entity]),

    // ================= mmCIF =================
    isHet: prop((env, v) => !env.context.atom_site.group_PDB.stringEquals(env.context.element.value.dataIndex, 'ATOM')),

    id: prop((env, v) => env.context.atom_site.id.getInteger(env.context.element.value.dataIndex)),

    label_atom_id: prop((env, v) => env.context.atom_site.label_atom_id.getString(env.context.element.value.dataIndex) || ''),
    label_alt_id: prop((env, v) => env.context.atom_site.label_alt_id.getString(env.context.element.value.dataIndex) || ''),
    label_asym_id: prop((env, v) => env.context.atom_site.label_asym_id.getString(env.context.element.value.dataIndex) || ''),
    label_comp_id: prop((env, v) => env.context.atom_site.label_comp_id.getString(env.context.element.value.dataIndex) || ''),
    label_entity_id: prop((env, v) => env.context.atom_site.label_entity_id.getString(env.context.element.value.dataIndex) || ''),
    label_seq_id: prop((env, v) => env.context.atom_site.label_seq_id.getInteger(env.context.element.value.dataIndex)),

    auth_asym_id: prop((env, v) => env.context.atom_site.auth_asym_id.getString(env.context.element.value.dataIndex) || ''),
    auth_atom_id: prop((env, v) => env.context.atom_site.auth_atom_id.getString(env.context.element.value.dataIndex) || ''),
    auth_comp_id: prop((env, v) => env.context.atom_site.auth_comp_id.getString(env.context.element.value.dataIndex) || ''),
    auth_seq_id: prop((env, v) => env.context.atom_site.auth_seq_id.getInteger(env.context.element.value.dataIndex)),

    pdbx_PDB_ins_code: prop((env, v) => env.context.atom_site.pdbx_PDB_ins_code.getString(env.context.element.value.dataIndex) || ''),
    pdbx_formal_charge: prop((env, v) => env.context.atom_site.pdbx_formal_charge.getInteger(env.context.element.value.dataIndex)),

    occupancy: prop((env, v) => env.context.atom_site.occupancy.getFloat(env.context.element.value.dataIndex)),
    B_iso_or_equiv: prop((env, v) => env.context.atom_site.B_iso_or_equiv.getFloat(env.context.element.value.dataIndex)),

    // ================= Mapped =================
    entityType: prop((env, v) => {
        const { model, element } = env.context;
        return model.data.entity.type.getString(model.entities.dataIndex[element.value.entity])
    }),
}