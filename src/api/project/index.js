import request from '@/utils/request'

// 查询项目列表
export function listProject(query) {
  return request({
    url: '/project/project/list',
    method: 'get',
    params: query
  })
}

// 查询项目详细
export function getProject(projectId) {
  return request({
    url: '/project/project/' + projectId,
    method: 'get'
  })
}

// 新增项目
export function addProject(data) {
  return request({
    url: '/project/project',
    method: 'post',
    data: data
  })
}

// 修改项目
export function updateProject(data) {
  return request({
    url: '/project/project',
    method: 'put',
    data: data
  })
}

// 删除项目
export function delProject(projectId) {
  return request({
    url: '/project/project/' + projectId,
    method: 'delete'
  })
}

// 导出项目数据
export function exportProject(query) {
  return request({
    url: '/project/project/export',
    method: 'post',
    data: query
  })
}

// 查询项目配置列表
export function listProjectConfig(query) {
  return request({
    url: '/project/project/config/list',
    method: 'get',
    params: query
  })
}

// 查询项目配置详细
export function getProjectConfig(configId) {
  return request({
    url: '/project/project/config/' + configId,
    method: 'get'
  })
}

// 新增项目配置
export function addProjectConfig(data) {
  return request({
    url: '/project/project/config',
    method: 'post',
    data: data
  })
}

// 修改项目配置
export function updateProjectConfig(data) {
  return request({
    url: '/project/project/config',
    method: 'put',
    data: data
  })
}

// 删除项目配置
export function delProjectConfig(configId) {
  return request({
    url: '/project/project/config/' + configId,
    method: 'delete'
  })
}

// 导出项目配置数据
export function exportProjectConfig(query) {
  return request({
    url: '/project/project/config/export',
    method: 'post',
    data: query
  })
}

