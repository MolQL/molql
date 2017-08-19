/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import MolQL from '../../../../molql/symbol-table'
import SymbolRuntime, { RuntimeArguments, forEachPositionalArg } from '../../symbol'
import Environment from '../environment'
import RuntimeExpression from '../expression'
import ElementAddress from '../../data/element-address'
import { Model, ElementSymbol, ResidueIdentifier, VdwRadius, SecondaryStructure } from '../../../structure/data'
import { SecondaryStructureFlag } from '../../../structure/topology/secondary-structure'

function prop(runtime: SymbolRuntime) { return runtime; }

function getAddress(env: Environment, xs: { 0?: RuntimeExpression }): ElementAddress {
    return (xs[0] && xs[0]!(env)) || env.slots.element;
}

export function createSecondaryStructureFlags(env: Environment, args: RuntimeArguments) {
    return forEachPositionalArg(args, { flag: SecondaryStructureFlag.None }, (f, ctx) => {
        switch (('' + f(env)).toLowerCase()) {
            case 'alpha': ctx.flag |= SecondaryStructureFlag.HelixAlpha; break;
            case '3-10': ctx.flag |= SecondaryStructureFlag.Helix3Ten; break;
            case 'pi': ctx.flag |= SecondaryStructureFlag.HelixPi; break;
            case 'sheet': ctx.flag |= SecondaryStructureFlag.BetaSheet; break;
            case 'strand': ctx.flag |= SecondaryStructureFlag.BetaStrand; break;
            case 'helix': ctx.flag |= SecondaryStructureFlag.Helix; break;
            case 'beta': ctx.flag |= SecondaryStructureFlag.Beta; break;
            case 'turn': ctx.flag |= SecondaryStructureFlag.Turn; break;
            case 'none': ctx.flag |= SecondaryStructureFlag.NA; break;
        }
    }).flag;
}

export const Core: { [P in keyof typeof MolQL.structure.atomProperty.core]?: SymbolRuntime } = {
    elementSymbol: prop((env, v) => ElementSymbol(env.context.atom_site.type_symbol.getString(getAddress(env, v).dataIndex) || '')),

    vdw: prop((env, v) => VdwRadius(env.context.atom_site.type_symbol.getString(getAddress(env, v).dataIndex) || '')),

    x: prop((env, v) => env.context.model.positions.x[getAddress(env, v).atom]),
    y: prop((env, v) => env.context.model.positions.y[getAddress(env, v).atom]),
    z: prop((env, v) => env.context.model.positions.z[getAddress(env, v).atom]),

    atomKey: prop((env, v) => getAddress(env, v).atom)
}

export const Topology: { [P in keyof typeof MolQL.structure.atomProperty.topology]?: SymbolRuntime } = {
    connectedComponentKey: prop((env, v) => Model.connectedComponentKey(env.context.model)[getAddress(env, v).atom]),
}

export const Macromolecular: { [P in keyof typeof MolQL.structure.atomProperty.macromolecular]?: SymbolRuntime } = {
    // ================= IDENTIFIERS =================
    labelResidueId: prop((env, v) => ResidueIdentifier.labelOfResidueIndex(env.context.model, getAddress(env, v).residue)),
    authResidueId: prop((env, v) => ResidueIdentifier.authOfResidueIndex(env.context.model, getAddress(env, v).residue)),

    // ================= KEYS =================
    residueKey: prop((env, v) => env.context.model.residues.key[getAddress(env, v).residue]),
    chainKey: prop((env, v) => env.context.model.chains.key[getAddress(env, v).chain]),
    entityKey: prop((env, v) => env.context.model.entities.key[getAddress(env, v).entity]),

    // ================= mmCIF =================
    isHet: prop((env, v) => !env.context.atom_site.group_PDB.stringEquals(getAddress(env, v).dataIndex, 'ATOM')),

    id: prop((env, v) => env.context.atom_site.id.getInteger(getAddress(env, v).dataIndex)),

    label_atom_id: prop((env, v) => env.context.atom_site.label_atom_id.getString(getAddress(env, v).dataIndex) || ''),
    label_alt_id: prop((env, v) => env.context.atom_site.label_alt_id.getString(getAddress(env, v).dataIndex) || ''),
    label_asym_id: prop((env, v) => env.context.atom_site.label_asym_id.getString(getAddress(env, v).dataIndex) || ''),
    label_comp_id: prop((env, v) => env.context.atom_site.label_comp_id.getString(getAddress(env, v).dataIndex) || ''),
    label_entity_id: prop((env, v) => env.context.atom_site.label_entity_id.getString(getAddress(env, v).dataIndex) || ''),
    label_seq_id: prop((env, v) => env.context.atom_site.label_seq_id.getInteger(getAddress(env, v).dataIndex)),

    auth_asym_id: prop((env, v) => env.context.atom_site.auth_asym_id.getString(getAddress(env, v).dataIndex) || ''),
    auth_atom_id: prop((env, v) => env.context.atom_site.auth_atom_id.getString(getAddress(env, v).dataIndex) || ''),
    auth_comp_id: prop((env, v) => env.context.atom_site.auth_comp_id.getString(getAddress(env, v).dataIndex) || ''),
    auth_seq_id: prop((env, v) => env.context.atom_site.auth_seq_id.getInteger(getAddress(env, v).dataIndex)),

    pdbx_PDB_ins_code: prop((env, v) => env.context.atom_site.pdbx_PDB_ins_code.getString(getAddress(env, v).dataIndex) || ''),
    pdbx_formal_charge: prop((env, v) => env.context.atom_site.pdbx_formal_charge.getInteger(getAddress(env, v).dataIndex)),

    occupancy: prop((env, v) => env.context.atom_site.occupancy.getFloat(getAddress(env, v).dataIndex)),
    B_iso_or_equiv: prop((env, v) => env.context.atom_site.B_iso_or_equiv.getFloat(getAddress(env, v).dataIndex)),

    // ================= Mapped =================
    entityType: prop((env, v) => {
        const { model } = env.context;
        return model.data.entity.type.getString(model.entities.dataIndex[getAddress(env, v).entity])
    }),

    secondaryStructureKey: prop((env, v) => env.context.model.secondaryStructure.key[env.slots.element.residue]),
    secondaryStructureFlags: prop((env, v) => SecondaryStructure.flags(env.context.model, env.slots.element.residue))
}