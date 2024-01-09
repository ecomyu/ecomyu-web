<template lang="pug">
q-dialog(ref="dialog",maximized,position="right",v-model="props.params.show",@before-hide="onHide",transition-show="slide-left",transition-hide="slide-right")
  q-card.bg-area(style="min-width:100%;max-width:100vw")
    q-card-section.row.q-pa-none
      q-toolbar.bg-primary.text-white
        q-btn(flat,round,dense,:icon="$t('icons.back')",v-close-popup)
        q-space
        q-item-label {{ $t('Post') }}
        q-space
        q-btn(rounded,unelevated,color="primary",@click.capture.stop="onCopyLink({ _id: props.params.id })",size="sm",:icon="$t('icons.copyLink')")
    q-card-section.scroll.q-pa-none
      PartPostSingle(:id="props.params.id")
</template>

<script>
import { defineComponent, inject, reactive, ref, toRef, watch, nextTick } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

// import dayjs from 'dayjs'

import { nl2br, copyLink } from 'src/utils/common'

import { getData } from 'src/utils/api'

import PartPostSingle from 'src/components/PartPostSingle.vue'

export default defineComponent({
  components: {
    PartPostSingle
  },
  inject: ['router', 'states', 'dialogs', 'onReload'],
  props: {
    params: {
      id: String,
      show: Boolean
    }
  },
  setup(props, context) {
    const { t } = useI18n()

    const q = useQuasar()

    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const onReload = inject('onReload')

    const dialog = ref()

    const params = toRef(props, 'params')

    const post = ref({})

    watch(() => params.value.id, async (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        // router.replace(`/post/${params.value.id}`)
        post.value._id = params.value.id
      }
    })

    let processing = false

    watch(() => onReload.value, async (newVal, oldVal) => {
      if (newVal) {
        processing = true
        if (states.latest.action && states.latest.id) {
          if (post.value._id === states.latest.id) {
            //
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

    const onCopyLink = async (post) => {
      post.menuShowing = false
      copyLink(post)
      q.notify({
        type: 'positive',
        message: nl2br(t('Copied Share Link To Clipboard'))
      })
    }

    const onHide = () => {
      dialogs.single.show = false
      dialogs.single.id = null
    }

    return {
      dialog,
      states,
      props,
      onCopyLink,
      onHide
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
