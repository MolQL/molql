/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import MolQL from '../../molql/symbol-table'
import Type from '../../molql/type'
import Symbol, { isSymbol, Arguments, Argument } from '../../molql/symbol'
import typeFormatter from './type/formatter'

/**
 * Generates markdown documentation from the language spec.
 */

function formatArgs(args: Arguments) {
    if (args.kind === 'list') {
        return `${typeFormatter(args.type)}${args.nonEmpty ? '+' : '*'}`;
    }
    const map = args.map;
    const keys = Object.keys(map);

    if (!keys.length) return '()'

    const formatted: string[] = [];
    let isArgArray = true, argIndex = 0;
    for (const key of keys) {
        if (isNaN(key as any) || +key !== argIndex) {
            isArgArray = false;
            break;
        }
        argIndex++;
    }

    const isInline = isArgArray && keys.every(k => !((map as any)[k] as Argument<Type>).description);
    formatted.push(isArgArray ? '(' : '{');
    formatted.push(isInline ? '' : '\n');

    argIndex = 0;
    for (const key of keys) {
        const arg = (map as any)[key] as Argument<Type>;
        if (!isInline) formatted.push('  ');
        if (!isNaN(key as any)) {
            formatted.push(`${arg.isOptional ? '?' : ''}${typeFormatter(arg.type)}${arg.isRest ? '*' : ''}`);
        } else {
            formatted.push(`${key}${arg.isOptional ? '?:' : ':'} ${typeFormatter(arg.type)}${arg.isRest ? '*' : ''}`);
        }
        if (arg.defaultValue !== void 0) formatted.push(` = ${arg.defaultValue}`);
        if (argIndex < keys.length - 1) formatted.push(', ')
        if (arg.description !== void 0) formatted.push(`${argIndex === keys.length - 1 ? ' ' : ''}(* ${arg.description} *)`);
        if (!isInline) formatted.push('\n');
        argIndex++;
    }
    formatted.push(isArgArray ? ')' : '}')
    return formatted.join('');
}

export function formatSymbol(symbol: Symbol, alias: string) {
    return `${alias} :: ${formatArgs(symbol.args)} => ${typeFormatter(symbol.type)}`;
}

function _getDocs(includeToC: boolean) {
    const ToC: string[] = [`
Language Reference
==================

`];
    const implemented: string[] = []

    function formatSymbolSection(symbol: Symbol, lines: string[]) {
        const info = symbol.info;
        const header = formatSymbol(symbol, symbol.id);
        lines.push(`### **${symbol.info.name}**`);
        lines.push(`\`\`\`\n${header}\n\`\`\`\n`);
        if (info.description) {
            lines.push(`*${info.description}*\n`);
        }
    }

    function format(depth: number, obj: any) {
        if (isSymbol(obj)) {
            formatSymbolSection(obj, implemented);
            return;
        }
        if (obj['@header']) {
            implemented.push(`${depth >= 2 ? '##' : '#'} ${obj['@header']}\n`);
            implemented.push(`-------------------\n`);
            const tocLink = obj['@header'].toLowerCase().replace(/\s/g, '-');
            ToC.push(`${new Array(depth + 1).join('  ')} * [${obj['@header']}](#${tocLink})`);
        }
        for (const childKey of Object.keys(obj)) {
            if (typeof obj[childKey] !== 'object' && !isSymbol(obj[childKey])) continue;
            format(depth + 1, obj[childKey]);
        }
    }
    format(0, MolQL);

    const docs = (includeToC ? ToC.join('\n') + '\n' : '') + implemented.join('\n');
    return docs;
}

let md: string | undefined = void 0;

export default function getDocs(includeToC = true) {
    if (md) return md;
    md = _getDocs(includeToC);
    return md;
}

if (typeof process !== void 0 && process.argv[2] === '-print') {
    console.log(getDocs());
}