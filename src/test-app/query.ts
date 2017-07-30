import LiteMol from 'litemol'
import State from './state'

import Expression from '../language/expression'
import { Model } from '../reference-implementation/molecule/data'
import parseCIF from '../reference-implementation/molecule/parser'
import B from '../reference-implementation/utils/expression-builder'
import compile from '../reference-implementation/compiler/compiler'
import AtomSet from '../reference-implementation/query/atom-set'
import AtomSelection from '../reference-implementation/query/atom-selection'
import mmCIFwriter from '../reference-implementation/molecule/writer'
import Environment from '../reference-implementation/runtime/environment'
import Context from '../reference-implementation/query/context'
import lispFormat from '../reference-implementation/utils/expression-lisp-formatter'

import Transformer = LiteMol.Bootstrap.Entity.Transformer

export default async function query(state: State) {
    const data = await LiteMol.Bootstrap.Utils.ajaxGetString('https://webchem.ncbr.muni.cz/CoordinateServer/1tqn/full').run(state.fullPlugin.context);

    const main = state.fullPlugin;
    const t = state.fullPlugin.createTransform();
    t.add(main.context.tree.root, Transformer.Data.FromData, { data })
        .then(Transformer.Data.ParseCif, { })
        .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { })
        .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, {})
        .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: true }, {})

    main.applyTransform(t);

    const model = parseCIF(data).models[0];

    const es = (s: string) => B.Struct.ctor(c => c.elementSymbol, s)

    // const fe = B.Struct.gen(
    //     g => g.atomGroups,
    //     true, // entity
    //     true, // chain
    //     true, // residue
    //     B.set(e => e.has, B.ctor(c => c.set, es('FE')), B.Struct.atomProperty('type_symbol')), // atom
    //     B.Struct.atomProperty('residue-key') // group by
    // );
    console.log('qs', state.queryString);
    const q = JSON.parse(state.queryString) as Expression;
    console.log(q);
    //B.Struct.modifier(m => m.includeSurroundings, fe, 5, true);
    const ctx = Context.ofModel(model);
    const env = Environment(ctx);
    const r = compile<AtomSelection>(q);
    const res = r(env);
    const cif = mmCIFwriter(model, AtomSet.atomIndices(AtomSelection.toAtomSet(res)));

    const queryP = state.resultPlugin;
    const tQ = queryP.createTransform();
    tQ.add(queryP.context.tree.root, Transformer.Data.FromData, { data: cif })
        .then(Transformer.Data.ParseCif, { })
        .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { })
        .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, {})
        .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {});
    queryP.applyTransform(tQ);
    console.log(cif);

    state.formattedQuery.onNext(lispFormat(q));
}