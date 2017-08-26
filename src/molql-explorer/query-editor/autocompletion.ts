/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as CodeMirror from 'codemirror'
import MolQLScript from '../../transpilers/molql-script/symbols'
import PyMol from '../../transpilers/pymol/symbols'
import Jmol from '../../transpilers/jmol/symbols'
import VMD from '../../transpilers/vmd/symbols'

function createSymbolTest(symbols: string[]) {
    const chars = Object.create(null);
    const alphanum = /[a-zA-Z0-9]/;
    for (const s of symbols) {
        for (const c of s) {
            if (c !== '-' && !alphanum.test(c)) chars[c] = true;
        }
    }
    const test = `[a-zA-Z0-9${Object.keys(chars).join('')}-]`;
    return new RegExp(test);
}

function createAutocompleter(symbols: string[]) {
    const symbolTest = createSymbolTest(symbols);
    const lowercaseSymbols = symbols.map(s => s.toLowerCase());

    return function (document: CodeMirror.Doc) {
        const cur = document.getCursor(), curLine = document.getLine(cur.line);
        let end = cur.ch, start = end;
        while (start && symbolTest.test(curLine.charAt(start - 1))) --start;
        while (end < curLine.length && symbolTest.test(curLine.charAt(end))) ++end;

        const w = document.getRange(CodeMirror.Pos(cur.line, start), CodeMirror.Pos(cur.line, end)).toLowerCase();
        const list = lowercaseSymbols.filter(s => s.indexOf(w) >= 0);
        return { list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end) };
    }
}

function makeList(all: typeof PyMol) {
    return [...all.Keywords, ...all.Operators, ...all.Properties];
}

CodeMirror.registerHelper('hint', 'molql-script', createAutocompleter(MolQLScript));
CodeMirror.registerHelper('hint', 'pymol', createAutocompleter(makeList(PyMol)));
CodeMirror.registerHelper('hint', 'jmol', createAutocompleter(makeList(Jmol)));
CodeMirror.registerHelper('hint', 'vmd', createAutocompleter(makeList(VMD)));

export default [
    'molql-script',
    'pymol',
    'jmol',
    'vmd'
]

