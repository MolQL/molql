/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type'
import Symbol, { Arguments, Argument } from '../../mini-lisp/symbol'
import { symbol } from './helpers'
import * as Primitive from './primitive'

export namespace Types {
    export const ElementSymbol = Type('element-symbol', Type.Any);
    export const ResidueId = Type('residue-id', Type.Any);
    export const AtomSet = Type('atom-set', Type.Any);
    export const AtomSelection = Type('atom-selection', Type.Any);
}

const type = {
    '@header': 'Types',
    elementSymbol: symbol(Arguments.Dictionary({ 0: Argument(Type.Str) }), Types.ElementSymbol),
    authResidueId: symbol(Arguments.Dictionary({
        0: Argument(Type.Str, { description: 'auth_asym_id' }),
        1: Argument(Type.Num, { description: 'auth_seq_id' }),
        2: Argument(Type.Str, { description: 'pdbx_PDB_ins_code', isOptional: true })
    }), Types.ElementSymbol),
    labelResidueId: symbol(Arguments.Dictionary({
        0: Argument(Type.Str, { description: 'label_entity_id' }),
        1: Argument(Type.Str, { description: 'label_asym_id' }),
        2: Argument(Type.Num, { description: 'label_auth_seq_id' }),
        3: Argument(Type.Str, { description: 'pdbx_PDB_ins_code' })
    }), Types.ElementSymbol),
};

const generator = {
    '@header': 'Generators',
    atomGroups: symbol(Arguments.Dictionary({
        'entity-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'chain-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'residue-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'atom-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'group-by': Argument(Type.Any, { isOptional: true, defaultValue: '`atom-key` symbol' }),
    }), Types.AtomSelection)
}

const modifier = {
    '@header': 'Selection Modifications',
    includeSurroundings: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        radius: Argument(Type.Num),
        'whole-residues': Argument(Type.Bool, { isOptional: true })
    }), Types.AtomSelection),

    queryEach: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        query: Argument(Types.AtomSelection),
        'whole-residues': Argument(Type.Bool, { isOptional: true })
    }), Types.AtomSelection),

    queryComplement: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        query: Argument(Types.AtomSelection)
    }), Types.AtomSelection, 'Execute the query in a complement induced by the selection.'),

    intersectBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        by: Argument(Type.Num),
        'whole-residues': Argument(Type.Bool, { isOptional: true })
    }), Types.AtomSelection, 'Intersect each atom set from the first sequence from atoms in the second one.'),

    unionBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        by: Argument(Type.Num),
        'whole-residues': Argument(Type.Bool, { isOptional: true })
    }), Types.AtomSelection, 'For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.'),

    exceptBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        by: Argument(Type.Num)
    }), Types.AtomSelection, `Remove all atoms from 'selection' that occur in 'by'.`),

    union: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection)
    }), Types.AtomSelection, 'Collects all atom sets in the sequence into a single atom set.'),

    cluster: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        radius: Argument(Type.Num)
    }), Types.AtomSelection, 'Combines are atom sets that are mutatually not further radius apart.'),
}

const filter = {
    '@header': 'Selection Filters',
    withSameProperties: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        source: Argument(Types.AtomSelection),
        property: Argument(Type.Any)
    }), Types.AtomSelection),

    within: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        target: Argument(Types.AtomSelection),
        radius: Argument(Type.Num)
    }), Types.AtomSelection, 'All atom sets from section that are within the radius of any atom from target'),

    pick: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        test: Argument(Type.Bool)
    }), Types.AtomSelection, 'Pick all atom sets that satisfy the test.'),
}

const combinator = {
    '@header': 'Selection Combinators',
    intersect: symbol(Arguments.List(Types.AtomSelection), Types.AtomSelection, 'Return all unique atom sets that appear in all of the source selections.'),
    merge: symbol(Arguments.List(Types.AtomSelection), Types.AtomSelection, 'Merges multiple selections into a single one. Only unique atom sets are kept.'),
    near: symbol(Arguments.Dictionary({
        0: Argument(Type.Num, { description: 'radius' }),
        1: Argument(Types.AtomSelection, { isRest: true })
    }), Types.AtomSelection, 'Pick combinations of atom sets from the source sequences that are mutually no more than radius apart.')
}

const atomSet = {
    '@header': 'Atom Sets',
    '@namespace': Types.AtomSet.name,

    atomCount: symbol(Arguments.None, Type.Num),

    count: symbol(Arguments.Dictionary({
        query: Argument(Types.AtomSelection)
    }), Type.Num, 'Counts the number of occurences of a specific query inside the current atom set.'),

    reduce: {
        '@header': 'Atom Set Reducer',
        accumulator: symbol(Arguments.Dictionary({
            0: Argument(Type.Any, { description: 'Initial value.' }),
            1: Argument(Type.Any, { description: 'Atom expression executed for each atom in the set.' })
        }), Type.Any),
        value: prop(Type.Any, 'Current value of the reducer.'),
    }
}

const atomProperty = {
    '@header': 'Atom Properties',

    // ================= mmCIF =================
    group_PDB: prop(Type.Str, 'Same as mmCIF'),
    id: prop(Type.Num, 'Same as mmCIF'),

    type_symbol: prop(Types.ElementSymbol, 'Same as mmCIF'),

    label_atom_id: prop(Type.Str, 'Same as mmCIF'),
    label_alt_id: prop(Type.Str, 'Same as mmCIF'),
    label_comp_id: prop(Type.Str, 'Same as mmCIF'),
    label_asym_id: prop(Type.Str, 'Same as mmCIF'),
    label_entity_id: prop(Type.Str, 'Same as mmCIF'),
    label_seq_id: prop(Type.Num, 'Same as mmCIF'),

    pdbx_PDB_ins_code: prop(Type.Str, 'Same as mmCIF'),
    pdbx_formal_charge: prop(Type.Str, 'Same as mmCIF'),

    Cartn_x: prop(Type.Num, 'Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.'),
    Cartn_y: prop(Type.Num, 'Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.'),
    Cartn_z: prop(Type.Num, 'Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.'),

    occupancy: prop(Type.Num, 'Same as mmCIF'),
    B_iso_or_equiv: prop(Type.Num, 'Same as mmCIF'),

    auth_atom_id: prop(Type.Str, 'Same as mmCIF'),
    auth_comp_id: prop(Type.Str, 'Same as mmCIF'),
    auth_asym_id: prop(Type.Str, 'Same as mmCIF'),
    auth_seq_id: prop(Type.Num, 'Same as mmCIF'),

    pdbx_PDB_model_num: prop(Type.Num, 'Same as mmCIF'),

    // ================= KEYS =================
    atomKey: prop(Type.Any, 'Unique value for each atom. Main use case is grouping of atoms.'),
    residueKey: prop(Type.Any, 'Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``. Main use case is grouping of atoms.'),
    chainKey: prop(Type.Any, 'Unique value for each tuple ``(label_entity_id,auth_asym_id)``. Main use case is grouping of atoms.'),
    entityKey: prop(Type.Any, 'Unique value for each tuple ``label_entity_id``. Main use case is grouping of atoms.'),

    residueId: prop(Types.ResidueId, 'Corresponds to tuple (auth_asym_id, auth_seq_id, pdbx_PDB_ins_code)'),
    labelResidueId: prop(Types.ResidueId, 'Corresponds to tuple (label_entity_id, label_asym_id, label_seq_id, pdbx_PDB_ins_code)'),

    // ================= Other =================
    isHet: prop(Type.Num, 'For mmCIF files, Same as group_PDB !== ATOM'),
}

function prop(type: Type, description?: string) {
    return symbol(Arguments.None, type, description);
}

export default {
    type,
    generator,
    modifier,
    filter,
    combinator,
    atomSet,
    atomProperty
}