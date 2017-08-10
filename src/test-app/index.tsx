/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import State from './state'
import UI from './ui'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

const state = new State()
ReactDOM.render(<UI state={state} />, document.getElementById('app'));