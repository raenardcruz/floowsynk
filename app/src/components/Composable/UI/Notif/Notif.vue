<template>
  <teleport :to="teleportTarget">
    <div class="alert" :class="type" :style="{ bottom: `${15 + ((index - 1) * 25)}px` }">
      <slot></slot>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Notif',
  props: {
    teleportTarget: {
      type: String,
      default: 'body'
    },
    type: {
      type: String,
      default: 'info'
    },
    index: {
      type: Number,
      required: true
    }
  }
});
</script>

<style scoped src="./Notif.styles.css"></style>