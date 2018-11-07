function React() {
  return {
    createElement: function(elem, props, children) {
      const element = document.createElement(elem);
      if (props) Object.keys(props).forEach(k => element.setAttribute(k, props[k]));
      if (children[0]) children.forEach(child => element.appendChild((typeof child == "string") ? document.createTextNode(child) : child));
      return element;
    }
  }
}

module.exports = { React }
