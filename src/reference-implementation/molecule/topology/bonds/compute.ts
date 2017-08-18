/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { FastSet, FastMap } from '../../../utils/collections'
import Mask from '../../../utils/mask'
import { ComponentBondInfo, StructConn } from './utils'
import { Model, BondFlag, Bonds } from '../../data'
import { ElementIndex, ElementBondThresholds, ElementPairThresholds, DefaultBondingRadius } from '../../constants'

export interface BondComputationParameters {
    maxHbondLength: number,
    forceCompute: boolean
}

const MetalsSet = (function () {
    const metals = ['LI', 'NA', 'K', 'RB', 'CS', 'FR', 'BE', 'MG', 'CA', 'SR', 'BA', 'RA', 'AL', 'GA', 'IN', 'SN', 'TL', 'PB', 'BI', 'SC', 'TI', 'V', 'CR', 'MN', 'FE', 'CO', 'NI', 'CU', 'ZN', 'Y', 'ZR', 'NB', 'MO', 'TC', 'RU', 'RH', 'PD', 'AG', 'CD', 'LA', 'HF', 'TA', 'W', 'RE', 'OS', 'IR', 'PT', 'AU', 'HG', 'AC', 'RF', 'DB', 'SG', 'BH', 'HS', 'MT', 'CE', 'PR', 'ND', 'PM', 'SM', 'EU', 'GD', 'TB', 'DY', 'HO', 'ER', 'TM', 'YB', 'LU', 'TH', 'PA', 'U', 'NP', 'PU', 'AM', 'CM', 'BK', 'CF', 'ES', 'FM', 'MD', 'NO', 'LR'];
    const set = FastSet.create<number>();
    for (const m of metals) {
        set.add(ElementIndex[m]!);
    }
    return set;
})();

function pair(a: number, b: number) {
    if (a < b) return (a + b) * (a + b + 1) / 2 + b;
    else return (a + b) * (a + b + 1) / 2 + a;
}

function idx(e: string) {
    const i = ElementIndex[e];
    if (i === void 0) return -1;
    return i;
}

function pairThreshold(i: number, j: number) {
    if (i < 0 || j < 0) return -1;
    const r = ElementPairThresholds[pair(i, j)];
    if (r === void 0) return -1;
    return r;
}

function threshold(i: number) {
    if (i < 0) return DefaultBondingRadius;
    const r = ElementBondThresholds[i];
    if (r === void 0) return DefaultBondingRadius;
    return r;
}

const H_ID = ElementIndex['H']!;
function isHydrogen(i: number) {
    return i === H_ID;
}

function computePerAtomBonds(atomA: number[], atomB: number[], _order: number[], _flags: number[], atomCount: number) {
    const bucketSizes = new Int32Array(atomCount);
    const bucketOffsets = new Int32Array(atomCount + 1) as any as number[];
    const bucketFill = new Int32Array(atomCount);

    for (const i of atomA) bucketSizes[i]++;
    for (const i of atomB) bucketSizes[i]++;

    let offset = 0;
    for (let i = 0; i < atomCount; i++) {
        bucketOffsets[i] = offset;
        offset += bucketSizes[i];
    }
    bucketOffsets[atomCount] = offset;

    const neighbor = new Int32Array(offset) as any as number[];
    const flags = new Uint16Array(offset) as any as number[];
    const order = new Int8Array(offset) as any as number[];

    for (let i = 0, _i = atomA.length; i < _i; i++) {
        const a = atomA[i], b = atomB[i], f = _flags[i], o = _order[i];

        const oa = bucketOffsets[a] + bucketFill[a];
        const ob = bucketOffsets[b] + bucketFill[b];

        neighbor[oa] = b;
        flags[oa] = f;
        order[oa] = o;
        bucketFill[a]++;

        neighbor[ob] = a;
        flags[ob] = f;
        order[ob] = o;
        bucketFill[b]++;
    }

    return {
        offsets: bucketOffsets,
        neighbor,
        flags,
        order
    };
}

function _computeBonds(model: Model, params: BondComputationParameters): Bonds {
    const MAX_RADIUS = 3;

    const { x, y, z } = model.positions;
    const { residueIndex, dataIndex, count: atomCount } = model.atoms;
    const { type_symbol, label_comp_id, label_atom_id, label_alt_id } = model.data.atom_site;
    const query3d = Model.spatialLookup(model).find(Mask.always(model.atoms.count));

    const structConn = StructConn.create(model), component = ComponentBondInfo.create(model);

    const atomA: number[] = [];
    const atomB: number[] = [];
    const flags: number[] = [];
    const order: number[] = [];

    let lastResidue = -1;
    let componentMap: FastMap<string, FastMap<string, { flags: number, order: number }>> | undefined = void 0;

    for (let aI = 0; aI < atomCount; aI++) {
        const raI = residueIndex[aI];
        const rowA = dataIndex[aI];

        if (!params.forceCompute && raI !== lastResidue) {
            const resn = label_comp_id.getString(rowA)!;
            if (!!component && component.entries.has(resn)) {
                componentMap = component.entries.get(resn)!.map;
            } else {
                componentMap = void 0;
            }
        }
        lastResidue = raI;

        const componentPairs = componentMap ? componentMap.get(label_atom_id.getString(rowA)!) : void 0;

        const aeI = idx(type_symbol.getString(rowA)!);

        const { indices, count, squaredDistances } = query3d(x[aI], y[aI], z[aI], MAX_RADIUS);
        const isHa = isHydrogen(aeI);
        const thresholdA = threshold(aeI);
        const altA = label_alt_id.getString(rowA);
        const metalA = MetalsSet.has(aeI);
        const structConnEntries = params.forceCompute ? void 0 : structConn && structConn.getAtomEntries(aI);

        for (let ni = 0; ni < count; ni++) {
            const bI = indices[ni];
            if (bI <= aI) continue;

            const rowB = dataIndex[bI];

            const altB = label_alt_id.getString(rowB);
            if (altA && altB && altA !== altB) continue;

            const beI = idx(type_symbol.getString(rowB)!);
            const isMetal = metalA || MetalsSet.has(beI);

            const rbI = residueIndex[bI];
            // handle "component dictionary" bonds.
            if (raI === rbI && componentPairs) {
                const e = componentPairs.get(label_atom_id.getString(rowB)!);
                if (e) {
                    atomA[atomA.length] = aI;
                    atomB[atomB.length] = bI;
                    order[order.length] = e.order;
                    let flag = e.flags;
                    if (isMetal) {
                        if (flag | BondFlag.Covalent) flag ^= BondFlag.Covalent;
                        flag |= BondFlag.MetallicCoordination;
                    }
                    flags[flags.length] = flag;
                }
                continue;
            }

            const isHb = isHydrogen(beI);
            if (isHa && isHb) continue;

            const dist = Math.sqrt(squaredDistances[ni]);
            if (dist === 0) continue;

            // handle "struct conn" bonds.
            if (structConnEntries && structConnEntries.length) {
                let added = false;
                for (const se of structConnEntries) {
                    for (const p of se.partners) {
                        if (p.atomIndex === bI) {
                            atomA[atomA.length] = aI;
                            atomB[atomB.length] = bI;
                            flags[flags.length] = se.flags;
                            order[order.length] = se.order;
                            added = true;
                            break;
                        }
                    }
                    if (added) break;
                }
                if (added) continue;
            }

            if (isHa || isHb) {
                if (dist < params.maxHbondLength) {
                    atomA[atomA.length] = aI;
                    atomB[atomB.length] = bI;
                    order[order.length] = 1;
                    flags[flags.length] = BondFlag.Covalent | BondFlag.Computed; // TODO: check if correct
                }
                continue;
            }

            const thresholdAB = pairThreshold(aeI, beI);
            const pairingThreshold = thresholdAB > 0
                ? thresholdAB
                : beI < 0 ? thresholdA : Math.max(thresholdA, threshold(beI));


            if (dist <= pairingThreshold) {
                atomA[atomA.length] = aI;
                atomB[atomB.length] = bI;
                order[order.length] = 1;
                flags[flags.length] = (isMetal ? BondFlag.MetallicCoordination : BondFlag.Covalent) | BondFlag.Computed;
            }
        }
    }

    const bonds = computePerAtomBonds(atomA, atomB, order, flags, atomCount);
    return {
        offset: bonds.offsets,
        neighbor: bonds.neighbor,
        flags: bonds.flags,
        order: bonds.order,
        count: atomA.length
    };
}

export default function computeBonds(model: Model, params?: Partial<BondComputationParameters>) {
    return _computeBonds(model, {
        maxHbondLength: (params && params.maxHbondLength) || 1.15,
        forceCompute: !!(params && params.forceCompute),
    });
}