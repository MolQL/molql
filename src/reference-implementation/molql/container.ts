/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Expression from '../../mini-lisp/expression'
import Container from '../../mini-lisp/container'
import version from '../../molql/version'
import * as semver from 'semver'

namespace Container {
    export function serialize(expression: Expression, options?: { source?: string, pretty?: boolean }): string {
        const  { source = void 0, pretty = false } = options || {};
        return JSON.stringify({ source, version, expression }, void 0, pretty ? 2 : void 0);
    }

    export function deserialize(data: string) {
        const container: Container = JSON.parse(data);
        if (!semver.satisfies(container.version, '>=0.1.0 <0.2.0')) throw new Error(`Can only deserialize version 0.1.x (got ${container.version})`);
        return container;
    }
}

export default Container