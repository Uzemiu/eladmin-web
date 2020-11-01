<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="name" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="description">
            <el-input v-model="form.description" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="startTime" prop="startTime">
            <el-date-picker
              v-model="form.startTime"
              type="date"
              placeholder="选择开始日期"
              :picker-options="dateOption"
              style="width: 370px;"
            />
          </el-form-item>
          <el-form-item label="endTime" prop="endTime">
            <el-date-picker
              v-model="form.endTime"
              type="date"
              placeholder="选择结束日期"
              style="width: 370px;"
            />
          </el-form-item>
          <el-form-item label="leader" prop="leader">
            <el-select v-model="form.leader.id" filterable style="width: 370px;">
              <el-option
                v-for="e in users"
                :key="e.nickName"
                :label="e.nickName"
                :value="e.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="status" prop="status">
            <el-select v-model="form.status" style="width: 370px;">
              <el-option
                v-for="(item,i) in dict.label.project_status"
                :key="i"
                :label="item"
                :value="Number(i)"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="name" />
        <el-table-column prop="description" label="description" />
        <el-table-column prop="startTime" label="startTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="endTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="leader">
          <template slot-scope="scope">
            <span>{{ scope.row.leader.nickName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="status">
          <template slot-scope="scope">
            <span>{{ dict.label.project_status[scope.row.status] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','project:edit','project:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudSysProject from '@/api/system/project'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

import { getDeptUsers } from '@/api/system/user'

const defaultForm = {
  id: null,
  name: null,
  description: null,
  startTime: null,
  endTime: null,
  leader: {
    id: null
  },
  status: null
}
export default {
  name: 'Project',
  // eslint-disable-next-line vue/no-unused-components
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: 'Project',
      url: 'api/project',
      idField: 'id',
      sort: 'id,desc',
      crudMethod: { ...crudSysProject }
    })
  },
  dicts: ['project_status'],
  data() {
    return {
      users: [],
      permission: {
        add: ['admin', 'project:add'],
        edit: ['admin', 'project:edit'],
        del: ['admin', 'project:del']
      },
      rules: {
        id: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        leader: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      dateOption: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.beforeToAdd]() {
      this.getUserInfo()
    },
    [CRUD.HOOK.beforeToEdit]() {
      this.getUserInfo()
    },
    getUserInfo() {
      if (this.users.length > 0) {
        return
      }
      const params = {
        sort: 'id,desc',
        page: 0,
        size: 5681
      }
      getDeptUsers(params).then(res => {
        this.users = res.content
      })
    }
  }
}
</script>

<style scoped>

</style>
