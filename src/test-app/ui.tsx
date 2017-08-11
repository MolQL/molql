/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import LiteMol from 'litemol'
import State from './state'
import * as React from 'react'
import Expression from '../mini-lisp/expression'
import lispFormat from '../reference-implementation/mini-lisp/expression-formatter'
import getDocs, { formatSymbol } from '../reference-implementation/molql/markdown-docs'
import Language, { Example } from './languages/language'
import Languages from './languages'
import * as ReactMarkdown from 'react-markdown'
import QueryEditor from './query-editor'
import * as MolQLLisp from '../transpilers/molql-lisp/symbols'

import Rx = LiteMol.Core.Rx

export default class Root extends React.Component<{ state: State }, { }> {
    render() {
        const col1 = '37%', col2 = '37%', col12 = '74%', col3 = '26%', heightTop = '50%', heightBottom = '50%';
        return <div style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, overflow: 'hidden' }}>
            <div className='layout-box' style={{position: 'absolute', top: 0, left: 0, width: col1, height: heightTop, overflowX: 'hidden', overflowY: 'hidden' }}>
                <LanguageSelection {...this.props} />
                <OffsetBox>
                    <QueryExpression {...this.props} />
                </OffsetBox>
            </div>
            <div className='layout-box' style={{ position: 'absolute', top: 0, left: col1, width: col2, height: heightTop, overflowX: 'hidden', overflowY: 'hidden' }}>
                <select className='u-full-width' onChange={e => this.props.state.compileTarget.onNext(e.target.value as any) }>
                    <option value='lisp'>Compiled: LISP-like</option>
                    <option value='json'>Compiled: JSON</option>
                </select>
                <OffsetBox><CompiledQuery {...this.props} /></OffsetBox>
                <QueryHint {...this.props} />
            </div>
            <div className='layout-box' style={{ position: 'absolute', top: 0, left: col12, width: col3, height: heightTop, overflowX: 'hidden', overflowY: 'hidden' }}>
                <div style={{ textAlign: 'right', fontSize: '30px', paddingRight: '30px', lineHeight: '60px', position: 'absolute', left: 0, right: 0, bottom: 20, top: 0, height: 60, color: 'rgb(250,250,250)' }}>
                    Language Reference
                </div>
                <OffsetBox className='docs'><ReactMarkdown source={getDocs(false)} /></OffsetBox>
            </div>
            <div className='layout-box' style={{ position: 'absolute', top: heightTop, left: 0, width: col1, height: heightBottom, overflowX: 'hidden', overflowY: 'hidden' }}>
                <LoadMolecule {...this.props} />
                <OffsetBox><LiteMolPlugin {...this.props} isMain={true} /></OffsetBox>
            </div>
            <div className='layout-box' style={{ position: 'absolute', top: heightTop, left: col1, width: col2, height: heightBottom, overflowX: 'hidden', overflowY: 'hidden' }}>
                <ExecuteQuery {...this.props} />
                <OffsetBox><LiteMolPlugin {...this.props} isMain={false} /></OffsetBox>
            </div>
            <div className='layout-box' style={{ position: 'absolute', top: heightTop, left: col12, width: col3, height: heightBottom, overflowX: 'hidden', overflowY: 'hidden' }}>
                <div style={{ textAlign: 'right', fontSize: '30px', paddingRight: '30px', lineHeight: '60px', position: 'absolute', left: 0, right: 0, bottom: 20, top: 0, height: 60, color: 'rgb(250,250,250)' }}>
                    Result
                </div>
                <OffsetBox><QueryResult {...this.props} /></OffsetBox>
            </div>
        </div>
    }
}

function OffsetBox(props: { children: JSX.Element | JSX.Element[], className?: string }) {
    const padding = '0';
    return <div className={props.className} style={{ position: 'absolute', left: padding, right: padding, bottom: padding, top: '60px' }}>{props.children}</div>
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

class LanguageSelection extends Observer<{ state: State}, { language: Language, example: Example | undefined }> {
    state = { language: Languages[0], example: Languages[0].examples[0] }

    componentDidMount() {
        this.subscribe(this.props.state.currentLanguage, l => this.setState(l))
    }

    render() {
        const langIndex = Languages.indexOf(this.state.language);
        const exampleIndex = this.state.language.examples.indexOf(this.state.example);

        return <div className='row'>
            <div className='six columns'>
                <select className='u-full-width' value={langIndex}
                    onChange={e => this.props.state.currentLanguage.onNext({ language: Languages[+e.target.value], example: Languages[+e.target.value].examples[0] }) }>
                    {Languages.map((l, i) => <option key={i} value={i}>Language: {l.name}</option>)}
                </select>
            </div>
            <div className='six columns'>
                <select className='u-full-width' value={exampleIndex}
                    onChange={e => this.props.state.currentLanguage.onNext({ language: this.state.language, example: this.state.language.examples[+e.target.value] }) }>
                    <option value='-1'>Select example...</option>
                    {this.state.language.examples.map((e, i) => <option key={i} value={i}>{e.name}</option>)}
                </select>
            </div>
        </div>
    }
}

class LiteMolPlugin extends React.Component<{ state: State, isMain: boolean }, {}> {
    private target: HTMLDivElement;

    componentDidMount() {
        const plugin = LiteMol.Plugin.create({ target: this.target, layoutState: { hideControls: true, collapsedControlsLayout: LiteMol.Bootstrap.Components.CollapsedControlsLayout.Landscape }, viewportBackground: '#F1F1F1' });
        if (this.props.isMain) this.props.state.fullPlugin = plugin;
        else this.props.state.resultPlugin = plugin;
    }

    render() {
        return <div style={{ position: 'absolute',  top: 0, right: 0, left: 0, bottom: 0 }} ref={ref => this.target = ref!} />
    }
}

class LoadMolecule extends Observer<{ state: State }, { }> {
    componentDidMount() {
        this.subscribe(this.props.state.loaded, loaded => {
            this.setState({ loaded });
        });
        this.subscribe(this.props.state.query, query => {
            this.setState({ queryOk: query.kind === 'ok' });
        });
    }

    render() {
        return <div className='row'>
            <div className='six columns'>
                 <input className='u-full-width' type='text' placeholder='PDB id...' defaultValue={this.props.state.pdbId} onChange={e => this.props.state.pdbId = e.target.value }  />
            </div>
            <div className='six columns'>
                <button className='u-full-width button-primary' onClick={() => this.props.state.loadMolecule()}>Load Molecule</button>
            </div>
        </div>;
    }
}

class ExecuteQuery extends Observer<{ state: State }, { loaded: boolean, queryOk: boolean }> {
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
        return <div className='row'>
            <button className={`u-full-width ${isOk ? 'button-primary' : ''}`} onClick={() => this.props.state.execute()} disabled={!isOk}>Execute Query (Ctrl/Cmd + Enter)</button>
        </div>;
    }
}

class QueryExpression extends Observer<{ state: State }, { queryString: string }> {
    state = { queryString: '' }
    componentDidMount() {
        this.subscribe(this.props.state.queryString, queryString => {
            if (this.state.queryString !== queryString) this.setState({ queryString });
        });
    }
    render() {
        return <QueryEditor
            mode={this.props.state.currentLanguage.getValue().language.editorMode}
            value={this.state.queryString}
            onChange={v => this.props.state.queryString.onNext(v)}
            onSymbol={s => this.props.state.currentSymbol.onNext(s)}
            onActive={a => this.props.state.editorActive.onNext(a)}
            onExecute={() => this.props.state.execute()} />
    }
}

class QueryHint extends Observer<{ state: State }, { isActive: boolean, description: string | undefined, info: string }> {
    state = { description: '', info: '', isActive: false }
    componentDidMount() {
        this.subscribe(this.props.state.editorActive, isActive => this.setState({ isActive: isActive && this.props.state.currentLanguage.getValue().language.editorMode === 'molql-lisp' }));
        this.subscribe(this.props.state.currentLanguage, lang => this.setState({ isActive: lang.language.editorMode === 'molql-lisp' && this.props.state.editorActive.getValue() }));
        this.subscribe(this.props.state.currentSymbol.distinctUntilChanged(), symbol => {
            if (!this.state.isActive) return;
            const _s = MolQLLisp.SymbolMap[symbol]
            const symb = _s && _s.symbol;
            if (symb) this.setState({ description: symb.info.description, info: formatSymbol(symb, symbol) });
        });
    }
    render() {
        if (!this.state.info || !this.state.isActive) return <div />;
        return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, margin: 0, padding: '10px', fontSize: 'smaller' }}>
            <div style={{ padding: '1rem 1.5rem' }} className='query-hint'>
                <div style={{ float: 'right', fontWeight: 'bold', color: '#999999' }}>Symbol Info</div>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0 }}>{this.state.info}</pre>
                {!!this.state.description
                    ? <div style={{ fontStyle: 'italic', marginTop: '1rem' }}>{this.state.description}</div>
                    : void 0}
            </div>
        </div>;
    }
}

class CompiledQuery extends Observer<{ state: State }, { error?: string, expression?: Expression, target: 'lisp' | 'json' }> {
    state = { expression: void 0, error: void 0, target: 'lisp' as 'lisp' };

    componentDidMount() {
        this.subscribe(this.props.state.query, q => {
            if (q.kind === 'error') this.setState({ error: q.message, expression: void 0 })
            else this.setState({ error: void 0, expression: q.expression })
        });
        this.subscribe(this.props.state.compileTarget, target => {
            this.setState({ target })
        });
    }

    render() {
        let content = '';
        if (this.state.error) {
            content = '' + this.state.error;
        } else {
            content = this.state.expression
                ? this.state.target === 'lisp' ? lispFormat(this.state.expression!) : JSON.stringify(this.state.expression, null, 2)
                : 'Enter query...';
        }

        return <pre style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, background: 'white', margin: 0, padding: '10px', color: this.state.error ? 'red' : void 0 }}>
            {content}
        </pre>
    }
}

class QueryResult extends Observer<{ state: State }, { content: string, isError: boolean }> {
    state = { content: '', isError: false }
    componentDidMount() {
        this.subscribe(this.props.state.queryResult, ({ content, kind }) => {
            this.setState({ content, isError: kind === 'error' });
        });
    }
    render() {
        return <pre style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, background: 'white', margin: 0, padding: '10px', color: this.state.isError ? 'red' : void 0, backgroundColor: '#F1F1F1' }}>
            {this.state.content}
        </pre>;
    }
}
