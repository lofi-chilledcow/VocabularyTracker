export interface Word {
  id: string
  word: string
  meaning: string
  sentence?: string
  category?: string
  antonym?: string
  synonyms: string[]
  created_at: string
  updated_at: string
}

export interface WordFormData {
  word: string
  meaning: string
  sentence?: string
  category?: string
  antonym?: string
  synonyms?: string[]
}

export interface DailyGroup {
  date: string
  count: number
  words: Word[]
}

export interface Stats {
  totalWords: number
  totalCategories: number
  wordsToday: number
  wordsThisWeek: number
  streakDays: number
}

export type SortOption = 'date' | 'alpha' | 'category'

export interface FilterState {
  sort: SortOption
  q: string
  category: string
}
