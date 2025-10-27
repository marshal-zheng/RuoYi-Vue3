<template>
  <ZxContentWrap title="设备分类">
    <ZxGridList
      ref="gridListRef"
      :load-data="loadDeviceClazzData"
      :show-pagination="true"
      :page-sizes="[10, 20, 50, 100]"
      :default-page-size="10"
      :load-on-mounted="true"
      :clear-selection-on-load="true"
      class="device-clazz-grid zx-grid-list--page"
    >
      <!-- 工具栏：左-操作 | 中-筛选 | 右-搜索 -->
      <template #form="{ query, loading, refresh: handleRefresh, updateState }">
        <div class="zx-grid-form-bar">
          <div class="zx-grid-form-bar__left">
            <ZxButton 
              type="primary" 
              @click="handleAdd"
              v-hasPermi="['protocol:deviceClazz:add']"
            >新增</ZxButton>
            <ZxButton 
              type="danger" 
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['protocol:deviceClazz:remove']"
            >删除</ZxButton>
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
            ></el-date-picker>
          </div>
          <div class="zx-grid-form-bar__right">
            <ZxSearch
              v-model="query.name"
              placeholder="搜索分类名称"
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
          <el-table-column label="分类编号" align="center" prop="deviceClazzId" width="100" />
          <el-table-column label="分类名称" align="center" prop="name" :show-overflow-tooltip="true" />
          <el-table-column label="分类描述" align="center" prop="descr" :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center" prop="status" width="80">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
            </template>
          </el-table-column>
          <el-table-column label="创建人" align="center" prop="createBy" :show-overflow-tooltip="true"/>
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column 
            label="操作" 
            width="200"
            class-name="op-col"
            label-class-name="op-col__header"
          >
            <template #default="scope">
              <div class="op-col__wrap">
                <ZxButton 
                  link 
                  type="primary" 
                  @click="handleUpdate(scope.row)" 
                  v-hasPermi="['protocol:deviceClazz:edit']"
                >修改</ZxButton>
                <ZxButton 
                  link 
                  type="danger" 
                  @click="handleDelete(scope.row)" 
                  v-hasPermi="['protocol:deviceClazz:remove']"
                >删除</ZxButton>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </ZxGridList>

    <!-- 设备分类弹框组件 -->
    <DeviceClazzDialog 
      ref="deviceClazzDialogRef"
      @success="handleFormSuccess"
    />
  </ZxContentWrap>
</template>

<script setup name="DeviceClazz">
import { ref, nextTick } from 'vue'
import { listDeviceClazz, getDeviceClazz, delDeviceClazz, exportDeviceClazz } from "@/api/fixing/deviceClazz"
import DeviceClazzDialog from "@/views/fixing/components/DeviceClazzDialog.vue"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

// 组件引用
const gridListRef = ref()
const deviceClazzDialogRef = ref()

// 状态管理
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

// 数据加载函数 - 适配 ZxGridList
const loadDeviceClazzData = async (params) => {
  // 模拟数据
  const mockData = {
    rows: [
        {
          deviceClazzId: 1,
          name: "传感器设备",
          descr: "各类传感器设备分类",
          status: "0",
          createBy: "admin",
          createTime: "2023-01-01 10:00:00",
          updateBy: "admin",
          updateTime: "2023-01-01 10:00:00"
        },
        {
          deviceClazzId: 2,
          name: "控制器设备",
          descr: "各类控制器设备分类",
          status: "0",
          createBy: "admin",
          createTime: "2023-01-02 10:00:00",
          updateBy: "admin",
          updateTime: "2023-01-02 10:00:00"
        },
        {
          deviceClazzId: 3,
          name: "通信设备",
          descr: "各类通信设备分类",
          status: "0",
          createBy: "admin",
          createTime: "2023-01-03 10:00:00",
          updateBy: "admin",
          updateTime: "2023-01-03 10:00:00"
        }
      ],
    total: 3
  }
  
  try {
    // 构建查询参数，包含日期范围
    const queryParams = { ...params }
    if (params.dateRange && params.dateRange.length === 2) {
      queryParams.beginTime = params.dateRange[0]
      queryParams.endTime = params.dateRange[1]
      delete queryParams.dateRange
    }
    
    const response = await listDeviceClazz(queryParams)
    return response
  } catch (error) {
    console.warn('API调用失败，使用模拟数据:', error)
    // 使用模拟数据
    return mockData
  }
}

// 筛选和搜索处理
const onFilterChange = (field, value, { handleRefresh, updateState }) => {
  updateState('pager.page', 1)

  // 使用 nextTick 确保状态更新后再刷新
  nextTick(() => {
    handleRefresh()
  })
}

const onSearch = ({ handleRefresh, updateState }) => {
  updateState('pager.page', 1)
  handleRefresh()
}

// 事件处理
const handleAdd = () => {
  // 调用子组件的 open 方法，不传数据表示新增
  deviceClazzDialogRef.value?.open()
}

const handleUpdate = (row) => {
  // 调用子组件的 open 方法，传递 deviceClazzId 表示编辑
  const deviceClazzId = row.deviceClazzId || ids.value[0]
  deviceClazzDialogRef.value?.open(deviceClazzId)
}

const handleFormSuccess = () => {
  // 刷新列表
  gridListRef.value?.refresh()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.deviceClazzId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deviceClazzIds = row.deviceClazzId || ids.value
  let confirmMessage = ''
  
  if (row.deviceClazzId) {
    // 单个删除，显示分类名称
    confirmMessage = '是否确认删除分类"' + row.name + '"？'
  } else {
    // 批量删除，显示选中的分类数量
    if (ids.value.length === 1) {
      // 从当前表格数据中找到对应的分类名称
      const currentData = gridListRef.value?.grid?.list || []
      const selectedCategory = currentData.find(item => item.deviceClazzId === ids.value[0])
      confirmMessage = selectedCategory ? 
        '是否确认删除分类"' + selectedCategory.name + '"？' : 
        '是否确认删除选中的分类？'
    } else {
      confirmMessage = '是否确认删除选中的 ' + ids.value.length + ' 个分类？'
    }
  }
  
  proxy.$modal.confirm(confirmMessage).then(function() {
    try {
      return delDeviceClazz(deviceClazzIds)
    } catch (error) {
      console.warn('删除分类异常:', error)
      throw error
    }
  }).then(() => {
    gridListRef.value?.refresh()
    proxy.$modal.msgSuccess("删除成功")
  })
}

/** 导出按钮操作 */
function handleExport() {
  try {
    // 获取当前查询参数
    const currentQuery = gridListRef.value?.query || {}
    proxy.download("protocol/deviceClazz/export", {
      ...currentQuery
    }, `device_clazz_${new Date().getTime()}.xlsx`)
  } catch (error) {
    console.warn('导出分类失败:', error)
    proxy.$modal.msgError("导出失败，接口暂不可用")
  }
}
</script>