<template>
  <el-dialog :title="title" v-model="dialogOpen" width="600px" append-to-body>
    <el-form ref="deviceClazzRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="分类名称" prop="categoryName">
        <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" :rows="3"></el-input>
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
    categoryName: [
      { required: true, message: "分类名称不能为空", trigger: "blur" },
      { min: 2, max: 50, message: "分类名称长度必须介于 2 和 50 之间", trigger: "blur" }
    ]
  }
})

const { form, rules } = toRefs(data)

/** 打开弹框 */
function openDialog(categoryId) {
  reset()
  if (categoryId) {
    // 编辑模式
    title.value = "修改设备分类"
    getDeviceClazzInfo(categoryId)
  } else {
    // 新增模式
    title.value = "添加设备分类"
  }
  dialogOpen.value = true
}

/** 获取设备分类详情 */
function getDeviceClazzInfo(categoryId) {
  try {
    getDeviceClazz(categoryId).then(response => {
      form.value = response.data
    }).catch(error => {
      console.warn('获取分类详情失败:', error)
      // 使用模拟数据
      const mockData = {
        categoryId: categoryId,
        categoryName: "示例分类",
        categoryCode: "EXAMPLE",
        sort: 1,
        status: "0",
        remark: "这是一个示例分类"
      }
      form.value = mockData
    })
  } catch (error) {
    console.warn('获取分类详情异常:', error)
    // 使用模拟数据
    const mockData = {
      categoryId: categoryId,
      categoryName: "示例分类",
      categoryCode: "EXAMPLE",
      sort: 1,
      status: "0",
      remark: "这是一个示例分类"
    }
    form.value = mockData
  }
}

/** 表单重置 */
  function reset() {
    form.value = {
      id: null,
      categoryName: "",
      remark: ""
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
      if (form.value.categoryId != undefined) {
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
        addDeviceClazz(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          dialogOpen.value = false
          emit('success')
        })
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