<template lang="pug">
q-dialog(ref="dialog",persistent,v-model="props.params.show",@before-hide="onHide",no-backdrop-dismiss)
  q-card
    q-card-section.row.q-pa-none
      q-toolbar.bg-negative.text-white
        q-btn(flat,round,dense,:icon="$t('icons.close')",v-close-popup)
        q-space
        q-item-label {{ $t('Failed Title') }}
        q-space
    q-card-section.text-center
      span(v-html="$t('Failed Description')")
</template>

<script>
import { defineComponent, inject, ref, watch } from 'vue'

// import { useI18n } from 'vue-i18n'

// import { useQuasar } from 'quasar'

export default defineComponent({
  inject: ['dialogs'],
  props: {
    params: {
      show: Boolean
    }
  },
  setup(props, context) {
    // const { t } = useI18n()

    // const q = useQuasar()

    const dialogs = inject('dialogs')

    const dialog = ref()

    watch(() => props.params.show, async (newVal, oldVal) => {
      console.log('show')
      if (newVal) {
        // reload()
      }
    })

    const onHide = async () => {
      dialogs.failed.show = false
    }

    return {
      dialog,
      props,
      onHide,
      // updated
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
