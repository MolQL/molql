/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import 'jasmine'

import B from '../../molql/builder'
import transpiler from '../pymol/parser'

describe('pymol', () => {
  it('resn ALA', function() {
    const q = B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('label_comp_id'), 'ALA']) });
    const tq = transpiler('resn ALA');
    expect(tq).toBe(q);
  });
});