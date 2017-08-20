/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import 'jasmine'

import transpiler from '../pymol/parser'
import examples from '../pymol/examples'
import keywords from '../pymol/keywords'
import properties from '../pymol/properties'
import operators from '../pymol/operators'
import compile from '../../reference-implementation/molql/compiler'

describe('pymol-examples', () => {
    for (const e of examples) {
        it(e.name, () => {
            // check if it transpiles and compiles/typechecks.
            const expr = transpiler(e.value);
            compile(expr);
        });
    }
});

describe('pymol-keywords', () => {
    for (const name in keywords) {
        it(name, () => {
            const k = keywords[name]
            if (k.map) {
                const expr = transpiler(name);
                compile(expr);
                expect(expr).toEqual(k.map());
            } else {
                expect(() => transpiler(name)).toThrow()
            }
        });
    }
});

describe('pymol-properties', () => {
    for (const name in properties) {
        it(name, () => {
            const p = properties[name]
            p['@examples'].forEach(example => {
                if (!p.isUnsupported) {
                    const expr = transpiler(example);
                    compile(expr);
                } else {
                    expect(() => transpiler(example)).toThrow()
                }
            })
            if (!p['@examples'].length) {
                throw Error(`'${name}' property has no example(s)`)
            }
        });
    }
});

describe('pymol-operators', () => {
    operators.forEach( o => {
        it(o.name, () => {
            o['@examples'].forEach(example => {
                if (!o.isUnsupported) {
                    const expr = transpiler(example);
                    compile(expr);
                } else {
                    expect(() => transpiler(example)).toThrow()
                }
            })
            if (!o['@examples'].length) {
                throw Error(`'${o.name}' operator has no example(s)`)
            }
        });
    })
});