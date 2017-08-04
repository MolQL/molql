/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import core from './symbols/core'
import structure from './symbols/structure'
import { normalizeTable, symbolList } from './symbols/helpers'

const table = { core, structure };

normalizeTable(table);

export const SymbolList = symbolList(table);

export default table