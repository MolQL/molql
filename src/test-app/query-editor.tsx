import * as React from 'react';
import * as CoreMirror from 'codemirror'

// import { GraphQLSchema } from 'graphql';
// import marked from 'marked';
// import { normalizeWhitespace } from '../utility/normalizeWhitespace';
// import onHasCompletion from '../utility/onHasCompletion';

//require('codemirror/addon/hint/show-hint');
//require('codemirror/addon/comment/comment');
//require('codemirror/addon/edit/matchbrackets');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/brace-fold');
//require('codemirror/addon/lint/lint');
require('codemirror/keymap/sublime');

const AUTO_COMPLETE_AFTER_KEY = /^[a-zA-Z0-9_@(]$/;


export interface QueryEditorProps {
    value: string,
    onEdit?: (v: string) => void,
    onHintInformationRender?: (hint: any) => void,
    onClickReference?: (ref: any) => void,
    onExecute?: () => void
}

export default class QueryEditor extends React.Component<QueryEditorProps, {}> {
    private cachedValue: string;
    private editor: any = null;
    private _node: HTMLDivElement | undefined;
    private ignoreChangeEvent = false;

    constructor(props: QueryEditorProps ) {
        super();
        this.cachedValue = props.value || '';
    }

    componentDidMount() {
        this.editor = CoreMirror(this._node! as any, {
            value: this.props.value || '',
            lineNumbers: true,
            tabSize: 2,
            mode: 'javascript',
            keyMap: 'sublime',
            autoCloseBrackets: true,
            matchBrackets: true,
            showCursorWhenSelecting: true,
            foldGutter: {
                minFoldSize: 4
            },
            // lint: {
            //     schema: this.props.schema,
            // },
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
                // 'Cmd-Space': () => this.editor.showHint({ completeSingle: true }),
                // 'Ctrl-Space': () => this.editor.showHint({ completeSingle: true }),
                // 'Alt-Space': () => this.editor.showHint({ completeSingle: true }),
                // 'Shift-Space': () => this.editor.showHint({ completeSingle: true }),

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
        this.editor.on('hasCompletion', this._onHasCompletion);
        this.editor.on('beforeChange', this._onBeforeChange);
    }

    componentDidUpdate(prevProps: QueryEditorProps) {
        // Ensure the changes caused by this update are not interpretted as
        // user-input changes which could otherwise result in an infinite
        // event loop.
        this.ignoreChangeEvent = true;
        // if (this.props.schema !== prevProps.schema) {
        //     this.editor.options.lint.schema = this.props.schema;
        //     this.editor.options.hintOptions.schema = this.props.schema;
        //     this.editor.options.info.schema = this.props.schema;
        //     this.editor.options.jump.schema = this.props.schema;
        //     CodeMirror.signal(this.editor, 'change', this.editor);
        // }
        if (this.props.value !== prevProps.value &&
            this.props.value !== this.cachedValue) {
            this.cachedValue = this.props.value;
            this.editor.setValue(this.props.value);
        }
        this.ignoreChangeEvent = false;
    }

    componentWillUnmount() {
        this.editor.off('change', this._onEdit);
        this.editor.off('keyup', this._onKeyUp);
        this.editor.off('hasCompletion', this._onHasCompletion);
        this.editor = null;
    }

    render() {
        return (
            <div
                className="query-editor"
                style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }}
                ref={node => { this._node = node!; }}
            />
        );
    }

    /**
     * Public API for retrieving the CodeMirror instance from this
     * React component.
     */
    getCodeMirror() {
        return this.editor;
    }

    /**
     * Public API for retrieving the DOM client height for this component.
     */
    getClientHeight() {
        return this._node && this._node.clientHeight;
    }

    _onKeyUp = (cm: any, event: any) => {
        if (AUTO_COMPLETE_AFTER_KEY.test(event.key)) {
            this.editor.execCommand('autocomplete');
        }
    }

    _onEdit = () => {
        if (!this.ignoreChangeEvent) {
            this.cachedValue = this.editor.getValue();
            if (this.props.onEdit) {
                this.props.onEdit(this.cachedValue);
            }
        }
    }

    /**
     * Render a custom UI for CodeMirror's hint which includes additional info
     * about the type and description for the selected context.
     */
    _onHasCompletion = (cm: any, data: any) => {
        //onHasCompletion(cm, data, this.props.onHintInformationRender);
    }

    _onBeforeChange(instance: any, change: any) {
        // The update function is only present on non-redo, non-undo events.
        // if (change.origin === 'paste') {
        //     const text = change.text.map(normalizeWhitespace);
        //     change.update(change.from, change.to, text);
        // }
    }
}