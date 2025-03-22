<template>
  <div class="dropzone-background">
    <Background :size="2" :gap="20" pattern-color="#BDBDBD" />
    <div class="overlay">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Background } from '@vue-flow/background'
</script>

<style scoped src="./Dropzone.styles.css"></style>
