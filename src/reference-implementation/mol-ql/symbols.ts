/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import MolQL from '../../mol-ql/symbols'
import Symbol, { SymbolTable } from '../mini-lisp/symbol'
import { FastSet, FastMap } from '../utils/collections'
import Context from './runtime/context'
import { ElementSymbol, ResidueIdentifier } from '../molecule/data'
import MoleculeRuntime from './runtime/molecule'


const staticAttr: Symbol.Attributes = { isStatic: true }

export const SymbolRuntime: Symbol.Info<Context>[] = [
    ////////////////////////////////////
    // Primitives

    // ============= TYPES =============

    Symbol(MolQL.primitive.type.bool, staticAttr)((env, v) => !!v[0](env)),
    Symbol(MolQL.primitive.type.num, staticAttr)((env, v) => +v[0](env)),
    Symbol(MolQL.primitive.type.str, staticAttr)((env, v) => '' + v[0](env)),
    Symbol(MolQL.primitive.type.set, staticAttr)((env, xs) => {
        const set = FastSet.create<any>();
        for (let i = 0, _i = xs.length!; i < _i; i++) set.add(xs[i](env));
        return set;
    }),
    Symbol(MolQL.primitive.type.map, staticAttr)((env, xs) => {
        const map = FastMap.create<any, any>();
        for (let i = 0, _i = xs.length!; i < _i; i += 2) map.set(xs[i](env), xs[i + 1](env));
        return map;
    }),
    Symbol(MolQL.primitive.type.regex, staticAttr)((env, v) => new RegExp(v[0](env), (v[1] && v[1](env)) || '')),

    // ============= OPERATORS =============

    // ============= LOGIC ================
    Symbol(MolQL.primitive.operator.logic.not, staticAttr)((env, v) => !v[0](env)),
    Symbol(MolQL.primitive.operator.logic.and, staticAttr)((env, args) => {
        for (let i = 0, _i = args.length!; i < _i; i++)  if (!args[i](env)) return false;
        return true;
    }),
    Symbol(MolQL.primitive.operator.logic.or, staticAttr)((env, args) => {
        for (let i = 0, _i = args.length!; i < _i; i++)  if (args[i](env)) return true;
        return false;
    }),

    // ============= RELATIONAL ================
    Symbol(MolQL.primitive.operator.relational.eq, staticAttr)((env, v) => v[0](env) === v[1](env)),

    // ============= ARITHMETIC ================
    Symbol(MolQL.primitive.operator.arithmetic.add, staticAttr)((env, args) => {
        let ret = 0;
        for (let i = 0, _i = args.length!; i < _i; i++) ret += args[i](env);
        return ret;
    }),

    // ============= SET ================
    Symbol(MolQL.primitive.operator.set.has, staticAttr)((env, v) => v[0](env).has(v[1](env))),

    ////////////////////////////////////
    // Structure

    // ============= TYPES ================
    Symbol(MolQL.structure.type.elementSymbol, staticAttr)((env, v) => ElementSymbol(v[0](env))),
    Symbol(MolQL.structure.type.authResidueId, staticAttr)((env, v) => ResidueIdentifier(v[0](env), v[1](env), v[2] && v[2](env))),

    // ============= GENERATORS ================
    Symbol(MolQL.structure.generator.atomGroups)((env, v) => {
        return MoleculeRuntime.Generators.atomGroupsGenerator(env, {
            entityTest: v['entity-test'],
            chainTest: v['chain-test'],
            residueTest: v['residue-test'],
            atomTest: v['atom-test'],
            groupBy: v['group-by']
        })
    }),

    // ============= ATOM PROPERTIES ================
    Symbol(MolQL.structure.atomProperty.atomKey)(MoleculeRuntime.AtomProperties.atomKey),
    Symbol(MolQL.structure.atomProperty.residueKey)(MoleculeRuntime.AtomProperties.residueKey),
    Symbol(MolQL.structure.atomProperty.chainKey)(MoleculeRuntime.AtomProperties.chainKey),
    Symbol(MolQL.structure.atomProperty.entityKey)(MoleculeRuntime.AtomProperties.entityKey),

    Symbol(MolQL.structure.atomProperty.type_symbol)(MoleculeRuntime.AtomProperties.type_symbol),

    Symbol(MolQL.structure.atomProperty.auth_asym_id)(MoleculeRuntime.AtomProperties.auth_asym_id),
    Symbol(MolQL.structure.atomProperty.auth_atom_id)(MoleculeRuntime.AtomProperties.auth_atom_id),
    Symbol(MolQL.structure.atomProperty.auth_comp_id)(MoleculeRuntime.AtomProperties.auth_comp_id),
    Symbol(MolQL.structure.atomProperty.auth_seq_id)(MoleculeRuntime.AtomProperties.auth_seq_id),
]

const table = (function() {
    const ret = Object.create(null);
    for (const r of SymbolRuntime) {
        ret[r.symbol.id] = r;
    }
    return ret as SymbolTable;
})();

export default table