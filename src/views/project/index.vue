<template>
   <ZxContentWrap title="项目管理">
      <ZxGridList
         ref="gridListRef"
         :load-data="loadProjectData"
         :show-pagination="true"
         :page-sizes="[10, 20, 50, 100]"
         :default-page-size="10"
         :load-on-mounted="true"
         :clear-selection-on-load="true"
         class="project-grid zx-grid-list--page"
      >
         <!-- 工具栏：左-操作 | 中-筛选 | 右-搜索 -->
         <template #form="{ query, loading, refresh: handleRefresh, updateState }">
            <div class="zx-grid-form-bar">
               <div class="zx-grid-form-bar__left">
                  <ZxButton
                     type="primary"
                     icon="Plus"
                     @click="handleAddProject"
                     v-hasPermi="['project:add']"
                  >新增</ZxButton>
                  <ZxButton
                     type="danger"
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['project:remove']"
                  >删除</ZxButton>
                  <ZxButton
                     icon="Download"
                     @click="handleExport"
                     v-hasPermi="['project:export']"
                  >导出</ZxButton>
               </div>
               
               <div class="zx-grid-form-bar__filters">
                  <el-date-picker
                    v-model="query.dateRange"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 240px"
                    @change="(v) => onFilterChange('dateRange', v, { handleRefresh, updateState })"
                  />
               </div>
               
               <div class="zx-grid-form-bar__right">
                  <ZxSearch
                     v-model="query.projectName"
                     placeholder="搜索项目名称"
                     :loading="loading"
                     search-mode="click"
                     @search="() => onSearch({ handleRefresh, updateState })"
                     @clear="() => onSearch({ handleRefresh, updateState })"
                  />
               </div>
            </div>
         </template>

         <!-- 卡片内容 -->
         <template #table="{ grid, refresh: handleRefresh }">
            <!-- 项目卡片列表 -->
            <div v-loading="grid.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              <div 
                v-for="project in grid.list" 
                :key="project.projectId"
                class="group relative bg-white rounded-sm border border-[#e5e6eb] hover:border-[#0052d9] transition-all duration-300 overflow-hidden"
                :class="{ 
                  'border-[#0052d9] shadow-[0_0_0_2px_rgba(0,82,217,0.1)]': ids.includes(project.projectId),
                  'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]': !ids.includes(project.projectId)
                }"
              >
                <!-- 选中状态指示条 -->
                <div 
                  v-if="ids.includes(project.projectId)"
                  class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0052d9] to-[#3370ff]"
                />
                
                <!-- 卡片头部 -->
                <div class="px-5 py-4 border-b border-[#f0f1f5] bg-gradient-to-b from-[#fafbfc] to-white">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 flex-1 min-w-0">
                      <el-checkbox 
                        :model-value="ids.includes(project.projectId)"
                        @change="toggleSelection(project)"
                        @click.stop
                        class="mt-0.5 flex-shrink-0"
                      />
                      <div class="flex-1 min-w-0">
                        <h3 class="text-base font-semibold text-[#1d2129] truncate mb-1 leading-tight">
                          <router-link 
                            :to="'/project-detail/index/' + project.projectId" 
                            class="hover:text-[#0052d9] transition-colors no-underline"
                            @click.stop
                          >
                            {{ project.projectName }}
                          </router-link>
                        </h3>
                        <p class="text-xs text-[#86909c] flex items-center gap-1">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                          </svg>
                          <span>编号: {{ project.projectId }}</span>
                        </p>
                      </div>
                    </div>
                    <el-dropdown 
                      @click.stop
                      trigger="click"
                      class="flex-shrink-0"
                    >
                      <button 
                        class="w-7 h-7 rounded-sm flex items-center justify-center text-[#86909c] hover:text-[#0052d9] hover:bg-[#f2f5fc] transition-all"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="2"/>
                          <circle cx="12" cy="12" r="2"/>
                          <circle cx="12" cy="19" r="2"/>
                        </svg>
                      </button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item 
                            icon="Document" 
                            @click="handleInfoPage(project)"
                            v-hasPermi="['project:query']"
                          >查看详情</el-dropdown-item>
                          <el-dropdown-item 
                            icon="Edit" 
                            @click="handleDetailPage(project)"
                            v-hasPermi="['project:query']"
                          >编辑项目</el-dropdown-item>
                          <el-dropdown-item 
                            icon="Download" 
                            @click="handleExportDialog(project)"
                            v-hasPermi="['project:query']"
                          >导出数据</el-dropdown-item>
                          <el-dropdown-item 
                            icon="Delete" 
                            @click="handleDelete(project)"
                            v-hasPermi="['project:remove']"
                            divided
                          >删除项目</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>

                <!-- 卡片内容 -->
                <div class="px-5 py-4">
                  <!-- 项目描述 -->
                  <div class="mb-4">
                    <div class="text-[#4e5969] text-[13px] leading-relaxed line-clamp-2 min-h-[40px]">
                      {{ project.description || '暂无项目描述信息' }}
                    </div>
                  </div>

                  <!-- 项目信息 -->
                  <div class="space-y-2.5 mb-4">
                    <div class="flex items-center text-xs">
                      <div class="flex items-center gap-1.5 text-[#86909c] w-[72px] flex-shrink-0">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span>创建人</span>
                      </div>
                      <span class="text-[#1d2129] font-medium">{{ project.createBy || '-' }}</span>
                    </div>
                    <div class="flex items-center text-xs">
                      <div class="flex items-center gap-1.5 text-[#86909c] w-[72px] flex-shrink-0">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>创建时间</span>
                      </div>
                      <span class="text-[#4e5969]">{{ parseTime(project.createTime, '{y}-{m}-{d}') || '-' }}</span>
                    </div>
                    <div class="flex items-center text-xs">
                      <div class="flex items-center gap-1.5 text-[#86909c] w-[72px] flex-shrink-0">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        <span>更新时间</span>
                      </div>
                      <span class="text-[#4e5969]">{{ parseTime(project.updateTime, '{y}-{m}-{d}') || '-' }}</span>
                    </div>
                  </div>
                </div>

                <!-- 操作按钮组 -->
                <div class="px-5 py-3 border-t border-[#f0f1f5] bg-[#fafbfc] flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 flex-1">
                    <button 
                      @click.stop="handleInfoPage(project)"
                      v-hasPermi="['project:query']"
                      class="flex-1 h-8 px-3 text-xs font-medium text-[#4e5969] bg-white border border-[#e5e6eb] rounded-sm hover:text-[#0052d9] hover:border-[#0052d9] hover:bg-[#f2f5fc] transition-all flex items-center justify-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <span>详情</span>
                    </button>
                    <button 
                      @click.stop="handleDetailPage(project)"
                      v-hasPermi="['project:query']"
                      class="flex-1 h-8 px-3 text-xs font-medium text-white bg-[#0052d9] border border-[#0052d9] rounded-sm hover:bg-[#003ba8] hover:border-[#003ba8] transition-all flex items-center justify-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      <span>编辑</span>
                    </button>
                  </div>
                  <button 
                    @click.stop="handleExportDialog(project)"
                    v-hasPermi="['project:query']"
                    class="w-8 h-8 flex items-center justify-center text-[#86909c] hover:text-[#67c23a] hover:bg-[#f0f9ff] border border-[#e5e6eb] hover:border-[#67c23a] rounded-sm transition-all"
                    title="导出"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                  </button>
                  <button 
                    @click.stop="handleDelete(project)"
                    v-hasPermi="['project:remove']"
                    class="w-8 h-8 flex items-center justify-center text-[#86909c] hover:text-[#f56c6c] hover:bg-[#fef0f0] border border-[#e5e6eb] hover:border-[#f56c6c] rounded-sm transition-all"
                    title="删除"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="!grid.loading && grid.list.length === 0" class="text-center py-16 px-4">
              <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f7f8fa] mb-4">
                <svg class="w-10 h-10 text-[#c9cdd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 class="text-base font-semibold text-[#1d2129] mb-2">暂无项目</h3>
              <p class="text-sm text-[#86909c] mb-6 max-w-md mx-auto">还没有创建任何项目，点击下方按钮开始创建您的第一个项目</p>
              <el-button 
                type="primary" 
                size="default"
                @click="handleAddProject"
                v-hasPermi="['project:add']"
              >
                <template #icon>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </template>
                创建项目
              </el-button>
            </div>
         </template>
      </ZxGridList>
    </ZxContentWrap>

    <!-- 添加或修改项目对话框 -->
    <ProjectEditDialog
      ref="projectEditDialogRef"
      @success="refreshList"
    />

    <!-- 导出弹框 -->
    <ExportDialog
      v-model="exportDialogVisible"
      :project-data="currentExportProject"
      @export="handleProjectExport"
    />
</template>

<script setup name="Project">
import { listProject, delProject } from "@/api/project"
import { ExportDialog, ProjectEditDialog } from "./components"

const { proxy } = getCurrentInstance()
const router = useRouter()

const gridListRef = ref()
const projectEditDialogRef = ref()
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

// 导出弹框相关
const exportDialogVisible = ref(false)
const currentExportProject = ref({})

/** ZxGridList 数据加载函数 */
async function loadProjectData(params) {
  try {
    const { pageNum, pageSize, ...query } = params
    
    // 处理日期范围
    let requestParams = { pageNum, pageSize, ...query }
    if (query.dateRange && query.dateRange.length === 2) {
      requestParams = proxy.addDateRange(requestParams, query.dateRange)
      delete requestParams.dateRange
    }
    
    const response = await listProject(requestParams)
    return {
      list: response.rows || [],
      total: response.total || 0
    }
  } catch (error) {
    console.error('加载项目数据失败:', error)
    return {
      list: [],
      total: 0
    }
  }
}

/** 筛选变化处理 */
function onFilterChange(key, value, { handleRefresh, updateState }) {
  updateState({ [key]: value })
  handleRefresh()
}

/** 搜索处理 */
function onSearch({ handleRefresh, updateState }) {
  handleRefresh()
}

/** 刷新列表 */
function refreshList() {
  if (gridListRef.value) {
    gridListRef.value.refresh()
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  refreshList()
}

/** 重置按钮操作 */
function resetQuery() {
  if (gridListRef.value) {
    gridListRef.value.resetQuery()
  }
}

/** 新增按钮操作 */
function handleAdd() {
  projectEditDialogRef.value?.open()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.projectId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 切换项目选择状态 */
function toggleSelection(project) {
  const index = ids.value.indexOf(project.projectId)
  if (index > -1) {
    ids.value.splice(index, 1)
  } else {
    ids.value.push(project.projectId)
  }
  single.value = ids.value.length != 1
  multiple.value = !ids.value.length
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const projectId = row.projectId || ids.value
  projectEditDialogRef.value?.open(projectId)
}

/** 详情按钮操作 */
function handleDetail(row) {
  // 跳转到项目详情页面（拓扑设计、仿真等工作区）
  router.push({
    path: '/project-detail/index/' + row.projectId,
    query: {
      projectName: row.projectName
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const projectIds = row.projectId || ids.value
  let confirmMessage = ''
  
  if (row.projectId) {
    // 单个删除，显示项目名称
    confirmMessage = '是否确认删除项目"' + row.projectName + '"？'
  } else {
    // 批量删除，显示选中的项目数量
    confirmMessage = '是否确认删除选中的 ' + ids.value.length + ' 个项目？'
  }
  
  proxy.$modal.confirm(confirmMessage).then(function() {
    try {
      return delProject(projectIds)
    } catch (error) {
      console.warn('删除项目异常:', error)
      throw error
    }
  }).then(() => {
    refreshList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch((error) => {
    if (error && error.message !== 'cancel') {
      console.warn('删除项目失败:', error)
      proxy.$modal.msgError("删除失败，接口暂不可用")
    }
  })
}

/** 导出按钮操作 */
function handleExport() {
  try {
    const currentQuery = gridListRef.value?.getCurrentQuery() || {}
    proxy.download("project/export", currentQuery, `project_${new Date().getTime()}.xlsx`)
  } catch (error) {
    console.warn('导出项目失败:', error)
    proxy.$modal.msgError("导出失败，接口暂不可用")
  }
}

/** 新增项目按钮操作 - 打开创建对话框 */
function handleAddProject() {
  // 打开创建项目对话框
  projectEditDialogRef.value?.open()
}

/** 详情页面按钮操作 - 跳转到详情页面（工作流界面） */
function handleInfoPage(row) {
  // 跳转到项目详情页面（工作流界面）
  proxy.$router.push('/project-detail/info/' + row.projectId)
}

/** 详情页面按钮操作 - 跳转到详情页面 */
function handleDetailPage(row) {
  // 跳转到项目详情页面，用于管理项目配置
  proxy.$router.push('/project-detail/index/' + row.projectId)
}

/** 打开导出弹框 */
function handleExportDialog(row) {
  currentExportProject.value = row
  exportDialogVisible.value = true
}

/** 处理项目导出 */
function handleProjectExport(exportParams) {
  console.log('导出参数:', exportParams)
  
  try {
    // 根据文件类型构造下载文件名
    const fileName = `${exportParams.fileName}.${exportParams.fileType}`
    
    // 获取当前查询参数
    const currentQuery = gridListRef.value?.getCurrentQuery() || {}
    
    // 调用下载接口
    proxy.download("project/export", {
      ...exportParams,
      ...currentQuery
    }, fileName)
    
    proxy.$modal.msgSuccess(`${fileName} 导出成功！`)
  } catch (error) {
    console.warn('导出项目失败:', error)
    proxy.$modal.msgError("导出失败，接口暂不可用")
  }
}
</script>