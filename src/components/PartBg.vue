<template lang="pug">
template(v-if="!user.id || !user._id || user.deleted")
  .bg.relative.bg-grey-5.full-width(:style="`height:${height}`")
template(v-else-if="user.bgId")
  q-img(:ratio="16/9",v-intersection="onIntersection",:data-id="user.id",:data-file_id="user.bgId",:style="`max-height:${height}`")
    template(v-slot:default)
      img.q-img__image.q-img__image--loaded(:class="`bg-${user.bgId}`",src="../assets/null.png",:style="`object-fit: cover; object-position: 50% 50%`")
      q-inner-loading.full-width(size="xs",:showing="true",:class="`loading-${user.bgId}`")
template(v-else)
  .bg.relative.full-width(:class="user.bgColor ? `bg-${user.bgColor}` : 'bg-grey-5'",:style="`height:${height}`")
span
</template>

<script>
import { defineComponent, onMounted, ref, nextTick, toRef, inject } from 'vue'

import { debounce } from 'quasar'

import { wait } from 'src/utils/common'

import { getData, postData, deleteData, loadImageTo } from 'src/utils/api'

export default defineComponent({
  props: ['user', 'height'],
  inject: ['dialogs', 'myprofile'],
  setup(props, context) {
    const dialogs = inject('dialogs')

    const myprofile = inject('myprofile')

    const onIntersection = async (elm) => {
      if (elm.isIntersecting) {
        const userId = elm.target.dataset.id
        const fileId = elm.target.dataset.file_id

        try {
          await loadImageTo(`/users/${userId}/bg`, `bg-${fileId}`, `bg-${fileId}`, `loading-${fileId}`)
        } catch(e) {
        }
      }
    }

    return {
      onIntersection
    }
  }
})
</script>
