// Libs
function React() {
  return {
    createElement: function(elem, attrs, childNodes) {
      const element = document.createElement(elem);
      if (attrs) Object.keys(attrs).forEach(k => element.setAttribute(k, attrs[k]));
      if (childNodes[0]) childNodes.forEach(child => element.appendChild((typeof child == "string") ? document.createTextNode(child) : child));
      return element;
    }
  }
}

function ReactDOM() {
  return {
    render: function(component, root) {
      while (root.children[0])
        root.removeChild(root.children[0]);

      root.appendChild(component.elem(component.props, component.dispatch, component.children), root);
    }
  }
}

function Redux() {
  return {
    createStore: function(stateReducer, middlewares) {
      var state = {}, listeners = [];

      function getState() {
        return state;
      }

      function dispatch(action) {
        if (middlewares.logActions) middlewares.logActions("before", state, action);
        state = stateReducer(state, action);
        if (middlewares.logActions) middlewares.logActions("after", state, action);
        listeners.forEach(listener => listener.func(...listener.params));
      }

      function subscribe(listener) {
        listeners.push(listener);
        return () => {
          listeners = listeners.filter(l => l !== listener);
        }
      }

      dispatch({type: "@@INIT"});

      return { getState, dispatch, subscribe };
    },
    combineReducers: function(reducers) {
      return (state, action) => {
        return Object.keys(reducers).reduce((combined, k) => {
          combined[k] = reducers[k](state[k], action);
          return combined;
        }, {});
      }
    },
    storeMiddlewares: {
      logActions: function(stage, state, action) {
        if  (action.type != "@@INIT") {
          if (stage == "before") {
            console.log("\n%cCurrent State: ", "font-weight: bold; color: #0b0;", state);
            console.log(`Action Dispatched: %c"${action.type}"`, "color: #e00;");
          }
          if (stage == "after")
            console.log("%cUpdated State: ", "font-weight: bold; color: #0b0;", state);
        }
      }
    }
  }
}


// Initialize/import Libs
React = React();
ReactDOM = ReactDOM();
Redux = Redux();


// App Components
Components = {
  Shell: function(props, dispatch, children) {
    const styles = {
      app: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; margin: auto; background-color: #07e;
      `
    }

    const store = props.store;
    const menuState = store.getState().menuState;

    return React.createElement("div", {style: styles.app}, children);
  },
  Header: function(props, dispatch, children) {
    const styles = {
      header: `
        position: absolute; top: 0; left: 0; right: 0;
        display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
        height: 2.75em; padding: 0 0 0 0.5em; border-bottom: 1px solid #000; background-color: #eee;
      `,
      icon: `height: 2em; width: 2em;`,
      title: `margin-left: 0.25em; color: #222; font-size: 1.5em;`
    }

    const icon = React.createElement("img", {style: styles.icon, src: "./favicon.ico", alt: "c.ai Icon"}, [null]);
    icon.addEventListener("click", function(e) {
      dispatch({type: "TOGGLE_MENU"})
    });

    const title = React.createElement("h1", {style: styles.title}, ["c.ai"]);
    title.addEventListener("click", function() {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", view: "HOME"})
    });

    return React.createElement("div", {style: styles.header}, [icon, title]);
  }
}

// State Reducers
Reducers = {
  viewState: function (state = "HOME", action) {
    const viewChoices = {
      "CHANGE_VIEW": () => action.payload,
      "NAV_TO": () => action.payload,
      "DEFAULT": () => state
    }
    return viewChoices[action.type] ? viewChoices[action.type]() : viewChoices["DEFAULT"]();
  },
  menuState: function (state = "CLOSED", action) {
    const menuChoices = {
      "TOGGLE_MENU": () => (state == "CLOSED") ? "OPEN" : "CLOSED",
      "OPEN_MENU": () => "OPEN",
      "CLOSE_MENU": () => "CLOSED",
      "DEFAULT": () => state
    }
    return menuChoices[action.type] ? menuChoices[action.type]() : menuChoices["DEFAULT"]();
  },
  headerState: function (state = "VISIBLE", action) {
    const menuChoices = {
      "TOGGLE_HEADER": () => (state == "VISIBLE") ? "HIDDEN" : "VISIBLE",
      "SHOW_MENU": () => "VISIBLE",
      "CLOSE_MENU": () => "HIDDEN",
      "DEFAULT": () => state
    }
    return menuChoices[action.type] ? menuChoices[action.type]() : menuChoices["DEFAULT"]();
  }
}


// Combine reducers & create store
const InitialState = Redux.combineReducers(Reducers);
const ReduxStore = Redux.createStore(InitialState, Redux.storeMiddlewares);

// Initial render data


// Initial render
ReactDOM.render({
  elem: Components.Shell,
  props: {store: ReduxStore},
  dispatch: ReduxStore.dispatch,
  children: [{func: Components.Header, params: [
    {store: ReduxStore}, ReduxStore.dispatch, [null]
  ]}]
}, document.getElementById("AppRoot"));

// Subscribe render method
ReduxStore.subscribe({
  func: ReactDOM.render,
  params: [{
    elem: Components.Shell,
    props: {store: ReduxStore},
    dispatch: ReduxStore.dispatch,
    children: [{func: Components.Header, params: [
      {store: ReduxStore}, ReduxStore.dispatch, [null]
    ]}]
  }, document.getElementById("AppRoot")]
});
