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

// App 模块声明 - 在 shims-vue.d.ts 中处理