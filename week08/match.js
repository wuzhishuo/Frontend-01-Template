function match(selector, element) {
  if (!element || !selector) {
    return false;
  }

  if (selector === '*') {
    return true;
  }

  if (isSimpleSelector(selector)) {
    return matchSimpleSelector(selector, element);
  }

  if (/[\s\+~>]+/.test(selector)) {
    return matchComplexSelector(selector, element);
  }

  return matchCombinationSelector(selector, element);
}

function matchSimpleSelector(selector, element) {
  if (selector.charAt(0) === '#') {
    let idAttr = element.getAttribute('id');
    return idAttr && idAttr.value === selector.replace('#', '');
  } else if (selector.charAt(0) == '.') {
    let classAttr = element.getAttribute('class');

    return (
      classAttr && classAttr.value.indexOf(selector.replace('.', '')) != -1
    );
  } else if (selector.charAt(0) == '[') {
    let selectorAttrName = selector.split('=')[0];
    let selectorAttrValue = selector.split('=')[1];

    if (selectorAttrValue !== undefined) {
      return element.getAttribute(selectorAttrName) === selectorAttrValue;
    } else {
      return element.hasAttribute(selectorAttrName);
    }
  } else {
    return element.tagName.toLowerCase() === selector.toLowerCase();
  }
}

function matchComplexSelector(selector, element) {
  const selectorLeft = selector.split(/^[\s>~\+]$/)[0];
  const selectorRight = selector.split(/^[\s>~\+]$/)[1];

  if (!matchCombinationSelector(selectorRight, element)) {
    return false;
  }

  if (selector.includes('>')) {
    const parent = element.parentElement;
    if (!parent) {
      return false;
    }
    return matchCombinationSelector(selectorLeft, parent);
  } else if (selector.includes('~')) {
    const parent = element.parentElement;
    const children = Array.from(parent.children);

    if (children.length <= 1) {
      return false;
    }

    let isMatch = false;

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child !== element && matchCombinationSelector(selectorLeft, child)) {
        isMatch = true;
        break;
      }
    }

    return isMatch;
  } else if (selector.includes('+')) {
    const previousElementSibling = element.previousElementSibling;
    if (!previousElementSibling) {
      return false;
    }

    return matchCombinationSelector(selectorLeft, previousElementSibling);
  } else {
    let parent = element.parentElement;
    let isMatch = false;

    while (parent && !isMatch) {
      isMatch = matchCombinationSelector(selectorLeft, parent);

      if (!isMatch) {
        parent = parent.parentElement;
      }
    }

    return isMatch;
  }
}

function matchCombinationSelector(selector, element) {
  if (isSimpleSelector(selector)) {
    return matchSimpleSelector(selector, element);
  }

  const simpleSelectors = selector.match(/[#\.\[]?\w+[-=]?\w?\]?/g) || [];

  let isMatch = false;
  for (const simpleSelector of simpleSelectors) {
    isMatch = matchSimpleSelector(simpleSelector, element);

    if (!isMatch) {
      break;
    }
  }

  return isMatch;
}

function isSimpleSelector(selector) {
  return (
    /^\w+[\-]?\w+$/.test(selector) ||
    /^#\w+[\-]?\w+$/.test(selector) ||
    /^\.\w+[\-]?\w+$/.test(selector) ||
    /^\[\]$/.test(selector)
  );
}

match('div #id.class', document.getElementById('id'));
