<template>
  <div id="tags-view-container" class="tags-view-container h-[34px] w-full flex items-center border-b border-[var(--tags-item-border,#d8dce5)]">
    <!-- 标签滚动区域 -->
    <div class="tags-view-wrapper-container flex-1 overflow-hidden">
      <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.path"
          :data-path="tag.path"
          :class="{ 'active': isActive(tag), 'has-icon': tagsIcon }"
          :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
          class="tags-view-item 
                 inline-flex items-center relative cursor-pointer 
                 h-[26px] border border-[var(--tags-item-border,#d8dce5)] 
                 text-[var(--tags-item-text,#495060)] bg-[var(--tags-item-bg,#fff)] 
                 px-2 text-xs rounded-[3px] 
                 transition-all duration-200 ease-in-out 
                 no-underline whitespace-nowrap 
                 hover:bg-[var(--tags-item-hover,#f5f7fa)] 
                 hover:-translate-y-px hover:shadow-md"
          :style="activeStyle(tag)"
          @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
          @dblclick="!isAffix(tag) ? closeSelectedTag(tag) : ''"
          @contextmenu.prevent="openMenu(tag, $event)"
          :title="tag.title.length > 10 ? tag.title : ''"
        >
          <!-- 活跃标签指示器 -->
          <span
            v-if="isActive(tag)"
            class="active-indicator 
                   inline-block w-2 h-2 bg-white rounded-full 
                   mr-[5px] animate-pulse"
          ></span>
          <svg-icon v-if="tagsIcon && tag.meta && tag.meta.icon && tag.meta.icon !== '#'" :icon-class="tag.meta.icon" />
          <span class="tag-title flex-1 overflow-hidden text-ellipsis">{{ tag.title }}</span>
          <span 
            v-if="!isAffix(tag)" 
            @click.prevent.stop="closeSelectedTag(tag)"
            class="tag-close-btn 
                   flex items-center justify-center 
                   w-4 h-4 ml-1 rounded-full opacity-60 
                   transition-all duration-200 ease-in-out 
                   hover:opacity-100 hover:bg-black hover:bg-opacity-10"
          >
            <close class="el-icon-close" style="width: 1em; height: 1em;vertical-align: middle;" />
          </span>
        </router-link>
      </scroll-pane>
    </div>

    <!-- 右侧操作区域 -->
    <div class="tags-view-actions flex items-center gap-1 px-3 border-l border-[var(--tags-item-border,#d8dce5)]">
      <!-- 刷新当前页面按钮 -->
      <div
        class="action-btn refresh-btn 
               flex items-center justify-center 
               w-6 h-6 rounded cursor-pointer 
               text-[var(--tags-item-text,#495060)] 
               transition-all duration-200 ease-in-out 
               hover:text-[var(--el-color-primary,#409eff)] 
               hover:bg-[var(--tags-item-hover,#f5f7fa)]"
        @click="refreshSelectedTag($route)"
        title="刷新当前页面 (Ctrl+R)"
      >
        <el-icon><refresh-right /></el-icon>
      </div>

      <!-- 更多操作下拉菜单 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="action-btn more-btn 
                   flex items-center justify-center 
                   w-6 h-6 rounded cursor-pointer 
                   text-[var(--tags-item-text,#495060)] 
                   transition-all duration-200 ease-in-out 
                   hover:text-[var(--el-color-primary,#409eff)] 
                   hover:bg-[var(--tags-item-hover,#f5f7fa)]" 
             title="更多操作">
          <el-icon><more-filled /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh" :icon="RefreshRight"> 刷新页面 </el-dropdown-item>
            <el-dropdown-item
              v-if="visitedViews.length > 1"
              command="closeOthers"
              :icon="CircleClose"
            >
              关闭其他标签
            </el-dropdown-item>
            <el-dropdown-item v-if="!isFirstView()" command="closeLeft" :icon="Back">
              关闭左侧标签
            </el-dropdown-item>
            <el-dropdown-item v-if="!isLastView()" command="closeRight" :icon="Right">
              关闭右侧标签
            </el-dropdown-item>
            <el-dropdown-item v-if="visitedViews.length > 1" command="closeAll" :icon="CircleClose">
              关闭所有标签
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 右键菜单 -->
    <ul v-show="visible" 
        :style="{ left: left + 'px', top: top + 'px' }" 
        class="contextmenu 
               m-0 bg-[var(--el-bg-color-overlay,#fff)] z-[3000] absolute 
               list-none py-[5px] rounded text-xs font-normal 
               text-[var(--tags-item-text,#333)] shadow-lg 
               border border-[var(--el-border-color-light,#e4e7ed)]">
      <li @click="refreshSelectedTag(selectedTag)" 
          class="m-0 py-[7px] px-4 cursor-pointer 
                 flex items-center gap-2 
                 hover:bg-[var(--tags-item-hover,#eee)]">
          <refresh-right style="width: 1em; height: 1em;" /> 刷新页面
        </li>
        <li v-if="!isAffix(selectedTag)" 
            @click="closeSelectedTag(selectedTag)" 
            class="m-0 py-[7px] px-4 cursor-pointer 
                   flex items-center gap-2 
                   hover:bg-[var(--tags-item-hover,#eee)]">
          <close style="width: 1em; height: 1em;" /> 关闭标签
        </li>
        <li @click="closeOthersTags" 
            class="m-0 py-[7px] px-4 cursor-pointer 
                   flex items-center gap-2 
                   hover:bg-[var(--tags-item-hover,#eee)]">
          <circle-close style="width: 1em; height: 1em;" /> 关闭其他
        </li>
        <li v-if="!isFirstView()" 
            @click="closeLeftTags" 
            class="m-0 py-[7px] px-4 cursor-pointer 
                   flex items-center gap-2 
                   hover:bg-[var(--tags-item-hover,#eee)]">
          <back style="width: 1em; height: 1em;" /> 关闭左侧
        </li>
        <li v-if="!isLastView()" 
            @click="closeRightTags" 
            class="m-0 py-[7px] px-4 cursor-pointer 
                   flex items-center gap-2 
                   hover:bg-[var(--tags-item-hover,#eee)]">
          <right style="width: 1em; height: 1em;" /> 关闭右侧
        </li>
        <li @click="closeAllTags(selectedTag)" 
            class="m-0 py-[7px] px-4 cursor-pointer 
                   flex items-center gap-2 
                   hover:bg-[var(--tags-item-hover,#eee)]">
          <folder-delete style="width: 1em; height: 1em;" /> 关闭所有
        </li>
    </ul>
  </div>
</template>

<script setup>
import { MoreFilled, RefreshRight, CircleClose, Close, Back, Right } from '@element-plus/icons-vue'
import ScrollPane from './ScrollPane'
import { getNormalPath } from '@/utils/ruoyi'
import useTagsViewStore from '@/store/modules/tagsView'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref({})
const affixTags = ref([])
const scrollPaneRef = ref(null)

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const visitedViews = computed(() => useTagsViewStore().visitedViews)
const routes = computed(() => usePermissionStore().routes)
const theme = computed(() => useSettingsStore().theme)
const tagsIcon = computed(() => useSettingsStore().tagsIcon)

watch(route, () => {
  addTags()
  moveToCurrentTag()
})

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

onMounted(() => {
  initTags()
  addTags()
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

function isActive(r) {
  return r.path === route.path
}

function activeStyle(tag) {
  if (!isActive(tag)) return {}
  return {
    "background-color": theme.value,
    "border-color": theme.value
  }
}

function isAffix(tag) {
  return tag.meta && tag.meta.affix
}

function isFirstView() {
  try {
    return selectedTag.value.fullPath === '/index' || selectedTag.value.fullPath === visitedViews.value[1].fullPath
  } catch (err) {
    return false
  }
}

function isLastView() {
  try {
    return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1].fullPath
  } catch (err) {
    return false
  }
}

function filterAffixTags(routes, basePath = '') {
  let tags = []
  routes.forEach(route => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}

function initTags() {
  const res = filterAffixTags(routes.value)
  affixTags.value = res
  for (const tag of res) {
    // Must have tag name
    if (tag.name) {
       useTagsViewStore().addVisitedView(tag)
    }
  }
}

function addTags() {
  const { name } = route
  if (name) {
    useTagsViewStore().addView(route)
  }
}

function moveToCurrentTag() {
  nextTick(() => {
    for (const r of visitedViews.value) {
      if (r.path === route.path) {
        scrollPaneRef.value.moveToTarget(r)
        // when query is different then update
        if (r.fullPath !== route.fullPath) {
          useTagsViewStore().updateVisitedView(route)
        }
      }
    }
  })
}

function refreshSelectedTag(view) {
  proxy.$tab.refreshPage(view)
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route)
  }
}

function closeSelectedTag(view) {
  // 添加关闭动画
  const tagElement = document.querySelector(`[data-path="${view.path}"]`)
  if (tagElement) {
    tagElement.style.transform = 'scale(0.8)'
    tagElement.style.opacity = '0'
    tagElement.style.transition = 'all 0.15s ease-in-out'

    setTimeout(() => {
      proxy.$tab.closePage(view).then(({ visitedViews }) => {
        if (isActive(view)) {
          toLastView(visitedViews, view)
        }
      })
    }, 150)
  } else {
    // 如果找不到元素，直接关闭
    proxy.$tab.closePage(view).then(({ visitedViews }) => {
      if (isActive(view)) {
        toLastView(visitedViews, view)
      }
    })
  }
}

function closeRightTags() {
  proxy.$tab.closeRightPage(selectedTag.value).then(visitedViews => {
    if (!visitedViews.find(i => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}

function closeLeftTags() {
  proxy.$tab.closeLeftPage(selectedTag.value).then(visitedViews => {
    if (!visitedViews.find(i => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}

function closeOthersTags() {
  router.push(selectedTag.value).catch(() => { })
  proxy.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

function closeAllTags(view) {
  proxy.$tab.closeAllPage().then(({ visitedViews }) => {
    if (affixTags.value.some(tag => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}

function toLastView(visitedViews, view) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}

function openMenu(tag, e) {
  const menuMinWidth = 105
  const offsetLeft = proxy.$el.getBoundingClientRect().left // container margin left
  const offsetWidth = proxy.$el.offsetWidth // container width
  const maxLeft = offsetWidth - menuMinWidth // left boundary
  const l = e.clientX - offsetLeft + 15 // 15: margin right

  if (l > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = l
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

function closeMenu() {
  visible.value = false
}

function handleScroll() {
  closeMenu()
}

// 全局快捷键处理
function handleGlobalKeydown(e) {
  // Ctrl+W 关闭当前标签
  if (e.ctrlKey && e.key === 'w') {
    e.preventDefault()
    const currentTag = visitedViews.value.find(tag => tag.path === route.path)
    if (currentTag && !isAffix(currentTag)) {
      closeSelectedTag(currentTag)
    }
  }

  // Ctrl+R 刷新当前页面
  if (e.ctrlKey && e.key === 'r') {
    e.preventDefault()
    refreshSelectedTag(route)
  }

  // Ctrl+Shift+T 重新打开最近关闭的标签（预留）
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    e.preventDefault()
    // TODO: 实现重新打开逻辑
    console.log('重新打开最近关闭的标签')
  }
}

// 处理右侧操作按钮命令
function handleCommand(command) {
  const currentTag = {
    path: route.path,
    query: route.query,
    fullPath: route.fullPath,
    name: route.name,
    meta: route.meta,
  }

  switch (command) {
    case 'refresh':
      refreshSelectedTag(currentTag)
      break
    case 'closeOthers':
      closeOthersTags()
      break
    case 'closeLeft':
      closeLeftTags()
      break
    case 'closeRight':
      closeRightTags()
      break
    case 'closeAll':
      closeAllTags(currentTag)
      break
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  background: var(--tags-bg, #fff);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);

  .tags-view-wrapper {
    .tags-view-item {







      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        box-shadow: 0 2px 4px rgba(66, 185, 131, 0.3);

        .tag-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  .tags-view-item.active.has-icon .active-indicator {
    display: none;
  }

  .tags-view-actions {

  }


}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;

      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }

      &:hover {
        background-color: var(--tags-close-hover, #b4bccc);
        color: #fff;
        width: 12px !important;
        height: 12px !important;
      }
    }
  }
}
</style>