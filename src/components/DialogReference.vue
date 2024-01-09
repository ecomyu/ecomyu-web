<template lang="pug">
q-dialog(ref="dialog",full-width,persistent,v-model="props.params.show",@before-hide="onHide")
  q-card
    q-card-section.row.q-pb-none
      q-btn(flat,round,dense,:icon="$t('icons.close')",v-close-popup)
    q-card-section.q-pt-sm.q-pb-none
      q-list
        q-item.q-px-sm
          PartAvatar(:user="getMyprofileAvatar(myprofile)",size="2.5rem")

          q-item-section
            q-form
              q-input(name="text",type="textarea",outlined,v-model="v$.text.$model",:error="v$.text.$error",:placeholder="$t('fields.text')")
                template(v-slot:error)
                  span(v-if="v$.text.required && v$.text.required.$invalid") {{ $t('errors.required', [$t('fields.text')]) }}
                  span(v-else-if="v$.text.maxLength && v$.text.maxLength.$invalid") {{ $t('errors.maxLength', [$t('fields.text'), v$.text.maxLength.$params.max]) }}

              template(v-if="dialogs.reference && !dialogs.reference.id")
                q-file.q-mb-md.full-width(dense,multiple,use-chips,v-model="uploadFiles",max-files="1",:label="$t('Attached Image Files')",:filter="checkUploadImageFile",@rejected="onRejected",style="max-width: calc(100vw - 5rem - 2rem - 2rem)")
                  template(v-slot:prepend)
                    q-icon(name="fas fa-paperclip")

    q-card-section.q-pt-none.q-pb-sm.q-px-lg
      q-list.rounded-borders(style="margin-left: 3rem",bordered)
        template(v-if="!refPost.PostedBy")
          .full-width.q-pa-sm.column
            .row
              q-skeleton.inline(type="QAvatar",size="1,5rem")
              q-skeleton.inline.q-ml-sm(type="text",width="7rem")
              q-skeleton.inline.q-ml-sm(type="text",width="4rem")

            q-skeleton(type="text")
            q-skeleton(type="text")

        template(v-else)
          .full-width.q-pa-sm.column.relative-position
            .row
              PartAvatar(:user="refPost.PostedBy",size="1.5rem")

              span.text-subtitle2 {{refPost.PostedBy && refPost.PostedBy.handle ? refPost.PostedBy.handle : $t('No Handle') }}
              span.q-ml-sm.text-caption @{{ refPost.PostedBy.id }}
              //-.absolute-top-right.q-mt-sm.q-mr-md
                span.q-ml-sm.text-caption(v-intersection="onStampIntersection",:data-date="refPost.postedAt",v-html="formatDateNow(refPost.postedAt)")

              pre.q-pa-xs.full-width.text-body2.ellipsis-3-lines(v-html="safeHtml(textToLink(refPost.text))")

    q-card-section.row.q-pt-none
      q-space
      template(v-if="dialogs.reference && dialogs.reference.id")
        q-btn(rounded,unelevated,,color="primary",:icon="$t('icons.update')",:label="$t('Update')",:disabled="v$.$invalid || !v$.$dirty || (post.text === '' && uploadFiles.length ===0)",@click="onSubmit")
      template(v-else)
        q-btn(rounded,unelevated,,color="primary",:icon="$t('icons.reference')",:label="$t('Reference')",:disabled="!v$.$anyDirty || v$.$invalid",@click="onSubmit")
</template>

<script>
import { defineComponent, inject, reactive, ref, toRefs, watch, nextTick } from 'vue'

import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'

// import dayjs from 'dayjs'

import { getData, postData, patchData, loadImageTo, uploadFile } from 'src/utils/api'

import { nl2br, safeText, safeHtml, textToLink, formatDateNow, formatNumber, onStampIntersection, onStampInterval, /*loadOptionsColor, checkUploadImageFile,*/ getMyprofileAvatar  } from 'src/utils/common'

import PartAvatar from 'src/components/PartAvatar.vue'

export default defineComponent({
  components: {
    PartAvatar
  },
  inject: ['router', 'states', 'dialogs', 'myprofile'],
  props: {
    params: {
      _id: String,
      show: Boolean
    }
  },
  setup(props, context) {
    const { t } = useI18n()

    const q = useQuasar()

    // const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const myprofile = inject('myprofile')

    const dialog = ref()

    const refPost = reactive({
      // text: String('')
    })

    const post = reactive({
      text: String('')
    })

    const initialPost = Object.assign({}, post)
    let defaultPost = Object.assign({}, post)

    const rules = {
      text: {
        required,
        maxLength: maxLength(2000)
      }
    }

    const $externalResults = ref({})
    const v$ = useVuelidate(rules, post, { $externalResults, $scope: false })

    watch(() => post.text, () => {
      if (post.text === defaultPost.text) {
        v$.value.text.$dirty = false
      }
    })

    const files = ref([])
    const uploadFiles = ref([])

    watch(() => props.params.show, async (newVal, oldVal) => {
      if (newVal) {
        reload()
      }
    })

    const reload = async () => {
      for (let key in initialPost) {
        if (post[key]) {
          post[key] = initialPost[key]
          defaultPost[key] = initialPost[key]
        }
      }

      v$.value.$reset()

      files.value = []
      uploadFiles.value = []

      if (myprofile.avatarId.value) {
        setTimeout(()=> {
          nextTick(async () => {
            await loadImageTo(`/users/${myprofile.id.value}/avatar`, `avatar-${myprofile.avatarId.value}`, `avatar-${myprofile.avatarId.value}`, `loading-${myprofile.avatarId.value}`)
          })
        }, 200)
      }

      load()
    }

    const load = async () => {
      let json
      if (dialogs.reference.id) {
        json = await getData(`/posts/${dialogs.reference.id}`)
        if (json && json._id) {
          for (let key in json) {
            post[key] = json[key]
            defaultPost[key] = json[key]
          }
        }
      }

      if (!dialogs.reference.refId) { return }

      json = await getData(`/posts/${dialogs.reference.refId}`)
      if (json && json._id) {
        for (let key in json) {
          refPost[key] = json[key]
        }
      }

      if (refPost.PostedBy.avatarId) {
        await loadImageTo(`/users/${refPost.PostedBy.id}/image`, `avatar-${refPost.PostedBy.avatarId}`, `avatar-${refPost.PostedBy.avatarId}`, `loading-${refPost.PostedBy.avatarId}`)
      }
    }

    const onHide = () => {
      dialogs.reference.id = null
      dialogs.reference.refId = null
      dialogs.reference.show = false
    }

    const onSubmit = () => {
      doSubmit()
    }

    const doSubmit = async () => {
      q.loading.show()

      let message

      post.text = safeText(post.text)

      let json
      try {
        if (!dialogs.reference.id) {
          json = await postData(`/posts/${refPost._id}/references`, post)
        } else {
          json = await patchData(`/posts/${dialogs.reference.id}`, post)
        }
      } catch (err) {
        console.log(err)
        message = 'Failed Reference'

        if (err.response && err.response.data) {
          if (err.response.data.code && err.response.data.message) {
            message = err.response.data.message
          } else if (err.response.data.message) {
            message = err.response.data.message
          }
        }
      }

      if (!message) {
        if (uploadFiles.value.length > 0) {
          let formData = new FormData()

          for (let file of uploadFiles.value) {
            formData.append(`uploadFile`, file)
          }

          await uploadFile(`/posts/${json._id}/upload`, formData).then((json) => {
          }).catch((err) => {
            console.log(err)

            message = 'Failed Upload File'

            if (err.response && err.response.data) {
              if (err.response.data.code && err.response.data.message) {
                message = err.response.data.message
              } else if (err.response.data.message) {
                message = err.response.data.message
              }
            }
          })
        }
      }

      q.loading.hide()

      if (!message) {
        if (!dialogs.reference.id) {
          states.latest.action = 'reference'
          states.latest.id = json._id
          states.latest.opts = {
            id: dialogs.reference.refId
          }
        } else {
          states.latest.action = 'update'
          states.latest.id = json._id
        }

        updated()

        dialogs.reference.id = null
        dialogs.reference.refId = null
        dialogs.reference.show = false
      } else {
        q.dialog({
          message: nl2br(t(message)),
          ok: {
            label: t('Ok'),
          },
          html: true,
          persistent: true
        })
      }
    }

    const updated = () => {
      context.emit('updated')
    }

    return {
      dialog,
      dialogs,
      states,
      props,
      refPost,
      safeHtml, textToLink,
      formatDateNow,
      formatNumber,
      onStampIntersection,
      getMyprofileAvatar,
      post, v$,
      uploadFiles,
      onHide,
      onSubmit,
      updated
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
