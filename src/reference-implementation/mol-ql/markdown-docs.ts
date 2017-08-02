/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import MolQL from '../../mol-ql/symbols'
import Symbol, { isSymbol, Arguments, Argument } from '../../mini-lisp/symbol'
//import Type from '../../language/type-system'

/**
 * Generates markdown documentation from the language spec.
 */

const ToC: string[] = [`
Language Reference
==================

`];
const implemented: string[] = []

const notImplemented: string[] = [`
Not yet implemented
===================
`
]

function formatArgs(args: Arguments) {
    if (args.kind === 'list') {
        return `${args.type.name}*`;
    }
    const map = args.map;
    const keys = Object.keys(map);
    const formatted: string[] = [];

    for (const key of keys) {
        const arg = (map as any)[key] as Argument<any>;
        if (!isNaN(key as any)) {
            formatted.push(`${arg.type.name}${arg.isRest ? '*' : ''}`);
        } else {
            formatted.push(`${key}${arg.isOptional ? '?:' : ':'} ${arg.type.name}${arg.isRest ? '*' : ''}`);
        }
    }
    return formatted.join(', ');
}

function formatSymbol(symbol: Symbol, lines: string[]) {
    const header = `${symbol.id} :: (${formatArgs(symbol.arguments)}) => ${symbol.type.name}`
    lines.push(`### **${symbol.name}**&nbsp;&nbsp;&nbsp;\`\`${header}\`\`\n`);
    if (symbol.description) {
        lines.push(`*${symbol.description}*\n`);
    }
    lines.push(`-------------------\n`);
}

function format(depth: number, obj: any) {
    if (isSymbol(obj)) {
        formatSymbol(obj, implemented);
        return;
    }
    if (obj['@header']) {
        implemented.push(`${depth >= 2 ? '##' : '#'} ${obj['@header']}\n`);
        const tocLink = obj['@header'].toLowerCase().replace(/\s/g, '-');
        ToC.push(`${new Array(depth + 1).join('  ')} * [${obj['@header']}](#${tocLink})`);
    }
    for (const childKey of Object.keys(obj)) {
        if (typeof obj[childKey] !== 'object') continue;
        format(depth + 1, obj[childKey]);
    }
}
format(0, MolQL);
console.log(ToC.join('\n'));
console.log(implemented.join('\n'));
//console.log(notImplemented.join('\n'));