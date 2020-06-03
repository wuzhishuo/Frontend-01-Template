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
    return matchCombinationSelector(selector);
  }

  return matchCombinationSelector(selector);
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
  let selectorLeft = selector.split(/^[\s>~\+]$/)[0];
  let selectorRight = selector.split(/^[\s>~\+]$/)[1];

  if (!matchCombinationSelector(selectorRight, element)) {
    return false;
  }

  if (selector.includes('>')) {
  } else if (selector.includes('~')) {
  } else if (selector.includes('+')) {
  } else {
  }
}

function matchCombinationSelector(selector, element) {
  if (isSimpleSelector(selector)) {
    return matchSimpleSelector(selector, element);
  }
}

function isSimpleSelector(selector) {
  return (
    /^\w+[\-]?\w+$/.test(selector) ||
    /^#\w+[\-]?\w+$/.test(selector) ||
    /^\[\]$/.test(selector)
  );
}

match('div #id.class', document.getElementById('id'));
