/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type-system'
import Symbol, { Arguments, Argument } from '../../mini-lisp/symbol'
import { symbol } from './helpers'
import * as Primitive from './primitive'

export namespace Types {
    export const ElementSymbol = Type.Value('element-symbol', Type.Str);
    export const AtomSet = Type.Value('atom-set', Type.AnyValue);
    export const AtomSelection = Type.Value('atom-selection', Type.AnyValue);
}

const type = {
    '@header': 'Types',
    elementSymbol: symbol(Arguments.Dictionary({ 0: Argument(Type.Str) }), Types.ElementSymbol),
};

