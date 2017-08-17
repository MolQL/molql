/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { BondAnnotation } from '../../molecule/data'

interface BondAddress { atomA: number, atomB: number, annotation: BondAnnotation }
function BondAddress(): BondAddress { return { atomA: 0, atomB: 0, annotation: BondAnnotation.None }; }

export default BondAddress;