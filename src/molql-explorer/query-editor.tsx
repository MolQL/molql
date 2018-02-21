/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as React from 'react';
import * as CodeMirror from 'codemirror'

require('codemirror/addon/hint/show-hint');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/python/python');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/fold/brace-fold');
require('codemirror/keymap/sublime');

import './query-editor/autocompletion'
import './query-editor/highlight'

export interface QueryEditorProps {
    mode: string,
    value: string,
    onChange?: (v: string) => void,
    onSymbol?: (symbol: string) => void,
    onActive?: (active: boolean) => void,
    onExecute?: () => void
}

export default class QueryEditor extends React.Component<QueryEditorProps, {}> {
    private cachedValue: string;
    private editor: CodeMirror.Editor = null as any;
    private node: HTMLDivElement | undefined;
    private ignoreChangeEvent = false;

    constructor(props: QueryEditorProps) {
        super(props);
        this.cachedValue = props.value || '';
    }

    handleAutoCompletePick = (value: string) => {
        if (this.props.onSymbol) {
            this.props.onSymbol(value);
        }
    }

    execute = () => {
        if (this.props.onExecute) {
            this.props.onExecute();
        }
    };

    autoComplete = (editor: CodeMirror.Editor) => {
        const hint = (CodeMirror as any).hint[this.props.mode];
        if (!hint) return;
        (this.editor as any).showHint({ hint, closeCharacters: /[\s()\[\];]/ });

        if (editor.state.completionActive && editor.state.completionActive.data) {
            CodeMirror.on(editor.state.completionActive.data, 'select', this.handleAutoCompletePick);
            CodeMirror.on(editor.state.completionActive.data, 'pick', this.handleAutoCompletePick);
        }
    }

    componentDidMount() {
        this.editor = CodeMirror(this.node! as any, {
            value: this.props.value || '',
            lineNumbers: true,
            tabSize: 2,
            theme: 'neat',
            mode: this.props.mode,
            keyMap: 'sublime',
            autoCloseBrackets: true,
            matchBrackets: true,
            showCursorWhenSelecting: true,
            hintOptions: { closeOnUnfocus: true, completeSingle: false, },
            gutters: ['CodeMirror-linenumbers'],
            extraKeys: {
                'Cmd-Space': this.autoComplete,
                'Ctrl-Space': this.autoComplete,
                '\':\'': (editor: CodeMirror.Editor) => {
                    this.autoComplete(editor);
                    return CodeMirror.Pass;
                },
                'Cmd-Enter': this.execute,
                'Ctrl-Enter': this.execute
            }
        } as any);

        this.editor.on('change', this.onEdit);
        this.editor.on('keyup', this.onKeyUp);
        this.editor.on('focus', this.onFocus);
        this.editor.on('blur', this.onBlur);
        this.editor.on('cursorActivity', this.onCursorActivity);
    }

    componentDidUpdate(prevProps: QueryEditorProps) {
        this.ignoreChangeEvent = true;
        if (this.props.mode !== prevProps.mode) {
            this.editor.setOption('mode', this.props.mode);
        }
        if (this.props.value !== prevProps.value && this.props.value !== this.cachedValue) {
            this.cachedValue = this.props.value;
            this.editor.setValue(this.props.value);
        }
        this.ignoreChangeEvent = false;
    }

    componentWillUnmount() {
        this.editor.off('change', this.onEdit);
        this.editor.off('keyup', this.onKeyUp);
        this.editor.off('focus', this.onFocus);
        this.editor.off('blur', this.onBlur);
        this.editor.off('cursorActivity', this.onCursorActivity);
        this.editor = null as any;
    }

    render() {
        return <div style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }} ref={node => this.node = node!} />;
    }

    getCodeMirror() {
        return this.editor;
    }

    getClientHeight() {
        return this.node && this.node.clientHeight;
    }

    onFocus = () => {
        if (this.props.onActive) {
            this.props.onActive(true);
        }
    }

    onBlur = () => {
        if (this.props.onActive) {
            this.props.onActive(false);
        }
    }

    private autocompleteAfter = /^[a-zA-Z(:]$/
    onKeyUp = (cm: CodeMirror.Editor, event?: KeyboardEvent) => {
        if (this.autocompleteAfter.test(event!.key)) {
            this.autoComplete(cm);
        }
    }

    onEdit = (editor: CodeMirror.Editor, change: CodeMirror.EditorChange) => {
        if (!this.ignoreChangeEvent) {
            this.cachedValue = this.editor.getValue();
            if (this.props.onChange) {
                this.props.onChange(this.cachedValue);
            }
        }
    }

    onCursorActivity = (editor: CodeMirror.Editor) => {
        if (!editor.state.completionActive && this.props.onSymbol) {
            this.props.onSymbol(this.getCurrentSymbol(editor));
        }
    }

    private getCurrentSymbol(editor: CodeMirror.Editor) {
        const doc = editor.getDoc();
        const pos = doc.getCursor();
        const line = doc.getLine(pos.line);
        let start = pos.ch, end = pos.ch;

        const symbolChars = /[^\s'`,@()\[\]';]/;
        if (start > 0 && symbolChars.test(line.charAt(start - 1))) { start--; end--; }
        if (!symbolChars.test(line.charAt(start))) return '';
        if (line) {
            if ((end === line.length) && start)--start; else ++end;
            while (start > 0 && symbolChars.test(line.charAt(start - 1)))--start;
            while (end < line.length && symbolChars.test(line.charAt(end)))++end;
        }
        return doc.getRange({ line: pos.line, ch: start }, { line: pos.line, ch: end });
    }
}