/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import LiteMol from 'litemol'
import Expression from '../mini-lisp/expression'
import { Model } from '../reference-implementation/molecule/data'
import AtomSelection from '../reference-implementation/molql/data/atom-selection'
import AtomSet from '../reference-implementation/molql/data/atom-set'
import parseCIF from '../reference-implementation/molecule/parser'
import compile, { Compiled } from '../reference-implementation/molql/compiler'
import mmCIFwriter from '../reference-implementation/molecule/writer'
import Context from '../reference-implementation/molql/runtime/context'

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

    currentSymbol = new Rx.BehaviorSubject<string>('');
    editorActive = new Rx.BehaviorSubject<boolean>(false);

    queryResult = new Rx.BehaviorSubject<{ kind: 'content' | 'error', content: string }>({ kind: 'content', content: 'No query executed yet...'});

    async loadMolecule() {
        try {
            this.fullPlugin.clear();
            this.resultPlugin.clear();
            this.queryResult.onNext({ kind: 'content', content: 'No query executed yet...'});

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
            const query = this.query.getValue();
            if (query.kind !== 'ok') return;

            this.resultPlugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, 'selection');
            this.queryResult.onNext({ kind: 'content', content: 'No query executed yet...'});

            const model = this.moleculeData!.model;

            const ctx = Context.ofModel(model);
            const res = query.compiled(ctx);
            const cif = mmCIFwriter(model, AtomSet.atomIndices(AtomSelection.toAtomSet(res)));

            this.queryResult.onNext({ kind: 'content', content: cif });

            const queryP = this.resultPlugin;
            const tQ = queryP.createTransform();

            if (!this.resultPlugin.selectEntities('whole').length) {
                const backgroundStyle: LiteMol.Bootstrap.Visualization.Molecule.Style<LiteMol.Bootstrap.Visualization.Molecule.BallsAndSticksParams> = {
                    type: 'BallsAndSticks',
                    taskType: 'Silent',
                    params: { useVDW: false, atomRadius: 0.10, bondRadius: 0.05, detail: 'Automatic' },
                    theme: { template: LiteMol.Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate, colors: LiteMol.Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', { r: 0.2, g: 0.2, b: 0.2 }), transparency: { alpha: 0.1 } },
                    isNotSelectable: true
                }

                tQ.add(queryP.context.tree.root, Transformer.Data.FromData, { data: this.moleculeData!.data }, { ref: 'whole' })
                    .then(Transformer.Data.ParseCif, {})
                    .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, {})
                    .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, {})
                    .then(Transformer.Molecule.CreateVisual, { style: backgroundStyle }, {});
            }

            tQ.add(queryP.context.tree.root, Transformer.Data.FromData, { data: cif }, { ref: 'selection' })
                .then(Transformer.Data.ParseCif, {})
                .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, {})
                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, {})
                .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {});

            queryP.applyTransform(tQ);
        } catch (e) {
            console.error(e);
            this.queryResult.onNext({ kind: 'error', content: '' + e.message });
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
        this.queryString.distinctUntilChanged().debounce(100).subscribe(s => this.parseQuery(s));
        this.currentLanguage.subscribe(l => this.queryString.onNext(l.example ? l.example.value : ''));
    }
}

export default State