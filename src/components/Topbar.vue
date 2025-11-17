<template>
  <div class="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Título en el centro -->
        <h1 class="text-xl font-bold text-white">Gym App</h1>

        <div class="flex items-center gap-2">
          <!-- Botón Añadir a la derecha -->
          <button
            @click="$emit('add')"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg flex items-center gap-2"
          >
            <FeatherIcon name="plus" :size="18" color="currentColor" />
            Añadir
          </button>
          <button
            @click="$emit('logout')"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110"
            title="Cerrar sesión"
          >
            <FeatherIcon name="log-out" :size="20" color="currentColor" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FeatherIcon from './FeatherIcon.vue'

defineEmits<{
  add: []
  logout: []
}>()
</script>

