/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Symbol, { Arguments, Argument } from '../../molql/symbol'
import B from '../../molql/builder'
import MolQL from '../../molql/symbol-table'
import Type from '../../molql/type'
import * as Struct from '../../molql/symbol-table/structure'
import Expression from '../../mini-lisp/expression'
import { UniqueArrayBuilder } from '../../reference-implementation/utils/collections'

export type MolQLScriptSymbol =
    | { kind: 'alias', aliases: string[], symbol: Symbol }
    | { kind: 'macro', aliases: string[], symbol: Symbol, translate: (args: any) => Expression }

function Alias(symbol: Symbol, ...aliases: string[]): MolQLScriptSymbol { return { kind: 'alias', aliases, symbol }; }
function Macro(symbol: Symbol, translate: (args: any) => Expression, ...aliases: string[]): MolQLScriptSymbol {
    return { kind: 'macro', symbol, translate, aliases: [symbol.info.name, ...aliases] };
}

const list: MolQLScriptSymbol[] = [
    Alias(MolQL.core.type.bool, 'bool'),
    Alias(MolQL.core.type.num, 'num'),
    Alias(MolQL.core.type.str, 'str'),
    Alias(MolQL.core.type.regex, 'regex'),
    Alias(MolQL.core.type.list, 'list'),
    Alias(MolQL.core.type.set, 'set'),
    Alias(MolQL.core.logic.not, 'not'),
    Alias(MolQL.core.logic.and, 'and'),
    Alias(MolQL.core.logic.or, 'or'),
    Alias(MolQL.core.ctrl.if, 'if'),
    Alias(MolQL.core.ctrl.fn, 'fn'),
    Alias(MolQL.core.ctrl.eval, 'eval'),
    Alias(MolQL.core.math.add, 'add', '+'),
    Alias(MolQL.core.math.sub, 'sub', '-'),
    Alias(MolQL.core.math.mult, 'mult', '*'),
    Alias(MolQL.core.math.div, 'div', '/'),
    Alias(MolQL.core.math.pow, 'pow', '**'),
    Alias(MolQL.core.math.mod, 'mod'),
    Alias(MolQL.core.math.min, 'min'),
    Alias(MolQL.core.math.max, 'max'),
    Alias(MolQL.core.math.floor, 'floor'),
    Alias(MolQL.core.math.ceil, 'ceil'),
    Alias(MolQL.core.math.roundInt, 'round'),
    Alias(MolQL.core.math.abs, 'abs'),
    Alias(MolQL.core.math.sqrt, 'sqrt'),
    Alias(MolQL.core.math.sin, 'sin'),
    Alias(MolQL.core.math.cos, 'cos'),
    Alias(MolQL.core.math.tan, 'tan'),
    Alias(MolQL.core.math.asin, 'asin'),
    Alias(MolQL.core.math.acos, 'acos'),
    Alias(MolQL.core.math.atan, 'atan'),
    Alias(MolQL.core.math.sinh, 'sinh'),
    Alias(MolQL.core.math.cosh, 'cosh'),
    Alias(MolQL.core.math.tanh, 'tanh'),
    Alias(MolQL.core.math.exp, 'exp'),
    Alias(MolQL.core.math.log, 'log'),
    Alias(MolQL.core.math.log10, 'log10'),
    Alias(MolQL.core.math.atan2, 'atan2'),
    Alias(MolQL.core.rel.eq, 'eq', '='),
    Alias(MolQL.core.rel.neq, 'neq', '!='),
    Alias(MolQL.core.rel.lt, 'lt', '<'),
    Alias(MolQL.core.rel.lte, 'lte', '<='),
    Alias(MolQL.core.rel.gr, 'gr', '>'),
    Alias(MolQL.core.rel.gre, 'gre', '>='),
    Alias(MolQL.core.rel.inRange, 'in-range'),
    Alias(MolQL.core.str.concat, 'concat'),
    Alias(MolQL.core.str.match, 'regex.match'),
    Alias(MolQL.core.list.getAt, 'list.get'),
    Alias(MolQL.core.set.has, 'set.has'),
    Alias(MolQL.core.set.isSubset, 'set.subset'),

    Alias(MolQL.structure.type.entityType, 'ent-type'),
    Alias(MolQL.structure.type.authResidueId, 'auth-resid'),
    Alias(MolQL.structure.type.labelResidueId, 'label-resid'),
    Alias(MolQL.structure.type.ringFingerprint, 'ringfp'),

    Alias(MolQL.structure.slot.atomSetReduce, 'atom.set.reduce.value'),

    Alias(MolQL.structure.generator.atomGroups, 'sel.atom.atom-groups'),
    Alias(MolQL.structure.generator.queryInSelection, 'sel.atom.query-in-selection'),
    Alias(MolQL.structure.generator.rings, 'sel.atom.rings'),
    Alias(MolQL.structure.generator.empty, 'sel.atom.empty'),

    Alias(MolQL.structure.modifier.queryEach, 'sel.atom.query-each'),
    Alias(MolQL.structure.modifier.intersectBy, 'sel.atom.intersect-by'),
    Alias(MolQL.structure.modifier.exceptBy, 'sel.atom.except-by'),
    Alias(MolQL.structure.modifier.unionBy, 'sel.atom.union-by'),
    Alias(MolQL.structure.modifier.union, 'sel.atom.union'),
    Alias(MolQL.structure.modifier.cluster, 'sel.atom.cluster'),
    Alias(MolQL.structure.modifier.includeSurroundings, 'sel.atom.include-surroundings'),
    Alias(MolQL.structure.modifier.includeConnected, 'sel.atom.include-connected'),
    Alias(MolQL.structure.modifier.expandProperty, 'sel.atom.expand-property'),

    Alias(MolQL.structure.filter.pick, 'sel.atom.pick'),
    Alias(MolQL.structure.filter.withSameAtomProperties, 'sel.atom.with-same-atom-properties'),
    Alias(MolQL.structure.filter.within, 'sel.atom.within'),
    Alias(MolQL.structure.filter.isConnectedTo, 'sel.atom.is-connected-to'),

    Alias(MolQL.structure.combinator.intersect, 'sel.atom.intersect'),
    Alias(MolQL.structure.combinator.merge, 'sel.atom.merge'),
    Alias(MolQL.structure.combinator.distanceCluster, 'sel.atom.dist-cluster'),

    Alias(MolQL.structure.atomSet.atomCount, 'atom.set.atom-count'),
    Alias(MolQL.structure.atomSet.countQuery, 'atom.set.count-query'),
    Alias(MolQL.structure.atomSet.reduce, 'atom.set.reduce'),
    Alias(MolQL.structure.atomSet.propertySet, 'atom.set.property'),

    Alias(MolQL.structure.atomProperty.core.elementSymbol, 'atom.el'),
    Alias(MolQL.structure.atomProperty.core.x, 'atom.x'),
    Alias(MolQL.structure.atomProperty.core.y, 'atom.y'),
    Alias(MolQL.structure.atomProperty.core.z, 'atom.z'),
    Alias(MolQL.structure.atomProperty.core.atomKey, 'atom.key'),

    Alias(MolQL.structure.atomProperty.topology.connectedComponentKey, 'atom.key.molecule'),

    Alias(MolQL.structure.atomProperty.macromolecular.authResidueId, 'atom.auth-resid'),
    Alias(MolQL.structure.atomProperty.macromolecular.labelResidueId, 'atom.label-resid'),
    Alias(MolQL.structure.atomProperty.macromolecular.residueKey, 'atom.key.res'),
    Alias(MolQL.structure.atomProperty.macromolecular.chainKey, 'atom.key.chain'),
    Alias(MolQL.structure.atomProperty.macromolecular.entityKey, 'atom.key.entity'),
    Alias(MolQL.structure.atomProperty.macromolecular.isHet, 'atom.is-het'),
    Alias(MolQL.structure.atomProperty.macromolecular.id, 'atom.id'),
    Alias(MolQL.structure.atomProperty.macromolecular.label_atom_id, 'atom.label_atom_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.label_alt_id, 'atom.label_alt_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.label_comp_id, 'atom.label_comp_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.label_asym_id, 'atom.label_asym_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.label_entity_id, 'atom.label_entity_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.label_seq_id, 'atom.label_seq_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.auth_atom_id, 'atom.auth_atom_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.auth_comp_id, 'atom.auth_comp_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.auth_asym_id, 'atom.auth_asym_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.auth_seq_id, 'atom.auth_seq_id'),
    Alias(MolQL.structure.atomProperty.macromolecular.pdbx_PDB_ins_code, 'atom.pdbx_PDB_ins_code'),
    Alias(MolQL.structure.atomProperty.macromolecular.pdbx_formal_charge, 'atom.pdbx_formal_charge'),
    Alias(MolQL.structure.atomProperty.macromolecular.occupancy, 'atom.occupancy'),
    Alias(MolQL.structure.atomProperty.macromolecular.B_iso_or_equiv, 'atom.B_iso_or_equiv'),
    Alias(MolQL.structure.atomProperty.macromolecular.entityType, 'atom.entity-type'),

    Alias(MolQL.structure.atomProperty.macromolecular.secondaryStructureKey, 'atom.key.sec-struct'),

    Alias(MolQL.structure.bondProperty.order, 'bond.order'),

    Macro(Symbol('sel.atom.atoms', Arguments.Dictionary({
        0: Argument(Type.Bool, { isOptional: true, defaultValue: true, description: 'Test applied to each atom.' })
    }), Struct.Types.AtomSelection, 'A selection of singleton atom sets.'),
    args => B.struct.generator.atomGroups({ 'atom-test': (args && args[0] !== void 0) ? args[0] : true })),

    Macro(Symbol('sel.atom.res', Arguments.Dictionary({
        0: Argument(Type.Bool, { isOptional: true, defaultValue: true, description: 'Test applied to the 1st atom of each residue.' })
    }), Struct.Types.AtomSelection, 'A selection of atom sets grouped by residue.'),
    args => B.struct.generator.atomGroups({
        'residue-test': (args && args[0] !== void 0) ? args[0] : true,
        'group-by': B.ammp('residueKey')
    })),

    Macro(Symbol('sel.atom.chains', Arguments.Dictionary({
        0: Argument(Type.Bool, { isOptional: true, defaultValue: true, description: 'Test applied to the 1st atom of each chain.' })
    }), Struct.Types.AtomSelection, 'A selection of atom sets grouped by chain.'),
    args => B.struct.generator.atomGroups({
        'chain-test': (args && args[0] !== void 0) ? args[0] : true,
        'group-by': B.ammp('chainKey')
    })),

    Macro(Symbol('atom.sec-struct.is', Arguments.List(Struct.Types.SecondaryStructureFlag), Type.Bool,
        `Test if the current atom is part of an secondary structure. Optionally specify allowed sec. struct. types: ${Type.oneOfValues(Struct.Types.SecondaryStructureFlag).join(', ')}`),
    args => B.struct.atomProperty.macromolecular.isSecondaryStructure([B.struct.type.secondaryStructureFlags(args)])),

    Macro(Symbol('bond.is', Arguments.Dictionary({
        0: Argument(Struct.Types.BondFlag, { isRest: true }),
            partial: Argument(Type.Bool, { isOptional: true, defaultValue: true, description: 'If false, all flags must be present.' }),
        }), Type.Bool,
        `Test if the current bond has at least one (or all if partial = false) of the specified flags: ${Type.oneOfValues(Struct.Types.BondFlag).join(', ')}`),
    args => B.struct.bondProperty.hasFlags({
        0: B.struct.type.bondFlags(getPositionalArgs(args)),
        ...pickArgs(args, 'partial')
    })),
];

function getPositionalArgs(args: any) {
    const ret: any[] = [];
    for (let k of Object.keys(args)) {
        if (!isNaN(k as any)) ret.push(args[k]);
    }
    return ret.length ? ret : void 0;
}

function pickArgs(args: any, ...names: string[]) {
    const ret = Object.create(null);
    let count = 0;
    for (let k of Object.keys(args)) {
        if (names.indexOf(k) >= 0) {
            ret[k] = args[k];
            count++;
        }
    }
    return count ? ret : void 0;
}

const normalized = (function () {
    const symbolList: [string, MolQLScriptSymbol][] = [];
    const symbolMap: { [id: string]: MolQLScriptSymbol | undefined } = Object.create(null);
    const namedArgs = UniqueArrayBuilder<string>();
    const constants = UniqueArrayBuilder<string>();

    for (const s of list) {
        for (const a of s.aliases) {
            symbolList.push([a, s]);
            if (symbolMap[a]) throw new Error(`Alias '${a}' already in use.`);
            symbolMap[a] = s;
        }
        const args = s.symbol.args;
        if (args.kind !== 'dictionary') {
            if (args.type.kind === 'oneof') {
                Type.oneOfValues(args.type).forEach(v => UniqueArrayBuilder.add(constants, v, v));
            }
            continue;
        }
        for (const a of Object.keys(args.map)) {
            if (isNaN(a as any)) UniqueArrayBuilder.add(namedArgs, a, a);
            const arg = ((args.map as any)[a]) as Argument;
            if (arg.type.kind === 'oneof') {
                Type.oneOfValues(arg.type).forEach(v => UniqueArrayBuilder.add(constants, v, v));
            }
        }
    }

    return { symbolList, symbolMap, namedArgs: namedArgs.array, constants: constants.array }
})();

export const Constants = normalized.constants;
export const NamedArgs = normalized.namedArgs;
export const SymbolMap = normalized.symbolMap;
export const SymbolList = normalized.symbolList;