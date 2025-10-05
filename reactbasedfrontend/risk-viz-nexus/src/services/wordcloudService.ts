import api from './api'

export interface WordcloudWordsData {
  words: Array<{
    text: string
    value: number
    color?: string
    category?: string
  }>
  metadata: Record<string, any>
}

export interface WordcloudImageData {
  image_base64: string
  content_type: string
}

export const wordcloudService = {
  // Generate Wordcloud Words
  getWords: (params: {
    incident_sheet?: string
    hazard_sheet?: string
    top_n?: number
    min_count?: number
    extra_stopwords?: string[]
  }) => 
    api.post<WordcloudWordsData>('/wordcloud/words', params),

  // Export Wordcloud Image
  getImage: (params: {
    words: Array<{text: string, value: number, color?: string}>
    width?: number
    height?: number
    colormap?: string
  }) => 
    api.post<WordcloudImageData>('/wordcloud/image', params)
}