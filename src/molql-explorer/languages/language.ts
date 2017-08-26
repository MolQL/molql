/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Transpiler from '../../transpilers/transpiler'

export type Example = { name: string, value: string }

interface Language {
    name: string,
    editorMode: string,
    docs: string,
    transpiler: Transpiler,
    examples: Example[],
    mergeSelection: boolean
}

export default Language