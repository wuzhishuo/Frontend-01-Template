var page = require('webpage').create();
page.open('http://127.0.0.1:8080', function(status) {
  var body = page.evaluate(function() {
    var toString = function(pad, element) {
      var children = element.children;
      var childrenString = '';

      for (var i = 0; i < children.length; i++) {
        childrenString += toString(' ' + pad, children[i]) + '\n';
      }
      var name;

      if (element.nodeType === Node.TEXT_NODE) {
        name = '#text' + JSON.stringify(element.textContent);
      }

      if (element.nodeType === Node.ELEMENT_NODE) {
        name = element.tagName;
      }

      return pad + name + (childrenString ? '\n' + childrenString : '');
    };
    return toString('', document.body);
  });
  console.log(body);
  phantom.exit();
});
