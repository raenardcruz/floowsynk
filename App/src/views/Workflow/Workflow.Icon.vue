<template>
 <span style="color: #10b981;" class="material-symbols-outlined icon-symbol"
    v-if="props.type == 'defaultnode' || props.type == 'default'">flag_circle</span>
<span style="color: #06b6d4;" class="material-symbols-outlined icon-symbol"
    v-else-if="props.type == 'interval'">schedule</span>
<span style="color: #f59e0b;" class="material-symbols-outlined icon-symbol"
    v-else-if="props.type == 'webhook'">webhook</span>
<span style="color: #ec4899;" class="material-symbols-outlined icon-symbol"
    v-else-if="props.type == 'events'">event</span>
<span class="material-symbols-outlined icon-symbol" style="color: #8b5cf6;"
    v-else>
    radio_button_unchecked
</span>
</template>

<script setup lang="ts">
    const props = defineProps<{
        type: string
    }>()
</script>