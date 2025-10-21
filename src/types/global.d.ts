// 全局类型声明文件

declare global {
  interface Window {
    // 全局变量声明
    [key: string]: any
  }
}

// Vue 组件实例类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: any
    $cache: any
    $modal: any
    $tab: any
    $download: any
  }
}

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_CAPTCHA_ENABLED: string
  readonly VITE_APP_RSA_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 通用 API 响应类型
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 分页数据类型
export interface PageData<T = any> {
  total: number
  rows: T[]
}

// 用户信息类型
export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  roles: string[]
  permissions: string[]
}

// 菜单类型
export interface MenuInfo {
  menuId: number
  menuName: string
  parentId: number
  orderNum: number
  path: string
  component: string
  query: string
  isFrame: number
  isCache: number
  menuType: string
  visible: string
  status: string
  perms: string
  icon: string
  children?: MenuInfo[]
}

// 路由元信息类型
export interface RouteMeta {
  title?: string
  icon?: string
  noCache?: boolean
  link?: string
}

export {}