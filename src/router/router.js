import Vue from 'vue'
import VueRouter from 'vue-router'

// components
import Leaflet from '../components/Leaflet'
import Auth from '../components/Auth'
import Summary from '../components/Summary'
import Rides from '../components/Rides'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'map',
    component: Leaflet,
    props: true
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
  },
  {
    path: '/summary',
    name: 'summary',
    component: Summary,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/rides',
    name: 'rides',
    component: Rides,
    props: true,
    meta: { requiresAuth: true }
  },
]

const router = new VueRouter({
  routes,
})

router.beforeResolve((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    let user;
    Vue.prototype.$Amplify.Auth.currentAuthenticatedUser().then(data => {
      if (data && data.signInUserSession) {
        user = data;
      }
      next()
    }).catch((e) => {
      next({
        name: 'auth'
      });
    });
  }
  next()
})

export default router