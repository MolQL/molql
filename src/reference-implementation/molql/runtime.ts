/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import MolQL from '../../molql/symbol-table'
import Symbol, { SymbolRuntimeTable } from './symbol'
import { isSymbol } from '../../molql/symbol'
import { FastSet } from '../utils/collections'
import { ElementSymbol, ResidueIdentifier } from '../molecule/data'
import StructureRuntime from './runtime/structure'


const staticAttr: Symbol.Attributes = { isStatic: true }

export const SymbolRuntime: Symbol.Info[] = [
    ////////////////////////////////////
    // Core

    // ============= TYPES =============

    Symbol(MolQL.core.type.bool, staticAttr)((env, v) => !!v[0](env)),
    Symbol(MolQL.core.type.num, staticAttr)((env, v) => +v[0](env)),
    Symbol(MolQL.core.type.str, staticAttr)((env, v) => '' + v[0](env)),
    Symbol(MolQL.core.type.list, staticAttr)((env, xs) => {
        const list: any[] = [];
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) list.push(xs[i](env));
        } else {
            for (const k of Object.keys(xs)) list.push(xs[k](env));
        }
        return list;
    }),
    Symbol(MolQL.core.type.set, staticAttr)((env, xs) => {
        const set = FastSet.create<any>();
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) set.add(xs[i](env));
        } else {
            for (const k of Object.keys(xs)) set.add(xs[k](env));
        }
        return set;
    }),
    Symbol(MolQL.core.type.regex, staticAttr)((env, v) => new RegExp(v[0](env), (v[1] && v[1](env)) || '')),

    // ============= LOGIC ================
    Symbol(MolQL.core.logic.not, staticAttr)((env, v) => !v[0](env)),
    Symbol(MolQL.core.logic.and, staticAttr)((env, xs) => {
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) if (!xs[i](env)) return false;
        } else {
            for (const k of Object.keys(xs)) if (!xs[k](env)) return false;
        }
        return true;
    }),
    Symbol(MolQL.core.logic.or, staticAttr)((env, xs) => {
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) if (xs[i](env)) return true;
        } else {
            for (const k of Object.keys(xs)) if (xs[k](env)) return true;
        }
        return false;
    }),

    // ============= RELATIONAL ================
    Symbol(MolQL.core.rel.eq, staticAttr)((env, v) => v[0](env) === v[1](env)),
    Symbol(MolQL.core.rel.neq, staticAttr)((env, v) => v[0](env) !== v[1](env)),
    Symbol(MolQL.core.rel.lt, staticAttr)((env, v) => v[0](env) < v[1](env)),
    Symbol(MolQL.core.rel.lte, staticAttr)((env, v) => v[0](env) <= v[1](env)),
    Symbol(MolQL.core.rel.gr, staticAttr)((env, v) => v[0](env) > v[1](env)),
    Symbol(MolQL.core.rel.gre, staticAttr)((env, v) => v[0](env) >= v[1](env)),
    Symbol(MolQL.core.rel.inRange, staticAttr)((env, v) => {
        const x = v[0](env);
        return x >= v[1](env) && x <= v[2](env)
    }),

    // ============= CONTROL FLOW ================
    Symbol(MolQL.core.ctrl.if, staticAttr)((env, v) => v[0](env) ? v[1](env) : v[2](env)),
    Symbol(MolQL.core.ctrl.fn)((env, v) => v[0]),
    Symbol(MolQL.core.ctrl.eval)((env, v) => v[0](env)(env)),

    // ============= ARITHMETIC ================
    Symbol(MolQL.core.math.add, staticAttr)((env, xs) => {
        let ret = 0;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret += xs[i](env);
        } else {
            for (const k of Object.keys(xs)) ret += xs[k](env);
        }
        return ret;
    }),
    Symbol(MolQL.core.math.sub, staticAttr)((env, xs) => {
        let ret = 0;
        if (typeof xs.length === 'number') {
            if (xs.length === 1) return -xs[0](env);
            ret = xs[0](env) || 0;
            for (let i = 1, _i = xs.length; i < _i; i++) ret -= xs[i](env);
        } else {
            const keys = Object.keys(xs);
            if (keys.length === 1)
            ret = xs[keys[0]](env) || 0;
            for (let i = 1, _i = keys.length; i < _i; i++) ret -= xs[keys[i]](env);
        }
        return ret;
    }),
    Symbol(MolQL.core.math.mult, staticAttr)((env, xs) => {
        let ret = 1;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret *= xs[i](env);
        } else {
            for (const k of Object.keys(xs)) ret *= xs[k](env);
        }
        return ret;
    }),
    Symbol(MolQL.core.math.div, staticAttr)((env, v) => v[0](env) / v[1](env)),
    Symbol(MolQL.core.math.pow, staticAttr)((env, v) => Math.pow(v[0](env), v[1](env))),
    Symbol(MolQL.core.math.mod, staticAttr)((env, v) => v[0](env) % v[1](env)),

    Symbol(MolQL.core.math.min, staticAttr)((env, xs) => {
        let ret = Number.POSITIVE_INFINITY;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret = Math.min(xs[i](env), ret);
        } else {
            for (const k of Object.keys(xs)) ret = Math.min(xs[k](env), ret)
        }
        return ret;
    }),
    Symbol(MolQL.core.math.max, staticAttr)((env, xs) => {
        let ret = Number.NEGATIVE_INFINITY;
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret = Math.max(xs[i](env), ret);
        } else {
            for (const k of Object.keys(xs)) ret = Math.max(xs[k](env), ret)
        }
        return ret;
    }),

    Symbol(MolQL.core.math.floor, staticAttr)((env, v) => Math.floor(v[0](env))),
    Symbol(MolQL.core.math.ceil, staticAttr)((env, v) => Math.ceil(v[0](env))),
    Symbol(MolQL.core.math.roundInt, staticAttr)((env, v) => Math.round(v[0](env))),
    Symbol(MolQL.core.math.abs, staticAttr)((env, v) => Math.abs(v[0](env))),
    Symbol(MolQL.core.math.sqrt, staticAttr)((env, v) => Math.sqrt(v[0](env))),
    Symbol(MolQL.core.math.sin, staticAttr)((env, v) => Math.sin(v[0](env))),
    Symbol(MolQL.core.math.cos, staticAttr)((env, v) => Math.cos(v[0](env))),
    Symbol(MolQL.core.math.tan, staticAttr)((env, v) => Math.tan(v[0](env))),
    Symbol(MolQL.core.math.asin, staticAttr)((env, v) => Math.asin(v[0](env))),
    Symbol(MolQL.core.math.acos, staticAttr)((env, v) => Math.acos(v[0](env))),
    Symbol(MolQL.core.math.atan, staticAttr)((env, v) => Math.atan(v[0](env))),
    Symbol(MolQL.core.math.sinh, staticAttr)((env, v) => Math.sinh(v[0](env))),
    Symbol(MolQL.core.math.cosh, staticAttr)((env, v) => Math.cosh(v[0](env))),
    Symbol(MolQL.core.math.tanh, staticAttr)((env, v) => Math.tanh(v[0](env))),
    Symbol(MolQL.core.math.exp, staticAttr)((env, v) => Math.exp(v[0](env))),
    Symbol(MolQL.core.math.log, staticAttr)((env, v) => Math.log(v[0](env))),
    Symbol(MolQL.core.math.log10, staticAttr)((env, v) => Math.log10(v[0](env))),
    Symbol(MolQL.core.math.atan2, staticAttr)((env, v) => Math.atan2(v[0](env), v[1](env))),

    // ============= STRING ================
    Symbol(MolQL.core.str.match, staticAttr)((env, v) => v[0](env).test(v[1](env))),
    Symbol(MolQL.core.str.concat, staticAttr)((env, xs) => {
        let ret: string[] = [];
        if (typeof xs.length === 'number') {
            for (let i = 0, _i = xs.length; i < _i; i++) ret.push(xs[i](env).toString());
        } else {
            for (const k of Object.keys(xs)) ret.push(xs[k](env).toString());
        }
        return ret.join('');
    }),

    // ============= LIST ================
    Symbol(MolQL.core.list.getAt, staticAttr)((env, v) => v[0](env)[v[1](env)]),

    // ============= SET ================
    Symbol(MolQL.core.set.has, staticAttr)((env, v) => v[0](env).has(v[1](env))),

    ////////////////////////////////////
    // Structure

    // ============= TYPES ================
    Symbol(MolQL.structure.type.elementSymbol, staticAttr)((env, v) => ElementSymbol(v[0](env))),
    Symbol(MolQL.structure.type.authResidueId, staticAttr)((env, v) => ResidueIdentifier.auth(v[0](env), v[1](env), v[2] && v[2](env))),
    Symbol(MolQL.structure.type.labelResidueId, staticAttr)((env, v) => ResidueIdentifier.label(v[0](env), v[1](env), v[2](env), v[3] && v[3](env))),

    // ============= GENERATORS ================
    Symbol(MolQL.structure.generator.atomGroups)((env, v) =>
        (env) => StructureRuntime.Generators.atomGroupsGenerator(env, { entityTest: v['entity-test'], chainTest: v['chain-test'], residueTest: v['residue-test'], atomTest: v['atom-test'], groupBy: v['group-by'] })),
    Symbol(MolQL.structure.generator.queryInSelection)((env, v) => env => StructureRuntime.Generators.querySelection(env, v.selection(env), v.query(env), v['in-complement'])),

    // ============= MODIFIERS ================
    Symbol(MolQL.structure.modifier.queryEach)((env, v) => env => StructureRuntime.Modifiers.queryEach(env, v.selection(env), v.query(env))),
    Symbol(MolQL.structure.modifier.intersectBy)((env, v) => env => StructureRuntime.Modifiers.intersectBy(env, v.selection(env), v.by(env))),
    Symbol(MolQL.structure.modifier.exceptBy)((env, v) => env => StructureRuntime.Modifiers.exceptBy(env, v.selection(env), v.by(env))),
    Symbol(MolQL.structure.modifier.unionBy)((env, v) => env => StructureRuntime.Modifiers.unionBy(env, v.selection(env), v.by(env))),
    Symbol(MolQL.structure.modifier.union)((env, v) => env => StructureRuntime.Modifiers.union(env, v.selection(env))),
    Symbol(MolQL.structure.modifier.cluster)((env, v) => env => StructureRuntime.Modifiers.cluster(env, {
        selection: v.selection(env),
        minDist: v['min-distance'],
        maxDist: v['max-distance'],
        minSize: v['min-size'],
        maxSize: v['max-size'],
    })),
    Symbol(MolQL.structure.modifier.includeSurroundings)((env, v) => env => StructureRuntime.Modifiers.includeSurroundings(env, v.selection(env), v.radius, v['as-whole-residues'])),

    // ============= FILTERS ================
    Symbol(MolQL.structure.filter.pick)((env, v) => env => StructureRuntime.Filters.pick(env, v.selection(env), v.test)),
    Symbol(MolQL.structure.filter.withSameAtomProperties)((env, v) => env => StructureRuntime.Filters.withSameAtomProperties(env, v.selection(env), v.source(env), v.property)),
    Symbol(MolQL.structure.filter.within)((env, v) => env => StructureRuntime.Filters.within(env, v.selection(env), v.target(env), v.radius)),

    // ============= COMBINATORS ================
    Symbol(MolQL.structure.combinator.intersect)((env, xs) => env => StructureRuntime.Combinators.intersect(env, xs)),
    Symbol(MolQL.structure.combinator.merge)((env, xs) => env => StructureRuntime.Combinators.merge(env, xs)),
    Symbol(MolQL.structure.combinator.distanceCluster)((env, v) => env => StructureRuntime.Combinators.distanceCluster(env, v.matrix, v.selections)),

    // ============= ATOM SETS ================
    Symbol(MolQL.structure.atomSet.atomCount)((env, v) => StructureRuntime.AtomSet.atomCount(env)),
    Symbol(MolQL.structure.atomSet.countQuery)((env, v) => StructureRuntime.AtomSet.countQuery(env, v.query(env))),
    Symbol(MolQL.structure.atomSet.reduce.accumulator)((env, v) => StructureRuntime.AtomSet.accumulateAtomSet(env, v.initial, v.value)),
    Symbol(MolQL.structure.atomSet.reduce.value)((env, v) => env.slots.atomSetReducer.value),

    // ============= ATOM PROPERTIES ================
    ...atomProps(MolQL.structure.atomProperty.core, StructureRuntime.AtomProperties.Core),
    ...atomProps(MolQL.structure.atomProperty.macromolecular, StructureRuntime.AtomProperties.Macromolecular)
]

function atomProps<S>(symbols: S, implementation: { [P in keyof S]?: any }) {
    return Object.keys(symbols)
        .filter(k => isSymbol((symbols as any)[k]) && !!(implementation)[k])
        .map(k => Symbol((symbols as any)[k])(implementation[k]));
}

const table = (function() {
    const ret = Object.create(null);
    for (const r of SymbolRuntime) {
        if (ret[r.symbol.id]) {
            throw new Error(`You've already implemented '${r.symbol.id}', dummy.`);
        }
        ret[r.symbol.id] = r;
    }
    return ret as SymbolRuntimeTable;
})();

export default table