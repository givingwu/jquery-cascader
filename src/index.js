import $ from "https://dev.jspm.io/jquery";
import MapDataset from "./data.js";

const queryAddress = (id, idx = 0) => {
  console.trace("idx: ", idx);
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

// 复用 DOM
const getPrevEle = dom => (index = -1) => {
  if (~index) {
    const children = dom.children();

    if (children && children.length) {
      return children.eq(index);
    }
  }

  return null;
};

// 隐藏多余 DOM
const hideSurplusEle = dom => index => {
  if (~index) {
    const children = dom.children();

    if (children && children.length) {
      return children.slice(index).hide();
    }
  }
};

const defaults = {
  // panel: `.J_Panel`,
  panelHead: `.J_PanelHead`,
  panelBody: `.J_PanelBody`,
  panelTpl: `<div class="panel-item"></div>`,
  panelItemTpl: `<a href="javascript:void(0);" title=""></a>`
};

function Cascader(options) {
  const opts = $.extend({}, defaults, options);
  const { ele, value, panelHead, panelBody, panelTpl, panelItemTpl } = opts;

  const $ele = $(ele);
  const $head = $ele.find(panelHead);
  const $body = $ele.find(panelBody);
  const getPrevHead = getPrevEle($head);
  const getPrevBody = getPrevEle($body);
  const checkSurPlusHead = hideSurplusEle($head);
  const checkSurPlusBody = hideSurplusEle($body);
  const render = (value, index) => {
    $.when(queryAddress(value, index)).done(data => {
      console.log("data: ", data);
      renderPanel(data, index);
    });
  };

  const renderPanel = (data, index = 0) => {
    // 获取是否存在可重用的 panelBody DOM
    const prevPanelBody = getPrevBody(index);
    const reuseableBody = prevPanelBody && prevPanelBody.length;
    const $panel = reuseableBody ? prevPanelBody : $(panelTpl);

    if (reuseableBody) {
      checkSurPlusBody(index);
      hideSurplusEle($panel)(data.length);

      $panel.children().removeClass("active");
    }

    // 获取是否存在可重用的 panelBodyItem DOM
    const getPrevItem = getPrevEle($panel);
    let dataRef = null;
    let activeRef = null;

    if (data && data.length) {
      for (let i = 0, l = data.length; i < l; i++) {
        const item = data[i];
        const { label, value, active, children, ...props } = item;
        const prevItem = getPrevItem(i);
        const reuseableItem = prevPanelBody && prevPanelBody.length;
        const $bd_item = reuseableItem ? prevItem : $(panelItemTpl);

        $bd_item
          .text(label)
          .attr("title", label)
          .data("value", value)
          .attr("data-value", value)
          .data("index", index)
          .attr("data-index", index)
          .addClass(() => active && "active");

        if (reuseableItem) {
          $bd_item.off();
        } else {
          $panel.append($bd_item);
        }

        if (active) {
          activeRef = { label, value, ...props };
        }

        if (children && children.length) {
          dataRef = children;
        }

        $bd_item.click(function() {
          const dataset = $(this).data() || {};
          const { value, index } = dataset;

          /* if (index === 0) {
            refreshFirst(item);
          } else { */
          if (value) {
            render(value, index);
          }
          // }
        });
      }
    }

    const prevPanelHead = getPrevHead(index);
    const reuseableHead = prevPanelHead && prevPanelHead.length;
    const $hd_item = reuseableHead ? prevPanelHead : $(panelItemTpl);

    if (activeRef) {
      $hd_item
        .text(activeRef.label)
        .attr("title", activeRef.label)
        .data("value", activeRef.value)
        .data("index", index);
    } else {
      $hd_item
        .text("请选择")
        .attr("title", "请选择")
        .data("value", null)
        .data("index", index);
    }

    if (reuseableHead) {
      checkSurPlusHead(index);
      $head.off();
    } else {
      $head.append($hd_item);
    }

    $hd_item.click(function() {
      const index = $(this).index();

      $(this)
        .addClass("active")
        .siblings()
        .removeClass()
        .parent()
        .next()
        .children()
        .eq(index)
        .show()
        .addClass("active")
        .siblings()
        .removeClass()
        .hide();
    });

    !reuseableBody && $body.append($panel);

    if (dataRef && dataRef.length) {
      renderPanel(dataRef, ++index);
    } else {
      if (activeRef && activeRef.hasChildren && activeRef.value) {
        render(activeRef.value, ++index);
      } else {
        if (reuseableBody) {
          $head
            .children()
            .show()
            .eq(index)
            .addClass("active")
            .nextAll()
            .hide()
            .removeClass()

          $body
            .children()
            .eq(index)
            .show()
            .addClass("active")
            .nextAll()
            .hide()
            .removeClass();
        } else {
          $head
            .children()
            .last()
            .addClass("active")
            .siblings()
            .removeClass()

          $body
            .children()
            .eq(index)
            .show()
            .addClass("active")
            .siblings()
            .hide()
            .removeClass();
        }
      }
    }
  };

  value && render(value);
}

$.fn.Cascader = Cascader;

export default Cascader;
