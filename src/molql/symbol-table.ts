/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import core from './symbol-table/core'
import structure from './symbol-table/structure'
import { normalizeTable, symbolList } from './helpers'
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