/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Symbol from '../../../mini-lisp/symbol'
import MolQL from '../../../molql/symbols'
import { UniqueArrayBuilder } from '../../utils/collections'

export type MolQLLispSymbol =
    | { kind: 'alias', aliases: string[], symbol: Symbol }

function Alias(symbol: Symbol, ...aliases: string[]): MolQLLispSymbol { return { kind: 'alias', aliases, symbol }; }

const list: MolQLLispSymbol[] = [
    Alias(MolQL.core.type.bool, 'bool'),
    Alias(MolQL.core.type.num, 'num'),
    Alias(MolQL.core.type.str, 'str'),
    Alias(MolQL.core.type.regex, 'regex'),
    Alias(MolQL.core.type.list, 'list'),
    Alias(MolQL.core.type.set, 'set'),
    Alias(MolQL.core.type.map, 'map'),
    Alias(MolQL.core.logic.not, 'not'),
    Alias(MolQL.core.logic.and, 'and'),
    Alias(MolQL.core.logic.or, 'or'),
    Alias(MolQL.core.ctrl.if, 'if'),
    Alias(MolQL.core.ctrl.lazy, 'lazy'),
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
    Alias(MolQL.core.str.match, 'regex-match'),
    Alias(MolQL.core.list.getAt, 'get-at'),
    Alias(MolQL.core.set.has, 'set-has'),
    Alias(MolQL.core.map.has, 'map-has'),
    Alias(MolQL.core.map.get, 'map-get'),

    Alias(MolQL.structure.type.elementSymbol, 'struct.create-es'),
    Alias(MolQL.structure.type.authResidueId, 'struct.auth-resid'),
    Alias(MolQL.structure.type.labelResidueId, 'struct.label-resid'),
    Alias(MolQL.structure.generator.atomGroups, 'struct.atom-groups'),
    Alias(MolQL.structure.generator.queryInSelection, 'struct.query-in-selection'),
    Alias(MolQL.structure.modifier.queryEach, 'struct.query-each'),
    Alias(MolQL.structure.modifier.intersectBy, 'struct.intersect-by'),
    Alias(MolQL.structure.modifier.exceptBy, 'struct.except-by'),
    Alias(MolQL.structure.modifier.unionBy, 'struct.union-by'),
    Alias(MolQL.structure.modifier.union, 'struct.union'),
    Alias(MolQL.structure.modifier.cluster, 'struct.cluster'),
    Alias(MolQL.structure.modifier.includeSurroundings, 'struct.include-surroundings'),
    Alias(MolQL.structure.filter.pick, 'struct.pick'),
    Alias(MolQL.structure.filter.withSameProperties, 'struct.with-same-properties'),
    Alias(MolQL.structure.filter.within, 'struct.within'),
    Alias(MolQL.structure.combinator.intersect, 'struct.intersect'),
    Alias(MolQL.structure.combinator.merge, 'struct.merge'),
    Alias(MolQL.structure.combinator.distanceCluster, 'struct.dist-cluster'),

    Alias(MolQL.structure.atomSet.atomCount, 'atom-set.atom-count'),
    Alias(MolQL.structure.atomSet.countQuery, 'atom-set.count-query'),
    Alias(MolQL.structure.atomSet.reduce.accumulator, 'atom-set.reduce'),
    Alias(MolQL.structure.atomSet.reduce.value, 'atom-set.reduce.value'),

    Alias(MolQL.structure.atomProperty.core.elementSymbol, 'atom.es'),
    Alias(MolQL.structure.atomProperty.core.x, 'atom.x'),
    Alias(MolQL.structure.atomProperty.core.y, 'atom.y'),
    Alias(MolQL.structure.atomProperty.core.z, 'atom.z'),
    Alias(MolQL.structure.atomProperty.core.atomKey, 'atom.key'),
    Alias(MolQL.structure.atomProperty.macromolecular.authResidueId, 'atom.auth-residue-id'),
    Alias(MolQL.structure.atomProperty.macromolecular.labelResidueId, 'atom.label-residue-id'),
    Alias(MolQL.structure.atomProperty.macromolecular.residueKey, 'atom.residue-key'),
    Alias(MolQL.structure.atomProperty.macromolecular.chainKey, 'atom.chain-key'),
    Alias(MolQL.structure.atomProperty.macromolecular.entityKey, 'atom.entity-key'),
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
];

const normalized = (function () {
    const symbolList: [string, MolQLLispSymbol][] = [];
    const symbolMap: { [id: string]: MolQLLispSymbol | undefined } = Object.create(null);
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