/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import primitive from './symbols/primitive'
import { normalizeTable, symbolList } from './symbols/helpers'

const table = { primitive };

normalizeTable(table);

export const SymbolList = symbolList(table);

export default table