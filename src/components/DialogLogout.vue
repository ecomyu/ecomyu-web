<template lang="pug">
q-dialog(ref="dialog",persistent,v-model="props.params.show",@before-hide="onHide")
  q-card(style="min-width: 20rem; max-width: 60vw;")
    q-card-section.row.items-center
      .text-h6 {{ $t('Logout') }}
      q-space
      q-btn(flat,round,dense,icon="fas fa-xmark",v-close-popup)
    q-card-section.row.items-center.justify-center
      div(v-html="nl2br($t('Confirm Logout'))")
    q-card-actions.row.justify-end
      authenticator
        template(v-slot="{ user, signOut }")
          q-btn(color="primary",:label="$t('Logout')",@click="signOut")
</template>

<script>
import { defineComponent, inject, ref, toRefs, watch, nextTick } from 'vue'


import { useQuasar } from 'quasar'

import { nl2br } from 'src/utils/common'

export default defineComponent({
  inject: ['router', 'states', 'dialogs'],
  props: {
    params: {
      show: Boolean
    }
  },
  setup(props, context) {
    // const { t } = useI18n()

    const q = useQuasar()

    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    // const myprofile = inject('myprofile')

    const dialog = ref()

    watch(() => states.auth.route, async (newVal, oldVal) => {
      if (dialogs.logout.show) {
        if (newVal === 'signOut' && oldVal === 'authenticated') {
          q.loading.show()
        } else if (newVal === 'signIn') {
          dialog.value.hide()
          location.href = '/'
        }
      }
    })

    const onHide = () => {
      dialogs.logout.show = false
    }

    return {
      nl2br,
      dialog,
      states,
      props,
      onHide
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
