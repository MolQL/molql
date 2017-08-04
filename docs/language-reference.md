
Language Reference
==================


   * [Language Primitives](#language-primitives)
     * [Types](#types)
     * [Logic](#logic)
     * [Control Flow](#control-flow)
     * [Math](#math)
     * [Relational](#relational)
     * [Strings](#strings)
     * [Sets](#sets)
     * [Maps](#maps)
   * [Structure Queries](#structure-queries)
     * [Types](#types)
     * [Generators](#generators)
     * [Selection Modifications](#selection-modifications)
     * [Selection Filters](#selection-filters)
     * [Selection Combinators](#selection-combinators)
     * [Atom Sets](#atom-sets)
       * [Atom Set Reducer](#atom-set-reducer)
     * [Atom Properties](#atom-properties)
       * [Core Properties](#core-properties)
       * [Macromolecular Properties (derived from the mmCIF format)](#macromolecular-properties-(derived-from-the-mmcif-format))
# Language Primitives

-------------------

## Types

-------------------

### **bool**
```
core.type.bool :: List [
  value
] => bool
```

### **num**
```
core.type.num :: List [
  value
] => number
```

### **str**
```
core.type.str :: List [
  value
] => string
```

### **regex**
```
core.type.regex :: List [
  string, 
  string
] => regex
```

*Creates a regular expression from a string using the ECMAscript syntax.*

### **list**
```
core.type.list :: List [
  value*
] => list
```

### **set**
```
core.type.set :: List [
  value*
] => set
```

### **map**
```
core.type.map :: List [
  value*
] => map
```

*Create a map from a list of key value pairs, e.g. (map 1 "x" 2 "y").*

## Logic

-------------------

### **not**
```
core.logic.not :: List [
  bool
] => bool
```

### **and**
```
core.logic.and :: List [
  bool*
] => bool
```

### **or**
```
core.logic.or :: List [
  bool*
] => bool
```

## Control Flow

-------------------

### **if**
```
core.ctrl.if :: Map {
  cond: bool, 
  if-true: value, 
  if-false: value
} => value
```

## Math

-------------------

### **add**
```
core.math.add :: List [
  number*
] => number
```

### **sub**
```
core.math.sub :: List [
  number*
] => number
```

### **mult**
```
core.math.mult :: List [
  number*
] => number
```

### **div**
```
core.math.div :: List [
  number, 
  number
] => number
```

### **pow**
```
core.math.pow :: List [
  number, 
  number
] => number
```

### **min**
```
core.math.min :: List [
  number*
] => number
```

### **max**
```
core.math.max :: List [
  number*
] => number
```

### **floor**
```
core.math.floor :: List [
  number
] => number
```

### **ceil**
```
core.math.ceil :: List [
  number
] => number
```

### **round-int**
```
core.math.round-int :: List [
  number
] => number
```

### **abs**
```
core.math.abs :: List [
  number
] => number
```

### **sqrt**
```
core.math.sqrt :: List [
  number
] => number
```

### **sin**
```
core.math.sin :: List [
  number
] => number
```

### **cos**
```
core.math.cos :: List [
  number
] => number
```

### **tan**
```
core.math.tan :: List [
  number
] => number
```

### **asin**
```
core.math.asin :: List [
  number
] => number
```

### **acos**
```
core.math.acos :: List [
  number
] => number
```

### **atan**
```
core.math.atan :: List [
  number
] => number
```

### **sinh**
```
core.math.sinh :: List [
  number
] => number
```

### **cosh**
```
core.math.cosh :: List [
  number
] => number
```

### **tanh**
```
core.math.tanh :: List [
  number
] => number
```

### **exp**
```
core.math.exp :: List [
  number
] => number
```

### **log**
```
core.math.log :: List [
  number
] => number
```

### **log10**
```
core.math.log10 :: List [
  number
] => number
```

### **atan2**
```
core.math.atan2 :: List [
  number, 
  number
] => number
```

## Relational

-------------------

### **eq**
```
core.rel.eq :: List [
  value, 
  value
] => bool
```

### **neq**
```
core.rel.neq :: List [
  value, 
  value
] => bool
```

### **lt**
```
core.rel.lt :: List [
  number, 
  number
] => bool
```

### **lte**
```
core.rel.lte :: List [
  number, 
  number
] => bool
```

### **gr**
```
core.rel.gr :: List [
  number, 
  number
] => bool
```

### **gre**
```
core.rel.gre :: List [
  number, 
  number
] => bool
```

### **in-range**
```
core.rel.in-range :: List [
  number (* Value to test *), 
  number (* Minimum value *), 
  number (* Maximum value *)
] => bool
```

*Check if the value of the 1st argument is >= 2nd and <= 3rd.*

## Strings

-------------------

### **concat**
```
core.str.concat :: List [
  string*
] => string
```

### **match**
```
core.str.match :: List [
  regex, 
  string
] => bool
```

## Sets

-------------------

### **has**
```
core.set.has :: List [
  set, 
  value
] => bool
```

## Maps

-------------------

### **has**
```
core.map.has :: List [
  map, 
  value
] => bool
```

### **get**
```
core.map.get :: List [
  map, 
  value, 
  value (* Default value if key is not present. *)
] => value
```

# Structure Queries

-------------------

## Types

-------------------

### **element-symbol**
```
structure.type.element-symbol :: List [
  string
] => element-symbol
```

### **auth-residue-id**
```
structure.type.auth-residue-id :: List [
  string (* auth_asym_id *), 
  number (* auth_seq_id *), 
  string (* pdbx_PDB_ins_code *)
] => residue-id
```

### **label-residue-id**
```
structure.type.label-residue-id :: List [
  string (* label_entity_id *), 
  string (* label_asym_id *), 
  number (* label_auth_seq_id *), 
  string (* pdbx_PDB_ins_code *)
] => residue-id
```

## Generators

-------------------

### **atom-groups**
```
structure.generator.atom-groups :: Map {
  entity-test?: bool = true, 
  chain-test?: bool = true, 
  residue-test?: bool = true, 
  atom-test?: bool = true, 
  group-by?: value = (atom-property.core.atom-key)
} => atom-selection
```

### **query-selection**
```
structure.generator.query-selection :: Map {
  selection: atom-selection, 
  query: atom-selection, 
  in-complement?: bool = false
} => atom-selection
```

*Executes query only on atoms that are in the source selection.*

## Selection Modifications

-------------------

### **query-each**
```
structure.modifier.query-each :: Map {
  selection: atom-selection, 
  query: atom-selection, 
  whole-residues?: bool
} => atom-selection
```

### **intersect-by**
```
structure.modifier.intersect-by :: Map {
  selection: atom-selection, 
  by: atom-selection
} => atom-selection
```

*Intersect each atom set from the first sequence from atoms in the second one.*

### **except-by**
```
structure.modifier.except-by :: Map {
  selection: atom-selection, 
  by: atom-selection
} => atom-selection
```

*Remove all atoms from 'selection' that occur in 'by'.*

### **union-by**
```
structure.modifier.union-by :: Map {
  selection: atom-selection, 
  by: atom-selection
} => atom-selection
```

*For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.*

### **union**
```
structure.modifier.union :: Map {
  selection: atom-selection
} => atom-selection
```

*Collects all atom sets in the sequence into a single atom set.*

### **cluster**
```
structure.modifier.cluster :: Map {
  selection: atom-selection, 
  min-radius: number, 
  max-radius: number, 
  minimum-size?: number = 2 (* Minimal number of sets to merge. Must be at least 2. *), 
  maximum-size?: number (* Maximal number of sets to merge. Is no set, no limit. *)
} => atom-selection
```

*Combines atom sets that have mutual distance in the interval [min-radius, max-radius]. Minimum/maximum size determines how many atom sets can be combined.*

### **include-surroundings**
```
structure.modifier.include-surroundings :: Map {
  selection: atom-selection, 
  radius: number, 
  as-whole-residues?: bool
} => atom-selection
```

## Selection Filters

-------------------

### **pick**
```
structure.filter.pick :: Map {
  selection: atom-selection, 
  test: bool
} => atom-selection
```

*Pick all atom sets that satisfy the test.*

### **with-same-properties**
```
structure.filter.with-same-properties :: Map {
  selection: atom-selection, 
  source: atom-selection, 
  property: value
} => atom-selection
```

### **within**
```
structure.filter.within :: Map {
  selection: atom-selection, 
  target: atom-selection, 
  radius: number
} => atom-selection
```

*All atom sets from section that are within the radius of any atom from target*

## Selection Combinators

-------------------

### **intersect**
```
structure.combinator.intersect :: List [
  atom-selection*
] => atom-selection
```

*Return all unique atom sets that appear in all of the source selections.*

### **merge**
```
structure.combinator.merge :: List [
  atom-selection*
] => atom-selection
```

*Merges multiple selections into a single one. Only unique atom sets are kept.*

### **near**
```
structure.combinator.near :: List [
  number (* radius *), 
  atom-selection*
] => atom-selection
```

*Pick combinations of atom sets from the source sequences that are mutually no more than radius apart.*

## Atom Sets

-------------------

### **atom-count**
```
structure.atom-set.atom-count :: ()
   => number
```

### **count-selection**
```
structure.atom-set.count-selection :: Map {
  query: atom-selection
} => number
```

*Counts the number of occurences of a specific query inside the current atom set.*

## Atom Set Reducer

-------------------

### **accumulator**
```
structure.atom-set.reduce.accumulator :: List [
  value (* Initial value. *), 
  value (* Atom expression executed for each atom in the set. *)
] => value
```

### **value**
```
structure.atom-set.reduce.value :: ()
   => value
```

*Current value of the reducer.*

## Atom Properties

-------------------

## Core Properties

-------------------

### **element-symbol**
```
structure.atom-property.core.element-symbol :: ()
   => element-symbol
```

### **x**
```
structure.atom-property.core.x :: ()
   => number
```

*Cartesian X coordinate.*

### **y**
```
structure.atom-property.core.y :: ()
   => number
```

*Cartesian Y coordinate.*

### **z**
```
structure.atom-property.core.z :: ()
   => number
```

*Cartesian Z coordinate.*

### **atom-key**
```
structure.atom-property.core.atom-key :: ()
   => value
```

*Unique value for each atom. Main use case is grouping of atoms.*

## Macromolecular Properties (derived from the mmCIF format)

-------------------

### **auth-residue-id**
```
structure.atom-property.macromolecular.auth-residue-id :: ()
   => residue-id
```

*type.authResidueId symbol executed on current atom's residue.*

### **label-residue-id**
```
structure.atom-property.macromolecular.label-residue-id :: ()
   => residue-id
```

*type.labelResidueId symbol executed on current atom's residue.*

### **residue-key**
```
structure.atom-property.macromolecular.residue-key :: ()
   => value
```

*Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``. Main use case is grouping of atoms.*

### **chain-key**
```
structure.atom-property.macromolecular.chain-key :: ()
   => value
```

*Unique value for each tuple ``(label_entity_id,auth_asym_id)``. Main use case is grouping of atoms.*

### **entity-key**
```
structure.atom-property.macromolecular.entity-key :: ()
   => value
```

*Unique value for each tuple ``label_entity_id``. Main use case is grouping of atoms.*

### **is-het**
```
structure.atom-property.macromolecular.is-het :: ()
   => number
```

*Equivalent to atom_site.group_PDB !== ATOM*

### **id**
```
structure.atom-property.macromolecular.id :: ()
   => number
```

### **label_atom_id**
```
structure.atom-property.macromolecular.label_atom_id :: ()
   => string
```

### **label_alt_id**
```
structure.atom-property.macromolecular.label_alt_id :: ()
   => string
```

### **label_comp_id**
```
structure.atom-property.macromolecular.label_comp_id :: ()
   => string
```

### **label_asym_id**
```
structure.atom-property.macromolecular.label_asym_id :: ()
   => string
```

### **label_entity_id**
```
structure.atom-property.macromolecular.label_entity_id :: ()
   => string
```

### **label_seq_id**
```
structure.atom-property.macromolecular.label_seq_id :: ()
   => number
```

### **auth_atom_id**
```
structure.atom-property.macromolecular.auth_atom_id :: ()
   => string
```

### **auth_comp_id**
```
structure.atom-property.macromolecular.auth_comp_id :: ()
   => string
```

### **auth_asym_id**
```
structure.atom-property.macromolecular.auth_asym_id :: ()
   => string
```

### **auth_seq_id**
```
structure.atom-property.macromolecular.auth_seq_id :: ()
   => number
```

### **pdbx_PDB_ins_code**
```
structure.atom-property.macromolecular.pdbx_PDB_ins_code :: ()
   => string
```

### **pdbx_formal_charge**
```
structure.atom-property.macromolecular.pdbx_formal_charge :: ()
   => number
```

### **occupancy**
```
structure.atom-property.macromolecular.occupancy :: ()
   => number
```

### **B_iso_or_equiv**
```
structure.atom-property.macromolecular.B_iso_or_equiv :: ()
   => number
```

