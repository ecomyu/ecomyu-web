import axios from 'axios'

import { useRouter } from 'vue-router'

import urlJoin from 'url-join'

import { ref } from 'vue'

import { useAmplify } from '../boot/amplify'

import dayjs from 'dayjs'

import { nl2br } from './common'

const API_URL = process.env.VUE_APP_API_URL

let amplify

async function getAccessToken () {
  if (!amplify) {
    amplify = useAmplify()
  }
  return await amplify.GetAccessToken()
}

let $router
let directory

let expireIn

async function getData (url) {
  if (!$router) {
    $router = useRouter()
  }

  let headers = {
    'content-type': 'application/json'
  }

  const accessToken = await getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (expireIn) {
    headers.ExpireIn = encodeURIComponent(dayjs(expireIn).toJSON())
  }

  try {
    const res = await axios.get(urlJoin(API_URL, url, `?logStamp=${(new Date()).getTime()}`), { headers: headers })
    return res.data
  } catch (e) {
    if (e.response && e.response.data) {
      if (e.response.data.message === 'Need login') {
        // alert('ユーザー未登録')
        // login()
      } else if (e.response.data.error === 'Unauthorized') {
        // alert(err.response.data.message)
        // logout()
        // window.location.href = '/'
      } else if (e.response.data.message === 'Invalid Token') {
        // alert(err.response.data.message)
        // logout()
        // window.location.href = '/'
      } else if (e.response.data.error === 'Internal Server Error') {
        if (e.response.data.message === 'Request failed with status code 401') {
          alert('Refresh Now')
          return
        } else {
          // alert(e.response.data.message)
        }
      }
    }
    console.log('error:', e)
    throw e
  }
}

async function postData (url, json) {
  if (!$router) {
    $router = useRouter()
  }

  let headers = {
    'content-type': 'application/json'
  }

  const accessToken = await getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (expireIn) {
    headers.ExpireIn = encodeURIComponent(dayjs(expireIn).toJSON())
  }

  try {
    const res = await axios.post(urlJoin(API_URL, url, `?logStamp=${(new Date()).getTime()}`), json, { headers: headers })
    return res.data
  } catch (e) {
    console.log('error:', e)
    throw e
  }
}

async function patchData (url, json) {
  if (!$router) {
    $router = useRouter()
  }

  let headers = {
    'content-type': 'application/json'
  }

  const accessToken = await getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (expireIn) {
    headers.ExpireIn = encodeURIComponent(dayjs(expireIn).toJSON())
  }

  try {
    const res = await axios.patch(urlJoin(API_URL, url, `?logStamp=${(new Date()).getTime()}`), json, { headers: headers })
    return res.data
  } catch (e) {
    console.log('error:', e)
    throw e
  }
}

async function deleteData (url) {
  if (!$router) {
    $router = useRouter()
  }

  let headers = {
  }

  const accessToken = await getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (expireIn) {
    headers.ExpireIn = encodeURIComponent(dayjs(expireIn).toJSON())
  }

  try {
    const res = await axios.delete(urlJoin(API_URL, url, `?logStamp=${(new Date()).getTime()}`), { headers: headers })
    return res.data
  } catch (e) {
    console.log('error:', e)
    throw e
  }
}

async function uploadFile (url, formData, fileName, fileType) {
  if (!$router) {
    $router = useRouter()
  }

  let headers = {
    'Content-Type': 'multipart/form-data'
  }

  if (fileName) {
    headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(fileName)}"`
  }

  const accessToken = await getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (expireIn) {
    headers.ExpireIn = encodeURIComponent(dayjs(expireIn).toJSON())
  }

  try {
    const res = await axios.post(urlJoin(API_URL, url), formData, { headers: headers })
    return res.data
  } catch (e) {
    console.log('error:', e)
    throw e
  }
}

async function downloadFile (url, name) {
  if (!$router) {
    $router = useRouter()
  }

  let headers = {
    'Content-Type': 'multipart/form-data'
  }

  const accessToken = await getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (expireIn) {
    headers.ExpireIn = encodeURIComponent(dayjs(expireIn).toJSON())
  }

  try {
    await axios.get(urlJoin(API_URL, url), {
      responseType: 'blob',
      headers
    }).then((res) => {
      const blob = new Blob([res.data], {
        type: res.data.type
      })
      saveAs(blob, name)
    }).catch((err) => {
      throw err
    })
  } catch (e) {
    console.log(e)
    alert('Failed Download')
  }
}

let images = {}

function hideLoadings (loadings) {
  if (loadings && loadings.length > 0) {
    for (const loading of loadings) {
      if (!loading.dataset.loaded) {
        loading.style.display = 'none'
        loading.dataset.loaded = true
      }
    }
  }
}

async function loadImageTo (url, key, targetClass, loadingTargetClass) {
  const imgs = document.getElementsByClassName(targetClass)
  if (!imgs || imgs.length === 0) {
    console.log('Not Found Image Element', targetClass)
    return null
  }

  if (!$router) {
    $router = useRouter()
  }

  let headers = {
    'Content-Type': 'multipart/form-data'
  }

  const accessToken = await getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (expireIn) {
    headers.ExpireIn = encodeURIComponent(dayjs(expireIn).toJSON())
  }

  const loadings = document.getElementsByClassName(loadingTargetClass)

  if (images[key]) {
    for(const img of imgs) {
      img.src = images[key]

      hideLoadings(loadings)
    }
  } else {
    try {
      await axios.get(urlJoin(API_URL, url, `?logStamp=${(new Date()).getTime()}`), {
        responseType: 'blob',
        headers
      }).then((res) => {
        const blob = new Blob([res.data], {
          type: res.data.type
        })

        let reader = new FileReader()
        reader.readAsDataURL(blob)

        reader.onload = function() {
          for(const img of imgs) {
            if (!img.dataset.loaded) {
              img.src = reader.result
              img.dataset.loaded = true
            }
          }

          images[key] = reader.result

          hideLoadings(loadings)
        }
      }).catch((err) => {
        throw err
      })
    } catch (e) {
      console.log(e)
      return false
    }
  }

  return true
}

export {
  getData, postData, patchData, deleteData,
  uploadFile, downloadFile, loadImageTo
}
