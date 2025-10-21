// Vue 组件相关类型声明

import type { Component } from 'vue'

// 表格列配置类型
export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | string
  sortable?: boolean | string
  align?: string
  headerAlign?: string
  showOverflowTooltip?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  type?: string
}

// 表单项配置类型
export interface FormItem {
  prop: string
  label: string
  type: 'input' | 'select' | 'radio' | 'checkbox' | 'date' | 'datetime' | 'textarea' | 'number'
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  rules?: any[]
  span?: number
  disabled?: boolean
  clearable?: boolean
}

// 搜索表单配置类型
export interface SearchForm {
  model: Record<string, any>
  items: FormItem[]
  labelWidth?: string
  inline?: boolean
}

// 分页配置类型
export interface PaginationConfig {
  currentPage: number
  pageSize: number
  total: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
}

// 按钮配置类型
export interface ButtonConfig {
  text: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  icon?: string
  size?: 'large' | 'default' | 'small'
  plain?: boolean
  round?: boolean
  circle?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
}

// 对话框配置类型
export interface DialogConfig {
  title: string
  visible: boolean
  width?: string
  fullscreen?: boolean
  modal?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  beforeClose?: (done: () => void) => void
}

// 树形组件配置类型
export interface TreeConfig {
  data: any[]
  nodeKey: string
  props: {
    children: string
    label: string
    disabled?: string
  }
  showCheckbox?: boolean
  checkStrictly?: boolean
  defaultExpandAll?: boolean
  expandOnClickNode?: boolean
  checkOnClickNode?: boolean
  autoExpandParent?: boolean
  defaultCheckedKeys?: any[]
  defaultExpandedKeys?: any[]
  filterNodeMethod?: (value: string, data: any) => boolean
}

// 上传组件配置类型
export interface UploadConfig {
  action: string
  headers?: Record<string, string>
  multiple?: boolean
  data?: Record<string, any>
  name?: string
  withCredentials?: boolean
  showFileList?: boolean
  drag?: boolean
  accept?: string
  listType?: 'text' | 'picture' | 'picture-card'
  autoUpload?: boolean
  fileList?: any[]
  disabled?: boolean
  limit?: number
  onPreview?: (file: any) => void
  onRemove?: (file: any, fileList: any[]) => void
  onSuccess?: (response: any, file: any, fileList: any[]) => void
  onError?: (err: any, file: any, fileList: any[]) => void
  onProgress?: (event: any, file: any, fileList: any[]) => void
  onChange?: (file: any, fileList: any[]) => void
  beforeUpload?: (file: any) => boolean | Promise<any>
  beforeRemove?: (file: any, fileList: any[]) => boolean | Promise<any>
  onExceed?: (files: any[], fileList: any[]) => void
}

// 富文本编辑器配置类型
export interface EditorConfig {
  height?: number
  placeholder?: string
  readOnly?: boolean
  theme?: 'snow' | 'bubble'
  modules?: Record<string, any>
  formats?: string[]
}