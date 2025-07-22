export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  release_date: string
  popularity: number 
  runtime?: number
  genres?: Array<{
    id: number
    name: string
  }>
  credits?: {
    cast: Array<{
      id: number
      name: string
      character: string
    }>
    crew: Array<{
      id: number
      name: string
      job: string
    }>
  }
  release_dates?: {
    results: Array<{
      iso_3166_1: string
      release_dates: Array<{
        release_date: string
      }>
    }>
  }
}

export interface Genre {
  id: number
  name: string
}

export interface ApiResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}
