# MSW 替代说明

项目的 Mock 能力已经迁移到 `src/mocks/` 目录并由 [MSW](https://mswjs.io/) 驱动，本目录仅保留旧的 `vite-plugin-mock + Mock.js` 文件，方便参考历史数据结构。

> **建议**：后续新增或维护 Mock 时，请前往 `src/mocks/`，按照新的 handlers/factories 结构编写，旧目录可在完成迁移后删除。

关键入口：

- `src/mocks/README.md`：最新的使用说明
- `src/mocks/handlers`：接口拦截实现
- `src/mocks/factories`：假数据构造器
- `src/mocks/utils/with-backend-fallback.ts`：真实接口回退逻辑

如需纯 Mock 启动，可执行 `yarn dev-mock`；常规开发建议使用 `yarn dev`，此时 MSW 会优先请求真实后端，遇到 `404` 或网络错误再回退至 Mock。可通过 `VITE_ENABLE_MOCK=off|fallback|pure` 控制运行模式（开发环境默认 `fallback`，脚本会在运行时注入 `pure` 模式，无需额外 `.env.mock` 文件）。

### 带参数示例

```typescript
{
  url: '/dev-api/system/user/:id',
  method: 'get',
  response: ({ query }) => {
    const { id } = query
    return resultSuccess({
      userId: id,
      username: 'user' + id,
      status: '0'
    })
  }
}
```

### 分页示例

```typescript
{
  url: '/dev-api/system/user/list',
  method: 'get',
  response: ({ query }) => {
    const { pageNum = 1, pageSize = 10 } = query
    const list = Array.from({ length: 50 }, (_, i) => ({
      userId: i + 1,
      username: `user${i + 1}`,
      nickName: `用户${i + 1}`
    }))
    return resultPageSuccess(Number(pageNum), Number(pageSize), list)
  }
}
```

### 使用 mockjs 生成随机数据

```typescript
import Mock from 'mockjs'

{
  url: '/dev-api/system/user/random',
  method: 'get',
  response: () => {
    return resultSuccess({
      'list|10': [{
        'id|+1': 1,
        'username': '@name',
        'email': '@email',
        'createTime': '@datetime'
      }]
    })
  }
}
```

## 注意事项

1. Mock 文件修改后会自动热更新，无需重启服务
2. 生产环境下 Mock 功能会被自动禁用
3. Mock 数据仅在开发模式下生效
4. 避免在 Mock 中使用异步操作，保持响应同步
