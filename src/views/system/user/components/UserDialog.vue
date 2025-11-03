<template>
  <ZxDialog
    v-model="dialogVisible"
    :title="title"
    width="600px"
    append-to-body
    @close="cancel"
  >
    <el-form
      ref="userRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input
              v-model="form.nickName"
              placeholder="请输入用户昵称"
              maxlength="30"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="归属部门" prop="deptId">
            <el-tree-select
              v-model="form.deptId"
              :data="deptOptions"
              :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
              value-key="deptId"
              placeholder="请选择归属部门"
              check-strictly
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="form.phonenumber"
              placeholder="请输入手机号码"
              maxlength="11"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            v-if="form.userId === undefined"
            label="用户名称"
            prop="userName"
          >
            <el-input
              v-model="form.userName"
              placeholder="请输入用户名称"
              maxlength="30"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            v-if="form.userId === undefined"
            label="用户密码"
            prop="password"
          >
            <el-input
              v-model="form.password"
              placeholder="请输入用户密码"
              type="password"
              maxlength="20"
              show-password
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户性别">
            <el-select v-model="form.sex" placeholder="请选择">
              <el-option
                v-for="dict in sys_user_sex"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :value="dict.value"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="岗位">
            <el-select v-model="form.postIds" multiple placeholder="请选择">
              <el-option
                v-for="item in postOptions"
                :key="item.postId"
                :label="item.postName"
                :value="item.postId"
                :disabled="item.status === '1'"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色">
            <el-select v-model="form.roleIds" multiple placeholder="请选择">
              <el-option
                v-for="item in roleOptions"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
                :disabled="item.status === '1'"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              type="textarea"
              placeholder="请输入内容"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </ZxDialog>
</template>

<script setup>
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue'
import { getUser, updateUser, addUser, deptTreeSelect } from '@/api/system/user'
import { listRole } from '@/api/system/role'
import { listPost } from '@/api/system/post'
import { getConfigKey } from '@/api/system/config'

const { proxy } = getCurrentInstance()
const emit = defineEmits(['success'])

const { sys_normal_disable, sys_user_sex } = proxy.useDict(
  'sys_normal_disable',
  'sys_user_sex'
)

const dialogVisible = ref(false)
const loading = ref(true)
const showPassword = ref(false)
const title = ref('')
const initPassword = ref(undefined)

const roleOptions = ref([])
const postOptions = ref([])
const deptOptions = ref(undefined)

const data = reactive({
  form: {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: []
  },
  rules: {
    userName: [
      { required: true, message: '用户名称不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: '用户名称长度必须介于 2 和 20 之间',
        trigger: 'blur'
      }
    ],
    nickName: [
      { required: true, message: '用户昵称不能为空', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '用户密码不能为空', trigger: 'blur' },
      {
        min: 5,
        max: 20,
        message: '用户密码长度必须介于 5 和 20 之间',
        trigger: 'blur'
      }
    ],
    email: [
      {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: ['blur', 'change']
      }
    ],
    phonenumber: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  }
})

const { form, rules } = toRefs(data)

/** 查询部门下拉树结构 */
async function getDeptTree() {
  const response = await deptTreeSelect()
  deptOptions.value = response.data
}

/** 查询用户详细 */
async function getUsers(userId) {
  const response = await getUser(userId)
  form.value = response.data
  form.value.postIds = response.postIds
  form.value.roleIds = response.roleIds
}

/** 提交按钮 */
async function submitForm() {
  const userRef = proxy.$refs.userRef
  if (!userRef) return
  
  const valid = await userRef.validate().catch(() => false)
  if (!valid) return
  
  if (form.value.userId !== undefined) {
    await updateUser(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addUser(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  dialogVisible.value = false
  emit('success')
}

/** 取消按钮 */
function cancel() {
  dialogVisible.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: []
  }
  proxy.$refs.userRef?.resetFields()
}

/** 获取部门列表、角色列表、岗位列表 */
async function getOptions() {
  const config = await getConfigKey('sys.user.initPassword')
  initPassword.value = config.msg
  form.value.password = initPassword.value
  
  const roleResponse = await listRole({})
  roleOptions.value = roleResponse.rows
  
  const postResponse = await listPost({})
  postOptions.value = postResponse.rows
}

/** 新增按钮操作 */
async function handleAdd() {
  reset()
  dialogVisible.value = true
  title.value = '添加用户'
  await getOptions()
}

/** 修改按钮操作 */
async function handleUpdate(userId) {
  reset()
  dialogVisible.value = true
  title.value = '修改用户'
  await Promise.all([getOptions(), getUsers(userId)])
}

/** 打开对话框 - 支持新增和修改 */
function open(userId) {
  if (userId) {
    handleUpdate(userId)
  } else {
    handleAdd()
  }
}

onMounted(() => {
  getDeptTree()
})

defineExpose({
  open
})
</script>]]>