<template>
    <h2>Pages</h2>
    <div id="editorjs" class="p-3"></div>
</template>

<script setup>
import EditorJS from '@editorjs/editorjs';
import MyTool from '@/components/Page/Tools/CustomTool';

const editor = new EditorJS({
  holder: 'editorjs', 
  tools: { 
    myCustomTool: {
        class: MyTool,
    },
  },
});
</script>