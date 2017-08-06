/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type'
import { Arguments, Argument } from '../../mini-lisp/symbol'
import { symbol } from './helpers'

export namespace Types {
    export const ElementSymbol = Type('Structure', 'ElementSymbol', Type.Any);
    export const ResidueId = Type('Structure', 'ResidueId', Type.Any);
    export const AtomSet = Type('Structure', 'AtomSet', Type.Any);
    export const AtomSelection = Type('Structure', 'AtomSelection', Type.Any);
}

const type = {
    '@header': 'Types',
    elementSymbol: symbol(Arguments.Dictionary({ 0: Argument(Type.Str) }), Types.ElementSymbol),
    authResidueId: symbol(Arguments.Dictionary({
        0: Argument(Type.Str, { description: 'auth_asym_id' }),
        1: Argument(Type.Num, { description: 'auth_seq_id' }),
        2: Argument(Type.Str, { description: 'pdbx_PDB_ins_code', isOptional: true })
    }), Types.ResidueId, `Residue identifier based on "author" annotation.`),
    labelResidueId: symbol(Arguments.Dictionary({
        0: Argument(Type.Str, { description: 'label_entity_id' }),
        1: Argument(Type.Str, { description: 'label_asym_id' }),
        2: Argument(Type.Num, { description: 'label_auth_seq_id' }),
        3: Argument(Type.Str, { description: 'pdbx_PDB_ins_code' })
    }), Types.ResidueId, `Residue identifier based on mmCIF's "label_" annotation.`)
};

const generator = {
    '@header': 'Generators',
    atomGroups: symbol(Arguments.Dictionary({
        'entity-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'chain-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'residue-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'atom-test': Argument(Type.Bool, { isOptional: true, defaultValue: true }),
        'group-by': Argument(Type.Any, { isOptional: true, defaultValue: `atom-key` }),
    }), Types.AtomSelection),

    querySelection: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        query: Argument(Types.AtomSelection),
        'in-complement': Argument(Type.Bool, { isOptional: true, defaultValue: false })
    }), Types.AtomSelection, 'Executes query only on atoms that are in the source selection.')
}

const modifier = {
    '@header': 'Selection Modifications',

    queryEach: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        query: Argument(Types.AtomSelection)
    }), Types.AtomSelection),

    intersectBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        by: Argument(Types.AtomSelection)
    }), Types.AtomSelection, 'Intersect each atom set from the first sequence from atoms in the second one.'),

    exceptBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        by: Argument(Types.AtomSelection)
    }), Types.AtomSelection, `Remove all atoms from 'selection' that occur in 'by'.`),

    unionBy: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        by: Argument(Types.AtomSelection)
    }), Types.AtomSelection, 'For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.'),

    union: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection)
    }), Types.AtomSelection, 'Collects all atom sets in the sequence into a single atom set.'),

    cluster: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        'min-distance': Argument(Type.Num, { isOptional: true, defaultValue: 0 }),
        'max-distance': Argument(Type.Num),
        'min-size': Argument(Type.Num, { description: 'Minimal number of sets to merge, must be at least 2', isOptional: true, defaultValue: 2 }),
        'max-size': Argument(Type.Num, { description: 'Maximal number of sets to merge, if not set, no limit', isOptional: true }),
    }), Types.AtomSelection, 'Combines atom sets that have mutual distance in the interval [min-radius, max-radius]. Minimum/maximum size determines how many atom sets can be combined.'),

    includeSurroundings: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        radius: Argument(Type.Num),
        'as-whole-residues': Argument(Type.Bool, { isOptional: true })
    }), Types.AtomSelection)
}

const filter = {
    '@header': 'Selection Filters',
    pick: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        test: Argument(Type.Bool)
    }), Types.AtomSelection, 'Pick all atom sets that satisfy the test'),

    withSameProperties: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        source: Argument(Types.AtomSelection),
        property: Argument(Type.Any)
    }), Types.AtomSelection),

    within: symbol(Arguments.Dictionary({
        selection: Argument(Types.AtomSelection),
        target: Argument(Types.AtomSelection),
        radius: Argument(Type.Num)
    }), Types.AtomSelection, 'All atom sets from section that are within the radius of any atom from target')
}

const combinator = {
    '@header': 'Selection Combinators',
    intersect: symbol(Arguments.List(Types.AtomSelection), Types.AtomSelection, 'Return all unique atom sets that appear in all of the source selections.'),
    merge: symbol(Arguments.List(Types.AtomSelection), Types.AtomSelection, 'Merges multiple selections into a single one. Only unique atom sets are kept.'),
    // near: symbol(Arguments.Dictionary({
    //     0: Argument(Type.Num, { description: 'radius' }),
    //     1: Argument(Types.AtomSelection, { isRest: true })
    // }), Types.AtomSelection, 'Pick combinations of atom sets from the source sequences that are mutually no more than radius apart.')
}

const atomSet = {
    '@header': 'Atom Sets',

    atomCount: symbol(Arguments.None, Type.Num),

    countQuery: symbol(Arguments.Dictionary({
        query: Argument(Types.AtomSelection)
    }), Type.Num, 'Counts the number of occurences of a specific query inside the current atom set.'),

    reduce: {
        '@header': 'Atom Set Reducer',
        accumulator: symbol(Arguments.Dictionary({
            initial: Argument(Type.Any, { description: 'Initial value. Current atom is set to the 1st atom of the current set for this.' }),
            value: Argument(Type.Any, { description: 'Expression executed for each atom in the set' })
        }), Type.Any),
        value: prop(Type.Any, 'Current value of the reducer.'),
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

        authResidueId: prop(Types.ResidueId, `type.authResidueId symbol executed on current atom's residue`),
        labelResidueId: prop(Types.ResidueId, `type.labelResidueId symbol executed on current atom's residue`),

        residueKey: prop(Type.Any, 'Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``, main use case is grouping of atoms'),
        chainKey: prop(Type.Any, 'Unique value for each tuple ``(label_entity_id,auth_asym_id)``, main use case is grouping of atoms'),
        entityKey: prop(Type.Any, 'Unique value for each tuple ``label_entity_id``, main use case is grouping of atoms'),

        isHet: prop(Type.Num, 'Equivalent to atom_site.group_PDB !== ATOM'),

        id: prop(Type.Num),

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