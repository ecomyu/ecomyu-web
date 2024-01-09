<template lang="pug">
q-dialog(ref="dialog",maximized,position="right",v-model="props.params.show",@before-hide="onHide",transition-show="slide-left",transition-hide="slide-right")
  q-card(style="min-width:100%;max-width:100vw")
    q-card-section.row.q-pa-none
      q-toolbar.bg-primary.text-white
        q-btn(flat,round,dense,:icon="$t('icons.back')",v-close-popup)
        q-item-label.text-subtitle2 {{ user.handle }}
    q-card-section.q-py-sm
      q-tabs(v-model="tab",dense,align="left",inline-label)
        q-tab(name="followings",:label="$t('Followings')")
          q-badge.q-ml-sm(v-if="followingsCount > 0",color="primary",rounded,outline) {{ formatNumber(followingsCount, 1) }}
        q-tab(name="followers",:label="$t('Followers')")
          q-badge.q-ml-sm(v-if="followersCount > 0",color="primary",rounded,outline) {{ formatNumber(followersCount, 1) }}

      template(v-if="users.size === 0")
        .text-center.text-caption.q-py-lg {{ $t('No User') }}
      template(v-else)
        q-list.full-width.bg-area
          template(v-for="[key, user] of users")
            q-item.bg-white.full-width.q-pa-none(style="margin-bottom: 1px;")
              PartUser(:user="user",@updated="reload(); updated()")

          q-item-section(v-if="usersCount > users.size")
            q-item.self-center
              q-btn.q-px-lg(rounded,unelevated,color="info",clickable,@click="load()") {{ $t('More Read') }}
</template>

<script>
import { defineComponent, inject, reactive, ref, toRefs, watch, nextTick } from 'vue'

import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

// import dayjs from 'dayjs'

import { nl2br, safeHtml, formatNumber } from 'src/utils/common'

import { getData } from 'src/utils/api'

import PartUser from 'src/components/PartUser.vue'

export default defineComponent({
  components: {
    PartUser
  },
  inject: ['router', 'states', 'dialogs'],
  props: {
    params: {
      id: String,
      mode: String,
      show: Boolean
    }
  },
  setup(props, context) {
    const { t } = useI18n()

    const q = useQuasar()

    // const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const dialog = ref()

    const user = reactive({
      _id: String(''),
      id: String(''),
      handle: String(''),
      avatarId: String(''),
      avatarColor: String(''),
    })

    const users = ref({})

    const followingsCount = ref(0)
    const followersCount = ref(0)

    const tab = ref('followings')

    watch(() => tab.value, async (newVal, oldVal) => {
      if (newVal) {
        reload()
      }
    })

    /*
    watch(() => props.params.id, async (newVal, oldVal) => {
      if (newVal) {
        reload()
      }
    })
    */

    watch(() => props.params.mode, async (newVal, oldVal) => {
      if (newVal) {
        tab.value = props.params.mode
        reload()
      }
    })

    watch(() => props.params.show, async (newVal, oldVal) => {
      if (newVal) {
        reload()
      }
    })

    const reload = async () => {
      q.loading.show()

      await load()
    }

    const load = async () => {
      // if (!dialogs.follow.id) { return }

      const json = await getData(`/users/${dialogs.follow.id}`)
      if (json && json._id) {
        for (let key in json) {
          if (user[key] !== undefined) {
            user[key] = json[key]

            /*
            if (key === 'avatarId') {
              isImage.value = true
              setTimeout(()=> {
                nextTick(async () => {
                  await loadImageTo(`/myprofile/image/thumbnail`, `thumbnail-${data.avatarId}`, `thumbnail-${data.avatarId}`, `loading-thumbnail-${data.avatarId}`)
                })
              }, 200)
            }
            */
          }
        }

        /*
        if (json.avatarColor) {
          const findColor = OptionsColor.find((option) => {
            return option.value === json.avatarColor
          })
          if (findColor) {
            selectedColor.value = findColor
          } else {
            selectedColor.value = OptionsColor[0]
          }
        } else {
          selectedColor.value = OptionsColor[0]
        }
        */

        await reloadUsers()

      }

      q.loading.hide()
    }

    const reloadUsers = async () => {
      q.loading.show()

      users.value = new Map()

      followingsCount.value = await getData(`/users/${dialogs.follow.id}/followings/count`)
      followersCount.value = await getData(`/users/${dialogs.follow.id}/followers/count`)

      q.loading.hide()

      await loadUsers()
    }

    const loadUsers = async () => {
      // const displayUsers = []

      let url

      let usersFilters = []
      let lastId, lastRow

      if (tab.value === 'followings') {
        url = `/users/${dialogs.follow.id}/followings`

        if (followingsCount.value > 0 && followingsCount.value > users.value.size) {
          if (users.value.size > 0) {
            lastId = [...users.value.keys()].pop()

            lastRow = users.value.get(lastId)

            if (lastRow && lastRow.followedAt) {
              usersFilters.push({
                userId: {
                  $ne: `ObjectId:('${lastRow._id}')`
                }
              })
              usersFilters.push({
                followedAt: {
                  $lte: `Date:('${lastRow.followedAt}')`
                }
              })
            }
          }
        }
      } else {
        url = `/users/${dialogs.follow.id}/followers`

        if (followersCount.value > 0 && followersCount.value > users.value.size) {
          if (users.value.size > 0) {
            lastId = [...users.value.keys()].pop()

            lastRow = users.value.get(lastId)

            if (lastRow && lastRow.followedAt) {
              usersFilters.push({
                otherUserId: {
                  $ne: `ObjectId:('${lastRow._id}')`
                }
              })
              usersFilters.push({
                followedAt: {
                  $lte: `Date:('${lastRow.followedAt}')`
                }
              })
            }
          }
        }
      }

      const usersQuery = new URLSearchParams()
      if (usersFilters.length > 0) {
        usersQuery.set('filter', JSON.stringify({ $and: usersFilters }))
      }

      usersQuery.set('limit', 15)
      usersQuery.set('sort', '-postedAt')

      await getData(`${url}?${usersQuery.toString()}`).then(async (arr) => {
        if (arr && Array.isArray(arr)) {
          for (const row of arr) {
            let data = await getData(`/users/${row.id}`)

            data.hasImage = true
            data.loadedImage = false

            try {
              // post.referencesCount = await getData(`/posts/${row._id}/references/count`)
              // post.likesCount = await getData(`/posts/${row._id}/likes/count`)
            } catch (e) {
              console.log(e)
            }

            users.value.set(row._id, data)

            /*
            if (announcement.PostedBy && announcement.PostedBy.avatarId) {
              if (displayUsers.indexOf(announcement.PostedBy.avatarId) < 0) {
                displayUsers.push({
                  _id: announcement.PostedBy._id,
                  avatarId: announcement.PostedBy.avatarId
                })
              }
            }
            */
          }
        }
      }).catch((err) => {
        console.log(err)
      })

      /*
      setTimeout(()=> {
        nextTick(async () => {
          for (const displayUser of displayUsers) {
            await loadImageTo(`/users/${displayUser._id}/image/avatar`, `avatar-${displayUser.avatarId}`, `avatar-${displayUser.avatarId}`, `loading-${displayUser.avatarId}`)
          }
        })
      }, 300)
      */

      q.loading.hide()
    }

    const onHide = () => {
      dialogs.follow.show = false
    }

    const updated = () => {
      context.emit('updated')
    }

    return {
      formatNumber,
      dialog,
      states,
      props,
      reload,
      tab,
      followingsCount, followersCount,
      user,
      users,
      onHide,
      updated
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
