import { MockMethod } from 'vite-plugin-mock'
import { resultSuccess } from './_util'

export default [
  // 测试接口
  {
    url: '/dev-api/test/mock',
    method: 'get',
    response: () => {
      return resultSuccess({
        message: 'Mock 服务正常运行！',
        timestamp: new Date().toLocaleString('zh-CN'),
        tips: '这是一个测试接口，真实后端不存在此接口，所以使用了 Mock 数据'
      }, { msg: 'Mock 测试成功' })
    }
  }
] as MockMethod[]

