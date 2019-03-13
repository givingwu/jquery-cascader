import MapDataset from "./data.js";

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

// Local dataset
export const queryAddress = (id, idx = 0) => {
  let data = MapDataset;
  let val = [];
  let notSame = true;

  while (!idx ? notSame : val.length <= idx) {
    let childrenRef = null;
    let res = [];

    data &&
      data.length &&
      data.forEach((item, index) => {
        const { value, children, ...prop } = item;
        const hasChildren = children && children.length;
        const similar = id.startsWith(value);

        if (similar) {
          childrenRef = children;
        }

        res.push({
          hasChildren,
          active: similar,
          ...prop,
          value
        });

        if (id === value) {
          notSame = false;
        }
      });

    data = childrenRef;
    val.push(res);
  }

  let i = val.length - 1;

  while (i >= 0) {
    let curr = val[i];
    let parent = val[--i];

    parent &&
      parent.forEach(item => {
        if (item.active) {
          item.children = curr;
        }
      });
  }
  return val[idx];
};