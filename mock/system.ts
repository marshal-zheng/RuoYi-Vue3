import { MockMethod } from 'vite-plugin-mock'
import { resultSuccess } from './_util'
import { createSystemRoutes, createDictData, createDeptTree } from './factories'

const systemRoutes = createSystemRoutes()

export default [
  // 获取路由信息
  {
    url: '/dev-api/getRouters',
    method: 'get',
    response: () => {
      return resultSuccess(systemRoutes)
    }
  },
  
  // 获取字典数据
  {
    url: '/dev-api/system/dict/data/type/:dictType',
    method: 'get',
    response: ({ query }) => {
      const { dictType } = query
      return resultSuccess({
        data: createDictData(dictType)
      })
    }
  },
  
  // 获取部门树
  {
    url: '/dev-api/system/dept/treeselect',
    method: 'get',
    response: () => {
      return resultSuccess(createDeptTree())
    }
  }
] as MockMethod[]
