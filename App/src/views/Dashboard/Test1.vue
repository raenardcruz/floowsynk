<template>
    <div>
        <img :src="DashboardSvg" alt="Add Icon" class="add-icon" />
        
        <!-- Test Button Components -->
        <div class="button-test-container">
            <h3>Button Component Tests</h3>
            
            <div class="button-row">
                <Button label="Primary Button" variant="primary" @click="handleClick" />
                <Button label="Secondary Button" variant="secondary" @click="handleClick" />
                <Button label="Outline Button" variant="outline" @click="handleClick" />
                <Button label="Ghost Button" variant="ghost" @click="handleClick" />
                <Button label="Danger Button" variant="danger" @click="handleClick" />
            </div>
            
            <div class="button-row">
                <Button label="Small" variant="primary" size="small" @click="handleClick" />
                <Button label="Medium" variant="primary" size="medium" @click="handleClick" />
                <Button label="Large" variant="primary" size="large" @click="handleClick" />
            </div>
            
            <div class="button-row">
                <Button label="Loading" variant="primary" :loading="true" />
                <Button label="Disabled" variant="primary" :disabled="true" />
                <Button label="Rounded" variant="primary" :rounded="true" @click="handleClick" />
            </div>
            
            <div class="button-row">
                <Button label="With Icon" variant="primary" icon="pi pi-check" @click="handleClick" />
                <Button label="Icon Right" variant="primary" icon="pi pi-arrow-right" iconPosition="right" @click="handleClick" />
            </div>
            
            <div class="button-row">
                <PrimaryButton label="Primary Button Component" @click="handleClick" />
                <PrimaryButton :disabled="true" label="Disabled Primary" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import DashboardSvg from '@/components/Icons/dashboard.svg'
import { Button, PrimaryButton } from '@/components/Composable/UI/Buttons'

const handleClick = () => {
    console.log('Button clicked!')
}
</script>

<style scoped>
.tab-label-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}
.add-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
}

.button-test-container {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.button-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}
</style>