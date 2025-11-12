/**
 * Mock 响应工具函数
 */
export function resultSuccess<T = Recordable>(data: T, { msg = '操作成功' } = {}) {
  return {
    code: 200,
    data,
    msg,
    type: 'success'
  }
}

export function resultError(msg = '请求失败', { code = 500, data = null } = {}) {
  return {
    code,
    data,
    msg,
    type: 'error'
  }
}

export function resultPageSuccess<T = any>(
  page: number,
  pageSize: number,
  list: T[],
  { msg = '操作成功' } = {}
) {
  const pageData = pagination(page, pageSize, list)

  return {
    ...resultSuccess({
      records: pageData,
      total: list.length,
      size: pageSize,
      current: page,
      pages: Math.ceil(list.length / pageSize)
    }),
    msg
  }
}

export function pagination<T = any>(pageNo: number, pageSize: number, array: T[]): T[] {
  const offset = (pageNo - 1) * Number(pageSize)
  return offset + Number(pageSize) >= array.length
    ? array.slice(offset, array.length)
    : array.slice(offset, offset + Number(pageSize))
}

export interface requestParams {
  method: string
  body: any
  headers?: { authorization?: string }
  query: any
}

/**
 * 从请求头中获取 token
 */
export function getRequestToken({ headers }: requestParams): string | undefined {
  return headers?.authorization?.replace('Bearer ', '')
}

type Recordable<T = any> = Record<string, T>
