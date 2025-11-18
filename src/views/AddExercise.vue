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
    <div class="container mx-auto p-4 max-w-[640px] relative z-10">
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-1">
          <button @click="handleFinish"
            class="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110">
            <FeatherIcon name="arrow-left" :size="20" color="currentColor" />
          </button>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Registrar Ejercicios
          </h2>
        </div>
        <p class="text-gray-300 text-lg">Registra tus series mientras entrenas</p>
      </div>

      <!-- Ejercicio seleccionado -->
      <div v-if="currentExercise" class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-3 mb-4 border border-white/20">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-white mb-1">{{ currentExercise.name }}</h3>
            <p v-if="currentExercise.description" class="text-blue-100 text-sm">
              {{ currentExercise.description }}
            </p>
          </div>
          <button @click="changeExercise"
            class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors" title="Cambiar ejercicio">
            <FeatherIcon name="edit-2" :size="18" color="currentColor" />
          </button>
        </div>
      </div>

      <!-- Seleccionar categoría y ejercicio (si no hay uno seleccionado) -->
      <div v-else class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 mb-6 space-y-4 border border-white/20">
        <!-- Paso 1: Seleccionar categoría -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Selecciona una categoría</h3>
          
          <!-- Loading state -->
          <div v-if="loadingCategories" class="text-center py-4">
            <FeatherIcon name="loader" :size="24" color="#9CA3AF" class="animate-spin mx-auto" />
            <p class="text-gray-500 mt-2 text-sm">Cargando categorías...</p>
          </div>
          
          <!-- Error state -->
          <div v-else-if="categoriesError" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{{ categoriesError }}</p>
          </div>
          
          <!-- Empty state -->
          <div v-else-if="categories.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 text-sm">No hay categorías disponibles. Por favor crea una categoría primero.</p>
          </div>
          
          <!-- Categories list -->
          <select
            v-else
            v-model="selectedCategoryId"
            @change="onCategorySelected"
            class="w-full px-4 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option :value="null" disabled>Selecciona una categoría</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Paso 2: Seleccionar ejercicio de la categoría -->
        <div>
          <div class="flex gap-2">
            <select
              v-model="form.exercise_id"
              @change="selectExercise"
              class="flex-1 px-4 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option :value="null" disabled>Selecciona un ejercicio</option>
              <option v-for="exercise in exercises" :key="exercise.id" :value="exercise.id">
                {{ exercise.name }}
              </option>
            </select>
            <button
              @click="openNewExerciseModal"
              class="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              title="Crear nuevo ejercicio"
            >
              <FeatherIcon name="plus" :size="18" color="currentColor" />
            </button>
          </div>
        </div>
      </div>

      <!-- Series agregadas en esta sesión -->
      <div v-if="currentExercise && sessionRecords.length > 0" class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 mb-4 border border-white/20">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Series de hoy</h3>
        <div class="space-y-2">
          <div v-for="(record, index) in sessionRecords" :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-gray-500">Serie {{ index + 1 }}</span>
              <span class="text-gray-700">
                <strong>{{ record.weight }} {{ getUnitSymbol(record.unit_id) }}</strong> × {{ record.quantity }} reps
              </span>
            </div>
            <span class="text-xs text-gray-400">
              {{ formatTime(record.timestamp) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Formulario rápido para agregar serie -->
      <div v-if="currentExercise" class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-white/20">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Agregar Serie</h3>
        <form @submit.prevent="handleAddSeries" class="space-y-4">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label for="weight" class="block text-sm font-semibold text-gray-700 mb-2">
                Peso <span class="text-red-500">*</span>
              </label>
              <input id="weight" v-model="form.weight" type="text" required placeholder="Ej: 5" autofocus
                class="w-full px-4 h-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label for="unit" class="block text-sm font-semibold text-gray-700 mb-2">
                Unidad
              </label>
              <select
                id="unit"
                v-model="form.unit_id"
                class="w-full px-4 h-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option :value="null">Sin unidad</option>
                <option v-for="unit in units" :key="unit.id" :value="unit.id">
                  {{ unit.symbol }} ({{ unit.name }})
                </option>
              </select>
            </div>
            <div>
              <label for="quantity" class="block text-sm font-semibold text-gray-700 mb-2">
                Reps. <span class="text-red-500">*</span>
              </label>
              <input id="quantity" v-model.number="form.quantity" type="number" min="1" required placeholder="Ej: 10"
                autofocus
                class="w-full px-4 h-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="lastSavedRecord"
            class="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <FeatherIcon name="check-circle" :size="18" color="#10B981" />
            <span class="text-green-800 text-sm font-semibold">
              Serie agregada: {{ lastSavedRecord.weight }} kg × {{ lastSavedRecord.quantity }} reps
            </span>
          </div>

          <button type="submit" :disabled="loading || !form.weight || !form.quantity"
            class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
            <FeatherIcon v-if="loading" name="loader" :size="20" color="currentColor" class="animate-spin" />
            <span v-else>Agregar Serie</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Modal para crear nuevo ejercicio -->
    <div v-if="showNewExerciseModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showNewExerciseModal = false">
      <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 max-w-md w-full border border-white/20">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Nuevo Ejercicio</h3>
        <form @submit.prevent="handleCreateExercise" class="space-y-4">
          <div>
            <label for="new-exercise-category" class="block text-sm font-semibold text-gray-700 mb-2">
              Categoría <span class="text-red-500">*</span>
            </label>
            <select
              id="new-exercise-category"
              v-model="newExercise.category_id"
              required
              class="w-full px-4 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option :value="null" disabled>Selecciona una categoría</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="new-exercise-name" class="block text-sm font-semibold text-gray-700 mb-2">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input id="new-exercise-name" v-model="newExercise.name" type="text" required
              placeholder="Ej: Jalón al pecho"
              class="w-full px-4 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label for="new-exercise-description" class="block text-sm font-semibold text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea id="new-exercise-description" v-model="newExercise.description" rows="3"
              placeholder="Descripción del ejercicio..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"></textarea>
          </div>
          <div class="flex gap-4 pt-2">
            <button type="button" @click="showNewExerciseModal = false"
              class="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
              Cancelar
            </button>
            <button type="submit" :disabled="creatingExercise"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              {{ creatingExercise ? 'Creando...' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Topbar from '../components/Topbar.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import { useAuth } from '../composables/useAuth'
import { useCategories, useExercises, useRecords, useUnits, type Exercise } from '../composables/useExercises'

const router = useRouter()
const route = useRoute()
const { signOut } = useAuth()
const { categories, loading: loadingCategories, error: categoriesError, fetchCategories } = useCategories()
const { exercises, fetchExercises, createExercise } = useExercises()
const { units, fetchUnits } = useUnits()
const { loading, createRecord, fetchTodayRecordsByExercise } = useRecords()

const selectedCategoryId = ref<number | null>(null)

const showNewExerciseModal = ref(false)
const creatingExercise = ref(false)
const currentExercise = ref<Exercise | null>(null)
const sessionRecords = ref<Array<{
  weight: string
  quantity: number
  unit_id?: number
  timestamp: Date
}>>([])

const form = ref({
  exercise_id: null as number | null,
  weight: '',
  unit_id: null as number | null,
  quantity: null as number | null
})

const newExercise = ref({
  name: '',
  category_id: null as number | null,
  description: ''
})

const lastSavedRecord = ref<{
  weight: string
  quantity: number
} | null>(null)

onMounted(async () => {
  try {
    await Promise.all([fetchCategories(), fetchUnits()])
    console.log('Categorías cargadas:', categories.value)
    console.log('Unidades cargadas:', units.value)
    
    // Verificar si hay un ejercicio preseleccionado desde la query string
    const exerciseIdParam = route.query.exercise_id

    if (exerciseIdParam) {
      const exerciseId = parseInt(exerciseIdParam as string)
      // Primero cargar todos los ejercicios para encontrar el seleccionado
      await fetchExercises()
      const exercise = exercises.value.find(e => e.id === exerciseId)
      if (exercise && exercise.category_id) {
        selectedCategoryId.value = exercise.category_id
        await fetchExercises(exercise.category_id)
        form.value.exercise_id = exerciseId
        await selectExercise()
      }
    }
  } catch (error) {
    console.error('Error al inicializar:', error)
  }
})

const onCategorySelected = async () => {
  if (selectedCategoryId.value) {
    await fetchExercises(selectedCategoryId.value)
    form.value.exercise_id = null
  }
}

const selectExercise = async () => {
  if (form.value.exercise_id) {
    const exercise = exercises.value.find(e => e.id === form.value.exercise_id)
    if (exercise) {
      currentExercise.value = exercise
      lastSavedRecord.value = null

      // Cargar registros del día actual para este ejercicio
      const todayRecords = await fetchTodayRecordsByExercise(exercise.id)

      // Convertir los registros al formato de sessionRecords
      sessionRecords.value = todayRecords.map(record => ({
        weight: record.weight,
        quantity: record.quantity,
        unit_id: record.unit_id || undefined,
        timestamp: new Date(record.created_at)
      }))

      // Si hay registros previos, usar el último peso y unidad como sugerencia
      if (todayRecords.length > 0) {
        const lastRecord = todayRecords[todayRecords.length - 1]
        form.value.weight = lastRecord.weight
        form.value.unit_id = lastRecord.unit_id || null
      } else {
        form.value.weight = ''
        form.value.unit_id = null
      }

      form.value.quantity = null
    }
  }
}

const changeExercise = () => {
  currentExercise.value = null
  form.value.exercise_id = null
  sessionRecords.value = []
  form.value.weight = ''
  form.value.quantity = null
  lastSavedRecord.value = null
  // Mantener la categoría seleccionada para facilitar seleccionar otro ejercicio
}

const handleAddSeries = async () => {
  if (!currentExercise.value || !form.value.weight || !form.value.quantity) {
    return
  }

  loading.value = true
  try {
    // Guardar en la base de datos
    await createRecord(
      currentExercise.value.id,
      form.value.weight,
      form.value.quantity,
      form.value.unit_id || undefined
    )

    // Agregar a la lista de sesión
    sessionRecords.value.push({
      weight: form.value.weight,
      quantity: form.value.quantity,
      unit_id: form.value.unit_id || undefined,
      timestamp: new Date()
    })

    // Mostrar mensaje de éxito
    lastSavedRecord.value = {
      weight: form.value.weight,
      quantity: form.value.quantity
    }

    // Mantener el peso y unidad, limpiar solo cantidad
    // El peso y unidad se mantienen para facilitar agregar otra serie
    form.value.quantity = null

    // Ocultar mensaje después de 2 segundos
    setTimeout(() => {
      lastSavedRecord.value = null
    }, 2000)

    // Enfocar el campo de cantidad para siguiente serie
    setTimeout(() => {
      const quantityInput = document.getElementById('quantity') as HTMLInputElement
      if (quantityInput) quantityInput.focus()
    }, 100)
  } catch (error: any) {
    alert(error.message || 'Error al guardar la serie')
  } finally {
    loading.value = false
  }
}

const handleCreateExercise = async () => {
  if (!newExercise.value.category_id) {
    alert('Por favor selecciona una categoría')
    return
  }

  creatingExercise.value = true
  try {
    const exercise = await createExercise(
      newExercise.value.name,
      newExercise.value.category_id,
      newExercise.value.description || undefined
    )

    // Actualizar lista de ejercicios de la categoría
    await fetchExercises(selectedCategoryId.value!)

    // Seleccionar el ejercicio recién creado
    form.value.exercise_id = exercise.id
    await selectExercise()

    // Limpiar y cerrar modal
    newExercise.value = { name: '', category_id: selectedCategoryId.value, description: '' }
    showNewExerciseModal.value = false
  } catch (error) {
    alert('Error al crear el ejercicio')
  } finally {
    creatingExercise.value = false
  }
}

const openNewExerciseModal = () => {
  // Preseleccionar la categoría actual si hay una seleccionada
  if (selectedCategoryId.value) {
    newExercise.value.category_id = selectedCategoryId.value
  }
  showNewExerciseModal.value = true
}

const handleFinish = () => {
  router.push('/home')
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-ES', { 
    hour: 'numeric', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  })
}

const getUnitSymbol = (unitId?: number) => {
  if (!unitId) return ''
  const unit = units.value.find(u => u.id === unitId)
  return unit ? unit.symbol : ''
}
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
