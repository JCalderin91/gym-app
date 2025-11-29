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
        <div class="flex items-center gap-2 mb-1">
          <button @click="handleBack"
            class="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110">
            <FeatherIcon name="arrow-left" :size="20" color="currentColor" />
          </button>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent transition-all duration-300" :class="titleGradientClass">
            Mi Perfil
          </h1>
        </div>
        <p class="text-gray-300 text-lg">Gestiona tu información personal</p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-8">
        <FeatherIcon name="loader" :size="32" color="#9CA3AF" class="animate-spin mx-auto" />
        <p class="text-gray-500 mt-4">Cargando perfil...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Formulario de perfil -->
      <div v-else class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border-2 transition-all duration-300" :class="profileCardBorderClass">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Información del usuario (solo lectura) -->
          <div class="pb-6 border-b-2 transition-all duration-300 rounded-xl p-6 -mx-6 -mt-6 mb-6" :class="headerBackgroundClass">
            
            <!-- Foto de perfil -->
            <div class="flex flex-col items-center mb-4">
              <div v-if="userAvatarUrl" class="relative mb-3">
                <img
                  :src="userAvatarUrl"
                  :alt="user?.user_metadata?.full_name || 'Foto de perfil'"
                  class="w-24 h-24 rounded-full border-4 shadow-lg object-cover"
                  :class="profileBorderClass"
                  @error="handleImageError"
                />
                <div class="absolute inset-0 rounded-full border-4 opacity-0 hover:opacity-100 transition-opacity" :class="profileBorderHoverClass"></div>
                <!-- Símbolo de género -->
                <div v-if="form.gender" class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center">
                  <span class="text-2xl font-extrabold" :class="genderSymbolClass">{{ genderSymbol }}</span>
                </div>
              </div>
              
              <!-- Nombre -->
              <div v-if="user?.user_metadata?.full_name" class="text-center">
                <p class="text-lg font-semibold text-gray-900">{{ user.user_metadata.full_name }}</p>
              </div>
              
              <!-- Email -->
              <div v-if="user?.email" class="text-center mt-1">
                <p class="text-sm text-gray-600">{{ user.email }}</p>
              </div>
              
              <!-- Edad, IMC y Categoría -->
              <div v-if="age !== null || (form.weight && form.height)" class="text-center mt-2 flex justify-center gap-2 flex-wrap">
                <span v-if="age !== null" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md">
                  {{ age }} años
                </span>
                <span 
                  v-if="form.weight && form.height" 
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md cursor-help relative group"
                >
                  IMC: {{ bmi.toFixed(1) }}
                  <!-- Tooltip -->
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 w-64">
                    <div class="mb-2 font-bold text-sm">Índice de Masa Corporal (IMC)</div>
                    <div class="text-xs leading-relaxed text-gray-200">
                      El IMC es una medida que relaciona tu peso con tu altura. Se calcula dividiendo tu peso (kg) entre tu altura al cuadrado (m²). Es una herramienta útil para evaluar si tu peso está dentro de un rango saludable.
                    </div>
                    <!-- Flecha del tooltip -->
                    <div class="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-gray-900"></div>
                  </div>
                </span>
                <span v-if="form.weight && form.height && bmiCategory" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-md" :class="bmiCategoryBadgeClass">
                  {{ bmiCategory }}
                </span>
              </div>
            </div>
          </div>

          <!-- Información del perfil -->
          <div>
            <div class="space-y-4">
              <!-- Fecha de nacimiento -->
              <div>
                <label for="born_date" class="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de nacimiento <span class="text-red-500">*</span>
                  <span v-if="age" class="ml-2 text-sm font-normal text-gray-500">({{ age }} años)</span>
                </label>
                <input
                  id="born_date"
                  v-model="form.born_date"
                  type="date"
                  required
                  class="w-full px-4 h-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <!-- Género, Peso y Altura en una línea -->
              <div class="grid grid-cols-3 gap-4">
                <!-- Género -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Género <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.gender"
                    required
                    class="w-full px-4 h-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Selecciona</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>

                <!-- Peso -->
                <div>
                  <label for="weight" class="block text-sm font-semibold text-gray-700 mb-2">
                    Peso (kg) <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="weight"
                    v-model.number="form.weight"
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    class="w-full px-4 h-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <!-- Altura -->
                <div>
                  <label for="height" class="block text-sm font-semibold text-gray-700 mb-2">
                    Altura (cm) <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="height"
                    v-model.number="form.height"
                    type="number"
                    min="0"
                    required
                    class="w-full px-4 h-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <!-- Barra de rango de peso ideal -->
              <div v-if="form.height && form.weight" class="bg-white rounded-lg p-4 border border-gray-200">
                <label class="block text-sm font-semibold text-gray-700 mb-3">Rango de peso ideal</label>
                
                <!-- Información del rango -->
                <div class="flex justify-between items-center mb-2 text-xs text-gray-600">
                  <span>Mínimo: {{ idealWeightRange.min.toFixed(1) }} kg</span>
                  <span class="font-semibold text-gray-900">Tu peso: {{ form.weight }} kg</span>
                  <span>Máximo: {{ idealWeightRange.max.toFixed(1) }} kg</span>
                </div>

                <!-- Barra visual -->
                <div class="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <!-- Rango ideal (zona verde con gradiente decorativo) -->
                  <div
                    class="absolute h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-500"
                    :style="{
                      left: `${idealRangeStartPercent}%`,
                      width: `${idealRangeWidthPercent}%`
                    }"
                  ></div>
                  
                  <!-- Indicador del peso actual con flecha -->
                  <div
                    class="absolute z-10"
                    :style="{ left: `${currentWeightPosition}%`, transform: 'translateX(-50%)' }"
                  >
                    <!-- Etiqueta con peso -->
                    <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div class="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                        {{ form.weight }} kg
                      </div>
                    </div>
                    <!-- Flecha apuntando hacia abajo -->
                    <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-gray-900"></div>
                    <!-- Línea vertical -->
                    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-900"></div>
                  </div>
                </div>

                <!-- Estado del peso -->
                <div class="mt-3 text-center">
                  <span
                    class="text-sm font-semibold px-3 py-1 rounded-full"
                    :class="weightStatusClass"
                  >
                    {{ weightStatusText }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="saving || !hasChanges"
              class="w-full px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :class="submitButtonClass"
            >
              <FeatherIcon v-if="saving" name="loader" :size="18" color="currentColor" class="animate-spin" />
              <span>{{ saving ? 'Guardando...' : 'Guardar cambios' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Mensaje de éxito -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 translate-y-2"
      >
        <div
          v-if="showSuccess"
          class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 max-w-[640px] w-[calc(100%-2rem)]"
        >
          <div class="flex items-center gap-2">
            <FeatherIcon name="check-circle" :size="20" color="currentColor" />
            <span>Perfil actualizado correctamente</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Topbar from '../components/Topbar.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import { useAuth } from '../composables/useAuth'
import { useProfile } from '../composables/useProfile'

const router = useRouter()
const { user, signOut } = useAuth()
const { profile, loading, error, fetchProfile, updateProfile } = useProfile()

const saving = ref(false)
const showSuccess = ref(false)
const imageError = ref(false)

const form = ref({
  born_date: '',
  weight: 0,
  height: 0,
  gender: ''
})

// URL de la foto de perfil de Google
const userAvatarUrl = computed(() => {
  if (imageError.value) return null
  return user.value?.user_metadata?.avatar_url || user.value?.user_metadata?.picture || null
})

const handleImageError = () => {
  imageError.value = true
}

// Símbolo de género
const genderSymbol = computed(() => {
  switch (form.value.gender) {
    case 'masculino':
      return '♂'
    case 'femenino':
      return '♀'
    default:
      return ''
  }
})

// Clase CSS para el símbolo de género
const genderSymbolClass = computed(() => {
  switch (form.value.gender) {
    case 'masculino':
      return 'text-blue-600'
    case 'femenino':
      return 'text-pink-600'
    default:
      return 'text-gray-600'
  }
})

// Clase CSS para el borde de la foto de perfil según el género
const profileBorderClass = computed(() => {
  switch (form.value.gender) {
    case 'masculino':
      return 'border-blue-500'
    case 'femenino':
      return 'border-pink-500'
    default:
      return 'border-white'
  }
})

// Clase CSS para el hover del borde de la foto de perfil
const profileBorderHoverClass = computed(() => {
  switch (form.value.gender) {
    case 'masculino':
      return 'border-blue-600'
    case 'femenino':
      return 'border-pink-600'
    default:
      return 'border-blue-500'
  }
})

// Clase CSS para el borde de la tarjeta del perfil según el género
const profileCardBorderClass = computed(() => {
  switch (form.value.gender) {
    case 'masculino':
      return 'border-blue-300/50 shadow-blue-200/20'
    case 'femenino':
      return 'border-pink-300/50 shadow-pink-200/20'
    default:
      return 'border-white/20'
  }
})

// Clase CSS para el botón de guardar según el género
const submitButtonClass = computed(() => {
  switch (form.value.gender) {
    case 'masculino':
      return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    case 'femenino':
      return 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
    default:
      return 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
  }
})

// Clase CSS para el gradiente del título según el género
const titleGradientClass = computed(() => {
  switch (form.value.gender) {
    case 'masculino':
      return 'bg-gradient-to-r from-white via-blue-200 to-blue-300'
    case 'femenino':
      return 'bg-gradient-to-r from-white via-pink-200 to-rose-300'
    default:
      return 'bg-gradient-to-r from-white to-blue-200'
  }
})

// Clase CSS para el fondo del header según el género
const headerBackgroundClass = computed(() => {
  switch (form.value.gender) {
    case 'masculino':
      return 'bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 border-blue-200'
    case 'femenino':
      return 'bg-gradient-to-br from-pink-50 via-rose-100/50 to-pink-50 border-pink-200'
    default:
      return 'bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50 border-gray-200'
  }
})

// Calcular edad
const age = computed(() => {
  if (!form.value.born_date) return null
  
  const birthDate = new Date(form.value.born_date)
  const today = new Date()
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  // Si aún no ha cumplido años este año, restar 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age >= 0 ? age : null
})

// Calcular IMC
const bmi = computed(() => {
  if (!form.value.weight || !form.value.height) return 0
  const heightInMeters = form.value.height / 100
  return form.value.weight / (heightInMeters * heightInMeters)
})

// Categoría de IMC
const bmiCategory = computed(() => {
  const bmiValue = bmi.value
  if (bmiValue < 18.5) return 'Bajo peso'
  if (bmiValue < 25) return 'Peso normal'
  if (bmiValue < 30) return 'Sobrepeso'
  return 'Obesidad'
})

// Clase CSS para el badge de categoría según el IMC
const bmiCategoryBadgeClass = computed(() => {
  const bmiValue = bmi.value
  if (bmiValue < 18.5) {
    return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
  }
  if (bmiValue < 25) {
    return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
  }
  if (bmiValue < 30) {
    return 'bg-gradient-to-r from-orange-400 to-red-400 text-white'
  }
  return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
})

// Rango de peso ideal (IMC entre 18.5 y 24.9)
const idealWeightRange = computed(() => {
  if (!form.value.height) {
    return { min: 0, max: 0 }
  }
  const heightInMeters = form.value.height / 100
  const minWeight = 18.5 * heightInMeters * heightInMeters
  const maxWeight = 24.9 * heightInMeters * heightInMeters
  return { min: minWeight, max: maxWeight }
})

// Rango visual para la barra (extendemos un poco para mostrar mejor)
const visualWeightRange = computed(() => {
  const ideal = idealWeightRange.value
  if (ideal.min === 0 && ideal.max === 0) {
    return { min: 0, max: 100 }
  }
  // Extendemos 10% por cada lado para mejor visualización
  const range = ideal.max - ideal.min
  const padding = range * 0.1
  return {
    min: Math.max(0, ideal.min - padding),
    max: ideal.max + padding
  }
})

// Porcentaje de inicio del rango ideal en la barra
const idealRangeStartPercent = computed(() => {
  const visual = visualWeightRange.value
  const ideal = idealWeightRange.value
  if (visual.max === visual.min) return 0
  return ((ideal.min - visual.min) / (visual.max - visual.min)) * 100
})

// Ancho del rango ideal como porcentaje
const idealRangeWidthPercent = computed(() => {
  const visual = visualWeightRange.value
  const ideal = idealWeightRange.value
  if (visual.max === visual.min) return 0
  return ((ideal.max - ideal.min) / (visual.max - visual.min)) * 100
})

// Posición del peso actual en la barra (porcentaje)
const currentWeightPosition = computed(() => {
  const visual = visualWeightRange.value
  const currentWeight = form.value.weight
  if (visual.max === visual.min) return 0
  
  // Limitar la posición entre 0 y 100%
  const position = ((currentWeight - visual.min) / (visual.max - visual.min)) * 100
  return Math.max(0, Math.min(100, position))
})

// Estado del peso respecto al rango ideal
const weightStatusText = computed(() => {
  const currentWeight = form.value.weight
  const ideal = idealWeightRange.value
  
  if (ideal.min === 0 && ideal.max === 0) return ''
  
  if (currentWeight < ideal.min) {
    const diff = ideal.min - currentWeight
    return `Por debajo del ideal (${diff.toFixed(1)} kg)`
  } else if (currentWeight > ideal.max) {
    const diff = currentWeight - ideal.max
    return `Por encima del ideal (+${diff.toFixed(1)} kg)`
  } else {
    return 'Dentro del rango ideal ✓'
  }
})

// Clase CSS para el estado del peso
const weightStatusClass = computed(() => {
  const currentWeight = form.value.weight
  const ideal = idealWeightRange.value
  
  if (ideal.min === 0 && ideal.max === 0) return 'bg-gray-200 text-gray-600'
  
  if (currentWeight < ideal.min) {
    return 'bg-yellow-100 text-yellow-800'
  } else if (currentWeight > ideal.max) {
    return 'bg-orange-100 text-orange-800'
  } else {
    return 'bg-green-100 text-green-800'
  }
})

// Verificar si hay cambios en el formulario
const hasChanges = computed(() => {
  if (!profile.value) {
    // Si no hay perfil, hay cambios si hay datos en el formulario
    return !!(form.value.born_date && form.value.gender && form.value.weight > 0 && form.value.height > 0)
  }
  
  // Comparar cada campo con el perfil guardado
  const profileBornDate = profile.value.born_date ? new Date(profile.value.born_date).toISOString().split('T')[0] : ''
  const formBornDate = form.value.born_date || ''
  
  return (
    profileBornDate !== formBornDate ||
    profile.value.gender !== form.value.gender ||
    Math.abs(profile.value.weight - form.value.weight) > 0.01 ||
    profile.value.height !== form.value.height
  )
})

const handleBack = () => {
  router.push('/home')
}

const handleSubmit = async () => {
  saving.value = true
  try {
    await updateProfile({
      born_date: form.value.born_date,
      weight: form.value.weight,
      height: form.value.height,
      gender: form.value.gender
    })
    
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Error al guardar perfil:', err)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchProfile()
  if (profile.value) {
    form.value = {
      born_date: profile.value.born_date,
      weight: profile.value.weight,
      height: profile.value.height,
      gender: profile.value.gender
    }
  }
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

