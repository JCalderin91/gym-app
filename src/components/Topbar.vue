<template>
  <div class="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Título en el centro -->
        <h1 class="text-xl font-bold text-white">Gym App</h1>

        <div class="flex items-center gap-2">
          <!-- Botón Añadir a la derecha -->
          <button
            v-if="showAddButton"
            @click="$emit('add')"
            class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <FeatherIcon name="plus" :size="18" color="currentColor" />
            Añadir
          </button>
          <button
            @click="$emit('logout')"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-red-200/20 hover:bg-white/30 text-red-500 transition-all duration-200 hover:scale-110"
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

defineProps<{
  showAddButton?: boolean
}>()

defineEmits<{
  add: []
  logout: []
}>()
</script>

