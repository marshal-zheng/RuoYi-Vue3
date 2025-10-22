<template>
   <ContentWrap>
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="分类名称" prop="categoryName">
            <el-input
               v-model="queryParams.categoryName"
               placeholder="请输入分类名称"
               clearable
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
               @click="handleAdd"
               v-hasPermi="['protocol:deviceClazz:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['protocol:deviceClazz:remove']"
            >删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="分类编号" align="center" prop="id" width="100" />
         <el-table-column label="分类名称" align="center" prop="categoryName" :show-overflow-tooltip="true" />
         <el-table-column label="创建人" align="center" prop="createBy" :show-overflow-tooltip="true"/>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
         <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['protocol:deviceClazz:edit']">修改</el-button>
               <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['protocol:deviceClazz:remove']">删除</el-button>
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

      <!-- 设备分类弹框组件 -->
      <DeviceClazzDialog 
         ref="deviceClazzDialogRef"
         @success="getList"
      />
   </ContentWrap>
</template>

<script setup name="DeviceClazz">
import { listDeviceClazz, getDeviceClazz, delDeviceClazz, exportDeviceClazz } from "@/api/fixing/deviceClazz"
import ContentWrap from "@/components/ContentWrap/src/ContentWrap.vue"
import DeviceClazzDialog from "@/views/fixing/components/DeviceClazzDialog.vue"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const categoryList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref([])
const deviceClazzDialogRef = ref()

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    categoryName: null
  }
})

const { queryParams } = toRefs(data)

/** 查询设备分类列表 */
function getList() {
  loading.value = true
  
  // 模拟数据
  const mockData = {
    rows: [
        {
          id: 1,
          categoryName: "传感器设备",
          createBy: "admin",
          createTime: "2023-01-01 10:00:00",
          remark: "各类传感器设备分类"
        },
        {
          id: 2,
          categoryName: "控制器设备",
          createBy: "admin",
          createTime: "2023-01-02 10:00:00",
          remark: "各类控制器设备分类"
        },
        {
          id: 3,
          categoryName: "通信设备",
          createBy: "admin",
          createTime: "2023-01-03 10:00:00",
          remark: "各类通信设备分类"
        }
      ],
    total: 3
  }
  
  try {
    listDeviceClazz(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      categoryList.value = response.rows
      total.value = response.total
      loading.value = false
    }).catch(error => {
      console.warn('API调用失败，使用模拟数据:', error)
      // 使用模拟数据
      categoryList.value = mockData.rows
      total.value = mockData.total
      loading.value = false
    })
  } catch (error) {
    console.warn('API调用异常，使用模拟数据:', error)
    // 使用模拟数据
    categoryList.value = mockData.rows
    total.value = mockData.total
    loading.value = false
  }
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
  deviceClazzDialogRef.value.open()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.categoryId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const categoryId = row.categoryId || ids.value[0]
  deviceClazzDialogRef.value.open(categoryId)
}

/** 删除按钮操作 */
function handleDelete(row) {
  const categoryIds = row.categoryId || ids.value
  let confirmMessage = ''
  
  if (row.categoryId) {
    // 单个删除，显示分类名称
    confirmMessage = '是否确认删除分类"' + row.categoryName + '"？'
  } else {
    // 批量删除，显示选中的分类数量
    const selectedCategories = categoryList.value.filter(item => ids.value.includes(item.categoryId))
    if (selectedCategories.length === 1) {
      confirmMessage = '是否确认删除分类"' + selectedCategories[0].categoryName + '"？'
    } else {
      confirmMessage = '是否确认删除选中的 ' + selectedCategories.length + ' 个分类？'
    }
  }
  
  proxy.$modal.confirm(confirmMessage).then(function() {
    try {
      return delDeviceClazz(categoryIds)
    } catch (error) {
      console.warn('删除分类异常:', error)
      throw error
    }
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  })
}

/** 导出按钮操作 */
function handleExport() {
  try {
    proxy.download("protocol/deviceClazz/export", {
      ...queryParams.value
    }, `device_clazz_${new Date().getTime()}.xlsx`)
  } catch (error) {
    console.warn('导出分类失败:', error)
    proxy.$modal.msgError("导出失败，接口暂不可用")
  }
}

getList()
</script>