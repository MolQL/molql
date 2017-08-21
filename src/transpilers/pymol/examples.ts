/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */

export default [{
    name: 'ALA residues',
    value: 'resn ALA'
}, {
    name: 'atoms named "C","O","N", or "CA"',
    value: 'name c+o+n+ca'
}, {
    name: 'residues with helix or sheet secondary structure',
    value: 'ss h+s'
}, {
    name: 'C-alpha atoms of residues 100 to 180 in chain A',
    value: 'A/100-180/CA'
}, {
    name: 'residues 100 to 180',
    value: 'resi 100-180'
}]