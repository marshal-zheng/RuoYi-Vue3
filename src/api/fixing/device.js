import request from '@/utils/request'

// 查询设备列表
export function listDevice(query) {
  return request({
    url: '/fixing/device/list',
    method: 'get',
    params: query
  })
}

// 查询设备详细
export function getDevice(deviceId) {
  return request({
    url: '/fixing/device/' + deviceId,
    method: 'get'
  })
}

// 新增设备
export function addDevice(data) {
  return request({
    url: '/fixing/device',
    method: 'post',
    data: data
  })
}

// 修改设备
export function updateDevice(data) {
  return request({
    url: '/fixing/device',
    method: 'put',
    data: data
  })
}

// 删除设备
export function delDevice(deviceId) {
  return request({
    url: '/fixing/device/' + deviceId,
    method: 'delete'
  })
}

// 导出设备数据
export function exportDevice(query) {
  return request({
    url: '/fixing/device/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 导入设备数据（数据规格、通信报文）
export function importDeviceData(data) {
  return request({
    url: '/fixing/device/import',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 查询设备总线接口配置列表
export function listDeviceBusInterface(query) {
  return request({
    url: '/fixing/device/busInterface/list',
    method: 'get',
    params: query
  })
}

// 导入设备通信报文
export function importDeviceMessage(data) {
  return request({
    url: '/fixing/device/message/import',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取设备分类列表
export function getDeviceCategories() {
  return request({
    url: '/fixing/device/categories',
    method: 'get'
  })
}



