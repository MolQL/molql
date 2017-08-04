/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import MolQL from '../../mol-ql/symbols'
import Symbol, { SymbolTable } from '../mini-lisp/symbol'
import { isSymbol } from '../../mini-lisp/symbol'
import { FastSet, FastMap } from '../utils/collections'
import Context from './runtime/context'
import { ElementSymbol, ResidueIdentifier } from '../molecule/data'
import StructureRuntime from './runtime/structure'


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
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) set.add(xs[i](env));
        } else {
            for (const k of Object.keys(xs)) set.add(xs[k](env));
        }
        return set;
    }),
    Symbol(MolQL.primitive.type.map, staticAttr)((env, xs) => {
        const map = FastMap.create<any, any>();
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i += 2) map.set(xs[i](env), xs[i + 1](env));
        } else {
            const keys = Object.keys(xs);
            for (let i = 0, _i = keys.length; i < _i; i += 2) map.set(xs[keys[i]](env), xs[keys[i + 1]](env));
        }
        return map;
    }),
    Symbol(MolQL.primitive.type.regex, staticAttr)((env, v) => new RegExp(v[0](env), (v[1] && v[1](env)) || '')),

    // ============= OPERATORS =============

    // ============= LOGIC ================
    Symbol(MolQL.primitive.operator.logic.not, staticAttr)((env, v) => !v[0](env)),
    Symbol(MolQL.primitive.operator.logic.and, staticAttr)((env, xs) => {
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) if (!xs[i](env)) return false;
        } else {
            for (const k of Object.keys(xs)) if (!xs[k](env)) return false;
        }
        return true;
    }),
    Symbol(MolQL.primitive.operator.logic.or, staticAttr)((env, xs) => {
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) if (xs[i](env)) return true;
        } else {
            for (const k of Object.keys(xs)) if (xs[k](env)) return true;
        }
        return false;
    }),

    // ============= RELATIONAL ================
    Symbol(MolQL.primitive.operator.relational.eq, staticAttr)((env, v) => v[0](env) === v[1](env)),
    Symbol(MolQL.primitive.operator.relational.neq, staticAttr)((env, v) => v[0](env) !== v[1](env)),
    Symbol(MolQL.primitive.operator.relational.lt, staticAttr)((env, v) => v[0](env) < v[1](env)),
    Symbol(MolQL.primitive.operator.relational.lte, staticAttr)((env, v) => v[0](env) <= v[1](env)),
    Symbol(MolQL.primitive.operator.relational.gr, staticAttr)((env, v) => v[0](env) > v[1](env)),
    Symbol(MolQL.primitive.operator.relational.gre, staticAttr)((env, v) => v[0](env) >= v[1](env)),
    Symbol(MolQL.primitive.operator.relational.inRange, staticAttr)((env, v) => {
        const x = v[0](env);
        return x >= v[1](env) && x <= v[2](env)
    }),

    // ============= CONTROL FLOW ================
    Symbol(MolQL.primitive.operator.controlFlow.if, staticAttr)((env, v) => v['cond'](env) ? v['if-true'](env) : v['if-false'](env)),

    // ============= ARITHMETIC ================
    Symbol(MolQL.primitive.operator.arithmetic.add, staticAttr)((env, xs) => {
        let ret = 0;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret += xs[i](env);
        } else {
            for (const k of Object.keys(xs)) ret += xs[k](env);
        }
        return ret;
    }),
    Symbol(MolQL.primitive.operator.arithmetic.sub, staticAttr)((env, xs) => {
        let ret = 0;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret -= xs[i](env);
        } else {
            for (const k of Object.keys(xs)) ret -= xs[k](env);
        }
        return ret;
    }),
    Symbol(MolQL.primitive.operator.arithmetic.mult, staticAttr)((env, xs) => {
        let ret = 1;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret *= xs[i](env);
        } else {
            for (const k of Object.keys(xs)) ret *= xs[k](env);
        }
        return ret;
    }),
    Symbol(MolQL.primitive.operator.arithmetic.div, staticAttr)((env, v) => v[0](env) / v[1](env)),
    Symbol(MolQL.primitive.operator.arithmetic.pow, staticAttr)((env, v) => Math.pow(v[0](env), v[1](env))),

    Symbol(MolQL.primitive.operator.arithmetic.min, staticAttr)((env, xs) => {
        let ret = Number.POSITIVE_INFINITY;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret = Math.min(xs[i](env), ret);
        } else {
            for (const k of Object.keys(xs)) ret = Math.min(xs[k](env), ret)
        }
        return ret;
    }),
    Symbol(MolQL.primitive.operator.arithmetic.max, staticAttr)((env, xs) => {
        let ret = Number.NEGATIVE_INFINITY;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret = Math.max(xs[i](env), ret);
        } else {
            for (const k of Object.keys(xs)) ret = Math.max(xs[k](env), ret)
        }
        return ret;
    }),

    Symbol(MolQL.primitive.operator.arithmetic.floor, staticAttr)((env, v) => Math.floor(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.ceil, staticAttr)((env, v) => Math.ceil(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.roundInt, staticAttr)((env, v) => Math.round(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.abs, staticAttr)((env, v) => Math.abs(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.sqrt, staticAttr)((env, v) => Math.sqrt(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.sin, staticAttr)((env, v) => Math.sin(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.cos, staticAttr)((env, v) => Math.cos(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.tan, staticAttr)((env, v) => Math.tan(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.asin, staticAttr)((env, v) => Math.asin(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.acos, staticAttr)((env, v) => Math.acos(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.atan, staticAttr)((env, v) => Math.atan(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.sinh, staticAttr)((env, v) => Math.sinh(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.cosh, staticAttr)((env, v) => Math.cosh(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.tanh, staticAttr)((env, v) => Math.tanh(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.exp, staticAttr)((env, v) => Math.exp(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.log, staticAttr)((env, v) => Math.log(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.log10, staticAttr)((env, v) => Math.log10(v[0](env))),
    Symbol(MolQL.primitive.operator.arithmetic.atan2, staticAttr)((env, v) => Math.atan2(v[0](env), v[1](env))),

    // ============= STRING ================
    Symbol(MolQL.primitive.operator.string.match, staticAttr)((env, v) => v[0](env).test(v[1](env))),
    Symbol(MolQL.primitive.operator.string.concat, staticAttr)((env, xs) => {
        let ret: string[] = [];
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret.push(xs[i](env).toString());
        } else {
            for (const k of Object.keys(xs)) ret.push(xs[k](env).toString());
        }
        return ret.join('');
    }),

    // ============= SET ================
    Symbol(MolQL.primitive.operator.set.has, staticAttr)((env, v) => v[0](env).has(v[1](env))),

    // ============= MAP ================
    Symbol(MolQL.primitive.operator.map.has, staticAttr)((env, v) => v[0](env).has(v[1](env))),
    Symbol(MolQL.primitive.operator.map.get, staticAttr)((env, v) => {
        const map = v[0](env), key = v[1](env);
        if (map.has(key)) return map.get(key);
        return v[2](env);
    }),

    ////////////////////////////////////
    // Structure

    // ============= TYPES ================
    Symbol(MolQL.structure.type.elementSymbol, staticAttr)((env, v) => ElementSymbol(v[0](env))),
    Symbol(MolQL.structure.type.authResidueId, staticAttr)((env, v) => ResidueIdentifier(v[0](env), v[1](env), v[2] && v[2](env))),

    // ============= GENERATORS ================
    Symbol(MolQL.structure.generator.atomGroups)((env, v) => {
        return StructureRuntime.Generators.atomGroupsGenerator(env, {
            entityTest: v['entity-test'],
            chainTest: v['chain-test'],
            residueTest: v['residue-test'],
            atomTest: v['atom-test'],
            groupBy: v['group-by']
        })
    }),
    Symbol(MolQL.structure.generator.querySelection)((env, v) => StructureRuntime.Generators.querySelection(env, v.selection, v.query)),

    // ============= MODIFIERS ================
    Symbol(MolQL.structure.modifier.queryEach)((env, v) => StructureRuntime.Modifiers.queryEach(env, v.selection, v.query)),
    Symbol(MolQL.structure.modifier.queryComplement)((env, v) => StructureRuntime.Modifiers.queryComplement(env, v.selection, v.query)),
    Symbol(MolQL.structure.modifier.intersectBy)((env, v) => StructureRuntime.Modifiers.intersectBy(env, v.selection, v.by)),
    Symbol(MolQL.structure.modifier.exceptBy)((env, v) => StructureRuntime.Modifiers.exceptBy(env, v.selection, v.by)),
    Symbol(MolQL.structure.modifier.unionBy)((env, v) => StructureRuntime.Modifiers.exceptBy(env, v.selection, v.by)),
    Symbol(MolQL.structure.modifier.union)((env, v) => StructureRuntime.Modifiers.union(env, v.selection)),
    Symbol(MolQL.structure.modifier.cluster)((env, v) => StructureRuntime.Modifiers.cluster(env, v.selection, v['max-radius'])),
    Symbol(MolQL.structure.modifier.includeSurroundings)((env, v) => StructureRuntime.Modifiers.includeSurroundings(env, v.selection, v.radius, v['as-whole-residues'])),

    // ============= FILTERS ================
    Symbol(MolQL.structure.filter.pick)((env, v) => StructureRuntime.Filters.pick(env, v.selection, v.test)),
    Symbol(MolQL.structure.filter.withSameProperties)((env, v) => StructureRuntime.Filters.withProperties(env, v.selection, v.source, v.property)),
    Symbol(MolQL.structure.filter.within)((env, v) => StructureRuntime.Filters.within(env, v.selection, v.target, v.radius)),

    // ============= COMBINATORS ================
    Symbol(MolQL.structure.combinator.intersect)((env, v) => StructureRuntime.Combinators.intersect(env, v)),
    Symbol(MolQL.structure.combinator.merge)((env, v) => StructureRuntime.Combinators.merge(env, v)),
    Symbol(MolQL.structure.combinator.near)((env, v) => StructureRuntime.Combinators.near(env, v as any /* yeah, sometimes we pretty much have to :) */)),

    // ============= ATOM PROPERTIES ================
    ...Object.keys(MolQL.structure.atomProperty)
        .filter(k => isSymbol((MolQL.structure.atomProperty as any)[k]) && !!(StructureRuntime.AtomProperties as any)[k])
        .map(k => atomProp(k as any))
]

function atomProp(p: keyof typeof MolQL.structure.atomProperty) {
    return Symbol(MolQL.structure.atomProperty[p] as any)(StructureRuntime.AtomProperties[p]!)
}

const table = (function() {
    const ret = Object.create(null);
    for (const r of SymbolRuntime) {
        if (ret[r.symbol.id]) {
            throw new Error(`You've already implemented '${r.symbol.id}', dummy.`);
        }
        ret[r.symbol.id] = r;
    }
    return ret as SymbolTable;
})();

export default table