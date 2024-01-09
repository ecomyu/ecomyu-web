<template lang="pug">
q-page-container
  q-page.justify-top.items-center
    .q-py-lg.q-py-lg-xl
      q-scroll-area.absolute-full(:visible="true")
        q-item
          q-item-section(avatar,top)
            q-btn(round,unelevated,color="primary",:icon="$t('icons.up')",:to="`/`")
          q-item-section
            q-item-label
              .text-subtitle1.text-weight-bold {{ $t('About Title') }}

        q-list
          q-item
            q-item-section
              .full-width.text-body2
                p <a href="https://ecomyu.com/" target="_blank">ecomyu(エコミュ)</a>は2024年1月にオープンソース化されたSNSです。

        .row.flex-center.q-px-xl
          template(v-if="states && states.auth && states.auth.authStatus && states.auth.authStatus === 'authenticated'")
            //-q-btn(rounded,unelevated,color="primary",padding="md lg",:icon="$t('icons.top')",:label="$t('Go Top')",:to="`/`")
          template(v-else)
            q-btn(rounded,unelevated,color="primary",padding="md lg",:icon="$t('icons.login')",:label="$t('Login')",@click="states.dialogLoginParams.show = true")

        .q-mt-md.text-center
          q-btn(rounded,flat,color="primary",:label="$t('Go To Privacy Page')",to="/privacy")
          q-btn(rounded,flat,color="primary",:label="$t('Go To Terms Page')",to="/terms")
</template>

<script>
import { defineComponent, inject } from 'vue'

import { useI18n } from 'vue-i18n'

import { /*useQuasar,*/ useMeta } from 'quasar'

import { nl2br, textToLink } from 'src/utils/common'

export default defineComponent({
  inject: ['states', 'dialogs'],
  setup() {
    const { t } = useI18n()

    // const q = useQuasar()

    // const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    /*
    const { loginWithRedirect } = useAuth0()

    const login = () => {
      loginWithRedirect()
    }
    */

    useMeta(() => {
      return {
        title: t('About Title'),
        meta: {
          description: {
            name: 'description',
            content: t('logo') + 'は誰もが簡単に自分の声を世界に発信できるサービスです。'
          }
        }
      }
    })

    return {
      states,
      dialogs,
      nl2br,
      textToLink,
    }
  }
})
</script>
