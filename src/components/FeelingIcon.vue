<template>
  <div 
    class="feeling-icon"
    :class="`feeling-${feeling}`"
    :style="{ backgroundImage: `url(${feelingSprite})` }"
  ></div>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'
import feelingSprite from '../assets/feeling.png'

interface Props {
  feeling: number
}

withDefaults(defineProps<Props>(), {
  feeling: 1
})
</script>

<style scoped>
.feeling-icon {
  width: 100%;
  height: 100%;
  background-size: 200% 200%;
  background-repeat: no-repeat;
  image-rendering: pixelated;
}

.feeling-0 {
  background-position: 0% 0%;
}

.feeling-1 {
  background-position: 102% -3%;
}

.feeling-2 {
  background-position: -3% 100%;
}

.feeling-3 {
  background-position: 101% 100%;
}
</style>

