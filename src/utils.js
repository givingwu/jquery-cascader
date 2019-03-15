
// 复用 DOM
export const getPrevEle = dom => (index = -1) => {
  if (~index) {
    const children = dom.children()

    if (children && children.length) {
      return children.eq(index)
    }
  }
}

// 隐藏多余 DOM
export const hideSurplusEle = dom => index => {
  if (~index) {
    const children = dom.children()

    if (children && children.length && index < children.length) {
      return children.slice(index).hide()
    }
  }
}

