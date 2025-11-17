<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <!-- Topbar -->
    <Topbar @add="handleAdd" @logout="signOut" />

    <!-- Contenido principal -->
    <div class="container mx-auto px-4 py-4">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">Bienvenido</h2>
        <p class="text-gray-300">{{ user?.email }}</p>
      </div>

      <!-- Lista de registros -->
      <div class="bg-white rounded-2xl shadow-2xl p-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Tus Registros</h2>
          <button
            v-if="records.length > 0"
            @click="refreshRecords"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <FeatherIcon name="refresh-cw" :size="20" color="currentColor" />
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-8">
          <FeatherIcon name="loader" :size="32" color="#9CA3AF" class="animate-spin mx-auto" />
          <p class="text-gray-500 mt-4">Cargando registros...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="records.length === 0" class="bg-gray-50 rounded-xl p-8 text-center">
          <FeatherIcon name="activity" :size="48" color="#9CA3AF" class="mx-auto mb-4" />
          <p class="text-gray-500 text-lg mb-2">No tienes registros aún</p>
          <p class="text-gray-400 text-sm">Haz clic en "Añadir" para registrar tu primer ejercicio</p>
        </div>

        <!-- Lista de registros agrupados por ejercicio -->
        <div v-else class="space-y-6">
          <div
            v-for="(exerciseRecords, exerciseName) in groupedRecords"
            :key="exerciseName"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <!-- Encabezado del ejercicio -->
            <div class="bg-gray-50 px-4 py-1 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FeatherIcon name="activity" :size="18" color="#3B82F6" />
                  {{ exerciseName }}
                  <span class="text-sm font-normal text-gray-500 ml-2">
                    ({{ exerciseRecords.length }} {{ exerciseRecords.length === 1 ? 'serie' : 'series' }})
                  </span>
                </h3>
                <button
                  @click="handleAddMoreSeries(exerciseRecords[0])"
                  class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
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
                class="px-2 hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-center">
                  <div class="flex-1">
                    <div class="flex flex-wrap gap-4 text-sm text-gray-600">
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
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Topbar from '../components/Topbar.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import { useAuth } from '../composables/useAuth'
import { useRecords } from '../composables/useExercises'

const router = useRouter()
const { user, signOut, checkUser } = useAuth()
const { records, loading, fetchRecords, deleteRecord } = useRecords()

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
  await fetchRecords()
}

const handleDelete = async (recordId: string) => {
  if (!confirm('¿Estás seguro de eliminar este registro?')) {
    return
  }

  try {
    await deleteRecord(recordId)
    await fetchRecords()
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

onMounted(async () => {
  await checkUser()
  await fetchRecords()
})
</script>
