// 全局类型声明文件

declare global {
  interface Window {
    // 全局变量声明
    [key: string]: any
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
}

// js-cookie 模块声明
declare module 'js-cookie' {
  interface CookieAttributes {
    expires?: number | Date
    path?: string
    domain?: string
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }

  interface CookiesStatic {
    get(name: string): string | undefined
    set(name: string, value: string, options?: CookieAttributes): string | undefined
    remove(name: string, options?: CookieAttributes): void
  }

  const Cookies: CookiesStatic
  export default Cookies
}

// nprogress 模块声明
declare module 'nprogress' {
  interface NProgressOptions {
    minimum?: number
    template?: string
    easing?: string
    speed?: number
    trickle?: boolean
    trickleSpeed?: number
    showSpinner?: boolean
    parent?: string
  }

  interface NProgress {
    configure(options: NProgressOptions): NProgress
    start(): NProgress
    done(force?: boolean): NProgress
    inc(amount?: number): NProgress
    set(n: number): NProgress
    status: number | null
  }

  const nprogress: NProgress
  export default nprogress
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