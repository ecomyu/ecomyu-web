<template lang="pug">
q-list.full-width
  q-item.q-pa-md(clickable,@click="onShowUser(user)")
    PartAvatar(:user="user",size="3rem",popup="true")

    q-item-section
      q-item-label
        .text-subtitle2 {{ user.handle }}
        .text-caption @{{ user.id }}
          q-badge.q-ml-xs(v-if="user.isFollowed",color="positive") {{ $t('IsFollowed') }}

    q-item-section(side)
      template(v-if="myprofile && myprofile._id.value === user._id")
        //-q-btn(rounded,color="secondary",:label="$t('Yourself')")
      template(v-else)
        template(v-if="states.auth.authStatus === 'authenticated'")
          .row
            q-btn.q-mr-sm.q-px-sm(rounded,@click.capture.stop="user.menuShowing = !!!user.menuShowing",:icon="$t('icons.dots-vertical')")
              q-menu(v-model="user.menuShowing",auto-close)
                q-list
                  template(v-if="!user.isBlocked")
                    q-item(clickable,@click="onBlock(user)")
                      q-item-section(avatar)
                        q-icon(:name="$t('icons.block')")
                      q-item-section {{ $t('Block') }}
                  template(v-else)
                    q-item(clickable,@click="onBlock(user)")
                      q-item-section(avatar)
                        q-icon(:name="$t('icons.unblock')")
                      q-item-section {{ $t('Unblock') }}
            template(v-if="!user.isFollowing")
              q-btn(rounded,color="primary",:label="$t('Follow')",@click.capture.stop="onFollow(user)",:disabled="user.isBlocked")
            template(v-else)
              q-btn(rounded,outline,color="primary",:label="$t('Following')",@click.capture.stop="onFollow(user)")
</template>

<script>
import { defineComponent, onMounted, ref, nextTick, toRef, inject } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import { wait, nl2br, safeHtml, stripTags, formatDateNow, formatNumber, onStampIntersection, onStampInterval, follow, block } from '../utils/common'

import { getData, postData, deleteData, loadImageTo } from '../utils/api'

import PartAvatar from 'src/components/PartAvatar.vue'

export default defineComponent({
  props: ['user'],
  components: {
    PartAvatar
  },
  inject: ['router', 'dialogs', 'states', 'myprofile'],
  setup(props, context) {
    const router = inject('router')

    const { t } = useI18n()

    const q = useQuasar()

    const dialogs = inject('dialogs')

    const states = inject('states')

    const myprofile = inject('myprofile')

    /*
    onMounted(async () => {
      reload()
    })

    const reload = async () => {
      load()
    }

    const load = async () => {
    }
    */

    const onShowUser = async (user) => {
      if (!user.deleted) {
        router.push(`/@${user.id}`)
      }
    }

    const onFollow = async (user) => {
      if (user.isFollowing) {
        q.dialog({
          message: nl2br(t('Confirm UnFollow')),
          ok: {
            label: t('UnFollow'),
          },
          cancel: {
            flat: true,
            label: t('Cancel'),
          },
          html: true,
          persistent: true
        }).onOk(() => {
          follow(user)

          setTimeout(()=> {
            nextTick(async () => {
              reload()

              updated()
            })
          }, 200)
        })
      } else {
        follow(user)

        setTimeout(()=> {
          nextTick(async () => {
            reload()

            updated()
          })
        }, 200)
      }
    }

    const onBlock = async (user) => {
      block(user)
      updated()
    }

    const updated = () => {
      context.emit('updated')
    }

    const onClickedTo = (url) => {
      if (url === router.currentRoute.value.path) {
        onReload.value = true
      } else {
        router.push(url)
      }
    }

    return {
      onClickedTo,
      onShowUser,
      onFollow,
      onBlock
    }
  }
})
</script>
