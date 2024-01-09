<template lang="pug">
q-dialog(ref="dialog",full-width,persistent,v-model="props.params.show",@before-hide="onHide")
  q-card
    q-card-section.row.q-pb-none
      q-btn(flat,round,dense,:icon="$t('icons.close')",v-close-popup)
    q-card-section.q-pt-sm.q-pb-none
      q-list
        q-item.q-pa-sm
          template(v-if="!parentPost.PostedBy")
            q-item-section.q-mt-sm.q-pr-md(avatar,top)
              q-skeleton(type="QAvatar")
            q-item-section
              q-item-label
                q-skeleton(type="text",width="calc(100% - 4rem)")
              q-skeleton(type="text")
              q-item-section
                q-skeleton(type="QBadge")
          template(v-else)
            PartAvatar(:user="parentPost.PostedBy",size="2.5rem")

            q-item-section
              q-item-label
                span.text-subtitle2 {{parentPost.PostedBy && parentPost.PostedBy.handle ? parentPost.PostedBy.handle : $t('No Handle') }}
                span.q-ml-sm.text-caption @{{ parentPost.PostedBy.id }}
                //-.absolute-top-right.q-mt-sm.q-mr-md
                  span.q-ml-sm.text-caption(v-intersection="onStampIntersection",:data-date="parentPost.postedAt",v-html="formatDateNow(parentPost.postedAt)")
              q-item-label.content
                pre.q-ma-none.full-width.text-body2.ellipsis-3-lines(v-html="safeHtml(textToLink(parentPost.text))")

    q-card-section.q-pt-none.q-pb-sm
      q-list
        q-item.q-px-sm
          PartAvatar(:user="getMyprofileAvatar(myprofile)",size="2.5rem")

          q-item-section
            q-form
              q-input(name="text",type="textarea",outlined,v-model="v$.text.$model",:error="v$.text.$error",:placeholder="$t('fields.text')")
                template(v-slot:error)
                  // span(v-if="v$.text.required && v$.text.required.$invalid") {{ $t('errors.required', [$t('fields.text')]) }}
                  span(v-if="v$.text.maxLength && v$.text.maxLength.$invalid") {{ $t('errors.maxLength', [$t('fields.text'), v$.text.maxLength.$params.max]) }}

              template(v-if="dialogs.comment && !dialogs.comment.id")
                q-file.q-mb-md.full-width(dense,multiple,use-chips,v-model="uploadFiles",max-files="1",:label="$t('Attached Image Files')",:filter="checkUploadImageFile",@rejected="onRejected",style="max-width: calc(100vw - 5rem - 2rem - 2rem)")
                  template(v-slot:prepend)
                    q-icon(name="fas fa-paperclip")

    q-card-section.row.q-pt-none
      q-space
      template(v-if="dialogs.comment && dialogs.comment.id")
        q-btn(rounded,unelevated,,color="primary",:icon="$t('icons.update')",:label="$t('Update')",:disabled="v$.$invalid || !v$.$dirty || (post.text === '' && uploadFiles.length ===0)",@click="onSubmit")
      template(v-else)
        q-btn(rounded,unelevated,,color="primary",:icon="$t('icons.comment')",:label="$t('Comment')",:disabled="v$.$invalid || (post.text === '' && uploadFiles.length ===0)",@click="onSubmit")
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

import { nl2br, safeText, safeHtml, textToLink, formatDateNow, formatNumber, onStampIntersection, onStampInterval, /*loadOptionsColor,*/ checkUploadImageFile, getMyprofileAvatar } from 'src/utils/common'

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

    const parentPost = reactive({
      // text: String('')
    })

    const post = reactive({
      text: String('')
    })

    const initialPost = Object.assign({}, post)
    const defaultPost = Object.assign({}, post)

    const rules = {
      text: {
        // required,
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
      if (dialogs.comment.id) {
        json = await getData(`/posts/${dialogs.comment.id}`)
        if (json && json._id) {
          for (let key in json) {
            post[key] = json[key]
            defaultPost[key] = json[key]
          }
        }
      }

      if (!dialogs.comment.parentId) { return }

      json = await getData(`/posts/${dialogs.comment.parentId}`)
      if (json && json._id) {
        for (let key in json) {
          parentPost[key] = json[key]
        }
      }

      if (parentPost.PostedBy.avatarId) {
        await loadImageTo(`/users/${parentPost.PostedBy.id}/image`, `avatar-${parentPost.PostedBy.avatarId}`, `avatar-${parentPost.PostedBy.avatarId}`, `loading-${parentPost.PostedBy.avatarId}`)
      }
    }

    const onHide = () => {
      dialogs.comment.id = null
      dialogs.comment.parentId = null
      dialogs.comment.show = false
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
        if (!dialogs.comment.id) {
          json = await postData(`/posts/${parentPost._id}/comments`, post)
        } else {
          json = await patchData(`/posts/${dialogs.comment.id}`, post)
        }
      } catch (err) {
        console.log(err)
        message = 'Failed Post'

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
        if (!dialogs.comment.id) {
          states.latest.action = 'comment'
          states.latest.id = dialogs.comment.parentId
          states.latest.opts = {
            id: json._id
          }
        } else {
          states.latest.action = 'update'
          states.latest.id = json._id
        }

        updated()

        dialogs.comment.id = null
        dialogs.comment.parentId = null
        dialogs.comment.show = false
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

    const onRejected = (rejectedEntries) => {
      q.notify({
        type: 'negative',
        message: nl2br(t('Rejected Upload File Contains', [rejectedEntries.length]))
      })
    }

    const updated = () => {
      context.emit('updated')
    }

    return {
      dialog,
      dialogs,
      states,
      props,
      parentPost,
      safeHtml, textToLink,
      formatDateNow,
      formatNumber,
      onStampIntersection,
      getMyprofileAvatar,
      post, v$,
      checkUploadImageFile, onRejected,
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
