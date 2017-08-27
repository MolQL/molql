/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import LiteMol from 'litemol'
import { Model } from '../reference-implementation/structure/data'
import mmCIFwriter from '../reference-implementation/structure/writer'
import AtomSelection from '../reference-implementation/molql/data/atom-selection'
import AtomSet from '../reference-implementation/molql/data/atom-set'

type Result =
    | { kind: 'empty' }
    | { kind: 'error', message: string }
    | Result.Selection

export interface ResultEntry {
    indices: number[],
    info: string,
    signature: string
}

export function ResultEntry(model: Model, atomSet: AtomSet): ResultEntry {
    const { residueIndices } = AtomSet.hierarchy(model, atomSet);
    const { dataIndex } = model.atoms;
    const { atomOffset } = model.residues;
    const { label_comp_id, label_atom_id } = model.data.atom_site;

    let signature: string = '';
    const indices = AtomSet.toIndices(atomSet) as number[];

    if (indices.length === 1) {
        const i = dataIndex[indices[0]]
        signature = `${label_atom_id.getString(i)!} (${label_comp_id.getString(i)!})`;
    } else {
        const counts: { [name: string]: number } = { };
        for (const rI of residueIndices) {
            const i = dataIndex[atomOffset[rI]];
            const n = label_comp_id.getString(i)!;
            counts[n] = (counts[n] | 0) + 1;
        }
        signature = Object.keys(counts).sort().map(k => counts[k] > 1 ? `${k}x${counts[k]}` : k).join('-');
    }

    return {
        indices,
        info: `${indices.length} ${indices.length !== 1 ? 'atoms' : 'atom'} on ${residueIndices.length} ${residueIndices.length !== 1 ? 'residues' : 'residue'}`,
        signature
    };
}

function Result(model: Model, selection: AtomSelection, merge: boolean): Result.Selection {
    const allIndices = AtomSelection.getAtomIndices(selection) as number[];

    if (allIndices.length > 0 && merge) {
        const atomSet = AtomSet(AtomSelection.getAtomIndices(selection));
        return {
            kind: 'selection',
            allIndices,
            entries: [ResultEntry(model, atomSet)]
        }
    }
    return {
        kind: 'selection',
        allIndices,
        entries: AtomSelection.atomSets(selection).map(s => ResultEntry(model, s))
    };
}

namespace Result {
    export type Selection = { kind: 'selection', allIndices: number[],  entries: ResultEntry[] }
    export const empty: Result = { kind: 'empty' };
    export function error(message: string): Result { return { kind: 'error', message } };
}

export namespace ResultEntry {
    export function focus(plugin: LiteMol.Plugin.Controller, set: ResultEntry) {
        const model = plugin.selectEntities('model');
        if (!model.length) return;

        const query = LiteMol.Core.Structure.Query.atomsFromIndices(set.indices).compile();
        plugin.command(LiteMol.Bootstrap.Command.Molecule.FocusQuery, { query, model: model[0] as LiteMol.Bootstrap.Entity.Molecule.Model });
    }

    export function highlight(plugin: LiteMol.Plugin.Controller, set: ResultEntry, isOn: boolean) {
        const model = plugin.selectEntities('model');
        if (!model.length) return;

        const query = LiteMol.Core.Structure.Query.atomsFromIndices(set.indices).compile();
        plugin.command(LiteMol.Bootstrap.Command.Molecule.Highlight, { query, model: model[0] as LiteMol.Bootstrap.Entity.Molecule.Model, isOn });
    }

    export function showCIF(model: Model, set: ResultEntry) {
        const cif = btoa(mmCIFwriter(model, set.indices));
        const uri = 'data:text/plain;base64,' + cif;
        const a = document.createElement('a');
        if ('download' in a) {
            a.style.visibility = 'hidden';
            a.href = uri;
            a.target = '_blank';
            a.download = 'atomset.cif';
            document.body.appendChild(a);
            a.click();
            a.remove()
        } else {
            window.open(uri, '_blank');
        }
    }
}


export default Result