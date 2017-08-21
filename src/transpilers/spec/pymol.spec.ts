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

describe('pymol-keywords', () => u.testKeywords(keywords, transpiler));
describe('pymol-properties', () => u.testProperties(properties, transpiler));
describe('pymol-operators', () => u.testOperators(operators, transpiler));