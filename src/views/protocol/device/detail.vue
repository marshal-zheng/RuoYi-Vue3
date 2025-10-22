<template>
  <ContentWrap>
    <div class="device-detail">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h2>设备端口配置 - {{ deviceInfo.deviceName || '加载中...' }}</h2>
          <el-tag v-if="!loading" type="info" size="large">
            已配置 {{ devicePorts.length }} 个端口
          </el-tag>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="Plus" @click="handleAddPort">添加端口</el-button>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </div>

      <!-- 画布 -->
      <el-card shadow="never" class="canvas-card" v-loading="loading">
        <div class="canvas-tip">
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            <template #title>
              <span>💡 提示：右键设备可添加端口 | 点击端口高亮选中 | 右键端口可编辑</span>
            </template>
          </el-alert>
        </div>
        <div class="canvas-wrapper">
          <XFlow>
            <XFlowGraph
              ref="graphRef"
              :readonly="false"
              :connection-options="connectionOptions"
              :connection-edge-options="connectionEdgeOptions"
              :custom-menu-handler="customMenuHandler"
              @ready="onGraphReady"
              @node:click="onNodeClick"
            >
              <!-- 网格 -->
              <XFlowGrid :size="14" type="mesh" :dot-size="2" color="#e6e6e6" />
            </XFlowGraph>
          </XFlow>
        </div>
      </el-card>

      <!-- 端口编辑对话框 -->
      <el-dialog
        v-model="portDialogVisible"
        :title="portDialogTitle"
        width="500px"
        @close="handlePortDialogClose"
      >
        <el-form ref="portFormRef" :model="portForm" :rules="portFormRules" label-width="100px">
          <el-form-item label="总线类型" prop="interfaceType">
            <InterfaceTypeSelector
              v-model="portForm.interfaceType"
              @change="handleBusTypeChange"
            />
          </el-form-item>
          <el-form-item label="端口名称" prop="interfaceName">
            <el-input v-model="portForm.interfaceName" placeholder="请输入端口名称" />
          </el-form-item>
          <el-form-item label="端口位置" prop="position">
            <PositionSelector
              v-model="portForm.position"
              @change="handlePositionChange"
            />
          </el-form-item>
          <el-form-item label="端口描述" prop="description">
            <el-input
              v-model="portForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入端口描述"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="portDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handlePortSubmit">确定</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 编辑设备名称对话框 -->
      <el-dialog
        v-model="deviceNameDialogVisible"
        title="编辑设备名称"
        width="400px"
        @close="handleDeviceNameDialogClose"
      >
        <el-form ref="deviceNameFormRef" :model="deviceNameForm" :rules="deviceNameFormRules" label-width="100px">
          <el-form-item label="设备名称" prop="deviceName">
            <el-input v-model="deviceNameForm.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="deviceNameDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleDeviceNameSubmit">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </ContentWrap>
</template>

<script setup name="DeviceDetail">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ContentWrap from '@/components/ContentWrap/src/ContentWrap.vue'
import { XFlow, XFlowGraph, XFlowGrid } from '@/components/business/ZxFlow'
import { registerDagShapes, DAG_EDGE, DAG_CONNECTOR } from '@/components/business/Dag/shapes/registerDagShapes'
import { getDevice } from '@/api/protocol/device'
import { InterfaceTypeSelector, PositionSelector } from '@/views/protocol/components/selector'

// 注册自定义形状
registerDagShapes()

// 连线配置
const connectionOptions = {
  snap: true,
  allowBlank: false,
  allowLoop: false,
  highlight: true,
  connectionPoint: 'anchor',
  anchor: 'center',
  connector: DAG_CONNECTOR,
  validateConnection({ sourceMagnet, targetMagnet }) {
    // 允许所有端口之间的连接
    return !!(sourceMagnet && targetMagnet)
  }
}

const connectionEdgeOptions = {
  shape: DAG_EDGE,
  animated: false,
  zIndex: -1,
  attrs: {
    line: {
      stroke: '#C2C8D5',
      strokeWidth: 2,
      targetMarker: {
        name: 'block',
        width: 8,
        height: 6
      }
    }
  }
}

const router = useRouter()
const route = useRoute()

// 数据
const loading = ref(false)
const deviceInfo = ref({})
const devicePorts = ref([])
const graphRef = ref(null)
const graphInstance = ref(null)
const selectedPortId = ref(null)

// 端口对话框
const portDialogVisible = ref(false)
const portDialogTitle = ref('添加端口')
const portFormRef = ref(null)
const portForm = reactive({
  interfaceId: null,
  deviceId: null,
  interfaceName: '',
  interfaceType: 'RS422',
  position: 'right',
  description: ''
})

const portFormRules = {
  interfaceName: [{ required: true, message: '请输入端口名称', trigger: 'blur' }],
  interfaceType: [{ required: true, message: '请选择总线类型', trigger: 'change' }],
  position: [{ required: true, message: '请选择端口位置', trigger: 'change' }]
}

// 设备名称编辑对话框
const deviceNameDialogVisible = ref(false)
const deviceNameFormRef = ref(null)
const deviceNameForm = reactive({
  deviceName: ''
})

const deviceNameFormRules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }]
}

// 前端临时存储的端口列表（不调用后端接口）
const tempPorts = ref([])


/** 返回列表 */
function goBack() {
  router.push('/protocol/device')
}

/** 加载设备信息 */
async function loadDeviceInfo() {
  const deviceId = route.params.id
  if (!deviceId) {
    ElMessage.error('设备ID不存在')
    return
  }

  loading.value = true
  try {
    const response = await getDevice(deviceId)
    deviceInfo.value = response.data || response
    await loadDevicePorts()
    updateGraphData()
  } catch (error) {
    console.error('加载设备信息失败:', error)
    ElMessage.error('加载设备信息失败')
  } finally {
    loading.value = false
  }
}

/** 加载设备端口 */
async function loadDevicePorts() {
  // 前端模式：使用临时端口列表
  devicePorts.value = tempPorts.value
  
  // 如果需要从后端加载，取消下面的注释
  /*
  const deviceId = route.params.id
  try {
    const response = await listDeviceBusInterface({ deviceId })
    devicePorts.value = response.rows || response.data || []
  } catch (error) {
    console.error('加载端口列表失败:', error)
    devicePorts.value = []
  }
  */
}

/** 更新图数据 */
function updateGraphData() {
  if (!graphInstance.value) return

  // 构建设备节点的端口列表（用于视觉显示）
  const portsData = devicePorts.value.map((port, index) => ({
    id: port.id || `port_${index}`,
    group: port.position || 'right',
    interfaceId: port.interfaceId || port.id,
    interfaceName: port.interfaceName,
    interfaceType: port.interfaceType,
    description: port.description
  }))

  // 定义端口组配置（与 DagDnd.vue 保持一致）
  const portGroups = {
    top: {
      position: { name: 'absolute' },
      markup: [
        { tagName: 'rect', selector: 'portBody' },
        { tagName: 'text', selector: 'portLabel' }
      ],
      attrs: {
        portBody: {
          width: 16,
          height: 12,
          x: -8,
          y: -6,
          magnet: true,
          fill: '#fff',
          strokeWidth: 1,
          cursor: 'crosshair',
          rx: 0,
          ry: 0
        },
        portLabel: {
          text: '',
          fontSize: 7,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 500,
          fill: '#4b5563',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 0,
          y: 0,
          pointerEvents: 'none'
        }
      }
    },
    bottom: {
      position: { name: 'absolute' },
      markup: [
        { tagName: 'rect', selector: 'portBody' },
        { tagName: 'text', selector: 'portLabel' }
      ],
      attrs: {
        portBody: {
          width: 16,
          height: 12,
          x: -8,
          y: -6,
          magnet: true,
          fill: '#fff',
          strokeWidth: 1,
          cursor: 'crosshair',
          rx: 0,
          ry: 0
        },
        portLabel: {
          text: '',
          fontSize: 7,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 500,
          fill: '#4b5563',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 0,
          y: 0,
          pointerEvents: 'none'
        }
      }
    },
    left: {
      position: { name: 'absolute' },
      markup: [
        { tagName: 'rect', selector: 'portBody' },
        { tagName: 'text', selector: 'portLabel' }
      ],
      attrs: {
        portBody: {
          width: 32,
          height: 12,
          x: -16,
          y: -6,
          magnet: true,
          fill: '#fff',
          strokeWidth: 1,
          cursor: 'crosshair',
          rx: 0,
          ry: 0
        },
        portLabel: {
          text: '',
          fontSize: 7,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 500,
          fill: '#4b5563',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 0,
          y: 0,
          pointerEvents: 'none'
        }
      }
    },
    right: {
      position: { name: 'absolute' },
      markup: [
        { tagName: 'rect', selector: 'portBody' },
        { tagName: 'text', selector: 'portLabel' }
      ],
      attrs: {
        portBody: {
          width: 32,
          height: 12,
          x: -16,
          y: -6,
          magnet: true,
          fill: '#fff',
          strokeWidth: 1,
          cursor: 'crosshair',
          rx: 0,
          ry: 0
        },
        portLabel: {
          text: '',
          fontSize: 7,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 500,
          fill: '#4b5563',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: 0,
          y: 0,
          pointerEvents: 'none'
        }
      }
    }
  }
  
  // 构建 X6 端口配置（用于连接桩）
  const x6Ports = devicePorts.value.map((port, index) => {
    const portId = port.id || `port_${index}`
    const group = port.position || 'right'
    const busType = port.interfaceType || 'RS422'
    
    // 根据总线类型确定颜色
    const colorMap = {
      'RS422': '#f59e0b',
      'RS485': '#f97316',
      'CAN': '#3b82f6',
      'LAN': '#10b981',
      '1553B': '#8b5cf6'
    }
    const color = colorMap[busType] || '#6b7280'
    
    // 文本截断
    const isTopBottom = group === 'top' || group === 'bottom'
    const portName = port.interfaceName || port.id
    const displayText = portName.length > (isTopBottom ? 6 : 7) 
      ? portName.substring(0, isTopBottom ? 5 : 6) + '..' 
      : portName
    
    return {
      id: portId,
      group: group,
      args: { x: 0, y: 0 }, // 初始位置，后续由 syncPortPositions 更新
      attrs: {
        portBody: {
          stroke: color  // 根据总线类型设置边框颜色
        },
        portLabel: {
          text: displayText
        }
      }
    }
  })

  // 清除现有节点
  graphInstance.value.clearCells()

  // 创建设备节点
  const deviceNode = graphInstance.value.addNode({
    id: 'device_node',
    shape: 'device-port-node',
    x: 100,
    y: 75,
    width: 200,
    height: 150,
    data: {
      type: 'device',
      label: deviceInfo.value.deviceName || '设备',
      deviceId: deviceInfo.value.deviceId || null,
      busType: deviceInfo.value.busType || '',
      ports: portsData,
      selectedPortId: selectedPortId.value
    },
    ports: {
      groups: portGroups,
      items: x6Ports
    }
  })

  // 自动调整视图，让节点可见
  nextTick(() => {
    graphInstance.value.zoomToFit({ padding: 50, maxScale: 1 })
  })
}

/** 自定义右键菜单处理器 */
function customMenuHandler(standardItems, type, target) {
  // 节点右键菜单
  if (type === 'node' && target?.id === 'device_node') {
    return [
      {
        id: 'edit-device-name',
        label: '编辑设备名称',
        icon: 'Edit',
        action: () => handleEditDeviceName()
      },
      { type: 'divider' },
      {
        id: 'add-left-port',
        label: '添加左侧端口',
        icon: 'Plus',
        action: () => handleAddPortWithPosition('left')
      },
      {
        id: 'add-right-port',
        label: '添加右侧端口',
        icon: 'Plus',
        action: () => handleAddPortWithPosition('right')
      },
      { type: 'divider' },
      {
        id: 'add-top-port',
        label: '添加顶部端口',
        icon: 'Plus',
        action: () => handleAddPortWithPosition('top')
      },
      {
        id: 'add-bottom-port',
        label: '添加底部端口',
        icon: 'Plus',
        action: () => handleAddPortWithPosition('bottom')
      }
    ]
  }
  
  // 其他情况返回空菜单
  return []
}

/** Graph 准备就绪 */
function onGraphReady(graph) {
  graphInstance.value = graph
  console.log('Graph Ready:', graph)
  
  // 监听端口右键菜单事件
  graph.on('port:contextmenu', handlePortContextMenu)
  
  // Graph 准备好后立即渲染节点（无论数据是否加载完成）
  updateGraphData()
}

/** 端口右键菜单处理 */
function handlePortContextMenu({ port, node, e }) {
  e.preventDefault()
  
  // 找到对应的端口数据
  const portData = tempPorts.value.find(p => (p.id || p.interfaceId) === (port.id || port.interfaceId))
  if (!portData) return
  
  // 使用 Element Plus 的确认框
  ElMessageBox.confirm(
    `端口：${port.interfaceName} (${port.interfaceType})`,
    '端口操作',
    {
      confirmButtonText: '编辑',
      cancelButtonText: '删除',
      distinguishCancelAndClose: true,
      type: 'info'
    }
  ).then(() => {
    // 编辑端口
    handleEditPort(portData)
  }).catch((action) => {
    if (action === 'cancel') {
      // 删除端口
      ElMessageBox.confirm(
        `确定要删除端口 "${port.interfaceName}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        handleDeletePort(port.id || port.interfaceId)
      }).catch(() => {
        // 用户取消删除
      })
    }
  })
}

/** 节点点击事件 */
function onNodeClick(args) {
  const { node, e } = args
  
  // 检查是否点击了端口
  const target = e.target
  if (target && target.classList && target.classList.contains('port-item')) {
    const portId = target.dataset.portId
    handlePortClick(portId)
  }
}

/** 添加指定位置的端口 */
function handleAddPortWithPosition(position) {
  const positionMap = {
    left: '左侧',
    right: '右侧',
    top: '顶部',
    bottom: '底部'
  }
  portDialogTitle.value = `添加${positionMap[position]}端口`
  portForm.interfaceId = null
  portForm.deviceId = route.params.id
  portForm.interfaceName = ''
  portForm.interfaceType = 'RS422' // 默认第一个总线类型
  portForm.position = position
  portForm.description = ''
  
  // 自动生成端口名称
  handleBusTypeChange('RS422')
  
  portDialogVisible.value = true
}

/** 端口点击处理 */
function handlePortClick(portId) {
  if (!portId) return
  
  // 切换选中状态
  if (selectedPortId.value === portId) {
    selectedPortId.value = null
  } else {
    selectedPortId.value = portId
  }
  
  // 更新端口高亮状态
  updatePortHighlight()
}

/** 更新端口高亮状态 */
function updatePortHighlight() {
  if (!graphInstance.value) return
  
  const node = graphInstance.value.getCellById('device_node')
  if (node) {
    node.setData({ 
      ...node.getData(), 
      selectedPortId: selectedPortId.value 
    })
  }
}

/** 总线类型变化处理 */
function handleBusTypeChange(busType) {
  // 只在添加端口时自动填充名称，编辑时不自动填充
  if (!portForm.interfaceId && busType) {
    generatePortName(busType, portForm.position)
  }
}

/** 位置变化处理 */
function handlePositionChange(position) {
  // 只在添加端口时自动填充名称，编辑时不自动填充
  if (!portForm.interfaceId && portForm.interfaceType) {
    generatePortName(portForm.interfaceType, position)
  }
}

/** 生成端口名称 */
function generatePortName(busType, position) {
  // 直接使用总线类型标签名
  portForm.interfaceName = busType
}

/** 添加端口 */
function handleAddPort() {
  portDialogTitle.value = '添加端口'
  portForm.interfaceId = null
  portForm.deviceId = route.params.id
  portForm.interfaceName = ''
  portForm.interfaceType = 'RS422'
  portForm.position = 'right'
  portForm.description = ''
  portDialogVisible.value = true
}

/** 编辑端口 */
function handleEditPort(port) {
  portDialogTitle.value = '编辑端口'
  portForm.interfaceId = port.interfaceId || port.id
  portForm.deviceId = port.deviceId || route.params.id
  portForm.interfaceName = port.interfaceName
  portForm.interfaceType = port.interfaceType
  portForm.position = port.position
  portForm.description = port.description
  portDialogVisible.value = true
}

/** 删除端口 */
async function handleDeletePort(interfaceId) {
  // 前端模式：直接从临时列表删除
  const index = tempPorts.value.findIndex(p => (p.id || p.interfaceId) === interfaceId)
  if (index > -1) {
    tempPorts.value.splice(index, 1)
    ElMessage.success('删除成功')
    await loadDevicePorts()
    updateGraphData()
  }
  
  // 如果需要调用后端接口，取消下面的注释
  /*
  try {
    await delDeviceBusInterface(interfaceId)
    ElMessage.success('删除成功')
    await loadDevicePorts()
    updateGraphData()
  } catch (error) {
    console.error('删除端口失败:', error)
    ElMessage.error('删除端口失败')
  }
  */
}

/** 提交端口表单 */
async function handlePortSubmit() {
  if (!portFormRef.value) return
  
  await portFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 前端模式：直接操作临时列表
    if (portForm.interfaceId) {
      // 编辑端口
      const index = tempPorts.value.findIndex(p => (p.id || p.interfaceId) === portForm.interfaceId)
      if (index > -1) {
        tempPorts.value[index] = { ...portForm }
        ElMessage.success('修改成功')
      }
    } else {
      // 添加端口
      const newPort = {
        ...portForm,
        id: `port_${Date.now()}`,
        interfaceId: `port_${Date.now()}`
      }
      tempPorts.value.push(newPort)
      ElMessage.success('添加成功')
    }
    
    portDialogVisible.value = false
    await loadDevicePorts()
    updateGraphData()
    
    // 如果需要调用后端接口，取消下面的注释
    /*
    try {
      if (portForm.interfaceId) {
        await updateDeviceBusInterface(portForm)
        ElMessage.success('修改成功')
      } else {
        await addDeviceBusInterface(portForm)
        ElMessage.success('添加成功')
      }
      
      portDialogVisible.value = false
      await loadDevicePorts()
      updateGraphData()
    } catch (error) {
      console.error('保存端口失败:', error)
      ElMessage.error('保存端口失败')
    }
    */
  })
}

/** 关闭端口对话框 */
function handlePortDialogClose() {
  portFormRef.value?.resetFields()
}

/** 编辑设备名称 */
function handleEditDeviceName() {
  deviceNameForm.deviceName = deviceInfo.value.deviceName || '设备'
  deviceNameDialogVisible.value = true
}

/** 提交设备名称 */
async function handleDeviceNameSubmit() {
  if (!deviceNameFormRef.value) return
  
  await deviceNameFormRef.value.validate((valid) => {
    if (!valid) return
    
    // 更新设备名称
    deviceInfo.value.deviceName = deviceNameForm.deviceName
    deviceNameDialogVisible.value = false
    
    // 更新图数据
    updateGraphData()
    
    ElMessage.success('设备名称修改成功')
  })
}

/** 关闭设备名称对话框 */
function handleDeviceNameDialogClose() {
  deviceNameFormRef.value?.resetFields()
}

// 挂载时加载数据
onMounted(() => {
  loadDeviceInfo()
})

// 卸载时清理事件监听
onBeforeUnmount(() => {
  if (graphInstance.value) {
    graphInstance.value.off('port:contextmenu', handlePortContextMenu)
  }
})
</script>

<style lang="scss" scoped>
.device-detail {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .canvas-card {
    min-height: 650px;
    
    :deep(.el-card__body) {
      padding: 0;
      height: 650px;
      display: flex;
      flex-direction: column;
    }
    
    .canvas-tip {
      padding: 12px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      
      :deep(.el-alert) {
        padding: 8px 12px;
        
        .el-alert__title {
          font-size: 13px;
        }
      }
    }
    
    .canvas-wrapper {
      flex: 1;
      height: calc(100% - 50px);
      position: relative;
      
      .xflow-container {
        width: 100%;
        height: 100%;
      }
      
      :deep(.xflow-graph) {
        width: 100%;
        height: 100%;
        background: #f5f7fa;
      }
      
      :deep(.xflow-graph-container) {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>