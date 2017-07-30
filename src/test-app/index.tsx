import LiteMol from 'litemol'
import State from './state'
import UI from './ui'

import React = LiteMol.Plugin.React

const state = State()
LiteMol.Plugin.ReactDOM.render(<UI state={state} />, document.getElementById('app'));

// import { Model } from '../reference-implementation/molecule/data'
// import parseCIF from '../reference-implementation/molecule/parser'
// import B from '../reference-implementation/utils/expression-builder'
// import compile from '../reference-implementation/compiler/compiler'
// import AtomSet from '../reference-implementation/query/atom-set'
// import AtomSelection from '../reference-implementation/query/atom-selection'
// import mmCIFwriter from '../reference-implementation/molecule/writer'
// import Environment from '../reference-implementation/runtime/environment'
// import Context from '../reference-implementation/query/context'

// const plugin = LiteMol.Plugin.create({ target: '#app', layoutState: { hideControls: true } });
// plugin.loadMolecule({ format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF, url: 'https://webchem.ncbr.muni.cz/CoordinateServer/1tqn/full' });

// async function query() {
//     const data = await LiteMol.Bootstrap.Utils.ajaxGetString('https://webchem.ncbr.muni.cz/CoordinateServer/1tqn/full').run(plugin.context);

//     const model = parseCIF(data).models[0];

//     const es = (s: string) => B.Struct.ctor(c => c.elementSymbol, s)

//     const fe = B.Struct.gen(
//         g => g.atomGroups,
//         true, // entity
//         true, // chain
//         true, // residue
//         B.set(e => e.has, B.ctor(c => c.set, es('FE')), B.Struct.atomProperty('type_symbol')), // atom
//         B.Struct.atomProperty('residue-key') // group by
//     );
//     const q = B.Struct.modifier(m => m.includeSurroundings, fe, 5, true);
//     const ctx = Context.ofModel(model);
//     const env = Environment(ctx);
//     const r = compile<AtomSelection>(q);
//     const res = r(env);
//     const cif = mmCIFwriter(model, AtomSet.atomIndices(AtomSelection.toAtomSet(res)));

//     console.log(cif);
// }

// query();