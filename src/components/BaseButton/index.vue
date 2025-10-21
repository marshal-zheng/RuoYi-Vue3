<template>
  <el-button
    :type="type"
    :size="size"
    :plain="plain"
    :round="round"
    :circle="circle"
    :loading="loading"
    :disabled="disabled"
    :icon="icon"
    :autofocus="autofocus"
    :native-type="nativeType"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'

interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | ''
  size?: 'large' | 'default' | 'small'
  plain?: boolean
  round?: boolean
  circle?: boolean
  loading?: boolean
  disabled?: boolean
  icon?: string
  autofocus?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  type: '',
  size: 'default',
  plain: false,
  round: false,
  circle: false,
  loading: false,
  disabled: false,
  autofocus: false,
  nativeType: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>