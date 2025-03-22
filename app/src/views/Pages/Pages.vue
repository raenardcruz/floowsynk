<template>
    <h2>Pages</h2>
    <div class="p-3">
        <div id="editorjs"></div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import EditorJS from '@editorjs/editorjs';
import MyTool from '@/components/Page/Tools/CustomTool';

onMounted(() => {
  const editor = new EditorJS({
    holder: 'editorjs', 
    tools: { 
      myCustomTool: {
          class: MyTool,
      },
    },
  });
});
</script>