// API 相关类型声明

// 登录相关类型
export interface LoginForm {
  username: string
  password: string
  code?: string
  uuid?: string
  rememberMe?: boolean
}

export interface LoginResponse {
  token: string
}

export interface CaptchaResponse {
  captchaEnabled: boolean
  img: string
  uuid: string
}

// 用户管理相关类型
export interface UserForm {
  userId?: number
  deptId?: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string
  status: string
  remark?: string
  postIds?: number[]
  roleIds?: number[]
}

export interface UserQuery {
  pageNum?: number
  pageSize?: number
  userName?: string
  phonenumber?: string
  status?: string
  deptId?: number
  beginTime?: string
  endTime?: string
}

// 角色管理相关类型
export interface RoleForm {
  roleId?: number
  roleName: string
  roleKey: string
  roleSort: number
  status: string
  menuCheckStrictly?: boolean
  deptCheckStrictly?: boolean
  remark?: string
  menuIds?: number[]
  deptIds?: number[]
}

export interface RoleQuery {
  pageNum?: number
  pageSize?: number
  roleName?: string
  roleKey?: string
  status?: string
  beginTime?: string
  endTime?: string
}

// 菜单管理相关类型
export interface MenuForm {
  menuId?: number
  parentId: number
  menuName: string
  orderNum: number
  path: string
  component?: string
  query?: string
  isFrame: number
  isCache: number
  menuType: string
  visible: string
  status: string
  perms?: string
  icon?: string
  remark?: string
}

export interface MenuQuery {
  menuName?: string
  status?: string
}

// 部门管理相关类型
export interface DeptForm {
  deptId?: number
  parentId: number
  deptName: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: string
}

export interface DeptQuery {
  deptName?: string
  status?: string
}

// 字典相关类型
export interface DictType {
  dictId: number
  dictName: string
  dictType: string
  status: string
  createTime: string
  remark?: string
}

export interface DictData {
  dictCode: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault: string
  status: string
  createTime: string
  remark?: string
}