/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: GitHub Web App                                                           *
 * Description: Single page GitHub app, modeled after Redux/React.                   *
 * --------------------------------------------------------------------------------- */


/* ------------------------------------- Libs -------------------------------------- *
 * -- UI & state "framework" objects/constructors                                    *
 * --------------------------------------------------------------------------------- */
// React - for creating elements and diffing/maintaining vdom tree
const React = {
  createElement: function(elem, attrs, children) {
    const element = document.createElement(elem);

    if (attrs) Object.keys(attrs).forEach(k => element.setAttribute(k, attrs[k]));

    if (children.length >= 1) children.forEach(child => element.appendChild((typeof child == "string")
      ? document.createTextNode(child) : (child.elem) ? child.elem(child.props, child.dispatch, child.children) : child
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
   // Home View - description.
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
   // About View - description.
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
   // Projects View - description.
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
   // Cover View - description.
   Cover: function(props, dispatch, children) {
     // CoverView Styles
     const styles = {
       view: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; z-index: 0;
       `,
       wp: `
         position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
       `,
       filter: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; z-index: 5; overflow-y: scroll;
         background-color: rgba(100,100,100,0.2); text-align: center; color: #fff;
       `,
       cover: `
         margin: 0.25em; background-color: rgba(100,100,100,0.9); border: 1px solid #000;
       `,
       coverHeader: `
         padding: 1.25em 4em; background-color: #004575; color: #eee; border-bottom: 1px solid #000;
         display: flex; flex-direction: row; justify-content: space-between; align-items: center;
       `,
       coverHeaderMobile: `
        padding: 0.5em 0 1em; background-color: #004575; color: #eee; border-bottom: 1px solid #000;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
       `,
       coverHeaderLeft: `
         color: #fff;
       `,
       coverHeaderLeftMobile: `
         color: #fff; margin: 0.5em 1em; border-bottom: 1px solid #fff;
       `,
       coverImg: `
         margin: 0 0 0.25em 0; width: 8em; border: 1px solid #333; border-radius: 100%;
       `,
       coverName: `
         margin: 0.2em; font-size: 1.25em;
       `,
       coverTitle: `
         margin: 0.2em; font-size: 0.75em;
       `,
       coverHeaderRight: `
         color: #fff;
       `,
       coverHeaderRow: `
         padding: 0.25em; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
       `,
       coverHeaderRowMobile: `
         padding: 0.25em; display: flex; flex-direction: row; justify-content: center; align-items: center;
       `,
       coverHeaderIcon: `
         height: 0.9em; width: 0.9em; margin: 0 0.35em 0 0;
       `,
       coverHeaderLink: `
         text-decoration: underline; cursor: pointer; font-size: 0.8em; color: #fff;
       `,
       coverBody: `
         padding: 1em 3em; background-color: #fff; color: #222;
       `,
       coverDownloadRow: `
         display: flex; flex-direction: row; justify-content: flex-end; align-items: center;
       `,
       downloadButton: `
         margin: 0.15em; color: #000; font-family: sans-serif; cursor: pointer;
       `,
       coverLine: `
         margin: 0.5em; text-align: center;
       `
     }

     // CoverView Globals
     const store = props.store;
     const state = store.getState();
     const currentMode = state.windowState;
     const viewName = state.viewState.toLowerCase();
     const E = React.createElement;

     // -- Create a wallpaper (img element) for the view
     const wpName = store.getState().wallpaperState.name;
     const wpRoute = store.getState().wallpaperState.route;
     const wp = E("img", {src: wpRoute, alt: wpName, style: styles.wp}, []);
     // addEventListeners

     //  -- Create cover letter
     const cover = E("div", {style: styles.cover}, [
       E("div", {style: window.innerWidth < 900 ? styles.coverHeaderMobile : styles.coverHeader}, [
         E("div", {style: window.innerWidth < 900 ? styles.coverHeaderLeftMobile : styles.coverHeaderLeft}, [
           E("img", {style: styles.coverImg, src: "./imgs/me/me-n-win.jpg", alt: "my beautiful face"}, []),
           E("h2", {style: styles.coverName}, ["Johnathan Chivington"]),
           E("p", {style: styles.coverTitle}, ["Deep Learning & AI Engineer"])
         ]),
         E("div", {style: styles.coverHeaderRight}, [
           ["./imgs/icons/sm/phone.svg", "phone icon", "tel:303-900-2861", "303.900.2861"],
           ["./imgs/icons/sm/email.svg", "email icon", "mailto:j.chivington@bellevuecollege.edu", "j.chivington@bellevuecollege.edu"],
           ["./imgs/icons/sm/li.svg", "linkedin icon", "https://linkedin.com/in/chivingtoninc", "linkedin.com/in/chivingtoninc"],
           ["./imgs/icons/sm/git.svg", "gihub icon", "https://github.com/chivingtoninc", "github.com/chivingtoninc"],
           ["./imgs/icons/sm/twt.svg", "twitter icon", "https://twitter.com/chivingtoninc", "twitter.com/chivingtoninc"],
           ["./imgs/icons/sm/dl.svg", "Download Cover Letter (.docx)", "./includes/j.Chivington.Cover.docx", "Download Cover Letter (.docx)"]
         ].map(r => E("div", {style:  window.innerWidth < 900 ? styles.coverHeaderRowMobile : styles.coverHeaderRow}, [
           E("img", {style: styles.coverHeaderIcon, src: r[0], alt: r[1]}, []),
           E("a", {style: styles.coverHeaderLink, href: r[2]}, [r[3]])
         ])))
       ]),
       E("div", {style: styles.coverBody}, [
         E("div", {style: styles.coverDownloadRow}, [
           E("a", {style: styles.downloadButton, href: "./includes/j.Chivington.Cover.docx", download: ""}, [
             E("img", {style: styles.coverHeaderIcon, src: "./imgs/icons/sm/dl.svg", alt: "Download Cover Letter (.docx)"}, [])
           ])
         ]), ...[
         `I am an experienced software engineer, proficient in object-oriented, algorithmic design in C, Python, Java, and Js. I am seeking entry-level Deep Learning roles in Computer Vision, working with Object Detection & Tracking .`,
         `I am a Computer Science student at Bellevue College and have recently completed Stanford's Machine Learning course on Coursera, as well as four of five courses in deeplearning.AI’s Deep Learning Specialization on Coursera. I am currently building useful Deep Learning projects, using the skills learned in these courses.`,
         `I am focused on creating efficient AI applications, platforms and tools for CV, NLP, and SLAM on embedded & cloud-based systems for applications in automated manufacturing, intelligent robotics, and other areas. AI is revolutionizing many industries and I am learning to leverage it’s capabilities for enhancing daily life. My primary career field interests are in automated manufacturing, food production and sustainable technologies, and/or transportation.`,
         `Finally, I am a conversational Spanish speaker, a beginner in several other languages, and I enjoy connecting with people from different cultures and backgrounds. It would be a great pleasure to work alongside the dedicated professionals who are passionate about bringing useful AI technologies to life.`
       ].map(l => E("p", {style: styles.coverLine}, [l]))])
     ]);
     // addEventListeners

     // -- Create wallpaper filter
     const filter = E("div", {style: styles.filter}, [cover]);

     // -- Create view element, passing children
     const CoverView = E("div", {style: styles.view}, [wp, filter]);
     CoverView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return CoverView;
   },
   // Resume View - description.
   Resume: function(props, dispatch, children) {
     // ResumeView Styles
     const styles = {
       view: `
         position: absolute; top: 4em; left: 0; right: 0; bottom: 0; z-index: 0;
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
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; overflow-y: hidden;
        position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; margin: auto; background-color: #07e;
      `
    }

    // Shell Globals
    const store = props.store;
    const state = store.getState();
    const menuState = state.menuState;

    return React.createElement("div", {style: styles.shell}, [
      { elem: Components.Header, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Menu, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Router, props: { store }, dispatch: dispatch, children: [] }
    ]);
  },
  // Header - contains menu toggle button, title/home link, and top-level (favorites/most recent) routes.
  Header: function(props, dispatch, children) {
    const styles = {
      header: `
        position: absolute; top: 0; left: 0; right: 0; z-index: 10;
        display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
        height: 4em; padding: 0 0 0 1em; border-bottom: 1px solid #000; background-color: rgba(225,225,255,0.9);
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
        position: absolute; top: 4em; left: 0; bottom: 0; width: 10em; padding: 0.25em 1em 0 0; z-index: 10;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-image: linear-gradient(to bottom right, rgba(100,100,125,1), rgba(75,75,100,1));
        border-right: 1px solid #000; animation: menuOpen 0.15s 1;
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
        position: absolute; top: -4em; left: 0; bottom: 0; right: 0; overflow-y: hidden;
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
  }
}


/* -------------------------------- State Reducers -------------------------------- *
 * -- Functions that reduce state into stucture/object based on several choices.    *
 * -------------------------------------------------------------------------------- */
const Reducers = {
  // initializes/maintains window state
  windowState: function (state = "TABLET", action) {
    const choices = {
      "SWITCH_MODE": () => action.payload,
      "DEFAULT": () => state
    }
    return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
  },
  // initializes/maintains view state
  viewState: function (state = "COVER", action) {
    const choices = {
      "NAV_TO": () => action.payload,
      "DEFAULT": () => state
    }
    return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
  },
  // initializes/maintains header state
  headerState: function (state = "VISIBLE", action) {
    const choices = {
      "TOGGLE_HEADER": () => (state == "VISIBLE") ? "HIDDEN" : "VISIBLE",
      "SHOW_MENU": () => "VISIBLE",
      "CLOSE_MENU": () => "HIDDEN",
      "DEFAULT": () => state
    }
    return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
  },
  // initializes/maintains menu state
  menuState: function (state = "CLOSED", action) {
    const choices = {
      "TOGGLE_MENU": () => (state == "CLOSED") ? "OPEN" : "CLOSED",
      "OPEN_MENU": () => "OPEN",
      "CLOSE_MENU": () => "CLOSED",
      "DEFAULT": () => state
    }
    return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
  },
  // initializes/maintains wallpaper state
  wallpaperState: function (state = {name: "fragmented", route: "./imgs/wp/fragmented.jpg"}, action) {
    const choices = {
      "CHANGE_WP": () => action.payload,
      "DEFAULT": () => state
    }
    return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
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
