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
    name: 'Atoms heavier than 20',
    value: 'mass > 20'
}, {
    name: 'Atoms with two bonds',
    value: 'numbonds = 2'
}, {
    name: 'Atoms with an absolute charge greater 1',
    value: 'abs(charge) > 1'
}, {
    name: 'Atoms with an x coordinate between -25 and -20',
    value: 'x < -20 and x > -25'
}, {
    name: 'Helices',
    value: 'structure H'
}, {
    name: 'Atoms with name "A 1"',
    value: "name 'A 1'"
}, {
    name: 'Atoms with name "A *"',
    value: "name 'A *'"
}, {
    name: 'Atoms with names starting with C',
    value: 'name "C.*"'
}, {
    name: 'Atoms within 10 ang of [25, 15, 10]',
    value: 'sqr(x+25)+sqr(y+15)+sqr(z+10) <= sqr(10)'
}/*, {
    name: '',
    value: 'mass 5 to 11.5'
}, {
    name: 'Residues ala, arg, asn, asp, cys, and tyr',
    value: 'resname ALA to CYS TYR'
}, {
    name: '',
    value: 'within 5 of name FE'
}, {
    name: '',
    value: 'protein within 5 of nucleic'
}, {
    name: '',
    value: 'same resname as (protein within 5 of nucleic)'
}*/]