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
        2: Argument(Type.Str, { description: 'pdbx_PDB_ins_code' })
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
        'chain-test': Argument(Type.Bool, { isOptional: true, defaultValue: true  }),
        'residue-test': Argument(Type.Bool, { isOptional: true, defaultValue: true  }),
        'atom-test': Argument(Type.Bool, { isOptional: true, defaultValue: true  }),
        'group-by': Argument(Type.Any, { isOptional: true, defaultValue: 'atom-key' }),
    }), Types.AtomSelection)
}

const modifier = {

}

const filter = {

}

const combinator = {

}

const atomSet = {

}

const atomProperty = {
    '@header': 'Atom Properties',
    'type_symbol': prop(Types.ElementSymbol, 'Same as mmCIF'),
    'auth_atom_id': prop(Type.Str, 'Same as mmCIF'),
    'auth_comp_id': prop(Type.Str, 'Same as mmCIF'),
    'auth_asym_id': prop(Type.Str, 'Same as mmCIF'),
    'auth_seq_id': prop(Type.Num, 'Same as mmCIF'),

    'atom-key': prop(Type.Str, 'Unique value for each atom.'),
    'residue-key': prop(Type.Str, 'Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``.'),
    'chain-key': prop(Type.Str, 'Unique value for each tuple ``(label_entity_id,auth_asym_id)``.'),
    'entity-key': prop(Type.Str, 'Unique value for each tuple ``label_entity_id``.')
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