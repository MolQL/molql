/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import AtomSet from '../../query/atom-set'
import AtomSelection from '../../query/atom-selection'
import Context from '../../query/context'
import Environment from '../environment'
import Iterator from '../iterator'
import Slot from '../slot'
import RuntimeExpression from '../expression'
import { Set } from 'immutable'
import Compiler from '../../compiler/compiler'
import { ElementSymbol } from '../../molecule/data'
import { StaticAtomProperties } from '../../../language/properties'

import ElementAddress = Context.ElementAddress

export function flatMap(env: Environment, selection: RuntimeExpression<AtomSelection>, map: RuntimeExpression<AtomSelection>) {
    const builder = AtomSelection.uniqueBuilder();
    const iterator = Iterator.begin(env.atomSet);
    for (const atomSet of AtomSelection.atomSets(selection(env))){
        iterator.value = atomSet;
        for (const mappedAtomSet of AtomSelection.atomSets(map(env))) {
            builder.add(mappedAtomSet);
        }
    }
    Iterator.end(iterator);
    return builder.getSeq();
}