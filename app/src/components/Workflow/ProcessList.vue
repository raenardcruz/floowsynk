<template>
    <div class="gallery-box">
        <div class="page-title">Process Gallery</div>
        <div class="page-info">
            <span>Showing</span>
            <span style="color: #3990C5;">10</span>
            <span>out of 30 Processes</span>
        </div>
        <div class="gallery-search">
            <input class="search-box" type="search" placeholder="Search" v-model="search">
        </div>
        <div class="cards-gallery">
            <div class="create" @click="ProcessList.createProcess"></div>
            <div class="card" v-for="process in filteredProcesses" :key="process.id" :class="process.type"
                @click="ProcessList.cardClicked(process)">
                <div class="type">
                    <span style="color: #14BF47; margin-right: 10px;" class="material-symbols-outlined"
                        v-if="process.type == 'default'">flag_circle</span>
                    <span style="color: #09a6d6; margin-right: 10px;" class="material-symbols-outlined"
                        v-else-if="process.type == 'interval'">schedule</span>
                    <span style="color: #b86a11; margin-right: 10px;" class="material-symbols-outlined"
                        v-else-if="process.type == 'webhook'">webhook</span>
                    <span style="color: #A3245B; margin-right: 10px;" class="material-symbols-outlined"
                        v-else-if="process.type == 'events'">event</span>
                    <span class="material-symbols-outlined" style="color: #84ab86; margin-right: 10px;"
                        v-else-if="process.type == 'default'">
                        radio_button_unchecked
                    </span>
                    <span class="type-text">{{ process.type }}</span>
                </div>
                <div class="card-title">
                    <span>{{ process.title }}</span>
                </div>
                <div class="card-description">{{ process.description }}</div>
                <div class="tags">
                    <div class="tag" v-for="tab in process.tags">{{ tab }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ProcessList } from "./ProcessList"
const { search, filteredProcesses } = ProcessList.store;
</script>

<style scoped src="./ProcessList.css"></style>