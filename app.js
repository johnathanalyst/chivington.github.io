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


/* ------------------------------------- Views ------------------------------------ *
 * -- Views are a type of Component that group several individual Components into   *
 *  one device-screen-sized object to render.                                       *
 * -------------------------------------------------------------------------------- */
 const Views = {
   Home: function(props, dispatch, children) {
     // HomeView Styles
     const styles = {
       view: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 0;
         display: flex; flex-direction: column; justify-content: center; align-items: center;
       `,
       wp: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
       `,
       filter: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5;
         display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 5;
         background-color: rgba(100,100,100,0.2); text-align: center; color: #fff;
       `,
       link: `
        color: #fff; font-family: sans-serif; cursor: pointer; text-decoration: underline;
       `
     }

     // HomeView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();

     // -- Create a wallpaper (img element) for the view
     const wpName = store.getState().wallpaperState.name;
     const wpRoute = store.getState().wallpaperState.route;
     const wp = React.createElement("img", {src: wpRoute, alt: wpName, style: styles.wp}, []);
     // addEventListeners

     //  -- Create contents (link element) to place in the view/filter
     const link = React.createElement("a", {style: styles.link, href: "https://github.com/chivingtoninc/chivingtoninc.github.io"}, ["chivingtoninc.github.io repo"]);
     // addEventListeners

     // -- Create wallpaper filter
     const filter = React.createElement("div", {style: styles.filter}, [link]);

     // -- Create view element, passing children
     const HomeView = React.createElement("div", {style: styles.view}, [wp, filter]);
     HomeView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return HomeView;
   },
   About: function(props, dispatch, children) {
     // AboutView Styles
     const styles = {
       view: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 0;
         display: flex; flex-direction: column; justify-content: center; align-items: center;
       `,
       wp: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
       `,
       filter: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5;
         display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 5;
         background-color: rgba(100,100,100,0.2); text-align: center; color: #fff;
       `,
       p: `
        color: #fff; font-family: sans-serif; cursor: pointer;
       `
     }

     // AboutView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();

     // -- Create a wallpaper (img element) for the view
     const wpName = store.getState().wallpaperState.name;
     const wpRoute = store.getState().wallpaperState.route;
     const wp = React.createElement("img", {src: wpRoute, alt: wpName, style: styles.wp}, []);
     // addEventListeners

     //  -- Create contents (p element) to place in the view/filter
     const p = React.createElement("p", {style: styles.p}, [viewName]);
     // addEventListeners

     // -- Create wallpaper filter
     const filter = React.createElement("div", {style: styles.filter}, [p]);

     // -- Create view element, passing children
     const AboutView = React.createElement("div", {style: styles.view}, [wp, filter]);
     AboutView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return AboutView;
   },
   Projects: function(props, dispatch, children) {
     // ProjectsView Styles
     const styles = {
       view: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 0;
         display: flex; flex-direction: column; justify-content: center; align-items: center;
       `,
       wp: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
       `,
       filter: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5;
         display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 5;
         background-color: rgba(100,100,100,0.2); text-align: center; color: #fff;
       `,
       p: `
        color: #fff; font-family: sans-serif; cursor: pointer;
       `
     }

     // ProjectsView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();

     // -- Create a wallpaper (img element) for the view
     const wpName = store.getState().wallpaperState.name;
     const wpRoute = store.getState().wallpaperState.route;
     const wp = React.createElement("img", {src: wpRoute, alt: wpName, style: styles.wp}, []);
     // addEventListeners

     //  -- Create contents (p element) to place in the view/filter
     const p = React.createElement("p", {style: styles.p}, [viewName]);
     // addEventListeners

     // -- Create wallpaper filter
     const filter = React.createElement("div", {style: styles.filter}, [p]);

     // -- Create view element, passing children
     const ProjectsView = React.createElement("div", {style: styles.view}, [wp, filter]);
     ProjectsView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return ProjectsView;
   },
   Cover: function(props, dispatch, children) {
     // CoverView Styles
     const styles = {
       view: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 0;
         display: flex; flex-direction: column; justify-content: center; align-items: center;
       `,
       wp: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
       `,
       filter: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; z-index: 5;
         display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; z-index: 5;
         background-color: rgba(100,100,100,0.2); text-align: center; color: #fff;
       `,
       cover: `
         display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; z-index: 5;
         margin: 2em 4em 1em; padding: 1em 2em;
         background-color: rgba(100,100,100,0.9); text-align: center; color: #fff;
         border: 1px solid #000; border-radius: 5px;
       `,
       p: `
         padding: 1em; background-color: rgba(100,100,100,0.2); text-align: center; color: #fff;
       `,
       download: `
         color: #fff; font-family: sans-serif; cursor: pointer;
       `
     }

     // CoverView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();

     // -- Create a wallpaper (img element) for the view
     const wpName = store.getState().wallpaperState.name;
     const wpRoute = store.getState().wallpaperState.route;
     const wp = React.createElement("img", {src: wpRoute, alt: wpName, style: styles.wp}, []);
     // addEventListeners

     //  -- Create cover letter
     const cover = React.createElement("div", {style: styles.cover},[
       React.createElement("p", {style: styles.p}, [
         `I am seeking entry-level Deep Learning roles, internships, or co-ops. I am a strong software engineer, proficient in object-oriented C, algorithmic design, parallel computing with CUDA, rapid prototyping, and Recurrent/Convolutional Neural Network architectures for NLP & CV.`
       ]),
       React.createElement("p", {style: styles.p}, [
         `I am a Computer Science student at Bellevue College and have recently completed and received certification for Andrew Ng's Stanford Machine Learning course on Coursera. I have also completed four of five of deeplearning.AI’s Deep Learning Specialization on Coursera. These great courses have given me valuable skills, which are enabling me to build useful Deep Learning projects.`
       ]),
       React.createElement("p", {style: styles.p}, [
         `I am focused on creating efficient AI applications, platforms and tools for CV, NLP, and SLAM on embedded & cloud-based systems for applications in automated manufacturing, intelligent robotics, and other areas. AI is revolutionizing many industries and I am learning to leverage it’s capabilities for enhancing daily life. My primary career field interests are in automated manufacturing, food production and sustainable technologies, and/or transportation.`
       ]),
       React.createElement("p", {style: styles.p}, [
         `Finally, I am a conversational Spanish speaker, a beginner in several other languages, and I enjoy connecting with people from different cultures and backgrounds. It would be a great pleasure to work alongside the dedicated professionals who are passionate about bringing useful AI technologies to life.`
       ]),
       React.createElement("p", {style: styles.p}, [
         `Thank you for your time and consideration. I look forward to hearing from you.`
       ]),
       React.createElement("p", {style: styles.p}, [
         `Sincerely,`
       ]),
       React.createElement("p", {style: styles.p}, [
         `Johnathan Chivington`
       ])
     ]);
     // addEventListeners

     //  -- Create cover.docx download link
     const download = React.createElement("a", {style: styles.download, href: "./includes/j.Chivington.Cover.docx", download: ""}, ["Download Cover Letter (.docx)"]);
     // addEventListeners

     // -- Create wallpaper filter
     const filter = React.createElement("div", {style: styles.filter}, [cover, download]);

     // -- Create view element, passing children
     const CoverView = React.createElement("div", {style: styles.view}, [wp, filter]);
     CoverView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return CoverView;
   },
   Resume: function(props, dispatch, children) {
     // ResumeView Styles
     const styles = {
       view: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 0;
         display: flex; flex-direction: column; justify-content: center; align-items: center;
       `,
       wp: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
       `,
       filter: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5;
         display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 5;
         background-color: rgba(100,100,100,0.2); text-align: center; color: #fff;
       `,
       link: `
        color: #fff; font-family: sans-serif; cursor: pointer;
       `
     }

     // ResumeView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();

     // -- Create a wallpaper (img element) for the view
     const wpName = store.getState().wallpaperState.name;
     const wpRoute = store.getState().wallpaperState.route;
     const wp = React.createElement("img", {src: wpRoute, alt: wpName, style: styles.wp}, []);
     // addEventListeners

     //  -- Create contents (a element) to place in the view/filter
     const link = React.createElement("a", {style: styles.link, href: "./includes/j.Chivington.Resume.docx", download: ""}, ["Download Resume (.docx)"]);
     // addEventListeners

     // -- Create wallpaper filter
     const filter = React.createElement("div", {style: styles.filter}, [link]);

     // -- Create view element, passing children
     const ResumeView = React.createElement("div", {style: styles.view}, [wp, filter]);
     ResumeView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return ResumeView;
   }
 }


/* ----------------------------------- Components --------------------------------- *
 * -- Components can be entire views, important/reused parts of views, or more      *
 *  abstract/hidden devices like Shell & Router that contain multiple views or      *
 *  more complex infrastructure.                                                    *
 * -------------------------------------------------------------------------------- */
const Components = {
  // Shell - contains the header, menu, and router.
  Shell: function(props, dispatch, children) {
    const styles = {
      shell: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; overflow: hidden;
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
        position: absolute; top: 0; left: 0; right: 0; z-index: 10;
        display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
        height: 4em; padding: 0 0 0 1em; border-bottom: 1px solid #000; background-color: rgba(225,225,255,0.7);
      `,
      icon: `height: 2.25em; width: 2.25em; cursor: pointer;`,
      title: `margin-left: 0.25em; color: #333; font-size: 2.15em; cursor: pointer;`,
      superScript: `font-size: 0.3em; margin-left: 1px;`
    }

    const icon = React.createElement("img", {style: styles.icon, src: "./favicon.ico", alt: "chivingtoninc Icon"}, []);
    icon.addEventListener("click", function(e) {
      dispatch({type: "TOGGLE_MENU"})
    });

    const view = props.store.getState().viewState.toLowerCase();
    const superScript = React.createElement("sup", {style: styles.superScript}, [view])

    const title = React.createElement("h1", {style: styles.title}, ["chivingtoninc", superScript ]);
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
        position: absolute; top: 4em; left: 0; bottom: 0; width: 7em; padding: 0.25em 1em 0 0; z-index: 10;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-color: rgba(225,225,255,0.2); border-right: 1px solid #000; animation: menuOpen 0.15s 1;
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
        position: absolute; top: -4em; left: 0; bottom: 0; right: 0;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: #07e;
      `
    }

    const views = {
      "HOME": Views.Home,
      "ABOUT": Views.About,
      "PROJECTS": Views.Projects,
      "COVER": Views.Cover,
      "RESUME": Views.Resume,
      "DEFAULT": Views.Home
    }

    const name = props.store.getState().viewState;
    const view = views[name] ? views[name](props, dispatch, children) : views["DEFAULT"](props, dispatch, children);

    const router = React.createElement("div", {style: styles.router}, [view]);
    router.addEventListener("click", function(){
      dispatch({type: "CLOSE_MENU"});
    });

    return router;
  },
  // View - contains, positions, maintains an entire view; i.e. the whole screen.
}


/* -------------------------------- State Reducers -------------------------------- *
 * -- Functions that reduce state into stucture/object based on several choices.    *
 * -------------------------------------------------------------------------------- */
const Reducers = {
  // initializes/maintains header state
  headerState: function (state = "VISIBLE", action) {
    const menuChoices = {
      "TOGGLE_HEADER": () => (state == "VISIBLE") ? "HIDDEN" : "VISIBLE",
      "SHOW_MENU": () => "VISIBLE",
      "CLOSE_MENU": () => "HIDDEN",
      "DEFAULT": () => state
    }
    return menuChoices[action.type] ? menuChoices[action.type]() : menuChoices["DEFAULT"]();
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
  // initializes/maintains view state
  viewState: function (state = "HOME", action) {
    const viewChoices = {
      "NAV_TO": () => action.payload,
      "DEFAULT": () => state
    }
    return viewChoices[action.type] ? viewChoices[action.type]() : viewChoices["DEFAULT"]();
  },
  // initializes/maintains wallpaper state
  wallpaperState: function (state = {name: "fragmented", route: "./imgs/wp/fragmented.jpg"}, action) {
    const wpChoices = {
      "CHANGE_WP": () => action.payload,
      "DEFAULT": () => state
    }
    return wpChoices[action.type] ? wpChoices[action.type]() : wpChoices["DEFAULT"]();
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
