/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import 'jasmine'

import transpiler from '../molql-script/parser'
import examples from '../molql-script/examples'
import compile from '../../reference-implementation/molql/compiler'

describe('molql-script', () => {
    for (const e of examples) {
        it(e.name, () => {
            // check if it transpiles and compiles/typechecks.
            const expr = transpiler(e.value);
            compile(expr);
        });
    }
});