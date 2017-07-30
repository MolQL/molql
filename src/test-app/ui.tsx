/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

import LiteMol from 'litemol'
import State from './state'
import query from './query'

import React = LiteMol.Plugin.React

export default class Root extends React.Component<{ state: State }, { }> {
    render() {
        return <div>
            <QueryString {...this.props} />
            <div><button onClick={() => query(this.props.state)}>Query</button></div>
            <Plugin {...this.props} isMain={true} />
            <Plugin {...this.props} isMain={false} />
            <div style={{ clear: 'both' }} />
            <QueryTree {...this.props} />
        </div>;
    }
}

class Plugin extends React.Component<{ state: State, isMain: boolean }, {}> {
    private target: HTMLDivElement;

    componentDidMount() {
        const plugin = LiteMol.Plugin.create({ target: this.target, layoutState: { hideControls: true }, viewportBackground: '#fcfbfa' });
        if (this.props.isMain) this.props.state.fullPlugin = plugin;
        else this.props.state.resultPlugin = plugin;
    }

    render() {
        return <div style={{ position: 'relative', float: 'left', width: 640, height: 480 }} ref={ref => this.target = ref} />
    }
}

class QueryString extends React.Component<{ state: State }, {}> {
    render() {
        return <div>
            <textarea onChange={t => this.props.state.queryString = t.target.value } rows={20} cols={120}>
            </textarea>
        </div>;
    }
}

class QueryTree extends React.Component<{ state: State }, { query: string }> {
    state = { query: '' }

    componentDidMount() {
        this.props.state.formattedQuery.subscribe(query => {
            this.setState({ query })
        });
    }

    render() {
        return <pre>
            {this.state.query}
        </pre>
    }
}
