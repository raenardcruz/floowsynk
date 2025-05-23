<template>
  <div class="loader">
    <p class="heading">Loading</p>
    <div class="loading">
      <div class="load"></div>
      <div class="load"></div>
      <div class="load"></div>
      <div class="load"></div>
    </div>
    <div class="caption">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: 'Please wait',
  },
})
</script>

<style scoped>
  .loader {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .heading {
    position: relative;
    display: flex;
    color: black;
    letter-spacing: 0.2em;
    margin-bottom: 1em;
  }

  .caption {
    position: relative;
    display: flex;
    color: var(--grey-2);
    letter-spacing: 0.2em;
    margin-top: 1em;
    font-size: 12px;
  }

  .loading {
    display: flex;
    width: 5em;
    align-items: center;
    justify-content: center;
  }

  .load {
    width: 23px;
    height: 3px;
    background-color: limegreen;
    animation: 1s move_5011 infinite;
    border-radius: 5px;
    margin: 0.1em;
  }

  .load:nth-child(1) {
    animation-delay: 0.2s;
  }

  .load:nth-child(2) {
    animation-delay: 0.4s;
  }

  .load:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes move_5011 {
    0% {
      width: 0.2em;
    }

    25% {
      width: 0.7em;
    }

    50% {
      width: 1.5em;
    }

    100% {
      width: 0.2em;
    }
  }
</style>
