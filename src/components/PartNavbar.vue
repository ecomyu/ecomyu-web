<template lang="pug">
q-footer(v-if="states.screenSize === 'xsmall'")
  q-tabs.bg-secondary
    q-tab(class="search",:icon="$t('icons.home')",@click="onClickedTo('/')")
    //-q-tab(class="search",:icon="$t('icons.search')",@click="onClickedTo('/')")
    template(v-if="states.auth.authStatus === 'authenticated'")
      q-tab(class="myprofile",:icon="$t('icons.profile')",@click="onClickedTo(`/@${myprofile.id.value}`)")
    template(v-if="states.auth.authStatus === 'authenticated'")
      q-tab(class="notice",:icon="$t('icons.notice')",@click="onClickedTo('/notice')")
        q-badge(v-if="states.counter.notices > 0",floating,rounded,color="red",:label="formatNumber(states.counter.notices, 1)")
</template>

<script>
import { defineComponent, onMounted, inject, ref, computed, watch } from 'vue'

import { formatNumber } from 'src/utils/common'

// import { getData } from 'src/utils/api'

export default defineComponent({
  components: {
  },
  inject: ['router', 'states', 'onReload', 'myprofile'],
  setup(props, context) {
    const router = inject('router')

    const states = inject('states')

    const onReload = inject('onReload')

    const myprofile = inject('myprofile')

    const onClickedTo = (url) => {
      if (url === router.currentRoute.value.path) {
        onReload.value = true
      } else {
        router.push(url)
      }
    }

    return {
      onClickedTo,
      formatNumber
    }
  }
})
</script>
