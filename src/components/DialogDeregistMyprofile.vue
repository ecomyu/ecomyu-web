<template lang="pug">
q-dialog(ref="dialog",persistent,v-model="props.params.show",@before-hide="onHide")
  q-card(style="min-width: 20rem; max-width: 60vw;")
    q-card-section.row.q-pb-none
      q-toolbar.q-px-none
        .text-h6 {{ $t('Deregist') }}
        q-space
        q-btn(flat,round,dense,:icon="$t('icons.close')",v-close-popup)
    q-card-section
      span {{ $t('Confirm Deregist MyProfile') }}
    q-card-section.row.q-pt-none
      q-space
      q-btn(rounded,unelevated,,color="negative",:icon="$t('icons.deregist')",:label="$t('Deregist')",@click="onSubmit")

q-dialog(full-width,v-model="showDialog")
  q-card
    q-card-section
      span(v-html="nl2br($t('Sorry To See You Go'))")
    q-card-section.row.q-pt-none
      q-space
      q-btn(color="primary",:label="$t('Ok')",@click="onFinish")
</template>

<script>
import { defineComponent, inject, reactive, ref, toRefs, watch, nextTick } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import { getData, deleteData } from 'src/utils/api'

import { nl2br /*loadOptionsColor, checkUploadImageFile,*/  } from 'src/utils/common'

export default defineComponent({
  inject: ['router', 'amplify', 'states', 'dialogs'],
  props: {
    params: {
      show: Boolean
    }
  },
  setup(props, context) {
    const { t } = useI18n()

    const q = useQuasar()

    const router = inject('router')

    const amplify = inject('amplify')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const dialog = ref()

    const showDialog = ref(false)

    const onHide = () => {
      dialogs.deregistMyProfile.show = false
    }

    const onSubmit = () => {
      doSubmit()
    }

    const doSubmit = async () => {
      q.loading.show()

      let message

      await deleteData(`/myprofile`).then(async (json) => {
        await amplify.SignOut()
        // router.push(`/`)

      }).catch((err) => {
        console.log(err)
        message = 'Failed Deregist'

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
        dialogs.deregistMyProfile.show = false

        showDialog.value = true
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

    const onFinish = () => {
      router.push(`/`)
      dialogs.deregistMyProfile.show = false
    }

    return {
      dialog,
      states,
      nl2br,
      props,
      showDialog,
      onHide,
      onSubmit,
      onFinish,
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
