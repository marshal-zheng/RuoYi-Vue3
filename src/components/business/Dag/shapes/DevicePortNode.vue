<template>
  <div class="device-port-node">
    <svg width="100%" height="100%" :viewBox="`-35 -10 190 ${viewBoxHeight}`" preserveAspectRatio="xMidYMid meet">
      <defs>
        <!-- CPU 连接点渐变 -->
        <linearGradient id="cpu-connection-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4F4F4F" />
          <stop offset="60%" stop-color="#121214" />
        </linearGradient>
        
        <linearGradient id="port-input-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#67c23a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#85ce61;stop-opacity:1" />
        </linearGradient>
        
        <linearGradient id="port-output-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#e6a23c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f0c78a;stop-opacity:1" />
        </linearGradient>
        
        <linearGradient id="port-bidirectional-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#409eff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#79bbff;stop-opacity:1" />
        </linearGradient>
        
        <!-- 阴影滤镜 -->
        <filter id="device-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <filter id="port-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- 设备主体 - 参考 CPU 样式（竖向） -->
      <g class="device-body">
        <!-- 主设备矩形 - 黑色背景（竖向、自适应高度） -->
        <rect
          x="25"
          :y="deviceRectY"
          width="70"
          :height="deviceRectHeight"
          rx="5"
          fill="#181818"
          filter="url(#device-shadow)"
        />
        
        <!-- 设备名称文本 - 白色（竖向排列） -->
        <text
          x="60"
          :y="deviceCenterY"
          text-anchor="middle"
          fill="white"
          font-size="14"
          font-weight="600"
          letter-spacing="0.5em"
          writing-mode="tb"
          glyph-orientation-vertical="0"
        >
          {{ label }}
        </text>
      </g>
      
      <!-- 端口绘制 - 顶部 -->
      <g v-if="topPorts.length > 0" class="ports-group ports-top">
        <g
          v-for="(port, index) in topPorts"
          :key="port.id"
          :transform="`translate(${getTopPortX(index, topPorts.length)}, ${topPortY})`"
          class="port-item"
          :data-port-id="port.id"
          @click.stop="handlePortClick(port)"
          @contextmenu.prevent="handlePortContextMenu(port, $event)"
        >
          <!-- 端口背景 -->
          <rect
            x="-12"
            y="0"
            width="24"
            height="12"
            rx="2"
            :fill="isPortSelected(port.id) ? 'rgba(64, 158, 255, 0.2)' : 'rgba(255,255,255,0.9)'"
            :stroke="getPortStrokeColor(port)"
            :stroke-width="isPortSelected(port.id) ? '2' : '1'"
            :filter="isPortSelected(port.id) ? 'url(#port-glow)' : ''"
            class="port-bg"
          />
          <!-- 端口名称 -->
          <text
            x="0"
            y="6"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="7"
            fill="#606266"
            font-weight="500"
          >
            {{ truncateText(port.interfaceName, 6) }}
          </text>
        </g>
      </g>

      <!-- 端口绘制 - 右侧 -->
      <g v-if="rightPorts.length > 0" class="ports-group ports-right">
        <g
          v-for="(port, index) in rightPorts"
          :key="port.id"
          :transform="`translate(95, ${getRightPortY(index, rightPorts.length)})`"
          class="port-item"
          :data-port-id="port.id"
          @click.stop="handlePortClick(port)"
          @contextmenu.prevent="handlePortContextMenu(port, $event)"
        >
          <!-- 端口背景 -->
          <rect
            x="0"
            y="-6"
            width="32"
            height="12"
            rx="2"
            :fill="isPortSelected(port.id) ? 'rgba(64, 158, 255, 0.2)' : 'rgba(255,255,255,0.9)'"
            :stroke="getPortStrokeColor(port)"
            :stroke-width="isPortSelected(port.id) ? '2' : '1'"
            :filter="isPortSelected(port.id) ? 'url(#port-glow)' : ''"
            class="port-bg"
          />
          <!-- 端口名称 -->
          <text
            x="16"
            y="0"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="7"
            fill="#606266"
            font-weight="500"
          >
            {{ truncateText(port.interfaceName, 7) }}
          </text>
        </g>
      </g>

      <!-- 端口绘制 - 底部 -->
      <g v-if="bottomPorts.length > 0" class="ports-group ports-bottom">
        <g
          v-for="(port, index) in bottomPorts"
          :key="port.id"
          :transform="`translate(${getBottomPortX(index, bottomPorts.length)}, ${bottomPortY})`"
          class="port-item"
          :data-port-id="port.id"
          @click.stop="handlePortClick(port)"
          @contextmenu.prevent="handlePortContextMenu(port, $event)"
        >
          <!-- 端口背景 -->
          <rect
            x="-12"
            y="0"
            width="24"
            height="12"
            rx="2"
            :fill="isPortSelected(port.id) ? 'rgba(64, 158, 255, 0.2)' : 'rgba(255,255,255,0.9)'"
            :stroke="getPortStrokeColor(port)"
            :stroke-width="isPortSelected(port.id) ? '2' : '1'"
            :filter="isPortSelected(port.id) ? 'url(#port-glow)' : ''"
            class="port-bg"
          />
          <!-- 端口名称 -->
          <text
            x="0"
            y="6"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="7"
            fill="#606266"
            font-weight="500"
          >
            {{ truncateText(port.interfaceName, 6) }}
          </text>
        </g>
      </g>

      <!-- 端口绘制 - 左侧 -->
      <g v-if="leftPorts.length > 0" class="ports-group ports-left">
        <g
          v-for="(port, index) in leftPorts"
          :key="port.id"
          :transform="`translate(25, ${getLeftPortY(index, leftPorts.length)})`"
          class="port-item"
          :data-port-id="port.id"
          @click.stop="handlePortClick(port)"
          @contextmenu.prevent="handlePortContextMenu(port, $event)"
        >
          <!-- 端口背景 -->
          <rect
            x="-32"
            y="-6"
            width="32"
            height="12"
            rx="2"
            :fill="isPortSelected(port.id) ? 'rgba(64, 158, 255, 0.2)' : 'rgba(255,255,255,0.9)'"
            :stroke="getPortStrokeColor(port)"
            :stroke-width="isPortSelected(port.id) ? '2' : '1'"
            :filter="isPortSelected(port.id) ? 'url(#port-glow)' : ''"
            class="port-bg"
          />
          <!-- 端口名称 -->
          <text
            x="-16"
            y="0"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="7"
            fill="#606266"
            font-weight="500"
          >
            {{ truncateText(port.interfaceName, 7) }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  graph: {
    type: Object,
    default: null
  }
})

const dataVersion = ref(0)

const nodeData = computed(() => {
  dataVersion.value // 强制响应式依赖
  return props.node?.getData?.() || {}
})

const label = computed(() => nodeData.value.label || '设备')
const busType = computed(() => nodeData.value.busType || '')
const ports = computed(() => nodeData.value.ports || [])
const selectedPortId = computed(() => nodeData.value.selectedPortId || null)

const DEVICE_NODE_WIDTH = 190
const BASE_DEVICE_HEIGHT = 80
const TEXT_FONT_SIZE = 14
const LETTER_SPACING_EM = 0.5
const TEXT_LINE_HEIGHT = TEXT_FONT_SIZE + TEXT_FONT_SIZE * LETTER_SPACING_EM
const CONTENT_VERTICAL_PADDING = 24
const VIEWBOX_VERTICAL_PADDING = 40
const DEVICE_RECT_Y_OFFSET = 5
const TOP_PORT_GAP = 14
const BOTTOM_PORT_GAP = 10

const labelLength = computed(() => Math.max(label.value.length, 1))

// 根据设备名称长度计算设备高度
const deviceHeight = computed(() => {
  const textHeight = labelLength.value * TEXT_LINE_HEIGHT
  return Math.max(BASE_DEVICE_HEIGHT, textHeight + CONTENT_VERTICAL_PADDING)
})

// SVG viewBox 高度（设备高度 + 上下边距）
const viewBoxHeight = computed(() => deviceHeight.value + VIEWBOX_VERTICAL_PADDING)

// 设备矩形的 Y 坐标和高度
const deviceRectY = computed(() => DEVICE_RECT_Y_OFFSET)
const deviceRectHeight = computed(() => deviceHeight.value)

// 设备中心 Y 坐标（用于文字定位）
const deviceCenterY = computed(() => deviceRectY.value + deviceRectHeight.value / 2)

// 顶部长连端口的 Y 坐标
const topPortY = computed(() => deviceRectY.value - TOP_PORT_GAP)

// 底部端口的 Y 坐标
const bottomPortY = computed(() => deviceRectY.value + deviceRectHeight.value + BOTTOM_PORT_GAP)

// 按位置分组端口
const topPorts = computed(() => ports.value.filter(p => p.group === 'top'))
const rightPorts = computed(() => ports.value.filter(p => p.group === 'right'))
const bottomPorts = computed(() => ports.value.filter(p => p.group === 'bottom'))
const leftPorts = computed(() => ports.value.filter(p => p.group === 'left'))

// 判断端口是否选中
function isPortSelected(portId) {
  return selectedPortId.value === portId
}

// 端口位置计算函数（竖向设备，自适应）
function getTopPortX(index, total) {
  const spacing = 25
  const startX = 60 - ((total - 1) * spacing) / 2
  return startX + index * spacing
}

function getRightPortY(index, total) {
  const spacing = 20
  const centerY = deviceCenterY.value
  const startY = centerY - ((total - 1) * spacing) / 2
  return startY + index * spacing
}

function getBottomPortX(index, total) {
  const spacing = 25
  const startX = 60 - ((total - 1) * spacing) / 2
  return startX + index * spacing
}

function getLeftPortY(index, total) {
  const spacing = 20
  const centerY = deviceCenterY.value
  const startY = centerY - ((total - 1) * spacing) / 2
  return startY + index * spacing
}

// 根据视图高度同步 X6 节点尺寸，确保点击与选中区域一致
const syncNodeSize = () => {
  if (!props.node || typeof props.node.getSize !== 'function' || typeof props.node.resize !== 'function') {
    return
  }
  const currentSize = props.node.getSize()
  const targetWidth = DEVICE_NODE_WIDTH
  const targetHeight = Math.max(viewBoxHeight.value, BASE_DEVICE_HEIGHT + VIEWBOX_VERTICAL_PADDING)
  if (!currentSize || currentSize.width !== targetWidth || currentSize.height !== targetHeight) {
    props.node.resize(targetWidth, targetHeight)
  }
}

watch(
  [() => props.node, () => viewBoxHeight.value],
  () => {
    syncNodeSize()
  },
  { immediate: true }
)

onMounted(() => {
  syncNodeSize()
})

// 获取端口颜色
function getPortColor(port) {
  const colorMap = {
    input: '#67c23a',
    output: '#e6a23c',
    bidirectional: '#409eff'
  }
  return colorMap[port.interfaceType] || '#909399'
}

// 获取端口边框颜色
function getPortStrokeColor(port) {
  if (isPortSelected(port.id)) {
    return '#409eff'
  }
  const colorMap = {
    input: '#85ce61',
    output: '#f0c78a',
    bidirectional: '#79bbff'
  }
  return colorMap[port.interfaceType] || '#d9d9d9'
}

// 文本截断
function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 2) + '..'
}

// 获取端口提示信息
function getPortTooltip(port) {
  const typeMap = {
    input: '输入端口',
    output: '输出端口',
    bidirectional: '双向端口'
  }
  const typeText = typeMap[port.interfaceType] || '未知类型'
  return `${port.interfaceName} (${typeText})\n${port.description || '无描述'}`
}

// 端口点击处理（由父组件处理）
function handlePortClick(port) {
  // 这个事件会冒泡到节点的点击事件
  console.log('Port clicked:', port)
}

// 端口右键菜单
function handlePortContextMenu(port, event) {
  // 触发自定义事件，由 detail.vue 处理
  if (props.node && props.node.model && props.node.model.graph) {
    props.node.model.graph.trigger('port:contextmenu', {
      port,
      node: props.node,
      e: event
    })
  }
}

// 监听节点数据变化
watch(
  () => props.node?.getData?.(),
  () => {
    dataVersion.value++
  },
  { deep: true }
)

// 监听X6节点的数据变化事件
if (props.node) {
  props.node.on('change:data', () => {
    dataVersion.value++
  })
}
</script>

<style lang="scss" scoped>
.device-port-node {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;

  svg {
    overflow: visible;
  }

  // 端口交互样式
  :deep(.port-item) {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover .port-bg {
      filter: url(#port-glow);
      stroke-width: 2;
    }

    .port-bg {
      transition: all 0.2s ease;
    }

    text {
      pointer-events: none;
      user-select: none;
    }
  }
}

// foreignObject 容器样式
:global(.dag-page foreignObject > body) {
  margin: 0;
  min-height: 100%;
  display: block;
  overflow: visible;
}

// 覆盖 X6 选择框样式
:global(.x6-widget-selection-box) {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

// 隐藏 X6 的连接桩圆圈
:global(.x6-port) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

:global(.x6-port-body) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}
</style>
