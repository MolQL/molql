/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Iterator from './iterator'
import Slot from './slot'
import Context from '../query/context'
import AtomSet from '../query/atom-set'
import { Model } from '../molecule/data'

interface Environment {
    readonly queryCtx: Context,

    readonly model: Model,
    readonly positions: Model['positions'],
    readonly atom_site: Model['data']['atom_site'],
    readonly modelData: Model['data'],

    readonly element: Iterator<Context.ElementAddress>,
    readonly atomSet: Iterator<AtomSet>,
    readonly atomSetReducer: Slot
}

function Environment(queryCtx?: Context): Environment {
    const ctx = queryCtx!;
    return {
        queryCtx: ctx,
        model: ctx && ctx.model,
        positions: ctx && ctx.model.positions,
        atom_site: ctx && ctx.model.data.atom_site,
        modelData: ctx && ctx.model.data,

        element: Iterator(),
        atomSet: Iterator(),
        atomSetReducer: Slot()
    };
}

export default Environment;