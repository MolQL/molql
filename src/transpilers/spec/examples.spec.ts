/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import 'jasmine'

import Transpiler from '../transpiler'
import compile from '../../reference-implementation/molql/compiler'

import transpilers from '../all'

function testTranspilerExamples(name: string, transpiler: Transpiler) {
    describe(`${name} examples`, () => {
        const examples = require(`../${name}/examples`).default;
        for (const e of examples) {
            it(e.name, () => {
                // check if it transpiles and compiles/typechecks.
                const expr = transpiler(e.value);
                compile(expr);
            });
        }
    });
}

testTranspilerExamples('molql-script', transpilers.molQLscript);
testTranspilerExamples('pymol', transpilers.pymol);
testTranspilerExamples('vmd', transpilers.vmd);
testTranspilerExamples('jmol', transpilers.jmol);
testTranspilerExamples('json', transpilers.json);