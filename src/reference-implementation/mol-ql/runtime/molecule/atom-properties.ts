/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import MolQL from '../../../../mol-ql/symbols'
import SymbolRuntime from '../../../mini-lisp/symbol'
import Environment from '../../../mini-lisp/environment'
import Context from '../context'
import RuntimeExpression from '../../../mini-lisp/expression'
import { ElementSymbol } from '../../../molecule/data'

type Env = Environment<Context>

const x = MolQL.structure.atomProperty

function prop(runtime: SymbolRuntime<Context>) { return runtime; }

const properties = {
    atomKey: prop((env, v) => env.context.element.value.atom),
    residueKey: prop((env, v) => env.context.model.residues.key[env.context.element.value.residue]),
    chainKey: prop((env, v) => env.context.model.chains.key[env.context.element.value.chain]),
    entityKey: prop((env, v) => env.context.model.entities.key[env.context.element.value.entity]),

    type_symbol: prop((env, v) => ElementSymbol(env.context.atom_site.type_symbol.getString(env.context.element.value.dataIndex))),

    auth_asym_id: prop((env, v) => env.context.atom_site.auth_asym_id.getString(env.context.element.value.dataIndex)),
    auth_atom_id: prop((env, v) => env.context.atom_site.auth_atom_id.getString(env.context.element.value.dataIndex)),
    auth_comp_id: prop((env, v) => env.context.atom_site.auth_comp_id.getString(env.context.element.value.dataIndex)),
    auth_seq_id: prop((env, v) => env.context.atom_site.auth_seq_id.getInteger(env.context.element.value.dataIndex)),
}

export default properties