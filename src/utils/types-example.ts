// TypeScript 示例文件 - 验证类型系统工作正常

import type { ApiResponse, UserInfo } from '@/types/global'

// 示例：类型安全的 API 响应处理函数
export function handleApiResponse<T>(response: ApiResponse<T>): T | null {
  if (response.code === 200) {
    return response.data
  }
  console.error('API Error:', response.msg)
  return null
}

// 示例：用户信息处理函数
export function formatUserInfo(user: UserInfo): string {
  return `${user.nickName} (${user.userName})`
}

// 示例：类型安全的本地存储工具
export class TypedStorage {
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage error:', error)
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Storage error:', error)
      return defaultValue
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key)
  }
}

// 示例：枚举类型
export enum UserStatus {
  ACTIVE = '0',
  INACTIVE = '1',
  PENDING = '2'
}

// 示例：联合类型
export type Theme = 'light' | 'dark' | 'auto'

// 示例：泛型接口
export interface PaginatedData<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

// 示例：工具类型
export type PartialUserInfo = Partial<UserInfo>
export type RequiredUserInfo = Required<UserInfo>
export type UserInfoKeys = keyof UserInfo