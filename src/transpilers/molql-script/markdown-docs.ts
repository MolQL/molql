/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { formatSymbol } from '../../reference-implementation/molql/markdown-docs'
import { isMolQLScriptSymbol, SymbolTable  } from './symbols'

const docs: string[] = [
    'MolQL Script',
    '============',
    '--------------------------------',
    ''
];

function makeDocs(xs: any[]) {
    for (const x of xs) {
        if (isMolQLScriptSymbol(x)) {
            const s = formatSymbol(x.symbol, x.aliases);
            docs.push(`\`\`\`\n${s}\n\`\`\`\n`);
            if (x.symbol.info.description) {
                docs.push(`*${x.symbol.info.description}*\n`);
            }
        } else if (x instanceof Array) {
            makeDocs(x);
        } else if (typeof x === 'string') {
            docs.push(`## ${x}\n\n`);
            docs.push('--------------------------------\n');
        }
    }
}

makeDocs(SymbolTable);

export default docs.join('\n');