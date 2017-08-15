/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as CodeMirror from 'codemirror'
import * as MolQLScript from '../../transpilers/molql-script/symbols'

/**
 * Adapted from the CodeMirror source code
 * MIT license, Copyright (C) 2017 by Marijn Haverbeke <marijnh@gmail.com> and others
 */

const SymbolTest = /[^\s'`,@()\[\]';]/;

const MolQLsymbols = MolQLScript.SymbolList.map(s => s[0]).sort((a, b) => {
    if (a.length === b.length) return (a < b) as any;
    return a.length - b.length;
});
const MolQLnamedArgs = MolQLScript.NamedArgs.map(a => ':' + a);
const MolQLfull = [...MolQLsymbols, ...MolQLnamedArgs];

CodeMirror.defineMode('molql-script', (config) => {
    //const specialForm = /^(block|let*|return-from|catch|load-time-value|setq|eval-when|locally|symbol-macrolet|flet|macrolet|tagbody|function|multiple-value-call|the|go|multiple-value-prog1|throw|if|progn|unwind-protect|labels|progv|let|quote)$/;
    //const assumeBody = /^with|^def|^do|^prog|case$|^cond$|bind$|when$|unless$/;
    const symbols = Object.create(null);
    for (const s of MolQLsymbols) symbols[s] = true;
    const numLiteral = /^(?:[+\-]?(?:\d+|\d*\.\d+)(?:[efd][+\-]?\d+)?|[+\-]?\d+(?:\/[+\-]?\d+)?|#b[+\-]?[01]+|#o[+\-]?[0-7]+|#x[+\-]?[\da-f]+)/;
    let type: string | null = null;

    function readSym(stream: CodeMirror.StringStream) {
        let ch;
        while (ch = stream.next()) {
            if (ch === '\\') stream.next();
            else if (!SymbolTest.test(ch)) { stream.backUp(1); break; }
        }
        return stream.current();
    }

    function base(stream: CodeMirror.StringStream, state: State): string | null {
        if (stream.eatSpace()) { type = 'ws'; return null; }
        if (stream.match(numLiteral)) return 'number';
        let ch: string = stream.next()!;
        if (ch === '\\') ch = stream.next()!;

        if (ch === '`') return (state.tokenize = inString)(stream, state);
        else if (ch === '(') { type = 'open'; return 'bracket'; }
        else if (ch === ')' || ch === ']') { type = 'close'; return 'bracket'; }
        else if (ch === ';') { stream.skipToEnd(); type = 'ws'; return 'comment'; }
        //else if (/['`,@]/.test(ch)) return null;
        /*else if (ch === '|') {
            if (stream.skipTo('|')) { stream.next(); return 'symbol'; }
            else { stream.skipToEnd(); return 'error'; }
        }*/ else if (ch === '#') {
            const ch = stream.next();
            if (ch === '(') { type = 'open'; return 'bracket'; }
            else if (/[+\-=\.']/.test(ch!)) return null;
            else if (/\d/.test(ch!) && stream.match(/^\d*#/)) return null;
            else if (ch === '|') return (state.tokenize = inComment)(stream, state);
            else if (ch === ':') { readSym(stream); return 'meta'; }
            else if (ch === '\\') { stream.next(); readSym(stream); return 'string-2' }
            else return 'error';
        } else {
            const name = readSym(stream);
            if (name === '.') return null;
            type = 'symbol';
            if (name === 'nil' || name === 't' || name.charAt(0) === ':') return 'atom';
            if (state.lastType === 'open' && symbols[name]) return 'keyword';
            if (name.charAt(0) === '&') return 'variable-2';
            return 'variable';
        }
    }

    function inString(stream: CodeMirror.StringStream, state: State) {
        let escaped = false, next;
        while (next = stream.next()) {
            if (next === '`' && !escaped) { state.tokenize = base; break; }
            escaped = !escaped && next === '\\';
        }
        return 'string';
    }

    function inComment(stream: CodeMirror.StringStream, state: State) {
        let next, last;
        while (next = stream.next()) {
            if (next === '#' && last === '|') { state.tokenize = base; break; }
            last = next;
        }
        type = 'ws';
        return 'comment';
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
                    // if (type === 'symbol' /*&& assumeBody.test(stream.current())*/)
                    //     state.ctx.indentTo = state.ctx.start + config.indentUnit;
                    // else
                    state.ctx.indentTo = 'next';
                } else if (state.ctx.indentTo === 'next') {
                    state.ctx.indentTo = state.ctx.start; //stream.column();
                }
                state.lastType = type;
            }
            if (type === 'open') state.ctx = { prev: state.ctx, start: state.ctx.start + 2, indentTo: null };
            else if (type === 'close') state.ctx = state.ctx.prev || state.ctx;
            return style;
        },

        indent: function (state, _textAfter) {
            //const i = state.ctx.indentTo;
            return state.ctx.start; //typeof i === 'number' ? i : state.ctx.start + 2;
        },

        closeBrackets: { pairs: '()[]``' },
        lineComment: ';;',
        blockCommentStart: '#|',
        blockCommentEnd: '|#'
    };
});

CodeMirror.registerHelper('hint', 'molql-script', function (document: CodeMirror.Doc) {
    const cur = document.getCursor(), curLine = document.getLine(cur.line);
    let end = cur.ch, start = end;
    while (start && SymbolTest.test(curLine.charAt(start - 1))) --start;
    while (end < curLine.length && SymbolTest.test(curLine.charAt(end))) ++end;

    const w = document.getRange(CodeMirror.Pos(cur.line, start), CodeMirror.Pos(cur.line, end));
    const test = new RegExp(w, 'i');
    const list = MolQLfull.filter(s => test.test(s));
    return { list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end) };
});