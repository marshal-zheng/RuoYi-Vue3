import request from '@/utils/request'

// 查询设备分类列表
export function listDeviceClazz(query) {
  return request({
    url: '/fixing/deviceClazz/list',
    method: 'get',
    params: query
  })
}

// 查询设备分类详细
export function getDeviceClazz(deviceClazzId) {
  return request({
    url: '/fixing/deviceClazz/' + deviceClazzId,
    method: 'get'
  })
}

// 新增设备分类
export function addDeviceClazz(data) {
  return request({
    url: '/fixing/deviceClazz',
    method: 'post',
    data: data
  })
}

// 修改设备分类
export function updateDeviceClazz(data) {
  return request({
    url: '/fixing/deviceClazz',
    method: 'put',
    data: data
  })
}

// 删除设备分类
export function delDeviceClazz(deviceClazzId) {
  return request({
    url: '/fixing/deviceClazz/' + deviceClazzId,
    method: 'delete'
  })
}

// 导出设备分类数据
export function exportDeviceClazz(query) {
  return request({
    url: '/fixing/deviceClazz/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 获取所有设备分类选项（用于下拉选择）
export function getDeviceClazzOptions() {
  return request({
    url: '/fixing/deviceClazz/options',
    method: 'get'
  })
}

// 检查分类名称是否唯一
export function checkNameUnique(name, deviceClazzId) {
  return request({
    url: '/fixing/deviceClazz/checkNameUnique',
    method: 'get',
    params: {
      name: name,
      deviceClazzId: deviceClazzId
    }
  })
}

