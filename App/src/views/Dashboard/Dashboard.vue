<template>
    <div style="padding: 0px 20px 0px 20px;">
        <h2>Dashboard</h2>
        <Button id="test" label="test">
            <template v-slot:icon>
                <img style="height: 24px;" :src="VieIcon" alt="View Icon" />
            </template>
        </Button>
    </div>
</template>

<script lang="ts" setup>
import Button from '@/components/Composable/UI/Buttons/PrimaryButton.vue'
import VieIcon from '@/components/Icons/basic/view.svg'
</script>