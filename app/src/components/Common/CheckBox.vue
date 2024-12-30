<template>
    <div class="field">
        <div class="checkbox-container" :class="{'selected': isChecked}" @click="toggle">
        <div class="circle" :class="{'selected': isChecked}">
            <span class="material-symbols-outlined" v-if="isChecked" style="color: green;">check</span>
            <span class="material-symbols-outlined" v-else style="color: red;">close</span>
        </div>
    </div>
    <span>{{ label }}</span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  label: String
});

const emit = defineEmits(['update:modelValue']);

const isChecked = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const toggle = () => {
  isChecked.value = !isChecked.value;
};
</script>

<style scoped src="./CheckBox.css"></style>