<template>
    <div class="sidebar" v-if="visible">
        <div class="title">{{ title }}</div>
        <div class="caption">{{ caption }}</div>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useVModel } from '@vueuse/core'
import { SidebarProps } from './Sidebar.types'
import { EMIT_VISIBLE } from './Sidebar.constants'

const props = defineProps<SidebarProps>()
const emit = defineEmits([EMIT_VISIBLE])

const visible = useVModel(props, 'visible', emit)
</script>

<style scoped src="./Sidebar.styles.css"></style>