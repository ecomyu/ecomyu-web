<template lang="pug">
q-dialog(ref="dialog",full-width,v-model="params.show",@before-hide="onHide")
  authenticator(:hide-sign-up="!enableSignup")
</template>

<script>
import { defineComponent, inject, ref, toRefs, watch, nextTick } from 'vue'

// import { useRouter } from 'vue-router'

// import { useI18n } from 'vue-i18n'

// import { useQuasar } from 'quasar'

import { useMyProfile } from 'src/stores/myprofile'

// import dayjs from 'dayjs'

import urlJoin from 'url-join'

// import { getData } from '../utils/api'

// import {} from '../utils/common'

export default defineComponent({
  inject: ['router', 'states', 'dialogs', 'myprofile'],
  props: ['params'],
  setup(props, context) {
    // const { t } = useI18n()

    // const q = useQuasar()

    // const router = inject('router')

    const storeMyProfile = useMyProfile()
    // myprofile = storeToRefs(storeMyProfile)
    const myprofile = inject('myprofile')

    const states = inject('states')

    const dialogs = inject('dialogs')

    // const team = inject('team')

    const dialog = ref()

    const enableSignup = process.env.VUE_APP_SIGNUP === 'true' ? true : false

    watch(() => states.auth.route, async (newVal, oldVal) => {
      if (dialogs.login.show) {
        if (newVal === 'authenticated') {
          await storeMyProfile.refresh()

          if (myprofile.id.value) {
            location.href = '/' + '@' + myprofile.id.value
          } else {
            location.href = '/'
          }
          dialog.value.hide()
        }
      }
    })

    const onHide = () => {
      dialogs.login.show = false
    }

    return {
      dialog,
      states,
      enableSignup,
      onHide,
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
