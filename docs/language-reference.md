
Language Reference
==================


   * [Language Primitives](#language-primitives)
     * [Types](#types)
     * [Logic](#logic)
     * [Control Flow](#control-flow)
     * [Relational](#relational)
     * [Math](#math)
     * [Strings](#strings)
     * [Lists](#lists)
     * [Sets](#sets)
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
core.type.bool :: array [
  Value
] => Bool
```

*Convert a value to boolean.*

### **num**
```
core.type.num :: array [
  Value
] => Number
```

*Convert a value to number.*

### **str**
```
core.type.str :: array [
  Value
] => String
```

*Convert a value to string.*

### **regex**
```
core.type.regex :: array [
  String (* Expression *), 
  ?String (* Flags, e.g. 'i' for ignore case *)
] => Regex
```

*Creates a regular expression from a string using the ECMAscript syntax.*

### **list**
```
core.type.list :: array [
  a*
] => List[a]
```

### **set**
```
core.type.set :: array [
  a*
] => Set[a]
```

## Logic

-------------------

### **not**
```
core.logic.not :: array [
  Bool
] => Bool
```

### **and**
```
core.logic.and :: array [
  Bool+
] => Bool
```

### **or**
```
core.logic.or :: array [
  Bool+
] => Bool
```

## Control Flow

-------------------

### **hold**
```
core.ctrl.hold :: array [
  a
] => a
```

*Hold a value to be evaluated lazily.*

### **if**
```
core.ctrl.if :: array [
  Bool (* Condition *), 
  a (* If true *), 
  b (* If false *)
] => a | b
```

## Relational

-------------------

### **eq**
```
core.rel.eq :: array [
  a<Value>, 
  a<Value>
] => Bool
```

### **neq**
```
core.rel.neq :: array [
  a<Value>, 
  a<Value>
] => Bool
```

### **lt**
```
core.rel.lt :: array [
  Number, 
  Number
] => Bool
```

### **lte**
```
core.rel.lte :: array [
  Number, 
  Number
] => Bool
```

### **gr**
```
core.rel.gr :: array [
  Number, 
  Number
] => Bool
```

### **gre**
```
core.rel.gre :: array [
  Number, 
  Number
] => Bool
```

### **in-range**
```
core.rel.in-range :: array [
  Number (* Value to test *), 
  Number (* Minimum value *), 
  Number (* Maximum value *)
] => Bool
```

*Check if the value of the 1st argument is >= 2nd and <= 3rd.*

## Math

-------------------

### **add**
```
core.math.add :: array [
  Number+
] => Number
```

### **sub**
```
core.math.sub :: array [
  Number+
] => Number
```

### **mult**
```
core.math.mult :: array [
  Number+
] => Number
```

### **div**
```
core.math.div :: array [
  Number, 
  Number
] => Number
```

### **pow**
```
core.math.pow :: array [
  Number, 
  Number
] => Number
```

### **mod**
```
core.math.mod :: array [
  Number, 
  Number
] => Number
```

### **min**
```
core.math.min :: array [
  Number+
] => Number
```

### **max**
```
core.math.max :: array [
  Number+
] => Number
```

### **floor**
```
core.math.floor :: array [
  Number
] => Number
```

### **ceil**
```
core.math.ceil :: array [
  Number
] => Number
```

### **round-int**
```
core.math.round-int :: array [
  Number
] => Number
```

### **abs**
```
core.math.abs :: array [
  Number
] => Number
```

### **sqrt**
```
core.math.sqrt :: array [
  Number
] => Number
```

### **sin**
```
core.math.sin :: array [
  Number
] => Number
```

### **cos**
```
core.math.cos :: array [
  Number
] => Number
```

### **tan**
```
core.math.tan :: array [
  Number
] => Number
```

### **asin**
```
core.math.asin :: array [
  Number
] => Number
```

### **acos**
```
core.math.acos :: array [
  Number
] => Number
```

### **atan**
```
core.math.atan :: array [
  Number
] => Number
```

### **sinh**
```
core.math.sinh :: array [
  Number
] => Number
```

### **cosh**
```
core.math.cosh :: array [
  Number
] => Number
```

### **tanh**
```
core.math.tanh :: array [
  Number
] => Number
```

### **exp**
```
core.math.exp :: array [
  Number
] => Number
```

### **log**
```
core.math.log :: array [
  Number
] => Number
```

### **log10**
```
core.math.log10 :: array [
  Number
] => Number
```

### **atan2**
```
core.math.atan2 :: array [
  Number, 
  Number
] => Number
```

## Strings

-------------------

### **concat**
```
core.str.concat :: array [
  String+
] => String
```

### **match**
```
core.str.match :: array [
  Regex, 
  String
] => Bool
```

## Lists

-------------------

### **get-at**
```
core.list.get-at :: array [
  List[a], 
  Number
] => a
```

## Sets

-------------------

### **has**
```
core.set.has :: array [
  Set[a], 
  a
] => Bool
```

# Structure Queries

-------------------

## Types

-------------------

### **element-symbol**
```
structure.type.element-symbol :: array [
  String
] => ElementSymbol
```

### **auth-residue-id**
```
structure.type.auth-residue-id :: array [
  String (* auth_asym_id *), 
  Number (* auth_seq_id *), 
  ?String (* pdbx_PDB_ins_code *)
] => ResidueId
```

*Residue identifier based on "author" annotation.*

### **label-residue-id**
```
structure.type.label-residue-id :: array [
  String (* label_entity_id *), 
  String (* label_asym_id *), 
  Number (* label_auth_seq_id *), 
  ?String (* pdbx_PDB_ins_code *)
] => ResidueId
```

*Residue identifier based on mmCIF's "label_" annotation.*

## Generators

-------------------

### **atom-groups**
```
structure.generator.atom-groups :: object {
  entity-test?: Bool = true, 
  chain-test?: Bool = true, 
  residue-test?: Bool = true, 
  atom-test?: Bool = true, 
  group-by?: Any = atom-key
} => AtomSelection
```

### **query-inSelection**
```
structure.generator.query-inSelection :: object {
  selection: AtomSelection, 
  query: AtomSelection, 
  in-complement?: Bool = false
} => AtomSelection
```

*Executes query only on atoms that are in the source selection.*

## Selection Modifications

-------------------

### **query-each**
```
structure.modifier.query-each :: object {
  selection: AtomSelection, 
  query: AtomSelection
} => AtomSelection
```

### **intersect-by**
```
structure.modifier.intersect-by :: object {
  selection: AtomSelection, 
  by: AtomSelection
} => AtomSelection
```

*Intersect each atom set from the first sequence from atoms in the second one.*

### **except-by**
```
structure.modifier.except-by :: object {
  selection: AtomSelection, 
  by: AtomSelection
} => AtomSelection
```

*Remove all atoms from 'selection' that occur in 'by'.*

### **union-by**
```
structure.modifier.union-by :: object {
  selection: AtomSelection, 
  by: AtomSelection
} => AtomSelection
```

*For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.*

### **union**
```
structure.modifier.union :: object {
  selection: AtomSelection
} => AtomSelection
```

*Collects all atom sets in the sequence into a single atom set.*

### **cluster**
```
structure.modifier.cluster :: object {
  selection: AtomSelection, 
  min-distance?: Number = 0, 
  max-distance: Number, 
  min-size?: Number = 2 (* Minimal number of sets to merge, must be at least 2 *), 
  max-size?: Number (* Maximal number of sets to merge, if not set, no limit *)
} => AtomSelection
```

*Combines atom sets that have mutual distance in the interval [min-radius, max-radius]. Minimum/maximum size determines how many atom sets can be combined.*

### **include-surroundings**
```
structure.modifier.include-surroundings :: object {
  selection: AtomSelection, 
  radius: Number, 
  as-whole-residues?: Bool
} => AtomSelection
```

## Selection Filters

-------------------

### **pick**
```
structure.filter.pick :: object {
  selection: AtomSelection, 
  test: Bool
} => AtomSelection
```

*Pick all atom sets that satisfy the test*

### **with-same-properties**
```
structure.filter.with-same-properties :: object {
  selection: AtomSelection, 
  source: AtomSelection, 
  property: Any
} => AtomSelection
```

### **within**
```
structure.filter.within :: object {
  selection: AtomSelection, 
  target: AtomSelection, 
  radius: Number
} => AtomSelection
```

*All atom sets from section that are within the radius of any atom from target*

## Selection Combinators

-------------------

### **intersect**
```
structure.combinator.intersect :: array [
  AtomSelection*
] => AtomSelection
```

*Return all unique atom sets that appear in all of the source selections.*

### **merge**
```
structure.combinator.merge :: array [
  AtomSelection*
] => AtomSelection
```

*Merges multiple selections into a single one. Only unique atom sets are kept.*

### **distance-cluster**
```
structure.combinator.distance-cluster :: object {
  matrix: List[List[Number]] (* Distance matrix, represented as list of rows (num[][])). Lower triangle is min distance, upper triange is max distance. *), 
  selections: List[AtomSelection] (* A list of held selections. *)
} => AtomSelection
```

*Pick combinations of atom sets from the source sequences that are mutually within distances specified by a matrix.*

## Atom Sets

-------------------

### **atom-count**
```
structure.atom-set.atom-count :: ()
   => Number
```

### **count-query**
```
structure.atom-set.count-query :: object {
  query: AtomSelection
} => Number
```

*Counts the number of occurences of a specific query inside the current atom set.*

## Atom Set Reducer

-------------------

### **accumulator**
```
structure.atom-set.reduce.accumulator :: object {
  initial: Any (* Initial value. Current atom is set to the 1st atom of the current set for this. *), 
  value: Any (* Expression executed for each atom in the set *)
} => Any
```

### **value**
```
structure.atom-set.reduce.value :: ()
   => Any
```

*Current value of the reducer.*

## Atom Properties

-------------------

## Core Properties

-------------------

### **element-symbol**
```
structure.atom-property.core.element-symbol :: ()
   => ElementSymbol
```

### **x**
```
structure.atom-property.core.x :: ()
   => Number
```

*Cartesian X coordinate*

### **y**
```
structure.atom-property.core.y :: ()
   => Number
```

*Cartesian Y coordinate*

### **z**
```
structure.atom-property.core.z :: ()
   => Number
```

*Cartesian Z coordinate*

### **atom-key**
```
structure.atom-property.core.atom-key :: ()
   => Any
```

*Unique value for each atom. Main use case is grouping of atoms.*

## Macromolecular Properties (derived from the mmCIF format)

-------------------

### **auth-residue-id**
```
structure.atom-property.macromolecular.auth-residue-id :: ()
   => ResidueId
```

*type.auth-residue-id symbol executed on current atom's residue*

### **label-residue-id**
```
structure.atom-property.macromolecular.label-residue-id :: ()
   => ResidueId
```

*type.label-residue-id symbol executed on current atom's residue*

### **residue-key**
```
structure.atom-property.macromolecular.residue-key :: ()
   => Any
```

*Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``, main use case is grouping of atoms*

### **chain-key**
```
structure.atom-property.macromolecular.chain-key :: ()
   => Any
```

*Unique value for each tuple ``(label_entity_id,auth_asym_id)``, main use case is grouping of atoms*

### **entity-key**
```
structure.atom-property.macromolecular.entity-key :: ()
   => Any
```

*Unique value for each tuple ``label_entity_id``, main use case is grouping of atoms*

### **is-het**
```
structure.atom-property.macromolecular.is-het :: ()
   => Bool
```

*Equivalent to atom_site.group_PDB !== ATOM*

### **id**
```
structure.atom-property.macromolecular.id :: ()
   => Number
```

### **label_atom_id**
```
structure.atom-property.macromolecular.label_atom_id :: ()
   => String
```

### **label_alt_id**
```
structure.atom-property.macromolecular.label_alt_id :: ()
   => String
```

### **label_comp_id**
```
structure.atom-property.macromolecular.label_comp_id :: ()
   => String
```

### **label_asym_id**
```
structure.atom-property.macromolecular.label_asym_id :: ()
   => String
```

### **label_entity_id**
```
structure.atom-property.macromolecular.label_entity_id :: ()
   => String
```

### **label_seq_id**
```
structure.atom-property.macromolecular.label_seq_id :: ()
   => Number
```

### **auth_atom_id**
```
structure.atom-property.macromolecular.auth_atom_id :: ()
   => String
```

### **auth_comp_id**
```
structure.atom-property.macromolecular.auth_comp_id :: ()
   => String
```

### **auth_asym_id**
```
structure.atom-property.macromolecular.auth_asym_id :: ()
   => String
```

### **auth_seq_id**
```
structure.atom-property.macromolecular.auth_seq_id :: ()
   => Number
```

### **pdbx_PDB_ins_code**
```
structure.atom-property.macromolecular.pdbx_PDB_ins_code :: ()
   => String
```

### **pdbx_formal_charge**
```
structure.atom-property.macromolecular.pdbx_formal_charge :: ()
   => Number
```

### **occupancy**
```
structure.atom-property.macromolecular.occupancy :: ()
   => Number
```

### **B_iso_or_equiv**
```
structure.atom-property.macromolecular.B_iso_or_equiv :: ()
   => Number
```

### **entity-type**
```
structure.atom-property.macromolecular.entity-type :: ()
   => String
```

*Type of the entity as defined in mmCIF (polymer, non-polymer, water)*

