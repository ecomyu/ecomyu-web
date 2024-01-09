<template lang="pug">
PartToolbar
PartNavbar
PartDrawer
q-page-container
  q-page.justify-top.items-center
    .q-py-lg.q-py-lg-xl
      q-scroll-area.absolute-full(:visible="true")
        q-list.bg-area.overflow-hidden
          template(v-if="notices.length === 0")
            //-.absolute-full.text-center.q-pt-lg {{ $t('No Posted Data', [ $t('Notices') ]) }}
          template(v-else)
            template(v-for="notice in notices",:key="notice._id")
              q-item(v-intersection="onNoticeIntersection",v-if="!notice.hidden",:data-id="notice._id",:class="!notice.saw ? 'bg-white': 'bg-white'")
                template(v-if="notice.action === 'follow'")
                  template(v-if="!notice.PostedBy")
                    q-item-section(avatar,top,style="min-width:2rem;max-width:2rem")
                      q-skeleton(type="QAvatar",style="width:1.5rem;height:1.5rem")
                    q-item-section
                      q-skeleton.q-mb-sm(type="QAvatar",style="width:2.5rem;height:2.5rem")
                      q-item-label
                        q-skeleton(type="text")
                  template(v-else)
                    .absolute-top-right.q-mt-sm.q-mr-md
                      span.text-caption(v-intersection="onStampIntersection",:data-date="notice.postedAt",v-html="formatDateNow(notice.postedAt)")
                      q-tooltip.q-mr-none(:hide-delay="1000",:offset="[0,20]",self="bottom right") {{ formatDateLocal(notice.postedAt) }}
                    q-item-section(avatar,top,style="min-width:2rem;max-width:2rem")
                      q-icon(name="fas fa-bell",color="info")
                    q-item-section(:clickable="notice.postId",@click="onClick(notice)")
                      q-item-section.q-mb-sm(avatar)
                        PartAvatar(:user="notice.PostedBy",size="2.5rem")
                      q-item-section
                        q-item-label(v-html="getPhrase(notice)")
                template(v-else-if="notice.action === 'post' || notice.action === 'like' || notice.action === 'comment' || notice.action === 'reference'")
                  template(v-if="!notice.PostedBy")
                    q-item-section(avatar,top,style="min-width:2rem;max-width:2rem")
                      q-skeleton(type="QAvatar",style="width:1.5rem;height:1.5rem")
                    q-item-section
                      q-skeleton.q-mb-sm(type="QAvatar",style="width:2.5rem;height:2.5rem")
                      q-item-label
                        q-skeleton(type="text")
                  template(v-else)
                    .absolute-top-right.q-mt-sm.q-mr-md
                      span.text-caption(v-intersection="onStampIntersection",:data-date="notice.postedAt",v-html="formatDateNow(notice.postedAt)")
                      q-tooltip.q-mr-none(:hide-delay="1000",:offset="[0,20]",self="bottom right") {{ formatDateLocal(notice.postedAt) }}
                    q-item-section(avatar,top,style="min-width:2rem;max-width:2rem")
                      q-icon(name="fas fa-bell",color="info")
                    q-item-section(:clickable="notice.postId",@click="onClick(notice)")
                      q-item-section.q-mb-sm(avatar)
                        PartAvatar(:user="notice.PostedBy",size="2.5rem")
                      q-item-section
                        q-item-label(v-html="getPhrase(notice)")
              q-separator

          q-item-section(v-if="noticesCount > notices.length")
            q-item.self-center
              q-btn.q-px-lg(rounded,unelevated,color="info",clickable,@click="load()") {{ $t('More Read') }}
</template>

<script>
import { defineComponent, onMounted, inject, reactive, ref, computed, watch, nextTick } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar, copyToClipboard } from 'quasar'

import { wait, nl2br, safeHtml, stripTags, formatDateNow, formatDateLocal, formatNumber, onStampIntersection, onStampInterval, like, getNoticePhrase } from '../utils/common'

import { useMyProfile } from 'src/stores/myprofile'

import { getData, postData, deleteData, loadImageTo } from 'src/utils/api'

import PartToolbar from 'src/components/PartToolbar.vue'

import PartDrawer from 'src/components/PartDrawer.vue'

import PartNavbar from 'src/components/PartNavbar.vue'

import PartAvatar from 'src/components/PartAvatar.vue'

export default defineComponent({
  components: {
    PartToolbar,
    PartDrawer,
    PartNavbar,
    PartAvatar
  },
  inject: ['router', 'states', 'onReload', 'dialogs', 'myprofile'],
  setup() {
    const { t } = useI18n()

    const q = useQuasar()

    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const onReload = inject('onReload')

    const storeMyProfile = useMyProfile()
    // myprofile = storeToRefs(storeMyProfile)
    const myprofile = inject('myprofile')

    const notices = ref({})

    const noticesCount = ref(0)
    let noticesFilters, noticesCountQuery, noticesQuery

    watch(() => onReload.value, async (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        onReload.value = false

        reload()
      }
    })

    onMounted(async () => {
      reload()
    })

    const reload = async () => {
      if (!states.auth || !states.auth.authStatus || (states.auth.authStatus !== 'authenticated' && states.auth.authStatus !== 'unauthenticated')) {
        nextTick(async () => {
          setTimeout(()=> {
            reload()
            return
          }, 300)
        })
      } else {
        await storeMyProfile.refresh()
      }

      q.loading.show()

      notices.value = []

      try {
        // noticesCount.value = 0
        noticesCount.value = await getData(`/notices/count`)
      } catch (e) {
        console.log(e)
      }

      nextTick(async () => {
        setTimeout(async ()=> {
          await load()
        }, 300)
      })

    }

    const load = async () => {
      q.loading.show()

      let nextNoticesFilters = []

      if (noticesCount.value > 0 && noticesCount.value > notices.value.length) {
        if (notices.value.length > 0) {
          const lastNotice = notices.value[notices.value.length - 1]
          if (lastNotice && lastNotice.postedAt) {
            nextNoticesFilters.push({
              _id: {
                $ne: `ObjectId:('${lastNotice._id}')`
              }
            })
            nextNoticesFilters.push({
              postedAt: {
                $lte: `Date:('${lastNotice.postedAt}')`
              }
            })
          }
        }
      }

      noticesQuery = new URLSearchParams()
      if (nextNoticesFilters.length > 0) {
        noticesQuery.set('filter', JSON.stringify({ $and: nextNoticesFilters }))
      }

      noticesQuery.set('limit', 15)
      noticesQuery.set('sort', '-postedAt')

      let arr = []
      try {
        arr = await getData(`/notices?${noticesQuery.toString()}`)
      } catch (e) {
        console.log(e)
      }

      if (arr && Array.isArray(arr)) {
        for (const row of arr) {
          try {
          } catch (e) {
            console.log(e)
          }

          notices.value.push(row)
        }
      }

      q.loading.hide()
    }

    const onNoticeIntersection = async (entry) => {
      if (!entry.isIntersecting || entry.isVisibled) {
        return
      }
      entry.isVisibled = true

      let notice = notices.value.find((row) => {
        return String(row._id) === String(entry.target.dataset.id)
      })
      if (notice.visibled || notice.PostedBy) {
        return
      }
      notice.visibled = true

      let data = await getData(`/notices/${notice._id}`)

      if (data._id) {
        notice = Object.assign(notice, data)

        if (!notice.saw) {
          await postData(`/notices/${notice._id}/saw`)

          setTimeout(()=> {
            nextTick(async () => {
              if (states.counter.notices > 0) {
                states.counter.notices--
              }
              notice.saw = true
            })
          }, 300)
        }
      } else {
        notice.hidden = true
      }
    }

    const getPhrase = (notice) => {
      return getNoticePhrase(t, notice)
    }

    const onClick = (notice) => {
      if (notice.action === 'post' || notice.action === 'like' || notice.action === 'reference' || notice.action === 'comment') {
        dialogs.single.id = notice.postId
        dialogs.single.show = true
      } else if (notice.action === 'follow') {
        router.push(`/@${notice.PostedBy.id}`)
      }
    }
    return {
      noticesCount,
      notices,
      reload, load,
      formatDateNow,
      formatDateLocal,
      formatNumber,
      onStampIntersection,
      onNoticeIntersection,
      getPhrase,
      onClick
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
