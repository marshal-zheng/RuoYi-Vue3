# TypeScript 支持说明

本项目已成功集成 TypeScript 支持，提供完整的类型检查和开发体验。

## 🎯 已完成的配置

### 1. 依赖包安装
- `typescript` - TypeScript 编译器
- `vue-tsc` - Vue 3 TypeScript 类型检查工具
- `@types/node` - Node.js 类型定义

### 2. 配置文件
- `tsconfig.json` - 主要的 TypeScript 配置
- `tsconfig.node.json` - Node.js 环境配置
- 支持路径映射 (`@/*` -> `src/*`)
- 启用严格模式类型检查

### 3. 文件转换
已将以下关键文件从 `.js` 转换为 `.ts`：
- `src/main.ts` - 应用入口文件
- `src/permission.ts` - 权限控制
- `src/settings.ts` - 应用设置
- `src/router/index.ts` - 路由配置
- `src/store/index.ts` - 状态管理
- `src/directive/index.ts` - 指令配置
- `src/plugins/index.ts` - 插件配置
- `vite.config.ts` - Vite 配置
- `vite/plugins/*.ts` - Vite 插件配置

### 4. 类型定义
创建了完整的类型定义文件：
- `src/types/global.d.ts` - 全局类型定义
- `src/types/api.d.ts` - API 相关类型
- `src/types/components.d.ts` - 组件相关类型
- `src/types/store.d.ts` - Store 相关类型

## 🚀 使用方法

### 开发命令
```bash
# 启动开发服务器（已包含 TypeScript 支持）
yarn dev

# 类型检查（不生成文件）
yarn type-check

# 构建项目（包含类型检查）
yarn build

# 分阶段构建（包含类型检查）
yarn build:stage
```

### 在 Vue 组件中使用 TypeScript

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/global'

// 类型安全的响应式数据
const user = ref<UserInfo | null>(null)
const count = ref<number>(0)

// 类型安全的计算属性
const displayName = computed<string>(() => {
  return user.value ? user.value.nickName : '未登录'
})

// 类型安全的函数
function handleLogin(userInfo: UserInfo): void {
  user.value = userInfo
}
</script>
```

### 在普通 TypeScript 文件中使用类型

```typescript
import type { ApiResponse, UserInfo } from '@/types/global'

// 类型安全的 API 调用
async function fetchUserInfo(userId: number): Promise<UserInfo | null> {
  const response: ApiResponse<UserInfo> = await api.get(`/user/${userId}`)
  
  if (response.code === 200) {
    return response.data
  }
  
  return null
}
```

## 📝 类型定义说明

### 全局类型 (`global.d.ts`)
- `ApiResponse<T>` - 通用 API 响应格式
- `UserInfo` - 用户信息接口
- `MenuInfo` - 菜单信息接口
- `RouteMeta` - 路由元信息接口

### API 类型 (`api.d.ts`)
- 登录相关：`LoginForm`, `LoginResponse`, `CaptchaResponse`
- 用户管理：`UserForm`, `UserQuery`
- 角色管理：`RoleForm`, `RoleQuery`
- 菜单管理：`MenuForm`, `MenuQuery`
- 部门管理：`DeptForm`, `DeptQuery`
- 字典管理：`DictType`, `DictData`

### 组件类型 (`components.d.ts`)
- `TableColumn` - 表格列配置
- `FormItem` - 表单项配置
- `PaginationConfig` - 分页配置
- `DialogConfig` - 对话框配置
- `TreeConfig` - 树形组件配置
- `UploadConfig` - 上传组件配置

### Store 类型 (`store.d.ts`)
- `UserState`, `AppState`, `SettingsState` - 各种状态接口
- `UserActions`, `AppActions` - 各种操作接口

## 🔧 IDE 配置建议

### VS Code
推荐安装以下扩展：
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- TypeScript Importer

### WebStorm
WebStorm 内置了完整的 TypeScript 和 Vue 3 支持。

## 📚 最佳实践

1. **始终使用类型注解**：为函数参数、返回值和变量添加明确的类型
2. **利用类型推断**：让 TypeScript 自动推断简单类型
3. **使用联合类型**：处理多种可能的值类型
4. **善用泛型**：创建可复用的类型安全组件
5. **定义接口**：为复杂对象结构定义清晰的接口

## 🐛 常见问题

### 类型错误
如果遇到类型错误，可以运行：
```bash
yarn type-check
```

### 模块导入问题
确保在 `tsconfig.json` 中正确配置了路径映射。

### Vue 组件类型问题
确保在 `<script>` 标签中添加 `lang="ts"` 属性。

## 📈 后续优化建议

1. 为现有的 JavaScript 文件逐步添加类型注解
2. 完善 API 接口的类型定义
3. 为组件 props 添加详细的类型定义
4. 考虑使用 `strict: true` 模式获得更严格的类型检查
5. 添加 ESLint TypeScript 规则以保持代码质量

---

现在您的 RuoYi-Vue3 项目已经完全支持 TypeScript！🎉