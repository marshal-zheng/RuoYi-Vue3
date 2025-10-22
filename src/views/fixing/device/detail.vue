<template>
  <ContentWrap>
    <div class="device-detail">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h2>设备端口配置 {{ deviceInfo.deviceName }}</h2>
          <el-tag v-if="!loading" type="info" size="large">
            已配置 {{ devicePorts.length }} 个端口
          </el-tag>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="CircleCheck" @click="handleSave">保存</el-button>
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
              <span>💡 提示：双击设备查看协议列表 | 双击端口编辑 | 右键设备可添加端口 | 右键端口可编辑/删除</span>
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
              :enable-double-click-fit="false"
              @ready="onGraphReady"
              @node:click="onNodeClick"
              @node-dblclick="onNodeDblClick"
            >
              <!-- 网格 -->
              <XFlowGrid :size="14" type="mesh" :dot-size="2" color="#e6e6e6" />
            </XFlowGraph>
          </XFlow>
        </div>
      </el-card>

      <!-- 添加端口对话框 -->
      <PortEditDialog
        v-model="portDialogVisible"
        :title="portDialogTitle"
        :value="portForm"
        @submit="handlePortSubmit"
      />

      <!-- 端口配置抽屉（双击端口时打开） -->
      <PortConfigDrawer
        v-model="portDrawerVisible"
        :title="portDrawerTitle"
        :port-info="currentPortInfo"
        @submit="handlePortConfigSubmit"
      />

      <!-- 编辑设备信息对话框 -->
      <DeviceNameDialog
        v-model="deviceNameDialogVisible"
        :value="deviceNameForm"
        @submit="handleDeviceNameSubmit"
        @close="handleDeviceNameDialogClose"
      />

      <!-- 协议列表抽屉（双击设备节点时打开） -->
      <ProtocolListDrawer
        v-model="protocolListDrawerVisible"
        :title="`${deviceInfo.deviceName || '设备'} - 协议列表`"
        :device-ports="tempPorts"
        @protocol-click="handleProtocolClick"
      />
    </div>
  </ContentWrap>
</template>

<script setup name="DeviceDetail">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import ContentWrap from '@/components/ContentWrap/src/ContentWrap.vue'
import { XFlow, XFlowGraph, XFlowGrid } from '@/components/business/ZxFlow'
import { registerDagShapes, DAG_EDGE, DAG_CONNECTOR } from '@/components/business/Dag/shapes/registerDagShapes'
import { getDevice, addDevice, updateDevice } from '@/api/fixing/device'
import PortEditDialog from '@/views/fixing/components/PortEditDialog.vue'
import PortConfigDrawer from '@/views/fixing/components/PortConfigDrawer.vue'
import DeviceNameDialog from '@/views/fixing/components/DeviceNameDialog.vue'
import ProtocolListDrawer from '@/views/fixing/components/ProtocolListDrawer.vue'

// 注册自定义形状
registerDagShapes()

// 连线配置 - 禁用连线功能
const connectionOptions = {
  snap: false,
  allowBlank: false,
  allowLoop: false,
  allowNode: false,
  allowEdge: false,
  allowPort: false,
  highlight: false,
  validateConnection() {
    // 禁止所有连接
    return false
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

// 添加端口对话框
const portDialogVisible = ref(false)
const portDialogTitle = ref('添加端口')
const portForm = reactive({
  interfaceId: null,
  deviceId: null,
  interfaceName: '',
  interfaceType: 'RS422',
  position: 'right',
  description: ''
})

// 端口配置抽屉（双击端口时打开）
const portDrawerVisible = ref(false)
const portDrawerTitle = ref('端口配置')
const currentPortInfo = ref({})

// 协议列表抽屉（双击设备节点时打开）
const protocolListDrawerVisible = ref(false)

// 设备信息编辑对话框
const deviceNameDialogVisible = ref(false)
const deviceNameFormRef = ref(null)
const deviceNameForm = reactive({
  deviceName: '',
  categoryName: ''
})

const deviceNameFormRules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  categoryName: [{ required: true, message: '请选择设备分类', trigger: 'change' }]
}

// 前端临时存储的端口列表（不调用后端接口）
const tempPorts = ref([])

/**
 * 获取端口的默认参数配置（根据总线类型）
 * @param {String} interfaceType - 总线类型
 * @returns {Object} 默认参数配置（深拷贝）
 */
function getDefaultParams(interfaceType) {
  const defaultParamsMap = {
    'RS422': {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'None'
    },
    'RS485': {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'None'
    },
    'CAN': {
      baudRate: 250000,
      canMode: 'A'
    },
    'LAN': {
      ipAddress: '192.168.1.100',
      port: 8080,
      protocol: 'TCP'
    },
    '1553B': {
      busAddress: 0,
      rtAddress: 0,
      subAddress: 0
    }
  }
  
  // ⚠️ 重要：返回深拷贝，避免多个端口共享同一个对象引用
  const defaultConfig = defaultParamsMap[interfaceType]
  return defaultConfig ? cloneDeep(defaultConfig) : {}
}

/**
 * 获取端口的默认协议配置
 * @returns {Object} 默认协议配置（深拷贝）
 */
function getDefaultMessageConfig() {
  // ⚠️ 重要：每次调用都返回新对象，避免多个端口共享同一个配置
  return cloneDeep({
    header: {
      sender: '设备1',
      receiver: '',
      frequency: 'once',
      baudRate: 460,
      method: '422',
      duration: 0,
      frameLength: 1,
      errorHandling: 'ignore'
    },
    fields: []
  })
}


/** 保存设备和端口配置 */
async function handleSave() {
  try {
    loading.value = true
    
    // 构建提交数据
    const submitData = {
      // 设备基本信息
      deviceId: deviceInfo.value.deviceId || null,
      deviceName: deviceInfo.value.deviceName || '未命名设备',
      deviceType: deviceInfo.value.deviceType || '',
      manufacturer: deviceInfo.value.manufacturer || '',
      model: deviceInfo.value.model || '',
      version: deviceInfo.value.version || '',
      busType: deviceInfo.value.busType || '',
      categoryName: deviceInfo.value.categoryName || '',
      remark: deviceInfo.value.remark || '',
      
      // 端口配置列表（包含参数和协议配置）
      interfaces: tempPorts.value.map(port => ({
        interfaceId: port.interfaceId || null,
        interfaceName: port.interfaceName,
        interfaceType: port.interfaceType,
        position: port.position,
        description: port.description || '',
        // 如果没有参数配置，使用该总线类型的默认配置
        params: port.params || getDefaultParams(port.interfaceType),
        // 如果没有协议配置，使用默认的空协议配置
        messageConfig: port.messageConfig || getDefaultMessageConfig()
      }))
    }
    
    console.log('保存数据:', submitData)
    
    // 判断是新增还是编辑
    if (submitData.deviceId) {
      // 编辑设备
      await updateDevice(submitData)
      ElMessage.success('设备配置保存成功')
    } else {
      // 新增设备
      const response = await addDevice(submitData)
      ElMessage.success('设备创建成功')
      
      // 如果是新增，保存成功后跳转到编辑页面
      if (response.data || response.deviceId) {
        const newDeviceId = response.data?.deviceId || response.deviceId
        deviceInfo.value.deviceId = newDeviceId
        // 更新路由参数
        router.replace(`/fixing/device/detail/${newDeviceId}`)
      }
    }
    
  } finally {
    loading.value = false
  }
}

/** 返回列表 */
function goBack() {
  router.push('/fixing/device')
}

/** 加载设备信息 */
async function loadDeviceInfo() {
  const deviceId = route.params.id
  
  // 如果没有 deviceId，说明是新增设备，初始化空的设备信息
  if (!deviceId || deviceId === 'new') {
    // 初始化新设备的默认信息
    deviceInfo.value = {
      deviceId: null,
      deviceName: '新设备',
      deviceType: '',
      manufacturer: '',
      model: '',
      version: '',
      busType: '',
      categoryName: '',
      remark: '',
      interfaces: []
    }
    // 初始化空的端口列表
    tempPorts.value = []
    devicePorts.value = []
    // 更新图形显示
    updateGraphData()
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
  // 如果设备信息中包含 interfaces 字段，使用它
  if (deviceInfo.value.interfaces && deviceInfo.value.interfaces.length > 0) {
    // 从后端加载的完整数据（包含参数和协议配置）
    tempPorts.value = deviceInfo.value.interfaces.map(intf => ({
      id: intf.interfaceId,
      interfaceId: intf.interfaceId,
      deviceId: deviceInfo.value.deviceId,
      interfaceName: intf.interfaceName,
      interfaceType: intf.interfaceType,
      position: intf.position || 'right',
      description: intf.description || '',
      // ⚠️ 重要：深拷贝后端数据，避免引用共享
      // 如果后端返回的数据有参数配置，深拷贝；否则使用默认配置
      params: intf.params 
        ? cloneDeep(intf.params)
        : getDefaultParams(intf.interfaceType),
      // 如果后端返回的数据有协议配置，深拷贝；否则使用默认配置
      messageConfig: intf.messageConfig 
        ? cloneDeep(intf.messageConfig)
        : getDefaultMessageConfig()
    }))
  }
  
  // 使用临时端口列表作为显示数据
  devicePorts.value = tempPorts.value
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

  // 定义端口组配置（禁用连线功能）
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
          magnet: false,
          fill: '#fff',
          strokeWidth: 1,
          cursor: 'pointer',
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
          magnet: false,
          fill: '#fff',
          strokeWidth: 1,
          cursor: 'pointer',
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
          magnet: false,
          fill: '#fff',
          strokeWidth: 1,
          cursor: 'pointer',
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
          magnet: false,
          fill: '#fff',
          strokeWidth: 1,
          cursor: 'pointer',
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
        label: '编辑设备信息',
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

/** 节点双击处理 - 用于处理端口双击和设备节点双击 */
function onNodeDblClick({ node, event, type }) {
  console.log('🔥🔥🔥 节点双击事件触发 🔥🔥🔥')
  console.log('节点ID:', node?.id)
  
  // 确保是节点双击事件
  if (!node) {
    console.log('⚠️ 节点对象为空')
    return
  }
  
  // X6 的事件对象
  const e = event
  const target = e?.target || e?.currentTarget || e?.srcElement
  
  console.log('🎯 目标元素:', target?.tagName, target?.className)
  
  // 检查点击的元素是否是端口
  let portElement = null
  
  try {
    if (target && typeof target.closest === 'function') {
      portElement = target.closest('[port]')
    }
  } catch (error) {
    console.error('查找端口元素出错:', error)
  }
  
  if (portElement) {
    // 双击的是端口
    const portId = portElement.getAttribute('port')
    console.log('✅ 双击端口 ID:', portId)
    
    const portData = tempPorts.value.find(p => (p.id || p.interfaceId) === portId)
    if (portData) {
      console.log('打开端口配置抽屉')
      handleEditPort(portData)
    }
  } else {
    // 双击的是设备节点本身（不是端口）
    console.log('🎉🎉🎉 双击设备节点，立即打开协议列表 Drawer 🎉🎉🎉')
    handleShowProtocolList()
  }
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
    // 编辑端口 - 使用对话框
    handleEditPortDialog(portData)
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

/** 编辑端口 - 使用对话框（右键菜单） */
function handleEditPortDialog(port) {
  portDialogTitle.value = '编辑端口'
  portForm.interfaceId = port.interfaceId || port.id
  portForm.deviceId = port.deviceId || route.params.id
  portForm.interfaceName = port.interfaceName
  portForm.interfaceType = port.interfaceType
  portForm.position = port.position
  portForm.description = port.description
  portDialogVisible.value = true
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

/** 编辑端口 - 双击端口时打开抽屉 */
function handleEditPort(port) {
  portDrawerTitle.value = `端口配置 - ${port.interfaceName}`
  currentPortInfo.value = { ...port }
  portDrawerVisible.value = true
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

/** 提交端口表单 - 用于添加端口 */
async function handlePortSubmit(formData) {
  console.log('formData', formData)
  // 前端模式：直接操作临时列表
  if (formData.interfaceId) {
    // 编辑端口 - 保留原有的 params 和 messageConfig
    const index = tempPorts.value.findIndex(p => (p.id || p.interfaceId) === formData.interfaceId)
    if (index > -1) {
      // ⚠️ 重要：深拷贝，避免引用共享
      const oldPort = tempPorts.value[index]
      tempPorts.value[index] = {
        ...formData,
        params: oldPort.params,
        messageConfig: oldPort.messageConfig
      }
      ElMessage.success('修改成功')
    }
  } else {
    // 添加端口 - 自动添加默认参数配置
    const newPort = {
      ...formData,
      id: `port_${Date.now()}`,
      interfaceId: `port_${Date.now()}`,
      // 为新端口设置默认参数配置（深拷贝）
      params: getDefaultParams(formData.interfaceType),
      // 为新端口设置默认协议配置（深拷贝）
      messageConfig: getDefaultMessageConfig()
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
    if (formData.interfaceId) {
      await updateDeviceBusInterface(formData)
      ElMessage.success('修改成功')
    } else {
      await addDeviceBusInterface(formData)
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
}

/** 提交端口配置 - 用于参数和协议配置 */
async function handlePortConfigSubmit(portData) {
  console.log('保存端口配置:', portData)
  
  // 更新临时列表中的端口配置（包括参数和协议）
  const index = tempPorts.value.findIndex(p => (p.id || p.interfaceId) === (portData.interfaceId || portData.id))
  if (index > -1) {
    // ⚠️ 重要：深拷贝配置数据，避免引用共享
    tempPorts.value[index] = {
      ...tempPorts.value[index],
      // 深拷贝参数配置
      params: portData.params 
        ? cloneDeep(portData.params) 
        : tempPorts.value[index].params,
      // 深拷贝协议配置
      messageConfig: portData.messageConfig 
        ? cloneDeep(portData.messageConfig) 
        : tempPorts.value[index].messageConfig
    }
    console.log('端口配置已更新:', tempPorts.value[index])
  }
  
  // 更新图数据（虽然参数和协议不影响显示，但保持数据同步）
  await loadDevicePorts()
  updateGraphData()
}

/** 编辑设备信息 */
function handleEditDeviceName() {
  deviceNameForm.deviceName = deviceInfo.value.deviceName || '设备'
  deviceNameForm.categoryName = deviceInfo.value.categoryName || ''
  deviceNameDialogVisible.value = true
}

/** 提交设备信息 */
async function handleDeviceNameSubmit(formData) {
  // 更新设备信息
  deviceInfo.value.deviceName = formData.deviceName
  deviceInfo.value.categoryName = formData.categoryName
  deviceNameDialogVisible.value = false
  
  // 更新图数据
  updateGraphData()
  
  ElMessage.success('设备信息修改成功')
}

/** 关闭设备名称对话框 */
function handleDeviceNameDialogClose() {
  deviceNameFormRef.value?.resetFields()
}

/** 显示协议列表 */
function handleShowProtocolList() {
  console.log('=== 打开协议列表 Drawer ===')
  console.log('当前 protocolListDrawerVisible 值:', protocolListDrawerVisible.value)
  console.log('端口数据:', tempPorts.value)
  protocolListDrawerVisible.value = true
  console.log('设置后 protocolListDrawerVisible 值:', protocolListDrawerVisible.value)
}

/** 点击协议 */
function handleProtocolClick({ port, message }) {
  console.log('点击协议:', { port, message })
  // 关闭协议列表抽屉
  protocolListDrawerVisible.value = false
  // 打开端口配置抽屉，定位到该协议
  portDrawerTitle.value = `端口配置 - ${port.interfaceName}`
  currentPortInfo.value = { ...port }
  portDrawerVisible.value = true
  // TODO: 可以添加滚动定位到具体协议的逻辑
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
      // gap: 12px;
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