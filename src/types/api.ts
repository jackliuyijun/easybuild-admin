export interface ApiResponse<T = any> {
  code: string
  data: T
  msg: string
  count?: number
} 