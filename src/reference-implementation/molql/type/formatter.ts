/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Type from '../../../molql/type'

export default function format(type: Type): string {
    switch (type.kind) {
        case 'any': return 'Any';
        case 'any-value': return 'Value';
        case 'value': return type.name;
        case 'variable': return type.type && type.type.kind !== 'any' ? `${type.name}: ${format(type.type)}` : type.name;
        case 'container': return type.alias ? type.alias : `${type.name}[${format(type.child)}]`;
        case 'union': return type.types.map(format).join(' | ')
        default: throw new Error(`unknown type kind`);
    }
}