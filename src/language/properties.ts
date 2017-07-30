/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

export type StaticAtomProperties = keyof typeof StaticAtomProperties
export const StaticAtomProperties = {
    'group_PDB': '',
    'id': '',
    'type_symbol': '',
    'label_atom_id': '',
    'label_alt_id': '',
    'label_comp_id': '',
    'label_asym_id': '',
    'label_entity_id': '',
    'label_seq_id': '',
    'pdbx_PDB_ins_code': '',
    'pdbx_formal_charge': '',
    'Cartn_x': '',
    'Cartn_y': '',
    'Cartn_z': '',
    'occupancy': '',
    'B_iso_or_equiv': '',
    'auth_atom_id': '',
    'auth_comp_id': '',
    'auth_asym_id': '',
    'auth_seq_id': '',
    'pdbx_PDB_model_num': '',

    'is-het': '',
    'operator-name': '',
    'secondary-structure-type': '',

    'atom-key': '',
    'residue-key': '',
    'chain-key': '',
    'entity-key': '',

    'is-ligand': '',
    'ligand-key': ''
}

export const SecondaryStructureTypes = {
    'sheet': '',
    'helix': '',
    'turn': '',
    'none': ''
};