/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Symbol from '../../molql/symbol'
import MolQL from '../../molql/symbol-table'
import { UniqueArrayBuilder } from '../../reference-implementation/utils/collections'

export type MolQLScriptSymbol =
    | { kind: 'alias', aliases: string[], symbol: Symbol }

function Alias(symbol: Symbol, ...aliases: string[]): MolQLScriptSymbol { return { kind: 'alias', aliases, symbol }; }

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

    Alias(MolQL.structure.type.elementSymbol, 'atom.new.el'),
    Alias(MolQL.structure.type.authResidueId, 'atom.new.auth-resid'),
    Alias(MolQL.structure.type.labelResidueId, 'atom.new.label-resid'),

    Alias(MolQL.structure.slot.atom, 'atom.current'),
    Alias(MolQL.structure.slot.atomSetReduce, 'atom.set.reduce.value'),

    Alias(MolQL.structure.generator.atomGroups, 'atom.sel.atom-groups'),
    Alias(MolQL.structure.generator.queryInSelection, 'atom.sel.query-in-selection'),
    Alias(MolQL.structure.generator.empty, 'atom.sel.empty'),

    Alias(MolQL.structure.modifier.queryEach, 'atom.sel.query-each'),
    Alias(MolQL.structure.modifier.intersectBy, 'atom.sel.intersect-by'),
    Alias(MolQL.structure.modifier.exceptBy, 'atom.sel.except-by'),
    Alias(MolQL.structure.modifier.unionBy, 'atom.sel.union-by'),
    Alias(MolQL.structure.modifier.union, 'atom.sel.union'),
    Alias(MolQL.structure.modifier.cluster, 'atom.sel.cluster'),
    Alias(MolQL.structure.modifier.includeSurroundings, 'atom.sel.include-surroundings'),
    Alias(MolQL.structure.modifier.includeConnected, 'atom.sel.include-connected'),
    Alias(MolQL.structure.modifier.expandProperty, 'atom.sel.expand-property'),

    Alias(MolQL.structure.filter.pick, 'atom.sel.pick'),
    Alias(MolQL.structure.filter.withSameAtomProperties, 'atom.sel.with-same-atom-properties'),
    Alias(MolQL.structure.filter.within, 'atom.sel.within'),
    Alias(MolQL.structure.filter.isConnectedTo, 'atom.sel.is-connected-to'),

    Alias(MolQL.structure.combinator.intersect, 'atom.sel.intersect'),
    Alias(MolQL.structure.combinator.merge, 'atom.sel.merge'),
    Alias(MolQL.structure.combinator.distanceCluster, 'atom.sel.dist-cluster'),

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

    Alias(MolQL.structure.type.bondFlags, 'bond.flags'),
    Alias(MolQL.structure.bondProperty.order, 'bond.order'),
    Alias(MolQL.structure.bondProperty.hasFlags, 'bond.has-flags')
];

export const Constants = [
    // bond types
    'covalent',
    'metallic',
    'ion',
    'hydrogen',
    'unknown'
];

const normalized = (function () {
    const symbolList: [string, MolQLScriptSymbol][] = [];
    const symbolMap: { [id: string]: MolQLScriptSymbol | undefined } = Object.create(null);
    const namedArgs = UniqueArrayBuilder<string>();

    for (const s of list) {
        for (const a of s.aliases) {
            symbolList.push([a, s]);
            if (symbolMap[a]) throw new Error(`Alias '${a}' already in use.`);
            symbolMap[a] = s;
        }
        const args = s.symbol.args;
        if (args.kind !== 'dictionary') continue;
        for (const a of Object.keys(args.map)) {
            if (isNaN(a as any)) UniqueArrayBuilder.add(namedArgs, a, a);
        }
    }

    return { symbolList, symbolMap, namedArgs: namedArgs.array }
})();

export const NamedArgs = normalized.namedArgs;
export const SymbolMap = normalized.symbolMap;
export const SymbolList = normalized.symbolList;