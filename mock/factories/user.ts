import Mock from 'mockjs'

const { Random } = Mock

export interface MockUser {
  userId: number
  deptId: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: '0' | '1' | '2'
  avatar: string
  status: '0' | '1'
  delFlag: '0'
  loginIp: string
  loginDate: string
  createBy: string
  createTime: string
  updateBy: string | null
  updateTime: string | null
  remark: string
}

export interface MockAccountConfig {
  username: string
  password: string
  roles?: string[]
  permissions?: string[]
  name?: string
  introduction?: string
  avatar?: string
  userOverrides?: Partial<MockUser>
}

export interface MockAccountInfo {
  roles: string[]
  introduction: string
  avatar: string
  name: string
  user: MockUser
  permissions: string[]
}

export interface AccountCollections {
  credentials: Record<string, { password: string; token: string }>
  accountsByToken: Record<string, MockAccountInfo>
}

let userSeed = 1

function nextUserId() {
  return userSeed++
}

function randomDateTime() {
  return Random.datetime('yyyy-MM-dd HH:mm:ss')
}

function randomPhone(): string {
  return `1${Random.string('number', 10)}`
}

export function createUser(overrides: Partial<MockUser> = {}): MockUser {
  const nickName = overrides.nickName ?? Random.cname()
  return {
    userId: overrides.userId ?? nextUserId(),
    deptId: overrides.deptId ?? Random.integer(100, 199),
    userName: overrides.userName ?? Random.word(5, 10).toLowerCase(),
    nickName,
    email: overrides.email ?? Random.email(),
    phonenumber: overrides.phonenumber ?? randomPhone(),
    sex: overrides.sex ?? Random.pick(['0', '1', '2']),
    avatar: overrides.avatar ?? '',
    status: overrides.status ?? Random.pick(['0', '1']),
    delFlag: '0',
    loginIp: overrides.loginIp ?? Random.ip(),
    loginDate: overrides.loginDate ?? randomDateTime(),
    createBy: overrides.createBy ?? Random.pick(['admin', 'system']),
    createTime: overrides.createTime ?? randomDateTime(),
    updateBy: overrides.updateBy ?? (Random.boolean() ? Random.pick(['admin', 'editor']) : null),
    updateTime: overrides.updateTime ?? (Random.boolean() ? randomDateTime() : null),
    remark: overrides.remark ?? Random.csentence(4, 12),
  }
}

export function createUserList(count: number, overrides?: (index: number) => Partial<MockUser>): MockUser[] {
  return Array.from({ length: count }, (_, idx) => {
    const userOverrides = overrides ? overrides(idx) : {}
    return createUser({
      userId: userOverrides?.userId ?? nextUserId(),
      ...userOverrides,
    })
  })
}

export function buildAccountCollections(configs: MockAccountConfig[]): AccountCollections {
  const now = Date.now()
  const credentials: AccountCollections['credentials'] = {}
  const accountsByToken: AccountCollections['accountsByToken'] = {}

  configs.forEach((config, index) => {
    const baseUser = createUser({
      userName: config.username,
      nickName: config.name ?? Random.cname(),
      userId: config.userOverrides?.userId ?? nextUserId(),
      ...config.userOverrides,
    })

    const accountInfo: MockAccountInfo = {
      roles: config.roles ?? ['user'],
      introduction: config.introduction ?? `Mock account for ${baseUser.nickName}`,
      avatar:
        config.avatar ??
        Random.image('100x100', Random.color(), '#FFF', baseUser.nickName.slice(0, 1).toUpperCase()),
      name: config.name ?? baseUser.nickName,
      user: baseUser,
      permissions: config.permissions ?? [],
    }

    const token = `mock-token-${config.username}-${now}-${index}`

    credentials[config.username] = {
      password: config.password,
      token,
    }

    accountsByToken[token] = accountInfo
  })

  return {
    credentials,
    accountsByToken,
  }
}
