<template>
   <ContentWrap>
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="设备名称" prop="deviceName">
            <el-input
               v-model="queryParams.deviceName"
               placeholder="请输入设备名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="总线方式" prop="busType">
            <el-select
               v-model="queryParams.busType"
               placeholder="请选择总线方式"
               clearable
               style="width: 240px"
            >
               <el-option label="RS422" value="RS422" />
               <el-option label="RS485" value="RS485" />
               <el-option label="CAN" value="CAN" />
               <el-option label="LAN" value="LAN" />
               <el-option label="1553B" value="1553B" />
            </el-select>
         </el-form-item>
         <el-form-item label="信息名称" prop="messageName">
            <el-input
               v-model="queryParams.messageName"
               placeholder="请输入信息名称"
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
               @click="handleAddDevice"
               v-hasPermi="['protocol:device:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['protocol:device:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['protocol:device:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['protocol:device:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="deviceList" @selection-change="handleSelectionChange">
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

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

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
   </ContentWrap>
</template>

<script setup name="Device">
import { listDevice, getDevice, delDevice, addDevice, updateDevice, exportDevice, importDeviceData } from "@/api/fixing/device"
import ContentWrap from "@/components/ContentWrap/src/ContentWrap.vue"

const { proxy } = getCurrentInstance()
const router = useRouter()

const deviceList = ref([])
const open = ref(false)
const importOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const fileList = ref([])

const data = reactive({
  form: {},
  importForm: {
    deviceId: undefined,
    deviceName: '',
    importType: 'dataSpec',
    file: null
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceName: undefined,
    busType: undefined,
    messageName: undefined
  },
  rules: {
    deviceName: [{ required: true, message: "设备名称不能为空", trigger: "blur" }],
    deviceCategory: [{ required: true, message: "设备分类不能为空", trigger: "change" }],
    busInterfaces: [{ required: true, message: "总线接口不能为空", trigger: "change" }]
  },
})

const { queryParams, form, importForm, rules } = toRefs(data)

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

/** 查询设备列表 */
function getList() {
  loading.value = true
  
  // 模拟数据
  const mockData = {
    rows: [
      {
        deviceId: 1,
        deviceName: "智能网关设备",
        deviceCategory: "网络设备",
        busInterfaces: ["RS422", "CAN", "LAN"],
        createBy: "张三",
        description: "支持多种总线协议的智能网关设备",
        createTime: "2024-01-15 10:30:00",
        updateTime: "2024-01-20 14:25:00"
      },
      {
        deviceId: 2,
        deviceName: "温度传感器",
        deviceCategory: "传感器设备",
        busInterfaces: ["RS485"],
        createBy: "李四",
        description: "高精度温度传感器，支持RS485通信",
        createTime: "2024-01-10 09:15:00",
        updateTime: "2024-01-18 16:40:00"
      },
      {
        deviceId: 3,
        deviceName: "数据采集器",
        deviceCategory: "数据采集设备",
        busInterfaces: ["RS422", "RS485", "CAN"],
        createBy: "王五",
        description: "多通道数据采集器，支持多种总线接口",
        createTime: "2024-01-08 11:20:00",
        updateTime: "2024-01-22 13:55:00"
      },
      {
        deviceId: 4,
        deviceName: "工业控制器",
        deviceCategory: "控制器设备",
        busInterfaces: ["CAN", "1553B"],
        createBy: "赵六",
        description: "工业级控制器，支持CAN和1553B总线",
        createTime: "2024-01-05 14:45:00",
        updateTime: "2024-01-19 10:30:00"
      },
      {
        deviceId: 5,
        deviceName: "通信模块",
        deviceCategory: "通信设备",
        busInterfaces: ["LAN", "RS422"],
        createBy: "陈七",
        description: "高速通信模块，支持以太网和串口通信",
        createTime: "2024-01-03 16:10:00",
        updateTime: "2024-01-21 09:15:00"
      }
    ],
    total: 5
  }
  
  try {
    listDevice(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      deviceList.value = response.rows
      total.value = response.total
      loading.value = false
    }).catch(error => {
      console.warn('API调用失败，使用模拟数据:', error)
      // 使用模拟数据
      deviceList.value = mockData.rows
      total.value = mockData.total
      loading.value = false
    })
  } catch (error) {
    console.warn('API调用异常，使用模拟数据:', error)
    // 使用模拟数据
    deviceList.value = mockData.rows
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
    deviceId: undefined,
    deviceName: undefined,
    deviceCategory: undefined,
    busInterfaces: [],
    description: undefined
  }
  proxy.resetForm("deviceRef")
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
            getList()
          }).catch(error => {
            console.warn('修改设备失败:', error)
            proxy.$modal.msgError("修改失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('修改设备异常:', error)
          proxy.$modal.msgError("修改失败，接口暂不可用")
        }
      } else {
        try {
          addDevice(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功")
            open.value = false
            getList()
          }).catch(error => {
            console.warn('新增设备失败:', error)
            proxy.$modal.msgError("新增失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('新增设备异常:', error)
          proxy.$modal.msgError("新增失败，接口暂不可用")
        }
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
    const selectedDevices = deviceList.value.filter(item => ids.value.includes(item.deviceId))
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
    getList()
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
      getList()
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

getList()
</script>