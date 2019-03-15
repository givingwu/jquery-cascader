/*!
* jquery.cascader v1.0.0
* (c) 2019 Chan Wu
* @issue https://github.com/vuchan/jquery-cascader/issues/new
* @license MIT
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global = global || self, global.Cascader = factory(global.$));
}(this, function ($) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = _objectWithoutPropertiesLoose(source, excluded);

    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }

  // 复用 DOM
  var getPrevEle = function getPrevEle(dom) {
    return function () {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

      if (~index) {
        var children = dom.children();

        if (children && children.length) {
          return children.eq(index);
        }
      }
    };
  }; // 隐藏多余 DOM

  var hideSurplusEle = function hideSurplusEle(dom) {
    return function (index) {
      if (~index) {
        var children = dom.children();

        if (children && children.length && index < children.length) {
          return children.slice(index).hide();
        }
      }
    };
  };

  var noop = $.noop;
  var when = $.when;
  var extend = $.extend;
  var isArray = $.isArray;
  var isFunction = $.isFunction;
  var isEmptyObject = $.isEmptyObject; // default configurations

  var defaults = {
    placeholder: '请选择',
    // 未选中任何数据时的占位符文字
    ele: '.J_Cascader',
    // 容器元素，默认当前 $(ele).initCascader() 的 ele
    head: '.J_CascaderHead',
    // 容器元素 > head => 界面显示内容
    body: '.J_CascaderBody',
    // 容器元素 > body => 弹出框body
    input: '.J_CascaderVal',
    // 容器元素 > input => 输入框
    panelHead: ".J_PanelHead",
    // 容器元素 > Panel => PanelHead
    panelBody: ".J_PanelBody",
    // 容器元素 > Panel => PanelBody
    panelTpl: "<div class=\"cascader-panel-item\"></div>",
    // Panel-Item 模版字符串
    panelItemTpl: "<a href=\"javascript:void(0);\" title=\"\"></a>",
    // Panel-Item-Anchor 模版字符串
    animation: true,
    // 是否开启动画
    apiMethod: null,
    // 远程获取数据的方法 默认为 null
    onChange: noop,
    // 数据变化时的回调 onChange => (currentActiveItem: ActiveItem, allActiveItems[]<ActiveItem>)
    onComplete: noop // 当前级联选择成功或结束时调用 onComplete => (currentActiveItem: ActiveItem, allActiveItems: allActiveItems[]<ActiveItem>)

  };

  var Cascader =
  /*#__PURE__*/
  function () {
    function Cascader(options) {
      _classCallCheck(this, Cascader);

      var opts = extend({}, defaults, options);
      var ele = opts.ele,
          input = opts.input,
          value = opts.value,
          panelHead = opts.panelHead,
          panelBody = opts.panelBody;
      var $ele = $(ele);
      var $head = $ele.find(panelHead);
      var $body = $ele.find(panelBody); // 闭包传入参数，返回高阶函数 ele => $head & $body

      this.getPrevHead = getPrevEle($head);
      this.getPrevBody = getPrevEle($body); // 闭包传入参数，返回高阶函数 ele => $head & $body

      this.checkSurPlusHead = hideSurplusEle($head);
      this.checkSurPlusBody = hideSurplusEle($body);
      this.options = opts;
      this.$doc = $(document);
      this.$ele = $ele;
      this.$head = $head;
      this.$body = $body;
      this.$input = $ele.find(input);
      this.activeItem = null;
      this.activeItems = [];
      this._initialized = false;

      this._bindEvents(); // 绑定事件


      this._loadData(value); // 加载数据

    }
    /**
     * _loadData 加载数据
     * @description 调用 apiMethod 加载数据
     * @param {Number | String} id
     * @param {Number} depth
     */


    _createClass(Cascader, [{
      key: "_loadData",
      value: function _loadData() {
        var _this = this;

        var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        if (isNaN(+id)) return;
        var apiMethod = this.options.apiMethod;
        when(apiMethod && apiMethod(id, depth)).done(function (data) {
          if (data && data.length) {
            _this._renderPanel(data, depth);
          } else {
            _this.complete();
          }
        }).fail(console.error);
      }
    }, {
      key: "_bindEvents",
      value: function _bindEvents() {
        var _this$options = this.options,
            head = _this$options.head,
            body = _this$options.body,
            animation = _this$options.animation;
        var $ele = this.$ele,
            $doc = this.$doc;
        var $hd = $ele.find(head);
        var $bd = $ele.find(body);
        var $icon = $hd.find('.icon'); // show and hide

        $hd.click(function () {
          $ele.toggleClass('opened');
          $icon.toggleClass('icon-arrow-up');

          if (animation) {
            $bd.slideToggle('fast');
          } else {
            $bd.show();
          }

          $doc.on('click.toggle.CascaderBody', function (e) {
            var t = e.target;
            var c = $ele.is(t) || $ele.has(t).length;

            if (!c) {
              $doc.off('click.toggle.CascaderBody');
              $ele.toggleClass('opened');
              $icon.toggleClass('icon-arrow-up');

              if (animation) {
                $bd.slideUp();
              } else {
                $bd.hide();
              }
            }
          });
        });
      }
      /**
       * _renderPanel
       * @description 递归渲染 Tab Panel
       * @param {Array[DataItem<{ label: string, value: string | number, children?: DataItem[] }>]} data
       * @param {Number} index 当前递归深度
       */

    }, {
      key: "_renderPanel",
      value: function _renderPanel(data) {
        var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var self = this;
        var _this$options2 = this.options,
            panelTpl = _this$options2.panelTpl,
            panelItemTpl = _this$options2.panelItemTpl,
            onChange = _this$options2.onChange,
            placeholder = _this$options2.placeholder;
        var $head = this.$head,
            $body = this.$body,
            getPrevHead = this.getPrevHead,
            getPrevBody = this.getPrevBody,
            checkSurPlusHead = this.checkSurPlusHead,
            checkSurPlusBody = this.checkSurPlusBody; // 获取之前可复用的 head DOM

        var prevPanelHead = getPrevHead(index);
        var reuseableHead = prevPanelHead && prevPanelHead.length;
        var $hd_item = reuseableHead ? prevPanelHead : $(panelItemTpl); // 获取是否存在可重用的 panelBody DOM

        var prevPanelBody = getPrevBody(index);
        var reuseableBody = prevPanelBody && prevPanelBody.length; // 如果存在则复用之前 DOM，否则重新生成 DOM Fragment

        var $panel = reuseableBody ? prevPanelBody : $(panelTpl);

        if (reuseableBody) {
          // 检查多余的 $panel-body 然后隐藏它们
          checkSurPlusBody(index);
          $body.children().eq(index).show().siblings().hide(); // 重置回正常的状态  => 不隐藏，同时移除 active class

          $panel.children().show().removeClass('active'); // 检查多余的 $panel-item 然后隐藏它们

          isArray(data) && hideSurplusEle($panel)(data.length);
        } // 声明高阶函数 -> 获取是否存在可重用的 panelBodyItem DOM


        var getPrevItem = getPrevEle($panel);
        var dataRef = null; // data ref flag

        var activeRef = null; // active ref flag

        if (isArray(data) && data.length) {
          var _loop = function _loop(i, l) {
            var item = data[i];

            var label = item.label,
                value = item.value,
                type = item.type,
                parentId = item.parentId,
                active = item.active,
                disabled = item.disabled,
                children = item.children,
                props = _objectWithoutProperties(item, ["label", "value", "type", "parentId", "active", "disabled", "children"]);

            var currentItem = _objectSpread({
              label: label,
              value: value,
              parentId: parentId
            }, props);

            var prevItem = getPrevItem(i);
            var reuseableItem = prevItem && prevItem.length;
            var $bd_item = reuseableItem ? prevItem : $(panelItemTpl);
            $bd_item.text(label).attr('title', label).addClass(function () {
              return active && 'active';
            }).addClass(function () {
              return disabled && 'disabled';
            });

            if (reuseableItem) {
              // 将之前可重用元素的事件移除并在后面重新绑定
              $bd_item.off();
            } else {
              // 不可重用元素则 append 每个新元素
              $panel.append($bd_item);
            }

            if (active) {
              activeRef = currentItem;
              self.activeItem = currentItem;
              self.activeItems[index] = currentItem;
            }

            if (children && children.length) {
              dataRef = children;
            }

            !disabled && $bd_item.click(function () {
              $(this).addClass('active').siblings().removeClass('active');
              index = $hd_item.text(label).attr('title', label).data('value', value).index();
              /* 每次新点击一个元素，则理解为当前元素是 active 的，并触发 onChange 回调 */

              self.activeItem = currentItem;
              /* 当 index === 0 时，不能 slice(0, 0)，所以 offset = index + 1 */

              self.activeItems = self.activeItems.slice(0, index + 1);
              self.activeItems[index] = currentItem;

              if (isFunction(onChange)) {
                onChange(self.activeItem, self.activeItems, self);
              }

              if (value) {
                return self._loadData(value, type);
              }
            });
          };

          for (var i = 0, l = data.length; i < l; i++) {
            _loop(i, l);
          }
        }

        if (activeRef && !isEmptyObject(activeRef)) {
          $hd_item.text(activeRef.label).attr('title', activeRef.label);
        } else {
          $hd_item.text(placeholder).attr('title', placeholder);
        }

        if (reuseableHead) {
          checkSurPlusHead(index);
          $head.off();
        } else {
          $head.append($hd_item);
        }

        $hd_item.click(function () {
          var index = $(this).index();
          $(this).addClass('active').siblings().removeClass();
          $body.children().eq(index).show().addClass('active').siblings().hide().removeClass('active');
        });
        !reuseableBody && $body.append($panel);

        if (dataRef && dataRef.length) {
          self._renderPanel(dataRef, ++index);
        } else {
          if (activeRef && activeRef.hasChildren && activeRef.value) {
            self._loadData(activeRef.value, ++index);
          } else {
            // 如果存在可复用的 BODY element
            if (reuseableBody) {
              // update class status
              $hd_item.addClass('active').siblings().removeClass();
              $hd_item.show().prevAll().show();
              $hd_item.nextAll().hide();
              $body.children().eq(index).show().addClass('active').nextAll().hide().removeClass('active');
            } else {
              $hd_item.addClass('active').siblings().removeClass();
              $body.children().eq(index).show().addClass('active').siblings().hide().removeClass('active');
            } // 无 children 项，返回 value 和 label
            // if (activeRef && !activeRef.hasChildren) {
            //  $hd.text(activeRef.fullName || activeRef.label)
            // hide those DOM elements
            //   self.$doc.click()
            //   isFunction(onChange) && onChange(activeRef)
            // }

          }
        }

        !this._initialized && this._updateInput();
      }
      /**
       * getLabelText
       * @description 返回当前选中的 label 文字
       * @param {*} separator 分隔符
       * @param {Boolean} returnArray 返回一个数组
       * @returns {String|Array }
       */

    }, {
      key: "getLabelText",
      value: function getLabelText() {
        var separator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ' ';
        var returnArray = arguments.length > 1 ? arguments[1] : undefined;
        var $head = this.$head;
        var placeholder = this.options.placeholder;
        var labels = [];
        $head.children().each(function () {
          var $that = $(this);
          var text = $that.text().trim();
          var visible = $that.css('display') !== 'none';

          if (visible && text !== placeholder) {
            labels.push(text);
          }
        });
        return returnArray ? labels : labels.join(separator);
      }
      /**
       * complete
       * @description 完成当前 Cascader 状态
       * @param {Boolean} visible 是否隐藏 Cascader => Popover
       * @returns {undefined}
       */

    }, {
      key: "complete",
      value: function complete(visible) {
        // close current popover CascaderBody
        !visible && this.$doc.click();

        this._updateInput();

        var onComplete = this.options.onComplete;

        if (isFunction(onComplete)) {
          onComplete(this.activeItem, this.activeItems, this);
        }
      }
    }, {
      key: "_updateInput",
      value: function _updateInput() {
        var $input = this.$input;

        var _ref = this.activeItem || {},
            value = _ref.value;

        var placeholder = this.options.placeholder;
        var label = this.getLabelText() || placeholder;

        if ($input.prop('tagName') === 'INPUT') {
          $input.val(label).data('value', value).attr('value', value);
        } else {
          $input.text(label).data('value', value);
        }

        this._initialized = true;
      }
    }]);

    return Cascader;
  }();

  $.fn.initCascader = function $Cascader() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return this.each(function () {
      return new Cascader(isFunction(options) ? _objectSpread({}, options, {
        onComplete: options,
        ele: this
      }) : _objectSpread({}, options, {
        ele: this
      }));
    });
  };

  return Cascader;

}));
