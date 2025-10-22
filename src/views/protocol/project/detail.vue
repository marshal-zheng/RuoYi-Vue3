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
import ContentWrap from "@/components/ContentWrap/src/ContentWrap.vue"
import XflowDAG from "@/components/business/Dag/index.vue"

const version = ref('3.9.0')

// DAG 组件配置 - 飞控设备库（带分类）
const operators = ref([
  // 核心控制类
  { name: '飞控主板', value: 'Pixhawk/APM等飞行控制器核心模块', category: '核心控制' },
  { name: 'IMU惯导', value: '陀螺仪+加速度计，姿态感知单元', category: '核心控制' },
  { name: '电调ESC', value: '电子调速器，控制电机转速', category: '核心控制' },
  
  // 定位导航类
  { name: 'GPS模块', value: '卫星定位系统，提供精准位置信息', category: '定位导航' },
  { name: '磁罗盘', value: '电子罗盘，提供方向信息', category: '定位导航' },
  { name: '气压计', value: '高度测量传感器，辅助定高', category: '定位导航' },
  
  // 遥控通信类
  { name: '遥控接收器', value: '接收遥控器信号，实现远程控制', category: '遥控通信' },
  { name: '图传模块', value: '实时视频传输系统', category: '遥控通信' },
  
  // 传感执行类
  { name: '云台相机', value: '稳定拍摄系统，支持增稳与跟踪', category: '传感执行' },
  { name: '超声波测距', value: '近地高度精确测量', category: '传感执行' },
  { name: '激光雷达', value: '障碍物检测与避障系统', category: '传感执行' },
  
  // 供电管理类
  { name: '电源模块', value: '电源管理与分配系统', category: '供电管理' }
])

const loading = ref(false)
const layoutMode = ref('horizontal') // 'vertical' | 'horizontal'

// 可配置的文案和设置
const dndConfig = {
  title: '设备库',
  searchPlaceholder: '搜索设备...',
  textConfig: {
    loadingText: '正在加载飞控设备...',
    emptySearchText: '没有找到匹配的飞控设备',
    emptySearchDesc: '请尝试使用其他关键词搜索',
    emptyDataText: '暂无可用飞控设备',
    emptyDataDesc: '请添加飞控设备数据'
  }
}

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}
</style>