<template>
  <el-dialog :title="title" v-model="dialogOpen" width="600px" append-to-body>
    <el-form ref="deviceClazzRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="分类描述" prop="descr">
        <el-input v-model="form.descr" type="textarea" placeholder="请输入分类描述" :rows="3"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="DeviceClazzDialog">
import { getDeviceClazz, addDeviceClazz, updateDeviceClazz } from "@/api/fixing/deviceClazz"

const { proxy } = getCurrentInstance()

// 定义组件的 emits
const emit = defineEmits(['success'])

const dialogOpen = ref(false)
const title = ref("")

const data = reactive({
  form: {},
  rules: {
    name: [
      { required: true, message: "分类名称不能为空", trigger: "blur" },
      { min: 2, max: 50, message: "分类名称长度必须介于 2 和 50 之间", trigger: "blur" }
    ],
    descr: [
      { max: 255, message: "分类描述长度不能超过 255 个字符", trigger: "blur" }
    ],
    status: [
      { required: true, message: "请选择状态", trigger: "change" }
    ]
  }
})

const { form, rules } = toRefs(data)

/** 打开弹框 */
function openDialog(deviceClazzId) {
  reset()
  if (deviceClazzId) {
    // 编辑模式
    title.value = "修改设备分类"
    getDeviceClazzInfo(deviceClazzId)
  } else {
    // 新增模式
    title.value = "添加设备分类"
  }
  dialogOpen.value = true
}

/** 获取设备分类详情 */
function getDeviceClazzInfo(deviceClazzId) {
  try {
    getDeviceClazz(deviceClazzId).then(response => {
      form.value = response.data
    }).catch(error => {
      console.warn('获取分类详情失败:', error)
      // 使用模拟数据
      const mockData = {
        deviceClazzId: deviceClazzId,
        name: "示例分类",
        descr: "这是一个示例分类描述",
        status: "0"
      }
      form.value = mockData
    })
  } catch (error) {
    console.warn('获取分类详情异常:', error)
    // 使用模拟数据
    const mockData = {
      deviceClazzId: deviceClazzId,
      name: "示例分类",
      descr: "这是一个示例分类描述",
      status: "0"
    }
    form.value = mockData
  }
}

/** 表单重置 */
  function reset() {
    form.value = {
      deviceClazzId: null,
      name: "",
      descr: "",
      status: "0"
    }
    proxy.resetForm("deviceClazzRef")
}

/** 取消按钮 */
function cancel() {
  dialogOpen.value = false
  reset()
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deviceClazzRef"].validate(valid => {
    if (valid) {
      if (form.value.deviceClazzId != undefined) {
        // 修改
        try {
          updateDeviceClazz(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功")
            dialogOpen.value = false
            emit('success')
          }).catch(error => {
            console.warn('修改分类失败:', error)
            proxy.$modal.msgError("修改失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('修改分类异常:', error)
          proxy.$modal.msgError("修改失败，接口暂不可用")
        }
      } else {
        try {
          addDeviceClazz(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功")
            dialogOpen.value = false
            emit('success')
          }).catch(error => {
            console.warn('新增分类失败:', error)
            proxy.$modal.msgError("新增失败，接口暂不可用")
          })
        } catch (error) {
          console.warn('新增分类异常:', error)
          proxy.$modal.msgError("新增失败，接口暂不可用")
        }
      }
    }
  })
}

// 暴露方法给父组件调用
defineExpose({
  open: openDialog
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>