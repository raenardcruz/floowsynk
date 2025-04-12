import { Ref } from 'vue'
import * as monaco from 'monaco-editor'
import {
    getDefaultSuggestions,
    EMIT_MODAL,
    LANGUAGE,
    TEMPLATE,
    TEMPLATE_CODE,
    TEMPLATE_COMMENTS,
    STRING,
    NUMBER,
    CLASS,
    STRING_INVALID,
    VARIABLE_DOCUMENTATION
} from "./MonacoEditor.contants"
import { MonacoEditorProps } from './MonacoEditor.types'
import { useWatchProps } from './MonacoEditor.hooks'


export const registerCustomLanguage = (props: MonacoEditorProps) => {
    monaco.languages.register({ id: LANGUAGE })

    setTokenProvider()
    defineTheme()
    return registerCompletionProvider(props)
}

export const initMonacoEditor = (editorContainer: Ref<HTMLDivElement | null>, props: MonacoEditorProps, emit: (event: "update:modelValue", ...args: any[]) => void) => {
    let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
    if (editorContainer.value) {
        editorInstance = monaco.editor.create(editorContainer.value, {
            value: props.modelValue,
            language: LANGUAGE,
            automaticLayout: true,
            theme: TEMPLATE,
            wordWrap: 'on',
            cursorBlinking: "phase",
            minimap: {
                enabled: true
            },
            readOnly: props.disabled || false,
        })

        editorInstance.onDidChangeModelContent(() => {
            const value = editorInstance?.getValue() || ''
            emit(EMIT_MODAL, value)
        })
    }
    if (editorInstance) {
        useWatchProps(props, editorInstance)
    }
    return editorInstance
}

export const disposeMonacoEditor = (editorInstance: monaco.editor.IStandaloneCodeEditor | null, mnco: monaco.IDisposable) => {
    mnco?.dispose()
    editorInstance?.dispose()
}

const setTokenProvider = () => {
    return monaco.languages.setMonarchTokensProvider(LANGUAGE, {
        tokenizer: {
            root: [
                [/{{.+?}}/, TEMPLATE_CODE],
                [/{{\/\*.*?\*\/}}/, TEMPLATE_COMMENTS],
                [/"([^"\\]|\\.)*$/, STRING_INVALID],
                [/"([^"\\]|\\.)*"/, STRING],
                [/\b\d+(\.\d+)?\b/, NUMBER],
            ]
        }
    })
}
const defineTheme = () => {
    monaco.editor.defineTheme(TEMPLATE, {
        base: 'vs',
        inherit: true,
        rules: [
            { token: TEMPLATE_CODE, foreground: '077D81' },
            { token: TEMPLATE_COMMENTS, foreground: '43a564' },
            { token: STRING, foreground: 'ff0000' },
            { token: NUMBER, foreground: '0000ff' },
            { token: CLASS, foreground: '00ff00' },
        ],
        colors: {}
    })
}
const registerCompletionProvider = (props: MonacoEditorProps) => {
    return monaco.languages.registerCompletionItemProvider(LANGUAGE, {
        triggerCharacters: [''],
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position)
            const range = new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
            )
            const inlineText = model.getLineContent(position.lineNumber)

            let suggestions = getDefaultSuggestions(monaco, range)
            props.variables.forEach(v => {
                if (suggestions.findIndex(f => f.label == v) == -1) {
                    suggestions.push({
                        label: String(v),
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: `{{ .${v} }}`,
                        range: range,
                        documentation: VARIABLE_DOCUMENTATION
                    })
                }
            })

            const isInsideRange = /{{.+(range|if|with).+}}/.test(inlineText)
            if (isInsideRange) {
                return {
                    suggestions: suggestions.filter(f => f.kind == monaco.languages.CompletionItemKind.Variable).map(s => ({
                        ...s,
                        insertText: s.insertText.replace('{{ .', '').replace(' }}', '')
                    }))
                }
            }

            return {
                suggestions
            }
        }
    })
}