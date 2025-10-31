<!-- eslint-disable vue/one-component-per-file -->
<template>
  <div class="tabs-demo">
    <h3>配置式组件用法</h3>
    <p style="margin-bottom: 16px; color: var(--el-text-color-secondary)">
      使用 component + props + on 传递 Vue 组件作为内容
    </p>
    <zx-tabs v-model="activeTab" :items="items" :lazy="true" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { ZxTabs } from '@zxio/zxui'
import { ElButton, ElInput, ElMessage } from 'element-plus'

// 示例组件：用户表单
const UserForm = defineComponent({
  name: 'UserForm',
  props: {
    initialName: String,
    readOnly: Boolean,
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const name = ref(props.initialName || '')
    const handleSubmit = () => {
      emit('submit', name.value)
    }
    return () =>
      h('div', { style: 'padding: 16px;' }, [
        h('div', { style: 'margin-bottom: 12px;' }, [
          h(
            'label',
            { style: 'display: block; margin-bottom: 8px;' },
            '姓名：'
          ),
          h(ElInput, {
            modelValue: name.value,
            'onUpdate:modelValue': (v: string) => (name.value = v),
            placeholder: '请输入姓名',
            disabled: props.readOnly,
          }),
        ]),
        h(
          ElButton,
          {
            type: 'primary',
            onClick: handleSubmit,
            disabled: props.readOnly,
          },
          () => '提交'
        ),
      ])
  },
})

// 示例组件：统计面板
const StatsPanel = defineComponent({
  name: 'StatsPanel',
  props: {
    count: Number,
  },
  setup(props) {
    return () =>
      h(
        'div',
        { style: 'padding: 16px; text-align: center;' },
        h(
          'div',
          {
            style:
              'font-size: 48px; font-weight: bold; color: var(--el-color-primary);',
          },
          String(props.count || 0)
        )
      )
  },
})

const activeTab = ref('form')

const items = ref([
  {
    key: 'form',
    label: '用户表单',
    component: UserForm,
    props: {
      initialName: 'Zhang San',
      readOnly: false,
    },
    on: {
      submit(name: string) {
        ElMessage.success(`表单提交: ${name}`)
      },
    },
  },
  {
    key: 'stats',
    label: '统计面板',
    component: StatsPanel,
    props: {
      count: 1024,
    },
  },
  {
    key: 'readonly',
    label: '只读表单',
    component: UserForm,
    props: {
      initialName: 'Li Si',
      readOnly: true,
    },
  },
])
</script>

<style scoped>
.tabs-demo {
  padding: 20px;
}

h3 {
  color: var(--el-text-color-primary);
  font-size: 18px;
  margin-bottom: 8px;
}
</style>
