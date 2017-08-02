/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Iterator from './iterator'
import Slot from './slot'
import Mask from '../../utils/mask'
import { Model } from '../../molecule/data'
import ElementAddress from '../data/element-address'
import AtomSet from '../data/atom-set'
import AtomSelection from '../data/atom-selection'

interface Context {
    readonly model: Model,
    readonly mask: Mask,

    readonly positions: Model['positions'],
    readonly atom_site: Model['data']['atom_site'],

    readonly element: Iterator<ElementAddress>,
    readonly atomSet: Iterator<AtomSet>,
    readonly atomSetReducer: Slot
}

function Context(model: Model, mask: Mask): Context {
    return {
        model,
        mask,
        positions: model.positions,
        atom_site: model.data.atom_site,
        element: Iterator(),
        atomSet: Iterator(),
        atomSetReducer: Slot()
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

    export function beginIterateElemement(ctx: Context) {
        Iterator.begin(ctx.element, ElementAddress());
        return ctx.element.value;
    }

    export function endIterateElement(ctx: Context) {
        Iterator.end(ctx.element);
    }
}

export default Context