/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import LinkedIndex from '../../utils/linked-index'
import { Model, Bonds } from '../data'

function labelComponent(bonds: Bonds, labels: number[], head: number, index: LinkedIndex, label: number) {
    const stack = [head];
    LinkedIndex.remove(index, head);

    const { neighbor, offset: bondAtomOffset, flags } = bonds;

    while (stack.length) {
        const a = stack.pop()!;
        labels[a] = label;
        const start = bondAtomOffset[a], end = bondAtomOffset[a + 1];
        for (let i = start; i < end; i++) {
            const b = neighbor[i];
            if (!LinkedIndex.has(index, b) || !Bonds.isCovalent(flags[i])) continue;

            stack.push(b);
            LinkedIndex.remove(index, b);
        }
    }
}

export default function findComponents(model: Model) {
    const index = LinkedIndex(model.atoms.count);
    const labels = new Int32Array(model.atoms.count) as any as number[];
    const bonds = Model.bonds(model);
    let label = 0;
    while (index.head >= 0) {
        labelComponent(bonds, labels, index.head, index, label);
        label++;
    }
    return labels;
}