<template lang="pug">
q-list
  template(v-if="id")
    PartPostRecursive(:posts="posts",:depth="1",:level="-1",:rootDepth="rootDepth")
</template>

<script>
import { defineComponent, onMounted, ref, nextTick, toRef, inject, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar, useMeta } from 'quasar'

import { wait, nl2br, safeHtml, safeText, stripLinebreaks, formatDateNow, formatDateLocal, formatNumber, onStampIntersection, onStampInterval, follow, block } from '../utils/common'

import { getData, postData, deleteData, loadImageTo } from '../utils/api'

import PartPostRecursive from '/src/components/PartPostRecursive.vue'

export default defineComponent({
  props: ['id'],
  components: {
    PartPostRecursive
  },
  inject: ['router', 'dialogs', 'states', 'myprofile', 'onReload'],
  setup(props, context) {
    const router = inject('router')

    const { t } = useI18n()

    const q = useQuasar()

    const dialogs = inject('dialogs')

    const states = inject('states')

    const myprofile = inject('myprofile')

    const onReload = inject('onReload')

    const id = toRef(props, 'id')

    const posts = ref({})

    const rootDepth = ref(0)

    watch(() => id.value, async (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        reload()
      }
    })

    let processing = false

    watch(() => onReload.value, async (newVal, oldVal) => {
      if (newVal) {
        processing = true
        if (states.latest.action && states.latest.id) {
          if (id.value === states.latest.id) {
            if (states.latest.action === 'update' || states.latest.action === 'comment') {
              reload()
            }
          }
        }

        setTimeout(()=> {
          nextTick(() => {
            onReload.value = false
            processing = false
          })
        }, 200)
      }
    })

    onMounted(async () => {
      reload()
    })

    const reload = async () => {
      q.loading.show()

      posts.value = []

      rootDepth.value = 0

      /*
      postsCount.value = 0

      postsFilters = []

      postsCountQuery = new URLSearchParams()
      if (postsFilters.length > 0) {
        postsCountQuery.set('filter', JSON.stringify({ $and: postsFilters }))
      }

      postsCount.value = await getData(`/posts/count?${postsCountQuery.toString()}`)
      */

      await load()
    }

    const load = async () => {
      try {
        const json = await getData(`/posts/${id.value}`)
        if (json && json._id) {
          if (json.parents) {
            let depth = Object.keys(json.parents).length * -1
            rootDepth.value = depth
            for (const key of Object.keys(json.parents).reverse()) {
              // posts.value.set({ _id: childId })
              let parentId = json.parents[key]
              let childId
              if (key === 0) {
                posts.value.push({ _id: parentId })
              } else {
                childId = json.parents[key - 1]
                posts.value.push({ _id: parentId, children: [childId], isParent: true, depth: depth })
              }
              depth++
            }
          }

          posts.value.push(Object.assign(json, { isRoot: !!json.parents, isCurrent: true, depth: 0, visibled: true }))

          if (json.children) {
            for (let child of json.children) {
              // posts.value.push({ _id: childId })
            }
          }

          /*
          if (key === 'avatarId') {
            isImage.value = true
            setTimeout(()=> {
              nextTick(async () => {
                await loadImageTo(`/myprofile/image/thumbnail`, `thumbnail-${user.avatarId}`, `thumbnail-${user.avatarId}`, `loading-thumbnail-${user.avatarId}`)
              })
            }, 200)
          }
          */

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
        }
      } catch (e) {
        posts.value.push({ deleted: true })
      }

      if (posts.value.length > 0) {
        const post = posts.value[0]

        let title = ''
        if (post.PostedBy && !post.PostedBy.deleted && post.PostedBy.handle) {
          title = safeText(post.PostedBy.handle) + ' @' + post.PostedBy.id
        } else {
          title = '?'
        }
        if (post.postedAt) {
          title += ' ' + formatDateLocal(post.postedAt)
        }

        const description = stripLinebreaks(safeText(post.text))

        useMeta(() => {
          return {
            title: title,
            meta: {
              description: {
                name: 'description',
                content: description
              }
            }
          }
        })
      }

      q.loading.hide()
    }

    const onShowUser = async (user) => {
      if (!user.deleted) {
        router.push(`/@${user.id}`)
      }
    }

    const onFollow = async (user) => {
      if (user.isFollowing) {
        q.dialog({
          message: nl2br(t('Confirm UnFollow')),
          ok: {
            label: t('UnFollow'),
          },
          cancel: {
            flat: true,
            label: t('Cancel'),
          },
          html: true,
          persistent: true
        }).onOk(() => {
          follow(user)

          setTimeout(()=> {
            nextTick(async () => {
              reload()

              updated()
            })
          }, 200)
        })
      } else {
        follow(user)

        setTimeout(()=> {
          nextTick(async () => {
            reload()

            updated()
          })
        }, 200)
      }
    }

    const onBlock = async (user) => {
      block(user)
      updated()
    }

    const updated = () => {
      context.emit('updated')
    }

    return {
      posts,
      rootDepth,
      onShowUser,
      onFollow,
      onBlock
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
