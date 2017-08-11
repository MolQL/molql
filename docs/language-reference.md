
Language Reference
==================


   * [Language Primitives](#language-primitives)
     * [Types](#types)
     * [Logic](#logic)
     * [Control](#control)
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
core.type.bool :: Value => Bool
```

*Convert a value to boolean.*

### **num**
```
core.type.num :: Value => Number
```

*Convert a value to number.*

### **str**
```
core.type.str :: Value => String
```

*Convert a value to string.*

### **regex**
```
core.type.regex :: (
  String, (* Expression *)
  ?String (* Flags, e.g. 'i' for ignore case *)
) => Regex
```

*Creates a regular expression from a string using the ECMAscript syntax.*

### **list**
```
core.type.list :: a* => List[a]
```

### **set**
```
core.type.set :: a* => Set[a]
```

## Logic

-------------------

### **not**
```
core.logic.not :: Bool => Bool
```

### **and**
```
core.logic.and :: Bool+ => Bool
```

### **or**
```
core.logic.or :: Bool+ => Bool
```

## Control

-------------------

### **eval**
```
core.ctrl.eval :: Fn[a] => a
```

*Evaluate a function.*

### **fn**
```
core.ctrl.fn :: a => Fn[a]
```

*Wrap an expression to a "lazy" function.*

### **if**
```
core.ctrl.if :: (
  Bool, (* Condition *)
  a, (* If true *)
  b (* If false *)
) => a | b
```

## Relational

-------------------

### **eq**
```
core.rel.eq :: (a: Value, a: Value) => Bool
```

### **neq**
```
core.rel.neq :: (a: Value, a: Value) => Bool
```

### **lt**
```
core.rel.lt :: (Number, Number) => Bool
```

### **lte**
```
core.rel.lte :: (Number, Number) => Bool
```

### **gr**
```
core.rel.gr :: (Number, Number) => Bool
```

### **gre**
```
core.rel.gre :: (Number, Number) => Bool
```

### **in-range**
```
core.rel.in-range :: (
  Number, (* Value to test *)
  Number, (* Minimum value *)
  Number (* Maximum value *)
) => Bool
```

*Check if the value of the 1st argument is >= 2nd and <= 3rd.*

## Math

-------------------

### **add**
```
core.math.add :: Number+ => Number
```

### **sub**
```
core.math.sub :: Number+ => Number
```

### **mult**
```
core.math.mult :: Number+ => Number
```

### **div**
```
core.math.div :: (Number, Number) => Number
```

### **pow**
```
core.math.pow :: (Number, Number) => Number
```

### **mod**
```
core.math.mod :: (Number, Number) => Number
```

### **min**
```
core.math.min :: Number+ => Number
```

### **max**
```
core.math.max :: Number+ => Number
```

### **floor**
```
core.math.floor :: Number => Number
```

### **ceil**
```
core.math.ceil :: Number => Number
```

### **round-int**
```
core.math.round-int :: Number => Number
```

### **abs**
```
core.math.abs :: Number => Number
```

### **sqrt**
```
core.math.sqrt :: Number => Number
```

### **sin**
```
core.math.sin :: Number => Number
```

### **cos**
```
core.math.cos :: Number => Number
```

### **tan**
```
core.math.tan :: Number => Number
```

### **asin**
```
core.math.asin :: Number => Number
```

### **acos**
```
core.math.acos :: Number => Number
```

### **atan**
```
core.math.atan :: Number => Number
```

### **sinh**
```
core.math.sinh :: Number => Number
```

### **cosh**
```
core.math.cosh :: Number => Number
```

### **tanh**
```
core.math.tanh :: Number => Number
```

### **exp**
```
core.math.exp :: Number => Number
```

### **log**
```
core.math.log :: Number => Number
```

### **log10**
```
core.math.log10 :: Number => Number
```

### **atan2**
```
core.math.atan2 :: (Number, Number) => Number
```

## Strings

-------------------

### **concat**
```
core.str.concat :: String+ => String
```

### **match**
```
core.str.match :: (Regex, String) => Bool
```

## Lists

-------------------

### **get-at**
```
core.list.get-at :: (List[a], Number) => a
```

## Sets

-------------------

### **has**
```
core.set.has :: (Set[a], a) => Bool
```

# Structure Queries

-------------------

## Types

-------------------

### **element-symbol**
```
structure.type.element-symbol :: String => ElementSymbol
```

*Create element symbol representation from a string value.*

### **auth-residue-id**
```
structure.type.auth-residue-id :: (
  String, (* auth_asym_id *)
  Number, (* auth_seq_id *)
  ?String (* pdbx_PDB_ins_code *)
) => ResidueId
```

*Residue identifier based on "auth_" annotation.*

### **label-residue-id**
```
structure.type.label-residue-id :: (
  String, (* label_entity_id *)
  String, (* label_asym_id *)
  Number, (* label_auth_seq_id *)
  ?String (* pdbx_PDB_ins_code *)
) => ResidueId
```

*Residue identifier based on mmCIF's "label_" annotation.*

## Generators

-------------------

### **atom-groups**
```
structure.generator.atom-groups :: {
  entity-test?: Bool = true, (* Test for the 1st atom of every entity *)
  chain-test?: Bool = true, (* Test for the 1st atom of every chain *)
  residue-test?: Bool = true, (* Test for the 1st atom every residue *)
  atom-test?: Bool = true, 
  group-by?: Any = atom-key (* Group atoms to sets based on this property. Default: each atom has its own set *)
} => AtomSelectionQuery
```

*Return all atoms for which the tests are satisfied, grouped into sets.*

### **query-in-selection**
```
structure.generator.query-in-selection :: {
  selection: AtomSelectionQuery, 
  query: AtomSelectionQuery, 
  in-complement?: Bool = false
} => AtomSelectionQuery
```

*Executes query only on atoms that are in the source selection.*

## Selection Modifications

-------------------

### **query-each**
```
structure.modifier.query-each :: {
  selection: AtomSelectionQuery, 
  query: AtomSelectionQuery
} => AtomSelectionQuery
```

*Query every atom set in the input selection separately.*

### **intersect-by**
```
structure.modifier.intersect-by :: {
  selection: AtomSelectionQuery, 
  by: AtomSelectionQuery
} => AtomSelectionQuery
```

*Intersect each atom set from the first sequence from atoms in the second one.*

### **except-by**
```
structure.modifier.except-by :: {
  selection: AtomSelectionQuery, 
  by: AtomSelectionQuery
} => AtomSelectionQuery
```

*Remove all atoms from 'selection' that occur in 'by'.*

### **union-by**
```
structure.modifier.union-by :: {
  selection: AtomSelectionQuery, 
  by: AtomSelectionQuery
} => AtomSelectionQuery
```

*For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.*

### **union**
```
structure.modifier.union :: {
  selection: AtomSelectionQuery
} => AtomSelectionQuery
```

*Collects all atom sets in the sequence into a single atom set.*

### **cluster**
```
structure.modifier.cluster :: {
  selection: AtomSelectionQuery, 
  min-distance?: Number = 0, 
  max-distance: Number, 
  min-size?: Number = 2, (* Minimal number of sets to merge, must be at least 2 *)
  max-size?: Number (* Maximal number of sets to merge, if not set, no limit *)
} => AtomSelectionQuery
```

*Combines atom sets that have mutual distance in the interval [min-radius, max-radius]. Minimum/maximum size determines how many atom sets can be combined.*

### **include-surroundings**
```
structure.modifier.include-surroundings :: {
  selection: AtomSelectionQuery, 
  radius: Number, 
  as-whole-residues?: Bool
} => AtomSelectionQuery
```

*For each atom set in the selection, include all surrouding atoms/residues that are within the specified radius.*

## Selection Filters

-------------------

### **pick**
```
structure.filter.pick :: {
  selection: AtomSelectionQuery, 
  test: Bool
} => AtomSelectionQuery
```

*Pick all atom sets that satisfy the test.*

### **with-same-atom-properties**
```
structure.filter.with-same-atom-properties :: {
  selection: AtomSelectionQuery, 
  source: AtomSelectionQuery, 
  property: Any
} => AtomSelectionQuery
```

*Pick all atom sets for which the set of given atom properties is a subset of the source properties.*

### **within**
```
structure.filter.within :: {
  selection: AtomSelectionQuery, 
  target: AtomSelectionQuery, 
  radius: Number
} => AtomSelectionQuery
```

*Pick all atom sets from section that are within the radius of any atom from target.*

## Selection Combinators

-------------------

### **intersect**
```
structure.combinator.intersect :: AtomSelectionQuery* => AtomSelectionQuery
```

*Return all unique atom sets that appear in all of the source selections.*

### **merge**
```
structure.combinator.merge :: AtomSelectionQuery* => AtomSelectionQuery
```

*Merges multiple selections into a single one. Only unique atom sets are kept.*

### **distance-cluster**
```
structure.combinator.distance-cluster :: {
  matrix: List[List[Number]], (* Distance matrix, represented as list of rows (num[][])). Lower triangle is min distance, upper triange is max distance. *)
  selections: List[AtomSelectionQuery] (* A list of held selections. *)
} => AtomSelectionQuery
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
structure.atom-set.count-query :: {
  query: AtomSelectionQuery
} => Number
```

*Counts the number of occurences of a specific query inside the current atom set.*

## Atom Set Reducer

-------------------

### **accumulator**
```
structure.atom-set.reduce.accumulator :: {
  initial: a: Value, (* Initial value. Current atom is set to the 1st atom of the current set for this. *)
  value: a: Value (* Expression executed for each atom in the set *)
} => a: Value
```

*Execute the value expression for each atom in the current atom set and return the result.*

### **value**
```
structure.atom-set.reduce.value :: ()
   => a: Value
```

*Current value of atom set accumulator.*

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

*_atom_site.id*

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

