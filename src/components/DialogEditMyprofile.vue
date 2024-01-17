<template lang="pug">
q-dialog(ref="dialog",maximized,position="right",v-model="props.params.show",@before-hide="onHide",transition-show="slide-left",transition-hide="slide-right")
  q-card(style="min-width:100%;max-width:100vw")
    q-card-section.row.q-pa-none
      q-toolbar.bg-primary.text-white
        q-btn(flat,round,dense,:icon="$t('icons.back')",v-close-popup)
        q-space
        q-item-label {{ $t('Edit MyProfile') }}
        q-space
        //-q-btn(rounded,unelevated,color="primary",:label="$t('Save MyProfile')",:disabled="!v$.$anyDirty || v$.$invalid",@click="onSubmit")
    q-card-section.scroll
      q-form.q-gutter-sm
        q-input(name="handle",v-model="v$.handle.$model",:error="v$.handle.$error",stack-label,:label="$t('fields.myprofile.handle')",outlined)
          template(v-slot:error)
            span(v-if="v$.handle.required && v$.handle.required.$invalid") {{ $t('errors.required', [$t('fields.myprofile.handle')]) }}
            span(v-else-if="v$.handle.maxLength && v$.handle.maxLength.$invalid") {{ $t('errors.maxLength', [$t('fields.myprofile.handle'), v$.handle.maxLength.$params.max]) }}

        q-input(name="description",type="textarea",outlined,v-model="v$.description.$model",:error="v$.description.$error",:placeholder="$t('fields.myprofile.description')")
          template(v-slot:error)
            span(v-if="v$.description.maxLength && v$.description.maxLength.$invalid") {{ $t('errors.maxLength', [$t('fields.myprofile.description'), v$.description.maxLength.$params.max]) }}

        //-q-field(name="description",:v-html="safeHtml(data.description)",:error="v$.description.$error",stack-label,:label="$t('fields.myprofile.description')",outlined)
          template(v-slot:control)
            q-editor.full-width.q-mt-sm(ref="editor",flat,dense,content-class="html",:definitions="editorDefinitions()",:toolbar="editorToolbar()",v-model="v$.description.$model")
          template(v-slot:error)
            span(v-if="v$.description.maxLength && v$.description.maxLength.$invalid") {{ $t('errors.maxLength', [$t('fields.myprofile.description'), v$.description.maxLength.$params.max]) }}

        q-input(name="url",v-model="v$.url.$model",:error="v$.url.$error",stack-label,:label="$t('fields.myprofile.url')",outlined)
          template(v-slot:error)
            span(v-if="v$.url.maxLength && v$.url.maxLength.$invalid") {{ $t('errors.maxLength', [$t('fields.myprofile.url'), v$.url.maxLength.$params.max]) }}
            span(v-if="v$.url.url && v$.url.url.$invalid") {{ $t('errors.url', [$t('fields.myprofile.url')]) }}

      q-toolbar.q-pa-none
        q-space
        q-btn(rounded,unelevated,color="primary",:icon="$t('icons.editProfile')",:label="$t('Save MyProfile')",:disabled="!v$.$anyDirty || v$.$invalid",@click="onSubmit")
</template>

<script>
import { defineComponent, inject, reactive, ref, toRefs, watch, nextTick } from 'vue'

// import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import useVuelidate from '@vuelidate/core'
import { required, maxLength, url, helpers } from '@vuelidate/validators'
// import { kana, isDate } from '../utils/validators'

// import { useCache } from 'stores/cache'

import { useMyProfile } from 'stores/myprofile'

// import dayjs from 'dayjs'

import { getData, postData, patchData, deleteData, /* uploadFile, loadImageTo */ } from '../utils/api'

import { nl2br, safeText } from '../utils/common'

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

    // const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const storeMyProfile = useMyProfile()
    // myprofile = storeToRefs(storeMyProfile)
    const myprofile = inject('myprofile')

    const dialog = ref()

    const editor = ref()

    // const isImage = ref(false)
    // const image = ref(null)
    // const imageUrl = ref('')

    const data = reactive({
      // avatarId: String(''),
      email: String(''),
      id: String(''),
      handle: String(''),
      description: String(''),
      url: String(''),
    })

    let defaultData = Object.assign({}, data)

    const rules = {
      handle: {
        required,
        maxLength: maxLength(20)
      },
      description: {
        maxLength: maxLength(2000)
      },
      url: {
        maxLength: maxLength(2000),
        url
      }
    }

    // const OptionsColor = loadOptionsColor()

    // const selectedColor = ref()
    // let avatarColor

    const $externalResults = ref({})
    const v$ = useVuelidate(rules, data, { $externalResults, $scope: false })

    watch(() => data.handle, () => {
      if (data.handle === defaultData.handle) {
        v$.value.handle.$dirty = false
      }
    })
    watch(() => data.description, () => {
      if (data.description === defaultData.description) {
        v$.value.description.$dirty = false
      }
    })
    watch(() => data.url, () => {
      if (data.url === url.description) {
        v$.value.url.$dirty = false
      }
    })

    watch(() => props.params.show, async (newVal, oldVal) => {
      if (newVal) {
        reload()
      }
    })

    const reload = async () => {
      await storeMyProfile.refresh()

      load()
    }

    const load = async () => {
      for (let key in defaultData) {
        if (data[key]) {
          data[key] = defaultData[key]
        }
      }

      v$.value.$reset()

      const json = await getData(`/myprofile`)
      if (json && json._id) {
        for (let key in json) {
          if (data[key] !== undefined) {
            data[key] = json[key]

            if (key === 'id') {
              data[key] = '@' + data[key]
            /*
            } else if (key === 'avatarId') {
              isImage.value = true
              setTimeout(()=> {
                nextTick(async () => {
                  await loadImageTo(cache, `/myprofile/image/thumbnail`, `thumbnail-${data.avatarId}`, `thumbnail-${data.avatarId}`, `loading-thumbnail-${data.avatarId}`)
                })
              }, 200)
              */
            }
          }
        }

        /*
        if (json.avatarColor) {
          const findColor = OptionsColor.find((option) => {
            return option.value === json.avatarColor
          })
          if (findColor) {
            selectedColor.value = findColor
          } else {
            selectedColor.value = OptionsColor[0]
          }
        } else {
          selectedColor.value = OptionsColor[0]
        }
        */

        defaultData = Object.assign({}, data)

        v$.value.$reset()
      }
    }

    const onSubmit = () => {
      /*
      q.dialog({
        message: nl2br(t('Confirm Update MyProfile')),
        ok: {
          label: t('Save'),
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
      doSubmit()
    }

    const doSubmit = async () => {
      q.loading.show()

      let message

      let saveData = {}
      for (let key in data) {
        saveData[key] = data[key]

        if (key === 'description') {
          saveData[key] = safeText(data[key])
        }
      }

      await patchData(`/myprofile`, saveData).then(async (json) => {
      }).catch((err) => {
        message = 'Failed Update'

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
        updated()
        dialogs.editMyProfile.show = false
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
            message: nl2br(t(message, [ t('Edit MyProfile') ])),
            ok: {
              label: t('Ok'),
            },
            html: true,
            persistent: true
          })
        })
      }
    }
    /*
    const updateImage = async () => {
      q.loading.show()

      let message

      try {
        let formData = new FormData()

        formData.append(`image`, image.value)

        let fileName = image.value.name
        let fileType = image.value.type

        let res = await uploadFile(`/myprofile/image/upload`, formData, fileName, fileType)

        isImage.value = true
        imageUrl.value = URL.createObjectURL(image.value)
      } catch (err) {
        console.log(err)

        message = 'Failed Upload Image'

        if (err.response.data) {
          if (err.response.data.code && err.response.data.message) {
            message = err.response.data.message
          } else if (err.response.data.message) {
            message = err.response.data.message
          }
        }
      }

      q.loading.hide()

      if (!message) {
        nextTick(() => {
          image.value = null
        })
      } else {
        nextTick(() => {
          q.dialog({
            message: nl2br(t(message, [imageName])),
            ok: {
              label: t('Ok'),
            },
            html: true,
            persistent: true
          })
        })
      }
    }

    const deleteImage = async () => {
      q.loading.show()

      let message

      const oldAvatarId = data.avatarId

      await deleteData(`/myprofile/image`).then((json) => {
        isImage.value = false
        image.value = null
        imageUrl.value = null
        const imgs = document.getElementsByClassName(oldAvatarId)
        if (!imgs || imgs.length === 0) {
          for(const img of imgs) {
            img.src = ''
          }
        }
      }).catch((err) => {
        console.log(err)

        message = 'Failed Delete Image'

        if (err.response.data) {
          if (err.response.data.code && err.response.data.message) {
            message = err.response.data.message
          } else if (err.response.data.message) {
            message = err.response.data.message
          }
        }
      })

      q.loading.hide()

      if (!message) {
      } else {
        nextTick(() => {
          q.dialog({
            message: nl2br(t(message, [imageName])),
            ok: {
              label: t('Ok'),
            },
            html: true,
            persistent: true
          })
        })
      }
    }
    */

    const onHide = () => {
      dialogs.editMyProfile.show = false
    }

    const updated = () => {
      context.emit('updated')
    }

    return {
      dialog,
      states,
      props,
      data, v$,
      // safeHtml,
      // isImage, image, imageUrl,
      reload, load,
      // selectedColor, OptionsColor,
      onSubmit,
      // updateImage, deleteImage,
      onHide,
      // onDelete,
      updated
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
