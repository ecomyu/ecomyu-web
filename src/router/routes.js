
const routes = [
  {
    path: '/callback',
    component: () => import('pages/Callback.vue')
  }, {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PageRoot.vue') }
    ]
  }, {
    path: '/about',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PageAbout.vue') }
    ]
  }, {
    path: '/terms',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PageTerms.vue') }
    ]
  }, {
    path: '/privacy',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PagePrivacy.vue') }
    ]
  }, {
    path: '/@:id([a-zA-Z0-9_]+)',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PageUser.vue') }
    ]
  }, {
    path: '/post/:id([a-f0-9]+)',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PagePost.vue') }
    ]
  }, {
    path: '/notice',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PageNotice.vue') }
    ]
  }, {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
