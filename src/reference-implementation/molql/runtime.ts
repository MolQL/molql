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

    Symbol(MolQL.primitive.type.bool, staticAttr).ofMap((env, v) => !!v[0](env)),
    Symbol(MolQL.primitive.type.num, staticAttr).ofMap((env, v) => +v[0](env)),
    Symbol(MolQL.primitive.type.str, staticAttr).ofMap((env, v) => '' + v[0](env)),
    Symbol(MolQL.primitive.type.set, staticAttr).ofArray((env, xs) => {
        const set = FastSet.create<any>();
        for (const x of xs) set.add(x(env));
        return set;
    }),
    Symbol(MolQL.primitive.type.map, staticAttr).ofArray((env, xs) => {
        const map = FastMap.create<any, any>();
        for (let i = 0; i < xs.length; i += 2) map.set(xs[i](env), xs[i + 1](env));
        return map;
    }),
    Symbol(MolQL.primitive.type.regex, staticAttr).ofMap((env, v) => new RegExp(v.expression(env), (v.flags && v.flags(env)) || '')),

    // ============= OPERATORS =============

    // ============= LOGIC ================
    Symbol(MolQL.primitive.operator.logic.not, staticAttr).ofMap((env, v) => !v[0](env)),
    Symbol(MolQL.primitive.operator.logic.and, staticAttr).ofArray((env, args) => {
        for (let i = 0, _i = args.length; i < _i; i++)  if (!args[i](env)) return false;
        return true;
    }),
    Symbol(MolQL.primitive.operator.logic.or, staticAttr).ofArray((env, args) => {
        for (let i = 0, _i = args.length; i < _i; i++)  if (args[i](env)) return true;
        return false;
    }),

    // ============= RELATIONAL ================
    Symbol(MolQL.primitive.operator.relational.eq, staticAttr).ofMap((env, v) => v[0](env) === v[1](env)),

    // ============= ARITHMETIC ================
    Symbol(MolQL.primitive.operator.arithmetic.add, staticAttr).ofArray((env, args) => {
        let ret = 0;
        for (let i = 0, _i = args.length; i < _i; i++) ret += args[i](env);
        return ret;
    }),

    // ============= SET ================
    Symbol(MolQL.primitive.operator.set.has, staticAttr).ofMap((env, v) => v[0](env).has(v[1](env))),
]

const table = (function() {
    const ret = Object.create(null);
    for (const r of SymbolRuntime) {
        ret[r.symbol.id] = r;
    }
    return ret as SymbolTable;
})();

export default table