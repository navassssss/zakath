export function navigate(path: string, replace = false) {
  if (path === location.pathname + location.search + location.hash) return
  if (replace) history.replaceState(null, '', path)
  else history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}
