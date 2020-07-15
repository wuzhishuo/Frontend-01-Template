function createElement(Cls, attributes, ...children) {
  let o;
  if (typeof Cls === 'string') {
    o = new Wrapper(Cls);
  } else {
    o = new Cls();
  }

  for (const name in attributes) {
    if (attributes.hasOwnProperty(name)) {
      o.setAttribute(name, attributes[name]);
    }
  }

  let visit = children => {
    for (const child of children) {
      if (child instanceof Array) {
        visit(child);
        continue;
      }

      if (typeof child == 'text') {
        child = new Text(child);
      } else {
        o.appendChild(child);
      }
    }
  };

  visit(children);

  return o;
}

class Wrapper {
  constructor(type) {
    this.children = [];
    this.root = document.createElement(type);
  }
  set class(v) {}

  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }

  appendChild(child) {
    this.children.push(child);
  }

  addEventListener() {
    this.root.addEventListener(...arguments);
  }

  get style() {
    return this.root.style;
  }

  mountTo(parent) {
    parent.appendChild(this.root);
    for (const child of this.children) {
      child.mountTo(this.root);
    }
  }
}

class Text {
  constructor(text) {
    this.children = [];
    this.root = document.createTextNode(text);
  }

  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

module.exports = createElement;
