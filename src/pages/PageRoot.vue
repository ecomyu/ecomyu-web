<template lang="pug">
PartToolbar
PartNavbar
PartDrawer
q-page-container
  q-page.justify-top.items-center
    .q-py-lg.q-py-lg-xl
      q-scroll-area.absolute-full(:visible="true")
        template(v-if="posts.length === 0")
          //-.absolute-full.text-center.q-pt-lg {{ $t('No Posted Data', [ $t('Posts') ]) }}
        template(v-else)
          q-list.full-width.bg-area
            PartPostRecursive(:posts="posts",:depth="1",:level="1")

            q-item-section(v-if="postsCount > posts.length")
              q-item.self-center
                q-btn.q-px-lg(rounded,unelevated,color="info",clickable,@click="load()") {{ $t('More Read') }}

      q-page-sticky(position="bottom-right",:offset="[18, 24]")
        q-btn(fab,unelevated,:icon="$t('icons.post')",color="secondary",@click="!myprofile._id.value ? notifyNeedLogin() : dialogs.post.show = true",:style="!myprofile._id.value ? 'opacity: .5' : null")
</template>

<script>
import { defineComponent, onMounted, inject, reactive, ref, computed, watch, nextTick } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar, useMeta, copyToClipboard, debounce } from 'quasar'

import { clone, compare, wait, nl2br, safeHtml, stripTags, formatDateNow, formatNumber, onStampIntersection, onStampInterval } from '../utils/common'

import { useMyProfile } from 'src/stores/myprofile'

import { getData, postData, deleteData, loadImageTo } from 'src/utils/api'

import PartDrawer from 'src/components/PartDrawer.vue'

import PartNavbar from 'src/components/PartNavbar.vue'

import PartToolbar from 'src/components/PartToolbar.vue'

import PartPostRecursive from 'src/components/PartPostRecursive.vue'

export default defineComponent({
  components: {
    PartDrawer,
    PartNavbar,
    PartToolbar,
    PartPostRecursive
  },
  inject: ['router', 'states', 'dialogs', 'myprofile', 'isSearch', 'keyword', 'onReload'],
  setup() {
    const { t } = useI18n()

    const q = useQuasar()

    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const storeMyProfile = useMyProfile()
    // myprofile = storeToRefs(storeMyProfile)
    const myprofile = inject('myprofile')

    const isSearch = inject('isSearch')

    const onReload = inject('onReload')

    const keyword = inject('keyword')

    const posts = ref({})

    let beforePostsFilters = null

    let reloading = false
    let loading = false

    const postsCount = ref(0)
    let postsFilters, postsCountQuery, postsQuery

    let processing = false

    watch(() => onReload.value, async (newVal, oldVal) => {
      if (!newVal) {
        processing = false
      } else {
        processing = true

        if (states.latest.action && states.latest.id) {
          if (states.latest.id) {
            const post = posts.value.find((row) => {
              return row._id === states.latest.id
            })
            if (post) {
            } else {
              if (states.latest.action === 'post' || states.latest.action === 'reference') {
                posts.value.unshift({ _id: states.latest.id })
              }
            }
          }
        } else {
          reload(true)
        }

        setTimeout(()=> {
          nextTick(() => {
            onReload.value = false

            processing = false

            states.latest.action = null
            states.latest.id = null
          })
        }, 300)
      }
    })

    useMeta(() => {
      return {
        title: t('Top'),
        meta: {
          description: {
            name: 'description',
            content: t('logo') + 'のホーム'
          }
        }
      }
    })

    onMounted(async () => {
      if (router.currentRoute.value.query) {
        if (router.currentRoute.value.query.hashtag) {
          const _keyword = '#' + router.currentRoute.value.query.hashtag
          if (keyword.value !== _keyword) {
            keyword.value = _keyword
            return
          }
        }
      }
      reload()
    })

    const reload = async (force) => {
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

      if (reloading) { return }
      reloading = true

      q.loading.show()

      postsFilters = [{
        deleted: { $ne: true }
      }]

      let useTag = false
      let tags = []

      let useUserId = false
      let userIds = []

      if (keyword.value.trim() !== '') {
        const keywords = keyword.value.split(/(\s|\t)+/).filter((str) => {
          return str.trim() !== ''
        })

        if (keywords.length > 0) {
          const keywordsFilter = []
          for (const str of keywords) {
            if (str.indexOf('#') === 0) {
              useTag = true
              if (str.length > 1) {
                tags.push(str.substr(1))
              }
            } else if (str.indexOf('@') === 0) {
              useUserId = true
              if (str.length > 1) {
                userIds.push(str)
              }
            } else {
              keywordsFilter.push({
                text: {
                  $regex: `${str}`
                }
              })
            }
          }

          if (keywordsFilter.length > 0) {
            postsFilters.push({ $and: keywordsFilter })
          }
        }
      }

      if (useTag && tags.length > 0) {
        postsFilters.push({
          tags: {
            $in: tags
          }
        })
      }

      if (useUserId && userIds.length > 0) {
        try {
          const user = await getData(`/users/${userIds[0].substr(1)}`)
          if (user) {
            keyword.value = ''
            router.push(`/@${userIds[0].substr(1)}`)
          }
        } catch (e) {
          //
        }
        q.loading.hide()
        reloading = false
        return
      }

      /*
      keywordsFilter.push({
        tags: {
          $in: [str.substr(1)]
        }
      })
      */

      try {
        if (!force && compare(beforePostsFilters, postsFilters)) {
          q.loading.hide()
          reloading = false
          return
        }
      } catch (e) {
        //
      }

      posts.value = []
      postsCount.value = 0

      beforePostsFilters = clone(postsFilters)

      nextTick(async () => {
        setTimeout(async ()=> {
          postsCountQuery = new URLSearchParams()
          if (postsFilters.length > 0) {
            postsCountQuery.set('filter', JSON.stringify({ $and: postsFilters }))
          }

          try {
            postsCount.value = await getData(`/posts/count?${postsCountQuery.toString()}`)
          } catch (e) {
            console.log(e)
          }

          await load()
        }, 300)
      })

      reloading = false
    }

    const load = async () => {
      if (loading) { return }
      loading = true

      q.loading.show()

      let nextPostsFilters = postsFilters.concat()

      if (postsCount.value > 0 && postsCount.value > posts.value.length) {
        if (posts.value.length > 0) {
          const lastPost = posts.value[posts.value.length - 1]

          if (lastPost && lastPost.postedAt) {
            nextPostsFilters.push({
              _id: {
                $ne: `ObjectId:('${lastPost._id}')`
              }
            })
            nextPostsFilters.push({
              postedAt: {
                $lte: `Date:('${lastPost.postedAt}')`
              }
            })
          }
        }
      }

      postsQuery = new URLSearchParams()
      if (nextPostsFilters.length > 0) {
        postsQuery.set('filter', JSON.stringify({ $and: nextPostsFilters }))
      }

      postsQuery.set('limit', 15)
      /*
      if (posts.value.length > 0) {
        postsQuery.skip = posts.value.length
      }
      */
      postsQuery.set('sort', '-postedAt')

      let arr = []
      try {
        arr = await getData(`/posts?${postsQuery.toString()}`)
      } catch (e) {
        console.log(e)
      }

      if (arr && Array.isArray(arr)) {
        for (const row of arr) {
          row.hasImage = true
          row.loadedImage = false
          try {
            // post.likesCount = await getData(`/posts/${row._id}/likes/count`)
          } catch (e) {
            console.log(e)
          }

          posts.value.push(row)
        }
      }

      q.loading.hide()

      loading = false
    }

    const notifyNeedLogin = () => {
      q.notify({
        color: 'accent',
        message: nl2br(t('Need Signup'))
      })
    }

    return {
      safeHtml, stripTags,
      reload, load,
      postsCount,
      posts,
      formatDateNow,
      formatNumber,
      onStampIntersection,
      // onKeyImageIntersection,
      notifyNeedLogin,
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
