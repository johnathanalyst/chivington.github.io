/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: GitHub Web App                                                           *
 * Description: Single page GitHub app, modeled after Redux/React.                   *
 * --------------------------------------------------------------------------------- */


/* ------------------------------------- Libs ------------------------------------- *
 * -- UI & state "framework" objects/constructors                                   *
 * -------------------------------------------------------------------------------- */
// React - for creating elements and diffing/maintaining vdom tree
const React = {
  createElement: function(elem, attrs, children) {
    const element = document.createElement(elem);

    if (attrs) Object.keys(attrs).forEach(k => element.setAttribute(k, attrs[k]));

    if (children.length >= 1) children.forEach(child => element.appendChild((typeof child == "string")
      ? document.createTextNode(child)
      : (child.elem) ? child.elem(child.props, child.dispatch, child.children) : child
    ));

    return element;
  }
}

// ReactDOM - for rendering/updating dom based on vdom tree
const ReactDOM = {
  render: function(component, root) {
    while (root.children[0]) root.removeChild(root.children[0]);
    root.appendChild(component.elem(component.props, component.dispatch, component.children));
  }
}

// Redux - for maintaining application state
const Redux = {
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


/* ----------------------------------- Components --------------------------------- *
 * -- Components can be entire views, important/reused parts of views, or more      *
 *  abstract/hidden devices like Shell & Router.                                    *
 * -------------------------------------------------------------------------------- */
 const Views = {
   Home: function(props, dispatch, children) {},
   About: function(props, dispatch, children) {},
   Projects: function(props, dispatch, children) {},
   Cover: function(props, dispatch, children) {},
   Resume: function(props, dispatch, children) {}
 }

/* ----------------------------------- Components --------------------------------- *
 * -- Components can be entire views, important/reused parts of views, or more      *
 *  abstract/hidden devices like Shell & Router.                                    *
 * -------------------------------------------------------------------------------- */
const Components = {
  // Shell - contains the header, menu, and router.
  Shell: function(props, dispatch, children) {
    const styles = {
      shell: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; margin: auto; background-color: #07e;
      `
    }

    const store = props.store;
    const menuState = store.getState().menuState;

    return React.createElement("div", {style: styles.shell}, [
      { elem: Components.Header, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Menu, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Router, props: { store }, dispatch: dispatch, children: [] },
      ...children
    ]);
  },
  // Header - contains menu toggle button, title/home link, and top-level (favorites/most recent) routes.
  Header: function(props, dispatch, children) {
    const styles = {
      header: `
        position: absolute; top: 0; left: 0; right: 0;
        display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
        height: 2.75em; padding: 0 0 0 0.5em; border-bottom: 1px solid #000; background-color: #eee;
      `,
      icon: `height: 2em; width: 2em; cursor: pointer;`,
      title: `margin-left: 0.25em; color: #222; font-size: 1.5em;`
    }

    const icon = React.createElement("img", {style: styles.icon, src: "./favicon.ico", alt: "c.ai Icon"}, []);
    icon.addEventListener("click", function(e) {
      dispatch({type: "TOGGLE_MENU"})
    });

    const title = React.createElement("h1", {style: styles.title}, ["c.ai"]);
    title.addEventListener("click", function() {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "HOME"})
    });

    const header = React.createElement("div", {style: styles.header}, [icon, title]);
    return header;
  },
  // Menu - layered/collapsible full-route menu.
  Menu: function(props, dispatch, children) {
    const styles = {
      menuOpen: `
        position: absolute; top: 2.8em; left: 0; bottom: 0; width: 7em; padding: 0.25em 1em 0 0; z-index: 10;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-color: rgba(0, 55, 125, 0.8); border-right: 1px solid #000; animation: menuOpen 0.15s 1;
      `,
      menuClosed: `
        display: none;
      `,
      link: `
        padding: 0.5em; border-bottom: 0.5px solid #ddd; color: #fff; cursor: pointer;
      `
    }

    const menuStyle = (props.store.getState().menuState == "OPEN") ? styles.menuOpen : styles.menuClosed;

    const home = React.createElement("a", {style: styles.link}, ["Home"]);
    home.addEventListener("click", function(){
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "HOME"});
    });

    const about = React.createElement("a", {style: styles.link}, ["Me"]);
    about.addEventListener("click", function() {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "ABOUT"});
    });

    const projects = React.createElement("a", {style: styles.link}, ["Projects"]);
    projects.addEventListener("click", function () {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "PROJECTS"});
    });

    const cover = React.createElement("a", {style: styles.link}, ["Cover"]);
    cover.addEventListener("click", function () {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "COVER"});
    });

    const resume = React.createElement("a", {style: styles.link}, ["Resume"]);
    resume.addEventListener("click", function () {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "RESUME"});
    });


    return React.createElement("div", {style: menuStyle}, [home, about, projects, cover, resume, ...children]);
  },
  // Router - maintains view routes. (viewing, tabs, minimized...)
  Router: function(props, dispatch, children) {
    const styles = {
      router: `
        position: absolute; top: 2.75em; left: 0; bottom: 0; right: 0;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: #07e;
      `
    }

    const view = props.store.getState().viewState.toLowerCase();
    const stl = `color: #fff; font-family: sans-serif;`, url = "https://github.com/chivingtoninc";
    const ln = `${url}${view == "projects" ? "?tab=repositories": ""}`;
    const msg = React.createElement("a", {style: stl, href: ln}, [ln]);

    const router = React.createElement("div", {style: styles.router}, [view, msg]);
    router.addEventListener("click", function(){
      dispatch({type: "CLOSE_MENU"});
    });

    return router;
  },
  // View - contains, positions, maintains an entire view; i.e. the whole screen.
  // View: function(props, dispatch, children) {
  //   const styles = {
  //     view: `
  //       position: absolute; top: 2.75em; left: 0; bottom: 0; right: 0;
  //       display: flex; flex-direction: column; justify-content: center; align-items: center;
  //       background-color: #07e;
  //     `
  //   }
  //
  //   const viewName = props.store.getState().viewState;
  //
  //   const view = React.createElement("div", {style: styles.view}, [
  //     { elem: , props: props, dispatch: dispatch, children: ["View Child"] }
  //   ]);
  //
  //   view.addEventListener("click", function(){
  //     dispatch({type: "CLOSE_MENU"});
  //   });
  //
  //   return view;
  // }
}


/* -------------------------------- State Reducers -------------------------------- *
 * -- Functions that reduce state into stucture/object based on several choices.    *
 * -------------------------------------------------------------------------------- */
const Reducers = {
  // initializes/maintains view state
  viewState: function (state = "HOME", action) {
    const viewChoices = {
      "NAV_TO": () => action.payload,
      "DEFAULT": () => state
    }
    return viewChoices[action.type] ? viewChoices[action.type]() : viewChoices["DEFAULT"]();
  },
  // initializes/maintains menu state
  menuState: function (state = "CLOSED", action) {
    const menuChoices = {
      "TOGGLE_MENU": () => (state == "CLOSED") ? "OPEN" : "CLOSED",
      "OPEN_MENU": () => "OPEN",
      "CLOSE_MENU": () => "CLOSED",
      "DEFAULT": () => state
    }
    return menuChoices[action.type] ? menuChoices[action.type]() : menuChoices["DEFAULT"]();
  },
  // initializes/maintains header state
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

/* -- Combine reducers into one function & create store. Initializes state based
  on default params or "DEFAULT" choices of reducer functions. */
const InitialState = Redux.combineReducers(Reducers);
const ReduxStore = Redux.createStore(InitialState, Redux.storeMiddlewares);


/* ---------------------------------- Rendering ----------------------------------- *
 *  -- Render to the DOM once, passing in Redux Store. App renders based on state   *
 * of the Redux Store. Then subscribe Render method to the Redux Store. Any change  *
 * in the store state and the UI "React"s accordingly.                              *
 * -------------------------------------------------------------------------------- */

 /* -- Currently results in refresh of entire app. Soon to add app/ui state diffing
   to only refresh a particular "branch/sub-branch of ui tree" based on corresponding
   changes in the "app state tree" or subtree of. */

// Initial render
ReactDOM.render({
  elem: Components.Shell,
  props: {store: ReduxStore},
  dispatch: ReduxStore.dispatch,
  children: []
}, document.getElementById("AppRoot"));

// Subscribe render method to ReduxStore
ReduxStore.subscribe({
  func: ReactDOM.render,
  params: [{
    elem: Components.Shell,
    props: {store: ReduxStore},
    dispatch: ReduxStore.dispatch,
    children: []
  }, document.getElementById("AppRoot")]
});