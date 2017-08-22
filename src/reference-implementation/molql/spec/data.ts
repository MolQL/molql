/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as fs from 'fs'

import Expression from '../../../mini-lisp/expression'
import * as mmCIF from '../../structure/mmcif'
import parseCIF from '../../structure/parser'
import { Model } from '../../structure/data'
import AtomSet from '../data/atom-set'
import Context from '../runtime/context'
import Environtment from '../runtime/environment'
import _compile from '../../molql/compiler'
import AtomSelection from '../data/atom-selection'

import AtomSetIt = AtomSet.Iterator

const molData = fs.readFileSync('spec/1tqn_updated.cif', 'utf-8')
export const model = parseCIF(molData).models[0];

export const ctx = Context.ofModel(model);
export const env = Environtment(ctx);
export const compile = _compile;

export const compileQuery = (e: Expression) => compile(e, 'query')

export function areAtomSetEqual(a: AtomSet, b: AtomSet) {
    return AtomSet.areEqual(a, b);
}

export function checkAtomSet(model: Model, atomSet: AtomSet, f: (i: number, cols: mmCIF.Category<mmCIF.AtomSite>) => boolean) {
    const atom_site = model.data.atom_site;
    const it = AtomSetIt()
    for (let a = it.init(atomSet); !it.done; a = it.next().value) {
        if (!f(a, atom_site)) return false;
    }
    return true;
}

export function countAtomSet(model: Model, atomSet: AtomSet, f: (i: number, cols: mmCIF.Category<mmCIF.AtomSite>) => boolean) {
    const atom_site = model.data.atom_site;
    const it = AtomSetIt()
    let count = 0;
    for (let a = it.init(atomSet); !it.done; a = it.next().value) {
        if (f(a, atom_site)) count++;
    }
    return count;
}

export function checkAtomSelection(model: Model, atomSel: AtomSelection, f: (i: number, cols: mmCIF.Category<mmCIF.AtomSite>) => boolean) {
    return AtomSelection.atomSets(atomSel).every(s => checkAtomSet(model, s, f));
}

export function checkAtomSelsEqual(a: AtomSelection, b: AtomSelection) {
    const xs = AtomSelection.atomSets(a), ys = AtomSelection.atomSets(b);
    if (xs.length !== ys.length) return false;

    const set = new AtomSelection.Set();
    for (const x of xs) set.add(x);
    for (const y of ys) {
        if (!set.has(y)) return false;
    }
    return true;
}