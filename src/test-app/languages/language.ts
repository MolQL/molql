/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Transpiler from '../../transpilers/transpiler'

export type Example = { name: string, value: string }

interface Language {
    name: string,
    editorMode: string,
    transpiler: Transpiler,
    examples: Example[]
}

export default Language