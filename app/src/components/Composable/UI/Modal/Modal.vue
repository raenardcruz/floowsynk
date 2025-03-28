<template>
    <Transition name="fade">
        <div class="background" v-if="visible">
            <Transition name="drop" appear>
                <div class="modal">
                    <div class="modal-header" :style="{ color: fontcolor, backgroundColor: bgcolor }">
                        <span class="title">{{ title }}</span>
                        <span class="caption">{{ caption }}</span>
                        <span @click="visible = false" :style="{ color: fontcolor }"
                            class="material-symbols-outlined btn-close">
                            close
                        </span>
                    </div>
                    <div class="modal-content">
                        <slot></slot>
                    </div>
                    <div class="modal-actions" v-if="showActions">
                        <button class="btn"
                            :style="{ color: fontcolor, background: bgcolor, border: '1px solid ' + fontcolor }"
                            v-if="onSave" @click="onSave">Save</button>
                        <button class="btn"
                            :style="{ color: fontcolor, background: bgcolor, border: '1px solid ' + fontcolor }"
                            v-if="onOk" @click="onOk">Ok</button>
                        <slot name="actions"></slot>
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { ModalProps } from './Modal.types'
import { useModalHooks } from './Modal.hooks'
import { EMMIT_VISIBLE } from './Modal.contants'

const props = defineProps<ModalProps>()
const emit = defineEmits([EMMIT_VISIBLE])

const {
    title,
    caption,
    fontcolor,
    bgcolor,
    onSave,
    onOk,
} = props
const {
    showActions,
    visible,
} = useModalHooks(props, emit);
</script>

<style scoped src="./Modal.styles.css"></style>