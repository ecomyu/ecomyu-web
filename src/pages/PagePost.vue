<template lang="pug">
PartToolbar
PartNavbar
PartDrawer
q-page-container
  q-page.justify-top.items-center
    .q-py-lg.q-py-lg-xl
      q-scroll-area.absolute-full.bg-area(:visible="true")
        PartSingle(:id="router.currentRoute.value.params.id",size="2.5rem")
    span
</template>

<script>
import { defineComponent, onMounted, inject, reactive, ref, computed, watch, nextTick } from 'vue'

// import { useI18n } from 'vue-i18n'

import { useQuasar, copyToClipboard } from 'quasar'

// import { wait } from 'src/utils/common'

// import { getData, postData, deleteData, loadImageTo } from '../utils/api'

import PartToolbar from 'src/components/PartToolbar.vue'

import PartDrawer from 'src/components/PartDrawer.vue'

import PartNavbar from 'src/components/PartNavbar.vue'

import PartSingle from 'src/components/PartSingle.vue'

export default defineComponent({
  components: {
    PartToolbar,
    PartDrawer,
    PartNavbar,
    PartSingle
  },
  inject: ['router', 'states', 'onReload'],
  setup() {
    // const { t } = useI18n()

    const q = useQuasar()

    const router = inject('router')

    const states = inject('states')

    const onReload = inject('onReload')

    const post = ref({})

    let processing = false

    watch(() => onReload.value, async (newVal, oldVal) => {
      if (newVal) {
        processing = true
        if (states.latest.action && states.latest.id) {
        } else {
          // reload(true)
        }

        setTimeout(()=> {
          nextTick(() => {
            onReload.value = false
            processing = false
          })
        }, 200)
      }
    })

    return {
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
