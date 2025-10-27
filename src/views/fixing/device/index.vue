<template>
   <ZxContentWrap title="设备管理">
      <ZxGridList
         ref="gridListRef"
         :load-data="loadDeviceData"
         :show-pagination="true"
         :page-sizes="[10, 20, 50, 100]"
         :default-page-size="10"
         :load-on-mounted="true"
         :clear-selection-on-load="true"
         class="device-grid zx-grid-list--page"
      >
         <!-- 工具栏：左-操作 | 中-筛选 | 右-搜索 -->
         <template #form="{ query, loading, refresh: handleRefresh, updateState }">
            <div class="zx-grid-form-bar">
               <div class="zx-grid-form-bar__left">
                  <ZxButton
                     type="primary"
                     icon="Plus"
                     @click="handleAddDevice"
                     v-hasPermi="['protocol:device:add']"
                  >新增</ZxButton>
                  <ZxButton
                     type="success"
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['protocol:device:edit']"
                  >修改</ZxButton>
                  <ZxButton
                     type="danger"
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['protocol:device:remove']"
                  >删除</ZxButton>
                  <ZxButton
                     type="warning"
                     icon="Download"
                     @click="handleExport"
                     v-hasPermi="['protocol:device:export']"
                  >导出</ZxButton>
               </div>
               
               <div class="zx-grid-form-bar__filters">
                  <el-select
                    v-model="query.busType"
                    placeholder="请选择总线方式"
                    clearable
                    style="width: 200px"
                    @change="(v) => onFilterChange('busType', v, { handleRefresh, updateState })"
                  >
                    <el-option label="RS422" value="RS422" />
                    <el-option label="RS485" value="RS485" />
                    <el-option label="CAN" value="CAN" />
                    <el-option label="LAN" value="LAN" />
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
                     v-model="query.deviceName"
                     placeholder="搜索设备名称"
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
               <el-table-column label="设备编号" align="center" prop="deviceId" width="100" />
               <el-table-column label="设备名称" align="center" :show-overflow-tooltip="true">
                  <template #default="scope">
                     <router-link :to="'/fixing/device-detail/index/' + scope.row.deviceId" class="link-type">
                        <span>{{ scope.row.deviceName }}</span>
                     </router-link>
                  </template>
               </el-table-column>
               <el-table-column label="设备分类" align="center" prop="deviceCategory" :show-overflow-tooltip="true" />
               <el-table-column label="总线接口" align="center" prop="busInterfaces" :show-overflow-tooltip="true">
                  <template #default="scope">
                     <span>{{ formatBusInterfaces(scope.row.busInterfaces) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="创建人" align="center" prop="createBy" :show-overflow-tooltip="true"/>
               <el-table-column label="最后修改时间" align="center" prop="updateTime" width="180">
                  <template #default="scope">
                     <span>{{ parseTime(scope.row.updateTime) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
                  <template #default="scope">
                     <el-button link type="primary" icon="Edit" @click="handleDetailPage(scope.row)" v-hasPermi="['protocol:device:query']">编辑</el-button>
                     <!-- <el-button link type="success" icon="Upload" @click="handleImportData(scope.row)" v-hasPermi="['protocol:device:import']">导入数据</el-button> -->
                     <!-- <el-button link type="info" icon="CopyDocument" @click="handleCopy(scope.row)" v-hasPermi="['protocol:device:add']">复制</el-button> -->
                     <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['protocol:device:remove']">删除</el-button>
                  </template>
               </el-table-column>
            </el-table>
         </template>
      </ZxGridList>

      <!-- 添加或修改设备对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form ref="deviceRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="设备名称" prop="deviceName">
               <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
            </el-form-item>
            <el-form-item label="设备分类" prop="deviceCategory">
               <el-select v-model="form.deviceCategory" placeholder="请选择设备分类" style="width: 100%">
                  <el-option label="网络设备" value="网络设备" />
                  <el-option label="传感器设备" value="传感器设备" />
                  <el-option label="控制器设备" value="控制器设备" />
                  <el-option label="通信设备" value="通信设备" />
                  <el-option label="数据采集设备" value="数据采集设备" />
               </el-select>
            </el-form-item>
            <el-form-item label="总线接口" prop="busInterfaces">
               <el-checkbox-group v-model="form.busInterfaces">
                  <el-checkbox label="RS422">RS422</el-checkbox>
                  <el-checkbox label="RS485">RS485</el-checkbox>
                  <el-checkbox label="CAN">CAN</el-checkbox>
                  <el-checkbox label="LAN">LAN</el-checkbox>
                  <el-checkbox label="1553B">1553B</el-checkbox>
               </el-checkbox-group>
            </el-form-item>
            <el-form-item label="设备描述" prop="description">
               <el-input v-model="form.description" type="textarea" placeholder="请输入设备描述" :rows="3"></el-input>
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
            <el-form-item label="设备名称">
               <el-input v-model="importForm.deviceName" readonly />
            </el-form-item>
            <el-form-item label="导入类型" prop="importType">
               <el-radio-group v-model="importForm.importType">
                  <el-radio label="dataSpec">数据规格</el-radio>
                  <el-radio label="message">通信报文</el-radio>
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
   </ZxContentWrap>
</template>

<script setup name="Device">
import { listDevice, getDevice, delDevice, addDevice, updateDevice, exportDevice, importDeviceData } from "@/api/fixing/device"

const { proxy } = getCurrentInstance()
const router = useRouter()

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
    deviceId: undefined,
    deviceName: '',
    importType: 'dataSpec',
    file: null
  },
  rules: {
    deviceName: [{ required: true, message: "设备名称不能为空", trigger: "blur" }],
    deviceCategory: [{ required: true, message: "设备分类不能为空", trigger: "change" }],
    busInterfaces: [{ required: true, message: "总线接口不能为空", trigger: "change" }]
  },
})

const { form, importForm, rules } = toRefs(data)

/** ZxGridList 数据加载函数 */
async function loadDeviceData(params) {
  const queryData = {
    pageNum: params.page,
    pageSize: params.size,
    deviceName: params.query?.deviceName || '',
    busType: params.query?.busType || '',
    messageName: params.query?.messageName || ''
  }
  
  // 添加日期范围
  const finalParams = proxy.addDateRange(queryData, params.query?.dateRange || [])
  
  const response = await listDevice(finalParams)
  return {
    data: response.rows,
    total: response.total
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

/** 格式化总线接口显示 */
function formatBusInterfaces(interfaces) {
  if (!interfaces || interfaces.length === 0) return '-'
  
  // 如果是数组，统计每种接口的数量
  if (Array.isArray(interfaces)) {
    const counts = {}
    interfaces.forEach(item => {
      counts[item] = (counts[item] || 0) + 1
    })
    return Object.entries(counts).map(([type, count]) => `${type}(${count})`).join(', ')
  }
  
  // 如果是字符串，直接返回
  return interfaces
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    deviceId: undefined,
    deviceName: undefined,
    deviceCategory: undefined,
    busInterfaces: [],
    description: undefined
  }
  proxy.resetForm("deviceRef")
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加设备"
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.deviceId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const deviceId = row.deviceId || ids.value
  
  try {
    getDevice(deviceId).then(response => {
      form.value = response.data
      open.value = true
      title.value = "修改设备"
    }).catch(error => {
      console.warn('获取设备详情失败，使用默认数据:', error)
      // 使用行数据作为默认值
      if (row.deviceId) {
        form.value = {
          deviceId: row.deviceId,
          deviceName: row.deviceName,
          deviceCategory: row.deviceCategory,
          busInterfaces: row.busInterfaces || [],
          description: row.description
        }
      }
      open.value = true
      title.value = "修改设备"
    })
  } catch (error) {
    console.warn('获取设备详情异常:', error)
    if (row.deviceId) {
      form.value = {
        deviceId: row.deviceId,
        deviceName: row.deviceName,
        deviceCategory: row.deviceCategory,
        busInterfaces: row.busInterfaces || [],
        description: row.description
      }
    }
    open.value = true
    title.value = "修改设备"
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deviceRef"].validate(valid => {
    if (valid) {
      if (form.value.deviceId != undefined) {
        try {
          updateDevice(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功")
            open.value = false
            gridListRef.value?.refresh()
          }).catch(error => {
            console.warn('修改设备失败:', error)
            proxy.$modal.msgError("修改失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('修改设备异常:', error)
          proxy.$modal.msgError("修改失败，接口暂不可用")
        }
      } else {
        addDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          gridListRef.value?.refresh()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deviceIds = row.deviceId || ids.value
  let confirmMessage = ''
  
  if (row.deviceId) {
    // 单个删除，显示设备名称
    confirmMessage = '是否确认删除设备"' + row.deviceName + '"？'
  } else {
    // 批量删除，显示选中的设备数量
    const currentData = gridListRef.value?.getData() || []
    const selectedDevices = currentData.filter(item => ids.value.includes(item.deviceId))
    if (selectedDevices.length === 1) {
      confirmMessage = '是否确认删除设备"' + selectedDevices[0].deviceName + '"？'
    } else {
      confirmMessage = '是否确认删除选中的 ' + selectedDevices.length + ' 个设备？'
    }
  }
  
  proxy.$modal.confirm(confirmMessage).then(function() {
    try {
      return delDevice(deviceIds)
    } catch (error) {
      console.warn('删除设备异常:', error)
      throw error
    }
  }).then(() => {
    gridListRef.value?.refresh()
    proxy.$modal.msgSuccess("删除成功")
  }).catch((error) => {
    if (error && error.message !== 'cancel') {
      console.warn('删除设备失败:', error)
      proxy.$modal.msgError("删除失败，接口暂不可用")
    }
  })
}

/** 导出按钮操作 */
function handleExport() {
  try {
    proxy.download("protocol/device/export", {
      ...queryParams.value
    }, `device_${new Date().getTime()}.xlsx`)
  } catch (error) {
    console.warn('导出设备失败:', error)
    proxy.$modal.msgError("导出失败，接口暂不可用")
  }
}

/** 新增设备按钮操作 - 跳转到详情页面 */
function handleAddDevice() {
  // 跳转到设备详情页面，用于新增设备配置
  proxy.$router.push('/fixing/device-detail/index/new')
}

/** 详情页面按钮操作 - 跳转到详情页面 */
function handleDetailPage(row) {
  // 跳转到设备详情页面，用于管理设备配置
  proxy.$router.push('/fixing/device-detail/index/' + row.deviceId)
}

/** 导入数据按钮操作 */
function handleImportData(row) {
  importForm.value.deviceId = row.deviceId
  importForm.value.deviceName = row.deviceName
  importForm.value.importType = 'dataSpec'
  fileList.value = []
  importOpen.value = true
}

/** 复制设备按钮操作 */
function handleCopy(row) {
  reset()
  form.value = {
    deviceName: row.deviceName + '_副本',
    deviceCategory: row.deviceCategory,
    busInterfaces: [...(row.busInterfaces || [])],
    description: row.description
  }
  open.value = true
  title.value = "复制设备"
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
  formData.append('deviceId', importForm.value.deviceId)
  formData.append('importType', importForm.value.importType)
  
  try {
    importDeviceData(formData).then(response => {
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
    deviceId: undefined,
    deviceName: '',
    importType: 'dataSpec',
    file: null
  }
  fileList.value = []
}
</script>