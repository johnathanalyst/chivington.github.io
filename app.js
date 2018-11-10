// Libs
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


// App Components
Components = {
  Shell: function (props, dispatch, children) {
    const styles = {
      app: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; margin: auto; background-color: #cdc;
      `
    }

    const store = props.store;
    const menuState = store.getState().menuState;

    return React.createElement("div", {style: styles.app}, children);
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
  }
}


// Header(null, store.dispatch), Menu({menuState}, store.dispatch), Router(null, store.dispatch)

// Initialize Libs
React = React();
ReactDOM = ReactDOM();
Redux = Redux();

// combine reducers and create store
const InitialState = Redux.combineReducers(Reducers);
const ReduxStore = Redux.createStore(InitialState, Redux.storeMiddlewares);

ReduxStore.dispatch({type: "NAV_TO", payload: "HOME"})

// // initial render
// ReactDOM.render({
//   elem: Components.Shell,
//   props: {store: ReduxStore},
//   dispatch: ReduxStore.dispatch,
//   children: [null]
// }, document.getElementById("AppRoot"));
//
// // subscribe render method
// ReduxStore.subscribe({
//   func: ReactDOM.render,
//   params: [{
//     elem: Components.Shell,
//     props: {store: ReduxStore},
//     dispatch: ReduxStore.dispatch,
//     children: [null]
//   },
//   document.getElementById("AppRoot")
// ]});
