import { boot } from "quasar/wrappers"

import VueGtag from "vue-gtag-next"

export default boot(({ app }) => {
  const measurementId =  process.env.VUE_APP_GA_MEASUREMENT_ID || null
  if (measurementId) {
    app.use(VueGtag, {
      property: {
        id: measurementId
      }
    })
  }
})
