<template>
    <div v-for="(alert, index) in alerts" :key="index" class="alert" :style="{bottom: `${(index + 1) * 40}px`}" :class="alert.status">
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

defineExpose({
    show
});
</script>

<style scoped>
.alert {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    border-radius: 20px;
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
    background: #3990C5;
}
.success {
    background: rgb(3, 122, 43);
}
.error {
    background: rgb(156, 51, 33);
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