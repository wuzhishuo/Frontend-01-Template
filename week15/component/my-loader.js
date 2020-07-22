var parse = require('./parse');
module.exports = function(source) {
  let tree = parse.parseHTML(source);

  let template = null;
  let script = null;

  for (const node of tree.children) {
    if (node.tagName === 'template') {
      template = node.children.filter(e => e.type !== 'text')[0];
    }

    if (node.tagName === 'script') {
      script = node.children[0].content;
    }
  }

  let visit = node => {
    if (node.type === 'text') {
      return JSON.stringify(node.content);
    }

    let attrs = {};
    for (const attribute of node.attributes) {
      attrs[attribute.name] = attribute.value;
    }
    let children = node.children.map(node => visit(node));
    // console.log(node)
    
    return `createElement("${node.tagName}",${JSON.stringify(
      attrs
    )})`;
  };

  let r = `
  import createElement from './create-element.js';
  export class Carousel {
    setAttribute(name, value) {
      this[name] = value;
    }
    render() {
     return ${visit(template)}
    }
    mountTo(parent) {
      this.render().mountTo(parent);
    }
  }
`;
console.log(r)
  return r;
};
