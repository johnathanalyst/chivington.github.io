/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: GitHub Web App                                                           *
 * Description: Single page GitHub app, modeled after Redux/React.                   *
 * --------------------------------------------------------------------------------- */


/* ------------------------------------- Libs -------------------------------------- *
 *    These barebones modules for initializing and maintaining application state/UI  *
 *  are modeled after React & Redux.                                                 *
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
};

// ReactDOM - for rendering/updating dom based on vdom tree
const ReactDOM = {
  render: function(component, root) {
    while (root.children[0]) root.removeChild(root.children[0]);
    root.appendChild(component.elem(component.props, component.dispatch, component.children));
  }
};

// Redux - for maintaining application state
const Redux = {
  createStore: function(stateReducer, middlewares) {
    var state = {}, listeners = [];

    function getState() {
      return state;
    }

    function dispatch(action) {
      if (middlewares && middlewares.logActions) middlewares.logActions("before", state, action);
      state = stateReducer(state, action);
      if (middlewares && middlewares.logActions) middlewares.logActions("after", state, action);
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
};


/* ----------------------------------- Blueprint ----------------------------------- *
 *    This object specifies the initial app features, such as themes, wallpapers,    *
 *  guides, notifications, etc.                                                      *
 * --------------------------------------------------------------------------------- */
 const Blueprint = {
   initUser: {
     user: "GUEST", returning: false
   },
   initWindow: "TABLET",
   initHeader: "VISIBLE",
   initMenu: "CLOSED",
   initNotification: {
     visibility: "HIDDEN", tile: "./imgs/icons/sm/brain.svg", msg: "Welcome!", alt: "brain icon"
   },
   initGuide: {
     visibility: "HIDDEN",
     box: {boxx:0, boxy:0, boxh:0, boxw:0, boxr:0},
     msg: {position: {msgx:0, msgy:0, msgh:0, msgw:0, msgr:0}, txt: "Guide Message!"},
     btn: {position: {btnx:0, btny:0, btnh:0, btnw:0, btnr:0}, txt: "Guide Button!"},
     animation: "animation: menuGuide 750ms 1 ease-in-out forwards;"
   },
   initView: "HOME",
   initWallpaper: {
     name: "fragmented", route: "./imgs/wp/fragmented.jpg"
   },
   initResume: {
     skills: "OPEN", history: "OPEN", education: "OPEN", certifications: "OPEN", volunteering: "OPEN"
   }
 };


 /* ----------------------------------- Reducers ----------------------------------- *
  *    Functions that initialize & reduce state into store based on several choices. *
  * -------------------------------------------------------------------------------- */
 const Reducers = {
   // initializes/maintains user state
   userState: function (state = Blueprint.initUser, action) {
     const choices = {
       "LANDING": () => Object.assign({}, state, {returning: true}),
       "LOGIN": () => Object.assign({}, state, {user: action.payload.user}),
       "LOGOUT": () => Object.assign({}, state, {user: "GUEST"}),
       "DEFAULT": () => state
     };
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   },
   // initializes/maintains window state
   windowState: function (state = Blueprint.initWindow, action) {
     const choices = {
       "SWITCH_MODE": () => action.payload,
       "DEFAULT": () => state
     };
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   },
   // initializes/maintains header state
   headerState: function (state = Blueprint.initHeader, action) {
     const choices = {
       "TOGGLE_HEADER": () => (state == "VISIBLE") ? "HIDDEN" : "VISIBLE",
       "SHOW_MENU": () => "VISIBLE",
       "CLOSE_MENU": () => "HIDDEN",
       "DEFAULT": () => state
     };
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   },
   // initializes/maintains menu state
   menuState: function (state = Blueprint.initMenu, action) {
     const choices = {
       "TOGGLE_MENU": () => (state == "CLOSED") ? "OPEN" : "CLOSED",
       "OPEN_MENU": () => "OPEN",
       "CLOSE_MENU": () => "CLOSED",
       "DEFAULT": () => state
     };
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   },
   // initializes/maintains notification state
   notificationState: function (state = Blueprint.initNotification, action) {
     const choices = {
       "SHOW_NOTIFICATION": () => Object.assign({visibility: "VISIBLE"}, action.payload),
       "HIDE_NOTIFICATION": () => Blueprint.initNotification,
       "FLASH_NOTIFICATION": () => Object.assign({visibility: "FLASH"}, action.payload),
       "DEFAULT": () => state
     }
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   },
   // initializes/maintains guide state
   guideState: function (state = Blueprint.initGuide, action) {
     const choices = {
       "SHOW_GUIDE": () => Object.assign({visibility: "VISIBLE"}, action.payload),
       "HIDE_GUIDE": () => Blueprint.initGuide,
       "FLASH_GUIDE": () => Object.assign({visibility: "FLASH"}, action.payload),
       "DEFAULT": () => state
     };
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   },
   // initializes/maintains view state
   viewState: function (state = Blueprint.initView, action) {
     const choices = {
       "NAV_TO": () => action.payload,
       "DEFAULT": () => state
     };
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   },
   // initializes/maintains wallpaper state
   wallpaperState: function (state = Blueprint.initWallpaper, action) {
     const choices = {
       "CHANGE_WP": () => action.payload,
       "DEFAULT": () => state
     };
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   },
   // initializes/maintains resume state
   resumeState: function (state = Blueprint.initResume, action) {
     const choices = {
       "TOGGLE_SKILLS_SECTION": () => Object.assign({}, state, {skills: state.skills == "OPEN" ? "CLOSED" : "OPEN"}),
       "TOGGLE_HIST_SECTION": () => Object.assign({}, state, {history: state.history == "OPEN" ? "CLOSED" : "OPEN"}),
       "TOGGLE_EDU_SECTION": () => Object.assign({}, state, {education: state.education == "OPEN" ? "CLOSED" : "OPEN"}),
       "TOGGLE_CERTS_SECTION": () => Object.assign({}, state, {certifications: state.certifications == "OPEN" ? "CLOSED" : "OPEN"}),
       "TOGGLE_VOLUNTEER_SECTION": () => Object.assign({}, state, {volunteering: state.volunteering == "OPEN" ? "CLOSED" : "OPEN"}),
       "DEFAULT": () => state
     };
     return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
   }
 };

 /*  Combine reducers into one function & create store. Initializes state based
   on default params or "DEFAULT" choices of reducer functions. */
 const InitialState = Redux.combineReducers(Reducers);
 const ReduxStore = Redux.createStore(InitialState, Redux.storeMiddlewares);


/* ----------------------------------- Components --------------------------------- *
 *    Components can be entire views, important/reused parts of views, or more      *
 *  abstract/hidden devices like the Shell or Router that contain multiple views or *
 *  more complex infrastructure.                                                    *
 * -------------------------------------------------------------------------------- */
const Components = {
  // Shell - contains the Header, Menu, Router, and Guide modules.
  Shell: function(props, dispatch, children) {
    // Shell Styles
    const styles = {
      shell: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; overflow: hidden;
        position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; margin: auto; background-color: #07e;
      `
    };

    // Shell Globals
    const store = props.store;
    const state = store.getState();
    const menuState = state.menuState;
    const notificationState = state.notificationState;

    // Shell Element
    const Shell = React.createElement("div", {style: styles.shell}, [
      { elem: Components.Header, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Menu, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Router, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Guide, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Notification, props: { store }, dispatch: dispatch, children: [] }
    ]);

    // Shell listeners
    Shell.addEventListener("click", function(event){
      if (notificationState.visibility == "VISIBLE" || notificationState.visibility == "FLASH") dispatch({
        type: "HIDE_NOTIFICATION", payload: { visibility: "HIDDEN", msg: "Welcome!", tile: "./imgs/icons/sm/brain.svg", alt: "brain icon" }
      });
    });

    return Shell;
  },
  // Header - contains Menu toggle button and title/home link.
  Header: function(props, dispatch, children) {
    // Header Styles
    const styles = {
      header: `
        position: absolute; top: 0; left: 0; right: 0; z-index: 15;
        display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
        height: 4em; padding: 0 0 0 1em; border-bottom: 1px solid #fff;
        background-image: linear-gradient(#333, #222);
      `,
      icon: `height: 2.25em; width: 2.25em; cursor: pointer;`,
      title: `margin-left: 0.35em; color: #fff; font-size: 2.15em; cursor: pointer;`,
      superScript: `font-size: 0.3em; margin-left: 1px;`
    };

    // Header Icon & Listeners
    const icon = React.createElement("img", {style: styles.icon, src: "./favicon.ico", alt: "chivingtoninc Icon"}, []);
    icon.addEventListener("click", function(event) {
      dispatch({type: "TOGGLE_MENU"})
    });

    // Superscript for current view
    const view = props.store.getState().viewState.toLowerCase();
    const superScript = React.createElement("sup", {style: styles.superScript}, [view])

    // Title Element Listeners
    const title = React.createElement("h1", {style: styles.title}, ["chivingtoninc", superScript ]);
    title.addEventListener("click", function() {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "HOME"})
    });

    // Header Element
    const Header = React.createElement("div", {style: styles.header}, [icon, title]);

    return Header;
  },
  // Menu - layered/collapsible full-route menu.
  Menu: function(props, dispatch, children) {
    const styles = {
      menuOpen: `
        position: absolute; top: 4em; left: 0; bottom: 0; width: 10em; padding: 0.25em 1em 0 0; z-index: 10;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-image: linear-gradient(to bottom right, rgba(6,90,204,1), rgba(25,110,214,1));
        border-right: 1px solid #024; animation: menuOpen 0.15s 1;
      `,
      menuClosed: `
        display: none;
      `,
      link: `
        padding: 1em; border-bottom: 0.5px solid #ddd; color: #fff; cursor: pointer;
      `
    };

    const menuStyle = (props.store.getState().menuState == "OPEN") ? styles.menuOpen : styles.menuClosed;

    // Home Link & Listeners
    const home = React.createElement("a", {style: styles.link}, ["Home"]);
    home.addEventListener("click", function(event){
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "HOME"});
    });

    // Blog Link & Listeners
    const blog = React.createElement("a", {style: styles.link}, ["Blog"]);
    blog.addEventListener("click", function() {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "BLOG"});
    });

    // Projects Link & Listeners
    const projects = React.createElement("a", {style: styles.link}, ["Projects"]);
    projects.addEventListener("click", function () {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "PROJECTS"});
    });

    // Cover Link & Listeners
    const cover = React.createElement("a", {style: styles.link}, ["Cover"]);
    cover.addEventListener("click", function () {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "COVER"});
    });

    // Resume Link & Listeners
    const resume = React.createElement("a", {style: styles.link}, ["Resume"]);
    resume.addEventListener("click", function () {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "RESUME"});
    });

    // Menu Element
    const Menu = React.createElement("div", {style: menuStyle}, [home, blog, projects, cover, resume, ...children]);

    return Menu;
  },
  // Router - maintains views/routes. (viewing, tabs, minimized...)
  Router: function(props, dispatch, children) {
    // Router Styles
    const styles = {
      router: `
        position: absolute; top: -4em; left: 0; bottom: 0; right: 0; overflow: hidden;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: #07e;
      `
    };

    // Views
    const views = {
      "HOME": Views.Home,
      "BLOG": Views.Blog,
      "PROJECTS": Views.Projects,
      "COVER": Views.Cover,
      "RESUME": Views.Resume,
      "DEFAULT": Views.Home
    };

    // Router Globals
    const name = props.store.getState().viewState;
    const view = views[name] ? views[name](props, dispatch, children) : views["DEFAULT"](props, dispatch, children);

    // Router Element
    const Router = React.createElement("div", {style: styles.router}, [Components.View(props, dispatch, [view])]);

    return Router;
  },
  // DocHeader - responsive cover/resume header
  DocHeader: function(props, dispatch, children) {
    // DocHeader Styles
    const styles = {
      header: `
        padding: 1.25em 4em; display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        background-image: linear-gradient(rgba(20,20,20,0.6), rgba(30,30,30,0.7)), url("./imgs/wp/math.jpg");
        background-size: contain; background-repeat: no-repeat; background-position: center;
        background-color: #000; color: #eee; border-bottom: 1px solid #ccc;
      `,
      headerMobile: `
        padding: 0.5em 0 1em; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-image: linear-gradient(rgba(20,20,20,0.6), rgba(30,30,30,0.7)), url("./imgs/wp/math.jpg");
        background-size: contain; background-repeat: no-repeat; background-position: center;
        background-color: #000; color: #eee; border-bottom: 1px solid #fff;
      `,
      left: {
        window: `
          display: flex; flex-direction: column; justify-content: center; align-items: center;
        `,
        mobile: `
          display: flex; flex-direction: column; justify-content: center; align-items: center; border-bottom: 1px solid #fff; margin: 0 1em;
        `,
        img: `
          margin: 0 0 0.25em 0; width: 8em; border: 1px solid #fff; border-radius: 100%;
        `,
        imgMobile: `
          margin: 0.75em 0 0 0; width: 10em; border: 1px solid #fff; border-radius: 100%;
        `,
        name: `
          margin: 0; font-size: 1.75em;
        `,
        title: `
          margin: 0 0 0.2em 0; font-size: 1em;
        `
      },
      right: {
        window: `
          margin: 1.25em;
        `,
        row: `
          margin: 0.5em; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
        `,
        rowMobile: `
          padding: 0.25em; display: flex; flex-direction: row; justify-content: center; align-items: center;
        `,
        icon: `
          height: 0.9em; width: 0.9em; margin: 0 0.5em 0 0;
        `,
        link: `
          text-decoration: underline; cursor: pointer; font-size: 0.9em; color: #fff;
        `
      }
    };

    // DocHeader Globals
    const store = props.store;
    const state = store.getState();
    const currentMode = state.windowState;
    const viewName = state.viewState.toLowerCase();
    const capitalized = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    const MOB = window.innerWidth < 700;
    const E = React.createElement;

    // Download Link
    const download = E("div", {style: MOB ? styles.right.rowMobile : styles.right.row}, [
      E("img", {style: styles.right.icon, src: "./imgs/icons/sm/dl.svg", alt: `Download ${capitalized} (.docx)`}, []),
      E("a", {style: styles.right.link, href: "./includes/j.Chivington.Resume.docx", target: "_self"}, [`Download ${capitalized} (.docx)`])
    ]);

    // Download Link  Listeners
    download.addEventListener("click", function(event) {
      dispatch({type: "SHOW_NOTIFICATION", payload: {
        visibility: "VISIBLE", msg: `Downloaded ${capitalized}`, tile: "./imgs/icons/sm/dl.svg", alt: "download icon"
      }});
    });

    // DocHeader Element
    const DocHeader = E("div", {style: MOB ? styles.headerMobile : styles.header}, [
      E("div", {style: MOB ? styles.left.mobile : styles.left.window}, [
        E("img", {style: MOB ? styles.left.imgMobile : styles.left.img, src: "./imgs/me/me-n-win.jpg", alt: "my beautiful face"}, []),
        E("h2", {style: styles.left.name}, ["Johnathan Chivington"]),
        E("p", {style: styles.left.title}, ["Deep Learning & AI Engineer"])
      ]),
      E("div", {style: styles.right.window}, [...[
        ["./imgs/icons/sm/phone.svg", "phone icon", "tel:303-900-2861", "303.900.2861"],
        ["./imgs/icons/sm/email.svg", "email icon", "mailto:j.chivington@bellevuecollege.edu", "j.chivington@bellevuecollege.edu"],
        ["./imgs/icons/sm/li.svg", "linkedin icon", "https://www.linkedin.com/in/johnathan-chivington", "linkedin.com/in/johnathan-chivington"],
        ["./imgs/icons/sm/git.svg", "gihub icon", "https://github.com/chivingtoninc", "github.com/chivingtoninc"],
        ["./imgs/icons/sm/twt.svg", "twitter icon", "https://twitter.com/chivingtoninc", "twitter.com/chivingtoninc"]
      ].map(r => E("div", {style: MOB ? styles.right.rowMobile : styles.right.row}, [
        E("img", {style: styles.right.icon, src: r[0], alt: r[1]}, []),
        E("a", {style: styles.right.link, href: r[2], target: "_blank"}, [r[3]])
      ])),
      download
    ])])

    return DocHeader;
  },
  // View - responsive view container w/ wallpaper & filter
  View: function(props, dispatch, children) {
    // View Styles
    const styles = {
      view: `
        position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; overflow-y: scroll; padding: 8em 0 0 0;
      `
    };

    // View Globals
    const store = props.store;

    // Create View Wallpaper
    const wallpaperName = store.getState().wallpaperState.name;
    const wallpaperRoute = store.getState().wallpaperState.route;
    styles.view += ` background-image: linear-gradient(rgba(20,20,20,0.5), rgba(30,30,30,0.5)), url("./${wallpaperRoute}");`;
    // const wallpaper = React.createElement("img", {src: wallpaperRoute, alt: wallpaperName, style: styles.wallpaper}, [children]);

    // View
    const View = React.createElement("div", {style: styles.view}, children);

    // View Listeners
    View.addEventListener("click", function(event){
      dispatch({type: "CLOSE_MENU"});
    });

    return View;
  },
  // Notification - app-wide notification module
  Notification: function(props, dispatch, children) {
    // Notification Styles
    const styles = {
      desktop: {
        show: `
         position: absolute; height: 4em; width: 23em; top: 5em; right: 1.75em; z-index: 100;
         display: flex; flex-direction: row; justify-content: center; align-items: center; overflow: hidden;
         background-image: linear-gradient(rgba(35,35,35,0.9), rgba(35,35,35,0.9)); color: #fff; border: 1px solid #aaa; border-radius: 15px; cursor: pointer;
         animation: notificationShowDesktop 0.5s 1 ease-in-out forwards;
        `,
        glance: `
         position: absolute; height: 4em; width: 23em; top: 5em; right: 1.75em; z-index: 100;
         display: flex; flex-direction: row; justify-content: center; align-items: center; overflow: hidden;
         background-image: linear-gradient(rgba(35,35,35,0.9), rgba(35,35,35,0.9)); color: #fff; border: 1px solid #aaa; border-radius: 15px; cursor: pointer;
         animation: notificationGlanceDesktop 3.5s 1 ease-in-out forwards;
        `,
        tile: `
         display: flex; flex-direction: column; justify-content: center; align-items: center;
         height: 4em; width: 4em; border-right: 1px solid #aaa;
        `,
        img: `
          height: 2.5em; width: 2.5em;
        `,
        msg: `
         display: flex; flex-direction: column; justify-content: center; align-items: center;
         height: 4em; width: 19em;
        `,
        txt: `
         font-size: 1em; margin: 0.25em 0; padding: 0;
        `,
        dismiss: `
         font-size: 0.8em; margin: 0; padding: 0;
        `
      },
      mobile: {
        show: `
         position: absolute; height: 3.5em; width: 95%; top: 4.5em; left: 2.5%; z-index: 100;
         display: flex; flex-direction: row; justify-content: center; align-items: center; overflow: hidden;
         background-image: linear-gradient(rgba(35,35,35,0.9), rgba(35,35,35,0.9)); color: #fff; border: 1px solid #aaa; border-radius: 15px; cursor: pointer;
         animation: notificationShowMobile 0.5s 1 ease-in-out forwards;
        `,
        glance: `
         position: absolute; height: 3.5em; width: 95%; top: 4.5em; left: 2.5%; z-index: 100;
         display: flex; flex-direction: row; justify-content: center; align-items: center; overflow: hidden;
         background-image: linear-gradient(rgba(35,35,35,0.9), rgba(35,35,35,0.9)); color: #fff; border: 1px solid #aaa; border-radius: 15px; cursor: pointer;
         animation: notificationGlanceMobile 3.5s 1 ease-in-out forwards;
        `,
        tile: `
         display: flex; flex-direction: column; justify-content: center; align-items: center;
         height: 3.5em; width: 3.5em; border-right: 1px solid #aaa;
        `,
        img: `
         height: 2.5em; width: 2.5em;
        `,
        msg: `
         display: flex; flex: 1; flex-direction: column; justify-content: center; align-items: center;
         height: 3.5em;
        `,
        txt: `
         font-size: 1em; margin: 0.25em 0; padding: 0;
        `,
        dismiss: `
         font-size: 0.8em; margin: 0; padding: 0;
        `
      },
      hidden: `display: none;`
    };

    // Notification Globals
    const store = props.store;
    const state = store.getState();
    const viewName = state.viewState.toLowerCase();
    const capitalized = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    const status = state.notificationState;
    const MOB = window.innerWidth < 700;
    const E = React.createElement;

    // Notification Settings
    const choices = {
      "VISIBLE": (c) => (c == true ? styles.mobile.show : styles.desktop.show),
      "FLASH": (c) => (c == true ? styles.mobile.glance : styles.desktop.glance),
      "HIDDEN": () => styles.hidden,
      "DEFAULT": () => styles.hidden
    }
    const displayType = choices[status.visibility] ? choices[status.visibility](MOB) : choices["DEFAULT"]();

    // Notification Content
    const tile = E("div", {style: MOB ? styles.mobile.tile : styles.desktop.tile}, [
      E("img", {style: MOB ? styles.mobile.img : styles.desktop.img, src: status.tile, alt: status.alt}, [])
    ]);
    const txt = E("p", {style: MOB ? styles.mobile.txt : styles.desktop.txt}, [status.msg]);
    const dismiss = E("p", {style: MOB ? styles.mobile.txt : styles.desktop.dismiss}, ["(Click to dismiss.)"]);
    const msg = E("div", {style: MOB ? styles.mobile.msg : styles.desktop.msg}, [txt, dismiss]);

    // Notification
    const Notification = E("div", {style: displayType}, [tile, msg]);

    // Notification Listeners
    Notification.addEventListener("click", function(event) {
      dispatch({type: "HIDE_NOTIFICATION", payload: {
        visibility: "HIDDEN", msg: "Welcome!", tile: "./imgs/icons/sm/brain.svg", alt: "brain icon"
      }});
      dispatch({type: "CLOSE_MENU"});
    });

    return Notification;
  },
  // Guide - app-wide guide module
  Guide: function(props, dispatch, children) {
    // Guide Styles
    const styles = {
      visible: (animation) => `
        position: absolute; top: 0; right: 0; height: 100%; width: 100%; z-index: 1000; color: #fff; ${animation}
      `,
      box: (x,y,h,w,r) => `
        position: absolute; top: ${y}; left: ${x}; height: ${h}; width: ${w}; z-index: 1000; background-color: rgba(0,0,0,0);
        border: 1px solid #aaa; border-radius: ${r}; -webkit-box-shadow: 0 0 0 1000em rgba(0,0,0,0.9);
      `,
      hidden: `display: none;`,
      msg: (x,y,h,w,r) => `
        position: absolute; top: ${y}; left: ${x}; height: ${h||"auto"}; width: ${w||"auto"}; z-index: 1000;
        padding: 0.5em; border-radius: 5px; background-color: rgba(0,0,0,1);
      `,
      btn: (x,y,h,w,r) => `
        position: absolute; top: ${y}; left: ${x}; z-index: 1000; display: flex; flex-direction: row; justify-content: center; align-items: center;
        padding: 0.1em 0.5em 0.05em; background-color: rgba(25,110,214,0.9); border: 1px solid #777; border-radius: 5px; cursor: pointer;
      `
    };

    // Guide Globals
    const store = props.store;
    const state = store.getState();
    const viewName = state.viewState.toLowerCase();
    const capitalized = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    const visibility = state.guideState.visibility;
    const animation = state.guideState.animation;
    const { boxx,boxy,boxh,boxw,boxr } = state.guideState.box;
    const { msgx,msgy,msgh,msgw } = state.guideState.msg.position;
    const { btnx,btny,btnh,btnw } = state.guideState.btn.position;
    const msgTxt = state.guideState.msg.txt;
    const btnTxt = state.guideState.btn.txt;
    const MOB = window.innerWidth < 700;
    const E = React.createElement;

    // Guide Settings
    const choices = {
      "VISIBLE": (a) => styles.visible(a),
      "HIDDEN": () => styles.hidden,
      "DEFAULT": () => styles.hidden
    };
    const displayType = choices[visibility] ? choices[visibility](animation) : choices["DEFAULT"]();

    // Guide Box
    const box = E("div", {style: styles.box(boxx,boxy,boxh,boxw,boxr)}, []);
    const msg = E("p", {style: styles.msg(msgx,msgy,msgh,msgw)}, [msgTxt]);
    const btn = E("p", {style: styles.btn(btnx,btny,btnh,btnw)}, [btnTxt]);

    // Guide
    const Guide = E("div", {style: displayType}, [box, msg, btn]);

    // Guide Listeners
    Guide.addEventListener("click", function(event) {
      dispatch({type: "HIDE_GUIDE"});
    });

    return Guide;
  }
};


/* ------------------------------------- Views ------------------------------------ *
 *    Views are a type of Component that group several individual Components into   *
 *  one device-screen-sized object to render.                                       *
 * -------------------------------------------------------------------------------- */
 const Views = {
   // Home View - contains contact card.
   Home: function(props, dispatch, children) {
     // HomeView Styles
     const styles = {
       view: `
         display: flex; flex-direction: column; justify-content: center; align-items: stretch;
         height: 100%; background-image: url("./imgs/wp/pnw.jpg"); background-position: center; background-size: cover; background-repeat: none;
       `,
       viewMobile: `
         display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
         background-image: url("./imgs/wp/pnw.jpg"); background-position: center; background-size: cover; background-repeat: none;
       `,
       card: {
         box: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           margin: 0 3em; z-index: 5;
         `,
         boxMobile: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           margin: 1em; z-index: 5;
         `,
         body: {
           box: `
            display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start;
            padding: 0.5em; background-color: #eff;
           `,
           boxMobile: `
            display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
            padding: 0.5em; background-color: #eff;
           `,
           left: {
             box: `
              display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
              height: 25em;
             `,
             boxMobile: `
              display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
              height: 22em;
             `,
             img: `height: 100%;`,
           },
           right: {
             box: `
              display: flex; flex: 1; flex-direction: column; justify-content: flex-start; align-items: stretch;
              height: 25em; margin: 0 0 0 0.5em; background-color: #ddd;
             `,
             boxMobile: `
              display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
              margin: 0.5em 0 0 0;
             `,
             top: {
               box: `
                background-color: #eee; padding: 0.5em; border-bottom: 1px solid #444;
               `,
               boxMobile:`background-color: #eee; padding: 0.5em;  border-bottom: 1px solid #444; text-align: center;`,
               greeting: `height: 4em; margin: 0.5em 0;;`,
               name: `margin: 0; font-size: 1.5em;`,
               title: `margin: 0; font-size: 0.9em; font-weight: 300;`
             },
             bottom: {
               box: `
                display: flex; flex-direction: column; justify-content: space-between; align-items: stretch;
                background-color: #ddd; padding: 0 1em;
               `,
               row: `
                display: flex; flex-direction: row; justify-content: space-between; align-items: center;
                margin: 0.5em 0; padding: 0;
               `,
               rowMobile: `
                display: flex; flex-direction: row; justify-content: space-between; align-items: center;
                margin: 1.25em 0; padding: 0;
               `,
               field: `
                font-size: 1em; margin: 0;
               `,
               text: `
                font-size: 0.9em; margin: 0;
               `
             }
           }
         },
         footer: {
           box: `
             display: flex; flex-direction: row; justify-content: space-around; align-items: center;
             background-color: #222; padding: 1em 0 0.5em;
           `,
           link: `color: #fff`,
           icon: `
             height: 1.25em; width: 1.25em;
           `
         }
       }
     }

     // HomeView Globals
     const store = props.store;
     const state = store.getState();
     const landing = !state.userState.returning;
     const loggedIn = state.userState.user != "GUEST";
     const MOB = window.innerWidth < 700;
     const E = React.createElement;

     // Menu Guide if landing
     if (landing) {
       dispatch({type: "LANDING"});
       dispatch({type: "SHOW_GUIDE", payload: {
         box: {boxx:"0.55em", boxy:"0.45em", boxh:"3em", boxw:"3em", boxr:"100%"},
         msg: {position: {msgx:"4em", msgy:"-0.75em", msgh:"2.65em", msgw:""}, txt: "Tap the brain for more..."},
         btn: {position: {btnx:"7.75em", btny:"1.25em", btnh:"1.25em", btnw:"3.5em", btnr: "7px"}, txt: "Got it."},
         animation:  "animation: menuGuide 750ms 1 ease-in-out forwards;"
       }});
     }

     // HomeView Content
     const card = E("div", {style: MOB ? styles.card.boxMobile : styles.card.box}, [
       E("div", {style: MOB ? styles.card.body.boxMobile : styles.card.body.box}, [
         E("div", {style: MOB ? styles.card.body.left.boxMobile : styles.card.body.left.box}, [
           E("img", {style: styles.card.body.left.img, src: "./imgs/me/me.jpg", alt: "my face"}, [])
         ]),
         E("div", {style: MOB ? styles.card.body.right.boxMobile : styles.card.body.right.box}, [
           E("div", {style: MOB ? styles.card.body.right.top.boxMobile : styles.card.body.right.top.box}, [
             E("img", {style: styles.card.body.right.top.greeting, src: "./imgs/content/hello.png"}, []),
             E("h2", {style: styles.card.body.right.top.name}, ["Johnathan Chivington"]),
             E("h2", {style: styles.card.body.right.top.title}, ["Deep Learning & AI Engineer"])
           ]),
           E("div", {style: styles.card.body.right.bottom.box}, [
             ["Location", "Seattle, WA"],
             ["Phone", "303.900.2861"],
             ["Email", "j.chivington@bellevuecollege.edu"],
             ["Search Status", "Actively Seeking (local & remote)"]
           ].map(r => E("div", {style: MOB ? styles.card.body.right.bottom.rowMobile : styles.card.body.right.bottom.row}, [
             E("h3", {style: styles.card.body.right.bottom.field}, [r[0]]),
             E("p", {style: styles.card.body.right.bottom.text}, [r[1]]),
           ])))
         ])
       ]),
       E("div", {style: styles.card.footer.box}, [
         ["./imgs/icons/sm/git.svg", "gihub icon", "https://github.com/chivingtoninc"],
         ["./imgs/icons/sm/li.svg", "linkedin icon", "https://www.linkedin.com/in/johnathan-chivington"],
         ["./imgs/icons/sm/twt.svg", "twitter icon", "https://twitter.com/chivingtoninc"],
         ["./imgs/icons/sm/phone.svg", "phone icon", "tel:303-900-2861"],
         ["./imgs/icons/sm/email.svg", "email icon", "mailto:j.chivington@bellevuecollege.edu"]
       ].map(icon => E("a", {style: styles.card.footer.link, href: icon[2], alt: icon[2], target: "_blank"}, [
         E("img", {style: styles.card.footer.icon, src: icon[0], alt: icon[1]}, [])
       ])))
     ]);

     // HomeView
     const HomeView = React.createElement("div", {style: MOB ? styles.viewMobile : styles.view}, [card]);

     // HomeView Listeners
     HomeView.addEventListener("click", function(event){
       dispatch({type: "CLOSE_MENU"});
     });

     return HomeView;
   },
   // Blog View - description.
   Blog: function(props, dispatch, children) {
     // BlogView Styles
     const styles = {
       view: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height: 100%;
       `,
       p: `
        color: #fff; cursor: pointer;
       `
     }

     // BlogView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();
     const capitalized = viewName.charAt(0).toUpperCase() + viewName.slice(1);

     // BlogView Content
     const p = React.createElement("p", {style: styles.p}, [capitalized]);

     // BlogView
     const BlogView = React.createElement("div", {style: styles.view}, [p]);

     // BlogView Listeners
     BlogView.addEventListener("click", function(event){
       dispatch({type: "CLOSE_MENU"});
     });

     return BlogView;
   },
   // Projects View - description.
   Projects: function(props, dispatch, children) {
     // ProjectsView Styles
     const styles = {
       view: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height: 100%;
       `,
       p: `
        color: #fff; cursor: pointer;
       `
     }

     // ProjectsView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();
     const capitalized = viewName.charAt(0).toUpperCase() + viewName.slice(1);

     // ProjectsView Content
     const p = React.createElement("p", {style: styles.p}, [capitalized]);

     // ProjectsView
     const ProjectsView = React.createElement("div", {style: styles.view}, [p]);

     // ProjectsView Listeners
     ProjectsView.addEventListener("click", function(event){
       dispatch({type: "CLOSE_MENU"});
     });

     return ProjectsView;
   },
   // Cover View - description.
   Cover: function(props, dispatch, children) {
     // CoverView Styles
     const styles = {
       cover: `
         margin: 0.75em; background-color: rgba(100,100,100,0.9); border: 1px solid #000;
       `,
       coverBody: `
         padding: 1em 3em; background-color: #fff; color: #222;
       `,
       coverLine: `
         margin: 0 auto 2em; padding: 1em; text-align: center;
         background-color: rgba(100,100,200,0.15);
       `
     }

     // CoverView Globals
     const store = props.store;
     const state = store.getState();

     // CoverView Content
     const header = Components.DocHeader(props, dispatch, []);
     const body = React.createElement("div", {style: styles.coverBody}, [
       `I am an adept software engineer, experienced with object-oriented, algorithmic design in C, Python, Java & Javascript, as well as learning algorithms & models, and I am seeking entry-level Deep Learning roles in Computer Vision & Natural Language Processing.`,
       `I am a Computer Science student at Bellevue College and have completed additional courses in Machine & Deep Learning from Stanford & deeplearning.ai through Coursera. Currently, I am focused on creating CV, NLP, and SLAM applications for embedded & cloud-based systems. I am building a modular ecosystem of AI tools from embedded & IoT devices to cloud-based fleet management systems.`,
       `Deep Learning is revolutionizing many industries and I am learning to leverage it’s incredible capabilities for enhancing daily life. My primary career interests are in automated robotics for manufacturing, food production and sustainable technologies.`,
       `Lastly, I am a conversational Spanish speaker, a beginner in several other languages, and I enjoy connecting with people from different cultures and backgrounds. It would be a rewarding experience to work alongside dedicated professionals who are also passionate about bringing useful AI technologies to life.`
     ].map(l => React.createElement("p", {style: styles.coverLine}, [l])));

     // CoverView
     const CoverView = React.createElement("div", {style: styles.cover}, [header, body]);

     // CoverView listeners
     CoverView.addEventListener("click", function(event){
       dispatch({type: "CLOSE_MENU"});
     });

     return CoverView;
   },
   // Resume View - description.
   Resume: function(props, dispatch, children) {
     // ResumeView Styles
     const styles = {
       resume: `
         margin: 0.75em; background-color: rgba(100,100,100,0.9); border: 1px solid #000;
       `,
       body: `
         padding: 1em; background-color: #fff; color: #000;
       `,
       bodyMobile: `
         padding: 0 1em; background-color: #fff; color: #000;
       `,
       section: {
         title: `
           margin: 1em 0 0; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
           padding: 0 0.25em; font-size: 1.15em; border-bottom: 1px solid #000; cursor: pointer;
         `,
         hidden: `
           display: none;
         `
       },
       skills: {
         window: `
           display: flex; flex-direction: row; justify-content: space-between; align-items: center;
           background-color: rgba(100,100,200,0.15);
         `,
         mobile: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,200,0.15);
         `,
         column: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           margin: 0 auto;
         `,
         skill: `
           margin: 0.25em auto;
         `
       },
       history: {
         window: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           padding: 0.5em; background-color: rgba(100,100,200,0.15);
         `,
         mobile: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,200,0.15);
         `,
         position: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           margin: 0.5em;
         `,
         infoRow: `
           display: flex; flex-direction: row; justify-content: space-between; align-items: center;
           margin: 0; padding: 0 0.5em; border-bottom: 1px solid #222;
         `,
         infoField: `
           display: flex; flex-direction: column; justify-content: center; align-items: center;
           margin: 0; font-size: 0.95em;
         `,
         descriptionRow: `
           display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
           margin: 0.5em 0; padding: 0 0.5em;
         `,
         description: `
           display: flex; flex-direction: column; justify-content: center; align-items: center;
           margin: 0; padding: 0; font-size: 0.95em;
         `,
         descriptionHidden: `display: none;`
       },
       edu: {
         window: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,200,0.15);
         `,
         mobile: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,200,0.15);
         `,
         row: `
           display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
           margin: 0.5em; padding: 0 0 0 0.5em;
         `,
         degree: `margin: 0 0 0 0.5em; font-size: 0.95em;`,
         field: `
           margin: 0 0 0 0.5em; padding: 0; font-size: 0.95em;
         `
       },
       certs: {
         window: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; flex-wrap: wrap;
           background-color: rgba(100,100,200,0.15);
         `,
         mobile: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,200,0.15);
         `,
         row: `
           display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
           margin: 0 0 0.5em; padding: 0 0 0 0.5em;
         `,
         col: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: center;
           margin: 0.5em; padding: 0; text-align: center;
         `,
         title: `margin: 0.5em; font-size: 0.95em;`,
         field: `
           margin: 0 0 0 0.5em; padding: 0; font-size: 0.95em;
         `,
         link: `
           margin: 0 0 0 0.5em; padding: 0; font-size: 0.95em; text-decoration: none; color: #aaf;
         `
       },
       volunteer: {
         window: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,200,0.15);
         `,
         mobile: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,200,0.15);
         `,
         row: `
           display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
           margin: 0 0 0.5em; padding: 0 0 0 0.5em;
         `,
         org: `font-size: 0.95em;`,
         description: `
           margin: 0 0 0 0.5em; padding: 0; font-size: 0.95em;
         `
       },
     }

     // ResumeView Globals
     const store = props.store;
     const state = store.getState();
     const MOB = window.innerWidth < 700;
     const E = React.createElement;

     // ResumeView Content
     // Skills Section
     const skillsButton = E("h2", {style: styles.section.title}, ["Skills"]);
     skillsButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_SKILLS_SECTION"}));

     const showSkills = state.resumeState.skills == "OPEN";
     const skillsWindow = E("div", {style: showSkills ? (MOB ? styles.skills.mobile : styles.skills.window) : styles.section.hidden}, [
       ["Convolutional Neural Networks", "Recurrent Neural Networks", "Parallel Computing (CUDA)"],
       ["Data Structures / Algorithms", "ML Project Pipelining", "Embedded Systems"],
       ["Data Structures/Algorithms", "ML Project Pipelining", "Embedded Systems"],
       ["C, Python, Java, Js", "Matlab & Octave", "Windows/Unix System Admin."]
     ].map(c => E("div", {style: styles.skills.column}, c.map(s => E("p", {style: styles.skills.skill}, [s])))));

     // History Section
     const historyButton = E("h2", {style: styles.section.title}, ["History"]);
     historyButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_HIST_SECTION"}));

     const showHist = state.resumeState.history == "OPEN";
     const historyWindow = E("div", {style: showHist ? (MOB ? styles.history.mobile : styles.history.window) : styles.section.hidden}, [
       ["Accounts Receivable Specialist", "ABC Legal Services", "(July 2018 – Present)",
       "Prepare monthly receivable statements. Post receipts to appropriate accounts and verify transaction details."],
       ["Logistics Specialist", "ABC Legal Services", "(March 2018 – July 2018)",
       "Reviewed court filings for key information and performed data entry. Determined case venues. Directed process service attempts. Followed best practices for handling sensitive legal information."],
       ["Caregiver", "Woodway Senior Living", "(March 2017 – Nov. 2017)",
       "Assisted elderly patients in daily living activities such as nutrition, ambulation, administering medications and personal care/hygiene."],
       ["Mobile Developer", "ServiceMonster", "(Dec. 2016 – March 2017)",
       "Developed business management software for POS, invoices & estimates, inventory, accounting, and fleet routing & tracking. Worked with mobile team to develop tablet-based solutions using React Native."],
       ["Assembler", "Itek Energy", "(Sept. 2016 – Dec. 2016)",
       "Performed basic assembly tasks for solar panel construction. Made bus bars, placed bars on panels to be spot welded, soldered broken welds, and installed junction boxes."],
       ["Sales Associate", "Brivity", "(June 2016 – Sept. 2016)",
       "Helped grow leads & sales for a CRM, text-to-lead, and home valuation SaaS company. Assisted in developing on-boarding and training programs. Also served in an IT support position."],
       ["Sales Supervisor", "Best Buy", "(Aug. 2015 – June 2016)",
       "Produced ~$700k in sales Q4 '15 through use of solutions-based sales techniques. Generated b2b leads. Improved financial services sales & lead one of the strongest locations for that metric in the West Coast market."]
     ].map((position,i) => E("div", {style: styles.history.position}, [
       E("div", {style: styles.history.infoRow}, position.filter((field,idx) => idx !== 3).map((f,i) => E("h3", {style: styles.history.infoField}, [f]))),
       E("div", {style: styles.history.descriptionRow}, [E("p", {style: styles.history.description}, [position[3]])])
     ])));

     // Education Section
     const eduButton = E("h2", {style: styles.section.title}, ["Education"]);
     eduButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_EDU_SECTION"}));

     const showEdu = state.resumeState.education == "OPEN";
     const eduWindow = E("div", {style: showEdu ? (MOB ? styles.edu.mobile : styles.edu.window) : styles.section.hidden}, [
       ["BS Computer Science - ", "Bellevue College ", "(2018 – ongoing)"]
     ].map(row => E("div", {style: styles.edu.row}, row.map((field,idx) => (idx==0)
       ? E("h3", {style: styles.edu.degree}, [field]) : E("p", {style: styles.edu.field}, [field])
     ))));

     // Certifications Section
     const certsButton = E("h2", {style: styles.section.title}, ["Certifications"]);
     certsButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_CERTS_SECTION"}));

     const showCerts = state.resumeState.certifications == "OPEN";
     const certsWindow = E("div", {style: showCerts ? (MOB ? styles.certs.mobile : styles.certs.window) : styles.section.hidden}, [
       ["Machine Learning", "Stanford University on Coursera", "(08.10.2018)", "https://www.coursera.org/account/accomplishments/verify/NK67XWS3X7ZK"],
       ["Neural Networks and Deep Learning", "deeplearning.ai on Coursera", "(08.31.2018)", "https://www.coursera.org/account/accomplishments/verify/H5ECGGJT5WM2"],
       ["Improving Deep Neural Networks: Hyperparameter tuning, Regularization and Optimization", "deeplearning.ai on Coursera", "(09.09.2018)", "https://www.coursera.org/account/accomplishments/verify/UCFYFEDXJ5CP"],
       ["Structuring Machine Learning Projects", " deeplearning.ai on Coursera", "(09.11.2018)", "https://www.coursera.org/account/accomplishments/verify/RRARJ2BRWZ7Y"],
       ["Convolutional Neural Networks","deeplearning.ai on Coursera", "(11.05.2018)", "https://www.coursera.org/account/accomplishments/verify/PBHCCPXZWFGY"],
       ["Certified Nurse Aide", "Queen's University of Charlotte", "2012", "http://www.queens.edu/academics/schools-colleges/presbyterian-school-of-nursing.html"]
     ].map(r => E("div", {style: MOB ? styles.certs.col : styles.certs.row}, r.map((f,i) => (i==0)
       ? E("h3", {style: styles.certs.title}, [f])
       : ((i==3) ? E("a", {style: styles.certs.link, href: f, target: "_blank"}, ["(Link)"]) : E("p", {style: styles.certs.field}, [f]))
     ))));

     // Volunteering Section
     const volunteerButton = E("h2", {style: styles.section.title}, ["Volunteering"]);
     volunteerButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_VOLUNTEER_SECTION"}));

     const showVolunteer = state.resumeState.volunteering == "OPEN";
     const volunteerWindow = E("div", {style: showVolunteer ? (MOB ? styles.volunteer.mobile : styles.volunteer.window) : styles.section.hidden}, [
       ["Hands-On Atlanta", "Maintenance and repair work for low/no-rent community helping single parents and families near or recovering from homelessness.", "(2012-2013)"]
     ].map(row => E("div", {style: styles.volunteer.row}, row.map((field,idx) => (idx==0)
       ? E("h3", {style: styles.volunteer.org}, [field]) : E("p", {style: styles.volunteer.description}, [field])
     ))));

     // Resume
     const resume = E("div", {style: styles.resume}, [Components.DocHeader(props, dispatch, []),
       E("div", {style: MOB ? styles.bodyMobile : styles.body}, [
         E("div", {style: styles.skillsSection}, [skillsButton, skillsWindow]),
         E("div", {style: styles.skillsSection}, [historyButton, historyWindow]),
         E("div", {style: styles.skillsSection}, [eduButton, eduWindow]),
         E("div", {style: styles.skillsSection}, [certsButton, certsWindow]),
         E("div", {style: styles.skillsSection}, [volunteerButton, volunteerWindow])
       ])
     ]);

     // ResumeView
     const ResumeView = E("div", {style: styles.view}, [resume]);

     // ResumeView Listeners
     ResumeView.addEventListener("click", function(event){
       dispatch({type: "CLOSE_MENU"});
     });

     return ResumeView;
   }
 };


/* ---------------------------------- Rendering ----------------------------------- *
 *   Render to the DOM once, passing in Redux Store. App renders based on state     *
 * of the Redux Store. Then subscribe Render method to the Redux Store. Any change  *
 * in the store state and the UI "React"s accordingly.                              *
 * -------------------------------------------------------------------------------- */

 /*  Currently results in refresh of entire app. For most apps, this is fine. For
   very large apps like Googe Sheets, Word Online, etc., this is a problem. Soon to
   add app/ui state diffing engine so that only a particular "branch of ui tree"
   refreshes, based on corresponding changes in the "app state tree" or subtree of. */

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
