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
import { Set } from 'immutable'
import Compiler from '../../compiler/compiler'
import { ElementSymbol } from '../../molecule/data'
import { StaticAtomProperties } from '../../../language/properties'

import ElementAddress = Context.ElementAddress

function _atomSetPropertySet(env: Environment, atomSet: AtomSet, prop: RuntimeExpression, set: Set<any>) {
    const ctx = env.queryCtx;
    const element = Environment.beginIterateElemement(env);
    for (const a of atomSet.atomIndices) {
        ElementAddress.setAtom(ctx, element, a);
        set.add(prop(env));
    }
    Environment.endIterateElement(env);

    return set;
}

export function atomSetPropertySet(env: Environment, prop: RuntimeExpression) {
    return _atomSetPropertySet(env, env.atomSet.value, prop, Set().asMutable()).asImmutable();
}

export function selectionPropertySet(env: Environment, prop: RuntimeExpression, selection: AtomSelection) {
    const set = Set().asMutable();
    for (const atomSet of selection.atomSets) {
        _atomSetPropertySet(env, atomSet, prop, set);
    }
    return set.asImmutable();
}

export function accumulateAtomSet(env: Environment, f: RuntimeExpression, initial: RuntimeExpression) {
    const ctx = env.queryCtx;
    const slot = Slot.push(env.atomSetReducer, initial(env));
    const element = Environment.beginIterateElemement(env);
    for (const a of env.atomSet.value.atomIndices) {
        ElementAddress.setAtom(ctx, element, a);
        slot.value = f(env);
    }
    Environment.endIterateElement(env);
    return Slot.pop(slot);
}

export function staticAtomProperty(name: StaticAtomProperties): Compiler.CompiledExpression {
    switch (name) {
        case 'group_PDB': return Compiler.CompiledExpression.apply(env => env.atom_site.group_PDB.getString(env.element.value.dataIndex));
        case 'id': return Compiler.CompiledExpression.apply(env => env.atom_site.id.getInteger(env.element.value.dataIndex));
        case 'type_symbol': return Compiler.CompiledExpression.apply(env => ElementSymbol(env.atom_site.type_symbol.getString(env.element.value.dataIndex)));
        case 'label_atom_id': return Compiler.CompiledExpression.apply(env => env.atom_site.type_symbol.getString(env.element.value.dataIndex));
        case 'label_alt_id': return Compiler.CompiledExpression.apply(env => env.atom_site.label_alt_id.getString(env.element.value.dataIndex));
        case 'label_comp_id': return Compiler.CompiledExpression.apply(env => env.atom_site.label_comp_id.getString(env.element.value.dataIndex));
        case 'label_asym_id': return Compiler.CompiledExpression.apply(env => env.atom_site.label_asym_id.getString(env.element.value.dataIndex));
        case 'label_entity_id': return Compiler.CompiledExpression.apply(env => env.atom_site.label_entity_id.getString(env.element.value.dataIndex));
        case 'label_seq_id': return Compiler.CompiledExpression.apply(env => env.atom_site.label_seq_id.getInteger(env.element.value.dataIndex));
        case 'pdbx_PDB_ins_code': return Compiler.CompiledExpression.apply(env => env.atom_site.pdbx_PDB_ins_code.getString(env.element.value.dataIndex));
        case 'pdbx_formal_charge': return Compiler.CompiledExpression.apply(env => env.atom_site.pdbx_formal_charge.getInteger(env.element.value.dataIndex));
        case 'Cartn_x': return Compiler.CompiledExpression.apply(env => env.positions.x[env.element.value.atom]);
        case 'Cartn_y': return Compiler.CompiledExpression.apply(env => env.positions.y[env.element.value.atom]);
        case 'Cartn_z': return Compiler.CompiledExpression.apply(env => env.positions.z[env.element.value.atom]);
        case 'occupancy': return Compiler.CompiledExpression.apply(env => env.atom_site.occupancy.getFloat(env.element.value.dataIndex));
        case 'B_iso_or_equiv': return Compiler.CompiledExpression.apply(env => env.atom_site.B_iso_or_equiv.getFloat(env.element.value.dataIndex));
        case 'auth_atom_id': return Compiler.CompiledExpression.apply(env => env.atom_site.auth_atom_id.getString(env.element.value.dataIndex));
        case 'auth_comp_id': return Compiler.CompiledExpression.apply(env => env.atom_site.auth_comp_id.getString(env.element.value.dataIndex));
        case 'auth_asym_id': return Compiler.CompiledExpression.apply(env => env.atom_site.auth_asym_id.getString(env.element.value.dataIndex));
        case 'auth_seq_id': return Compiler.CompiledExpression.apply(env => env.atom_site.auth_seq_id.getInteger(env.element.value.dataIndex));
        case 'pdbx_PDB_model_num': return Compiler.CompiledExpression.apply(env => env.atom_site.pdbx_PDB_model_num.getInteger(env.element.value.dataIndex));

        case 'is-het': return Compiler.CompiledExpression.apply(env => !env.atom_site.group_PDB.stringEquals(env.element.value.dataIndex, 'ATOM'));
        case 'operator-name': return Compiler.CompiledExpression.apply(env => '1_555');

        default: throw new Error('Unknown static atom property name.');
    }
}