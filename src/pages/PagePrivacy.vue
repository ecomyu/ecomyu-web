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
              .text-subtitle1.text-weight-bold {{ $t('Privacy Title') }}
        q-list
          q-item
            q-item-section
              .full-width.text-body2
                span (以下にプライバシーポリシーを記載)
</template>

<script>
import { defineComponent } from 'vue'

import { useI18n } from 'vue-i18n'

import { /*useQuasar,*/ useMeta } from 'quasar'

import { nl2br, textToLink } from 'src/utils/common'

export default defineComponent({
  // inject: ['router'],
  setup() {
    const { t } = useI18n()

    // const q = useQuasar()

    // const router = inject('router')

    useMeta(() => {
      return {
        title: t('Privacy Title'),
        meta: {
          description: {
            name: 'description',
            content: 'タガタメのプライバシーポリシーはココ'
          }
        }
      }
    })

    return {
      nl2br,
      textToLink
    }
  }
})
</script>


<style scoped lang="stylus">
ul.text
  padding 0
  margin 0
  list-style none
  li
  	margin 0
  	padding 0
</style>
