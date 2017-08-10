/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import core from './symbols/core'
import structure from './symbols/structure'
import { normalizeTable, symbolList } from './symbols/helpers'
import Symbol from './symbol'

const table = { core, structure };

normalizeTable(table);

export const SymbolList = symbolList(table);

export const SymbolMap = (function() {
    const map: { [id: string]: Symbol | undefined } = Object.create(null);
    for (const s of SymbolList) map[s.id] = s;
    return map;
})();

export default table