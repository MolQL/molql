// /*
//  * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
//  */

// import Symbols, { isSymbolInfo, ArgSpec, SymbolInfo } from '../../language/symbols'
// import Type from '../../language/type-system'
// import RuntimeSymbols from '../runtime/symbols'

// /**
//  * Generates markdown documentation from the language spec.
//  */

// const ToC: string[] = [`
// Language Reference
// ==================

// `];
// const implemented: string[] = []

// const notImplemented: string[] = [`
// Not yet implemented
// ===================
// `
// ]

// function formatArgs(args: ArgSpec[]) {
//     return args.map(a => `${a[0]}: ${Type.format(a[1])}`).join(', ')
// }

// function formatSymbol(symbol: SymbolInfo, lines: string[]) {
//     const name = symbol.name;
//     const header = symbol.args && symbol.args.length
//         ? `${name} :: (${formatArgs(symbol.args)}) => ${Type.format(symbol.type)}`
//         : `${name} :: ${Type.format(symbol.type)}`;
//     lines.push(`### **${symbol.shortName}**&nbsp;&nbsp;&nbsp;\`\`${header}\`\`\n`);
//     if (symbol.description) {
//         lines.push(`*${symbol.description}*\n`);
//     }
//     lines.push(`-------------------\n`);
// }

// function format(depth: number, obj: any) {
//     if (isSymbolInfo(obj)) {
//         if (RuntimeSymbols[obj.name]) formatSymbol(obj, implemented);
//         else formatSymbol(obj, notImplemented);
//         return;
//     }
//     if (obj['@header']) {
//         implemented.push(`${depth >= 2 ? '##' : '#'} ${obj['@header']}\n`);
//         const tocLink = obj['@header'].toLowerCase().replace(/\s/g, '-');
//         ToC.push(`${new Array(depth + 1).join('  ')} * [${obj['@header']}](#${tocLink})`);
//     }
//     for (const childKey of Object.keys(obj)) {
//         if (typeof obj[childKey] !== 'object') continue;
//         format(depth + 1, obj[childKey]);
//     }
// }
// format(0, Symbols);
// console.log(ToC.join('\n'));
// console.log(implemented.join('\n'));
// console.log(notImplemented.join('\n'));