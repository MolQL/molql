/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import AtomSet from '../../query/atom-set'
import AtomSelection from '../../query/atom-selection'
import Context from '../../query/context'
import Environment from '../environment'
import Iterator from '../iterator'
import Slot from '../slot'
import RuntimeExpression from '../expression'
import Compiler from '../../compiler/compiler'
import { ElementSymbol } from '../../molecule/data'
import { StaticAtomProperties } from '../../../language/properties'
import { FastSet } from '../../utils/collections'

import ElementAddress = Context.ElementAddress

function _atomSetPropertySet(env: Environment, atomSet: AtomSet, prop: RuntimeExpression, set: FastSet<any>) {
    const ctx = env.queryCtx;
    const element = Environment.beginIterateElemement(env);
    for (const a of AtomSet.atomIndices(atomSet)) {
        ElementAddress.setAtom(ctx, element, a);
        const p = prop(env);
        if (p !== void 0) set.add(prop(env));
    }
    Environment.endIterateElement(env);

    return set;
}

export function atomSetPropertySet(env: Environment, prop: RuntimeExpression, set: AtomSet) {
    return _atomSetPropertySet(env, set, prop, FastSet.create());
}

export function selectionPropertySet(env: Environment, prop: RuntimeExpression, selection: AtomSelection) {
    const set = FastSet.create<any>();
    for (const atomSet of AtomSelection.atomSets(selection)) {
        _atomSetPropertySet(env, atomSet, prop, set);
    }
    return set;
}

export function accumulateAtomSet(env: Environment, initial: RuntimeExpression, f: RuntimeExpression) {
    // TODO: no nested accumulators
    const ctx = env.queryCtx;
    const slot = Slot.push(env.atomSetReducer, initial(env));
    const element = Environment.beginIterateElemement(env);
    for (const a of AtomSet.atomIndices(env.atomSet.value)) {
        ElementAddress.setAtom(ctx, element, a);
        slot.value = f(env);
    }
    Environment.endIterateElement(env);
    return Slot.pop(slot);
}

function prop(runtime: RuntimeExpression): Compiler.CompiledExpression {
    return Compiler.CompiledExpression.apply(runtime);
}

export function staticAtomProperty(compilerCtx: Compiler.CompileContext, name: StaticAtomProperties): Compiler.CompiledExpression {
    switch (name) {
        case 'group_PDB': return prop(env => env.atom_site.group_PDB.getString(env.element.value.dataIndex));
        case 'id': return prop(env => env.atom_site.id.getInteger(env.element.value.dataIndex));
        case 'type_symbol': return prop(env => ElementSymbol(env.atom_site.type_symbol.getString(env.element.value.dataIndex)));
        case 'label_atom_id': return prop(env => env.atom_site.type_symbol.getString(env.element.value.dataIndex));
        case 'label_alt_id': return prop(env => env.atom_site.label_alt_id.getString(env.element.value.dataIndex));
        case 'label_comp_id': return prop(env => env.atom_site.label_comp_id.getString(env.element.value.dataIndex));
        case 'label_asym_id': return prop(env => env.atom_site.label_asym_id.getString(env.element.value.dataIndex));
        case 'label_entity_id': return prop(env => env.atom_site.label_entity_id.getString(env.element.value.dataIndex));
        case 'label_seq_id': return prop(env => env.atom_site.label_seq_id.getInteger(env.element.value.dataIndex));
        case 'pdbx_PDB_ins_code': return prop(env => env.atom_site.pdbx_PDB_ins_code.getString(env.element.value.dataIndex));
        case 'pdbx_formal_charge': return prop(env => env.atom_site.pdbx_formal_charge.getInteger(env.element.value.dataIndex));
        case 'Cartn_x': return prop(env => env.positions.x[env.element.value.atom]);
        case 'Cartn_y': return prop(env => env.positions.y[env.element.value.atom]);
        case 'Cartn_z': return prop(env => env.positions.z[env.element.value.atom]);
        case 'occupancy': return prop(env => env.atom_site.occupancy.getFloat(env.element.value.dataIndex));
        case 'B_iso_or_equiv': return prop(env => env.atom_site.B_iso_or_equiv.getFloat(env.element.value.dataIndex));
        case 'auth_atom_id': return prop(env => env.atom_site.auth_atom_id.getString(env.element.value.dataIndex));
        case 'auth_comp_id': return prop(env => env.atom_site.auth_comp_id.getString(env.element.value.dataIndex));
        case 'auth_asym_id': return prop(env => env.atom_site.auth_asym_id.getString(env.element.value.dataIndex));
        case 'auth_seq_id': return prop(env => env.atom_site.auth_seq_id.getInteger(env.element.value.dataIndex));
        case 'pdbx_PDB_model_num': return prop(env => env.atom_site.pdbx_PDB_model_num.getInteger(env.element.value.dataIndex));

        case 'atom-key': return prop(env => env.element.value.atom);
        case 'residue-key': return prop(env => env.element.value.residue);
        case 'chain-key': return prop(env => env.element.value.chain);
        case 'entity-key': return prop(env => env.element.value.entity);

        case 'is-het': return prop(env => !env.atom_site.group_PDB.stringEquals(env.element.value.dataIndex, 'ATOM'));
        //case 'operator-name': return prop(env => '1_555');

        default: {
            compilerCtx.warnings.push(`Compiling undefined property '${name}'.`);
            return prop(env => void 0);
        }
    }
}