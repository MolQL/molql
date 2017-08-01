/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import MolQL from '../../molql/symbols'
import Symbol, { SymbolTable } from '../mini-lisp/symbol'
import Context from './context'
import { FastSet, FastMap } from '../utils/collections'

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
        for (let i = 0, _i = xs.length; i < _i; i++) set.add(xs[i](env));
        return set;
    }),
    Symbol(MolQL.primitive.type.map, staticAttr)((env, xs) => {
        const map = FastMap.create<any, any>();
        for (let i = 0; i < xs.length; i += 2) map.set(xs[i](env), xs[i + 1](env));
        return map;
    }),
    //Symbol(MolQL.primitive.type.regex, staticAttr)((env, v) => new RegExp(v[0](env), (v[1] && v[1](env)) || '')),

    // ============= OPERATORS =============

    // ============= LOGIC ================
    Symbol(MolQL.primitive.operator.logic.not, staticAttr)((env, v) => !v[0](env)),
    Symbol(MolQL.primitive.operator.logic.and, staticAttr)((env, args) => {
        for (let i = 0, _i = args.length; i < _i; i++)  if (!args[i](env)) return false;
        return true;
    }),
    Symbol(MolQL.primitive.operator.logic.or, staticAttr)((env, args) => {
        for (let i = 0, _i = args.length; i < _i; i++)  if (args[i](env)) return true;
        return false;
    }),

    // ============= RELATIONAL ================
    Symbol(MolQL.primitive.operator.relational.eq, staticAttr)((env, v) => v[0](env) === v[1](env)),

    // ============= ARITHMETIC ================
    Symbol(MolQL.primitive.operator.arithmetic.add, staticAttr)((env, args) => {
        let ret = 0;
        for (let i = 0, _i = args.length; i < _i; i++) ret += args[i](env);
        return ret;
    }),

    // ============= SET ================
    Symbol(MolQL.primitive.operator.set.has, staticAttr)((env, v) => v[0](env).has(v[1](env))),
]

const table = (function() {
    const ret = Object.create(null);
    for (const r of SymbolRuntime) {
        ret[r.symbol.id] = r;
    }
    return ret as SymbolTable;
})();

export default table