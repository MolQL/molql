/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import State from './state'
import UI from './ui'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

const state = new State()
ReactDOM.render(<UI state={state} />, document.getElementById('app'));