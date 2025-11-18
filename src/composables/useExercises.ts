import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export interface Category {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface Exercise {
  id: number
  name: string
  description?: string
  created_at: string
  category_id?: number
}

export interface Unit {
  id: number
  name: string
  symbol: string
  created_at: string
}

export interface Record {
  id: string
  weight: string
  quantity: number
  exercise_id: number
  user_id: string
  created_at: string
  unit_id?: number
}

export const useCategories = () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      categories.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Error al cargar categorías'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories
  }
}

export const useUnits = () => {
  const units = ref<Unit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUnits = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('units')
        .select('*')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      units.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Error al cargar unidades'
      console.error('Error fetching units:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    units,
    loading,
    error,
    fetchUnits
  }
}

export const useExercises = () => {
  const exercises = ref<Exercise[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchExercises = async (categoryId?: number) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      exercises.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Error al cargar ejercicios'
      console.error('Error fetching exercises:', err)
    } finally {
      loading.value = false
    }
  }

  const createExercise = async (name: string, categoryId: number, description?: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: createError } = await supabase
        .from('exercises')
        .insert([{ name, category_id: categoryId, description }])
        .select()
        .single()

      if (createError) throw createError
      return data
    } catch (err: any) {
      error.value = err.message || 'Error al crear ejercicio'
      console.error('Error creating exercise:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    exercises,
    loading,
    error,
    fetchExercises,
    createExercise
  }
}

export const useRecords = () => {
  const records = ref<Record[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRecords = async (userId?: string, date?: Date) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userIdToUse = userId || user?.id

      if (!userIdToUse) {
        throw new Error('Usuario no autenticado')
      }

      let query = supabase
        .from('records')
        .select(`
          *,
          exercises (
            id,
            name,
            description
          ),
          units (
            id,
            name,
            symbol
          )
        `)
        .eq('user_id', userIdToUse)

      // Filtrar por fecha si se proporciona
      if (date) {
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      records.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Error al cargar registros'
      console.error('Error fetching records:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTodayRecordsByExercise = async (exerciseId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Obtener inicio y fin del día actual
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

      const { data, error: fetchError } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      return data || []
    } catch (err: any) {
      console.error('Error fetching today records:', err)
      return []
    }
  }

  const createRecord = async (exerciseId: number, weight: string, quantity: number, unitId?: number) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const recordData: any = {
        exercise_id: exerciseId,
        weight: weight.toString(),
        quantity,
        user_id: user.id
      }

      if (unitId) {
        recordData.unit_id = unitId
      }

      const { data, error: createError } = await supabase
        .from('records')
        .insert([recordData])
        .select()
        .single()

      if (createError) throw createError
      return data
    } catch (err: any) {
      error.value = err.message || 'Error al crear registro'
      console.error('Error creating record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRecord = async (recordId: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('records')
        .delete()
        .eq('id', recordId)

      if (deleteError) throw deleteError
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar registro'
      console.error('Error deleting record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchRecordsByDateRange = async (startDate: Date, endDate: Date, userId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userIdToUse = userId || user?.id

      if (!userIdToUse) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error: fetchError } = await supabase
        .from('records')
        .select(`
          *,
          exercises (
            id,
            name,
            description
          ),
          units (
            id,
            name,
            symbol
          )
        `)
        .eq('user_id', userIdToUse)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      return data || []
    } catch (err: any) {
      console.error('Error fetching records by date range:', err)
      return []
    }
  }

  return {
    records,
    loading,
    error,
    fetchRecords,
    fetchTodayRecordsByExercise,
    fetchRecordsByDateRange,
    createRecord,
    deleteRecord
  }
}

