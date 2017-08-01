/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type-system'
import Symbol, { Arguments } from '../../mini-lisp/symbol'
import { symbol } from './helpers'
import * as Primitive from './primitive'

import Arg = Arguments.Argument

export namespace Types {
    export const ElementSymbol = Type.Value('element-symbol', Type.Str);
    export const AtomSet = Type.Value('atom-set', Type.AnyValue);
    export const AtomSelection = Type.Value('atom-selection', Type.AnyValue);
}

const type = {
    '@header': 'Tyoes',
    elementSymbol: symbol<{ 0: string }, string>(Types.ElementSymbol, { arguments: Arguments.Dictionary({ 0: Arg(Type.Str) }) }),
};

