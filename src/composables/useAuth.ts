import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const router = useRouter()
  const user = ref<User | null>(null)
  const loading = ref(true)

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      loading.value = false
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      alert('Error al iniciar sesión con Google')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Error al cerrar sesión')
    }
  }

  // Configurar listener de cambios de autenticación
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    checkUser
  }
}

