function getCssVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

export const colors = {
  get setlogPrimary() {
    return getCssVar('--setlog-primary')
  },
  get setlogPrimaryHover() {
    return getCssVar('--setlog-primary-hover')
  },
  get navText() {
    return getCssVar('--nav-text')
  },
  get white() {
    return getCssVar('--white')
  }
}