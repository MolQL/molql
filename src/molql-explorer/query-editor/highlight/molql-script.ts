/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as CodeMirror from 'codemirror'
import { SymbolList, Constants } from '../../../transpilers/molql-script/symbols'

/**
 * Adapted from the CodeMirror source code
 * MIT license, Copyright (C) 2017 by Marijn Haverbeke <marijnh@gmail.com> and others
 */

const SymbolTest = /[^\s'`,@()\[\]';]/;

CodeMirror.defineMode('molql-script', (config) => {
    //const specialForm = /^(block|let*|return-from|catch|load-time-value|setq|eval-when|locally|symbol-macrolet|flet|macrolet|tagbody|function|multiple-value-call|the|go|multiple-value-prog1|throw|if|progn|unwind-protect|labels|progv|let|quote)$/;
    //const assumeBody = /^with|^def|^do|^prog|case$|^cond$|bind$|when$|unless$/;
    const symbols = Object.create(null);
    for (const s of SymbolList) symbols[s[0]] = true;
    const constants = Object.create(null);
    for (const s of Constants) constants[s] = true;
    const numLiteral = /^(?:[+\-]?(?:\d+|\d*\.\d+)(?:[efd][+\-]?\d+)?|[+\-]?\d+(?:\/[+\-]?\d+)?|#b[+\-]?[01]+|#o[+\-]?[0-7]+|#x[+\-]?[\da-f]+)/;
    const elementSymbol = /^\_[0-9a-zA-Z]+/;
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
        if (ch === '0')  return 'number';
        if (ch === '\\') ch = stream.next()!;

        if (ch === '`') return (state.tokenize = inString)(stream, state);
        else if (ch === '(' || ch === '[') { type = 'open'; return 'bracket'; }
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
            //else if (ch === ':') { readSym(stream); return 'special'; }
            else if (ch === '\\') { stream.next(); readSym(stream); return 'string-2' }
            else return 'error';
        } else {
            const name = readSym(stream);
            if (name === '.') return null;
            type = 'symbol';
            if (constants[name] || elementSymbol.test(name)) return 'atom';
            if (name.charAt(0) === ':') return 'special';
            if (/*state.lastType === 'open' &&*/ symbols[name]) return 'keyword';
            // if (name.charAt(0) === '&') return 'variable-2';
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