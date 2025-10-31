<template>
  <ZxDrawer
    v-bind="drawer.drawerProps.value"
    :title="isEdit ? '编辑协议' : '新增协议'"
    :loading="drawerLoading"
    loadingType="skeleton"
    v-on="drawer.drawerEvents.value"
  >
    <div class="protocol-form-container">
      <!-- 基本信息表单 -->
      <el-form
        ref="formRef"
        :model="drawer.state.data"
        :rules="formRules"
        label-position="top"
        class="mb-6"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="协议名称" prop="protocolName">
              <el-input
                v-model="drawer.state.data.protocolName"
                placeholder="请输入协议名称"
                maxlength="50"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="协议类型" prop="protocolType">
              <ProtocolTypeSelector
                v-model="drawer.state.data.protocolType"
                placeholder="请选择协议类型"
                style="width: 100%"
                @change="handleProtocolTypeChange"
              />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item label="版本号" prop="version">
              <el-input
                v-model="drawer.state.data.version"
                placeholder="请输入版本号"
                clearable
              />
            </el-form-item>
          </el-col> -->
        </el-row>
        
        <el-form-item label="备注" prop="description">
          <el-input
            v-model="drawer.state.data.description"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <!-- 协议模板区域 -->
      <div v-if="drawer.state.data.protocolType" class="protocol-template-section">
        <el-divider content-position="left">
          <span class="template-title">协议格式配置</span>
        </el-divider>
        
        <!-- 根据协议类型显示对应模板 -->
        <component
          :is="currentTemplateComponent"
          v-if="currentTemplateComponent"
          v-model="drawer.state.data.protocolConfig"
          :protocol-type="drawer.state.data.protocolType"
        />
      </div>
    </div>
  </ZxDrawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { useDrawer } from '@zxio/zxui'
import ProtocolTypeSelector from './selector/ProtocolTypeSelector.vue'
import EthernetProtocolTemplate from './templates/EthernetProtocolTemplate.vue'
import RS422ProtocolTemplate from './templates/RS422ProtocolTemplate.vue'
import CANProtocolTemplate from './templates/CANProtocolTemplate.vue'
import Protocol1553BTemplate from './templates/Protocol1553BTemplate.vue'

// 定义协议表单数据接口
interface ProtocolFormData {
  protocolId?: string | number
  protocolName: string
  protocolType: string
  version: string
  description: string
  status?: string
  protocolConfig?: any // 协议配置数据
}

// 定义事件
const emit = defineEmits<{
  success: [data?: any]
}>()

// 表单引用
const formRef = ref<FormInstance | null>(null)

// Drawer loading 状态
const drawerLoading = ref(false)

// 是否编辑模式
const isEdit = computed(() => !!drawer.state.data.protocolId)

// 表单验证规则
const formRules = {
  protocolName: [
    { required: true, message: '请输入协议名称', trigger: 'blur' },
    { min: 2, max: 50, message: '协议名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  protocolType: [
    { required: true, message: '请选择协议类型', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '备注信息不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 协议模板组件映射
const templateComponents = {
  '以太网': EthernetProtocolTemplate,
  'RS422': RS422ProtocolTemplate,
  'CAN': CANProtocolTemplate,
  '1553B': Protocol1553BTemplate
}

// 使用 drawer hook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const drawer: any = useDrawer<ProtocolFormData>({
  title: '新增协议',
  size: '65%',
  okText: '保存',
  placement: 'right',
  formRef,
  get formModel() {
    return computed(() => drawer.state?.data)
  },
  autoResetForm: true,
  preValidate: true,
  autoScrollToError: true,
  defaultData(): ProtocolFormData {
    return {
      protocolName: '',
      protocolType: '',
      version: 'v1.0',
      description: '',
      status: '0',
      protocolConfig: {}
    }
  },
  async onConfirm() {
    const submitData = {
      ...drawer.state.data
    }
    emit('success', submitData)
  },
  onConfirmError: (error: any) => {
    console.error('表单验证失败:', error)
  }
})

// 当前显示的模板组件
const currentTemplateComponent = computed(() => {
  const type = drawer.state?.data?.protocolType
  return type ? templateComponents[type as keyof typeof templateComponents] : null
})

// 协议类型变化处理
const handleProtocolTypeChange = (_value: string) => {
  // 切换协议类型时重置协议配置
  drawer.state.data.protocolConfig = {}
}

// 自定义 open 方法
const openDrawer = async (protocolData?: ProtocolFormData) => {
  if (protocolData && protocolData.protocolId) {
    // 编辑模式
    drawer.open()
    drawerLoading.value = true
    
    try {
      // 这里可以调用详情接口获取完整数据
      // const detail = await getProtocolDetail(protocolData.protocolId)
      drawer.state.data = {
        ...protocolData
      }
    } finally {
      drawerLoading.value = false
    }
  } else {
    // 新增模式
    drawer.open()
  }
}

// 暴露方法
defineExpose({
  open: openDrawer,
  close: drawer.close
})
</script>

<style lang="scss" scoped>
.protocol-form-container {
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  .protocol-template-section {
    margin-top: 24px;
    
    .template-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>

