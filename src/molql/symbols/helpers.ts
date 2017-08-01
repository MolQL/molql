/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import Type from '../../mini-lisp/type'
import Symbol, { Arguments } from '../../mini-lisp/symbol'

export function symbol<A extends Arguments, T extends Type<S>, S>(args: A, type: T, description?: string) {
    return Symbol('', args, type, description);
}

export function normalizeTable(table: any) {
    _normalizeTable('', '', table);
}

export function symbolList(table: any): Symbol[] {
    const list: Symbol[] = [];
    _symbolList(table, list);
    return list;
}

function formatKey(key: string) {
    return key.replace(/([a-z])([A-Z])([a-z]|$)/g, (s, a, b, c) => `${a}-${b.toLocaleLowerCase()}${c}`);
}

function isSymbol(x: any): x is Symbol {
    const s = x as Symbol;
    return typeof s === 'object' && s.arguments && typeof s.name === 'string' && typeof s.namespace === 'string';
}

function _normalizeTable(namespace: string, key: string, obj: any) {
    if (isSymbol(obj)) {
        obj.namespace = namespace;
        obj.name = obj.name || formatKey(key);
        obj.id = `${obj.namespace}.${obj.name}`;
        return;
    }
    const currentNs = `${obj['@namespace'] || formatKey(key)}`;
    const newNs = namespace ? `${namespace}.${currentNs}` : currentNs;
    for (const childKey of Object.keys(obj)) {
        if (typeof obj[childKey] !== 'object') continue;
        _normalizeTable(newNs, childKey, obj[childKey]);
    }
}

function _symbolList(obj: any, list: Symbol[]) {
    if (isSymbol(obj)) {
        list.push(obj);
        return;
    }
    for (const childKey of Object.keys(obj)) {
        if (typeof obj[childKey] !== 'object') continue;
        _symbolList(obj[childKey], list);
    }
}