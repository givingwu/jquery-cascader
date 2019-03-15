/* eslint-disable */
/**
 * # LICENSE
 * (c) 2019
 * @author [vuchan](https://www.github.com/vuchan)
 * @email <givingwu@gmail.com>
 * @repository https://github.com/vuchan/jquery-cascader
 * @issue https://github.com/vuchan/jquery-cascader/issues/new
 *
 * 请尊重原创，保留头部版权
 * 在保留版权的前提下可应用于个人或商业用途
 */
import $ from "https://dev.jspm.io/jquery";
import { getPrevEle, hideSurplusEle } from './utils'

const noop = $.noop
const when = $.when
const extend = $.extend
const isArray = $.isArray
const isFunction = $.isFunction
const isEmptyObject = $.isEmptyObject

// default configurations
const defaults = {
  placeholder: '请选择', // 未选中任何数据时的占位符文字
  ele: '.J_Cascader', // 容器元素，默认当前 $(ele).initCascader() 的 ele
  head: '.J_CascaderHead', // 容器元素 > head => 界面显示内容
  body: '.J_CascaderBody', // 容器元素 > body => 弹出框body
  input: '.J_CascaderVal', // 容器元素 > input => 输入框
  panelHead: `.J_PanelHead`, // 容器元素 > Panel => PanelHead
  panelBody: `.J_PanelBody`, // 容器元素 > Panel => PanelBody
  panelTpl: `<div class="cascader-panel-item"></div>`, // Panel-Item 模版字符串
  panelItemTpl: `<a href="javascript:void(0);" title=""></a>`, // Panel-Item-Anchor 模版字符串
  animation: true, // 是否开启动画
  apiMethod: null, // 远程获取数据的方法 默认为 null
  onChange: noop, // 数据变化时的回调 onChange => (currentActiveItem: ActiveItem, allActiveItems[]<ActiveItem>)
  onComplete: noop // 当前级联选择成功或结束时调用 onComplete => (currentActiveItem: ActiveItem, allActiveItems: allActiveItems[]<ActiveItem>)
}

export default class Cascader {
  constructor(options) {
    const opts = extend({}, defaults, options)
    const { ele, input, value, panelHead, panelBody } = opts
    const $ele = $(ele)
    const $head = $ele.find(panelHead)
    const $body = $ele.find(panelBody)

    // 闭包传入参数，返回高阶函数 ele => $head & $body
    this.getPrevHead = getPrevEle($head)
    this.getPrevBody = getPrevEle($body)

    // 闭包传入参数，返回高阶函数 ele => $head & $body
    this.checkSurPlusHead = hideSurplusEle($head)
    this.checkSurPlusBody = hideSurplusEle($body)

    this.options = opts
    this.$doc = $(document)
    this.$ele = $ele
    this.$head = $head
    this.$body = $body
    this.$input = $ele.find(input)
    this.activeItem = null
    this.activeItems = []

    this._initialized = false
    this._bindEvents() // 绑定事件
    this._loadData(value) // 加载数据
  }

  /**
   * _loadData 加载数据
   * @description 调用 apiMethod 加载数据
   * @param {Number | String} id
   * @param {Number} depth
   */
  _loadData(id = 0, depth = 0) {
    if (isNaN(+id)) return
    const { apiMethod } = this.options

    when(apiMethod && apiMethod(id, depth))
      .done(data => {
        if (data && data.length) {
          this._renderPanel(data, depth)
        } else {
          this.complete()
        }
      })
      .fail(console.error)
  }

  _bindEvents() {
    const { head, body, animation } = this.options
    const { $ele, $doc } = this
    const $hd = $ele.find(head)
    const $bd = $ele.find(body)
    const $icon = $hd.find('.icon')

    // show and hide
    $hd.click(function() {
      $ele.toggleClass('opened')
      $icon.toggleClass('icon-arrow-up')

      if (animation) {
        $bd.slideToggle('fast')
      } else {
        $bd.show()
      }

      $doc.on('click.toggle.CascaderBody', function(e) {
        const t = e.target
        const c = $ele.is(t) || $ele.has(t).length

        if (!c) {
          $doc.off('click.toggle.CascaderBody')
          $ele.toggleClass('opened')
          $icon.toggleClass('icon-arrow-up')

          if (animation) {
            $bd.slideUp()
          } else {
            $bd.hide()
          }
        }
      })
    })
  }

  /**
   * _renderPanel
   * @description 递归渲染 Tab Panel
   * @param {Array[DataItem<{ label: string, value: string | number, children?: DataItem[] }>]} data
   * @param {Number} index 当前递归深度
   */
  _renderPanel(data, index = 0) {
    const self = this
    const { panelTpl, panelItemTpl, onChange } = this.options
    const {
      $head,
      $body,
      getPrevHead,
      getPrevBody,
      checkSurPlusHead,
      checkSurPlusBody
    } = this

    // 获取之前可复用的 head DOM
    const prevPanelHead = getPrevHead(index)
    const reuseableHead = prevPanelHead && prevPanelHead.length
    const $hd_item = reuseableHead ? prevPanelHead : $(panelItemTpl)

    // 获取是否存在可重用的 panelBody DOM
    const prevPanelBody = getPrevBody(index)
    const reuseableBody = prevPanelBody && prevPanelBody.length
    // 如果存在则复用之前 DOM，否则重新生成 DOM Fragment
    const $panel = reuseableBody ? prevPanelBody : $(panelTpl)

    if (reuseableBody) {
      // 检查多余的 $panel-body 然后隐藏它们
      checkSurPlusBody(index)

      $body
        .children()
        .eq(index)
        .show()
        .siblings()
        .hide()

      // 重置回正常的状态  => 不隐藏，同时移除 active class
      $panel
        .children()
        .show()
        .removeClass('active')

      // 检查多余的 $panel-item 然后隐藏它们
      isArray(data) && hideSurplusEle($panel)(data.length)
    }

    // 声明高阶函数 -> 获取是否存在可重用的 panelBodyItem DOM
    const getPrevItem = getPrevEle($panel)
    let dataRef = null // data ref flag
    let activeRef = null // active ref flag

    if (isArray(data) && data.length) {
      for (let i = 0, l = data.length; i < l; i++) {
        const item = data[i]
        const {
          label,
          value,
          type,
          parentId,
          active,
          disabled,
          children,
          ...props
        } = item
        const currentItem = { label, value, parentId, ...props }
        const prevItem = getPrevItem(i)
        const reuseableItem = prevItem && prevItem.length
        const $bd_item = reuseableItem ? prevItem : $(panelItemTpl)

        $bd_item
          .text(label)
          .attr('title', label)
          .addClass(() => active && 'active')
          .addClass(() => disabled && 'disabled')

        if (reuseableItem) {
          // 将之前可重用元素的事件移除并在后面重新绑定
          $bd_item.off()
        } else {
          // 不可重用元素则 append 每个新元素
          $panel.append($bd_item)
        }

        if (active) {
          activeRef = currentItem
          self.activeItem = currentItem
          self.activeItems[index] = currentItem
        }

        if (children && children.length) {
          dataRef = children
        }

        !disabled &&
          $bd_item.click(function() {
            $(this)
              .addClass('active')
              .siblings()
              .removeClass('active')

            index = $hd_item
              .text(label)
              .attr('title', label)
              .data('value', value)
              .index()

            /* 每次新点击一个元素，则理解为当前元素是 active 的，并触发 onChange 回调 */
            self.activeItem = currentItem

            /* 当 index === 0 时，不能 slice(0, 0)，所以 offset = index + 1 */
            self.activeItems = self.activeItems.slice(0, index + 1)
            self.activeItems[index] = currentItem

            if (isFunction(onChange)) {
              onChange(self.activeItem, self.activeItems, self)
            }

            if (value) {
              return self._loadData(value, type)
            }
          })
      }
    }

    if (activeRef && !isEmptyObject(activeRef)) {
      $hd_item.text(activeRef.label).attr('title', activeRef.label)
    } else {
      $hd_item.text('请选择').attr('title', '请选择')
    }

    if (reuseableHead) {
      checkSurPlusHead(index)
      $head.off()
    } else {
      $head.append($hd_item)
    }

    $hd_item.click(function() {
      const index = $(this).index()

      $(this)
        .addClass('active')
        .siblings()
        .removeClass()

      $body
        .children()
        .eq(index)
        .show()
        .addClass('active')
        .siblings()
        .hide()
        .removeClass('active')
    })

    !reuseableBody && $body.append($panel)

    if (dataRef && dataRef.length) {
      self._renderPanel(dataRef, ++index)
    } else {
      if (activeRef && activeRef.hasChildren && activeRef.value) {
        self._loadData(activeRef.value, ++index)
      } else {
        // 如果存在可复用的 BODY element
        if (reuseableBody) {
          // update class status
          $hd_item
            .addClass('active')
            .siblings()
            .removeClass()
          $hd_item
            .show()
            .prevAll()
            .show()
          $hd_item.nextAll().hide()

          $body
            .children()
            .eq(index)
            .show()
            .addClass('active')
            .nextAll()
            .hide()
            .removeClass('active')
        } else {
          $hd_item
            .addClass('active')
            .siblings()
            .removeClass()

          $body
            .children()
            .eq(index)
            .show()
            .addClass('active')
            .siblings()
            .hide()
            .removeClass('active')
        }

        // 无 children 项，返回 value 和 label
        // if (activeRef && !activeRef.hasChildren) {
        //  $hd.text(activeRef.fullName || activeRef.label)
        // hide those DOM elements
        //   self.$doc.click()

        //   isFunction(onChange) && onChange(activeRef)
        // }
      }
    }

    !this._initialized && this._updateInput()
  }

  /**
   * getLabelText
   * @description 返回当前选中的 label 文字
   * @param {*} separator 分隔符
   * @param {Boolean} returnArray 返回一个数组
   * @returns {String|Array }
   */
  getLabelText(separator = ' ', returnArray) {
    const { $head } = this
    const { placeholder } = this.options
    const labels = []

    $head.children().each(function() {
      const $that = $(this)
      const text = $that.text().trim()
      const visible = $that.css('display') !== 'none'

      if (visible && text !== placeholder) {
        labels.push(text)
      }
    })

    return returnArray ? labels : labels.join(separator)
  }

  /**
   * complete
   * @description 完成当前 Cascader 状态
   * @param {Boolean} visible 是否隐藏 Cascader => Popover
   * @returns {undefined}
   */
  complete(visible) {
    // close current popover CascaderBody
    !visible && this.$doc.click()
    this._updateInput()

    const { onComplete } = this.options

    if (isFunction(onComplete)) {
      onComplete(this.activeItem, this.activeItems, this)
    }
  }

  _updateInput() {
    const { $input } = this
    const { value } = this.activeItem || {}
    const { placeholder } = this.options
    const label = this.getLabelText() || placeholder

    if ($input.prop('tagName') === 'INPUT') {
      $input
        .val(label)
        .data('value', value)
        .attr('value', value)
    } else {
      $input.text(label).data('value', value)
    }

    this._initialized = true
  }
}

$.fn.initCascader = function $Cascader(options = {}) {
  return this.each(function() {
    return new Cascader(
      isFunction(options)
        ? {
            ...options,
            onComplete: options,
            ele: this
          }
        : {
            ...options,
            ele: this
          }
    )
  })
}
