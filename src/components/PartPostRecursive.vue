<template lang="pug">
template(v-for="post in posts",:key="post._id")
  template(v-if="post.deleted")
    q-item(style="margin-bottom: 1px;",:class="`indent-${(Number(depth) + Number(post.depth ? post.depth : 0) - Number(rootDepth)) - 1}`")
      q-item.full-width.q-pa-none
        .full-width.q-pa-sm.column
          .row
            .q-ma-xs.full-width.text-caption.text-grey-5 {{ $t('Deleted Post') }}
  template(v-else)
    q-item(v-intersection.once="onPostIntersection(post, depth, level, options)",v-if="!post.hidden",:data-id="post._id",:clickable="!post.isCurrent",@click="onShow(post)",style="margin-bottom: 1px;",:class="[`indent-${(Number(depth) + Number(post.depth ? post.depth : 0) - Number(rootDepth ? rootDepth : 0)) - 1}`, (!post.isAd ? 'bg-white': 'bg-gray-1')]")
      .absolute-top(v-if="post.isCurrent",v-intersection.once="onCurrentIntersection")
        q-icon(color="accent",name="fas fa-feather-pointed",style="top: 0.25rem;left: 0.25rem;")
      template(v-if="!post.PostedBy")
        q-item.full-width.q-pa-none
          q-item-section.q-mt-sm.q-pr-md(avatar,top)
            q-skeleton(type="QAvatar")
          q-item-section
            q-item-label
              q-skeleton(type="text",width="10rem")
            q-skeleton(type="text")
            q-item-section
              q-skeleton(type="QBadge",width="13rem")
      template(v-else)
        PartAvatar(:user="post.PostedBy",size="2.5rem")

        q-item-section
          template(v-if="post.PostedBy.deleted")
            q-item-label.text-grey-6
              span.text-subtitle2(style="font-weight:700;") {{ $t('Deleted User Handle') }}
              span.q-ml-sm.text-caption @{{ post.PostedBy.id }}
          template(v-else)
            q-item-label
              span.text-subtitle2(style="font-weight:700;") {{post.PostedBy && post.PostedBy.handle ? post.PostedBy.handle : $t('No Handle') }}
              span.q-ml-sm.text-caption @{{ post.PostedBy.id }}
              .absolute-top-right.q-mt-sm.q-mr-md
                span.text-caption(v-intersection="onStampIntersection",:data-date="post.postedAt",v-html="formatDateNow(post.postedAt)")
                q-tooltip.q-mr-none(:hide-delay="1000",:offset="[0,20]",self="bottom right") {{ formatDateLocal(post.postedAt) }}
          q-item-label.content.q-my-none(style="margin-top:0 !important")
            //- Parent
            template(v-if="options && options.showParent && post.Parent && !post.deleted")
              template(v-if="post.Parent.deleted")
                q-item.block.q-pa-none.bg-white
                  q-list.rounded-borders(bordered)
                    .full-width.q-pa-sm.column
                      .row
                        .q-ma-xs.full-width.text-caption.text-grey-5 {{ $t('Deleted Post') }}

              template(v-else)
                q-item-section
                  q-item.block.q-pa-none.bg-white(v-intersection.once="onPostIntersection(post.Parent, 1, 1)",:data-id="post.Parent._id",clickable,@click.capture.stop="onShow(post.Parent)",style="margin-bottom: 1px;")
                    q-list.rounded-borders(bordered)
                      template(v-if="!post.Parent.PostedBy")
                        .full-width.q-pa-sm.column
                          .row
                            q-skeleton.inline(type="QAvatar",size="1.5rem")
                            q-skeleton.inline.q-ml-sm(type="text",width="7rem")
                            q-skeleton.inline.q-ml-sm(type="text",width="4rem")

                          q-skeleton(type="text")
                          q-skeleton(type="text")
                      template(v-else)
                        .full-width.q-pa-sm.column.relative-position
                          .row
                            PartAvatar(:user="post.Parent.PostedBy",size="1.5rem")

                            span.text-subtitle2(style="font-weight:700;") {{post.Parent.PostedBy && post.Parent.PostedBy.handle ? post.Parent.PostedBy.handle : $t('No Handle') }}
                            span.q-ml-sm.text-caption @{{ post.Parent.PostedBy.id }}
                            .absolute-top-right.q-mt-sm.q-mr-sm
                              span.text-caption(v-intersection="onStampIntersection",:data-date="post.Parent.postedAt",v-html="formatDateNow(post.Parent.postedAt)")
                              q-tooltip.q-mr-none(:hide-delay="1000",:offset="[0,20]",self="bottom right") {{ formatDateLocal(post.postedAt) }}
                            template(v-if="!post.Parent.deleted")
                              template(v-if="post.Parent.text")
                                pre.q-ma-xs.full-width.text-body2.ellipsis-3-lines(v-html="safeHtml(textToLink(post.Parent.text))")
                            template(v-else)
                              .q-ma-xs.full-width.text-caption.text-grey-5 {{ $t('Deleted Post') }}

                            template(v-if="post.Parent.Files")
                              .full-width.text-center
                                img(v-intersection.once="onImageIntersection",:data-id="post.Parent._id",:data-file_id="post.Parent.Files[0]._id",:class="`image-${post.Parent.Files[0]._id}`",src="../assets/null.png",style="max-width: 100%;max-height: 100%; object-fit: contain; object-position: 50% 50%;")

            //-post
            q-item-section
              template(v-if="!post.deleted")
                template(v-if="post.text")
                  template(v-if="post.isCurrent")
                    pre.q-my-none.full-width.text-body2(v-html="safeHtml(textToLink(post.text))")
                    span.text-caption.text-grey-5(v-if="post.patchedAt") {{ $t('Updated') }}
                  template(v-else)
                    template(v-if="post.expand")
                      pre.q-my-none.full-width.text-body2(v-html="safeHtml(textToLink(post.text))")
                      span.text-caption.text-grey-5(v-if="post.patchedAt") {{ $t('Updated') }}
                      div
                        q-btn.q-mb-sm.q-px-xs(flat,dense,v-if="post.isExpandible",color="info",:label="$t('Less')",icon-right="fas fa-caret-up",@click.capture.stop="post.expand = false")
                    template(v-else)
                      pre.q-my-none.full-width.text-body2.ellipsis-3-lines(v-html="safeHtml(textToLink(post.text))",v-intersection="checkEllipsis",:data-id="post._id")
                      span.text-caption.text-grey-5(v-if="post.patchedAt") {{ $t('Updated') }}
                      div
                        q-btn.q-mb-sm.q-px-xs(flat,dense,v-if="post.isExpandible",color="info",:label="$t('More')",icon-right="fas fa-caret-down",@click.capture.stop="post.expand = true")

                template(v-if="post.Files")
                  .full-width.text-center
                    img(v-intersection.once="onImageIntersection",:data-id="post._id",:data-file_id="post.Files[0]._id",:class="`image-${post.Files[0]._id}`",src="../assets/null.png",style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: 50% 50%;")
                  //-q-img(fit="contain",v-intersection.once="onImageIntersection",:data-id="post._id",:data-file_id="post.Files[0]._id")
                    template(v-slot:default)
                      img.absolute-center.full-width(:class="`image-${post.Files[0]._id}`",src="../assets/null.png")
                      q-inner-loading.full-width(size="xs",:showing="true",:class="`loading-${post.Files[0]._id}`")

              template(v-else)
                .q-ma-none.text-caption.text-grey-5 {{ $t('Deleted Post') }}

            //- Ref
            template(v-if="post.Ref && !post.deleted")
              q-item-section.q-my-sm
                template(v-if="post.Ref.deleted")
                  q-item.block.q-pa-none.bg-white
                    q-list.rounded-borders(bordered)
                      .full-width.q-pa-sm.column
                        .row
                          .q-ma-xs.full-width.text-caption.text-grey-5 {{ $t('Deleted Post') }}

                template(v-else)
                  q-item.block.q-pa-none(v-intersection.once="onPostIntersection(post.Ref, 1, 1)",:data-id="post.Ref._id",clickable,@click.capture.stop="onShow(post.Ref)",style="margin-bottom: 1px;",:class="!post.Ref.isAd ? 'bg-white': 'bg-gray-1'")
                    q-list.rounded-borders(bordered)
                      template(v-if="!post.Ref.PostedBy")
                        .full-width.q-pa-sm.column
                          .row
                            q-skeleton.inline(type="QAvatar",size="1.5rem")
                            q-skeleton.inline.q-ml-sm(type="text",width="7rem")
                            q-skeleton.inline.q-ml-sm(type="text",width="4rem")

                          q-skeleton(type="text")
                          q-skeleton(type="text")

                      template(v-else)
                        .full-width.q-pa-sm.column.relative-position
                          .row
                            PartAvatar(:user="post.Ref.PostedBy",size="1.5rem")

                            span.text-subtitle2(style="font-weight:700;") {{post.Ref.PostedBy && post.Ref.PostedBy.handle ? post.Ref.PostedBy.handle : $t('No Handle') }}
                            span.q-ml-sm.text-caption @{{ post.Ref.PostedBy.id }}
                            .absolute-top-right.q-mt-sm.q-mr-sm
                              span.text-caption(v-intersection="onStampIntersection",:data-date="post.Ref.postedAt",v-html="formatDateNow(post.Ref.postedAt)")
                              q-tooltip.q-mr-none(:hide-delay="1000",:offset="[0,20]",self="bottom right") {{ formatDateLocal(post.postedAt) }}
                            template(v-if="!post.Ref.deleted")
                              template(v-if="post.Ref.text")
                                pre.q-ma-xs.full-width.text-body2.ellipsis-3-lines(v-html="safeHtml(textToLink(post.Ref.text))")
                            template(v-else)
                              .q-ma-xs.full-width.text-caption.text-grey-5 {{ $t('Deleted Post') }}

                            template(v-if="post.Ref.Files")
                              .full-width.text-center
                                img(v-intersection.once="onImageIntersection",:data-id="post.Ref._id",:data-file_id="post.Ref.Files[0]._id",:class="`image-${post.Ref.Files[0]._id}`",src="../assets/null.png",style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: 50% 50%;")

          q-bar.q-px-none.q-py-none.bg-transparent
            q-btn(flat,:color="post.isLiked ? 'red-6' : 'grey-6'",@click.capture.stop="onLike(post)",size="sm",:icon="$t('icons.like')",:disabled="!myprofile._id.value || post.deleted")
              span.q-ml-sm.text-grey-6(v-if="post.likesCount") {{ formatNumber(post.likesCount, 1) }}
            q-btn(flat,:color="post.isReferenced ? 'info' : 'grey-6'",@click.capture.stop="onReference(post)",size="sm",:icon="$t('icons.reference')",:disabled="!myprofile._id.value || post.deleted")
              span.q-ml-sm.text-grey-6(v-if="post.referencesCount") {{ formatNumber(post.referencesCount, 1) }}
            q-btn(flat,:color="post.isCommented ? 'info' : 'grey-6'",@click.capture.stop="onComment(post)",size="sm",:icon="$t('icons.comment')",:disabled="!myprofile._id.value || post.deleted")
              span.q-ml-sm.text-grey-6(v-if="post.commentsCount") {{ formatNumber(post.commentsCount, 1) }}
            q-btn(flat,color="grey-6",@click.capture.stop="onCopyLink(post)",size="sm",:icon="$t('icons.copyLink')")
            //q-btn.no-shadow(flat,color="grey-6",@click.capture.stop="post.menuShowing = !!!post.menuShowing",size="sm",icon="fas fa-ellipsis",:disabled="!myprofile._id.value || post.deleted")
            q-space
            q-btn.no-shadow(v-if="myprofile._id.value && myprofile._id.value === post.postedBy && !post.deleted",flat,color="grey-6",@click.capture.stop="post.menuShowing = !!!post.menuShowing",size="sm",icon="fas fa-ellipsis")
              q-menu(v-model="post.menuShowing",auto-close,anchor="bottom right",self="top right")
                q-list
                  template(v-if="myprofile && post.PostedBy && myprofile._id.value === post.PostedBy._id")
                    q-item(clickable,@click.capture.stop="post.menuShowing = false; onEdit(post)")
                      q-item-section(avatar)
                        q-icon(name="fas fa-edit")
                      q-item-section {{ $t('Edit Post') }}
                    q-item(clickable,@click.capture.stop="post.menuShowing = false; onRemove(post)")
                      q-item-section(avatar)
                        q-icon(name="fas fa-trash")
                      q-item-section {{ $t('Remove Post') }}

    template(v-if="post.children && !post.isParent")
      // q-list.q-pl-sm.bg-area
      PartPostRecursive(:posts="iteratableChildren(post.children)",:depth="depth + 1",:level="level",:rootDepth="rootDepth")
</template>

<script>
import { defineComponent, ref, toRef, inject, watch, nextTick } from 'vue'

import { useI18n } from 'vue-i18n'

import { useQuasar } from 'quasar'

import { wait, nl2br, safeHtml, textToLink, stripTags, formatDateNow, formatDateLocal, formatNumber, onStampIntersection, onStampInterval, like, /* share, */ copyLink } from 'src/utils/common'

import { getData, postData, deleteData, loadImageTo } from 'src/utils/api'

import PartAvatar from 'src/components/PartAvatar.vue'

export default defineComponent({
  name: 'PartPostRecursive',
  components: {
    PartAvatar
  },
  props: ['posts', 'depth', 'level', 'rootDepth', 'options'],
  inject: ['router', 'states', 'dialogs', 'myprofile', 'onReload'],
  setup(props) {
    const router = inject('router')

    const { t } = useI18n()

    const q = useQuasar()

    const posts = toRef(props, 'posts')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const myprofile = inject('myprofile')

    const onReload = inject('onReload')

    const iteratableChildren = (posts) => {
      let arr = ref({})
      arr.value = []

      for (let child of posts) {
        arr.value.push(child)
      }

      return arr.value
    }

    let processing = false

    watch(() => onReload.value, async (newVal, oldVal) => {
      if (newVal && !processing) {
        processing = true

        if (states.latest.action && states.latest.id) {
          const post = posts.value.find((row) => {
            return row._id === states.latest.id
          })
          if (post) {
            if (states.latest.action === 'update') {
              let json
              try {
                json = await getData(`/posts/${states.latest.id}`)
              } catch (e) {
              }
              if (json && json._id) {
                for (let key in json) {
                  post[key] = json[key]
                }
              }
            } else if (states.latest.action === 'remove') {
              post.deleted = true
            } else if (states.latest.action === 'like') {
              setTimeout(()=> {
                nextTick(async() => {
                  post.isLiked = await getData(`/posts/${post._id}/isLiked`)
                  post.likesCount = await getData(`/posts/${post._id}/likes/count`)
                })
              }, 300)
            } else if (states.latest.action === 'reference') {
              setTimeout(()=> {
                nextTick(async() => {
                  post.isReferenced = await getData(`/posts/${post._id}/isReferenced`)
                  post.referencesCount = await getData(`/posts/${post._id}/references/count`)
                })
              }, 300)
            } else if (states.latest.action === 'comment') {
              let commentId = states.latest.opts && states.latest.opts.id ? states.latest.opts.id : null
              setTimeout(()=> {
                nextTick(async() => {
                  post.isCommented = await getData(`/posts/${post._id}/isCommented`)
                  post.commentsCount = await getData(`/posts/${post._id}/comments/count`)
                  if (commentId) {
                    if (!post.children) {
                      post.children = []
                    }
                    post.children.unshift({
                      _id: commentId
                    })
                  }
                })
              }, 300)
            }
          } else {
            if (states.latest.action === 'post') {
            } else if (states.latest.action === 'reference') {
            }
          }
        }

        setTimeout(()=> {
          nextTick(() => {
            onReload.value = false

            processing = false

            states.latest.action = null
            states.latest.id = null
            states.latest.opts = null
          })
        }, 300)
      }
    })

    const onShow = async (post) => {
      if (window.getSelection().toString() !== '') { return }

      if (router.currentRoute.value.path.match(/^\/post\/.+?/)) {
        router.push(`/post/${post._id}`)
      } else {
        dialogs.single.id = post._id
        dialogs.single.show = true
      }
    }

    const onLike = async (post) => {
      like(post)

      states.latest.action = 'like'
      states.latest.id = post._id

      onReload.value = true
    }

    const onReference = async (post) => {
      dialogs.reference.refId = post._id
      dialogs.reference.show = true
    }

    const onComment = async (post) => {
      dialogs.comment.parentId = post._id
      dialogs.comment.show = true
    }

    const onEdit = async (post) => {
      let dialog
      if (post.Parent) {
        dialog = dialogs.comment
        dialog.parentId = post.Parent._id
      } else if (post.Ref) {
        dialog = dialogs.reference
        dialog.refId = post.Ref._id
      } else {
        dialog = dialogs.post
      }
      dialog.id = post._id
      dialog.show = true
    }

    const onRemove = async (post) => {
      dialogs.remove.id = post._id
      dialogs.remove.show = true
    }

    const onCopyLink = async (post) => {
      post.menuShowing = false
      copyLink(post)
      q.notify({
        type: 'positive',
        message: nl2br(t('Copied Share Link To Clipboard'))
      })
    }

    const checkEllipsis = (e) => {
      if (e.target.scrollHeight !== e.target.clientHeight) {
        const post = posts.value.find((row) => {
          return row._id === e.target.dataset.id
        })

        if (post) {
          post.isExpandible = true
        }
      }
    }

    const onPostIntersection = async (post, depth, level) => {
      if (post.visibled || post.PostedBy) {
        return
      }
      post.visibled = true

      let data = {}
      try {
        data = await getData(`/posts/${post._id}`)
      } catch (e) {
        data.deleted = true
      }

      if (level > 0 && depth >= level && data.children) {
        delete data.children
      }

      if (data._id) {
        post = Object.assign(post, data)
      } else {
        post.hidden = true
      }
    }

    const onImageIntersection = async (entry) => {
      if (entry.isIntersecting) {
        const postId =  entry.target.dataset.id
        const fileId = entry.target.dataset.file_id

        const post = posts.value.find((row) => {
          return row._id === postId
        })

        try {
          const ret = await loadImageTo(`/posts/${postId}/files/${fileId}`, `image-${fileId}`, `image-${fileId}`, `loading-${fileId}`)
          // post.loadedImage = true
        } catch(e) {
        }
      }
    }

    const onCurrentIntersection= async () => {
      // console.log('onCurrentIntersection')
    }

    return {
      checkEllipsis,
      iteratableChildren,
      nl2br, safeHtml, textToLink, stripTags,
      formatDateNow,
      formatDateLocal,
      formatNumber,
      onStampIntersection,
      onPostIntersection,
      onShow,
      onLike,
      // share,
      onCopyLink,
      onReference,
      onComment,
      onEdit,
      onRemove,
      onImageIntersection,
      onCurrentIntersection
    }
  }
})
</script>

<style scoped lang="stylus">
indent = 1rem

for n in (1..100)
  .indent-{n}
    margin-left indent * n
</style>
