<template>
 <span style="color: #14BF47; margin-right: 10px;" class="material-symbols-outlined"
    v-if="props.type == 'defaultnode' || props.type == 'default'">flag_circle</span>
<span style="color: #09a6d6; margin-right: 10px;" class="material-symbols-outlined"
    v-else-if="props.type == 'interval'">schedule</span>
<span style="color: #b86a11; margin-right: 10px;" class="material-symbols-outlined"
    v-else-if="props.type == 'webhook'">webhook</span>
<span style="color: #A3245B; margin-right: 10px;" class="material-symbols-outlined"
    v-else-if="props.type == 'events'">event</span>
<span class="material-symbols-outlined" style="color: #84ab86; margin-right: 10px;"
    v-else-if="props.type == 'default'">
    radio_button_unchecked
</span>
</template>

<script setup lang="ts">
    import { defineProps } from 'vue';

    const props = defineProps<{
        type: string;
    }>();
</script>