/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import LiteMol from 'litemol'
import Expression from '../mini-lisp/expression'
import { Model } from '../reference-implementation/structure/data'
import AtomSelection from '../reference-implementation/molql/data/atom-selection'
import parseCIF from '../reference-implementation/structure/parser'
import compile, { Compiled } from '../reference-implementation/molql/compiler'
import Context from '../reference-implementation/molql/runtime/context'

import Result from './Result'
import Language, { Example } from './languages/language'
import Languages from './languages'

import Rx = LiteMol.Core.Rx
import Transformer = LiteMol.Bootstrap.Entity.Transformer

export interface StructureData {
    data: string,
    model: Model
}

export type Query =
    | { kind: 'ok', sourceLanguage: string, text: string, expression: Expression, compiled: Compiled<AtomSelection> }
    | { kind: 'error', message: string }

class State {
    queryString = new Rx.BehaviorSubject<string>('');

    plugin: LiteMol.Plugin.Controller;

    query = new Rx.BehaviorSubject<Query>({ kind: 'error', message: 'Enter query' });
    compileTarget = new Rx.BehaviorSubject<'lisp' | 'json'>('lisp');
    currentLanguage = new Rx.BehaviorSubject<{ language: Language, example: Example | undefined }>({ language: Languages[0], example: Languages[0].examples[0] });

    pdbId = '1tqn';
    structureData: StructureData | undefined = void 0;
    loaded = new Rx.BehaviorSubject<boolean>(false);

    currentSymbol = new Rx.BehaviorSubject<string>('');
    editorActive = new Rx.BehaviorSubject<boolean>(false);

    queryResult = new Rx.BehaviorSubject<Result>(Result.empty);

    async loadStructure() {
        try {
            this.plugin.clear();
            this.plugin.clear();
            this.queryResult.onNext(Result.empty);

            const plugin = this.plugin;
            let url = `https://webchem.ncbr.muni.cz/CoordinateServer/${this.pdbId}/full`;
            const data = await LiteMol.Bootstrap.Utils.ajaxGetString(url).run(plugin.context);

            const t = plugin.createTransform();
            t.add(plugin.context.tree.root, Transformer.Data.FromData, { data })
                .then(Transformer.Data.ParseCif, {})
                .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, {})
                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { ref: 'model' })
                .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: true, groupRef: 'cartoons' })

            await plugin.applyTransform(t);
            const model = parseCIF(data).models[0];
            this.structureData = { data, model };
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

            this.plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, 'selection');
            this.plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, 'cartoons');
            this.queryResult.onNext(Result.empty);

            const model = this.structureData!.model;

            const ctx = Context.ofModel(model);
            const selection = query.compiled(ctx);

            const lang = this.currentLanguage.getValue().language;
            const result = Result(model, selection, lang.mergeSelection);
            this.queryResult.onNext(result);

            const queryP = this.plugin;
            const tQ = queryP.createTransform();

            if (!this.plugin.selectEntities('background').length) {
                const backgroundStyle: LiteMol.Bootstrap.Visualization.Molecule.Style<LiteMol.Bootstrap.Visualization.Molecule.BallsAndSticksParams> = {
                    type: 'BallsAndSticks',
                    taskType: 'Silent',
                    params: { useVDW: false, atomRadius: 0.10, bondRadius: 0.05, detail: 'Automatic' },
                    theme: { template: LiteMol.Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate, colors: LiteMol.Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', { r: 0.2, g: 0.2, b: 0.2 }), transparency: { alpha: 0.1 } },
                    isNotSelectable: true
                }

                tQ.add('model', Transformer.Molecule.CreateVisual, { style: backgroundStyle }, { ref: 'background' });
            }

            tQ.add('model', Transformer.Molecule.CreateSelectionFromQuery, { query: LiteMol.Core.Structure.Query.atomsFromIndices(result.allIndices) }, { ref: 'selection' })
                .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {});

            queryP.applyTransform(tQ);
        } catch (e) {
            console.error(e);
            this.queryResult.onNext(Result.error(e.message));
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
            const compiled = compile(expression, 'query');
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