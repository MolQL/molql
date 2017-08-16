/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { FastMap } from '../../utils/collections'
import { Model, BondType } from '../data'
import CIF from 'ciftools.js'

export class StructConn {
    private _residuePairIndex: FastMap<string, StructConn.Entry[]> | undefined = void 0;
    private _atomIndex: FastMap<number, StructConn.Entry[]> | undefined = void 0;

    private static _resKey(rA: number, rB: number) {
        if (rA < rB) return `${rA}-${rB}`;
        return `${rB}-${rA}`;
    }

    private getResiduePairIndex() {
        if (this._residuePairIndex) return this._residuePairIndex;
        this._residuePairIndex = FastMap.create();
        for (const e of this.entries) {
            const ps = e.partners;
            const l = ps.length;
            for (let i = 0; i < l - 1; i++) {
                for (let j = i + i; j < l; j++) {
                    const key = StructConn._resKey(ps[i].residueIndex, ps[j].residueIndex);
                    if (this._residuePairIndex.has(key)) {
                        this._residuePairIndex.get(key)!.push(e);
                    } else {
                        this._residuePairIndex.set(key, [e]);
                    }
                }
            }
        }
        return this._residuePairIndex;
    }

    private getAtomIndex() {
        if (this._atomIndex) return this._atomIndex;
        this._atomIndex = FastMap.create();
        for (const e of this.entries) {
            for (const p of e.partners) {
                const key = p.atomIndex;
                if (this._atomIndex.has(key)) {
                    this._atomIndex.get(key)!.push(e);
                } else {
                    this._atomIndex.set(key, [e]);
                }
            }
        }
        return this._atomIndex;
    }

    private static _emptyEntry = [];

    getResidueEntries(residueAIndex: number, residueBIndex: number): ReadonlyArray<StructConn.Entry> {
        return this.getResiduePairIndex().get(StructConn._resKey(residueAIndex, residueBIndex)) || StructConn._emptyEntry;
    }

    getAtomEntries(atomIndex: number): ReadonlyArray<StructConn.Entry> {
        return this.getAtomIndex().get(atomIndex) || StructConn._emptyEntry;
    }

    constructor(public entries: StructConn.Entry[]) {
    }
}

export namespace StructConn {
    export interface Entry {
        distance: number,
        bondType: BondType,
        partners: { residueIndex: number, atomIndex: number, symmetry: string }[]
    }

    type StructConnType =
        | 'covale'
        | 'covale_base'
        | 'covale_phosphate'
        | 'covale_sugar'
        | 'disulf'
        | 'hydrog'
        | 'metalc'
        | 'mismat'
        | 'modres'
        | 'saltbr'

    export function create(model: Model): StructConn | undefined {
        const { structConn } = model.data.bonds;
        if (!structConn.rowCount) return void 0;

        const _structConn = structConn as any;
        const _idCols = (i: number) => ({
            label_asym_id: _structConn['ptnr' + i + '_label_asym_id'],
            label_seq_id: _structConn['ptnr' + i + '_label_seq_id'],
            label_atom_id: _structConn['ptnr' + i + '_label_atom_id'],
            label_alt_id: _structConn['pdbx_ptnr' + i + '_label_alt_id'],
            ins_code: _structConn['pdbx_ptnr' + i + '_PDB_ins_code'],
            symmetry: _structConn['ptnr' + i + '_symmetry']
        });

        const { conn_type_id, pdbx_dist_value, pdbx_value_order } = structConn;
        const p1 = _idCols(1);
        const p2 = _idCols(2);

        const _p = (row: number, ps: typeof p1) => {
            if (ps.label_asym_id.getValuePresence(row) !== CIF.ValuePresence.Present) return void 0;
            const residueIndex = Model.findResidueIndexByLabel(model, ps.label_asym_id.getString(row)!, ps.label_seq_id.getInteger(row), ps.ins_code.getString(row));
            if (residueIndex < 0) return void 0;
            const atomIndex = Model.findAtomIndexByLabelName(model, residueIndex, ps.label_atom_id.getString(row)!, ps.label_alt_id.getString(row));
            if (atomIndex < 0) return void 0;
            return { residueIndex, atomIndex, symmetry: ps.symmetry.getString(row) || '1_555' };
        }

        const _ps = (row: number) => {
            const ret = [];
            let p = _p(row, p1);
            if (p) ret.push(p);
            p = _p(row, p2);
            if (p) ret.push(p);
            return ret;
        }

        const entries: StructConn.Entry[] = [];
        for (let i = 0; i < structConn.rowCount; i++) {
            const partners = _ps(i);
            if (partners.length < 2) continue;

            const type = conn_type_id.getString(i)! as StructConnType;
            const orderType = (pdbx_value_order.getString(i) || '').toLowerCase();
            let bondType = BondType.Unknown;

            switch (orderType) {
                case 'sing': bondType = BondType.Order1; break;
                case 'doub': bondType = BondType.Order2; break;
                case 'trip': bondType = BondType.Order3; break;
                case 'quad': bondType = BondType.Order4; break;
            }

            switch (type) {
                case 'disulf': bondType = BondType.DisulfideBridge; break;
                case 'hydrog': bondType = BondType.Hydrogen; break;
                case 'metalc': bondType = BondType.Metallic; break;
                // case 'mismat': bondType = BondType.Single; break; 
                case 'saltbr': bondType = BondType.Ion; break;
            }

            entries.push({ bondType, distance: pdbx_dist_value.getFloat(i), partners });
        }

        return new StructConn(entries);
    }
}

export class ComponentBondInfo {
    entries: FastMap<string, ComponentBondInfo.Entry> = FastMap.create<string, ComponentBondInfo.Entry>();

    newEntry(id: string) {
        let e = new ComponentBondInfo.Entry(id);
        this.entries.set(id, e);
        return e;
    }
}

export namespace ComponentBondInfo {
    export class Entry {
        map: FastMap<string, FastMap<string, BondType>> = FastMap.create<string, FastMap<string, BondType>>();

        add(a: string, b: string, order: BondType, swap = true) {
            let e = this.map.get(a);
            if (e !== void 0) {
                let f = e.get(b);
                if (f === void 0) {
                    e.set(b, order);
                }
            } else {
                let map = FastMap.create<string, BondType>();
                map.set(b, order);
                this.map.set(a, map);
            }

            if (swap) this.add(b, a, order, false);
        }

        constructor(public id: string) {
        }
    }

    export function create(model: Model): ComponentBondInfo | undefined {
        const { chemCompBond } = model.data.bonds;
        if (!chemCompBond.rowCount) return void 0;

        let info = new ComponentBondInfo();

        const { comp_id, atom_id_1, atom_id_2, value_order, rowCount  } = chemCompBond;

        let entry = info.newEntry(comp_id.getString(0)!);

        for (let i = 0; i < rowCount; i++) {

            const id = comp_id.getString(i)!;
            const nameA = atom_id_1.getString(i)!;
            const nameB = atom_id_2.getString(i)!;
            const order = value_order.getString(i)!;

            if (entry.id !== id) {
                entry = info.newEntry(id);
            }

            let t: BondType;
            switch (order.toLowerCase()) {
                case 'sing': t = BondType.Order1; break;
                case 'doub':
                case 'delo':
                    t = BondType.Order2;
                    break;
                case 'trip': t = BondType.Order3; break;
                case 'quad': t = BondType.Order4; break;
                default: t = BondType.Unknown; break;
            }

            entry.add(nameA, nameB, t);
        }

        return info;
    }
}