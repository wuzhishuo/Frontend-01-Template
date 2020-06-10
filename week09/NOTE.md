# 每周总结可以写在这里

## 本周主要学习内容

- 重学 CSS 渲染与颜色
- 重学 CSS 动画
- 重学 HTML
- [CSS 属性脑图](http://naotu.baidu.com/file/4d0d341d545c593d3c4c9ddef71185bd?token=ed85180ae23bc3be)

### 颜色

- 颜色的表示法
  - RGB，红、绿、蓝
  - CMYK，品红、黄、青、黑
  - HSL，色相（H）、饱和度（S）、明度（L），语义化颜色，推荐使用

### 形状

- 很多属性会产生形状
  - border
  - box-shadow
  - border-radius
- 不用 CSS 属性画形状，让属性回归基本的用途，更好的替代品：datauri+svg

### CSS 动画

- 与动画相关的两个属性
  - animation，由六部分组成：
    - animation-name 动画的名称
    - animation-duration 动画的时长
    - animation-timing-function 动画的时间曲线
    - animation-delay 动画开始前的延迟
    - animation-iteration-count 动画的播放次数
    - animation-direction 动画的方向
  - transition，由四部分组成：
    - transition-property 要变换的属性
    - transition-duration 变换的时长
    - transition-timing-function 时间曲线
      - ease-in，用于侧边弹框收起
      - ease-out，用于侧边弹框弹出
      - ease，用于移动元素
    - transition-delay 延迟
- 可以把 transition 和 animation 组合，抛弃 animation 的 timing-function，以编排不同段用不同的曲线

```
@keyframes mykf {
  from { top: 0; transition:top ease}
  50% { top: 30px;transition:top ease-in }
  75% { top: 10px;transition:top ease-out }
  to { top: 0; transition:top linear}
}
```

## 重学 HTML

### HTML 标签语义化

- HTML 标签语义化，当能准确知道使用哪个语义标签时才用，否则 div + span 走天下
- HTML 必须记住的四个实体，因为不能出现在 HTML 中，否则会造成 HTML 结构错误
  - \&gt;(>)
  - \&lg;(<)
  - \&amp;(&)
  - \&quot;(")

### DOM

- 导航类操作
  - parentNode
  - childNodes
  - firstChild
  - lastChild
  - nextSibling
  - previousSibling
- 导航类操作
  - appendChild
  - insertBefore
  - removeChild
  - replaceChild
- 导航类操作和导航类操作都有对应的 element 版本，但是不建议使用
- 高级操作
  - compareDocumentPosition 是一个用于比较两个节点中关系的函数
  - contains 检查一个节点是否包含另一个节点的函数
  - isEqualNode 检查两个节点是否完全相同
  - isSameNode 检查两个节点是否是同一个节点，实际上在 JavaScript 中可以用“===”
  - cloneNode 复制一个节点，如果传入参数 true，则会连同子元素做深拷贝
- node 只有一个父 node，二次操作一个 DOM，会直接移到后面的 node 中
- 所有的修改都会实时更新到 DOM
