Molecule
========

A list of one or more models.

Model
=====

The model representation is based on the data structure of the mmCIF format.

Model is a 4-layer tree structure with these layers:

1. **Entities**
    - Cooresponds to all atoms that have the same ``atom_site.label_entity_id`` property.
    - For models that do not have the concept of entities ``atom_site.label_entity_id = null``
2. **Chains**
    - Cooresponds to all atoms that have the same ``(atom_site.label_entity_id, atom_site.auth_asym_id)`` property.
    - Again, for models without the concept of entity, ``atom_site.label_asym_id`` can be ``null``.
3. **Residues**
    - Cooresponds to all atoms that have the same ``(atom_site.label_entity_id, atom_site.auth_asym_id, atom_site.auth_seq_id, atom_site.pdbx_PDB_ins_code)`` property.
    - No residue concept is equivalent to ``atom_site.auth_seq_id = 0``, ``atom_site.pdbx_PDB_ins_code = null`` 
4. **Atoms**
    - Individual atoms within a single residue.

## Atom attributes

- Each layer has a corresponding "key" attibute assigned to an atom that uniquely identifies it. This is most useful in grouping atoms together.
- Atoms have properties defined by the  "atom_site" columns in mmCIF format.

## "Structure determination"

- Secondary Structure: Same information as provided by mmCIF (helices, sheets, turns, what have you).
- Main Sequence: Amino acid, nucleotide or "modified residue". Must be at least 10 AMK or 2 nucleotide long.
- Water: anything that belongs to "water entity" or has residue name HOH or SOL or ?.
- Ligand: not water or main sequence.


Selections
==========

## Atoms

Atom selection is a sequence of unique atom sets. At the type level:

```ts
type AtomSet = Set<number>
type AtomSelection = Sequence<AtomSet>
```

The reason for this seemingly complicated approach is that much larger class of individual queries can be composed into a single 
expression without introducing state. Moreover, this approach conservers atom grouping introduced by the selection operators.

For example, the query "All pairs of calcium atoms that are no more than 4ang apart and surrouding residues that contain at least one pyran or furan ring."
would yield a selection that would contain a separate atom set for each such "atomic pattern".

## Regions

*Suggested feature*

The language will support selections of arbitrary spatial regions in the "molecular space":

```ts
type Region = Sphere | ConvexPolyhedron | ....
type RegionSelection = Sequence<Region>
```

It will be possible to combine regions similar to how "atom sets" are combined, and combine regions to atoms sets and vice versa.

A simple use case is to annotate a sphere (or a union of spheres) as a binding site of ligand. 

## Sequences

The same approach as for atoms and regions will be available for "sequence-level" data.