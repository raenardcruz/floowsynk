import { watch } from 'vue'
import { MonacoEditorProps } from './MonacoEditor.types'
import { editor } from 'monaco-editor'

export const useWatchProps = (props: MonacoEditorProps, editorInstance: editor.IStandaloneCodeEditor) => {
    watch(
        () => props.modelValue,
        (newVal) => {
            if (editorInstance && newVal !== editorInstance.getValue()) {
                const model = editorInstance.getModel()
                if (model) {
                    model.pushEditOperations(
                        [],
                        [{
                            range: model.getFullModelRange(),
                            text: newVal
                        }],
                        () => null
                    )
                }
            }
        }
    )
}