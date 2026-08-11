import { watch } from 'vue'
import { MonacoEditorProps } from './MonacoEditor.types'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { formatAndDetectLanguage } from './MonacoEditor.helper'

export const useWatchProps = (props: MonacoEditorProps, editorInstance: editor.IStandaloneCodeEditor) => {
    watch(
        () => props.modelValue,
        (newVal) => {
            if (editorInstance) {
                const { value, language } = formatAndDetectLanguage(newVal || '')
                const model = editorInstance.getModel()
                if (model && value !== editorInstance.getValue()) {
                    monaco.editor.setModelLanguage(model, language)
                    model.pushEditOperations(
                        [],
                        [{
                            range: model.getFullModelRange(),
                            text: value
                        }],
                        () => null
                    )
                }
            }
        }
    )
    watch(
        () => props.disabled,
        (disabled) => {
            if (editorInstance) {
                editorInstance.updateOptions({ readOnly: disabled || false })
            }
        }
    )
}