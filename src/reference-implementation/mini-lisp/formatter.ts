/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../mini-lisp/expression'

const { isLiteral, isArgumentsArray } = Expression;

export default function format(e: Expression) {
    const writer = new Writer();
    _format(e, writer);
    return writer.getStr();
}

class Writer {
    private value: string[] = [];
    private currentLineLength = 0;
    private prefixLength = 0;
    private _prefix: string = '';
    private localPrefix: string = '';

    private setLocal() {
        this.localPrefix = '  ';
    }

    newline() {
        this.value.push(`\n${this._prefix}${this.localPrefix}`);
    }

    push() {
        this.value.push('(');
        this.currentLineLength = 0;
        this.localPrefix = '';
        this.prefixLength += 2;
        this._prefix = new Array(this.prefixLength + 1).join(' ');
    }

    pop() {
        this.value.push(')');
        this.prefixLength -= 2;
        this._prefix = new Array(this.prefixLength + 1).join(' ');
    }

    append(str: string) {
        if (!this.currentLineLength) {
            this.value.push(str);
            this.currentLineLength = str.length;
        } else if (this.currentLineLength + this.prefixLength + this.localPrefix.length + str.length < 80) {
            this.value.push(str);
            this.currentLineLength += str.length;
        } else {
            this.setLocal();
            this.newline();
            this.value.push(str);
            this.currentLineLength = str.length;
        }
    }

    whitespace() {
        if (this.currentLineLength + this.prefixLength + this.localPrefix.length + 1 < 80) {
            this.value.push(' ');
        }
    }

    getStr() {
        return this.value.join('');
    }
}

function _format(e: Expression, writer: Writer) {
    if (isLiteral(e)) {
        if (typeof e === 'string' && /\s/.test(e)) writer.append(`\`${e}\``);
        else writer.append(`${e}`);
        return;
    }

    writer.push();
    _format(e.head, writer);

    if (!e.args) {
        writer.pop();
        return;
    }

    if (isArgumentsArray(e.args)) {
        for (const a of e.args) {
            if (isLiteral(a)) writer.whitespace();
            else writer.newline();
            _format(a, writer);
        }
        writer.pop();
        return;
    }

    const keys = Object.keys(e.args);
    if (!keys.length) {
        writer.pop();
        return;
    }

    if (keys.length === 1 && isLiteral(e.args[keys[0]])) {
        writer.whitespace()
        writer.append(`:${keys[0]}`);
        writer.whitespace();
        _format(e.args[keys[0]], writer);
        writer.pop();
        return;
    }

    for (const a of keys) {
        writer.newline();
        writer.append(`:${a}`);
        writer.whitespace();
        _format(e.args[a], writer);
    }
    writer.pop();
}