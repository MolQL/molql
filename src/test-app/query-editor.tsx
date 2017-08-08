import * as React from 'react';
import * as CodeMirror from 'codemirror'

// import { GraphQLSchema } from 'graphql';
// import marked from 'marked';
// import { normalizeWhitespace } from '../utility/normalizeWhitespace';
// import onHasCompletion from '../utility/onHasCompletion';

require('codemirror/addon/hint/show-hint');
require('codemirror/addon/comment/comment');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/brace-fold');
require('codemirror/keymap/sublime');

import './query-editor/molql-lisp'

const AUTO_COMPLETE_AFTER_KEY = /^[a-zA-Z(:]$/;


export interface QueryEditorProps {
    mode: string,
    value: string,
    onEdit?: (v: string) => void,
    onHintInformationRender?: (hint: any) => void,
    onClickReference?: (ref: any) => void,
    onSymbol?: (symbol: string) => void,
    onActive?: (active: boolean) => void,
    onExecute?: () => void
}

export default class QueryEditor extends React.Component<QueryEditorProps, {}> {
    private cachedValue: string;
    private editor: CodeMirror.Editor = null as any;
    private _node: HTMLDivElement | undefined;
    private ignoreChangeEvent = false;

    constructor(props: QueryEditorProps) {
        super();
        this.cachedValue = props.value || '';
    }

    _handleAutoCompletePick = (value: string) => {
        if (this.props.onSymbol) {
            this.props.onSymbol(value);
        }
    }

    private autoComplete = (editor: CodeMirror.Editor) => {
        const hint = (CodeMirror as any).hint['molql-lisp'];
        (this.editor as any).showHint({ hint, completeSingle: false, whatIsThis: 'test', closeCharacters: /[\s()\[\];]/ });

        if (editor.state.completionActive && editor.state.completionActive.data) {
            CodeMirror.on(editor.state.completionActive.data, 'select', this._handleAutoCompletePick);
            CodeMirror.on(editor.state.completionActive.data, 'pick', this._handleAutoCompletePick);
        }
    }

    componentDidMount() {
        this.editor = CodeMirror(this._node! as any, {
            value: this.props.value || '',
            lineNumbers: true,
            tabSize: 2,
            theme: 'neat',
            mode: 'molql-lisp',
            keyMap: 'sublime',
            autoCloseBrackets: true,
            matchBrackets: true,
            showCursorWhenSelecting: true,
            foldGutter: {
                minFoldSize: 4
            },
            // hintOptions: {
            //     schema: this.props.schema,
            //     closeOnUnfocus: false,
            //     completeSingle: false,
            // },
            // info: {
            //     schema: this.props.schema,
            //     renderDescription: text => marked(text, { sanitize: true }),
            //     onClick: reference => this.props.onClickReference(reference),
            // },
            // jump: {
            //     schema: this.props.schema,
            //     onClick: reference => this.props.onClickReference(reference),
            // },
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
                'Cmd-Space': this.autoComplete,
                'Ctrl-Space': this.autoComplete,
                '\':\'': (editor: CodeMirror.Editor) => {
                    this.autoComplete(editor);
                    return CodeMirror.Pass;
                },

                'Cmd-Enter': () => {
                    if (this.props.onExecute) {
                        this.props.onExecute();
                    }
                },
                'Ctrl-Enter': () => {
                    if (this.props.onExecute) {
                        this.props.onExecute();
                    }
                },

                // // Editor improvements
                // 'Ctrl-Left': 'goSubwordLeft',
                // 'Ctrl-Right': 'goSubwordRight',
                // 'Alt-Left': 'goGroupLeft',
                // 'Alt-Right': 'goGroupRight',
            }
        } as any);

        this.editor.on('change', this._onEdit);
        this.editor.on('keyup', this._onKeyUp);
        this.editor.on('focus', this._onFocus);
        this.editor.on('blur', this._onBlur);
        this.editor.on('cursorActivity', this._onCursorActivity);
    }

    componentDidUpdate(prevProps: QueryEditorProps) {
        this.ignoreChangeEvent = true;
        if (this.props.mode !== prevProps.mode) {
            (this.editor as any).options.mode = this.props.mode;
            CodeMirror.signal(this.editor, 'change', this.editor);
        }
        if (this.props.value !== prevProps.value && this.props.value !== this.cachedValue) {
            this.cachedValue = this.props.value;
            this.editor.setValue(this.props.value);
        }
        this.ignoreChangeEvent = false;
    }

    componentWillUnmount() {
        this.editor.off('change', this._onEdit);
        this.editor.off('keyup', this._onKeyUp);
        this.editor.off('focus', this._onFocus);
        this.editor.off('blur', this._onBlur);
        this.editor.off('cursorActivity', this._onCursorActivity);
        this.editor = null as any;
    }

    render() {
        return <div style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }} ref={node => this._node = node!} />;
    }

    getCodeMirror() {
        return this.editor;
    }

    getClientHeight() {
        return this._node && this._node.clientHeight;
    }

    _onFocus = () => {
        if (this.props.onActive) {
            this.props.onActive(true);
        }
    }

    _onBlur = () => {
        if (this.props.onActive) {
            this.props.onActive(false);
        }
    }

    _onKeyUp = (cm: CodeMirror.Editor, event?: KeyboardEvent) => {
        if (AUTO_COMPLETE_AFTER_KEY.test(event!.key)) {
            this.autoComplete(cm);
        }
    }

    _onEdit = (editor: CodeMirror.Editor, change: CodeMirror.EditorChange) => {
        if (!this.ignoreChangeEvent) {
            this.cachedValue = this.editor.getValue();
            if (this.props.onEdit) {
                this.props.onEdit(this.cachedValue);
            }
        }
    }

    _onCursorActivity = (editor: CodeMirror.Editor) => {
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
        if (!symbolChars.test(line.charAt(start))) return '';
        if (line) {
            if ((end === line.length) && start) --start; else ++end;
            while (start > 0 && symbolChars.test(line.charAt(start - 1))) --start;
            while (end < line.length && symbolChars.test(line.charAt(end))) ++end;
        }
        return doc.getRange({ line: pos.line, ch: start }, { line: pos.line, ch: end });
    }
}