<template lang="pug">
q-header
  template(v-if="router.currentRoute.value.path === '/notice'")
    q-toolbar.q-px-xs
      q-item.no-padding
        PartMenu
      q-space
      q-item-label
        span {{ $t('Notices') }}
      q-space
</template>

<script>
import { defineComponent, onMounted, inject, reactive, ref, computed, watch, nextTick, toRef } from 'vue'

import { wait, nl2br, stripTags, formatDateNow, formatNumber, onStampIntersection, onStampInterval, follow, block } from 'src/utils/common'

import { getData, postData, deleteData, loadImageTo } from 'src/utils/api'

import PartMenu from '/src/components/PartMenu.vue'

export default defineComponent({
  components: {
    PartMenu
  },
  inject: ['router', 'states', 'dialogs', 'myprofile', 'isSearch', 'keyword'],
  setup(props, context) {
    const router = inject('router')

    const states = inject('states')

    const dialogs = inject('dialogs')

    const myprofile = inject('myprofile')

    const isSearch = inject('isSearch')

    const onSearch = inject('onSearch')
    const keyword = inject('keyword')

    const text = ref('')

    const input = ref()
    const popup = ref()

    const show = ref(false)

    const suggests = ref([])

    watch(() => onSearch.value, async (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        reload()
        onSearch.value = false
      }
    })

    watch(() => keyword.value, async (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        text.value = newVal
      }
    })

    watch(() => text.value, async (newVal, oldVal) => {
      if (newVal !== oldVal) {
        if (!newVal) {
          show.value = false
        } else if (newVal.match(/^#/)) {
          await loadTags(newVal)
        } else if (newVal.match(/^@/)) {
          await loadUsers(newVal)
        } else {
          show.value = false
        }
        keyword.value = newVal
        // reload()
      }
    })

    onMounted(async () => {
      // reload()
    })

    const reload = async () => {
      load()
    }

    const loadTags = async (val) => {
      suggests.value = await getData(`/tags/?text=${val.substr(1)}`)
      if (suggests.value.length === 1) {
        if (val === suggests.value[0]) {
          text.value = val
          show.value = false
        } else {
          show.value = true
        }
      } else if (suggests.value.length > 1) {
        show.value = true
        setTimeout(()=> {
          nextTick(() => {
            input.value.focus()
          })
        }, 200)
      }
    }

    const loadUsers = async (val) => {
      suggests.value = await getData(`/users/?id=${val.substr(1)}`)
      if (suggests.value.length === 1) {
        if (val === suggests.value[0]) {
          text.value = val
          show.value = false
        } else {
          show.value = true
        }
      } else if (suggests.value.length > 1) {
        show.value = true
        setTimeout(()=> {
          nextTick(() => {
            input.value.focus()
          })
        }, 200)
      }
    }

    const clickSuggests = async (val) => {
      text.value = val
      show.value = false
    }

    const load = async () => {
    }

    return {
      text,
      input, popup, show,
      suggests,
      clickSuggests
    }
  }
})
</script>
