<template>
  <zx-select
    v-model="selectedValue"
    :options="statusOptions"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :style="{ width: width }"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  width?: string
  dictData?: Array<{ label: string; value: string | number }>
}

interface Emits {
  (e: 'update:modelValue', value: string | number | undefined): void
  (e: 'change', value: string | number | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择状态',
  clearable: true,
  disabled: false,
  width: '240px',
  dictData: () => []
})

const emit = defineEmits<Emits>()

// 计算属性：双向绑定的值
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 计算属性：状态选项
const statusOptions = computed(() => {
  return props.dictData.map(item => ({
    label: item.label,
    value: item.value
  }))
})

// 处理值变化
const handleChange = (value: string | number | undefined) => {
  emit('change', value)
}
</script>