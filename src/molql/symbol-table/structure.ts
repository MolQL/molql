/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Type from '../type'
import * as Core from './core'
import { Arguments, Argument } from '../symbol'
import { symbol } from '../helpers'

export namespace Types {
    export const ElementSymbol = Type.Value('Structure', 'ElementSymbol');
    export const ResidueId = Type.Value('Structure', 'ResidueId');
    export const AtomSet = Type.Value('Structure', 'AtomSet');
    export const AtomSelection = Type.Value('Structure', 'AtomSelection');

    export const AtomSelectionQuery = Core.Types.Fn(AtomSelection, 'AtomSelectionQuery');
}

const type = {
    '@header': 'Types',
    elementSymbol: symbol(Arguments.Dictionary({ 0: Argument(Type.Str) }), Types.ElementSymbol, 'Create element symbol representation from a string value.'),
    authResidueId: symbol(Arguments.Dictionary({
        0: Argument(Type.Str, { description: 'auth_asym_id' }),
        1: Argument(Type.Num, { description: 'auth_seq_id' }),
        2: Argument(Type.Str, { description: 'pdbx_PDB_ins_code', isOptional: true })
    }), Types.ResidueId, `Residue identifier based on "auth_" annotation.`),
    labelResidueId: symbol(Arguments.Dictionary({
        0: Argument(Type.Str, { description: 'label_entity_id' }),
        1: Argument(Type.Str, { description: 'label_asym_id' }),
        2: Argument(Type.Num, { description: 'label_seq_id' }),
        3: Argument(Type.Str, { description: 'pdbx_PDB_ins_code', isOptional: true })
    }), Types.ResidueId, `Residue identifier based on mmCIF's "label_" annotation.`)
};

const generator = {
    '@header': 'Generators',
    atomGroups: symbol(Arguments.Dictionary({
        'entity-test': Argument(Type.Bool, { isOptional: true, defaultValue: true, description: 'Test for the 1st atom of every entity' }),
        'chain-test': Argument(Type.Bool, { isOptional: true, defaultValue: true, description: 'Test for the 1st atom of every chain'  }),
        'residue-test': Argument(Type.Bool, { isOptional: true, defaultValue: true, description: 'Test for the 1st atom every residue'  }),
        'atom-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'group-by': Argument(Type.Any, { isOptional: true, defaultValue: `atom-key`, description: 'Group atoms to sets based on this property. Default: each atom has its own set' }),
    }), Types.AtomSelectionQuery, 'Return all atoms for which the tests are satisfied, grouped into sets.'),

    queryInSelection: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        query: Argument(Types.AtomSelectionQuery),
        'in-complement': Argument(Type.Bool, { isOptional: true, defaultValue: false })
    }), Types.AtomSelectionQuery, 'Executes query only on atoms that are in the source selection.')
}

const modifier = {
    '@header': 'Selection Modifications',

    queryEach: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        query: Argument(Types.AtomSelectionQuery)
    }), Types.AtomSelectionQuery, 'Query every atom set in the input selection separately.'),

    intersectBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        by: Argument(Types.AtomSelectionQuery)
    }), Types.AtomSelectionQuery, 'Intersect each atom set from the first sequence from atoms in the second one.'),

    exceptBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        by: Argument(Types.AtomSelectionQuery)
    }), Types.AtomSelectionQuery, `Remove all atoms from 'selection' that occur in 'by'.`),

    unionBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        by: Argument(Types.AtomSelectionQuery)
    }), Types.AtomSelectionQuery, 'For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.'),

    union: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery)
    }), Types.AtomSelectionQuery, 'Collects all atom sets in the sequence into a single atom set.'),

    cluster: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        'min-distance': Argument(Type.Num, { isOptional: true, defaultValue: 0 }),
        'max-distance': Argument(Type.Num),
        'min-size': Argument(Type.Num, { description: 'Minimal number of sets to merge, must be at least 2', isOptional: true, defaultValue: 2 }),
        'max-size': Argument(Type.Num, { description: 'Maximal number of sets to merge, if not set, no limit', isOptional: true }),
    }), Types.AtomSelectionQuery, 'Combines atom sets that have mutual distance in the interval [min-radius, max-radius]. Minimum/maximum size determines how many atom sets can be combined.'),

    includeSurroundings: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        radius: Argument(Type.Num),
        'as-whole-residues': Argument(Type.Bool, { isOptional: true })
    }), Types.AtomSelectionQuery, 'For each atom set in the selection, include all surrouding atoms/residues that are within the specified radius.')
}

const filter = {
    '@header': 'Selection Filters',
    pick: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        test: Argument(Type.Bool)
    }), Types.AtomSelectionQuery, 'Pick all atom sets that satisfy the test.'),

    withSameAtomProperties: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        source: Argument(Types.AtomSelectionQuery),
        property: Argument(Type.Any)
    }), Types.AtomSelectionQuery, 'Pick all atom sets for which the set of given atom properties is a subset of the source properties.'),

    within: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelectionQuery),
        target: Argument(Types.AtomSelectionQuery),
        radius: Argument(Type.Num)
    }), Types.AtomSelectionQuery, 'Pick all atom sets from section that are within the radius of any atom from target.')
}

const combinator = {
    '@header': 'Selection Combinators',
    intersect: symbol(Arguments.List(Types.AtomSelectionQuery), Types.AtomSelectionQuery, 'Return all unique atom sets that appear in all of the source selections.'),
    merge: symbol(Arguments.List(Types.AtomSelectionQuery), Types.AtomSelectionQuery, 'Merges multiple selections into a single one. Only unique atom sets are kept.'),
    distanceCluster: symbol(Arguments.Dictionary({
        matrix: Argument(Core.Types.List(Core.Types.List(Type.Num)), { description: 'Distance matrix, represented as list of rows (num[][])). Lower triangle is min distance, upper triange is max distance.' }),
        selections: Argument(Core.Types.List(Types.AtomSelectionQuery), { description: 'A list of held selections.' })
    }), Types.AtomSelectionQuery, 'Pick combinations of atom sets from the source sequences that are mutually within distances specified by a matrix.')
}

const atomSet = {
    '@header': 'Atom Sets',

    atomCount: symbol(Arguments.None, Type.Num),

    countQuery: symbol(Arguments.Dictionary({
        query: Argument(Types.AtomSelectionQuery)
    }), Type.Num, 'Counts the number of occurences of a specific query inside the current atom set.'),

    reduce: {
        '@header': 'Atom Set Reducer',
        accumulator: symbol(Arguments.Dictionary({
            initial: Argument(Type.Variable('a', Type.AnyValue, true), { description: 'Initial value. Current atom is set to the 1st atom of the current set for this.' }),
            value: Argument(Type.Variable('a', Type.AnyValue, true), { description: 'Expression executed for each atom in the set' })
        }), Type.Variable('a', Type.AnyValue, true), 'Execute the value expression for each atom in the current atom set and return the result.'),
        value: prop(Type.Variable('a', Type.AnyValue, true), 'Current value of atom set accumulator.'),
    }
}

const atomProperty = {
    '@header': 'Atom Properties',

    core: {
        '@header': 'Core Properties',

        elementSymbol: prop(Types.ElementSymbol),

        x: prop(Type.Num, 'Cartesian X coordinate'),
        y: prop(Type.Num, 'Cartesian Y coordinate'),
        z: prop(Type.Num, 'Cartesian Z coordinate'),

        atomKey: prop(Type.Any, 'Unique value for each atom. Main use case is grouping of atoms.')
    },

    macromolecular: {
        '@header': 'Macromolecular Properties (derived from the mmCIF format)',

        authResidueId: prop(Types.ResidueId, `type.auth-residue-id symbol executed on current atom's residue`),
        labelResidueId: prop(Types.ResidueId, `type.label-residue-id symbol executed on current atom's residue`),

        residueKey: prop(Type.Any, 'Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``, main use case is grouping of atoms'),
        chainKey: prop(Type.Any, 'Unique value for each tuple ``(label_entity_id,auth_asym_id)``, main use case is grouping of atoms'),
        entityKey: prop(Type.Any, 'Unique value for each tuple ``label_entity_id``, main use case is grouping of atoms'),

        isHet: prop(Type.Bool, 'Equivalent to atom_site.group_PDB !== ATOM'),

        id: prop(Type.Num, '_atom_site.id'),

        label_atom_id: prop(Type.Str),
        label_alt_id: prop(Type.Str),
        label_comp_id: prop(Type.Str),
        label_asym_id: prop(Type.Str),
        label_entity_id: prop(Type.Str),
        label_seq_id: prop(Type.Num),

        auth_atom_id: prop(Type.Str),
        auth_comp_id: prop(Type.Str),
        auth_asym_id: prop(Type.Str),
        auth_seq_id: prop(Type.Num),

        pdbx_PDB_ins_code: prop(Type.Str),
        pdbx_formal_charge: prop(Type.Num),

        occupancy: prop(Type.Num),
        B_iso_or_equiv: prop(Type.Num),

        entityType: prop(Type.Str, 'Type of the entity as defined in mmCIF (polymer, non-polymer, water)'),
    }
}

function prop(type: Type, description?: string) {
    return symbol(Arguments.None, type, description);
}

export default {
    '@header': 'Structure Queries',
    type,
    generator,
    modifier,
    filter,
    combinator,
    atomSet,
    atomProperty
}