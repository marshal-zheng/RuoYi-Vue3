import Mock from 'mockjs'

const { Random } = Mock

export interface DeptNode {
  id: number
  label: string
  children?: DeptNode[]
}

type DictDefinition = {
  label: string
  value: string
  listClass?: string
  remark?: string
}

type RouteChildConfig = {
  name: string
  path: string
  component: string
  title: string
  icon: string
}

let deptSeed = 100

function nextDeptId() {
  return deptSeed++
}

function createDeptNode(level = 0, maxLevel = 2): DeptNode {
  const suffix = level === 0 ? '集团' : '部门'
  const node: DeptNode = {
    id: nextDeptId(),
    label: `${Random.ctitle(2, 4)}${suffix}`,
  }

  if (level < maxLevel) {
    const childCount = Random.integer(1, 3)
    node.children = Array.from({ length: childCount }, () => createDeptNode(level + 1, maxLevel))
  }

  return node
}

export function createDeptTree(rootCount = 1, maxLevel = 2): DeptNode[] {
  deptSeed = 100
  return Array.from({ length: rootCount }, () => createDeptNode(0, maxLevel))
}

const BASE_DICTS: Record<string, DictDefinition[]> = {
  sys_user_sex: [
    { label: '男', value: '0', remark: '性别男' },
    { label: '女', value: '1', remark: '性别女' },
    { label: '未知', value: '2', remark: '性别未知' },
  ],
  sys_normal_disable: [
    { label: '正常', value: '0', listClass: 'primary', remark: '正常状态' },
    { label: '停用', value: '1', listClass: 'danger', remark: '停用状态' },
  ],
}

export function createDictData(dictType: string) {
  const dicts = BASE_DICTS[dictType] ?? []
  return dicts.map((item, idx) => ({
    dictCode: idx + 1,
    dictLabel: item.label,
    dictValue: item.value,
    dictType,
    cssClass: '',
    listClass: item.listClass ?? 'default',
    isDefault: idx === 0 ? 'Y' : 'N',
    status: '0',
    createBy: 'mock',
    createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
    remark: item.remark ?? '',
  }))
}

const DEFAULT_ROUTE_CHILDREN: RouteChildConfig[] = [
  {
    name: 'User',
    path: 'user',
    component: 'system/user/index',
    title: '用户管理',
    icon: 'user',
  },
  {
    name: 'Role',
    path: 'role',
    component: 'system/role/index',
    title: '角色管理',
    icon: 'peoples',
  },
  {
    name: 'Menu',
    path: 'menu',
    component: 'system/menu/index',
    title: '菜单管理',
    icon: 'tree-table',
  },
]

export function createSystemRoutes(children: RouteChildConfig[] = DEFAULT_ROUTE_CHILDREN) {
  return [
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
        link: null,
      },
      children: children.map(child => ({
        name: child.name,
        path: child.path,
        hidden: false,
        component: child.component,
        meta: {
          title: child.title,
          icon: child.icon,
          noCache: false,
          link: null,
        },
      })),
    },
  ]
}
