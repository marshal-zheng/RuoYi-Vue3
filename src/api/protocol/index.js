import request from '@/utils/request'

// 查询协议库列表
export function listProtocol(query) {
  return request({
    url: '/protocol/list',
    method: 'get',
    params: query
  })
}

// 查询协议库详细
export function getProtocol(protocolId) {
  return request({
    url: '/protocol/' + protocolId,
    method: 'get'
  })
}

// 新增协议库
export function addProtocol(data) {
  return request({
    url: '/protocol',
    method: 'post',
    data: data
  })
}

// 修改协议库
export function updateProtocol(data) {
  return request({
    url: '/protocol',
    method: 'put',
    data: data
  })
}

// 删除协议库
export function delProtocol(protocolId) {
  return request({
    url: '/protocol/' + protocolId,
    method: 'delete'
  })
}

// 导出协议库
export function exportProtocol(query) {
  return request({
    url: '/protocol/export',
    method: 'get',
    params: query
  })
}

// 导入协议库数据
export function importProtocolData(data) {
  return request({
    url: '/protocol/import',
    method: 'post',
    data: data
  })
}