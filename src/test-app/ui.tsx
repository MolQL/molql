/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

import LiteMol from 'litemol'
import State from './state'
import * as React from 'react'
import AceEditor from 'react-ace'
import Expression from '../language/expression'
import lispFormat from '../reference-implementation/utils/expression-lisp-formatter'

import 'brace/mode/lisp';
import 'brace/mode/json';

import Rx = LiteMol.Core.Rx

export default class Root extends React.Component<{ state: State }, { }> {
    render() {
        return <div style={{ margin: '40px auto', maxWidth: 1600 }}>
            <div className='row'>
                <h1>MolQL <small>super awesome test app</small></h1>
            </div>
            <div className='row'>
                <div className='six columns'>
                    <h3>Query</h3>
                    <div className='row'>
                        <div className='six columns'>
                            <select className='u-full-width'><option>Select language</option></select>
                        </div>
                        <div className='six columns'>
                            <select  className='u-full-width'><option>Select example</option></select>
                        </div>
                    </div>
                    <QueryExpression {...this.props} />
                </div>
                <div className='six columns'>
                    <h3>Compiled</h3>
                    <select className='u-full-width' onChange={e => this.props.state.compileTarget.onNext(e.target.value as any) }>
                        <option value='lisp'>LISP-like</option>
                        <option value='json'>JSON</option>
                    </select>
                    <CompiledQuery {...this.props} />
                </div>
            </div>
            <QueryControls {...this.props} />
            <div className='row'>
                <Plugin {...this.props} isMain={true} />
                <Plugin {...this.props} isMain={false} />
            </div>
            <div className='row' style={{ marginTop: 15 }}>
                <h3>Query result in mmCIF</h3>
                <QueryResult {...this.props} />
            </div>
        </div>;
    }
}

class Observer<S, P> extends React.Component<S, P> {
    private _subs: Rx.IDisposable[] = []

    subscribe<T>(obs: Rx.Observable<T>, onNext: (v: T) => void) {
        this._subs.push(obs.subscribe(onNext));
    }

    componentWillUnmount() {
        for (const s of this._subs) s.dispose();
        this._subs = [];
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
        return <div className='six columns'>
            <h3>{this.props.isMain ? 'Full Structure' : 'Selection'}</h3>
            <div style={{ position: 'relative', height: 400 }} ref={ref => this.target = ref!} />
        </div>
    }
}

class QueryControls extends Observer<{ state: State }, { loaded: boolean, queryOk: boolean }> {
    state = { loaded: false, queryOk: false }

    componentDidMount() {
        this.subscribe(this.props.state.loaded, loaded => {
            this.setState({ loaded });
        });
        this.subscribe(this.props.state.query, query => {
            this.setState({ queryOk: query.kind === 'ok' });
        });
    }

    render() {
        const isOk = this.state.loaded && this.state.queryOk;
        return <div className='row' style={{ marginTop: 15 }}>
            <div className='three columns'>
                 <input className='u-full-width' type='text' placeholder='PDB id...' defaultValue={this.props.state.pdbId} onChange={e => this.props.state.pdbId = e.target.value }  />
            </div>
            <div className='three columns'>
                <button className='u-full-width button-primary' onClick={() => this.props.state.loadMolecule()}>Load Molecule</button>
            </div>
            <div className='six columns'>
                <button className={`u-full-width ${isOk ? 'button-primary' : ''}`} onClick={() => this.props.state.execute()} disabled={!isOk}>Execute</button>
            </div>
        </div>;
    }
}

class QueryExpression extends Observer<{ state: State }, { queryString: string }> {
    state = { queryString: '' }
    componentDidMount() {
        this.subscribe(this.props.state.queryString, queryString => {
            this.setState({ queryString });
        });
    }
    render() {
        return <AceEditor onChange={v => this.props.state.queryString.onNext(v) } mode={'json'} width={'100%'} height={'320px'} value={this.state.queryString} />;
    }
}

class CompiledQuery extends Observer<{ state: State }, { error?: string, expression?: Expression, target: 'lisp' | 'json' }> {
    state = { expression: void 0, error: void 0, target: 'lisp' as 'lisp' };

    componentDidMount() {
        this.subscribe(this.props.state.query, q => {
            if (q.kind === 'error') this.setState({ error: q.message, expression: void 0 })
            else this.setState({ error: void 0, expression: q.serialized.expression })
        });
        this.subscribe(this.props.state.compileTarget, target => {
            this.setState({ target })
        });
    }

    render() {
        if (this.state.error) {
            return <pre style={{ margin: 0, height: 320, maxHeight: 320, color: 'red' }}>
                {this.state.error}
            </pre>;
        }
        return <pre style={{ margin: 0, height: 320, maxHeight: 320 }}>
            {this.state.expression
                ? this.state.target === 'lisp' ? lispFormat(this.state.expression!) : JSON.stringify(this.state.expression, null, 2) 
                : 'Enter query...'}
        </pre>
    }
}

class QueryResult extends Observer<{ state: State }, { cif: string }> {
    state = { cif: '' }
    componentDidMount() {
        this.subscribe(this.props.state.queryResultCIF, cif => {
            this.setState({ cif });
        });
    }
    render() {
        return <pre style={{ margin: 0, height: 320, maxHeight: 320 }}>
            {this.state.cif}
        </pre>;
    }
}
