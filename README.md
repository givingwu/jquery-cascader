# Cascader

jQuery.Cascader 多级级联组件

## FEATURES

* 最大化复用DOM
* 支持本地/远程数据集合
* 支持通过`apiMethod`远程懒加载数据
* 递归渲染 item.children 支持任意深度树形数据

## ChangeLogs

+ 2019-03-14: feat: `Cascader` 支持 `config.options.onChange(currentActiveItem: Cascader.ActiveItem, allActiveItems: allActiveItems[]<ActiveItem>, cascader: Cascader)`, 支持 `Cascader.complete()` => `config.options.onComplete(currentActiveItem: Cascader.ActiveItem, allActiveItems: allActiveItems[]<ActiveItem>, cascader: Cascader)`, 支持 `Cascader.getLabelText(returnsArray: boolean): string` 获取所有 `label` 字符串。


# USAGE

## HTML fragment

```pug
.cascader.J_Cascader
  .cascader-hd.J_CascaderHead
    .cascader-hd-val.J_CascaderVal= '请选择配送地址'
    .cascader-hd-icon
      i.icon.yzwfont.icon-arrow-down
  .cascader-bd.J_CascaderBody
    .cascader-panel.J_Panel
      .cascader-panel-hd.J_PanelHead
      .cascader-panel-bd.J_PanelBody
```

## Configuration Options

```js
const defaults = {
  ele: '.J_Cascader', // 容器元素，默认当前 $(ele).initCascader() 的 ele
  value: null, // Cascader 的初始值，传入后会通过调用 apiMethod 获取数据填充级联选择器容器内部 DOM
  head: '.J_CascaderHead', // 容器元素 > head => 界面显示内容
  body: '.J_CascaderBody', // 容器元素 > body => 弹出框body
  input: '.J_CascaderVal', // 容器元素 > input => 输入框
  panelHead: `.J_PanelHead`, // 容器元素 > Panel => PanelHead
  panelBody: `.J_PanelBody`, // 容器元素 > Panel => PanelBody
  panelTpl: `<div class="cascader-panel-item"></div>`, // Panel-Item 模版字符串
  panelItemTpl: `<a href="javascript:void(0);" title=""></a>`, // Panel-Item-Anchor 模版字符串
  animation: true, // 是否开启动画
  apiMethod: null, // 远程获取数据的方法 默认为 null
  onChange: noop, // 数据变化时的回调 onChange => (currentActiveItem)
  onComplete: noop // 当前级联选择成功或结束时调用 onComplete => (currentActiveItem: ActiveItem, allActiveItems: allActiveItems[]<ActiveItem>)
}
```

`apiMethod` 返回的数据格式 需要经过适配 `dataAdapter(response.data)` 转换成如下数据结构：

```js
[{
   label: '', // 文字
   value: '', // ID
   children: [{
       label: '', // 文字
       value: '', // ID
       children: [{
         label: '', // 文字
         value: '', // ID
         children: [{}, {}, {}]
       }] // 递归的树形数据结构
   }, {}, {}] // 当前节点级联 children
}]
```

因为在 Cascader 组件内部通过循环第一层数据的`label`和`value`渲染 文字和ID 到每个DOM节点上，而且在过程中如果发现某个 item 的数据存在 children 字段，则记录当前的 children 引用，在第一层渲染结束后，则递归调用组件内部的 `renderPanel` 方法渲染第二层数据，循环往复。

## [Example]('../../../pages/search/index.js')

### ES6
```js
import Cookies from 'js-cookie'
import '../../includes/mixins/Cascader'
import { getAreas } from '../../includes/mixins/CommonRequest'

$('.J_Cascader').initCascader({
  value: Cookies.get('area-code') || null,
  apiMethod: getAreas,
  onChange: (currentActiveItem, allItems, cascaderInstance) => console.log(currentActiveItem, allItems, cascaderInstance),
  onComplete: ({ value: id, levelCode }) => {
    id && Cookies.set('area-code', id)
  }
})
```

### ES4

```HTML
<script src="packages/lib/jquery.js"></script>
<script src="packages/lib/js-cookie.js"></script>
<script src="packages/lib/qs.js"></script>
<script src="packages/components/commonrequest-runtime.js"></script>
<script src="packages/components/cascader-runtime.js"></script>
```

```js
$('.J_Cascader').initCascader({
  value: Cookies.get('area-code') || null,
  apiMethod: CommonRequest.getAreas,
  onChange: function (currentActiveItem, allItems, cascaderInstance) {
    console.log(currentActiveItem, allItems, cascaderInstance)
  },
  onComplete: function (activeItem) {
    console.log('activeItem: ', activeItem)
    const id = activeItem.value

    id && Cookies.set('area-code', id)
  }
})
```

# TODO

* 处理 数据加载 loading 动效
* 处理 数据加载 error 异常
