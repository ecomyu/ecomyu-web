<template lang="pug">
q-dialog(ref="dialog",maximized,position="right",v-model="props.params.show",@before-hide="onHide",transition-show="slide-left",transition-hide="slide-right")
  q-card(style="min-width:100%;max-width:100vw")
    q-card-section.row.q-pa-none
      q-toolbar.bg-primary.text-white
        q-btn(flat,round,dense,:icon="$t('icons.back')",v-close-popup)
        q-space
        q-item-label {{ $t('Change Id') }}
        q-space
        //-q-btn(rounded,unelevated,,color="primary",:label="$t('Change Id')",:disabled="!v$.$anyDirty || v$.$invalid",@click="onSubmit")
    q-card-section.scroll
      q-form.q-gutter-sm
        q-input(name="id",v-model="v$.id.$model",:error="v$.id.$error",stack-label,:label="$t('fields.myprofile.id')",outlined,@keydown.enter.prevent="onEnterKey")
          template(v-slot:prepend)
            q-icon(size="xs",name="fas fa-at")
          template(v-slot:error)
            span(v-if="v$.id.required && v$.id.required.$invalid") {{ $t('errors.required', [$t('fields.myprofile.id')]) }}
            span(v-else-if="v$.id.maxLength && v$.id.maxLength.$invalid") {{ $t('errors.maxLength', [$t('fields.myprofile.id'), v$.id.maxLength.$params.max]) }}
            span(v-else-if="v$.id.regex && v$.id.regex.$invalid") {{ $t('errors.regex', [$t('fields.myprofile.id')]) }}
            span(v-else-if="v$.id.exists && v$.id.exists.$invalid") {{ $t('errors.exists', [$t('fields.myprofile.id')]) }}

      q-toolbar.q-pa-none
        q-space
        q-btn(rounded,unelevated,color="primary",:icon="$t('icons.id')",:label="$t('Change Id')",:disabled="!v$.$anyDirty || v$.$invalid",@click="onSubmit")
  span
</template>

<script>
import { defineComponent, inject, reactive, ref, toRefs, watch, nextTick } from 'vue'

// import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import useVuelidate from '@vuelidate/core'
import { required, maxLength, helpers } from '@vuelidate/validators'

import { useMyProfile } from 'stores/myprofile'

// import dayjs from 'dayjs'

import { getData, postData, patchData } from 'src/utils/api'

import { nl2br } from 'src/utils/common'

const existsId = async (val) => {
  let ret = false
  try {
    if (val) {
      ret = await getData(`/users/exists?id=${encodeURIComponent(val)}`)
    }
  } catch (e) {
    ret = true
  }
  return !!!ret
}

export default defineComponent({
  inject: ['router', 'states', 'dialogs', 'myprofile'],
  props: {
    params: {
      show: Boolean
    }
  },
  setup(props, context) {
    const { t } = useI18n()

    const q = useQuasar()

    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const storeMyProfile = useMyProfile()
    // myprofile = storeToRefs(storeMyProfile)
    const myprofile = inject('myprofile')

    const dialog = ref()

    const data = reactive({
      id: String(''),
    })

    let defaultData = Object.assign({}, data)

    const rules = {
      id: {
        required,
        maxLength: maxLength(20),
        regex: helpers.regex(/^[0-9a-z][0-9a-z_]+[0-9a-z]$/),
        exists: helpers.withAsync(existsId)
      },
    }

    const $externalResults = ref({})
    const v$ = useVuelidate(rules, data, { $externalResults, $scope: false })

    watch(() => data.id, () => {
      if (data.id === defaultData.id) {
        v$.value.id.$dirty = false
      }
    })

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

      load()
    }

    const load = async () => {
      await storeMyProfile.refresh()

      data.id = myprofile.id.value

      defaultData = Object.assign({}, data)

      v$.value.$reset()
    }

    const onSubmit = () => {
      q.dialog({
        message: nl2br(t('Confirm Change Id')),
        ok: {
          label: t('Change'),
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
    }

    const doSubmit = async () => {
      q.loading.show()

      let message

      let saveData = {
        newId: data.id
      }

      await patchData(`/myprofile/id`, saveData).then(async (json) => {
        if (!json) {
          message = 'Failed Change Id'
        }
      }).catch((err) => {
        message = 'Failed Change Id'

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
        // updated()
        dialogs.changeId.show = false
        router.push(`/@${data.id}`)
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
            message: nl2br(t(message)),
            ok: {
              label: t('Ok'),
            },
            html: true,
            persistent: true
          })
        })
      }
    }

    const onEnterKey = () => {
      return false
    }

    const onHide = () => {
      dialogs.changeId.show = false
    }

    return {
      dialog,
      states,
      props,
      data, v$,
      reload, load,
      onEnterKey,
      onSubmit,
      onHide,
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
