<template>
<ContentWrap class="home">
  <XflowDAG
    :operators="operators"
    :operators-loading="loading"
    :layout="layoutMode"
    :dnd-config="dndConfig"
  />
  </ContentWrap>
</template>

<script setup name="Index">
import { ref, onMounted } from 'vue'
import ContentWrap from "@/components/ContentWrap/src/ContentWrap.vue"
import XflowDAG from "@/components/business/Dag/index.vue"
import { listDevice, listDeviceBusInterface } from '@/api/protocol/device'
import { ElMessage } from 'element-plus'

const version = ref('3.9.0')

// DAG 组件配置 - 设备列表（从后端获取）
const operators = ref([])
const loading = ref(false)
const layoutMode = ref('horizontal') // 'vertical' | 'horizontal'

// 可配置的文案和设置
const dndConfig = {
  title: '设备库',
  searchPlaceholder: '搜索设备...',
  textConfig: {
    loadingText: '正在加载设备库...',
    emptySearchText: '没有找到匹配的设备',
    emptySearchDesc: '请尝试使用其他关键词搜索',
    emptyDataText: '暂无可用设备',
    emptyDataDesc: '请先添加设备数据'
  }
}

/**
 * 根据总线类型获取端口颜色
 * @param {String} busType - 总线类型
 * @returns {String} 颜色值
 */
function getBusTypeColor(busType) {
  const colorMap = {
    'RS422': '#f59e0b',  // 琥珀色 - 串口通信
    'RS485': '#f97316',  // 橙色 - 工业串口
    'CAN': '#3b82f6',    // 蓝色 - CAN总线
    'LAN': '#10b981',    // 绿色 - 以太网
    '1553B': '#8b5cf6'   // 紫色 - 军用总线
  }
  return colorMap[busType] || '#6b7280'  // 默认灰色
}

/**
 * 获取设备的端口信息（Mock数据）
 * @param {Number} deviceId - 设备ID
 * @returns {Promise<Array>} 端口列表
 */
async function getDevicePorts(deviceId) {
  // Mock数据：根据设备ID返回不同的端口配置
  // 只使用五种端口类型：RS422、RS485、CAN、LAN、1553B
  const mockPortsMap = {
    1: [ // 飞控主板
      { interfaceId: 1, interfaceName: 'RS422', interfaceType: '输出', busType: 'RS422', remark: 'RS422串口1' },
      { interfaceId: 2, interfaceName: 'RS422', interfaceType: '输入', busType: 'RS422', remark: 'RS422串口2' },
      { interfaceId: 3, interfaceName: 'CAN', interfaceType: 'bidirectional', busType: 'CAN', remark: 'CAN总线1' },
      { interfaceId: 4, interfaceName: '1553B', interfaceType: 'bidirectional', busType: '1553B', remark: '1553B总线' }
    ],
    2: [ // IMU惯导
      { interfaceId: 5, interfaceName: 'RS422', interfaceType: '输出', busType: 'RS422', remark: 'RS422数据输出' },
      { interfaceId: 6, interfaceName: 'CAN', interfaceType: 'bidirectional', busType: 'CAN', remark: 'CAN总线接口' }
    ],
    3: [ // 电调ESC
      { interfaceId: 7, interfaceName: 'CAN', interfaceType: '输入', busType: 'CAN', remark: 'CAN控制输入' },
      { interfaceId: 8, interfaceName: 'RS485', interfaceType: 'bidirectional', busType: 'RS485', remark: 'RS485通信' }
    ],
    4: [ // GPS模块
      { interfaceId: 9, interfaceName: 'RS422-TX', interfaceType: '输出', busType: 'RS422', remark: 'RS422发送' },
      { interfaceId: 10, interfaceName: 'RS422-RX', interfaceType: '输入', busType: 'RS422', remark: 'RS422接收' },
      { interfaceId: 11, interfaceName: 'RS485', interfaceType: 'bidirectional', busType: 'RS485', remark: 'RS485通信' }
    ],
    5: [ // 磁罗盘
      { interfaceId: 12, interfaceName: 'RS485', interfaceType: 'bidirectional', busType: 'RS485', remark: 'RS485接口' },
      { interfaceId: 13, interfaceName: 'CAN', interfaceType: 'bidirectional', busType: 'CAN', remark: 'CAN接口' }
    ],
    6: [ // 气压计
      { interfaceId: 14, interfaceName: 'RS485', interfaceType: 'bidirectional', busType: 'RS485', remark: 'RS485接口' },
      { interfaceId: 15, interfaceName: 'CAN', interfaceType: 'bidirectional', busType: 'CAN', remark: 'CAN接口' }
    ],
    7: [ // 遥控接收器
      { interfaceId: 16, interfaceName: 'RS422', interfaceType: '输出', busType: 'RS422', remark: 'RS422信号输出' },
      { interfaceId: 17, interfaceName: '1553B', interfaceType: 'bidirectional', busType: '1553B', remark: '1553B总线' }
    ],
    8: [ // 图传模块
      { interfaceId: 18, interfaceName: 'LAN1', interfaceType: 'bidirectional', busType: 'LAN', remark: 'LAN网口1' },
      { interfaceId: 19, interfaceName: 'LAN2', interfaceType: 'bidirectional', busType: 'LAN', remark: 'LAN网口2' },
      { interfaceId: 20, interfaceName: '1553B', interfaceType: 'bidirectional', busType: '1553B', remark: '1553B总线' }
    ]
  }
  
  const mockPorts = mockPortsMap[deviceId] || []
  
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 将接口数据转换为端口格式
  return mockPorts.map((intf, index) => {
    // 根据接口类型确定端口类型
    let interfaceType = 'bidirectional' // 默认双向
    if (intf.interfaceType === '输入' || intf.interfaceType === 'input') {
      interfaceType = 'input'
    } else if (intf.interfaceType === '输出' || intf.interfaceType === 'output') {
      interfaceType = 'output'
    }
    
    // 根据索引分配到不同的组（位置）
    // 只分配到左右两侧
    const groups = ['left', 'right']
    const group = groups[index % 2]
    
    return {
      id: `port-${intf.interfaceId || index}`,
      interfaceId: intf.interfaceId,
      interfaceName: intf.interfaceName || `端口${index + 1}`,
      interfaceType: interfaceType,
      group: group,
      description: intf.remark || '',
      busType: intf.busType || 'RS422',  // 总线类型
      color: getBusTypeColor(intf.busType || 'RS422'),  // 根据总线类型计算颜色
      dataRate: intf.dataRate || '',
      protocolType: intf.protocolType || ''
    }
  })
}

/**
 * 从后端加载设备列表数据（Mock版本）
 */
async function loadDeviceList() {
  loading.value = true
  try {
    // Mock设备列表数据
    const mockDevices = [
      // 核心控制类
      {
        deviceId: 1,
        deviceName: '飞控主板',
        deviceType: '核心控制器',
        busType: 'Multi',
        manufacturer: 'Pixhawk',
        model: 'PX4',
        version: 'v1.0',
        remark: 'Pixhawk/APM等飞行控制器核心模块',
        categoryName: '核心控制'
      },
      {
        deviceId: 2,
        deviceName: 'IMU惯导',
        deviceType: '传感器',
        busType: 'SPI',
        manufacturer: 'InvenSense',
        model: 'MPU6000',
        version: 'v2.0',
        remark: '陀螺仪+加速度计，姿态感知单元',
        categoryName: '核心控制'
      },
      {
        deviceId: 3,
        deviceName: '电调ESC',
        deviceType: '执行器',
        busType: 'PWM',
        manufacturer: 'Generic',
        model: 'BLHeli_32',
        version: 'v1.5',
        remark: '电子调速器，控制电机转速',
        categoryName: '核心控制'
      },
      
      // 定位导航类
      {
        deviceId: 4,
        deviceName: 'GPS模块',
        deviceType: '定位设备',
        busType: 'UART',
        manufacturer: 'u-blox',
        model: 'M8N',
        version: 'v3.0',
        remark: '卫星定位系统，提供精准位置信息',
        categoryName: '定位导航'
      },
      {
        deviceId: 5,
        deviceName: '磁罗盘',
        deviceType: '传感器',
        busType: 'I2C',
        manufacturer: 'Honeywell',
        model: 'HMC5883L',
        version: 'v1.0',
        remark: '电子罗盘，提供方向信息',
        categoryName: '定位导航'
      },
      {
        deviceId: 6,
        deviceName: '气压计',
        deviceType: '传感器',
        busType: 'I2C',
        manufacturer: 'Bosch',
        model: 'BMP280',
        version: 'v2.0',
        remark: '高度测量传感器，辅助定高',
        categoryName: '定位导航'
      },
      
      // 遥控通信类
      {
        deviceId: 7,
        deviceName: '遥控接收器',
        deviceType: '通信设备',
        busType: 'PPM/SBUS',
        manufacturer: 'FrSky',
        model: 'X8R',
        version: 'v1.0',
        remark: '接收遥控器信号，实现远程控制',
        categoryName: '遥控通信'
      },
      {
        deviceId: 8,
        deviceName: '图传模块',
        deviceType: '通信设备',
        busType: 'CVBS/HDMI',
        manufacturer: 'DJI',
        model: 'Air Unit',
        version: 'v2.0',
        remark: '实时视频传输系统',
        categoryName: '遥控通信'
      }
    ]
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 并发获取所有设备的端口信息
    const devicesWithPorts = await Promise.all(
      mockDevices.map(async (device) => {
        const ports = await getDevicePorts(device.deviceId)
        
        return {
          // DAG组件需要的字段
          name: device.deviceName,
          value: device.remark || device.description || '设备',
          category: device.categoryName || '未分类',
          
          // 设备原始数据（用于节点创建时使用）
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          busType: device.busType,
          manufacturer: device.manufacturer,
          model: device.model,
          version: device.version,
          
          // 端口信息（用于连接桩）
          ports: ports,
          
          // 节点类型标识
          nodeType: 'device-port-node'
        }
      })
    )
    
    operators.value = devicesWithPorts
    
    console.log('设备列表加载成功 (Mock数据):', {
      total: devicesWithPorts.length,
      devices: devicesWithPorts
    })
    
    ElMessage.success(`加载了 ${devicesWithPorts.length} 个设备 (Mock数据)`)
    
  } catch (error) {
    console.error('加载设备列表失败:', error)
    ElMessage.error('加载设备列表失败，请稍后重试')
    operators.value = []
  } finally {
    loading.value = false
  }
}

// 页面加载时获取设备列表
onMounted(() => {
  loadDeviceList()
})

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style lang="scss">
.home {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  &.v-content-wrap .el-card__body {
    height: 100%;
  }
}
</style>
