<template>
    <div class="background" :class="{ show: appDrawer }" @click.self="closeAppDrawer">
        <span class="material-symbols-outlined close" @click="closeAppDrawer">close</span>
        <div class="apps-container" :class="{ showapp: appDrawer }">
            <div class="app" @click.prevent="navigateTo('/')">
                <img src="./Icons/dashboard.svg" alt="dashboard" />
                <span>Dashboard</span>
            </div>
            <div class="app" @click.prevent="navigateTo('/pages')">
                <img src="./Icons/pages.svg" alt="pages" />
                <span>Pages</span>
            </div>
            <div class="app" @click.prevent="navigateTo('/workflow')">
                <img src="./Icons/workflow.svg" alt="workflow" />
                <span>Workflow</span>
            </div>
            <div class="app" @click.prevent="navigateTo('/connectors')">
                <img src="./Icons/connection.svg" alt="connection" />
                <span>Connectors</span>
            </div>
            <div class="app" @click.prevent="navigateTo('/reviews')">
                <img src="./Icons/approve.svg" alt="approve" />
                <span>Reviews</span>
            </div>
            <div class="app" @click.prevent="navigateTo('/accounts')">
                <img src="./Icons/user.svg" alt="user" />
                <span>Accounts</span>
            </div>
            <div class="app" @click.prevent="navigateTo('/logs')">
                <img src="./Icons/logs.svg" alt="logs" />
                <span>Logs</span>
            </div>
            <div class="app" @click.prevent="navigateTo('/settings')">
                <img src="./Icons/settings.svg" alt="settings" />
                <span>Settings</span>
            </div>
        </div>
        <div class="iconfooter">Vectors and icons by <a href="https://www.svgrepo.com" target="_blank">SVG Repo</a></div>
    </div>
</template>

<script setup lang="ts">
import { appDrawerStore } from "./AppDrawer";
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = function (path: string) {
    router.push(path);
    appDrawer.value = false;
}

const { appDrawer } = appDrawerStore();
const closeAppDrawer = function () {
    appDrawer.value = false;
}
const test = function () {
    console.log("test");
}
</script>

<style scoped>
.background {
    display: flex;
    position: absolute;
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
    z-index: -1;
    transform: translateY(-10px);
    justify-content: center;
    align-items: center;
}
.show {
    opacity: 1;
    z-index: 100;
    transform: translateY(0px);
}
.close {
    color: #fff;
    display: flex;
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
}
.apps-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 20px;
    border-radius: 10px;
    transition: all 0.3s;
    opacity: 0;
    transition-delay: 0.15s;
    transform: scale(1.3);
}
.showapp {
    opacity: 1;
    transform: scale(1);
}
.apps-container .app {
    background: #DCDCDD;
    height: 100px;
    width: 100px;
    border-radius: 20px;
    box-shadow: 0 10px 20px grey;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s;
}
.apps-container .app:hover {
    box-shadow: 10px 10px 8px #545B62;
    transform: scale(1.05);
}
.apps-container .app img {
    width: 50px;
    height: 50px;
}
.iconfooter {
    position: absolute;
    bottom: 10px;
    color: #fff;
    font-size: 8px;
    left: 10px;
}
@media (max-width: 768px) {
    .apps-container {
        grid-template-columns: 1fr;
    }
}
</style>