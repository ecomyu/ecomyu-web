<template lang="pug">
q-dialog(ref="dialog",full-width,v-model="props.params.show",@before-hide="onHide")
  q-card
    q-card-section.row.q-pb-none
      q-toolbar.q-px-none
        q-btn(flat,round,dense,:icon="$t('icons.back')",v-close-popup)
    q-card-section.q-py-sm
      .row.justify-center
        .col-2.col-xs-6.col-sm-4.col-md-2
          q-img(:ratio="1",:src="imageUrl",style="max-width: 50vw; max-height: 50vh; margin: auto;")
            template(v-slot:default)
              template(v-if="isImage")
                img.absolute-center.full-width(:class="`avatar-${myprofile.avatarId.value}`",src="../assets/null.png",style="object-fit: cover;")
                q-inner-loading.full-width(size="xs",:showing="imageUrl",:class="`loading-avatar-${myprofile.avatarId.value}`")
              template(v-else)
                .full-width.full-height
                  .absolute-center.text-center
                    q-avatar(size="xl",:color="selectedColor && selectedColor.value ? selectedColor.value : 'grey-6'",text-color="white")
                      span {{ myprofile.handle.value ? myprofile.handle.value.substr(0, 1) : $t('Unnamed Sign') }}
                    q-select.q-mt-sm(outlined,borderless,name="color",v-model="selectedColor",:options="OptionsColor",:label="$t('fields.myprofile.avatarColor')",style="width:10rem;",:bg-color="states.isDark ? 'black' : 'white'")
                      template(v-slot:option="scope")
                        q-item.q-px-xs.q-py-none(v-bind="scope.itemProps",style="min-height:2rem;")
                          q-item-section.q-pa-none(avatar,style="min-width:1rem;")
                            q-skeleton(type="rect",animation="none",:class="'bg-' + scope.opt.value",style="width:1rem;height:1rem;")
                          q-item-section(avatar)
                            span.text-caption.q-ml-sm {{ scope.opt.label }}
                    .q-mt-md.text-caption {{ $t('No Image') }}

          .text-center
            q-file.q-pt-sm(outlined,dense,v-model="image",:label="$t('Upload User Image')",@update:model-value="updateImage()",:filter="checkUploadImageFile",@rejected="onRejected")
            q-btn(flat,v-if="isImage",:label="$t('Delete User Image')",@click="deleteImage()")

    q-card-section.row.q-pt-none
      q-space
</template>

<script>
import { defineComponent, inject, reactive, ref, toRefs, watch, nextTick } from 'vue'

import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import useVuelidate from '@vuelidate/core'
import { required, maxLength, helpers } from '@vuelidate/validators'

import { useMyProfile } from 'stores/myprofile'

// import dayjs from 'dayjs'

import { getData, patchData, deleteData, uploadFile, loadImageTo } from 'src/utils/api'

import { nl2br, loadOptionsColor, checkUploadImageFile } from 'src/utils/common'

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

    const isImage = ref(false)
    const image = ref(null)
    const imageUrl = ref('')

    const OptionsColor = loadOptionsColor()

    const selectedColor = ref()
    let avatarColor

    watch(() => props.params.show, async (newVal, oldVal) => {
      if (newVal) {
        reload()
      }
    })

    watch(() => selectedColor.value, async (newVal, oldVal) => {
      if (!oldVal || newVal.value !== oldVal.value) {
        avatarColor = newVal

        if (!oldVal) { return }

        const ret = await patchData(`/myprofile`, {
          avatarColor: avatarColor.value
        })

        updated()
      }
    })

    const reload = async () => {
      await storeMyProfile.refresh()

      load()
    }

    const load = async () => {
      // await storeMyProfile.refresh()

      // data.id = myprofile.id.value

      if (myprofile.avatarId.value) {
        isImage.value = true
        setTimeout(()=> {
          nextTick(async () => {
            await loadImageTo(`/user/${myprofile._id.value}/avatar`, `avatar-${myprofile.avatarId.value}`, `avatar-${myprofile.avatarId.value}`, `loading-avatar-${myprofile.avatarId.value}`)
          })
        }, 200)
      }

      if (myprofile.avatarColor.value) {
        const findColor = OptionsColor.find((option) => {
          return option.value === myprofile.avatarColor.value
        })
        if (findColor) {
          selectedColor.value = findColor
        } else {
          selectedColor.value = OptionsColor[0]
        }
      } else {
        selectedColor.value = OptionsColor[0]
      }
    }

    const updateImage = async () => {
      q.loading.show()

      let message

      try {
        let formData = new FormData()

        formData.append(`image`, image.value)

        let fileName = image.value.name
        let fileType = image.value.type

        let res = await uploadFile(`/myprofile/avatar`, formData, fileName, fileType)

        isImage.value = true
        imageUrl.value = URL.createObjectURL(image.value)
      } catch (err) {
        console.log(err)

        message = 'Failed Upload Avatar'

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
        updated()
        nextTick(() => {
          image.value = null
        })
      } else {
        nextTick(() => {
          q.dialog({
            title: t('Error'),
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

      const oldAvatarId = myprofile.avatarId.value

      await deleteData(`/myprofile/avatar`).then((json) => {
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

        message = 'Failed Delete Avatar'

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
        updated()
      } else {
        nextTick(() => {
          q.dialog({
            title: t('Error'),
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

    const onHide = () => {
      dialogs.changeAvatar.show = false
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
      states,
      props,
      reload, load,
      isImage, image, imageUrl,
      selectedColor, OptionsColor,
      updateImage, deleteImage,
      checkUploadImageFile, onRejected,
      onHide,
      updated
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
