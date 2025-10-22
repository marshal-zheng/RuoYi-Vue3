import request from '@/utils/request'

// 查询设备分类列表
export function listDeviceClazz(query) {
  return request({
    url: '/protocol/deviceClazz/list',
    method: 'get',
    params: query
  })
}

// 查询设备分类详细
export function getDeviceClazz(categoryId) {
  return request({
    url: '/protocol/deviceClazz/' + categoryId,
    method: 'get'
  })
}

// 新增设备分类
export function addDeviceClazz(data) {
  return request({
    url: '/protocol/deviceClazz',
    method: 'post',
    data: data
  })
}

// 修改设备分类
export function updateDeviceClazz(data) {
  return request({
    url: '/protocol/deviceClazz',
    method: 'put',
    data: data
  })
}

// 删除设备分类
export function delDeviceClazz(categoryId) {
  return request({
    url: '/protocol/deviceClazz/' + categoryId,
    method: 'delete'
  })
}

// 导出设备分类数据
export function exportDeviceClazz(query) {
  return request({
    url: '/protocol/deviceClazz/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 获取所有设备分类选项（用于下拉选择）
export function getDeviceClazzOptions() {
  return request({
    url: '/protocol/deviceClazz/options',
    method: 'get'
  })
}

// 检查分类代码是否唯一
export function checkCategoryCodeUnique(categoryCode, categoryId) {
  return request({
    url: '/protocol/deviceClazz/checkCategoryCodeUnique',
    method: 'get',
    params: {
      categoryCode: categoryCode,
      categoryId: categoryId
    }
  })
}

// 检查分类名称是否唯一
export function checkCategoryNameUnique(categoryName, categoryId) {
  return request({
    url: '/protocol/deviceClazz/checkCategoryNameUnique',
    method: 'get',
    params: {
      categoryName: categoryName,
      categoryId: categoryId
    }
  })
}

