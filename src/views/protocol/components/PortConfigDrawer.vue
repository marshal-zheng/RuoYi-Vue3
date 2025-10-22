<template>
  <el-drawer
    v-model="visible"
    :title="title"
    size="60%"
    direction="rtl"
    @close="onClose"
  >
    <el-tabs v-model="activeTab" class="port-config-tabs">
      <!-- 参数配置 Tab -->
      <el-tab-pane label="参数配置" name="params">
        <div class="params-config-content">
          <!-- 端口基本信息 -->
          <el-descriptions :column="2" border class="port-basic-info">
            <el-descriptions-item label="端口名称">{{ portInfo.interfaceName }}</el-descriptions-item>
            <el-descriptions-item label="总线类型">{{ portInfo.interfaceType }}</el-descriptions-item>
            <el-descriptions-item label="端口位置" :span="2">{{ positionLabel }}</el-descriptions-item>
          </el-descriptions>

          <!-- 参数配置表单 -->
          <el-form
            ref="paramsFormRef"
            :model="paramsForm"
            :rules="paramsFormRules"
            label-position="top"
            class="params-form"
          >
            <!-- RS422/RS485 参数 -->
            <template v-if="portInfo.interfaceType === 'RS422' || portInfo.interfaceType === 'RS485'">
              <el-form-item label="波特率" prop="baudRate">
                <el-select v-model="paramsForm.baudRate" placeholder="请选择波特率">
                  <el-option label="9600" :value="9600" />
                  <el-option label="19200" :value="19200" />
                  <el-option label="38400" :value="38400" />
                  <el-option label="57600" :value="57600" />
                  <el-option label="115200" :value="115200" />
                  <el-option label="230400" :value="230400" />
                  <el-option label="460800" :value="460800" />
                  <el-option label="921600" :value="921600" />
                </el-select>
              </el-form-item>
              <el-form-item label="数据位" prop="dataBits">
                <el-select v-model="paramsForm.dataBits" placeholder="请选择数据位">
                  <el-option label="5" :value="5" />
                  <el-option label="6" :value="6" />
                  <el-option label="7" :value="7" />
                  <el-option label="8" :value="8" />
                </el-select>
              </el-form-item>
              <el-form-item label="停止位" prop="stopBits">
                <el-select v-model="paramsForm.stopBits" placeholder="请选择停止位">
                  <el-option label="1" :value="1" />
                  <el-option label="1.5" :value="1.5" />
                  <el-option label="2" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="校验方式" prop="parity">
                <el-select v-model="paramsForm.parity" placeholder="请选择校验方式">
                  <el-option label="无校验(None)" value="None" />
                  <el-option label="奇校验(Odd)" value="Odd" />
                  <el-option label="偶校验(Even)" value="Even" />
                  <el-option label="标记(Mark)" value="Mark" />
                  <el-option label="空格(Space)" value="Space" />
                </el-select>
              </el-form-item>
            </template>

            <!-- CAN 参数 -->
            <template v-if="portInfo.interfaceType === 'CAN'">
              <el-form-item label="波特率" prop="baudRate">
                <el-select v-model="paramsForm.baudRate" placeholder="请选择波特率">
                  <el-option label="5 Kbps" :value="5000" />
                  <el-option label="10 Kbps" :value="10000" />
                  <el-option label="20 Kbps" :value="20000" />
                  <el-option label="50 Kbps" :value="50000" />
                  <el-option label="100 Kbps" :value="100000" />
                  <el-option label="125 Kbps" :value="125000" />
                  <el-option label="250 Kbps" :value="250000" />
                  <el-option label="500 Kbps" :value="500000" />
                  <el-option label="800 Kbps" :value="800000" />
                  <el-option label="1 Mbps" :value="1000000" />
                </el-select>
              </el-form-item>
              <el-form-item label="工作模式" prop="canMode">
                <el-radio-group v-model="paramsForm.canMode">
                  <el-radio label="A">A 模式</el-radio>
                  <el-radio label="B">B 模式</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>

            <!-- LAN 参数 -->
            <template v-if="portInfo.interfaceType === 'LAN'">
              <el-form-item label="IP 地址" prop="ipAddress">
                <el-input v-model="paramsForm.ipAddress" placeholder="请输入 IP 地址，如：192.168.1.100" />
              </el-form-item>
              <el-form-item label="端口号" prop="port">
                <el-input-number v-model="paramsForm.port" :min="1" :max="65535" placeholder="请输入端口号" />
              </el-form-item>
              <el-form-item label="协议类型" prop="protocol">
                <el-radio-group v-model="paramsForm.protocol">
                  <el-radio label="TCP">TCP</el-radio>
                  <el-radio label="UDP">UDP</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>

            <!-- 1553B 参数 -->
            <template v-if="portInfo.interfaceType === '1553B'">
              <el-form-item label="总线地址" prop="busAddress">
                <el-input-number v-model="paramsForm.busAddress" :min="0" :max="31" placeholder="请输入总线地址 (0-31)" />
              </el-form-item>
              <el-form-item label="RT 地址" prop="rtAddress">
                <el-input-number v-model="paramsForm.rtAddress" :min="0" :max="31" placeholder="请输入 RT 地址 (0-31)" />
              </el-form-item>
              <el-form-item label="子地址" prop="subAddress">
                <el-input-number v-model="paramsForm.subAddress" :min="0" :max="31" placeholder="请输入子地址 (0-31)" />
              </el-form-item>
            </template>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 报文配置 Tab -->
      <el-tab-pane label="报文配置" name="message">
        <div class="message-config-placeholder">
          <el-empty description="报文配置功能开发中..." />
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="closeDrawer">取消</el-button>
        <el-button type="primary" @click="submitPort">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup name="PortConfigDrawer">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '端口配置' },
  portInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'submit'])

// 抽屉显示状态
const visible = ref(props.modelValue)
watch(() => props.modelValue, (v) => {
  visible.value = v
  if (v) {
    initParamsForm()
  }
})
watch(visible, (v) => emit('update:modelValue', v))

// 当前激活的 Tab
const activeTab = ref('params')

// 表单引用
const paramsFormRef = ref()

// 参数配置表单数据
const paramsForm = reactive({
  // RS422/RS485 参数
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'None',
  // CAN 参数
  canMode: 'A',
  // LAN 参数
  ipAddress: '',
  port: 8080,
  protocol: 'TCP',
  // 1553B 参数
  busAddress: 0,
  rtAddress: 0,
  subAddress: 0
})

// IP 地址验证
const validateIpAddress = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入 IP 地址'))
  } else {
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipPattern.test(value)) {
      callback(new Error('请输入正确的 IP 地址格式'))
    } else {
      callback()
    }
  }
}

// 表单验证规则（根据总线类型动态设置）
const paramsFormRules = computed(() => {
  const rules = {}
  const busType = props.portInfo.interfaceType
  
  if (busType === 'RS422' || busType === 'RS485') {
    rules.baudRate = [{ required: true, message: '请选择波特率', trigger: 'change' }]
    rules.dataBits = [{ required: true, message: '请选择数据位', trigger: 'change' }]
    rules.stopBits = [{ required: true, message: '请选择停止位', trigger: 'change' }]
    rules.parity = [{ required: true, message: '请选择校验方式', trigger: 'change' }]
  } else if (busType === 'CAN') {
    rules.baudRate = [{ required: true, message: '请选择波特率', trigger: 'change' }]
    rules.canMode = [{ required: true, message: '请选择工作模式', trigger: 'change' }]
  } else if (busType === 'LAN') {
    rules.ipAddress = [{ required: true, validator: validateIpAddress, trigger: 'blur' }]
    rules.port = [{ required: true, message: '请输入端口号', trigger: 'blur' }]
    rules.protocol = [{ required: true, message: '请选择协议类型', trigger: 'change' }]
  } else if (busType === '1553B') {
    rules.busAddress = [{ required: true, message: '请输入总线地址', trigger: 'blur' }]
    rules.rtAddress = [{ required: true, message: '请输入 RT 地址', trigger: 'blur' }]
    rules.subAddress = [{ required: true, message: '请输入子地址', trigger: 'blur' }]
  }
  
  return rules
})

// 端口位置标签
const positionLabel = computed(() => {
  const positionMap = {
    left: '左侧',
    right: '右侧',
    top: '顶部',
    bottom: '底部'
  }
  return positionMap[props.portInfo.position] || props.portInfo.position
})

/** 初始化参数表单 */
function initParamsForm() {
  // 从 portInfo 中加载已有的参数配置
  if (props.portInfo.params) {
    Object.assign(paramsForm, props.portInfo.params)
  } else {
    // 设置默认值
    resetParamsForm()
  }
}

/** 重置参数表单为默认值 */
function resetParamsForm() {
  const busType = props.portInfo.interfaceType
  
  if (busType === 'RS422' || busType === 'RS485') {
    paramsForm.baudRate = 115200
    paramsForm.dataBits = 8
    paramsForm.stopBits = 1
    paramsForm.parity = 'None'
  } else if (busType === 'CAN') {
    paramsForm.baudRate = 250000
    paramsForm.canMode = 'A'
  } else if (busType === 'LAN') {
    paramsForm.ipAddress = '192.168.1.100'
    paramsForm.port = 8080
    paramsForm.protocol = 'TCP'
  } else if (busType === '1553B') {
    paramsForm.busAddress = 0
    paramsForm.rtAddress = 0
    paramsForm.subAddress = 0
  }
}

/** 提交表单 */
function submitPort() {
  if (!paramsFormRef.value) {
    visible.value = false
    return
  }
  
  paramsFormRef.value.validate((valid) => {
    if (!valid) return
    
    // 提取当前总线类型对应的参数
    const busType = props.portInfo.interfaceType
    let params = {}
    
    if (busType === 'RS422' || busType === 'RS485') {
      params = {
        baudRate: paramsForm.baudRate,
        dataBits: paramsForm.dataBits,
        stopBits: paramsForm.stopBits,
        parity: paramsForm.parity
      }
    } else if (busType === 'CAN') {
      params = {
        baudRate: paramsForm.baudRate,
        canMode: paramsForm.canMode
      }
    } else if (busType === 'LAN') {
      params = {
        ipAddress: paramsForm.ipAddress,
        port: paramsForm.port,
        protocol: paramsForm.protocol
      }
    } else if (busType === '1553B') {
      params = {
        busAddress: paramsForm.busAddress,
        rtAddress: paramsForm.rtAddress,
        subAddress: paramsForm.subAddress
      }
    }
    
    emit('submit', {
      ...props.portInfo,
      params
    })
    
    ElMessage.success('参数配置保存成功')
    visible.value = false
  })
}

/** 关闭抽屉 */
function closeDrawer() {
  visible.value = false
}

/** 抽屉关闭回调 */
function onClose() {
  activeTab.value = 'params' // 重置到第一个 tab
  paramsFormRef.value?.clearValidate()
  emit('close')
}
</script>

<style lang="scss" scoped>
.port-config-tabs {
  height: calc(100vh - 180px);
  
  :deep(.el-tabs__content) {
    height: calc(100% - 55px);
    overflow-y: auto;
  }
  
  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.params-config-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.port-basic-info {
  margin-bottom: 24px;
}

.params-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }
  
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-input-number) {
    width: 100%;
  }
}

.message-config-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
}

:deep(.el-drawer__footer) {
  padding: 0;
  margin-top: auto;
}
</style>

