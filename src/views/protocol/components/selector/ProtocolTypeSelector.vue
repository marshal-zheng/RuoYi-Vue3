<template>
  <zx-select
    v-model="selectedValue"
    :options="protocolTypeOptions"
    placeholder="请选择协议类型"
    clearable
    v-bind="$attrs"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<Emits>()

// 协议类型选项
const protocolTypeOptions = [
  { label: '以太网', value: '以太网' },
  { label: 'RS422', value: 'RS422' },
  { label: 'CAN', value: 'CAN' },
  { label: '1553B', value: '1553B' }
]

const selectedValue = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue
})

// 处理选择变化
const handleChange = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>