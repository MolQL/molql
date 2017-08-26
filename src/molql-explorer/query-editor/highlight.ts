/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as CodeMirror from 'codemirror'
import PyMol from '../../transpilers/pymol/symbols'
import Jmol from '../../transpilers/jmol/symbols'
import VMD from '../../transpilers/vmd/symbols'


function createHighlighter(all: typeof PyMol, ignoreCase: boolean): CodeMirror.ModeFactory<any> {

    function symb(s: string) {
        return ignoreCase ? s.toLowerCase() : s;
    }

    return function (config: CodeMirror.EditorConfiguration) {
        const SymbolTest = /[^\s'`,@()\[\]';]/;

        const operators = Object.create(null), keywords = Object.create(null), props = Object.create(null);
        for (const s of all.Operators) operators[symb(s)] = true;
        for (const s of all.Keywords) keywords[symb(s)] = true;
        for (const s of all.Properties) props[symb(s)] = true;
        const numLiteral = /^(?:[+\-]?(?:\d+|\d*\.\d+)(?:[efd][+\-]?\d+)?|[+\-]?\d+(?:\/[+\-]?\d+)?|#b[+\-]?[01]+|#o[+\-]?[0-7]+|#x[+\-]?[\da-f]+)/;
        let type: string | null = null;

        function readSym(stream: CodeMirror.StringStream) {
            let ch;
            while (ch = stream.next()) {
                if (ch === '\\') stream.next();
                else if (!SymbolTest.test(ch)) { stream.backUp(1); break; }
            }
            return symb(stream.current());
        }

        function base(stream: CodeMirror.StringStream, state: State): string | null {
            if (stream.eatSpace()) { type = 'ws'; return null; }
            if (stream.match(numLiteral)) return 'number';
            let ch: string = stream.next()!;
            if (ch === '0')  return 'number';
            if (ch === '\\') ch = stream.next()!;

            if (ch === '"' || ch === '\'') return (state.tokenize = inString)(stream, state);
            else if (ch === '(' || ch === '[') { type = 'open'; return 'bracket'; }
            else if (ch === ')' || ch === ']') { type = 'close'; return 'bracket'; }
            else {
                const name = readSym(stream);
                if (name === '.') return null;
                type = 'symbol';
                if (keywords[name]) return 'special';
                if (operators[name]) return 'keyword';
                if (props[name]) return 'atom';
                return 'variable';
            }
        }

        function inString(stream: CodeMirror.StringStream, state: State) {
            let escaped = false, next;
            const delim = stream.current();
            while (next = stream.next()) {
                if (next === delim && !escaped) { state.tokenize = base; break; }
                escaped = !escaped && next === '\\';
            }
            return 'string';
        }

        type State = { ctx: { prev: State | null, start: number, indentTo: 0 }, lastType: string | null, tokenize: typeof base }

        return {
            startState: function (): State {
                return { ctx: { prev: null, start: 0, indentTo: 0 }, lastType: null, tokenize: base };
            },

            token: function (stream, state) {
                if (stream.sol() && typeof state.ctx.indentTo !== 'number')
                    state.ctx.indentTo = state.ctx.start + 1;

                type = null;
                const style = state.tokenize(stream, state);
                if (type !== 'ws') {
                    if (state.ctx.indentTo === null) {
                        state.ctx.indentTo = 'next';
                    } else if (state.ctx.indentTo === 'next') {
                        state.ctx.indentTo = state.ctx.start;
                    }
                    state.lastType = type;
                }
                if (type === 'open') state.ctx = { prev: state.ctx, start: state.ctx.start + 2, indentTo: null };
                else if (type === 'close') state.ctx = state.ctx.prev || state.ctx;
                return style;
            },

            indent: function (state, _textAfter) {
                return state.ctx.start;
            },

            closeBrackets: { pairs: '()[]``\'\'""' },
            lineComment: void 0,
            blockCommentStart: void 0,
            blockCommentEnd: void 0
        };
    }
}

import './highlight/molql-script'
CodeMirror.defineMode('pymol', createHighlighter(PyMol, true));
CodeMirror.defineMode('jmol', createHighlighter(Jmol, true));
CodeMirror.defineMode('vmd', createHighlighter(VMD, true));

