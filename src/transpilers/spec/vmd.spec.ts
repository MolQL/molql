/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import 'jasmine'

import * as u from './utils'
import transpiler from '../vmd/parser'
import keywords from '../vmd/keywords'
import properties from '../vmd/properties'
import operators from '../vmd/operators'

describe('vmd-keywords', () => u.testKeywords(keywords, transpiler));
describe('vmd-properties',() => u.testProperties(properties, transpiler));
describe('vmd-operators', () => u.testOperators(operators, transpiler));