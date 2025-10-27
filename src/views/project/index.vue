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
                     type="success"
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['project:edit']"
                  >修改</ZxButton>
                  <ZxButton
                     type="danger"
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['project:remove']"
                  >删除</ZxButton>
                  <ZxButton
                     type="warning"
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
            <div v-loading="grid.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <el-card 
                v-for="project in grid.list" 
                :key="project.projectId"
                class="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                :class="{ 'ring-2 ring-blue-500': ids.includes(project.projectId) }"
              >
                <!-- 卡片头部 -->
                <template #header>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <el-checkbox 
                        :model-value="ids.includes(project.projectId)"
                        @change="toggleSelection(project)"
                        @click.stop
                      />
                      <div>
                        <h3 class="text-lg font-semibold text-gray-800 truncate">
                          <router-link 
                            :to="'/project-detail/index/' + project.projectId" 
                            class="text-blue-600 hover:text-blue-800 no-underline"
                            @click.stop
                          >
                            {{ project.projectName }}
                          </router-link>
                        </h3>
                        <p class="text-sm text-gray-500">项目编号: {{ project.projectId }}</p>
                      </div>
                    </div>
                    <el-dropdown @click.stop>
                      <el-button type="text" icon="MoreFilled" class="text-gray-400 hover:text-gray-600" />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item 
                            icon="View" 
                            @click="handleDetailPage(project)"
                            v-hasPermi="['project:query']"
                          >编辑</el-dropdown-item>
                          <el-dropdown-item 
                            icon="Download" 
                            @click="handleExportDialog(project)"
                            v-hasPermi="['project:query']"
                          >导出</el-dropdown-item>
                          <el-dropdown-item 
                            icon="Delete" 
                            @click="handleDelete(project)"
                            v-hasPermi="['project:remove']"
                            class="text-red-600"
                          >删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>

                <!-- 卡片内容 -->
                <div class="space-y-4">
                  <!-- 项目描述 -->
                  <div>
                    <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {{ project.description || '暂无描述' }}
                    </p>
                  </div>

                  <!-- 项目信息 -->
                  <div class="space-y-2">
                    <div class="flex items-center text-sm">
                      <span class="text-gray-500 w-16">创建人:</span>
                      <span class="text-gray-800 font-medium">{{ project.createBy }}</span>
                    </div>
                    <div class="flex items-center text-sm">
                      <span class="text-gray-500 w-16">创建时间:</span>
                      <span class="text-gray-600">{{ parseTime(project.createTime) }}</span>
                    </div>
                    <div class="flex items-center text-sm">
                      <span class="text-gray-500 w-16">更新时间:</span>
                      <span class="text-gray-600">{{ parseTime(project.updateTime) }}</span>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                    <el-button 
                      size="small" 
                      type="primary" 
                      icon="View" 
                      @click.stop="handleDetailPage(project)" 
                      v-hasPermi="['project:query']"
                    >编辑</el-button>
                    <el-button 
                      size="small" 
                      type="success" 
                      icon="Download" 
                      @click.stop="handleExportDialog(project)" 
                      v-hasPermi="['project:query']"
                    >导出</el-button>
                    <el-button 
                      size="small" 
                      type="danger" 
                      icon="Delete" 
                      @click.stop="handleDelete(project)" 
                      v-hasPermi="['project:remove']"
                    >删除</el-button>
                  </div>
                </div>
              </el-card>
            </div>

            <!-- 空状态 -->
            <div v-if="!grid.loading && grid.list.length === 0" class="text-center py-12">
              <div class="text-gray-400 text-6xl mb-4">📁</div>
              <h3 class="text-lg font-medium text-gray-600 mb-2">暂无项目</h3>
              <p class="text-gray-500 mb-4">还没有创建任何项目，点击新增按钮开始创建吧</p>
              <el-button 
                type="primary" 
                icon="Plus" 
                @click="handleAddProject"
                v-hasPermi="['project:add']"
              >创建项目</el-button>
            </div>
         </template>
      </ZxGridList>
    </ZxContentWrap>

    <!-- 添加或修改项目对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="projectRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="项目名称" prop="projectName">
               <el-input v-model="form.projectName" placeholder="请输入项目名称" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
               <el-input v-model="form.description" type="textarea" placeholder="请输入项目描述"></el-input>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 导出弹框 -->
      <ExportDialog
         v-model="exportDialogVisible"
         :project-data="currentExportProject"
         @export="handleProjectExport"
      />
</template>

<script setup name="Project">
import { listProject, getProject, delProject, addProject, updateProject, exportProject } from "@/api/project"
import { ExportDialog } from "./components"

const { proxy } = getCurrentInstance()
const router = useRouter()

const gridListRef = ref()
const open = ref(false)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref("")

// 导出弹框相关
const exportDialogVisible = ref(false)
const currentExportProject = ref({})

const data = reactive({
  form: {},
  rules: {
    projectName: [{ required: true, message: "项目名称不能为空", trigger: "blur" }]
  },
})

const { form, rules } = toRefs(data)

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

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    projectId: undefined,
    projectName: undefined,
    description: undefined
  }
  proxy.resetForm("projectRef")
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
  reset()
  open.value = true
  title.value = "添加项目"
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
  reset()
  const projectId = row.projectId || ids.value
  
  try {
    getProject(projectId).then(response => {
      form.value = response.data
      open.value = true
      title.value = "修改项目"
    }).catch(error => {
      console.warn('获取项目详情失败，使用默认数据:', error)
      // 使用行数据作为默认值
      if (row.projectId) {
        form.value = {
          projectId: row.projectId,
          projectName: row.projectName,
          description: row.description
        }
      }
      open.value = true
      title.value = "修改项目"
    })
  } catch (error) {
    console.warn('获取项目详情异常:', error)
    if (row.projectId) {
      form.value = {
        projectId: row.projectId,
        projectName: row.projectName,
        description: row.description
      }
    }
    open.value = true
    title.value = "修改项目"
  }
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

/** 提交按钮 */
function submitForm() {
  proxy.$refs["projectRef"].validate(valid => {
    if (valid) {
      if (form.value.projectId != undefined) {
        try {
          updateProject(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功")
            open.value = false
            refreshList()
          }).catch(error => {
            console.warn('修改项目失败:', error)
            proxy.$modal.msgError("修改失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('修改项目异常:', error)
          proxy.$modal.msgError("修改失败，接口暂不可用")
        }
      } else {
        addProject(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          refreshList()
        })
      }
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

/** 新增项目按钮操作 - 跳转到详情页面 */
function handleAddProject() {
  // 跳转到项目详情页面，用于新增项目配置
  proxy.$router.push('/project-detail/index/new')
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