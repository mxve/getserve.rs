import { createRouter, createWebHashHistory } from 'vue-router'
import ServerList from '../components/ServerList.vue'
import ServerDetails from '../views/ServerDetails.vue'
import { gameNames, platformNames } from '../utils/gameMappings'
import { SITE_DOMAIN } from '../utils/constants'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: ServerList
    },
    {
      path: '/s/:id',
      name: 'ServerDetails',
      component: ServerDetails
    },
    {
      path: '/server/:ip/:port',
      name: 'ServerDetailsIP',
      component: ServerDetails
    },
    {
      path: '/:filter',
      name: 'FilteredServerList',
      component: ServerList,
      props: true
    }
  ],
})

router.beforeEach((to, from, next) => {
  const filter = to.params.filter
  let title = 'Server List - getServe.rs'
  let description = 'CoD Client Server list | getServe.rs'
  let url = `${SITE_DOMAIN}/#/`

  if (filter) {
    const gameName = gameNames[filter] || filter
    const platformName = Object.values(platformNames).find(p => p.toLowerCase() === filter.toLowerCase())

    const displayFilter = platformName || gameName || filter
    title = `${displayFilter} Servers - getServe.rs`
    description = `Browse ${displayFilter} servers on getServe.rs`
    url = `${SITE_DOMAIN}/#/${filter}`
  }

  document.title = title

  updateMetaTag('og:title', title)
  updateMetaTag('og:description', description)
  updateMetaTag('og:url', url)

  next()
})

function updateMetaTag(property, content) {
  let element = document.querySelector(`meta[property="${property}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export default router
