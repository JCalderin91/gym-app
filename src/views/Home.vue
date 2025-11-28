<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 relative overflow-hidden">
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
    </div>

    <!-- Topbar -->
    <div class="relative z-50">
      <Topbar @logout="signOut" />
    </div>

        <!-- Contenido principal -->
        <div class="container mx-auto px-4 py-6 relative z-10 max-w-[640px]">
          <div class="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-1">
                Bienvenido
              </h2>
              <p class="text-gray-300 text-md">{{ user?.email }}</p>
            </div>
            <button
              @click="handleAdd"
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
              title="Añadir ejercicio"
            >
              <FeatherIcon name="plus" :size="18" color="currentColor" />
              Añadir
            </button>
          </div>

      <!-- Lista de registros -->
      <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-white/20">
        <div class="flex items-center justify-between gap-4 mb-6">
          <h2 class="font-bold text-gray-900">Tus Registros</h2>
          <div class="flex items-center gap-2">
            <!-- Selector de fecha -->
            <div class="flex items-center gap-2">
              <input
                id="date-selector"
                v-model="selectedDate"
                type="date"
                @change="handleDateChange"
                class="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
              />
              <button
                v-if="!isToday"
                @click="resetToToday"
                class="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                title="Ver hoy"
              >
                Hoy
              </button>
            </div>
              <button
                v-if="records.length > 0 && !loading"
                @click="refreshRecords"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                title="Actualizar"
              >
                <FeatherIcon name="refresh-cw" :size="20" color="currentColor" />
              </button>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-8">
          <FeatherIcon name="loader" :size="32" color="#9CA3AF" class="animate-spin mx-auto" />
          <p class="text-gray-500 mt-4">Cargando registros...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="records.length === 0" class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 text-center border border-gray-200/50">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <FeatherIcon name="activity" :size="32" color="#FFFFFF" class="mx-auto" />
          </div>
          <p class="text-gray-700 text-lg font-semibold mb-2">No tienes registros aún</p>
          <p class="text-gray-500 text-sm">Haz clic en "Añadir" para registrar tu primer ejercicio</p>
        </div>

        <!-- Lista de registros agrupados por ejercicio -->
        <div v-else class="space-y-6">
          <div
            v-for="(exerciseRecords, exerciseName) in groupedRecords"
            :key="exerciseName"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <!-- Encabezado del ejercicio -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200/50">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  {{ exerciseName }}
                  <span class="text-sm font-normal text-gray-500 ml-2">
                    ({{ exerciseRecords.length }} {{ exerciseRecords.length === 1 ? 'serie' : 'series' }})
                  </span>
                </h3>
                <button
                  @click="handleAddMoreSeries(exerciseRecords[0])"
                  class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm"
                  title="Añadir más series"
                >
                  <FeatherIcon name="plus" :size="20" color="currentColor" />
                </button>
              </div>
            </div>
            
            <!-- Series del ejercicio -->
            <div class="divide-y divide-gray-100">
              <div
                v-for="record in exerciseRecords"
                :key="record.id"
                class="px-2 py-1 hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-center">
                  <div class="flex-1">
                    <div class="flex flex-wrap gap-2 text-sm text-gray-600 items-center">
                      <span 
                        v-if="record.feeling !== undefined && record.feeling !== null"
                        class="w-3 h-3 rounded-full flex-shrink-0"
                        :class="getFeelingBgColor(record.feeling)"
                        :title="getFeelingLabel(record.feeling)"
                      ></span>
                      <span class="flex items-center gap-1">
                        <FeatherIcon name="zap" :size="16" color="currentColor" />
                        <strong>{{ record.weight }} {{ getUnitSymbol(record) }}</strong>
                      </span>
                      <span class="flex items-center gap-1">
                        <FeatherIcon name="hash" :size="16" color="currentColor" />
                        <strong>{{ record.quantity }} reps</strong>
                      </span>
                      <span class="flex items-center gap-1 text-gray-500">
                        <FeatherIcon name="clock" :size="16" color="currentColor" />
                        {{ formatDate(record.created_at) }}
                      </span>
                    </div>
                  </div>
                  <button
                    @click="handleDelete(record.id)"
                    class="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <FeatherIcon name="trash-2" :size="16" color="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Topbar from '../components/Topbar.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import { useAuth } from '../composables/useAuth'
import { useRecords } from '../composables/useExercises'

const router = useRouter()
const { user, signOut, checkUser } = useAuth()
const { records, loading, fetchRecords, deleteRecord } = useRecords()

const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectedDate = ref<string>(getTodayDateString())

const isToday = computed(() => {
  return selectedDate.value === getTodayDateString()
})

// Agrupar registros por ejercicio
const groupedRecords = computed(() => {
  const grouped: Record<string, any[]> = {}
  
  records.value.forEach((record: any) => {
    const exerciseName = record.exercises?.name || 'Ejercicio desconocido'
    if (!grouped[exerciseName]) {
      grouped[exerciseName] = []
    }
    grouped[exerciseName].push(record)
  })
  
  // Ordenar cada grupo por fecha (más reciente primero)
  Object.keys(grouped).forEach(key => {
    const group = grouped[key]
    if (group) {
      group.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }
  })
  
  return grouped
})

    const handleAdd = () => {
      router.push('/add-exercise')
    }

    const handleAddMoreSeries = (record: any) => {
      // Navegar a add-exercise con el ejercicio preseleccionado
      if (record?.exercise_id) {
        router.push(`/add-exercise?exercise_id=${record.exercise_id}`)
      } else {
        router.push('/add-exercise')
      }
    }

const refreshRecords = async () => {
  if (!selectedDate.value) {
    await fetchRecords()
    return
  }
  // Parsear la fecha en zona horaria local para evitar problemas de UTC
  const parts = selectedDate.value.split('-').map(Number)
  if (parts.length !== 3 || parts.some(p => isNaN(p))) {
    await fetchRecords()
    return
  }
  const year = parts[0]!
  const month = parts[1]!
  const day = parts[2]!
  const localDate = new Date(year, month - 1, day)
  await fetchRecords(undefined, localDate)
}

const handleDateChange = async () => {
  if (!selectedDate.value) {
    await fetchRecords()
    return
  }
  // Parsear la fecha en zona horaria local para evitar problemas de UTC
  const parts = selectedDate.value.split('-').map(Number)
  if (parts.length !== 3 || parts.some(p => isNaN(p))) {
    await fetchRecords()
    return
  }
  const year = parts[0]!
  const month = parts[1]!
  const day = parts[2]!
  const localDate = new Date(year, month - 1, day)
  await fetchRecords(undefined, localDate)
}

const resetToToday = () => {
  selectedDate.value = getTodayDateString()
  handleDateChange()
}

const handleDelete = async (recordId: string) => {
  if (!confirm('¿Estás seguro de eliminar este registro?')) {
    return
  }

  try {
    await deleteRecord(recordId)
    if (!selectedDate.value) {
      await fetchRecords()
      return
    }
    // Parsear la fecha en zona horaria local para evitar problemas de UTC
    const parts = selectedDate.value.split('-').map(Number)
    if (parts.length !== 3 || parts.some(p => isNaN(p))) {
      await fetchRecords()
      return
    }
    const year = parts[0]!
    const month = parts[1]!
    const day = parts[2]!
    const localDate = new Date(year, month - 1, day)
    await fetchRecords(undefined, localDate)
  } catch (error: any) {
    alert(error.message || 'Error al eliminar el registro')
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }

  if (date.toDateString() === today.toDateString()) {
    return `Hoy a las ${date.toLocaleTimeString('es-ES', timeOptions)}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Ayer a las ${date.toLocaleTimeString('es-ES', timeOptions)}`
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
}

const getUnitSymbol = (record: any) => {
  if (record.units?.symbol) {
    return record.units.symbol
  }
  return 'kg' // Valor por defecto si no hay unidad
}

const getFeelingLabel = (feeling: number) => {
  const labels = ['Bien', 'Normal', 'Regular', 'Cansado']
  return labels[feeling] || ''
}

const getFeelingBgColor = (feeling: number) => {
  const colors = ['bg-yellow-400', 'bg-blue-500', 'bg-orange-500', 'bg-red-500']
  return colors[feeling] || 'bg-gray-500'
}

onMounted(async () => {
  await checkUser()
  const today = new Date()
  // Usar fecha local para evitar problemas de zona horaria
  const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  await fetchRecords(undefined, localDate)
})
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
