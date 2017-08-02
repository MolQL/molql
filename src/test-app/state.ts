/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import LiteMol from 'litemol'
import Expression from '../mini-lisp/expression'
import { Model } from '../reference-implementation/molecule/data'
import AtomSelection from '../reference-implementation/mol-ql/data/atom-selection'
import AtomSet from '../reference-implementation/mol-ql/data/atom-set'
import parseCIF from '../reference-implementation/molecule/parser'
import compile, { Compiled } from '../reference-implementation/mol-ql/compiler'
import mmCIFwriter from '../reference-implementation/molecule/writer'
import Context from '../reference-implementation/mol-ql/runtime/context'

import Language, { Example } from './languages/language'
import Languages from './languages'

import Rx = LiteMol.Core.Rx
import Transformer = LiteMol.Bootstrap.Entity.Transformer

export interface MoleculeData {
    data: string,
    model: Model
}

export type Query =
    | { kind: 'ok', sourceLanguage: string, text: string, expression: Expression, compiled: Compiled<AtomSelection> }
    | { kind: 'error', message: string }

class State {
    queryString = new Rx.BehaviorSubject<string>('');

    fullPlugin: LiteMol.Plugin.Controller;
    resultPlugin: LiteMol.Plugin.Controller;

    // formattedQuery: Rx.Subject<string> = new Rx.BehaviorSubject('');

    query = new Rx.BehaviorSubject<Query>({ kind: 'error', message: 'Enter query' });
    compileTarget = new Rx.BehaviorSubject<'lisp' | 'json'>('lisp');
    currentLanguage = new Rx.BehaviorSubject<{ language: Language, example: Example | undefined }>({ language: Languages[0], example: Languages[0].examples[0] });

    pdbId = '1tqn';
    moleculeData: MoleculeData | undefined = void 0;
    loaded = new Rx.BehaviorSubject<boolean>(false);

    queryResultCIF = new Rx.BehaviorSubject<string>('');

    async loadMolecule() {
        try {
            this.fullPlugin.clear();
            this.resultPlugin.clear();
            this.queryResultCIF.onNext('');

            const data = await LiteMol.Bootstrap.Utils.ajaxGetString(`https://webchem.ncbr.muni.cz/CoordinateServer/${this.pdbId}/full`).run(this.fullPlugin.context);

            const main = this.fullPlugin;
            const t = this.fullPlugin.createTransform();
            t.add(main.context.tree.root, Transformer.Data.FromData, { data })
                .then(Transformer.Data.ParseCif, {})
                .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, {})
                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, {})
                .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: true }, {})

            await main.applyTransform(t);
            const model = parseCIF(data).models[0];
            this.moleculeData = { data, model };
            this.loaded.onNext(true);
        } catch (e) {
            console.error(e);
            this.loaded.onNext(false);
        }
    }

    execute() {
        try {
            this.resultPlugin.clear();
            this.queryResultCIF.onNext('');

            const query = this.query.getValue();
            if (query.kind !== 'ok') return;

            const model = this.moleculeData!.model;

            const ctx = Context.ofModel(model);
            const res = query.compiled(ctx);
            const cif = mmCIFwriter(model, AtomSet.atomIndices(AtomSelection.toAtomSet(res)));

            this.queryResultCIF.onNext(cif);

            const queryP = this.resultPlugin;
            const tQ = queryP.createTransform();
            tQ.add(queryP.context.tree.root, Transformer.Data.FromData, { data: cif })
                .then(Transformer.Data.ParseCif, {})
                .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, {})
                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, {})
                .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {});
            queryP.applyTransform(tQ);
        } catch (e) {
            this.queryResultCIF.onNext(`Error: ${e}`);
        }
    }

    private parseQuery(text: string) {
        if (!text) {
            this.query.onNext({ kind: 'error', message: 'Enter query' });
            return;
        }
        try {
            const transpiler = this.currentLanguage.getValue().language.transpiler;
            const expression = transpiler(text);
            const compiled = compile<AtomSelection>(expression);
            this.query.onNext({ kind: 'ok', sourceLanguage: 'json', text, expression, compiled });
        } catch (e) {
            this.query.onNext({ kind: 'error', message: '' + e });
        }
    }

    constructor() {
        this.queryString.distinctUntilChanged().debounce(350).subscribe(s => this.parseQuery(s));
        this.currentLanguage.subscribe(l => this.queryString.onNext(l.example ? l.example.value : ''));
    }
}

export default State