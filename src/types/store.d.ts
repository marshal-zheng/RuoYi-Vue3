// Pinia Store 相关类型声明

import type { UserInfo, MenuInfo } from './global'

// 用户状态类型
export interface UserState {
  token: string
  name: string
  avatar: string
  roles: string[]
  permissions: string[]
}

// 应用状态类型
export interface AppState {
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }
  device: 'desktop' | 'mobile'
  size: 'large' | 'default' | 'small'
}

// 设置状态类型
export interface SettingsState {
  title: string
  theme: string
  sideTheme: string
  showSettings: boolean
  topNav: boolean
  tagsView: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  dynamicTitle: boolean
}

// 权限状态类型
export interface PermissionState {
  routes: any[]
  addRoutes: any[]
  defaultRoutes: any[]
  topbarRouters: any[]
  sidebarRouters: any[]
}

// 标签页状态类型
export interface TagsViewState {
  visitedViews: any[]
  cachedViews: any[]
}

// 字典状态类型
export interface DictState {
  dict: Record<string, any[]>
}

// Store Actions 类型
export interface UserActions {
  login(userInfo: { username: string; password: string; code?: string; uuid?: string }): Promise<any>
  getInfo(): Promise<UserInfo>
  logout(): Promise<void>
  resetToken(): void
}

export interface AppActions {
  toggleSideBar(): void
  closeSideBar(withoutAnimation: boolean): void
  toggleDevice(device: 'desktop' | 'mobile'): void
  setSize(size: 'large' | 'default' | 'small'): void
}

export interface SettingsActions {
  changeSetting(data: { key: string; value: any }): void
}

export interface PermissionActions {
  generateRoutes(roles: string[]): Promise<any[]>
  setRoutes(routes: any[]): void
}

export interface TagsViewActions {
  addView(view: any): void
  addVisitedView(view: any): void
  addCachedView(view: any): void
  delView(view: any): Promise<any>
  delVisitedView(view: any): Promise<any>
  delCachedView(view: any): Promise<any>
  delOthersViews(view: any): Promise<any>
  delOthersVisitedViews(view: any): Promise<any>
  delOthersCachedViews(view: any): Promise<any>
  delAllViews(): Promise<any>
  delAllVisitedViews(): Promise<any>
  delAllCachedViews(): Promise<any>
  updateVisitedView(view: any): void
}

export interface DictActions {
  getDict(dictType: string): Promise<any[]>
  setDict(dictType: string, dictData: any[]): void
  removeDict(dictType: string): void
  cleanDict(): void
}