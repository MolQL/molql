/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Mask from '../../utils/mask'
import { Model } from '../../structure/data'
import AtomSet from '../data/atom-set'
import AtomSelection from '../data/atom-selection'

interface Context {
    readonly model: Model,
    readonly mask: Mask,

    readonly positions: Model['positions'],
    readonly atom_site: Model['data']['atom_site']
}

function Context(model: Model, mask: Mask): Context {
    return {
        model,
        mask,
        positions: model.positions,
        atom_site: model.data.atom_site
    };
}

namespace Context {
    export function ofAtomSet({ model }: Context, atomSet: AtomSet) {
        return Context(model, AtomSet.getMask(atomSet));
    }

    export function ofAtomSelection(model: Model, atomSelection: AtomSelection) {
        return Context(model, AtomSelection.getMask(atomSelection));
    }

    export function ofModel(model: Model) {
        return Context(model, Mask.always(model.atoms.count));
    }
}

export default Context