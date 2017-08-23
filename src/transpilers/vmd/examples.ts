/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

export default [{
    name: 'All water residues',
    value: 'water'
}, {
    name: 'All C-alpha atoms',
    value: 'name CA'
}, {
    name: 'Residue 35',
    value: 'resid 35'
}, {
    name: 'C-alpha atoms of ALA',
    value: 'name CA and resname ALA'
}, {
    name: 'Backbone atoms',
    value: 'backbone'
}, {
    name: 'Non-protein atoms',
    value: 'not protein'
}, {
    name: 'Protein backbone or hydrogen atoms',
    value: 'protein (backbone or name H)'
}, {
    name: 'Atoms lighter than 5',
    value: 'mass < 5'
}, {
    name: 'Atoms with two bonds',
    value: 'numbonds = 2'
}, {
    name: 'Atoms with an absolute charge greater 1',
    value: 'abs(charge) > 1'
}, {
    name: 'Atoms with an x coordinate between 3 and 6',
    value: 'x < 6 and x > 3'
}]