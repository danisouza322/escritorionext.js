"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { useTheme } from 'next-themes'

// Tipos de humor disponíveis
export type MoodType = 'calm' | 'energetic' | 'focused' | 'creative' | 'neutral'

// Definição do tema de cores para cada humor
export interface MoodTheme {
  name: string
  description: string
  icon: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  darkMode: boolean
}

// Paleta de cores para cada humor
const moodThemes: Record<MoodType, MoodTheme> = {
  calm: {
    name: 'Calmo',
    description: 'Cores suaves para momentos tranquilos',
    icon: '🌊',
    colors: {
      primary: 'hsl(210, 70%, 50%)',
      secondary: 'hsl(210, 40%, 70%)',
      accent: 'hsl(200, 80%, 60%)',
      background: 'hsl(210, 30%, 98%)'
    },
    darkMode: false
  },
  energetic: {
    name: 'Energético',
    description: 'Cores vibrantes para alta produtividade',
    icon: '⚡',
    colors: {
      primary: 'hsl(350, 70%, 50%)',
      secondary: 'hsl(20, 80%, 60%)',
      accent: 'hsl(40, 90%, 60%)',
      background: 'hsl(30, 30%, 98%)'
    },
    darkMode: false
  },
  focused: {
    name: 'Focado',
    description: 'Cores neutras para melhor concentração',
    icon: '🎯',
    colors: {
      primary: 'hsl(260, 60%, 50%)',
      secondary: 'hsl(260, 40%, 70%)',
      accent: 'hsl(280, 70%, 60%)',
      background: 'hsl(260, 20%, 98%)'
    },
    darkMode: true
  },
  creative: {
    name: 'Criativo',
    description: 'Cores inspiradoras para momentos criativos',
    icon: '🎨',
    colors: {
      primary: 'hsl(150, 60%, 40%)',
      secondary: 'hsl(180, 50%, 60%)',
      accent: 'hsl(120, 70%, 50%)',
      background: 'hsl(160, 30%, 98%)'
    },
    darkMode: false
  },
  neutral: {
    name: 'Neutro',
    description: 'Design padrão do sistema',
    icon: '🔄',
    colors: {
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--secondary))',
      accent: 'hsl(var(--accent))',
      background: 'hsl(var(--background))'
    },
    darkMode: false
  }
}

// Interface para o contexto
interface MoodThemeContextType {
  currentMood: MoodType
  setMood: (mood: MoodType) => void
  moodTheme: MoodTheme
  availableMoods: MoodType[]
}

// Valor padrão para o contexto
const defaultContextValue: MoodThemeContextType = {
  currentMood: 'neutral',
  setMood: () => {},
  moodTheme: moodThemes.neutral,
  availableMoods: ['calm', 'energetic', 'focused', 'creative', 'neutral']
}

// Criação do contexto
const MoodThemeContext = createContext<MoodThemeContextType>(defaultContextValue)

// Hook para usar o contexto
export const useMoodTheme = () => useContext(MoodThemeContext)

// Provider do contexto
export function MoodThemeProvider({ children }: { children: ReactNode }) {
  // Estado para o humor atual
  const [currentMood, setCurrentMood] = useState<MoodType>('neutral')
  
  // Acesso ao tema do sistema
  const { setTheme } = useTheme()
  
  // Tema de cores baseado no humor
  const moodTheme = moodThemes[currentMood]
  
  // Lista de todos os humores disponíveis
  const availableMoods = Object.keys(moodThemes) as MoodType[]
  
  // Função para alterar o humor
  const setMood = (mood: MoodType) => {
    setCurrentMood(mood)
    
    // Salvar preferência no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userMood', mood)
    }
    
    // Aplicar tema claro/escuro baseado na configuração do humor
    setTheme(moodThemes[mood].darkMode ? 'dark' : 'light')
  }
  
  // Efeito para carregar preferência salva no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMood = localStorage.getItem('userMood') as MoodType | null
      if (savedMood && moodThemes[savedMood]) {
        setCurrentMood(savedMood)
        setTheme(moodThemes[savedMood].darkMode ? 'dark' : 'light')
      }
    }
  }, [setTheme])
  
  // Efeito para aplicar as cores do tema atual via CSS variables
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      
      // Aplicar variáveis CSS personalizadas
      root.style.setProperty('--mood-primary', moodTheme.colors.primary)
      root.style.setProperty('--mood-secondary', moodTheme.colors.secondary)
      root.style.setProperty('--mood-accent', moodTheme.colors.accent)
      root.style.setProperty('--mood-background', moodTheme.colors.background)
    }
  }, [moodTheme])
  
  return (
    <MoodThemeContext.Provider value={{ currentMood, setMood, moodTheme, availableMoods }}>
      {children}
    </MoodThemeContext.Provider>
  )
}