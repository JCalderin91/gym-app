import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: number
  born_date: string
  weight: number
  height: number
  gender: string
  created_at: string
  user_id: string
}

export const useProfile = () => {
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error('Error al obtener usuario: ' + userError.message)
      }
      
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error: fetchError } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        // Si no existe perfil (código PGRST116), no es un error crítico
        // Simplemente retornamos null para indicar que no hay perfil
        if (fetchError.code === 'PGRST116') {
          profile.value = null
          error.value = null // No es un error, simplemente no existe perfil
          return
        }
        throw fetchError
      }

      // Asegurarse de que el perfil pertenece al usuario actual
      if (data && data.user_id !== user.id) {
        throw new Error('El perfil no pertenece al usuario actual')
      }

      profile.value = data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar perfil'
      console.error('Error fetching profile:', err)
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData: {
    born_date: string
    weight: number
    height: number
    gender: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error('Error al obtener usuario: ' + userError.message)
      }
      
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado')
      }

      // Verificar si ya existe un perfil para este usuario
      const { data: existingProfile, error: checkError } = await supabase
        .from('profile')
        .select('id, user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingProfile) {
        // Actualizar perfil existente del usuario actual
        const { data, error: updateError } = await supabase
          .from('profile')
          .update({
            born_date: profileData.born_date,
            weight: profileData.weight,
            height: profileData.height,
            gender: profileData.gender
          })
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError
        profile.value = data
      } else {
        // Crear nuevo perfil para el usuario actual
        const { data, error: insertError } = await supabase
          .from('profile')
          .insert({
            user_id: user.id,
            born_date: profileData.born_date,
            weight: profileData.weight,
            height: profileData.height,
            gender: profileData.gender
          })
          .select()
          .single()

        if (insertError) throw insertError
        profile.value = data
      }
    } catch (err: any) {
      error.value = err.message || 'Error al guardar perfil'
      console.error('Error updating profile:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  }
}

