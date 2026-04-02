const rootStyles = getComputedStyle(document.documentElement)

const primary = rootStyles.getPropertyValue('--setlog-primary').trim()
const primaryHover = rootStyles.getPropertyValue('--setlog-primary-hover').trim()
const navText = rootStyles.getPropertyValue('--setlog-nav-text').trim()
const white = rootStyles.getPropertyValue('--setlog-white').trim()

export const colors = {
  setlogPrimary: primary,
  setlogPrimaryHover: primaryHover,
  navText: navText,
  white: white
}