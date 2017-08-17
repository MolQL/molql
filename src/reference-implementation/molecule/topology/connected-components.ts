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
    const { atomBondOffsets, bondsByAtom, annotationByAtom } = bonds;

    while (stack.length) {
        const a = stack.pop()!;
        labels[a] = label;
        const start = atomBondOffsets[a], end = atomBondOffsets[a + 1];
        for (let i = start; i < end; i++) {
            const b = bondsByAtom[i];
            if (!LinkedIndex.has(index, b) || !Bonds.isCovalent(annotationByAtom[i])) continue;

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