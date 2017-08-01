/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type'
import Symbol, { Arguments, Argument } from '../../mini-lisp/symbol'
import { symbol } from './helpers'
import * as Primitive from './primitive'

export namespace Types {
    export const ElementSymbol = Type('element-symbol', Type.AnyValue);
    export const ResidueId = Type('residue-id', Type.AnyValue);
    export const AtomSet = Type('atom-set', Type.AnyValue);
    export const AtomSelection = Type('atom-selection', Type.AnyValue);
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

const atomProperty ={

}

const generator = {

}

const modifier = {

}

const filter = {

}

const combinator = {

}

const atomSet = {

}

export default {
    type,
    atomProperty,
    generator,
    modifier,
    filter,
    combinator,
    atomSet
}