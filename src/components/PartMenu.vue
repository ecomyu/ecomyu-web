<template lang="pug">
q-item-section.no-padding(v-if="states.screenSize === 'xsmall'",avatar,style="min-width:46px;")
  q-btn(round,unelevated,:icon="$t('icons.menu')")
    q-menu(auto-close,anchor="bottom right",self="top right")
      q-list.text-primary
        template(v-if="states.auth.authStatus !== 'authenticated'")
          q-item(clickable,@click="dialogs.login.show = true")
            q-item-section(avatar)
              q-icon(:name="$t('icons.login')")
            q-item-section {{ $t('Login') }}
          q-separator
        q-item(clickable,@click="onClickedTo(`/`)")
          q-item-section(avatar)
            q-icon(:name="$t('icons.top')")
          q-item-section {{ $t('Top') }}
        q-item(:clickable="states.auth.authStatus === 'authenticated'",@click="onClickedTo(`/@${myprofile.id.value}`)",:class="states.auth.authStatus !== 'authenticated' ? 'text-grey-6' : null")
          q-item-section(avatar)
            q-icon(:name="$t('icons.profile')")
          q-item-section {{ $t('MyPage') }}
        q-item(:clickable="states.auth.authStatus === 'authenticated'",@click="onClickedTo(`/notice`)",:class="states.auth.authStatus !== 'authenticated' ? 'text-grey-6' : null")
          q-item-section(avatar)
            q-icon(:name="$t('icons.notice')")
          q-item-section {{ $t('Notices') }}
            q-badge.q-mr-sm(v-if="states.auth.authStatus === 'authenticated' && states.counter.notices > 0",floating,rounded,color="red",:label="formatNumber(states.counter.notices, 1)")
        q-separator
        q-item(clickable,:to="`/about`")
          q-item-section(avatar)
            q-icon(:name="$t('icons.logo')")
          q-item-section {{ $t('About') }}
        template(v-if="states.auth.authStatus === 'authenticated'")
          q-separator
          q-item(clickable,@click="dialogs.logout.show = true")
            q-item-section(avatar)
              q-icon(:name="$t('icons.logout')")
            q-item-section {{ $t('Logout') }}
</template>

<script>
import { defineComponent, onMounted, inject, reactive, ref, computed, watch, nextTick, toRef } from 'vue'

import { formatNumber } from 'src/utils/common'

// import { } from 'src/utils/api'

export default defineComponent({
  components: {
  },
  inject: ['router', 'states', 'dialogs', 'onReload', 'myprofile'],
  setup(props, context) {
    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const onReload = inject('onReload')

    const myprofile = inject('myprofile')

    onMounted(async () => {
      // reload()
    })

    const onClickedTo = (url) => {
      if (url === router.currentRoute.value.path) {
        onReload.value = true
      } else {
        router.push(url)
      }
    }

    return {
      formatNumber,
      onClickedTo
    }
  }
})
</script>
