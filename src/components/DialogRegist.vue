<template lang="pug">
q-dialog(ref="dialog",v-model="props.params.show",@before-hide="onHide",no-backdrop-dismiss)
  q-card
    q-card-section.row.q-pa-none
      q-toolbar.bg-primary.text-white
        q-btn(flat,round,dense,:icon="$t('icons.close')",v-close-popup)
        q-space
        q-item-label {{ $t('Regist User') }}
        q-space
    q-card-section.scroll
      q-list(style="max-width: 20rem;")
        q-item.q-px-sm.q-mb-md
          q-item-section
            .full-width.text-body2
              span <a href="/privacy" target="_blank">利用規約</a>・<a href="/terms" target="_blank">プライバシーポリシー</a>に同意の上、ユーザー名を入力して登録ボタンを押してください。

        q-form.q-gutter-sm
          q-input(name="handle",v-model="v$.handle.$model",:error="v$.handle.$error",stack-label,:label="$t('fields.myprofile.handle')",outlined)
            template(v-slot:error)
              span(v-if="v$.handle.required && v$.handle.required.$invalid") {{ $t('errors.required', [$t('fields.myprofile.handle')]) }}
              span(v-else-if="v$.handle.maxLength && v$.handle.maxLength.$invalid") {{ $t('errors.maxLength', [$t('fields.myprofile.handle'), v$.handle.maxLength.$params.max]) }}

        .row.flex-center.q-mb-md
          q-checkbox.agree.q-mr-sm(name="agree",v-model="agree") {{ $t('Agree Terms') }}
        .row.flex-center
          q-btn(rounded,:label="$t('Regist User')",color="primary",:disabled="!v$.$anyDirty || v$.$invalid || !agree",@click="onSubmit")
</template>

<script>
import { defineComponent, inject, reactive, ref, watch, nextTick } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import { useRouter } from 'vue-router'

// import { useAuth0 } from '@auth0/auth0-vue'

import { useMyProfile } from 'stores/myprofile'

import useVuelidate from '@vuelidate/core'
import { required, minLength, maxLength, email, helpers } from '@vuelidate/validators'
// import { isPassword } from 'src/utils/validators'

import { nl2br } from 'src/utils/common'

import { getData, postData } from 'src/utils/api'

const exists = async (type, val) => {
  const ret = await getData(`/users/exists?${type}=${encodeURIComponent(val)}`)
  return !!!ret
}

const existsId = async (val) => {
  if (!val) return false
  return await exists('id', val)
}

const existsEmail = async (val) => {
  if (!val) return false
  return await exists('email', val)
}

export default defineComponent({
  inject: ['states', 'dialogs'],
  props: {
    params: {
      show: Boolean
    }
  },
  setup(props, context) {
    const { t } = useI18n()

    const q = useQuasar()

    const router = useRouter()

    // const { logout, clearAccessToken } = useAuth0()

    const states = inject('states')

    const dialogs = inject('dialogs')

    const storeMyProfile = useMyProfile()
    // myprofile = storeToRefs(storeMyProfile)
    const myprofile = inject('myprofile')

    const dialog = ref()

    const data = reactive({
      handle: String(''),
    })

    const defaultData = Object.assign({}, data)

    const rules = {
      handle: {
        required,
        maxLength: maxLength(20)
      }
    }

    const $externalResults = ref({})
    const v$ = useVuelidate(rules, data, { $externalResults, $scope: false })

    const agree = ref(false)

    watch(() => props.params.show, async (newVal, oldVal) => {
      if (newVal) {
        reload()
      }
    })

    const reload = async () => {
      for (let key in defaultData) {
        if (data[key]) {
          data[key] = defaultData[key]
        }
      }

      v$.value.$reset()

      agree.value = false

      load()
    }

    const load = async () => {
      q.loading.hide()
    }

    const onSubmit = () => {
      doSubmit()
      /*
      q.dialog({
        message: nl2br(t('Confirm Regist User')),
        ok: {
          label: t('Regist User'),
        },
        cancel: {
          flat: true,
          label: t('Cancel'),
        },
        html: true,
        persistent: true
      }).onOk(() => {
        doSubmit()
      })
      */
    }

    const doSubmit = async () => {
      q.loading.show()

      let message

      let saveData = {}
      for (let key in data) {
        saveData[key] = data[key]
      }

      await postData(`/myprofile`, saveData).then(async (json) => {
      }).catch((err) => {
        message = 'Failed Regist User'

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
        dialogs.regist.show = false

        q.dialog({
          message: nl2br(t('Complete Regist User')),
          ok: {
            label: t('Ok'),
          },
          html: true,
          persistent: true
        })

      } else {
        if (message && String(message).match(/^Incorrect Parameters \- (.+)$/)) {
          const fields = RegExp.$1.split(',')
          let fieldNames = []
          for (let field of fields) {
            fieldNames.push(t(`fields.myprofile.${field}`))
          }

          message = t('Incorrect Parameters', [fieldNames.join(t('Join Symbol'))])
        }

        nextTick(() => {
          q.dialog({
            message: nl2br(t(message, [ t('Regist User') ])),
            ok: {
              label: t('Ok'),
            },
            html: true,
            persistent: true
          })
        })
      }
    }

    const onHide = async () => {
      await storeMyProfile.load(true)

      if (myprofile.id.value) {
        router.replace('/@' + myprofile.id.value)
      } else {
        // clearAccessToken()
        await storeMyProfile.refresh()
        // logout()
        return
      }

      dialogs.regist.show = false
    }

    return {
      dialog,
      states,
      props,
      data, v$,
      agree,
      reload, load,
      onSubmit,
      onHide,
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
