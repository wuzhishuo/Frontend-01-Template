function getStyle(element) {
  if (!element.style) {
    element.style = {};
  }

  for (const prop in element.computedStyle) {
    if (element.computedStyle.hasOwnProperty(prop)) {
      element.style[prop] = element.computedStyle[prop].value;

      if (element.style[prop].toString().match(/px$/)) {
        element.style[prop] = parseInt(element.style[prop]);
      }

      if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
        element.style[prop] = parseInt(element.style[prop]);
      }
    }
  }
  return element.style
}

function layout(element) {
  if (!element.computedStyle) {
    return;
  }

  let elementStyle = getStyle(element);

  if (elementStyle.display != 'flex') {
    return;
  }

  let elementChildren = element.children.filter(
    item => item.type === 'element'
  );
  elementChildren.sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });

  ['width', 'height'].forEach(size => {
    if (elementStyle[size] == 'auto' || elementStyle[size] == '') {
      elementStyle[size] = null;
    }
  });

  if (!elementStyle.flexDirection || elementStyle.flexDirection == 'auto') {
    elementStyle.flexDirection = 'row';
  }

  if (!elementStyle.alignItems || elementStyle.alignItems == 'auto') {
    elementStyle.alignItems = 'stretch';
  }

  if (!elementStyle.justifyContent || elementStyle.justifyContent == 'auto') {
    elementStyle.justifyContent = 'flex-start';
  }

  if (!elementStyle.flexWrap || elementStyle.flexWrap == 'auto') {
    elementStyle.flexWrap = 'nowrap';
  }

  if (!elementStyle.alignContent || elementStyle.alignContent == 'auto') {
    elementStyle.alignContent = 'stretch';
  }

  let mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase,
    crossSize,
    crossStart,
    crossEnd,
    crossSign,
    crossBase;

  if (elementStyle.flexDirection == 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (elementStyle.flexDirection == 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainSign = -1;
    mainBase = elementStyle.width;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (elementStyle.flexDirection == 'column') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if (elementStyle.flexDirection == 'column-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainSign = -1;
    mainBase = elementStyle.height;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if (elementStyle.flexDirection == 'wrap-reverse') {
    let temp = crossEnd;
    crossEnd = crossStart;
    crossStart = temp;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = +1;
  }

  let isAutoMainSize = false;

  if (!elementStyle[mainSize]) {
    elementStyle[mainSize] = 0;

    for (const child of elementChildren) {
      let childStyle = getStyle(child);
      if (childStyle[mainSize] !== null && childStyle[mainSize] !== (void 0)) {
        elementStyle[mainSize] = elementStyle[mainSize] + childStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  let flexLine = [];
  let flexLines = [flexLine];
  let mainSpace = elementStyle[mainSize];
  let crossSpace = 0;

  for (const child of elementChildren) {
    let childStyle = getStyle(child);
    if (childStyle[mainSize] == null) {
      childStyle[mainSize] = 0;
    }

    if (childStyle.flex) {
      flexLine.push(childStyle);
    } else if (elementStyle.flexDirection == 'nowrap' && isAutoMainSize) {
      mainSpace -= childStyle[mainSize];
      if (childStyle[crossSize] !== null && childStyle[crossSize] !== void 0) {
        crossSpace += Math.max(crossSpace, childStyle[crossSize]);
      }
      flexLine.push(childStyle);
    } else {
      if (childStyle[mainSize] > elementStyle[mainSize]) {
        childStyle[mainSize] = elementStyle[mainSize];
      }

      if (mainSpace < childStyle[mainSize]) {
        // 记录上一行空间信息
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLines.push(flexLine);

        // 起新行
        flexLine = [childStyle];
        mainSpace = elementStyle[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(childStyle);
      }

      mainSpace -= childStyle[mainSize];
      if (childStyle[crossSize] !== null && childStyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, childStyle[crossSize]);
      }
    }
  }

  flexLine.mainSpace = mainSpace;
  if (elementStyle.flexWrap == 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = elementStyle[crossSize]
      ? elementStyle[crossSize]
      : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  // 布局只有一行
  if (mainSpace < 0) {
    let scale = mainSpace / (elementStyle[mainSize] - mainSpace);
    let currentMain = mainBase;

    for (const childStyle of elementChildren) {
      if (childStyle.flex) {
        childStyle[mainSize] = 0;
      }

      childStyle[mainSize] = childStyle[mainSize] * scale;
      childStyle[mainStart] = currentMain;
      childStyle[mainEnd] =
        childStyle[mainStart] + mainSign * childStyle[mainSize];
      currentMain = childStyle[mainEnd];
    }
  } else {
    flexLines.forEach(function(items) {
      let mainSpace = items.mainSpace;
      let flexTotal = 0;

      for (let i = 0; i < items.length; i++) {
        const flexItem = items[i];
        let itemStyle = getStyle(flexItem);
        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
        }
      }

      if (flexTotal > 0) {
        let currentMain = mainBase;

        for (let i = 0; i < items.length; i++) {
          const flexItem = items[i];
          let itemStyle = getStyle(flexItem);

          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        let currentMain, gap;
        if (elementStyle.justifyContent === 'flex-start') {
          currentMain = mainBase;
          gap = 0;
        }

        if (elementStyle.justifyContent === 'flex-end') {
          currentMain = mainSpace * mainSign + mainBase;
          gap = 0;
        }

        if (elementStyle.justifyContent === 'center') {
          currentMain = (mainSpace * mainSign) / 2 + mainBase;
          gap = 0;
        }

        if (elementStyle.justifyContent === 'space-between') {
          currentMain = mainBase;
          gap = (mainSpace / (items.length - 1)) * mainSign;
        }

        if (elementStyle.justifyContent === 'space-around') {
          gap = (mainSpace / items.length) * mainSign;
          currentMain = gap / 2 + mainBase;
        }

        for (let i = 0; i < items.length; i++) {
          const itemStyle = items[i];
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + gap;
        }
      }

    });
  }

  crossSpace=0;

  if (!elementStyle[crossSize]) {
    crossSpace = 0;
    elementStyle[crossSize] = 0;

    for (const flexLine of flexLines) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLine.crossSpace;
    }
  } else {
    crossSpace = elementStyle[crossSize];
    for (const flexLine of flexLines) {
      crossSpace -= flexLine.crossSpace;
    }
  }

  if (elementStyle.flexWrap == 'wrap-reverse') {
    crossBase = elementStyle[crossSize];
  } else {
    crossBase = 0;
  }

  let lineSize = elementStyle[crossSize] / flexLines.length;

  let gap = 0;
  if (elementStyle.alignContent == 'flex-start') {
    crossBase += 0;
    gap = 0;
  }
  if (elementStyle.alignContent == 'flex-start') {
    crossBase += crossSign * crossSpace;
    gap = 0;
  }
  if (elementStyle.alignContent == 'center') {
    crossBase += crossSign * (crossSpace / 2);
    gap = 0;
  }

  if (elementStyle.alignContent == 'space-between') {
    crossBase += 0;
    gap = crossSpace / flexLines.length - 1;
  }

  if (elementStyle.alignContent == 'space-around') {
    gap = crossSpace / flexLines.length;
    crossBase += crossSign * (gap / 2);
  }

  if (elementStyle.alignContent == 'stretch') {
    crossBase += 0;
    gap = 0;
  }

  flexLines.forEach(items => {
    let lineCrossSize =
      elementStyle.alignContent === 'stretch'
        ? flexLine.crossSpace + crossSpace / flexLines.length
        : flexLine.crossSpace;

    for (const itemStyle of items) {
      let align = itemStyle.alignSelf || elementStyle.alignItems;

      if (itemStyle[crossSize] === null) {
        itemStyle[crossSize] =
          elementStyle.alignContent === 'stretch' ? lineCrossSize : 0;
      }

      if (align == 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if (align == 'flex-end') {
        itemStyle[crossEnd] = crossBase + crossSign * itemStyle[crossSize];
        itemStyle[crossStart] =
          itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }

      if (align == 'center') {
        itemStyle[crossStart] =
          crossBase - (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
        itemStyle[crossEnd] =
          itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if (align == 'stretch') {
        itemStyle[crossStart] = crossBase;
        let itemCrossSize =
          itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0
            ? itemStyle[crossSize]
            : lineCrossSize;
        itemStyle[crossEnd] = crossBase + crossSign * itemCrossSize;

        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
      }
    }
    crossBase += crossSign * (lineCrossSize + gap)
  });
}

module.exports = layout
