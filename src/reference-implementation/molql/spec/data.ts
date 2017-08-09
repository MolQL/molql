/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import * as fs from 'fs'

import Expression from '../../../mini-lisp/expression'
import * as mmCIF from '../../molecule/mmcif'
import parseCIF from '../../molecule/parser'
import { Model } from '../../molecule/data'
import AtomSet from '../data/atom-set'
import Context from '../runtime/context'
import Environtment from '../runtime/environment'
import _compile from '../../molql/compiler'
import AtomSelection from '../data/atom-selection'
import B from '../../../molql/builder'

export const set12 = AtomSet([1, 2])
export const set34 = AtomSet([3, 4])
export const set23 = AtomSet([2, 3])
export const set123 = AtomSet([1, 2, 3])
export const set1234 = AtomSet([1, 2, 3, 4])

const molData = fs.readFileSync('spec/1tqn_updated.cif', 'utf-8')
export const model = parseCIF(molData).models[0];

export const ctx = Context.ofModel(model);
export const env = Environtment(ctx);
export const compile = _compile;

export const compileQuery = (e: Expression) => compile(B.evaluate(e))

export function areAtomSetEqual(a: AtomSet, b: AtomSet) {
    return AtomSet.areEqual(a, b);
}

export function checkAtomSet(model: Model, atomSet: AtomSet, f: (i: number, cols: mmCIF.Category<mmCIF.AtomSite>) => boolean) {
    const atom_site = model.data.atom_site;
    return AtomSet.atomIndices(atomSet).every(a => f(a, atom_site));
}

export function countAtomSet(model: Model, atomSet: AtomSet, f: (i: number, cols: mmCIF.Category<mmCIF.AtomSite>) => boolean) {
    const atom_site = model.data.atom_site;
    return AtomSet.atomIndices(atomSet).filter(a => f(a, atom_site)).length;
}

export function checkAtomSelection(model: Model, atomSel: AtomSelection, f: (i: number, cols: mmCIF.Category<mmCIF.AtomSite>) => boolean) {
    return AtomSelection.atomSets(atomSel).every(s => checkAtomSet(model, s, f));
}