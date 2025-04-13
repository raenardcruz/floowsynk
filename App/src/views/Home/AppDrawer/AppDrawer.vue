<template>
    <div class="background" :class="{ show: appDrawer }" @click.self="closeAppDrawer">
        <span class="material-symbols-outlined close" @click="closeAppDrawer">close</span>
        <div class="apps-container" :class="{ showapp: appDrawer }">
            <div class="app" v-for="app in apps" :key="app.name" @click.prevent="navigateTo(app.path)">
                <img :src="app.icon" :alt="app.name + ' icon'" />
                <span>{{ app.name }}</span>
            </div>
        </div>
        <div class="iconfooter">Vectors and icons by <a href="https://www.svgrepo.com" target="_blank">SVG Repo</a></div>
    </div>
</template>

<script setup lang="ts">
import { apps } from "./AppDrawer.constants";
import { useAppDrawerStore } from '.';
import { closeAppDrawer, navigateTo } from './AppDrawer.helper';

const { appDrawer } = useAppDrawerStore();
</script>

<style scoped src="./AppDrawer.styles.css" />