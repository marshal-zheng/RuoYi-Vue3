<template>
  <div class="header-search">
    <el-autocomplete
      ref="headerSearchSelectRef"
      v-model="search"
      :fetch-suggestions="querySearch"
      placeholder="快捷搜索"
      class="header-search-select"
      @select="handleSelect"
      :trigger-on-focus="true"
      popper-class="header-search-popper"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
      <template #default="{ item }">
        <div class="search-item-content">
          <div class="left">
            <svg-icon class="menu-icon" :icon-class="item.icon" />
          </div>
          <div class="search-info">
            <div class="menu-title">
              {{ item.title.join(" / ") }}
            </div>
            <div class="menu-path">
              {{ item.path }}
            </div>
          </div>
        </div>
      </template>
    </el-autocomplete>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Fuse from 'fuse.js'
import { Search } from '@element-plus/icons-vue'
import { getNormalPath } from '@/utils/ruoyi'
import { isHttp } from '@/utils/validate'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const search = ref('')
const searchPool = ref([])
const fuse = ref(undefined)
const headerSearchSelectRef = ref(null)
const router = useRouter()
const routes = computed(() => usePermissionStore().defaultRoutes)

function handleSelect(item) {
  change(item)
  nextTick(() => {
    // 让当前活动元素失去焦点
    if (document.activeElement) {
      document.activeElement.blur()
    }
  })
}

function change(val) {
  const path = val.path
  const query = val.query
  if (isHttp(path)) {
    // http(s):// 路径新窗口打开
    const pindex = path.indexOf("http")
    window.open(path.substr(pindex, path.length), "_blank")
  } else {
    if (query) {
      router.push({ path: path, query: JSON.parse(query) })
    } else {
      router.push(path)
    }
  }

  search.value = ''
}

function initFuse(list) {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: [{
      name: 'title',
      weight: 0.7
    }, {
      name: 'path',
      weight: 0.3
    }]
  })
}

// Filter out the routes that can be displayed in the sidebar
// And generate the internationalized title
function generateRoutes(routes, basePath = '', prefixTitle = []) {
  let res = []

  for (const r of routes) {
    // skip hidden router
    if (r.hidden) { continue }
    const p = r.path.length > 0 && r.path[0] === '/' ? r.path : '/' + r.path
    const data = {
      path: !isHttp(r.path) ? getNormalPath(basePath + p) : r.path,
      title: [...prefixTitle],
      icon: ''
    }

    if (r.meta && r.meta.title) {
      data.title = [...data.title, r.meta.title]
      data.icon = r.meta.icon
      if (r.redirect !== "noRedirect") {
        // only push the routes with title
        // special case: need to exclude parent router without redirect
        res.push(data)
      }
    }
    if (r.query) {
      data.query = r.query
    }

    // recursive child routes
    if (r.children) {
      const tempRoutes = generateRoutes(r.children, data.path, data.title)
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes]
      }
    }
  }
  return res
}

function querySearch(queryString, callback) {
  let results = []
  if (queryString && queryString.trim() !== '') {
    results = fuse.value.search(queryString).map((item) => item.item)
  } else {
    results = searchPool.value.slice(0, 10) // 显示前10个结果
  }
  callback(results)
}



onMounted(() => {
  searchPool.value = generateRoutes(routes.value)
})

watch(searchPool, (list) => {
  initFuse(list)
})
</script>

<style lang='scss' scoped>
.header-search {
  width: 300px;

  :deep(.el-autocomplete) {
    width: 100%;
  }
}

.search-item-content {
  display: flex;
  align-items: center;
  padding: 8px 0;

  .left {
    width: 40px;
    text-align: center;
    flex-shrink: 0;

    .menu-icon {
      width: 16px;
      height: 16px;
    }
  }

  .search-info {
    padding-left: 10px;
    flex: 1;
    min-width: 0;

    .menu-title {
      font-size: 14px;
      color: #303133;
      line-height: 20px;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .menu-path {
      color: #909399;
      font-size: 12px;
      line-height: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>

<style lang='scss'>
.header-search-popper {
  .el-autocomplete-suggestion__list {
    .el-autocomplete-suggestion__item {
      padding: 8px 12px !important;
      line-height: normal !important;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

// 暗色主题适配
.dark .header-search-popper {
  .el-autocomplete-suggestion__list {
    background: #2d2d2d;
    border-color: #4c4d4f;

    .el-autocomplete-suggestion__item {
      &:hover {
        background-color: #3a3a3a;
      }

      .search-item-content {
        .search-info {
          .menu-title {
            color: #e5eaf3;
          }
          
          .menu-path {
            color: #a3a6ad;
          }
        }
      }
    }
  }
}
</style>
