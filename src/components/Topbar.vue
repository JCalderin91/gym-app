<template>
  <div class="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-lg">
    <div class="container mx-auto px-4 relative z-50 max-w-[640px]">
      <div class="flex justify-between items-center h-16">
        <!-- Título en el centro -->
        <h1 class="text-xl font-bold text-white">Gym App</h1>

        <div class="flex items-center gap-2">
          <!-- Menú hamburguesa -->
          <div class="relative z-[100]" ref="menuRef">
            <button
              @click.stop="toggleMenu"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110 relative z-[100]"
              title="Menú"
            >
              <FeatherIcon name="menu" :size="20" color="currentColor" />
            </button>

            <!-- Menú desplegable -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="menuOpen"
                class="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden z-[100]"
                @click.stop
              >
                    <button
                      @click="handleHome"
                      class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <FeatherIcon name="home" :size="18" color="currentColor" />
                      Home
                    </button>
                <button
                  @click="handleCharts"
                  class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <FeatherIcon name="bar-chart-2" :size="18" color="currentColor" />
                  Gráficas
                </button>
                <button
                  @click="handleProfile"
                  class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <FeatherIcon name="user" :size="18" color="currentColor" />
                  Perfil
                </button>
                <div class="border-t border-gray-200"></div>
                <button
                  @click="handleLogout"
                  class="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <FeatherIcon name="log-out" :size="18" color="currentColor" />
                  Salir
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import FeatherIcon from './FeatherIcon.vue'

const router = useRouter()
const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

    const handleHome = () => {
      closeMenu()
      router.push('/home')
    }

const handleCharts = () => {
  closeMenu()
  router.push('/charts')
}

const handleProfile = () => {
  closeMenu()
  router.push('/profile')
}

const emit = defineEmits<{
  logout: []
}>()

const handleLogout = () => {
  closeMenu()
  emit('logout')
}

// Manejar clics fuera del menú
const handleClickOutside = (event: MouseEvent) => {
  if (!menuOpen.value) return
  
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  // Usar setTimeout para evitar que el evento se dispare inmediatamente al abrir
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
