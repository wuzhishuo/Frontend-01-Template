const css = require('css');

const EOF = Symbol('EOF');
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;
let stack = [{ type: 'document', children: [] }];

function emit(token) {
  let top = stack[stack.length - 1];

  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attribute: []
    };

    element.tagName = token.tagName;
    for (const p in token) {
      if (p !== 'type' && p !== 'tagName') {
        element.attribute.push({
          name: p,
          value: token[p]
        });
      }
    }
    computeCss(element);
    top.children.push(element);
    element.parent = top;

    if (!token.isSelfCloseTag) {
      stack.push(element);
    }

    currentTextNode = null;
  } else if (token.type == 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error("Start tag doesn't match end tag");
    } else {
      if (top.tagName === 'style') {
        addCssRules(top.children[0].content);
      }

      stack.pop();
      currentTextNode = null;
    }
  } else if (token.type == 'text') {
    if (currentTextNode == null) {
      currentTextNode = {
        type: 'text',
        content: ''
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

function data(c) {
  if (c === '<') {
    return tagOpen;
  } else if (c == EOF) {
    emit({
      type: 'EOF'
    });
    return;
  } else {
    emit({
      type: 'text',
      content: c
    });
    return data;
  }
}

function tagOpen(c) {
  if (c == '/') {
    return endTagOpen;
  } else if (c.match(/^[A-Za-z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    };
    return tagName(c);
  } else {
    return;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: ''
    };
    return tagName(c);
  } else if (c == '>') {
    return data;
  } else {
    return '';
  }
}

function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '/') {
    return selfClosingStartTagName;
  } else if (c.match(/^[A-Za-z]$/)) {
    currentToken.tagName += c;
    return tagName;
  } else if (c === '>') {
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '>' || c == EOF) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return afterAttributeName;
  } else if (c == '/') {
    return selfClosingStartTagName;
  } else if (c === '=') {
  } else {
    currentAttribute = {
      name: '',
      value: ''
    };

    return attributeName;
  }
}

function selfClosingStartTagName(c) {
  if (c == '>') {
    currentToken.isSelfCloseTag = true;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
    return;
  }
}

function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
    return afterAttributeName;
  } else if (c == '=') {
    return beforeAttributeValue;
  } else if (c == '\u0000') {
  } else if (c == '"' || c == '' || c == '<') {
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return data;
  } else if (c === '>') {
    return data;
  } else if (c == '=') {
    return beforeAttributeValue;
  } else if (c == '/') {
    currentToken.isSelfCloseTag = true;
    return selfClosingStartTagName;
  } else if (c == EOF) {
    emit({
      type: 'EOF'
    });
    return data;
  } else {
    return attributeName(c);
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
    return beforeAttributeValue;
  } else if (c == '"') {
    return doubleQuoteAttributeValue;
  } else if (c == "'") {
    return singleQuoteAttributeValue;
  } else if (c == '>') {
  } else {
    return unQuoteAttributeValue;
  }
}

function doubleQuoteAttributeValue(c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == '\u0000') {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuoteAttributeValue;
  }
}

function singleQuoteAttributeValue(c) {
  if (c == "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == '\u0000') {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return singleQuoteAttributeValue;
  }
}

function unQuoteAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c == '/') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTagName;
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == '\u0000') {
  } else if (c == '"' || c == "'" || c == '<' || c == '=' || c == '`') {
  } else {
    currentAttribute.value += c;
    return unQuoteAttributeValue;
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '/') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentToken.isSelfCloseTag = true;
    return selfClosingStartTagName;
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(token);
    return data;
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return beforeAttributeName;
  }
}

let cssRules = [];
function addCssRules(text) {
  let ast = css.parse(text);
  cssRules.push(...ast.stylesheet.rules);
}

function computeCss(element) {
  var elements = stack.slice().reverse();
  if (!element.computedStyle) {
    element.computedStyle = {};
  }

  for (const rule of cssRules) {
    let selectorParts = rule.selectors[0].split(' ').reverse();
    if (!match(element, selectorParts[0])) {
      continue;
    }

    let matchCssRule = false;

    let j = 1;
    for (let i = 0; i < elements.length; i++) {
      if (match(elements[i], selectorParts[j])) {
        j++;
      }
    }

    if (j >= selectorParts.length) {
      matchCssRule = true;
    }

    if (matchCssRule) {
      let sp = calculateSpecificity(rule.selectors[0]);
      let computedStyle = element.computedStyle;
      for (const declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {};

          if (!computedStyle[declaration.property].specificity) {
            computedStyle[declaration.property].specificity = sp;
            computedStyle[declaration.property].value = declaration.value;
          } else if (
            compare(computedStyle[declaration.property].specificity, sp) <= 0
          ) {
            computedStyle[declaration.property].specificity = sp;
            computedStyle[declaration.property].value = declaration.value;
          }
        }
      }
    }
  }
}

function match(element, selector) {
  if (!element || !selector) {
    return false;
  }

  if (selector.charAt(0) === '#') {
    let idAttr = element.attribute.filter(item => item.name === 'id')[0];
    return idAttr && idAttr.value === selector.replace('#', '');
  } else if (selector.charAt(0) == '.') {
    let classAttr = element.attribute.filter(item => item.name === 'class')[0];
    return classAttr && classAttr.value === selector.replace('.', '');
  } else {
    return element.tagName === selector;
  }
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0];
  }

  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1];
  }

  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2];
  }

  return sp1[3] - sp2[3];
}

function calculateSpecificity(selector) {
  let specificity = [0, 0, 0, 0];
  let selectorParts = selector.split(' ');

  for (const part of selectorParts) {
    if (part.charAt(0) === '#') {
      specificity[1] += 1;
    } else if (part.charAt(0) === '.') {
      specificity[2] += 1;
    } else {
      specificity[3] += 1;
    }
  }

  return specificity;
}

module.exports.parseHTML = function parseHTML(html) {
  let state = data;
  for (const c of html) {
    state = state(c);
  }

  state = state(EOF);
  console.log(stack[0]);
};
