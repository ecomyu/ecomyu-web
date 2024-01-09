<template lang="pug">
q-drawer(show-if-above,no-mini-animation,:v-model="states.screenSize !== 'xsmall'",side="left",:width="250",:breakpoint="420",:mini-to-overlay="states.screenSize === 'small'",:mini="states.screenSize === 'small' && !expand",@mouseover="expand = true",@mouseout="expand = false",bordered)
  q-layout.fit.full-height
    q-header
      q-list.q-py-none
        q-item.q-py-xs
          template(v-if="router.currentRoute.value.path === '/'")
            q-btn(round,unelevated,:icon="$t('icons.logo')",:to="`/about`")
            q-item-section
              q-item-label.text-subtitle2(style="letter-spacing:0.167em") {{ $t('logo') }}
              q-item-label.text-caption.no-margin(v-if="$t('version') ? true : false") {{ $t('version') }}
          template(v-else)
            q-btn(round,unelevated,:icon="$t('icons.logo')",:to="`/`")
            q-item-section
              q-item-label.text-subtitle2(style="letter-spacing:0.167em") {{ $t('logo') }}
              q-item-label.text-caption.no-margin(v-if="$t('version') ? true : false") {{ $t('version') }}
    q-page-container.bg-white
      q-page
        q-list.q-py-xs
          template(v-if="!states || !states.auth || states.auth.authStatus !== 'authenticated'")
            q-item(clickable,@click="dialogs.login.show = true")
              q-btn(round,unelevated,:icon="$t('icons.login')")
              q-item-section {{ $t('Login') }}
            q-separator
          q-item(clickable,@click="onClickedTo(`/`)",:active="router.currentRoute.value.path === '/'")
            q-btn(round,unelevated,:icon="$t('icons.top')")
            q-item-section {{ $t('Top') }}
          //-q-item(clickable,:to="`/`")
            q-btn(round,unelevated,:icon="$t('icons.search')")
            q-item-section {{ $t('Top') }}
          q-item(:clickable="states && states.auth && states.auth.authStatus === 'authenticated'",@click="onClickedTo(`/@${myprofile.id.value}`)",:class="states.auth.authStatus !== 'authenticated' ? 'text-grey-6' : null",:active="myprofile && myprofile.id.value && router.currentRoute.value.path === `/@${myprofile.id.value}` ? true : false")
            q-btn(round,unelevated,:icon="$t('icons.profile')")
            q-item-section {{ $t('MyPage') }}
          q-item(:clickable="states && states.auth && states.auth.authStatus === 'authenticated'",@click="onClickedTo(`/notice`)",:class="states.auth.authStatus !== 'authenticated' ? 'text-grey-6' : null",:active="router.currentRoute.value.path === '/notice'")
            q-btn(round,unelevated,:icon="$t('icons.notice')")
              q-badge(v-if="states && states.auth && states.auth.authStatus === 'authenticated' && states.counter.notices > 0",floating,rounded,color="red",:label="formatNumber(states.counter.notices, 1)")
            q-item-section {{ $t('Notices') }}
          template(v-if="states.screenSize === 'medium' || states.screenSize === 'large'")
            q-item(clickable,@click="!myprofile._id.value ? notifyNeedLogin() : dialogs.post.show = true",:class="states.auth.authStatus !== 'authenticated' ? 'text-grey-6' : null")
              //-q-btn(unelevated,round,:icon="$t('icons.post')",color="primary",:style="!myprofile._id.value ? 'opacity: .5' : null")
              q-btn.full-width(unelevated,rounded,:icon="$t('icons.post')",:label="$t('On Post')",color="primary",:style="!myprofile._id.value ? 'opacity: .5' : null")

    q-footer
      q-separator
      q-list.q-py-none.bg-white.text-black
        template(v-if="states.auth.authStatus === 'authenticated'")
          q-item(clickable,@click="dialogs.logout.show = true")
            q-btn(round,unelevated,:icon="$t('icons.logout')")
            q-item-section {{ $t('Logout') }}
        //-template(v-else)
          q-item(clickable,@click="dialogs.login.show = true")
            q-btn(round,unelevated,:icon="$t('icons.login')")
            q-item-section {{ $t('Login') }}
</template>

<script>
import { defineComponent, ref, inject, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import { nl2br, formatNumber } from 'src/utils/common'

export default defineComponent({
  inject: ['router', 'states', 'dialogs', 'onReload', 'myprofile'],
  setup() {
    const { t } = useI18n()

    const q = useQuasar()

    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const onReload = inject('onReload')

    const myprofile = inject('myprofile')

    const expand = ref(false)

    if (states.screenSize === 'xsmall' || states.screenSize === 'small') {
      // expand.value = false
    } else {
      expand.value = true
    }

    watch(() => states.screenSize, async (newVal, oldVal) => {
      if (states.screenSize === 'xsmall' || states.screenSize === 'small') {
        if (expand.value) {
          expand.value = false
        }
      }
    })

    const notifyNeedLogin = () => {
      q.notify({
        color: 'accent',
        message: nl2br(t('Need Signup'))
      })
    }

    const onClickedTo = (url) => {
      if (url === router.currentRoute.value.path) {
        onReload.value = true
      } else {
        router.push(url)
      }
    }

    return {
      router,
      states,
      dialogs,
      myprofile,
      onClickedTo,
      formatNumber,
      expand,
      notifyNeedLogin
    }
  }
})
</script>
