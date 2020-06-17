# 第 10 周总结

## 本周主要学习内容

浏览器中的 API 繁多，具体参考[Web API 脑图](http://naotu.baidu.com/file/c91368c1fba9267ff03abe765cfe517b?token=2e2fce5de4803924)

- 重新浏览器 API 之 Range API
- 重学浏览器 API 之 CSSOM API、CSSOM View API
- 编程与算法练习- 井字棋

## Range API

- Range API 功能非常强大的节点操作 API
- 创建 Range 的两种方式
  - var range= new Range() 结合 range.setStart(element,9)、range.setEnd(element,4)
  - document.getSelection().getRangeAt(0)
- 其他相关 API
  - setStartBefore、setEndBefore、seStartAfter、setEndAfter、selectNode、selectNodeContents
  - extractContents，将节点从 DOM 摘取下来返回 fragment

## CSSOM API

- document.styleSheets，文档中的所有样式表
- insertRule、removeRule 修改样式表中的内容
- cssRules 获取样式表中的所有规则
- window.getComputedStyle(elt, pseudoElt)，获取一个元素最终经过 CSS 计算得到的属性

## CSSOM View API

分为窗口部分，滚动部分和布局部分三部分

### 窗口 API，用于操作浏览器窗口的位置、尺寸等

- moveTo(x, y)、moveBy(x, y)、resizeTo(x, y)、resizeBy(x, y)

### 滚动 API

- 视口滚动 API：scrollX、scrollY、scroll(x,y)、scrollBy(x,y)
- 元素滚动 API：scrollLeft(对应视口滚动的 scrollX)、scrollTop(对应视口滚动的 scrollY)、scroll(x,y)、scrollBy(x,y)、scrollWidth、scrollHeight、scrollIntoView(arg)

### 布局 API

- 全局尺寸信息：window.innerHeight、window.innerWidth、window.devicePixelRatio
- 元素的布局信息：getClientRects()、getBoundingClientRect()
- 获取相对坐标，或者包含滚动区域的坐标：
  - var offsetX = document.documentElement.getBoundingClientRect().x - element.getBoundingClientRect().x;
