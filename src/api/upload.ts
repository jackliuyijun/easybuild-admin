import { http } from './http'
import { UPLOAD_API_URL } from '@/config/api-url'

interface UploadApiResponse {
  code: string
  data: string
  message?: string
}

export const uploadApi = {
  uploadFile: async (file: File, folder: string = 'common', onProgress?: (progress: number) => void): Promise<string> => {
    try {
      console.log('开始上传文件:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder,
        uploadUrl: `${UPLOAD_API_URL}/file/upload`
      })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      
      const xhr = new XMLHttpRequest()
      
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total)
            onProgress?.(progress)
          }
        }
        
        xhr.onload = () => {
          console.log('上传响应:', {
            status: xhr.status,
            response: xhr.responseText
          })

          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              if (response?.code === 'OK' && response?.data) {
                resolve(response.data)
              } else {
                console.error('上传失败:', response)
                reject(new Error(response?.message || '上传失败'))
              }
            } catch (error) {
              console.error('解析响应失败:', error)
              reject(new Error('解析响应失败'))
            }
          } else {
            console.error('网络请求失败:', {
              status: xhr.status,
              statusText: xhr.statusText
            })
            reject(new Error(`网络请求失败: ${xhr.status}`))
          }
        }
        
        xhr.onerror = () => {
          console.error('网络错误:', {
            status: xhr.status,
            statusText: xhr.statusText,
            readyState: xhr.readyState
          })
          reject(new Error('网络请求失败'))
        }

        xhr.onabort = () => {
          console.warn('上传已取消')
          reject(new Error('上传已取消'))
        }
      })
      
      // 获取token
      const token = localStorage.getItem('token')
      console.log('认证信息:', {
        hasToken: !!token,
        tokenLength: token?.length
      })

      xhr.open('POST', `${UPLOAD_API_URL}/file/upload`, true)
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      
      xhr.send(formData)
      
      return await uploadPromise
      
    } catch (error) {
      console.error('上传文件失败:', error)
      throw error instanceof Error ? error : new Error('上传失败')
    }
  },

  uploadEditorImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${UPLOAD_API_URL}/file/upload`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const data = await response.json()
      
      if (data?.code === 'OK' && data?.data) {
        return data.data
      }
      
      throw new Error(data?.message || '上传失败')
    } catch (error) {
      console.error('上传编辑器图片失败:', error)
      throw error instanceof Error ? error : new Error('上传失败')
    }
  }
} 