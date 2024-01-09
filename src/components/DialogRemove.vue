<template lang="pug">
q-dialog(ref="dialog",full-width,persistent,v-model="props.params.show",@before-hide="onHide")
  q-card
    q-card-section.row.q-pb-none
      q-toolbar.q-px-none
        q-btn(flat,round,dense,:icon="$t('icons.close')",v-close-popup)
    q-card-section
      span {{ $t('Confirm Remove Post') }}
    q-card-section.row.q-pt-none
      q-space
      q-btn(rounded,unelevated,,color="primary",icon="fas fa-trash",:label="$t('Remove Post')",@click="onSubmit")
</template>

<script>
import { defineComponent, inject, reactive, ref, toRefs, watch, nextTick } from 'vue'

import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'

// import dayjs from 'dayjs'

import { getData, deleteData } from 'src/utils/api'

import { nl2br, safeHtml, formatDateNow, formatNumber, onStampIntersection, onStampInterval, /*loadOptionsColor, checkUploadImageFile,*/  } from 'src/utils/common'

export default defineComponent({
  inject: ['router', 'states', 'dialogs', 'myprofile'],
  props: {
    params: {
      _id: String,
      show: Boolean
    }
  },
  setup(props, context) {
    const { t } = useI18n()

    const q = useQuasar()

    // const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const myprofile = inject('myprofile')

    const dialog = ref()

    const post = reactive({
      // text: String('')
    })

    watch(() => props.params.show, async (newVal, oldVal) => {
      if (newVal) {
        reload()
      }
    })

    const reload = async () => {
      load()
    }

    const load = async () => {
      if (!dialogs.remove.id) { return }

      const json = await getData(`/posts/${dialogs.remove.id}`)
      if (json && json._id) {
        for (let key in json) {
          // post[key] = json[key]
        }
      }
    }

    const onHide = () => {
      dialogs.remove.show = false
    }

    const onSubmit = () => {
      doSubmit()
    }

    const doSubmit = async () => {
      q.loading.show()

      let message

      await deleteData(`/posts/${dialogs.remove.id}`).then(async (json) => {
      }).catch((err) => {
        console.log(err)
        message = 'Failed Delete'

        if (err.response && err.response.data) {
          if (err.response.data.code && err.response.data.message) {
            message = err.response.data.message
          } else if (err.response.data.message) {
            message = err.response.data.message
          }
        }
      })

      q.loading.hide()

      if (!message) {
        states.latest.action = 'remove'
        states.latest.id = dialogs.remove.id

        removed()

        dialogs.remove.show = false
      } else {
        q.dialog({
          message: nl2br(t(message)),
          ok: {
            label: t('Ok'),
          },
          html: true,
          persistent: true
        })
      }
    }

    const removed = () => {
      context.emit('removed')
    }

    return {
      dialog,
      states,
      props,
      post,
      onHide,
      onSubmit,
      removed,
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
