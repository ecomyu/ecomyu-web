<template lang="pug">
PartNavbar
PartDrawer
q-page-container
  q-page.justify-top.items-center
    .q-py-lg.q-py-lg-xl
      q-scroll-area.absolute-full(v-if="data.id",:visible="true")
        q-toolbar.q-px-xs.absolute-top(style="z-index:10000")
          q-item.no-padding(dark)
            PartMenu
          q-space
          q-item.no-padding(dark)
            template(v-if="states.auth.authStatus === 'authenticated' && myprofile")
              template(v-if="myprofile._id.value !== data._id")
                q-btn.q-mr-sm(round,unelevated,:icon="$t('icons.dots-vertical')")
                  q-menu(auto-close)
                    q-list
                      template(v-if="!data.isBlocking")
                        q-item(clickable,@click="onBlock()")
                          q-item-section(avatar)
                            q-icon(:name="$t('icons.block')")
                          q-item-section {{ $t('Block') }}
                      template(v-else)
                        q-item(clickable,@click="onBlock()")
                          q-item-section(avatar)
                            q-icon(:name="$t('icons.unblock')")
                          q-item-section {{ $t('Unblock') }}
                      q-separator
                      q-item(clickable,@click="onCopyUserLink()")
                        q-item-section(avatar)
                          q-icon(:name="$t('icons.copyLink')")
                        q-item-section {{ $t('CopyLink') }}

              template(v-if="myprofile._id.value === data._id")
                q-btn.q-mr-sm(round,unelevated,:icon="$t('icons.dots-vertical')")
                  q-menu(auto-close)
                    q-list
                      q-item(clickable,@click="dialogs.editMyProfile.show = true")
                        q-item-section(avatar)
                          q-icon(:name="$t('icons.editProfile')")
                        q-item-section {{ $t('Edit MyProfile') }}
                      q-separator
                      q-item(clickable,@click="dialogs.changeId.show = true")
                        q-item-section(avatar)
                          q-icon(:name="$t('icons.id')")
                        q-item-section {{ $t('Change Id') }}
                      q-separator
                      q-item(clickable,@click="onCopyUserLink()")
                        q-item-section(avatar)
                          q-icon(:name="$t('icons.copyLink')")
                        q-item-section {{ $t('CopyLink') }}
                      q-separator
                      q-item(clickable,@click="dialogs.deregistMyProfile.show = true")
                        q-item-section(avatar)
                          q-icon.text-negative(:name="$t('icons.deregist')")
                        q-item-section
                          .text-negative {{ $t('Deregist MyProfile') }}
            template(v-else)
              q-btn.q-mr-sm(round,unelevated,@click.capture.stop="onCopyUserLink()",:icon="$t('icons.copyLink')")

        PartBg.full-width(:user="data",height="10rem")
        .absolute-center(v-if="myprofile && myprofile._id.value === data._id",style="top:5rem;width:100%")
          q-btn.bg-transparent.full-width(flat,icon="fas fa-camera",style="color:rgba(255,255,255,0.5);height:10rem;width:100%",size="md",@click="dialogs.changeBg.show = true")

        q-list
          q-item.q-pb-none
            q-item-section
              .absolute(style="top:-3.5rem")
                PartAvatar(:user="data",size="6.25rem")
              .absolute(v-if="myprofile && myprofile._id.value === data._id",style="top:-3.5rem")
                q-btn.bg-transparent(round,flat,icon="fas fa-camera",style="color:rgba(255,255,255,0.5);padding:2.4rem;",size="md",@click="dialogs.changeAvatar.show = true")

            template(v-if="data.id && data._id && !data.deleted")
              q-item-section(side top)
                template(v-if="myprofile && myprofile._id.value === data._id")
                template(v-else)
                  div(v-if="states.auth.authStatus === 'authenticated'")
                    template(v-if="!data.isFollowing")
                      q-btn(rounded,color="primary",:label="$t('Follow')",@click="onFollow()",:disabled="data.isBlocking || data.isBlocked")
                    template(v-else)
                      q-btn(rounded,outline,color="primary",:label="$t('Following')",@click="onFollow()")

          q-item.q-pt-none
            q-item-section
              q-item-label
                template(v-if="data.deleted")
                  .text-subtitle1.text-grey-8 {{ $t('Deleted User Id') }}
                  .text-body1.text-grey-8 @{{ data.id }}
                template(v-else)
                  .text-subtitle1.text-weight-bold {{ data._id ? data.handle : $t('No User') }}
                  .text-body1 @{{ data.id }}
                  template(v-if="data.url")
                    .text-caption
                      q-icon.q-mr-sm(name="fas fa-link")
                      a(:href="data.url",target="_blank") {{ shortUrl(data.url) }}
                  q-badge.q-ml-xs(v-if="data.isFollowed",color="positive") {{ $t('IsFollowed') }}
              pre.full-width.text-body2(v-html="safeHtml(textToLink(data.description))",style="white-space: pre-wrap;")

        template(v-if="data.deleted")
          .row.q-px-md.q-pt-none
            .text-caption.text-grey-7 {{ $t('Deleted User') }}
        template(v-else-if="data._id")
          .row.q-px-md.q-pt-none.q-mb-md
            .column.text-dark
              q-btn(flat,:label="$t('Followings')",@click="following")
                q-badge.q-ml-sm(color="dark",rounded,outline) {{ formatNumber(data.followingsCount, 1) }}
            .column.text-dark
              q-btn(flat,:label="$t('Followers')",@click="follower")
                q-badge.q-ml-sm(color="dark",rounded,outline) {{ formatNumber(data.followersCount, 1) }}
          template(v-if="data.isBlocking")
            .q-py-lg.text-center.text-caption {{ $t('Blocking User') }}
          template(v-else-if="data.isBlocked")
            .q-py-lg.text-center.text-caption {{ $t('Blocked User') }}
          template(v-else)
            .row.q-px-md.q-gutter-md
              q-tabs(v-model="tab",dense,align="left",inline-label)
                q-tab(name="posts",:label="$t('List Of Posts')",:icon="$t('icons.post')")
                  q-badge.q-ml-sm(v-if="data.postsCount > 0",color="primary",rounded,outline) {{ formatNumber(data.postsCount, 1) }}
                //-q-tab(name="references",:label="$t('List Of References')",:icon="$t('icons.reference')")
                  q-badge.q-ml-sm(v-if="data.referencesCount > 0",color="primary",rounded,outline) {{ formatNumber(data.referencesCount, 1) }}
                q-tab(name="likes",:label="$t('List Of Likes')",:icon="$t('icons.like')")
                  q-badge.q-ml-sm(v-if="data.likesCount > 0",color="primary",rounded,outline) {{ formatNumber(data.likesCount, 1) }}

          template(v-if="!data.isBlocking && !data.isBlocked")
          template(v-if="posts.length > 0")
            q-list.bg-area
              PartPostRecursive(:posts="posts",:depth="1",:level="1",:options="{showParent: true}")

              q-item-section(v-if="(tab === 'posts' && data.postsCount > posts.length) || (tab === 'likes' && data.likesCount > 0)")
                q-item.self-center
                  q-btn.q-px-lg(rounded,unelevated,color="info",clickable,@click="loadPosts()") {{ $t('More Read') }}

    template(v-if="myprofile && myprofile._id.value === data._id")
      q-page-sticky(position="bottom-right",:offset="[18, 24]")
        q-btn(fab,unelevated,:icon="$t('icons.post')",color="secondary",@click="dialogs.post.show = true",:disabled="!myprofile._id.value")
</template>

<script>
import { defineComponent, onMounted, inject, reactive, ref, computed, watch, nextTick } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar, useMeta } from 'quasar'

import { useMyProfile } from 'src/stores/myprofile'

import { getData, /* uploadFile, loadImageTo */ } from 'src/utils/api'

import { clone, wait, nl2br, safeHtml, safeText, stripLinebreaks, textToLink, shortUrl, formatDateNow, formatNumber, onStampIntersection, onStampInterval, /*loadOptionsColor, checkUploadImageFile,*/ follow, block, copyUserLink } from 'src/utils/common'

import PartPostRecursive from 'src/components/PartPostRecursive.vue'

import PartMenu from 'src/components/PartMenu.vue'

import PartDrawer from 'src/components/PartDrawer.vue'

import PartNavbar from 'src/components/PartNavbar.vue'

import PartBg from 'src/components/PartBg.vue'
import PartAvatar from 'src/components/PartAvatar.vue'

export default defineComponent({
  components: {
    PartMenu,
    PartDrawer,
    PartNavbar,
    PartPostRecursive,
    PartBg,
    PartAvatar
  },
  inject: ['router', 'states', 'dialogs', 'onReload', 'myprofile'],
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

    const area = ref(null)

    const data = reactive({
      _id: String(''),
      id: String(''),
      handle: String(''),
      description: String(''),
      url: String(''),
      bgColor: String(''),
      bgId: String(''),
      avatarColor: String(''),
      avatarId: String(''),
      isBlocking: Boolean(false),
      isBlocked: Boolean(false),
      isFollowed: Boolean(false),
      followingsCount: Number(0),
      isFollowing: Boolean(false),
      followersCount: Number(0),
      postsCount: Number(0),
      // referencesCount: Number(0),
      likesCount: Number(0),
      active: Boolean(false),
    })

    let defaultData = Object.assign({}, data)

    const posts = ref([])

    let reloading = false
    let loading = false

    let postsFilters, postsCountQuery, postsQuery

    const tab = ref('posts')

    let processing = false

    watch(() => router.currentRoute.value.params.id, async (newVal, oldVal) => {
      reload()
    })

    watch(() => onReload.value, async (newVal, oldVal) => {
      if (newVal && !processing) {
        processing = true

        if (states.latest.action && states.latest.id) {
          const post = posts.value.find((row) => {
            return row._id === states.latest.id
          })
          if (post) {
          } else {
            if (tab.value === 'posts') {
              if (states.latest.action === 'post' || states.latest.action === 'reference') {
                posts.value.unshift({ _id: states.latest.id })
              }
            }
          }
        } else {
          reload()
        }

        setTimeout(()=> {
          nextTick(() => {
            onReload.value = false

            processing = false

            states.latest.action = null
            states.latest.id = null
          })
        }, 200)
      }
    })

    watch(() => tab.value, async (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
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

      if (reloading) { return }
      reloading = true

      q.loading.show()

      nextTick(async () => {
        setTimeout(async ()=> {
          await load()
        }, 300)
      })

      reloading = false
    }

    const load = async () => {
      if (loading) { return }
      loading = true

      let userId
      if (router.currentRoute.value.path === '/myprofile') {
        userId = myprofile.id.value
      } else {
        userId = router.currentRoute.value.params.id
      }

      for (let key in defaultData) {
        if (data[key]) {
          data[key] = defaultData[key]
        }
      }

      data.id = userId

      try {
        const json = await getData(`/users/${userId}`)
        if (!json || json.deleted) {
          data.deleted = true
        } else if (json && json._id) {
          for (let key in json) {
            if (data[key] !== undefined) {
              data[key] = json[key]
            }
          }

          if (!data.deleted) {
            data.followingsCount = await getData(`/users/${userId}/followings/count`)
            data.followersCount = await getData(`/users/${userId}/followers/count`)

            if (!data.isBlocking && !data.isBlocked) {
              await reloadPosts()
            }
          }
        }
      } catch (e) {
        console.log(e)
      }

      useMeta(() => {
        return {
          title: (data.handle ? safeText(data.handle) : t('No User')) + ' @' + data.id,
          meta: {
            description: {
              name: 'description',
              content: data.description ? stripLinebreaks(data.description) : ''
            }
          }
        }
      })

      q.loading.hide()

      loading = false
    }

    const reloadPosts = async () => {
      q.loading.show()

      posts.value = []

      // data.postsCount = 0
      // data.referencesCount = 0
      // data.likesCount = 0

      data.postsCount = await getData(`/users/${data.id}/posts/count`)
      // data.referencesCount = await getData(`/users/${data.id}/references/count`)
      data.likesCount = await getData(`/users/${data.id}/likes/count`)

      await loadPosts()
    }

    const loadPosts = async () => {
      q.loading.show()

      let url
      let count

      if (tab.value === 'posts') {
        url = `/users/${data.id}/posts`
        count = data.postsCount
      // } else if (tab.value === 'references') {
        // url = `/users/${data.id}/references`
      } else if (tab.value === 'likes') {
        url = `/users/${data.id}/likes`
        count = data.likesCount
      }

      if (count > 0) {
        let postsFilters = []

        if (posts.value.length > 0) {
          const lastPost = posts.value[posts.value.length - 1]

          if (tab.value === 'posts') {
            if (lastPost && lastPost.postedAt) {
              postsFilters.push({
                _id: {
                  $ne: `ObjectId:('${lastPost._id}')`
                }
              })
              postsFilters.push({
                postedAt: {
                  $lte: `Date:('${lastPost.postedAt}')`
                }
              })
            }
          } else if (tab.value === 'likes') {
            if (lastPost && lastPost.postedAt) {
              postsFilters.push({
                _id: {
                  $ne: `ObjectId:('${lastPost._id}')`
                }
              })
              postsFilters.push({
                likedAt: {
                  $lte: `Date:('${lastPost.postedAt}')`
                }
              })
            }
          }
        }

        const postsQuery = new URLSearchParams()
        if (postsFilters.length > 0) {
          postsQuery.set('filter', JSON.stringify({ $and: postsFilters }))
        }

        postsQuery.set('limit', 15)

        if (tab.value === 'posts') {
          postsQuery.set('sort', '-postedAt')
        } else if (tab.value === 'likes') {
          postsQuery.set('sort', '-likedAt')
        }

        await getData(`${url}?${postsQuery.toString()}`).then(async (arr) => {
          if (arr && Array.isArray(arr)) {
            for (let row of arr) {
              row.hasImage = true
              row.loadedImage = false
              try {
                // post.referencesCount = await getData(`/posts/${row._id}/references/count`)
                // post.likesCount = await getData(`/posts/${row._id}/likes/count`)
              } catch (e) {
                console.log(e)
              }

              posts.value.push(row)
            }
          }
        }).catch((err) => {
          console.log(err)
        })
      }

      q.loading.hide()
    }

    const following = async () => {
      dialogs.follow.id = data.id
      dialogs.follow.mode = 'followings'
      dialogs.follow.show = true
    }

    const follower = async () => {
      dialogs.follow.id = data.id
      dialogs.follow.mode = 'followers'
      dialogs.follow.show = true
    }

    const onFollow = async () => {
      const user = clone(data)

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
            })
          }, 200)
        })
      } else {
        follow(user)

        setTimeout(()=> {
          nextTick(async () => {
            reload()
          })
        }, 200)
      }
    }

    const onBlock = async () => {
      const user = clone(data)

      block(user)

      setTimeout(()=> {
        nextTick(async () => {
          reload()
        })
      }, 200)
    }

    const onCopyUserLink = async () => {
      copyUserLink(data)
      q.notify({
        type: 'positive',
        message: nl2br(t('Copied Share Link To Clipboard'))
      })
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
      safeHtml, textToLink,
      data,
      // isImage, image, imageUrl,
      tab,
      reload, load,
      // selectedColor, OptionsColor,
      posts,
      loadPosts,
      shortUrl,
      formatDateNow,
      formatNumber,
      onStampIntersection,
      // onKeyImageIntersection,
      follow,
      following, follower,
      onFollow,
      onBlock,
      onCopyUserLink
    }
  }
})
</script>

<style scoped lang="stylus">
</style>
