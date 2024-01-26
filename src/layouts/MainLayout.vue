<template lang="pug">
q-layout(view="lhh LpR lff",container,style="height:100vh;position:sticky;top:0")
  template(v-if="router.currentRoute.value.meta && router.currentRoute.value.meta.requiresAuth")
    template(v-if="states && states.auth")
      q-inner-loading.loading(:showing="states.auth.authStatus === 'idle'")
      template(v-if="states.auth.authStatus === 'authenticated'")
        .q-py-lg.q-px-md.text-center
          .text-body1(v-html="$t('Need Login')")
          .q-my-md
            q-btn(flat,color="primary",to="/") {{ $t('Back To Top Page') }}
    template(v-else)
      router-view
  template(v-else)
    router-view

  DialogSingle(:params="dialogs.single",@updated="reload()")

  DialogFailed(:params="dialogs.failed")

  DialogLogin(:params="dialogs.login",@updated="reload()")
  DialogLogout(:params="dialogs.logout",@updated="reload()")

  DialogRegist(:params="dialogs.regist")

  DialogPost(:params="dialogs.post",@updated="reload()")

  DialogReference(:params="dialogs.reference",@updated="reload()")
  DialogComment(:params="dialogs.comment",@updated="reload()")

  DialogRemove(:params="dialogs.remove",@removed="reload('remove', dialogs.remove.id)")

  DialogEditMyProfile(:params="dialogs.editMyProfile",@updated="reload()")
  DialogDeregistMyProfile(:params="dialogs.deregistMyProfile")

  DialogChangeBg(:params="dialogs.changeBg",@updated="reload()")
  DialogChangeAvatar(:params="dialogs.changeAvatar",@updated="reload()")
  DialogChangeId(:params="dialogs.changeId")

  DialogFollow(:params="dialogs.follow",@updated="reload()")

  q-resize-observer(@resize="onResize")
</template>

<script>
import { defineComponent, watch, onMounted, provide, reactive, ref, nextTick } from 'vue'

import { watchDebounced } from '@vueuse/core'

import { useRouter, useRoute } from 'vue-router'

import { useAmplify } from 'src/boot/amplify'
import { useAuthenticator } from '@aws-amplify/ui-vue'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import { useMyProfile } from 'src/stores/myprofile'

import { storeToRefs } from 'pinia'

import { getData } from 'src/utils/api'

import { nl2br } from 'src/utils/common'

import DialogSingle from 'src/components/DialogSingle.vue'

import DialogFailed from 'src/components/DialogFailed.vue'

import DialogLogin from 'src/components/DialogLogin.vue'
import DialogLogout from 'src/components/DialogLogout.vue'

import DialogRegist from 'src/components/DialogRegist.vue'

import DialogPost from 'src/components/DialogPost.vue'

import DialogReference from 'src/components/DialogReference.vue'
import DialogComment from 'src/components/DialogComment.vue'

import DialogRemove from 'src/components/DialogRemove.vue'

import DialogEditMyProfile from 'src/components/DialogEditMyProfile.vue'
import DialogDeregistMyProfile from 'src/components/DialogDeregistMyProfile.vue'

import DialogChangeBg from 'src/components/DialogChangeBg.vue'
import DialogChangeAvatar from 'src/components/DialogChangeAvatar.vue'
import DialogChangeId from 'src/components/DialogChangeId.vue'

import DialogFollow from 'src/components/DialogFollow.vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    DialogSingle,

    DialogFailed,

    DialogLogin,
    DialogLogout,

    DialogRegist,

    DialogPost,

    DialogReference,
    DialogComment,

    DialogRemove,

    DialogEditMyProfile,
    DialogDeregistMyProfile,

    DialogChangeBg,
    DialogChangeAvatar,
    DialogChangeId,

    DialogFollow
  },
  setup () {
    const { t } = useI18n()

    const q = useQuasar()

    const amplify = useAmplify()
    provide('amplify', amplify)
    const auth = useAuthenticator()

    const router = useRouter()
    provide('router', router)

    const route = useRoute()
    provide('route', route)

    const states = reactive({
      pageWidth: 0,
      auth: ref(auth),
      counter: {
        notice: 0
      },
      latest: {
        action: null,
        id: null,
        ops: null
      },
      bg: {
        id: null,
        method: null,
        params: {}
      }
    })
    provide('states', states)

    const onReload = ref(false)
    provide('onReload', onReload)

    const dialogs = reactive({
      failed: {
        show: false
      },
      needSignup: {
        show: false
      },
      single: {
        id: null,
        show: false
      },
      login: {
        show: false
      },
      logout: {
        show: false
      },
      regist: {
        show: false
      },
      post: {
        id: null,
        show: false
      },
      reference: {
        id: null,
        refId: null,
        show: false
      },
      comment: {
        id: null,
        parentId: null,
        show: false
      },
      remove: {
        id: null,
        show: false
      },
      editMyProfile: {
        show: false
      },
      deregistMyProfile: {
        show: false
      },
      changeBg: {
        show: false
      },
      changeAvatar: {
        show: false
      },
      changeId: {
        show: false
      },
      follow: {
        id: null,
        mode: 'followings',
        show: false
      },
      messages: {
        id: null,
        show: false
      },
    })
    provide('dialogs', dialogs)

    const users = reactive({})
    provide('users', users)

    let myprofile = {}
    const storeMyProfile = useMyProfile()
    myprofile = storeToRefs(storeMyProfile)
    provide('myprofile', myprofile)

    const isSearch = ref(false)
    provide('isSearch', isSearch)

    const keyword = ref('')
    provide('keyword', keyword)

    const onSearch = ref(false)
    provide('onSearch', onSearch)

    const googleAd = ref()

    if (window.innerWidth < 400) {
      states.screenSize = 'xsmall'
    } else if (window.innerWidth < 640) {
      states.screenSize = 'small'
    } else if (window.innerWidth < 800) {
      states.screenSize = 'medium'
    } else {
      states.screenSize = 'large'
    }

    watch(() => states.auth.route, async (newVal, oldVal) => {
      // console.log(newVal)
    })
    watch(() => states.auth.authStatus, async (newVal, oldVal) => {
      if (!newVal) { return }
      if (newVal === 'authenticated') {
        init()
      }
    })

    watchDebounced(() => keyword.value, async (newVal, oldVal) => {
      // if (!newVal) { return }
      if (newVal === '') {
        isSearch.value = false
      } else {
        isSearch.value = true
      }
      if (newVal !== oldVal) {
        reload()
      }
    }, { debounce: 500, maxWait: 3000 })

    onMounted(async () => {
      init()

      try {
        await getData('/')
      } catch(e) {
        dialogs.failed.show = true
      }
    })

    const init = async () => {
      if (!states.auth || !states.auth.authStatus || states.auth.authStatus !== 'authenticated') {
        return
      } else {
        await storeMyProfile.load(true)

        if (!myprofile.id.value) {
          if (route.path === '/about' || route.path === '/terms' || route.path === '/privacy') {
          } else {
            dialogs.regist.show = true
          }
        } else {
          states.counter.notices = await getData('/notices/count?notsaw=true')
        }
      }
    }

    const onResize = (size) => {
      if (size.width < 400) {
        states.screenSize = 'xsmall'
      } else if (size.width < 640) {
        states.screenSize = 'small'
      } else if (size.width < 800) {
        states.screenSize = 'medium'
      } else {
        states.screenSize = 'large'
      }
    }

    const reload = () => {
      onReload.value = true
    }

    return {
      router,
      states,
      dialogs,
      isSearch, keyword, onSearch,
      onResize,
      myprofile,
      reload,
      googleAd
    }
  }
})
</script>

<style lang="stylus">
[data-amplify-authenticator] [data-amplify-container]
  max-width calc(100vw - 52px)

pre
  white-space pre-wrap
  word-break break-all

a
  text-decoration none
  color #346
  &:hover
    text-decoration underline

.q-field__control
  .q-editor__content
    padding 0.5rem 0
    line-height 1.275rem
.q-menu
  .q-list
    .q-item
      .q-item__section--avatar
        min-width 2.5rem

.body--light
  color #000b00

.body--dark
  color #000b00

.bg-area
  background-color #eee !important

.bg-unknown
  background-color rgba(0, 0, 0, .05) !important

.bg-user-0
  background-color #ccc !important

.bg-user-1 // red
  background-color #f44336 !important
.text-user-1
  color #f44336 !important

.bg-user-2 // pink
  background-color #e91e63 !important
.text-user-2
  color #e91e63 !important

.bg-user-3 // purple
  background-color #9c27b0 !important
.text-user-3
  color #9c27b0 !important

.bg-user-4 // deep-purple
  background-color #673ab7 !important
.text-user-4
  color #673ab7 !important

.bg-user-5 // indigo
  background-color #3f51b5 !important
.text-user-5
  color #3f51b5 !important

.bg-user-6 // blue
  background-color #1e88e5 !important
.text-user-6
  color #1e88e5 !important

.bg-user-7 // cyan
  background-color #00bcd4 !important
.text-user-7
  color #00bcd4 !important

.bg-user-8 // teal
  background-color #009688 !important
.text-user-8
  color #009688 !important

.bg-user-9 // green
  background-color #4caf50 !important
.text-user-9
  color #4caf50 !important

.bg-user-10 // light-green
  background-color #7cb342 !important
.text-user-10
  color #7cb342 !important

.bg-user-11 // lime
  background-color #afb42b !important
.text-user-11
  color #afb42b !important

.bg-user-12 // yellow
  background-color #fbc02d !important
.text-user-12
  color #fbc02d !important

.bg-user-13 // orange
  background-color #ff9800 !important
.text-user-13
  color #ff9800 !important

.bg-user-14 // deep-orange
  background-color #ff5722 !important
.text-user-14
  color #ff5722 !important

.bg-user-15 // brown
  background-color #795548 !important
.text-user-15
  color #795548 !important

.bg-user-16 // grey
  background-color #757575 !important
.text-user-16
  color #757575 !important

.bg-user-17 // ash
  background-color #546e7a !important
.text-user-17
  color #546e7a !important

@media screen and (min-width: 640px)
  .q-dialog.fullscreen .q-dialog__inner.fixed-right
    width calc(100% - 250px)
@media screen and (max-width: 640px)
  .q-dialog.fullscreen .q-dialog__inner.fixed-right
    width calc(100% - 58px)
@media screen and (max-width: 400px)
  .q-dialog.fullscreen .q-dialog__inner.fixed-right
    width 100%
</style>
