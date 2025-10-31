<template>
   <ZxContentWrap title="协议库管理">
      <ZxGridList
         ref="gridListRef"
         :load-data="loadProtocolData"
         :show-pagination="true"
         :page-sizes="[10, 20, 50, 100]"
         :default-page-size="10"
         :load-on-mounted="true"
         :clear-selection-on-load="true"
         class="protocol-grid zx-grid-list--page"
      >
         <!-- 工具栏：左-操作 | 中-筛选 | 右-搜索 -->
         <template #form="{ query, loading, refresh: handleRefresh, updateState }">
            <div class="zx-grid-form-bar">
               <div class="zx-grid-form-bar__left">
                  <ZxButton
                     type="primary"
                     icon="Plus"
                     @click="handleAddProtocol"
                     v-hasPermi="['protocol:add']"
                  >新增</ZxButton>
                  <!-- <ZxButton
                     type="success"
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['protocol:edit']"
                  >修改</ZxButton>
                  <ZxButton
                     type="danger"
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['protocol:remove']"
                  >删除</ZxButton>
                  <ZxButton
                     type="warning"
                     icon="Download"
                     @click="handleExport"
                     v-hasPermi="['protocol:export']"
                  >导出</ZxButton> -->
               </div>
               
               <div class="zx-grid-form-bar__filters">
                  <el-select
                    v-model="query.protocolType"
                    placeholder="请选择协议类型"
                    clearable
                    style="width: 200px"
                    @change="(v) => onFilterChange('protocolType', v, { handleRefresh, updateState })"
                  >
                    <el-option label="以太网" value="以太网" />
                    <el-option label="RS422" value="RS422" />
                    <el-option label="CAN" value="CAN" />
                    <el-option label="1553B" value="1553B" />
                  </el-select>
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
                     v-model="query.protocolName"
                     placeholder="搜索协议名称"
                     :loading="loading"
                     search-mode="click"
                     @search="() => onSearch({ handleRefresh, updateState })"
                     @clear="() => onSearch({ handleRefresh, updateState })"
                  />
               </div>
            </div>
         </template>

         <!-- 表格内容 -->
         <template #table="{ grid, refresh: handleRefresh }">
            <el-table :data="grid.list" style="width: 100%" @selection-change="handleSelectionChange">
               <el-table-column type="selection" width="55" align="center" />
               <el-table-column label="协议编号" align="center" prop="protocolId" width="100" />
               <el-table-column label="协议名称" align="center" :show-overflow-tooltip="true">
                  <template #default="scope">
                     <router-link :to="'/protocol/detail/index/' + scope.row.protocolId" class="link-type">
                        <span>{{ scope.row.protocolName }}</span>
                     </router-link>
                  </template>
               </el-table-column>
               <el-table-column label="协议类型" align="center" prop="protocolType" :show-overflow-tooltip="true" />
               <el-table-column label="版本号" align="center" prop="version" width="100" />
               <el-table-column label="状态" align="center" prop="status" width="100">
                  <template #default="scope">
                     <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
                  </template>
               </el-table-column>
               <el-table-column label="固化状态" align="center" width="100">
                  <template #default="scope">
                     <el-tag v-if="scope.row.isLocked" type="warning" size="small">
                        <el-icon><Lock /></el-icon>
                        已固化
                     </el-tag>
                     <el-tag v-else type="info" size="small">
                        <el-icon><Unlock /></el-icon>
                        未固化
                     </el-tag>
                  </template>
               </el-table-column>
               <el-table-column label="创建人" align="center" prop="createBy" :show-overflow-tooltip="true"/>
               <el-table-column label="最后修改时间" align="center" prop="updateTime" width="180">
                  <template #default="scope">
                     <span>{{ parseTime(scope.row.updateTime) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
                  <template #default="scope">
                     <div class="op-col__wrap">
                        <el-button link type="primary" icon="Edit" @click="handleDetailPage(scope.row)" v-hasPermi="['protocol:query']">编辑</el-button>
                        <ZxMoreAction
                           :list="getMoreActionList(scope.row)"
                           @select="handleMoreActionSelect($event, scope.row, handleRefresh)"
                        />
                     </div>
                  </template>
               </el-table-column>
            </el-table>
         </template>
      </ZxGridList>

      <!-- 添加或修改协议对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form ref="protocolRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="协议名称" prop="protocolName">
               <el-input v-model="form.protocolName" placeholder="请输入协议名称" />
            </el-form-item>
            <el-form-item label="协议类型" prop="protocolType">
                <ProtocolTypeSelector v-model="form.protocolType" />
              </el-form-item>
            <el-form-item label="版本号" prop="version">
               <el-input v-model="form.version" placeholder="请输入版本号" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio label="0">正常</el-radio>
                  <el-radio label="1">停用</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="协议描述" prop="description">
               <el-input v-model="form.description" type="textarea" placeholder="请输入协议描述" :rows="3"></el-input>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 导入数据对话框 -->
      <el-dialog title="导入数据" v-model="importOpen" width="500px" append-to-body>
         <el-form ref="importRef" :model="importForm" label-width="100px">
            <el-form-item label="协议名称">
               <el-input v-model="importForm.protocolName" readonly />
            </el-form-item>
            <el-form-item label="导入类型" prop="importType">
               <el-radio-group v-model="importForm.importType">
                  <el-radio label="message">通信报文</el-radio>
                  <el-radio label="dataSpec">数据规格</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="上传文件" prop="file">
               <el-upload
                  ref="uploadRef"
                  :limit="1"
                  accept=".xlsx,.xls,.csv"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  :file-list="fileList"
               >
                  <el-button type="primary">选择文件</el-button>
                  <template #tip>
                     <div class="el-upload__tip">
                        只能上传 xlsx/xls/csv 文件，且不超过 10MB
                     </div>
                  </template>
               </el-upload>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitImport">确 定</el-button>
               <el-button @click="cancelImport">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 协议表单 Drawer -->
      <ProtocolFormDrawer ref="protocolDrawerRef" @success="handleProtocolSaveSuccess" />
   </ZxContentWrap>
</template>

<script setup name="Protocol">
import { listProtocol, getProtocol, delProtocol, addProtocol, updateProtocol, exportProtocol, importProtocolData } from "@/api/protocol"
import ProtocolTypeSelector from "./components/selector/ProtocolTypeSelector.vue"
import ProtocolFormDrawer from "./components/ProtocolFormDrawer.vue"
import { Lock, Unlock } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
const router = useRouter()

// Drawer 引用
const protocolDrawerRef = ref()

// ZxGridList 相关
const gridListRef = ref()

// 原有变量
const open = ref(false)
const importOpen = ref(false)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref("")
const fileList = ref([])

const data = reactive({
  form: {},
  importForm: {
    protocolId: undefined,
    protocolName: '',
    importType: 'message',
    file: null
  },
  rules: {
    protocolName: [{ required: true, message: "协议名称不能为空", trigger: "blur" }],
    protocolType: [{ required: true, message: "协议类型不能为空", trigger: "change" }],
    version: [{ required: true, message: "版本号不能为空", trigger: "blur" }],
    status: [{ required: true, message: "状态不能为空", trigger: "change" }]
  },
})

const { form, importForm, rules } = toRefs(data)

/** ZxGridList 数据加载函数 */
async function loadProtocolData(params) {
  const queryData = {
    pageNum: params.page,
    pageSize: params.size,
    protocolName: params.query?.protocolName || '',
    protocolType: params.query?.protocolType || ''
  }
  
  // 添加日期范围
  const finalParams = proxy.addDateRange(queryData, params.query?.dateRange || [])
  
  try {
    const response = await listProtocol(finalParams)
    return {
      data: response.rows || [],
      total: response.total || 0
    }
  } catch (error) {
    console.warn('加载协议数据失败:', error)
    // 返回模拟数据
    return {
      data: [
        {
          protocolId: 1,
          protocolName: "以太网协议",
          protocolType: "以太网",
          version: "IEEE 802.3",
          status: "0",
          isLocked: false,
          description: "标准以太网通信协议，支持10/100/1000Mbps传输",
          createBy: "admin",
          createTime: "2024-01-01 10:00:00",
          updateTime: "2024-01-01 10:00:00"
        },
        {
          protocolId: 2,
          protocolName: "RS422串行协议",
          protocolType: "RS422",
          version: "EIA-422-A",
          status: "0",
          isLocked: true,
          description: "RS422差分信号串行通信协议，支持长距离传输",
          createBy: "admin",
          createTime: "2024-01-02 10:00:00",
          updateTime: "2024-01-02 10:00:00"
        },
        {
          protocolId: 3,
          protocolName: "CAN总线协议",
          protocolType: "CAN",
          version: "CAN 2.0B",
          status: "0",
          isLocked: false,
          description: "控制器局域网总线协议，广泛应用于汽车和工业控制",
          createBy: "admin",
          createTime: "2024-01-03 10:00:00",
          updateTime: "2024-01-03 10:00:00"
        },
        {
          protocolId: 4,
          protocolName: "MIL-STD-1553B协议",
          protocolType: "1553B",
          version: "MIL-STD-1553B",
          status: "1",
          isLocked: true,
          description: "军用标准数据总线协议，用于航空航天设备通信",
          createBy: "admin",
          createTime: "2024-01-04 10:00:00",
          updateTime: "2024-01-04 10:00:00"
        }
      ],
      total: 4
    }
  }
}

/** 筛选条件变化处理 */
function onFilterChange(field, value, { handleRefresh, updateState }) {
  // 更新查询状态
  updateState({ [field]: value })
  // 刷新数据
  handleRefresh()
}

/** 搜索处理 */
function onSearch({ handleRefresh, updateState }) {
  // 刷新数据
  handleRefresh()
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    protocolId: undefined,
    protocolName: undefined,
    protocolType: undefined,
    version: undefined,
    status: "0",
    description: undefined
  }
  proxy.resetForm("protocolRef")
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加协议"
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.protocolId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const protocolId = row.protocolId || ids.value
  
  try {
    getProtocol(protocolId).then(response => {
      form.value = response.data
      open.value = true
      title.value = "修改协议"
    }).catch(error => {
      console.warn('获取协议详情失败，使用默认数据:', error)
      // 使用行数据作为默认值
      if (row.protocolId) {
        form.value = {
          protocolId: row.protocolId,
          protocolName: row.protocolName,
          protocolType: row.protocolType,
          version: row.version,
          status: row.status,
          description: row.description
        }
      }
      open.value = true
      title.value = "修改协议"
    })
  } catch (error) {
    console.warn('获取协议详情异常:', error)
    if (row.protocolId) {
      form.value = {
        protocolId: row.protocolId,
        protocolName: row.protocolName,
        protocolType: row.protocolType,
        version: row.version,
        status: row.status,
        description: row.description
      }
    }
    open.value = true
    title.value = "修改协议"
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["protocolRef"].validate(valid => {
    if (valid) {
      if (form.value.protocolId != undefined) {
        try {
          updateProtocol(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功")
            open.value = false
            gridListRef.value?.refresh()
          }).catch(error => {
            console.warn('修改协议失败:', error)
            proxy.$modal.msgError("修改失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('修改协议异常:', error)
          proxy.$modal.msgError("修改失败，接口暂不可用")
        }
      } else {
        try {
          addProtocol(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功")
            open.value = false
            gridListRef.value?.refresh()
          }).catch(error => {
            console.warn('新增协议失败:', error)
            proxy.$modal.msgError("新增失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('新增协议异常:', error)
          proxy.$modal.msgError("新增失败，接口暂不可用")
        }
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const protocolIds = row.protocolId || ids.value
  let confirmMessage = ''
  
  if (row.protocolId) {
    // 单个删除，显示协议名称
    confirmMessage = '是否确认删除协议"' + row.protocolName + '"？'
  } else {
    // 批量删除，显示选中的协议数量
    const currentData = gridListRef.value?.getData() || []
    const selectedProtocols = currentData.filter(item => ids.value.includes(item.protocolId))
    if (selectedProtocols.length === 1) {
      confirmMessage = '是否确认删除协议"' + selectedProtocols[0].protocolName + '"？'
    } else {
      confirmMessage = '是否确认删除选中的 ' + selectedProtocols.length + ' 个协议？'
    }
  }
  
  proxy.$modal.confirm(confirmMessage).then(function() {
    try {
      return delProtocol(protocolIds)
    } catch (error) {
      console.warn('删除协议异常:', error)
      throw error
    }
  }).then(() => {
    gridListRef.value?.refresh()
    proxy.$modal.msgSuccess("删除成功")
  }).catch((error) => {
    if (error && error.message !== 'cancel') {
      console.warn('删除协议失败:', error)
      proxy.$modal.msgError("删除失败，接口暂不可用")
    }
  })
}

/** 导出按钮操作 */
function handleExport() {
  try {
    const currentQuery = gridListRef.value?.getCurrentQuery() || {}
    proxy.download("protocol/export", currentQuery, `protocol_${new Date().getTime()}.xlsx`)
  } catch (error) {
    console.warn('导出协议失败:', error)
    proxy.$modal.msgError("导出失败，接口暂不可用")
  }
}

/** 新增协议按钮操作 - 打开 Drawer */
function handleAddProtocol() {
  protocolDrawerRef.value?.open()
}

/** 编辑按钮操作 - 打开编辑 Drawer */
function handleDetailPage(row) {
  // 打开协议编辑 Drawer
  protocolDrawerRef.value?.open(row)
}

/** 导入数据按钮操作 */
function handleImportData(row) {
  importForm.value.protocolId = row.protocolId
  importForm.value.protocolName = row.protocolName
  importForm.value.importType = 'message'
  fileList.value = []
  importOpen.value = true
}

/** 复制协议按钮操作 */
function handleCopy(row) {
  reset()
  form.value = {
    protocolName: row.protocolName + '_副本',
    protocolType: row.protocolType,
    version: row.version,
    status: row.status,
    description: row.description
  }
  open.value = true
  title.value = "复制协议"
}

/** 文件选择处理 */
function handleFileChange(file) {
  importForm.value.file = file.raw
}

/** 提交导入 */
function submitImport() {
  if (!importForm.value.file) {
    proxy.$modal.msgError("请选择要导入的文件")
    return
  }
  
  const formData = new FormData()
  formData.append('file', importForm.value.file)
  formData.append('protocolId', importForm.value.protocolId)
  formData.append('importType', importForm.value.importType)
  
  try {
    importProtocolData(formData).then(response => {
      proxy.$modal.msgSuccess("导入成功")
      importOpen.value = false
      gridListRef.value?.refresh()
    }).catch(error => {
      console.warn('导入数据失败:', error)
      proxy.$modal.msgError("导入失败，接口暂不可用")
    })
  } catch (error) {
    console.warn('导入数据异常:', error)
    proxy.$modal.msgError("导入失败，接口暂不可用")
  }
}

/** 取消导入 */
function cancelImport() {
  importOpen.value = false
  importForm.value = {
    protocolId: undefined,
    protocolName: '',
    importType: 'message',
    file: null
  }
}

// 获取更多操作列表
const getMoreActionList = (row) => {
  const actions = []
  
  // 固化版本/解除固化
  if (row.isLocked) {
    actions.push({
      label: '解除固化',
      eventTag: 'unlock',
      icon: 'Lock',
      type: 'warning'
    })
  } else {
    actions.push({
      label: '固化版本',
      eventTag: 'lock',
      icon: 'Lock',
      type: 'primary'
    })
  }
  
  // 删除操作（固化版本不能删除）
  if (!row.isLocked) {
    actions.push({
      label: '删除',
      eventTag: 'delete',
      icon: 'Delete',
      danger: true
    })
  }
  
  return actions
}

// 处理更多操作选择
const handleMoreActionSelect = async (item, row, handleRefresh) => {
  switch (item.eventTag) {
    case 'lock':
      handleLockProtocol(row, handleRefresh)
      break
    case 'unlock':
      handleUnlockProtocol(row, handleRefresh)
      break
    case 'delete':
      handleDelete(row)
      break
    default:
      break
  }
}

// 固化协议版本
const handleLockProtocol = async (row, handleRefresh) => {
  try {
    await proxy.$modal.confirm(`确定要固化协议版本 "${row.protocolName}" 吗？固化后将无法修改和删除。`)
    
    // 这里应该调用API接口
    // await lockProtocol(row.protocolId)
    
    // 模拟API调用成功，更新本地数据
    row.isLocked = true
    
    proxy.$modal.msgSuccess("固化成功")
    if (handleRefresh) {
      handleRefresh()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('固化协议版本失败:', error)
      proxy.$modal.msgError("固化失败")
    }
  }
}

// 解除固化协议版本
const handleUnlockProtocol = async (row, handleRefresh) => {
  try {
    await proxy.$modal.confirm(`确定要解除固化协议版本 "${row.protocolName}" 吗？解除后可以重新修改和删除。`)
    
    // 这里应该调用API接口
    // await unlockProtocol(row.protocolId)
    
    // 模拟API调用成功，更新本地数据
    row.isLocked = false
    
    proxy.$modal.msgSuccess("解除固化成功")
    if (handleRefresh) {
      handleRefresh()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('解除固化协议版本失败:', error)
      proxy.$modal.msgError("解除固化失败")
    }
  }
}

/** 协议保存成功回调 */
const handleProtocolSaveSuccess = async (data) => {
  try {
    if (data.protocolId) {
      // 编辑模式
      await updateProtocol(data)
      proxy.$modal.msgSuccess("修改成功")
    } else {
      // 新增模式
      await addProtocol(data)
      proxy.$modal.msgSuccess("新增成功")
    }
    // 关闭 drawer
    protocolDrawerRef.value?.close()
    // 刷新列表
    gridListRef.value?.refresh()
  } catch (error) {
    console.warn('保存协议失败:', error)
    proxy.$modal.msgError("保存失败，接口暂不可用")
    throw error // 让 drawer 保持打开状态
  }
}
</script>