<template>
   <ContentWrap>
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="项目名称" prop="projectName">
            <el-input
               v-model="queryParams.projectName"
               placeholder="请输入项目名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="创建人" prop="createBy">
            <el-input
               v-model="queryParams.createBy"
               placeholder="请输入创建人"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
            ></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAddProject"
               v-hasPermi="['project:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['project:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['project:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['project:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="项目编号" align="center" prop="projectId" />
         <el-table-column label="项目名称" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
               <router-link :to="'/project-detail/index/' + scope.row.projectId" class="link-type">
                  <span>{{ scope.row.projectName }}</span>
               </router-link>
            </template>
         </el-table-column>
         <el-table-column label="创建人" align="center" prop="createBy" :show-overflow-tooltip="true"/>
         <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="最后修改时间" align="center" prop="updateTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.updateTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleDetailPage(scope.row)" v-hasPermi="['project:query']">编辑</el-button>
               <el-button link type="primary" icon="Download" @click="handleExportDialog(scope.row)" v-hasPermi="['project:query']">导出</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['project:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

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
   </ContentWrap>
</template>

<script setup name="Project">
import { listProject, getProject, delProject, addProject, updateProject, exportProject } from "@/api/project"
import ContentWrap from "@/components/ContentWrap/src/ContentWrap.vue"
import { ExportDialog } from "./components"

const { proxy } = getCurrentInstance()
const router = useRouter()

const projectList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])

// 导出弹框相关
const exportDialogVisible = ref(false)
const currentExportProject = ref({})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectName: undefined,
    createBy: undefined
  },
  rules: {
    projectName: [{ required: true, message: "项目名称不能为空", trigger: "blur" }]
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询项目列表 */
function getList() {
  loading.value = true
  
  // 模拟数据
  const mockData = {
    rows: [
      {
        projectId: 1,
        projectName: "智能协议分析系统",
        createBy: "张三",
        description: "用于网络协议智能分析和处理的系统",
        createTime: "2024-01-15 10:30:00",
        updateTime: "2024-01-20 14:25:00"
      },
      {
        projectId: 2,
        projectName: "数据传输协议优化",
        createBy: "李四",
        description: "优化现有数据传输协议，提升传输效率",
        createTime: "2024-01-10 09:15:00",
        updateTime: "2024-01-18 16:40:00"
      },
      {
        projectId: 3,
        projectName: "网络安全协议验证",
        createBy: "王五",
        description: "验证和测试各种网络安全协议的可靠性",
        createTime: "2024-01-08 11:20:00",
        updateTime: "2024-01-22 13:55:00"
      },
      {
        projectId: 4,
        projectName: "物联网通信协议",
        createBy: "赵六",
        description: "设计适用于物联网设备的轻量级通信协议",
        createTime: "2024-01-05 14:45:00",
        updateTime: "2024-01-19 10:30:00"
      },
      {
        projectId: 5,
        projectName: "实时流媒体协议",
        createBy: "陈七",
        description: "开发高效的实时流媒体传输协议",
        createTime: "2024-01-03 16:10:00",
        updateTime: "2024-01-21 09:15:00"
      }
    ],
    total: 5
  }
  
  try {
    listProject(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      projectList.value = response.rows
      total.value = response.total
      loading.value = false
    }).catch(error => {
      console.warn('API调用失败，使用模拟数据:', error)
      // 使用模拟数据
      projectList.value = mockData.rows
      total.value = mockData.total
      loading.value = false
    })
  } catch (error) {
    console.warn('API调用异常，使用模拟数据:', error)
    // 使用模拟数据
    projectList.value = mockData.rows
    total.value = mockData.total
    loading.value = false
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
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
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
            getList()
          }).catch(error => {
            console.warn('修改项目失败:', error)
            proxy.$modal.msgError("修改失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('修改项目异常:', error)
          proxy.$modal.msgError("修改失败，接口暂不可用")
        }
      } else {
        try {
          addProject(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功")
            open.value = false
            getList()
          }).catch(error => {
            console.warn('新增项目失败:', error)
            proxy.$modal.msgError("新增失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('新增项目异常:', error)
          proxy.$modal.msgError("新增失败，接口暂不可用")
        }
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
    const selectedProjects = projectList.value.filter(item => ids.value.includes(item.projectId))
    if (selectedProjects.length === 1) {
      confirmMessage = '是否确认删除项目"' + selectedProjects[0].projectName + '"？'
    } else {
      confirmMessage = '是否确认删除选中的 ' + selectedProjects.length + ' 个项目？'
    }
  }
  
  proxy.$modal.confirm(confirmMessage).then(function() {
    try {
      return delProject(projectIds)
    } catch (error) {
      console.warn('删除项目异常:', error)
      throw error
    }
  }).then(() => {
    getList()
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
    proxy.download("project/export", {
      ...queryParams.value
    }, `project_${new Date().getTime()}.xlsx`)
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
    
    // 调用下载接口
    proxy.download("project/export", {
      ...exportParams,
      ...queryParams.value
    }, fileName)
    
    proxy.$modal.msgSuccess(`${fileName} 导出成功！`)
  } catch (error) {
    console.warn('导出项目失败:', error)
    proxy.$modal.msgError("导出失败，接口暂不可用")
  }
}

getList()
</script>