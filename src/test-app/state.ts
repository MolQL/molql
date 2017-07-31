import LiteMol from 'litemol'
import Expression from '../language/expression'
import { Model } from '../reference-implementation/molecule/data'
import parseCIF from '../reference-implementation/molecule/parser'
import RuntimeExpression from '../reference-implementation/runtime/expression'
import lispFormat from '../reference-implementation/utils/expression-lisp-formatter'
import AtomSelection from '../reference-implementation/query/atom-selection'
import compile from '../reference-implementation/compiler/compiler'
import mmCIFwriter from '../reference-implementation/molecule/writer'
import Environment from '../reference-implementation/runtime/environment'
import Context from '../reference-implementation/query/context'
import AtomSet from '../reference-implementation/query/atom-set'

import Languages from './languages'

import Rx = LiteMol.Core.Rx
import Transformer = LiteMol.Bootstrap.Entity.Transformer



export interface MoleculeData {
    data: string,
    model: Model
}

export type Query =
    | { kind: 'ok', sourceLanguage: string, text: string, serialized: Expression.Serialized, compiled: RuntimeExpression<AtomSelection> }
    | { kind: 'error', message: string }

class State {
    queryString = new Rx.BehaviorSubject<string>(Languages);

    fullPlugin: LiteMol.Plugin.Controller;
    resultPlugin: LiteMol.Plugin.Controller;

    // formattedQuery: Rx.Subject<string> = new Rx.BehaviorSubject('');

    query = new Rx.BehaviorSubject<Query>({ kind: 'error', message: 'Enter query' });
    compileTarget = new Rx.BehaviorSubject<'lisp' | 'json'>('lisp');
    currentLanguage: Rx.Subject<string> = new Rx.BehaviorSubject('lisp');
    currentExample: Rx.Subject<string> = new Rx.BehaviorSubject('');

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
        this.resultPlugin.clear();
        this.queryResultCIF.onNext('');

        const query = this.query.getValue();
        if (query.kind !== 'ok') return;

        const model = this.moleculeData!.model;

        const ctx = Context.ofModel(model);
        const env = Environment(ctx);
        const res = query.compiled(env);
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

    }

    private parseQuery(text: string) {
        if (!text) {
            this.query.onNext({ kind: 'error', message: 'Enter query' });
            return;
        }
        try {
            const serialized = JSON.parse(text) as Expression.Serialized;
            const compiled = compile<AtomSelection>(serialized.expression);
            this.query.onNext({ kind: 'ok', sourceLanguage: 'json', text, serialized, compiled });
        } catch (e) {
            this.query.onNext({ kind: 'error', message: '' + e });
        }
    }

    constructor() {
        this.queryString.throttle(250).subscribe(s => this.parseQuery(s));
    }
}

export default State