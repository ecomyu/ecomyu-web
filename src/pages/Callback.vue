<template lang="pug">
div <!--callback-->
</template>

<script>
import { defineComponent, onMounted, nextTick } from 'vue'

import urlJoin from 'url-join'

import { useMyProfile } from 'stores/myprofile'

import { storeToRefs } from 'pinia'

export default defineComponent({
  inject: ['router', 'route', 'amplify'],
  setup() {
    const router = inject('router')

    const route = inject('route')

    const amplify = inject('amplify')

    onMounted(async () => {
      init()
    })

    let c = 0

    const init = async () => {
      if (route.query.code && route.query.state) {
        await amplify.onCallback(route.query.code)

        router.replace('/')
      }
    }

    return {
    }
  }
})
</script>
