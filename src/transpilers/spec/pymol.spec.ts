/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import 'jasmine'

import * as u from './utils'
import transpiler from '../pymol/parser'
import keywords from '../pymol/keywords'
import properties from '../pymol/properties'
import operators from '../pymol/operators'
import compile from '../../reference-implementation/molql/compiler'

const macros = {
    supported: [
        '10/cb',
        'a/10-12/ca',
        'lig/b/6+8/c+o',
    ],
    unsupported: [
        'pept/enz/c/3/n',
        'pept/enz///n',

        '/pept/lig/',
        '/pept/lig/a',
        '/pept/lig/a/10',
        '/pept/lig/a/10/ca',
        '/pept//a/10',
    ]
}

describe('pymol macros', () => {
    macros.supported.forEach(str => {
        it(str, () => {
            const expr = transpiler(str);
            compile(expr);
        });
    })
    macros.unsupported.forEach(str => {
        it(str, () => {
            expect(() => transpiler(str)).toThrow()
        });
    })
});

describe('pymol keywords', () => u.testKeywords(keywords, transpiler));
describe('pymol properties', () => u.testProperties(properties, transpiler));
describe('pymol operators', () => u.testOperators(operators, transpiler));