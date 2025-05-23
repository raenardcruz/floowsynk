<template>
    <label class="container">
        <input v-model="checked" type="checkbox">
        <div class="checkmark"></div>
        <span class="label">{{ label }}</span>
    </label>
</template>

<script setup lang="ts">
const checked = defineModel()
defineProps({
    label: {
        type: String,
        default: ''
    }
})
</script>

<style scoped>
.container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.container {
    display: flex;
    gap: 12px;
    position: relative;
    cursor: pointer;
    font-size: 1rem;
    user-select: none;
    border-radius: 50px;
    align-items: center;
    padding: 8px 12px;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    width: 100%;
    box-sizing: border-box;
}

.container:hover {
    background-color: var(--white-3);
    border-color: var(--grey-3);
}

.checkmark {
    position: relative;
    top: 0;
    left: 0;
    height: 1.5em;
    width: 1.5em;
    background-color: var(--white-3);
    border-radius: 50%;
    transition: background-color 0.3s ease, transform 0.3s ease;
    margin: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 4px var(--grey-4);
    flex-shrink: 0;
}

.container input:checked~.checkmark {
    background-color: var(--green-3);
    border-radius: 4px;
    animation: pulse 500ms ease-in-out;
    transform: scale(1.1);
}

.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

.container input:checked~.checkmark:after {
    display: block;
}

.container .checkmark:after {
    left: 0.5em;
    top: 0.3em;
    width: 0.3em;
    height: 0.6em;
    border: solid var(--white-1);
    border-width: 0 0.2em 0.2em 0;
    transform: rotate(45deg);
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 var(--green-5);
        rotate: 20deg;
    }

    50% {
        rotate: -20deg;
    }

    75% {
        box-shadow: 0 0 0 10px #0B6E4F60;
    }

    100% {
        box-shadow: 0 0 0 13px #0B6E4F30;
        rotate: 0;
    }
}
</style>
