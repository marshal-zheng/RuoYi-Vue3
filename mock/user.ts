import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'
import { resultSuccess, resultError, getRequestToken, pagination } from './_util'
import { buildAccountCollections, createUserList, createDeptTree } from './factories'
import type { MockUser } from './factories'

const { Random } = Mock

function createCaptchaDataUrl(text: string) {
  const width = 120
  const height = 40
  const bgColor = '#f5f7fa'
  const textColor = '#303133'
  
  const letters = text.split('').map((char, index) => {
    const x = 15 + index * 25 + Random.integer(-3, 3)
    const y = Random.integer(20, 30)
    const rotate = Random.integer(-15, 15)
    return `<text x="${x}" y="${y}" fill="${textColor}" font-size="20" transform="rotate(${rotate}, ${x}, ${y})">${char}</text>`
  }).join('')

  const lines = Array.from({ length: 3 }, () => {
    const x1 = Random.integer(0, width)
    const y1 = Random.integer(0, height)
    const x2 = Random.integer(0, width)
    const y2 = Random.integer(0, height)
    const color = Random.color()
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1"/>`
  }).join('')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${lines}
  ${letters}
</svg>`

  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

const accountCollections = buildAccountCollections([
  {
    username: 'admin',
    password: 'admin123',
    roles: ['admin'],
    permissions: ['*:*:*'],
    name: '若依',
    introduction: 'I am a super administrator',
    userOverrides: {
      userId: 1,
      deptId: 103,
      userName: 'admin',
      nickName: '若依',
      status: '0',
      sex: '1',
      phonenumber: '15888888888',
      remark: '管理员',
    },
  },
  {
    username: 'editor',
    password: 'editor123',
    roles: ['editor'],
    permissions: ['system:user:query', 'system:user:add', 'system:user:edit'],
    name: '编辑员',
    introduction: 'I am an editor',
    userOverrides: {
      userId: 2,
      deptId: 105,
      userName: 'editor',
      nickName: '编辑员',
      status: '0',
      sex: '0',
      phonenumber: '15666666666',
      remark: '编辑员',
    },
  },
])

const mockUsers: MockUser[] = createUserList(40, index => ({
  userId: index + 10,
  userName: `user${index + 1}`,
  nickName: `Mock用户${index + 1}`,
  status: index % 6 === 0 ? '1' : '0',
}))

export default [
  // 获取验证码
  {
    url: '/dev-api/captchaImage',
    method: 'get',
    response: () => {
      return resultSuccess({
        captchaEnabled: false,
        img: '',
        uuid: 'mock-uuid-' + Date.now()
      })
    }
  },
  
  // 登录
  {
    url: '/dev-api/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body
      
      if (!username) {
        return resultError('用户名不能为空', { code: 500 })
      }
      
      if (!password) {
        return resultError('密码不能为空', { code: 500 })
      }
      
      const account = accountCollections.credentials[username]
      
      if (!account || account.password !== password) {
        return resultError('用户名或密码错误', { code: 500 })
      }

      return {
        code: 200,
        msg: '登录成功',
        type: 'success',
        token: account.token
      }
    }
  },
  
  // 获取用户信息
  {
    url: '/dev-api/getInfo',
    method: 'get',
    response: (request) => {
      const token = getRequestToken(request as any)
      
      if (!token) {
        return resultError('Token 不能为空', { code: 401 })
      }
      
      const info = accountCollections.accountsByToken[token]
      
      if (!info) {
        return resultError('登录信息已过期，请重新登录', { code: 401 })
      }

      return {
        code: 200,
        msg: '操作成功',
        type: 'success',
        user: info.user,
        roles: info.roles,
        permissions: info.permissions,
        isDefaultModifyPwd: false,
        isPasswordExpired: false
      }
    }
  },
  
  // 获取路由信息
  {
    url: '/dev-api/getRouters',
    method: 'get',
    response: () => {
      return resultSuccess([
        {
          name: 'System',
          path: '/system',
          hidden: false,
          redirect: 'noRedirect',
          component: 'Layout',
          alwaysShow: true,
          meta: {
            title: '系统管理',
            icon: 'system',
            noCache: false,
            link: null
          },
          children: [
            {
              name: 'User',
              path: 'user',
              hidden: false,
              component: 'system/user/index',
              meta: {
                title: '用户管理',
                icon: 'user',
                noCache: false,
                link: null
              }
            }
          ]
        }
      ])
    }
  },
  
  // 登出
  {
    url: '/dev-api/logout',
    method: 'post',
    response: () => {
      return resultSuccess(null, { msg: '退出成功' })
    }
  },
  
  // 获取用户列表
  {
    url: '/dev-api/system/user/list',
    method: 'get',
    response: ({ query }) => {
      const { pageNum = 1, pageSize = 10 } = query
      const page = Number(pageNum)
      const size = Number(pageSize)
      const rows = pagination(page, size, mockUsers)
      return resultSuccess({
        rows,
        total: mockUsers.length
      })
    }
  },
  
  // 查询部门下拉树结构
  {
    url: '/dev-api/system/user/deptTree',
    method: 'get',
    response: () => {
      return resultSuccess(createDeptTree())
    }
  }
] as MockMethod[]
