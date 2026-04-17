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
  get setlogPrimaryText() {
    return getCssVar('--setlog-primary-text')
  },
  get setlogSecondaryText() {
    return getCssVar('--setlog-secondary-text')
  },
  get navText() {
    return getCssVar('--nav-text')
  },
  get white() {
    return getCssVar('--white')
  }

}