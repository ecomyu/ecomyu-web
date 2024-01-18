import { copyToClipboard } from 'quasar'

// import { URL } from 'url'

import urlJoin from 'url-join'

import sanitizeHtml from 'sanitize-html'

import striptags from 'striptags'

import Autolinker from 'autolinker'

import 'dayjs/locale/ja'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { getData, postData, deleteData } from '../utils/api'

dayjs.locale('ja')
dayjs.extend(relativeTime)

const clone = (obj) => {
  return Object.assign({}, obj)
}

const compare = (obj1, obj2) => {
  return Object.is(obj1, obj2)
}

const nl2br = (str) => {
  return String(str).replace(/(\r\n|\n\r|\r|\n)/g, '<br>')
}

const flatten = (obj) => {
  const res = {}
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object') {
      const nested = flatten(obj[key])
      for (const nestedKey of Object.keys(nested)) {
        res[`${key}_${nestedKey}`] = nested[nestedKey]
      }
    } else {
      res[key] = obj[key]
    }
  }
  return res
}

const safeText = (str) => {
  return sanitizeHtml(String(str).trim(), {
    allowedTags: [],
    allowedAttributes: []
  })
}

const safeHtml = (str) => {
  return sanitizeHtml(String(str).trim(), {
    allowedTags: [ 'b', 'i', 'strike', 'u', 'a', 'img', 'div', 'pre', 'br', 'ul', 'ol', 'li' ],
    allowedAttributes: {
      'a': [ 'href', 'rel', 'target' ],
      'div': [ 'style' ],
      'img': [ 'class', 'border', 'width', 'height', 'src', 'slt' ],
    },
    // allowedIframeHostnames: ['www.youtube.com']
  })
}

const autolinker = new Autolinker({
  newWindow: true,
  mention: 'twitter',
  hashtag: 'twitter',
  email: false
})

const textToLink = (str) => {
  let linkedStr = autolinker.link(str)
  linkedStr = linkedStr.replace(/<a href="https:\/\/twitter.com\/hashtag\/(\S+)" target="_blank" rel="noopener noreferrer">\S+<\/a>/g, '<a href="/?hashtag=$1">#$1</a>')
  linkedStr = linkedStr.replace(/<a href="https:\/\/twitter.com\/(\S+)" target="_blank" rel="noopener noreferrer">@\S+<\/a>/g, '<a href="/@$1">@$1</a>')
  return linkedStr
}

const stripTags = (str) => {
  str = striptags(str, ['a'], '\n')
  str = str.replace(/\n\n/gi, '\n')
  return str
}

const stripLinebreaks = (str) => {
  str = str.replace(/\s+/g, '').trim()
  return str
}

const OptionsColor = [
  {
    label: 'Red',
    value: 'user-1'
  }, {
    label: 'Pink',
    value: 'user-2'
  }, {
    label: 'Purple',
    value: 'user-3'
  }, {
    label: 'Deep Purple',
    value: 'user-4'
  }, {
    label: 'Indigo',
    value: 'user-5'
  }, {
    label: 'Blue',
    value: 'user-6'
  }, {
    label: 'Cyan',
    value: 'user-7'
  }, {
    label: 'Turquoise',
    value: 'user-8'
  }, {
    label: 'Green',
    value: 'user-9'
  }, {
    label: 'Light Green',
    value: 'user-10'
  }, {
    label: 'Lime',
    value: 'user-11'
  }, {
    label: 'Yellow',
    value: 'user-12'
  }, {
    label: 'Orange',
    value: 'user-13'
  }, {
    label: 'Deep Orange',
    value: 'user-14'
  }, {
    label: 'Brown',
    value: 'user-15'
  }, {
    label: 'Grey',
    value: 'user-16'
  }, {
    label: 'Ash',
    value: 'user-17'
  }
]

const loadOptionsColor = () => {
  return OptionsColor
}

const checkUploadImageFile = (files) => {
  let ret = []
  for (const file of files) {
    if (file.size > 4 * 1024 * 1024) {
      continue
    // } else if (file.type !== 'image/heic' && file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/gif') {
    } else if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/gif') {
      continue
    }
    ret.push(file)
  }
  return ret
}

const shortUrl = (val) => {
  const url = new URL(val)
  return url.host + url.pathname
}

const formatDateNow = (val) => {
  return dayjs(val).fromNow()
}

const formatDateLocal = (val) => {
  return dayjs(val).toDate().toLocaleDateString() + ' ' + dayjs(val).toDate().toLocaleTimeString()
}

const numberSymbols = [
  { value: 1, symbol: "" },
  { value: 1e3, symbol: "k" },
  { value: 1e6, symbol: "M" },
  { value: 1e9, symbol: "G" }
]
const formatNumber = (num, digits) => {
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = numberSymbols.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
  // return new Intl.NumberFormat('ja-JP').format(val)
}

const onStampIntersection = (elm) => {
  if (elm.target.dataset.date) {
    elm.target.innerText = dayjs(elm.target.dataset.date).fromNow()

    const times = dayjs().diff(elm.target.dataset.date, 'second')
    let interval = 10
    if (times < 60) {
      // interval = 10
    } else if (times < 3600) {
      interval = 60
    } else if (times < 86400) {
      interval = 3600
    }
    setTimeout(onStampInterval, interval * 1000, elm)
  }
}

const onStampInterval = (elm) => {
  if (elm.isIntersecting) {
    onStampIntersection(elm)
  }
}

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }
    , ms)
  })
}

const follow = async (user) => {
  let ret = true
  if (!!!user.isFollowing) {
    await postData(`/users/${user._id}/follow`).then(async () => {
      user.isFollowing = true
      user.followingsCount++
    }).catch((err) => {
      throw new Error('Failed Follow')
      ret = false
    })
  } else {
    await deleteData(`/users/${user._id}/follow`).then(async () => {
      user.isFollowing = false
      user.followingsCount--
    }).catch((err) => {
      throw new Error('Failed UnFollow')
      ret = false
    })
  }
  return ret
}

const block = async (user) => {
  let ret = true
  if (!!!user.isBlocking) {
    await postData(`/users/${user._id}/block`).then(async () => {
      user.isBlocking = true
    }).catch((err) => {
      throw new Error('Failed Block')
      ret = false
    })
  } else {
    await deleteData(`/users/${user._id}/block`).then(async () => {
      user.isBlocking = false
    }).catch((err) => {
      throw new Error('Failed UnBlock')
      ret = false
    })
  }
  return ret
}

const like = async (post) => {
  if (!!!post.isLiked) {
    await postData(`/posts/${post._id}/likes`)
    post.isLiked = true
    post.likesCount++
  } else {
    await deleteData(`/posts/${post._id}/likes`)
    post.isLiked = false
    if (post.likesCount > 0) {
      post.likesCount--
    }
  }
}

/*
const share = async (post) => {
}
*/

const copyLink = async (post) => {
  copyToClipboard(urlJoin(process.env.VUE_APP_APP_URL, 'post', post._id))
}

const copyUserLink = async (user) => {
  copyToClipboard(urlJoin(process.env.VUE_APP_APP_URL, '@' + user.id))
}

const getMyprofileAvatar = (myprofile) => {
  let data = {
    _id: myprofile._id.value,
    id: myprofile.id.value,
    handle: myprofile.handle.value,
    avatarColor: myprofile.avatarColor.value,
  }

  if (myprofile.avatarId && myprofile.avatarId.value) {
    data.avatarId = myprofile.avatarId.value
  }
  return data
}

export {
  clone, compare,
  nl2br,
  flatten,
  safeText, safeHtml, textToLink, stripTags, stripLinebreaks,
  loadOptionsColor,
  checkUploadImageFile,
  shortUrl,
  formatDateNow,
  formatDateLocal,
  formatNumber,
  onStampIntersection, onStampInterval,
  wait,
  follow,
  block,
  like,
  // share,
  copyLink, copyUserLink,
  getMyprofileAvatar
}
