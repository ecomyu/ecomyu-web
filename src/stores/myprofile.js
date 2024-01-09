import { ref } from 'vue'

import { defineStore } from 'pinia'

import { getData } from '../utils/api'

import dayjs from 'dayjs'

export const useMyProfile = defineStore('myprofile', () => {
  const _id = ref(null)
  const id = ref(null)
  const handle = ref(null)
  const description = ref(null)
  const bgColor = ref(null)
  const bgId = ref(null)
  const avatarColor = ref(null)
  const avatarId = ref(null)
  const expiresIn = ref(null)
  const active = ref(null)

  async function load (force) {
    if (!this._id || !this.expiresIn || (this.expiresIn && this.expiresIn > new Date()) || force) {
      await getData('/myprofile/').then((json) => {
        if (json) {
          this._id = json._id
          this.id = json.id
          this.handle = json.handle
          this.description = json.description
          this.bgColor = json.bgColor ? json.bgColor : null
          this.bgId = json.bgId ? json.bgId : null
          this.avatarColor = json.avatarColor ? json.avatarColor : null
          this.avatarId = json.avatarId ? json.avatarId : null
          this.expiresIn = dayjs().add(5, 'minuts').toDate()
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  }

  async function refresh () {
    this.expiresIn = null
    await this.load()
  }

  return {
    _id,
    id, handle, description,
    bgColor, bgId,
    avatarColor, avatarId,
    expiresIn,
    load,
    refresh
  }
})
