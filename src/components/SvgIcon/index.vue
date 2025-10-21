<template>
  <!-- 如果是 Element Plus 图标，使用 el-icon 包装 -->
  <el-icon v-if="isElementIcon" :class="svgClass" :style="iconStyle" :size="size">
    <component :is="elementIconComponent" />
  </el-icon>
  <!-- 否则使用原来的 SVG sprite 方式 -->
  <svg v-else :class="svgClass" :style="iconStyle" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<script>
import * as ElementPlusIcons from '@element-plus/icons-vue'

export default defineComponent({
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    },
    size: {
      type: [String, Number],
      default: '1em'
    },
  },
  setup(props) {
    // 检查是否是 Element Plus 图标
    const isElementIcon = computed(() => {
      return ElementPlusIcons[props.iconClass] !== undefined
    })

    // 获取 Element Plus 图标组件
    const elementIconComponent = computed(() => {
      return ElementPlusIcons[props.iconClass]
    })

    // 图标样式
    const iconStyle = computed(() => {
      const style = {}
      if (props.color) {
        style.color = props.color
      }
      // 始终应用 size 样式（包括默认值）
      const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
      style.width = sizeValue
      style.height = sizeValue
      style.fontSize = sizeValue
      return style
    })

    return {
      iconName: computed(() => `#icon-${props.iconClass}`),
      svgClass: computed(() => {
        if (props.className) {
          return `svg-icon ${props.className}`
        }
        return 'svg-icon'
      }),
      isElementIcon,
      elementIconComponent,
      iconStyle
    }
  }
})
</script>

<style scope lang="scss">
.sub-el-icon,
.nav-icon {
  display: inline-block;
  font-size: 15px;
  margin-right: 12px;
  position: relative;
}

.svg-icon {
  width: 1em;
  height: 1em;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
  display: inline-block;
  
  // 当有自定义尺寸时，使用自定义尺寸
  &[style*="width"] {
    width: var(--svg-icon-width, 1em);
    height: var(--svg-icon-height, 1em);
  }
}

// Element Plus 图标的样式调整
.el-icon.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: -2px;
}
</style>
