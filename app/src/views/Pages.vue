<template>
    <h2>Pages</h2>
    <div id="editorjs" class="p-3"></div>
</template>

<script setup>
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'; 
import List from '@editorjs/list'; 

const editor = new EditorJS({
    holder: 'editorjs', 
  
  tools: { 
    header: Header, 
    list: List 
  },
});
</script>