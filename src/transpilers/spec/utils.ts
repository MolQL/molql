/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import 'jasmine'

import Transpiler from '../transpiler'
import { KeywordDict, PropertyDict, OperatorList } from '../types'
import compile from '../../reference-implementation/molql/compiler'

export function testKeywords(keywords: KeywordDict, transpiler: Transpiler) {
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
}

export function testProperties(properties: PropertyDict, transpiler: Transpiler) {
    for (const name in properties) {
        const p = properties[name]
        p['@examples'].forEach(example => {
            it(name, () => {
                if (!p.isUnsupported) {
                    const expr = transpiler(example);
                    compile(expr);
                } else {
                    expect(() => transpiler(example)).toThrow()
                }
            })
        })
        it(name, () => {
            if (!p['@examples'].length) {
                throw Error(`'${name}' property has no example(s)`)
            }
        });
    }
}

export function testOperators(operators: OperatorList, transpiler: Transpiler) {
    operators.forEach( o => {
        o['@examples'].forEach(example => {
            it(o.name, () => {
                if (!o.isUnsupported) {
                    const expr = transpiler(example);
                    compile(expr);
                } else {
                    expect(() => transpiler(example)).toThrow()
                }
            })
        })
        it(o.name, () => {
            if (!o['@examples'].length) {
                throw Error(`'${o.name}' operator has no example(s)`)
            }
        });
    })
}