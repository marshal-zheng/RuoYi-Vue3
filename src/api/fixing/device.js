import request from '@/utils/request'

// 查询设备列表
export function listDevice(query) {
  return request({
    url: '/protocol/device/list',
    method: 'get',
    params: query
  })
}

// 查询设备详细
export function getDevice(deviceId) {
  return request({
    url: '/protocol/device/' + deviceId,
    method: 'get'
  })
}

// 新增设备
export function addDevice(data) {
  return request({
    url: '/protocol/device',
    method: 'post',
    data: data
  })
}

// 修改设备
export function updateDevice(data) {
  return request({
    url: '/protocol/device',
    method: 'put',
    data: data
  })
}

// 删除设备
export function delDevice(deviceId) {
  return request({
    url: '/protocol/device/' + deviceId,
    method: 'delete'
  })
}

// 导出设备数据
export function exportDevice(query) {
  return request({
    url: '/protocol/device/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 导入设备数据（数据规格、通信报文）
export function importDeviceData(data) {
  return request({
    url: '/protocol/device/import',
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
    url: '/protocol/device/busInterface/list',
    method: 'get',
    params: query
  })
}

// 查询设备总线接口配置详细
export function getDeviceBusInterface(interfaceId) {
  return request({
    url: '/protocol/device/busInterface/' + interfaceId,
    method: 'get'
  })
}

// 新增设备总线接口配置
export function addDeviceBusInterface(data) {
  return request({
    url: '/protocol/device/busInterface',
    method: 'post',
    data: data
  })
}

// 修改设备总线接口配置
export function updateDeviceBusInterface(data) {
  return request({
    url: '/protocol/device/busInterface',
    method: 'put',
    data: data
  })
}

// 删除设备总线接口配置
export function delDeviceBusInterface(interfaceId) {
  return request({
    url: '/protocol/device/busInterface/' + interfaceId,
    method: 'delete'
  })
}

// 查询设备参数配置列表
export function listDeviceParameter(query) {
  return request({
    url: '/protocol/device/parameter/list',
    method: 'get',
    params: query
  })
}

// 查询设备参数配置详细
export function getDeviceParameter(parameterId) {
  return request({
    url: '/protocol/device/parameter/' + parameterId,
    method: 'get'
  })
}

// 新增设备参数配置
export function addDeviceParameter(data) {
  return request({
    url: '/protocol/device/parameter',
    method: 'post',
    data: data
  })
}

// 修改设备参数配置
export function updateDeviceParameter(data) {
  return request({
    url: '/protocol/device/parameter',
    method: 'put',
    data: data
  })
}

// 删除设备参数配置
export function delDeviceParameter(parameterId) {
  return request({
    url: '/protocol/device/parameter/' + parameterId,
    method: 'delete'
  })
}

// 查询设备数据规格配置列表
export function listDeviceDataSpec(query) {
  return request({
    url: '/protocol/device/dataSpec/list',
    method: 'get',
    params: query
  })
}

// 查询设备数据规格配置详细
export function getDeviceDataSpec(specId) {
  return request({
    url: '/protocol/device/dataSpec/' + specId,
    method: 'get'
  })
}

// 新增设备数据规格配置
export function addDeviceDataSpec(data) {
  return request({
    url: '/protocol/device/dataSpec',
    method: 'post',
    data: data
  })
}

// 修改设备数据规格配置
export function updateDeviceDataSpec(data) {
  return request({
    url: '/protocol/device/dataSpec',
    method: 'put',
    data: data
  })
}

// 删除设备数据规格配置
export function delDeviceDataSpec(specId) {
  return request({
    url: '/protocol/device/dataSpec/' + specId,
    method: 'delete'
  })
}

// 导入设备数据规格
export function importDeviceDataSpec(data) {
  return request({
    url: '/protocol/device/dataSpec/import',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出设备数据规格
export function exportDeviceDataSpec(query) {
  return request({
    url: '/protocol/device/dataSpec/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 查询设备通信报文配置列表
export function listDeviceMessage(query) {
  return request({
    url: '/protocol/device/message/list',
    method: 'get',
    params: query
  })
}

// 查询设备通信报文配置详细
export function getDeviceMessage(messageId) {
  return request({
    url: '/protocol/device/message/' + messageId,
    method: 'get'
  })
}

// 新增设备通信报文配置
export function addDeviceMessage(data) {
  return request({
    url: '/protocol/device/message',
    method: 'post',
    data: data
  })
}

// 修改设备通信报文配置
export function updateDeviceMessage(data) {
  return request({
    url: '/protocol/device/message',
    method: 'put',
    data: data
  })
}

// 删除设备通信报文配置
export function delDeviceMessage(messageId) {
  return request({
    url: '/protocol/device/message/' + messageId,
    method: 'delete'
  })
}

// 导入设备通信报文
export function importDeviceMessage(data) {
  return request({
    url: '/protocol/device/message/import',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出设备通信报文
export function exportDeviceMessage(query) {
  return request({
    url: '/protocol/device/message/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

// 复制设备配置
export function copyDevice(deviceId, newDeviceName) {
  return request({
    url: '/protocol/device/copy',
    method: 'post',
    data: {
      deviceId: deviceId,
      newDeviceName: newDeviceName
    }
  })
}

// 获取设备分类列表
export function getDeviceCategories() {
  return request({
    url: '/protocol/device/categories',
    method: 'get'
  })
}

// 获取总线类型列表
export function getBusTypes() {
  return request({
    url: '/protocol/device/busTypes',
    method: 'get'
  })
}

// 验证设备名称唯一性
export function checkDeviceNameUnique(deviceName, deviceId) {
  return request({
    url: '/protocol/device/checkNameUnique',
    method: 'get',
    params: {
      deviceName: deviceName,
      deviceId: deviceId
    }
  })
}

