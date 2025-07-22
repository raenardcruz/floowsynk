
<template>
    <FloatLabel variant="on" pt:root:class="text-box" v-tooltip.focus.bottom="tooltip">
        <div class="input-wrapper">
            <InputText
                :type="isPasswordType ? (showPassword ? 'text' : 'password') : (type ? type : 'text')"
                :id="id"
                v-model="modelValue"
                :placeholder="placeholder"
                autocomplete="off"
            />
            <button
                v-if="isPasswordType"
                type="button"
                class="toggle-password"
                @click="toggleShowPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
                <img style="height: 24px; width: 24px;" :src="showPassword ? HideViewIcon : ViewIcon" alt="Toggle password visibility" />
            </button>
        </div>
        <label for="on_label">{{ label }}</label>
    </FloatLabel>
</template>

<script lang="ts" setup>
import { defineModel, defineProps, ref, computed } from 'vue'
import { IdProps } from '@/components/Composable/constants'
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import ViewIcon from '@/components/Icons/basic/view.svg'
import HideViewIcon from '@/components/Icons/basic/view-hide.svg'

interface Props extends IdProps {
    label: string,
    placeholder?: string,
    type?: string,
}

const props = defineProps<Props>()
const modelValue = defineModel({
    type: String,
    default: ''
})

const showPassword = ref(false)
const isPasswordType = computed(() => props.type === 'password')
const toggleShowPassword = () => {
    showPassword.value = !showPassword.value
}
</script>

<style scoped>
    .text-box {
        margin-bottom: 10px;   
    }
    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }
    .text-box input {
        width: 100%;
        height: 2.5rem;
        font-size: 1rem;
        border-radius: 20px;
        padding-right: 2.5rem;
    }
    .toggle-password {
        position: absolute;
        right: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        z-index: 2;
        padding: 0 0.5rem;
        color: #888;
    }
    .toggle-password:focus {
        outline: none;
    }
    .text-box input:focus {
        border-color: black;
        color: black;
    }
    .text-box label {
        display: flex;
        position: absolute;
        top: 50%;
        left: 1rem;
        transform: translateY(-50%);
        color: var(--grey-1) !important;
        font-size: 0.875rem;
        transition: all 0.2s ease-in-out;
    }
</style>