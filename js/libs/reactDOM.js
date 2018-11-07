function ReactDOM() {
  return {
    render: function(component, root) {
      while (root.children[0])
        root.removeChild(root.children[0]);

      root.appendChild(component.elem(component.props, component.dispatch, component.children), root);
    }
  }
}

module.exports = { ReactDOM }
