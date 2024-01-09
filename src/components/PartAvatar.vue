<template lang="pug">
q-item-section.q-pr-none(avatar,top,:style="`min-width: calc(${size} + 0.5rem); width: calc(${size} + 0.5rem);`")
  template(v-if="user && user.id && user._id")
    template(v-if="user.deleted")
      q-avatar(color="user-0",text-color="white",:size="size")
        span {{ user.handle ? user.handle.substr(0, 1) : $t('No Handle Sign') }}
    template(v-else-if="user.avatarId")
      q-avatar.cursor-pointer(v-intersection="onIntersection",:data-id="user.id",:data-file_id="user.avatarId",:size="size",@click.capture.stop="onClick({ id: user.id })")
        img.absolute-center.full-width(:class="`avatar-${user.avatarId}`",src="../assets/null.png",style="object-fit: cover;")
        q-skeleton(type="QAvatar",:class="`loading-avatar-${user.avatarId}`",:size="size")
    template(v-else-if="user && user.handle")
      q-avatar.cursor-pointer(:color="user.avatarColor ? user.avatarColor : 'user-1'",text-color="white",:size="size",@click.capture.stop="onClick({ id: user.id })")
        span {{ user.handle ? user.handle.substr(0, 1) : $t('No Handle Sign') }}
    template(v-else)
      q-avatar(color="unknown",:size="size",style="border:2px solid white")
        span {{ $t('Unknown User Mark') }}
  template(v-else)
    q-avatar(color="grey-5",:size="size",style="border:2px solid white")
</template>

<script>
import { defineComponent, onMounted, ref, nextTick, toRef, inject, watch } from 'vue'

import { debounce } from 'quasar'

import { wait, formatNumber } from 'src/utils/common'

import { getData, postData, deleteData, loadImageTo } from 'src/utils/api'

const avatars = new Map()

export default defineComponent({
  props: ['user', 'size', 'event', 'param'],
  inject: ['router', 'states', 'dialogs', 'myprofile'],
  setup(props, context) {
    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const myprofile = inject('myprofile')

    const user = ref({})

    const avatarId = ref(null)

    let elmIntersect

    watch(() => [ props.user.id, props.user.avatarId ], async (newVal, oldVal) => {
      onIntersection(elmIntersect)
    })

    onMounted(async () => {
      user.value = props.user
    })

    const onClick = async (user) => {
      if (!user.deleted) {
        if (props.event) {
          if (props.param) {
            props.event(props.param)
          } else {
            props.event(props.user)
          }
        } else {
          router.push(`/@${user.id}`)
        }
      }
    }

    const onIntersection = async (elm) => {
      if (elm && elm.isIntersecting) {
        elmIntersect = elm

        const userId = elm.target.dataset.id
        const fileId = elm.target.dataset.file_id

        try {
          setTimeout(()=> {
            nextTick(async () => {
              await loadImageTo(`/users/${userId}/avatar`, `avatar-${fileId}`, `avatar-${fileId}`, `loading-avatar-${fileId}`)
            })
          }, 200)

        } catch(e) {
        }

        avatars.set(userId, {
          id: userId,
          fileId: fileId,
        })
      }
    }

    return {
      formatNumber,
      onClick,
      onIntersection
    }
  }
})
</script>
