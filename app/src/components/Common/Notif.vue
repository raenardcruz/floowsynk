<template>
    <div v-for="(alert, index) in alerts" :key="index" class="alert" :style="{bottom: `${(index + 1) * 50}px`}" :class="alert.status">
        {{ alert.message }}
    </div>
</template>

<script lang="ts" setup>
import { ref, defineExpose } from "vue"
import { Alert } from "../Common/Interfaces"

const alerts = ref<Alert[]>([]);
const show = (msg: string, status="info") => {
    const alert = { message: msg, visible: true, status: status };
    alerts.value.push(alert);
    setTimeout(() => {
        const index = alerts.value.indexOf(alert);
        if (index !== -1) {
            alerts.value.splice(index, 1);
        }
    }, 5000);
};

const success = (msg: string) => show(msg, "success");
const error = (msg: string) => show(msg, "error");
const info = (msg: string) => show(msg, "info");

defineExpose({
    success,
    error,
    info
});
</script>

<style scoped>
.alert {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    border-radius: 10px;
    height: fit-content;
    width: fit-content;
    min-width: 100px;
    background: rgb(198, 111, 58);
    font-size: 15px;
    color: #fff;
    justify-self: center;
    z-index: 10;
    animation: alert-entry 5.5s;
}
.info {
    background: #6199B9;
}
.success {
    background: #7AB961;
}
.error {
    background: #B96461;
}

@keyframes alert-entry {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    20% {
        opacity: 1;
        transform: translateY(0px);
    }

    80% {
        opacity: 1;
        transform: translateY(0px);
    }

    100% {
        opacity: 0;
        transform: translateY(20px);
    }
}
</style>