/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type-system'
import Symbol, { Arguments } from '../../mini-lisp/symbol'

export interface SymbolDefinition {
    name?: string,
    description?: string,
    arguments?: Arguments
}

export default function symbol(type: Type, definition: SymbolDefinition = { }) {
    return Symbol('', definition.name || '', type, definition.arguments || Arguments.None, definition.description);
}