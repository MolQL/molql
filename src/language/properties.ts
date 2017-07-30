/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

export type StaticAtomProperties = keyof typeof StaticAtomProperties
export const StaticAtomProperties = {
    'group_PDB': 'Same as mmCIF',
    'id': 'Same as mmCIF',
    'type_symbol': 'Same as mmCIF',
    'label_atom_id': 'Same as mmCIF. For non mmCIF, same always as auth_ variant.',
    'label_alt_id': 'Same as mmCIF.',
    'label_comp_id': 'Same as mmCIF. For non mmCIF, same always as auth_ variant.',
    'label_asym_id': 'Same as mmCIF. For non mmCIF, same always as auth_ variant.',
    'label_entity_id': 'Same as mmCIF',
    'label_seq_id': 'Same as mmCIF. For non mmCIF, same always as auth_ variant.',
    'pdbx_PDB_ins_code': 'Same as mmCIF',
    'pdbx_formal_charge': 'Same as mmCIF',
    'Cartn_x': 'Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in future.',
    'Cartn_y': 'Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in future.',
    'Cartn_z': 'Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in future.',
    'occupancy': 'Same as mmCIF',
    'B_iso_or_equiv': 'Same as mmCIF',
    'auth_atom_id': 'Same as mmCIF',
    'auth_comp_id': 'Same as mmCIF',
    'auth_asym_id': 'Same as mmCIF',
    'auth_seq_id': 'Same as mmCIF',
    'pdbx_PDB_model_num': 'Same as mmCIF',

    'is-het': 'Same as ``group_PDB != ATOM``.',

    //'operator-name': 'Same as mmCIF',
    //'secondary-structure-type': 'Same as mmCIF',

    'atom-key': 'Unique value for each atom.',
    'residue-key': 'Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``.',
    'chain-key': 'Unique value for each tuple ``(label_entity_id,auth_asym_id)``.',
    'entity-key': 'Unique value for each tuple ``label_entity_id``.',

    //'is-ligand': 'Same as mmCIF',
    //'ligand-key': 'Same as mmCIF',
    // 'connected-component-key'
}

export const SecondaryStructureTypes = {
    'sheet': 'Same as mmCIF',
    'helix': 'Same as mmCIF',
    'turn': 'Same as mmCIF',
    'none': 'Same as mmCIF'
};