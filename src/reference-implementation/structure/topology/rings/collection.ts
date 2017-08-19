/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { Model, ElementSymbol } from '../../data'
import { FastMap } from '../../../utils/collections'
import computeRings from './compute'

interface Rings {
    all: number[][],
    byFingerprint: FastMap<string, number[]>
}

function Rings(model: Model): Rings {
    const rings = computeRings(model);
    const byFingerprint = FastMap.create<string, number[]>();

    const { dataIndex } = model.atoms;
    const { type_symbol } = model.data.atom_site;

    let idx = 0;
    for (const r of rings) {
        const elements: string[] = [];
        for (const a of r) elements[elements.length] = ElementSymbol(type_symbol.getString(dataIndex[a])!);
        const fp = getRingFingerprint(elements);
        if (byFingerprint.has(fp)) byFingerprint.get(fp)!.push(idx);
        else byFingerprint.set(fp, [idx]);
        idx++;
    }

    return { all: rings, byFingerprint };
}

function getMinimalRotation(elements: string[]) {
    // adapted from http://en.wikipedia.org/wiki/Lexicographically_minimal_string_rotation

    const len = elements.length;
    const f = new Int32Array(len * 2);
    for (let i = 0; i < f.length; i++) f[i] = -1;

    let u = '', v = '', k = 0;

    for (let j = 1; j < f.length; j++) {
        let i = f[j - k - 1];
        while (i !== -1) {
            u = elements[j % len]; v = elements[(k + i + 1) % len];
            if (u === v) break;
            if (u < v) k = j - i - 1;
            i = f[i];
        }

        if (i === -1) {
            u = elements[j % len]; v = elements[(k + i + 1) % len];
            if (u !== v) {
                if (u < v) k = j;
                f[j - k] = -1;
            } else f[j - k] = i + 1;
        } else f[j - k] = i + 1;
    }

    return k;
}

function buildFinderprint(elements: string[], offset: number) {
    const len = elements.length;
    const ret: string[] = [];
    let i;
    for (i = 0; i < len - 1; i++) {
        ret.push(elements[(i + offset) % len]);
        ret.push('-');
    }
    ret.push(elements[(i + offset) % len]);
    return ret.join('');
}

export function getRingFingerprint(elements: string[]) {
    const len = elements.length;
    const reversed: string[] = new Array(len);

    for (let i = 0; i < len; i++) reversed[i] = elements[len - i - 1];

    const rotNormal = getMinimalRotation(elements);
    const rotReversed = getMinimalRotation(reversed);

    let isNormalSmaller = false;

    for (let i = 0; i < len; i++) {
        const u = elements[(i + rotNormal) % len], v = reversed[(i + rotReversed) % len];
        if (u !== v) {
            isNormalSmaller = u < v;
            break;
        }
    }

    if (isNormalSmaller) return buildFinderprint(elements, rotNormal);
    return buildFinderprint(reversed, rotReversed);
}

export default Rings