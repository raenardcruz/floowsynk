export const EMIT_MODAL = 'update:modelValue'
export const LANGUAGE = 'gotemplate'
export const TEMPLATE = 'floowsynk-template'
export const TEMPLATE_CODE = 'template-code'
export const TEMPLATE_COMMENTS = 'template-comments'
export const STRING = 'string'
export const NUMBER = 'number'
export const CLASS = 'class'
export const STRING_INVALID = 'string.invalid'
export const VARIABLE_DOCUMENTATION = 'Snippet for inserting a variable. Change the variable name and TempField to your desired value'
export const getDefaultSuggestions = function (monaco: any, range: any) {
  return [
    {
      label: 'variable',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'Snippet for inserting a variable. Change the variable name and TempField to your desired value',
      insertText: '{{ $variable := .TempField }}',
      range
    },
    {
      label: 'ifelse',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'Snippet for inserting a IFElse statement',
      insertText: [
        '{{ if eq .Var1 .Var2 }}',
        '\t',
        '{{ else }}',
        '\t',
        '{{ end }}'
      ].join('\n'),
      range
    },
    {
      label: 'if',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'Snippet for inserting a IFElse statement. Change the condition to your desired value',
      insertText: [
        '{{ if eq .Var1 .Var2 }}',
        '\t',
        '{{ end }}'
      ].join('\n'),
      range
    },
    {
      label: 'range',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'Snippet for inserting a IFElse statement. Change the Item array to your desired value',
      insertText: [
        '{{ range .Items }}',
        '\t{{ . }}',
        '{{ end }}'
      ].join('\n'),
      range
    },
    {
      label: 'with',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'Snippet for inserting a IFElse statement. Change the Item array to your desired value',
      insertText: [
        '{{ with .Field }}',
        '\t{{ . }}',
        '{{ end }}'
      ].join('\n'),
      range
    },
    {
      label: 'comments',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'Snippet for adding a comment',
      insertText: '{{/*  */}}',
      range
    }
  ]
}