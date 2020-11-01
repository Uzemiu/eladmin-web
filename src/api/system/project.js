import request from '@/utils/request'

export function get(params) {
  return request({
    url: 'api/project',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/project',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/project/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/project',
    method: 'put',
    data
  })
}

export default { add, edit, del }