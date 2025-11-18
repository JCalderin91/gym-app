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
      <div class="mb-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Gráficas
        </h1>
        <p class="text-gray-300">Progreso de los últimos 14 días</p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-8">
        <FeatherIcon name="loader" :size="32" color="#9CA3AF" class="animate-spin mx-auto" />
        <p class="text-gray-500 mt-4">Cargando datos...</p>
      </div>

      <!-- Gráficas -->
      <div v-else class="space-y-6">
        <!-- Gráfica 1: Progreso de peso por ejercicio -->
        <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/20">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Progreso de Peso por Ejercicio</h2>
          <div class="h-64">
            <canvas ref="weightChartRef"></canvas>
          </div>
        </div>

        <!-- Gráfica 2: Progreso de repeticiones -->
        <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/20">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Progreso de Repeticiones</h2>
          <div class="h-64">
            <canvas ref="repsChartRef"></canvas>
          </div>
        </div>

        <!-- Gráfica 3: Volumen por entrenamiento -->
        <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/20">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Volumen por Entrenamiento</h2>
          <p class="text-sm text-gray-600 mb-4">Volumen = Peso × Repeticiones × Series</p>
          <div class="h-64">
            <canvas ref="volumeChartRef"></canvas>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="records.length === 0" class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 text-center border border-gray-200/50">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <FeatherIcon name="bar-chart-2" :size="32" color="#FFFFFF" class="mx-auto" />
          </div>
          <p class="text-gray-700 text-lg font-semibold mb-2">No hay datos suficientes</p>
          <p class="text-gray-500 text-sm">Necesitas al menos un registro de los últimos 14 días para ver las gráficas</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import Topbar from '../components/Topbar.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import { useAuth } from '../composables/useAuth'
import { useRecords } from '../composables/useExercises'

Chart.register(...registerables)

const { signOut } = useAuth()
const { loading, fetchRecordsByDateRange } = useRecords()

const records = ref<any[]>([])
const weightChartRef = ref<HTMLCanvasElement | null>(null)
const repsChartRef = ref<HTMLCanvasElement | null>(null)
const volumeChartRef = ref<HTMLCanvasElement | null>(null)

let weightChart: Chart | null = null
let repsChart: Chart | null = null
let volumeChart: Chart | null = null

// Obtener los últimos 14 días
const getDateRange = () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 14)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)
  return { startDate, endDate }
}

// Cargar datos
const loadData = async () => {
  const { startDate, endDate } = getDateRange()
  const data = await fetchRecordsByDateRange(startDate, endDate)
  records.value = data || []
  updateCharts()
}

// Preparar datos para gráfica de peso
const prepareWeightData = () => {
  const exerciseMap: Record<string, Record<string, number[]>> = {}
  
  // Obtener todas las fechas únicas
  const allDates = new Set<string>()
  
  records.value.forEach(record => {
    const date = new Date(record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    allDates.add(date)
  })
  
  const sortedDates = Array.from(allDates).sort()
  
  // Inicializar mapas para cada ejercicio
  records.value.forEach(record => {
    const exerciseName = record.exercises?.name || 'Desconocido'
    if (!exerciseMap[exerciseName]) {
      exerciseMap[exerciseName] = {}
      sortedDates.forEach(date => {
        exerciseMap[exerciseName]![date] = []
      })
    }
  })
  
  // Agregar pesos por fecha y ejercicio
  records.value.forEach(record => {
    const exerciseName = record.exercises?.name || 'Desconocido'
    const date = new Date(record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    const weight = parseFloat(record.weight) || 0
    
    const exerciseData = exerciseMap[exerciseName]
    if (exerciseData && exerciseData[date]) {
      exerciseData[date].push(weight)
    }
  })
  
  // Calcular promedio de peso por fecha para cada ejercicio
  const result: Record<string, { dates: string[], weights: number[] }> = {}
  
  Object.keys(exerciseMap).forEach(exerciseName => {
    const exerciseData = exerciseMap[exerciseName]
    if (exerciseData) {
      result[exerciseName] = {
        dates: sortedDates,
        weights: sortedDates.map(date => {
          const weights = exerciseData[date] || []
          if (weights.length === 0) return NaN // NaN para que Chart.js no muestre el punto
          return weights.reduce((sum, w) => sum + w, 0) / weights.length // Promedio de peso
        })
      }
    }
  })
  
  return result
}

// Preparar datos para gráfica de repeticiones
const prepareRepsData = () => {
  const exerciseMap: Record<string, Record<string, number[]>> = {}
  
  // Obtener todas las fechas únicas
  const allDates = new Set<string>()
  
  records.value.forEach(record => {
    const date = new Date(record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    allDates.add(date)
  })
  
  const sortedDates = Array.from(allDates).sort()
  
  // Inicializar mapas para cada ejercicio
  records.value.forEach(record => {
    const exerciseName = record.exercises?.name || 'Desconocido'
    if (!exerciseMap[exerciseName]) {
      exerciseMap[exerciseName] = {}
      sortedDates.forEach(date => {
        exerciseMap[exerciseName]![date] = []
      })
    }
  })
  
  // Agregar repeticiones por fecha y ejercicio
  records.value.forEach(record => {
    const exerciseName = record.exercises?.name || 'Desconocido'
    const date = new Date(record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    const reps = record.quantity || 0
    
    const exerciseData = exerciseMap[exerciseName]
    if (exerciseData && exerciseData[date]) {
      exerciseData[date].push(reps)
    }
  })
  
  // Calcular promedio de repeticiones por fecha para cada ejercicio
  const result: Record<string, { dates: string[], reps: number[] }> = {}
  
  Object.keys(exerciseMap).forEach(exerciseName => {
    const exerciseData = exerciseMap[exerciseName]
    if (exerciseData) {
      result[exerciseName] = {
        dates: sortedDates,
        reps: sortedDates.map(date => {
          const reps = exerciseData[date] || []
          if (reps.length === 0) return NaN // NaN para que Chart.js no muestre el punto
          return reps.reduce((sum, r) => sum + r, 0) / reps.length // Promedio de repeticiones
        })
      }
    }
  })
  
  return result
}

// Preparar datos para gráfica de volumen
const prepareVolumeData = () => {
  const volumeByDate: Record<string, number> = {}
  
  records.value.forEach(record => {
    const date = new Date(record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    const weight = parseFloat(record.weight) || 0
    const reps = record.quantity || 0
    
    if (!volumeByDate[date]) {
      volumeByDate[date] = 0
    }
    
    // Volumen = peso × repeticiones (cada registro es una serie)
    volumeByDate[date] += weight * reps
  })
  
  const dates = Object.keys(volumeByDate).sort()
  const volumes = dates.map(date => volumeByDate[date])
  
  return { dates, volumes }
}

// Crear gráfica de peso
const createWeightChart = () => {
  if (!weightChartRef.value) return
  
  const exerciseData = prepareWeightData()
  
  // Obtener todas las fechas únicas de todos los ejercicios
  const allDates = new Set<string>()
  Object.values(exerciseData).forEach(data => {
    data.dates.forEach(date => allDates.add(date))
  })
  const labels = Array.from(allDates).sort()
  
  const datasets = Object.keys(exerciseData).map((exerciseName, index) => {
    const colors = [
      { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.1)' },
      { border: 'rgb(147, 51, 234)', background: 'rgba(147, 51, 234, 0.1)' },
      { border: 'rgb(236, 72, 153)', background: 'rgba(236, 72, 153, 0.1)' },
      { border: 'rgb(34, 197, 94)', background: 'rgba(34, 197, 94, 0.1)' },
      { border: 'rgb(251, 191, 36)', background: 'rgba(251, 191, 36, 0.1)' }
    ]
    const color = colors[index % colors.length]!
    const exerciseInfo = exerciseData[exerciseName]
    
    if (!exerciseInfo) {
      return null
    }
    
    // Mapear los datos a las fechas del eje X
    const data: (number | null)[] = labels.map(date => {
      const dateIndex = exerciseInfo.dates.indexOf(date)
      if (dateIndex < 0) return null
      const value = exerciseInfo.weights[dateIndex]
      if (value === undefined || value === null || isNaN(value)) return null
      return value
    })
    
    return {
      label: exerciseName,
      data,
      borderColor: color.border,
      backgroundColor: color.background,
      tension: 0.4,
      fill: true,
      spanGaps: false
    }
  }).filter((dataset): dataset is NonNullable<typeof dataset> => dataset !== null)
  
  if (weightChart) {
    weightChart.destroy()
  }
  
  weightChart = new Chart(weightChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Peso (kg)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Fecha'
          }
        }
      }
    }
  })
}

// Crear gráfica de repeticiones
const createRepsChart = () => {
  if (!repsChartRef.value) return
  
  const exerciseData = prepareRepsData()
  
  // Obtener todas las fechas únicas de todos los ejercicios
  const allDates = new Set<string>()
  Object.values(exerciseData).forEach(data => {
    data.dates.forEach(date => allDates.add(date))
  })
  const labels = Array.from(allDates).sort()
  
  const datasets = Object.keys(exerciseData).map((exerciseName, index) => {
    const colors = [
      { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.1)' },
      { border: 'rgb(147, 51, 234)', background: 'rgba(147, 51, 234, 0.1)' },
      { border: 'rgb(236, 72, 153)', background: 'rgba(236, 72, 153, 0.1)' },
      { border: 'rgb(34, 197, 94)', background: 'rgba(34, 197, 94, 0.1)' },
      { border: 'rgb(251, 191, 36)', background: 'rgba(251, 191, 36, 0.1)' }
    ]
    const color = colors[index % colors.length]!
    const exerciseInfo = exerciseData[exerciseName]
    
    if (!exerciseInfo) {
      return null
    }
    
    // Mapear los datos a las fechas del eje X
    const data: (number | null)[] = labels.map(date => {
      const dateIndex = exerciseInfo.dates.indexOf(date)
      if (dateIndex < 0) return null
      const value = exerciseInfo.reps[dateIndex]
      if (value === undefined || value === null || isNaN(value)) return null
      return value
    })
    
    return {
      label: exerciseName,
      data,
      borderColor: color.border,
      backgroundColor: color.background,
      tension: 0.4,
      fill: true,
      spanGaps: false
    }
  }).filter((dataset): dataset is NonNullable<typeof dataset> => dataset !== null)
  
  if (repsChart) {
    repsChart.destroy()
  }
  
  repsChart = new Chart(repsChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Repeticiones'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Fecha'
          }
        }
      }
    }
  })
}

// Crear gráfica de volumen
const createVolumeChart = () => {
  if (!volumeChartRef.value) return
  
  const { dates, volumes } = prepareVolumeData()
  
  if (volumeChart) {
    volumeChart.destroy()
  }
  
  // Filtrar valores undefined y convertir a null
  const volumeData = volumes.map(v => v !== undefined ? v : null)
  
  volumeChart = new Chart(volumeChartRef.value, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Volumen Total',
        data: volumeData,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Volumen (kg × reps)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Fecha'
          }
        }
      }
    }
  })
}

// Actualizar todas las gráficas
const updateCharts = () => {
  if (records.value.length === 0) return
  
  createWeightChart()
  createRepsChart()
  createVolumeChart()
}

onMounted(async () => {
  await loadData()
})

onUnmounted(() => {
  if (weightChart) weightChart.destroy()
  if (repsChart) repsChart.destroy()
  if (volumeChart) volumeChart.destroy()
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
