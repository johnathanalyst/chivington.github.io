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

     //  -- Create contents (link element) to place in the view/filter
     const link = React.createElement("a", {style: styles.link, href: "https://github.com/chivingtoninc/chivingtoninc.github.io"}, ["chivingtoninc.github.io repo"]);

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

     //  -- Create contents (p element) to place in the view/filter
     const p = React.createElement("p", {style: styles.p}, [viewName]);

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

     //  -- Create contents (p element) to place in the view/filter
     const p = React.createElement("p", {style: styles.p}, [viewName]);

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
         margin: 0.75em; background-color: rgba(100,100,100,0.9); border: 1px solid #000;
       `,
       coverImg: `
         margin: 0 0 0.25em 0; width: 8em; border: 1px solid #fff; border-radius: 100%;
       `,
       coverImgMobile: `
         margin: 0.75em 0 5em 0; width: 13em; border: 1px solid #fff; border-radius: 100%;
       `,
       coverName: `
         margin: 0.2em; font-size: 1.75em;
       `,
       coverTitle: `
         margin: 0.2em; font-size: 1em;
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
         height: 0.9em; width: 0.9em; margin: 0 0.5em 0 0;
       `,
       coverHeaderLink: `
         text-decoration: underline; cursor: pointer; font-size: 0.9em; color: #fff;
       `,
       coverBody: `
         padding: 1em 3em; background-color: #fff; color: #222;
       `,
       coverLine: `
         margin: 1em auto; text-align: center;
       `
     }

     // CoverView Globals
     const store = props.store;
     const state = store.getState();
     const currentMode = state.windowState;
     const viewName = state.viewState.toLowerCase();
     const W = window.innerWidth;
     const E = React.createElement;

     // -- Create a wallpaper (img element) for the view
     const wpName = store.getState().wallpaperState.name;
     const wpRoute = store.getState().wallpaperState.route;
     const wp = E("img", {src: wpRoute, alt: wpName, style: styles.wp}, []);

     //  -- Create cover letter
     const cover = E("div", {style: styles.cover}, [
       Components.DocHeader(props, dispatch, []),
       E("div", {style: styles.coverBody}, [
         `I am an experienced software engineer, proficient in object-oriented, algorithmic design in C, Python, Java, and Js. I am seeking entry-level Deep Learning roles in Computer Vision, working with Object Detection & Tracking .`,
         `I am a Computer Science student at Bellevue College and have recently completed Stanford's Machine Learning course on Coursera, as well as four of five courses in deeplearning.AI’s Deep Learning Specialization on Coursera. I am currently building useful Deep Learning projects, using the skills learned in these courses.`,
         `I am focused on creating efficient AI applications, platforms and tools for CV, NLP, and SLAM on embedded & cloud-based systems for applications in automated manufacturing, intelligent robotics, and other areas. AI is revolutionizing many industries and I am learning to leverage it’s capabilities for enhancing daily life. My primary career field interests are in automated manufacturing, food production and sustainable technologies, and/or transportation.`,
         `Finally, I am a conversational Spanish speaker, a beginner in several other languages, and I enjoy connecting with people from different cultures and backgrounds. It would be a great pleasure to work alongside the dedicated professionals who are passionate about bringing useful AI technologies to life.`
       ].map(l => E("p", {style: styles.coverLine}, [l])))
     ]);

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
       resume: `
         margin: 0.75em; background-color: rgba(100,100,100,0.9); border: 1px solid #000;
       `,
       resumeBody: `
         padding: 0 1em; background-color: #444; color: #fff;
         border: 1px solid #444;
       `,
       resumeBodyMobile: `
         color: #fff;
       `,
       sectionTitle: `
         margin: 1em 0 0; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
         padding: 0 0.75em; font-size: 1.05em; border-bottom: 1px solid #000;
       `,
       window: `
         background-color: #333;
       `,
       skillsWindow: `
         display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; text-decoration: underline;
       `,
       skillsWindowMobile: `
         display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; text-decoration: underline;
       `,
       skillsWindow: `
         display: flex; flex-direction: row; justify-content: space-between; align-items: center;
       `,
       skillsWindowMobile: `
         color: #fff;
       `,
       skillColumn: `
         display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
       `,
       skill: `
         border: 1px solid #000; margin: 0.25em auto;
       `,
       historySection: `
         display: flex; flex-direction: row; justify-content: space-beteween; align-items: center;
       `,
       historySectionMobile: `
         display: flex; flex-direction: column; justify-content: stretch; align-items: center;
       `,
       historySectionMobileHidden: `
        display: none;
       `,
       education: `
         color: #fff;
       `,
       educationMobile: `
         color: #fff;
       `,
       certifications: `
         color: #fff;
       `,
       certificationsMobile: `
         color: #fff;
       `,
       volunteering: `
         color: #fff;
       `,
       volunteeringMobile: `
         color: #fff;
       `
     }

     // ResumeView Globals
     const store = props.store;
     const state = store.getState();
     const currentMode = state.windowState;
     const viewName = state.viewState.toLowerCase();
     const W = window.innerWidth;
     const E = React.createElement;

     // -- Create a wallpaper (img element) for the view
     const wpName = store.getState().wallpaperState.name;
     const wpRoute = store.getState().wallpaperState.route;
     const wp = E("img", {src: wpRoute, alt: wpName, style: styles.wp}, []);

     // -- Resume Skills Section
     const skillsButton = E("h2", {style: styles.sectionTitle}, ["Skills"]);
     skillsButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_SKILL_SECTION"}));

     const skillsWindow = E("div", {style: W < 700 ? styles.skillsWindowMobile : styles.window}, [
       ["Convolutional Neural Networks", "Recurrent Neural Networks", "Parallel Computing (CUDA)"],
       ["Data Structures / Algorithms", "ML Project Pipelining", "Embedded Systems"],
       ["Data Structures/Algorithms", "ML Project Pipelining", "Embedded Systems"],
       ["C, Python, Java, Js", "Matlab & Octave", "Windows/Unix System Admin."]
     ].map(c => E("div", {style: styles.skillColumn}, c.map(s => E("p", {style: styles.skill}, [s])))));

     // -- Resume History Section
     //

     // -- Resume Education Section
     //

     // -- Resume Certifications Section
     //

     // -- Resume Volunteering Section
     //

     //  -- Create Resume
     const resume = E("div", {style: styles.resume}, [Components.DocHeader(props, dispatch, []),
       E("div", {style: W < 700 ? styles.resumeBodyMobile : styles.resumeBody}, [
         E("div", {style: styles.skillsSection}, [skillsButton, skillsWindow]),
         E("div", {style: W < 700 ? styles.historyMobile : styles.history}, [
           E("p", {style: W < 700 ? styles.historyMobile : styles.history}, ["history"])
         ]),
         E("div", {style: W < 700 ? styles.educationMobile : styles.education}, [
           E("p", {style: W < 700 ? styles.educationMobile : styles.education}, ["education"])
         ]),
         E("div", {style: W < 700 ? styles.certificationsMobile : styles.certifications}, [
           E("p", {style: W < 700 ? styles.certificationsMobile : styles.certifications}, ["certifications"])
         ]),
         E("div", {style: W < 700 ? styles.volunteeringMobile : styles.volunteering}, [
           E("p", {style: W < 700 ? styles.volunteeringMobile : styles.volunteering}, ["volunteering"])
         ])
       ])
     ]);

     // -- Create wallpaper filter
     const filter = E("div", {style: styles.filter}, [resume]);

     // -- Create view element, passing children
     const ResumeView = E("div", {style: styles.view}, [wp, filter]);
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
    // Shell Styles
    const styles = {
      shell: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; overflow: hidden;
        position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; margin: auto; background-color: #07e;
      `
    }

    // Shell Globals
    const store = props.store;
    const state = store.getState();
    const menuState = state.menuState;

    // Create & Return the Shell
    return React.createElement("div", {style: styles.shell}, [
      { elem: Components.Header, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Menu, props: { store }, dispatch: dispatch, children: [] },
      { elem: Components.Router, props: { store }, dispatch: dispatch, children: [] }
    ]);
  },
  // Header - contains menu toggle button, title/home link, and top-level (favorites/most recent) routes.
  Header: function(props, dispatch, children) {
    // Header Styles
    const styles = {
      header: `
        position: absolute; top: 0; left: 0; right: 0; z-index: 15;
        display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
        height: 4em; padding: 0 0 0 1em; border-bottom: 1px solid #fff; background-color: #222;
      `,
      icon: `height: 2.25em; width: 2.25em; cursor: pointer;`,
      title: `margin-left: 0.25em; color: #fff; font-size: 2.15em; cursor: pointer;`,
      superScript: `font-size: 0.3em; margin-left: 1px;`
    }

    // Header icon
    const icon = React.createElement("img", {style: styles.icon, src: "./favicon.ico", alt: "chivingtoninc Icon"}, []);
    icon.addEventListener("click", function(e) {
      dispatch({type: "TOGGLE_MENU"})
    });

    // Superscript for current view
    const view = props.store.getState().viewState.toLowerCase();
    const superScript = React.createElement("sup", {style: styles.superScript}, [view])

    // Title element & event listeners
    const title = React.createElement("h1", {style: styles.title}, ["chivingtoninc", superScript ]);
    title.addEventListener("click", function() {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "HOME"})
    });

    // Create app header & add event listeners
    const Header = React.createElement("div", {style: styles.header}, [icon, title]);

    // Return Header
    return Header;
  },
  // Menu - layered/collapsible full-route menu.
  Menu: function(props, dispatch, children) {
    const styles = {
      menuOpen: `
        position: absolute; top: 4em; left: 0; bottom: 0; width: 10em; padding: 0.25em 1em 0 0; z-index: 10;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-image: linear-gradient(to bottom right, #666, #666);
        border-right: 1px solid #024; animation: menuOpen 0.15s 1;
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
    // Router Styles
    const styles = {
      router: `
        position: absolute; top: -4em; left: 0; bottom: 0; right: 0; overflow: hidden;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: #07e;
      `
    }

    // Views
    const views = {
      "HOME": Views.Home,
      "ABOUT": Views.About,
      "PROJECTS": Views.Projects,
      "COVER": Views.Cover,
      "RESUME": Views.Resume,
      "DEFAULT": Views.Home
    }

    // Router Globals
    const name = props.store.getState().viewState;
    const view = views[name] ? views[name](props, dispatch, children) : views["DEFAULT"](props, dispatch, children);

    // Create Router & Add Even Listeners
    const Router = React.createElement("div", {style: styles.router}, [view]);
    Router.addEventListener("click", function(){
      dispatch({type: "CLOSE_MENU"});
    });

    // Return Router
    return Router;
  },
  // DocHeader - responsive cover/resume header
  DocHeader: function(props, dispatch, children) {
    // DocHeader Styles
    const styles = {
      docHeader: `
        padding: 1.25em 4em; display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        background-image: url("./imgs/wp/math.jpg"); background-size: contain; background-repeat: no-repeat; background-position: center;
        background-color: #000; color: #eee; border-bottom: 1px solid #ccc;
      `,
      docHeaderMobile: `
        padding: 0.5em 0 1em; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-image: url("./imgs/wp/math.jpg"); background-size: contain; background-repeat: no-repeat; background-position: center;
        background-color: #000; color: #eee; border-bottom: 1px solid #fff;
      `,
      docHeaderLeft: `
        color: #fff;
      `,
      docHeaderLeftMobile: `
        color: #fff; margin: 0.5em 1em; border-bottom: 1px solid #fff;
      `,
      docImg: `
        margin: 0 0 0.25em 0; width: 8em; border: 1px solid #fff; border-radius: 100%;
      `,
      docImgMobile: `
        margin: 0.75em 0 5em 0; width: 13em; border: 1px solid #fff; border-radius: 100%;
      `,
      docName: `
        margin: 0.2em; font-size: 1.75em;
      `,
      docTitle: `
        margin: 0.2em; font-size: 1em;
      `,
      docHeaderRight: `
        color: #fff;
      `,
      docHeaderRow: `
        padding: 0.25em; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
      `,
      docHeaderRowMobile: `
        padding: 0.25em; display: flex; flex-direction: row; justify-content: center; align-items: center;
      `,
      docHeaderIcon: `
        height: 0.9em; width: 0.9em; margin: 0 0.5em 0 0;
      `,
      docHeaderLink: `
        text-decoration: underline; cursor: pointer; font-size: 0.9em; color: #fff;
      `
    }

    // DocHeader Globals
    const store = props.store;
    const state = store.getState();
    const currentMode = state.windowState;
    const viewName = state.viewState.toLowerCase();
    const W = window.innerWidth;
    const E = React.createElement;

    // Create DocHeader & add event listeners
    const DocHeader = E("div", {style: W < 700 ? styles.docHeaderMobile : styles.docHeader}, [
      E("div", {style: W < 700 ? styles.docHeaderLeftMobile : styles.docHeaderLeft}, [
        E("img", {style: W < 700 ? styles.docImgMobile : styles.docImg, src: "./imgs/me/me-n-win.jpg", alt: "my beautiful face"}, []),
        E("h2", {style: styles.docName}, ["Johnathan Chivington"]),
        E("p", {style: styles.docTitle}, ["Deep Learning & AI Engineer"])
      ]),
      E("div", {style: styles.docHeaderRight}, [
        ["./imgs/icons/sm/phone.svg", "phone icon", "tel:303-900-2861", "303.900.2861"],
        ["./imgs/icons/sm/email.svg", "email icon", "mailto:j.chivington@bellevuecollege.edu", "j.chivington@bellevuecollege.edu"],
        ["./imgs/icons/sm/li.svg", "linkedin icon", "https://linkedin.com/in/chivingtoninc", "linkedin.com/in/chivingtoninc"],
        ["./imgs/icons/sm/git.svg", "gihub icon", "https://github.com/chivingtoninc", "github.com/chivingtoninc"],
        ["./imgs/icons/sm/twt.svg", "twitter icon", "https://twitter.com/chivingtoninc", "twitter.com/chivingtoninc"],
        ["./imgs/icons/sm/dl.svg", "Download Resume (.docx)", "./includes/j.Chivington.Resume.docx", "Download Resume (.docx)"]
      ].map(r => E("div", {style:  W < 700 ? styles.docHeaderRowMobile : styles.docHeaderRow}, [
        E("img", {style: styles.docHeaderIcon, src: r[0], alt: r[1]}, []),
        E("a", {style: styles.docHeaderLink, href: r[2], target: "_blank"}, [r[3]])
      ])))
    ])

    // Return DocHeader
    return DocHeader;
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
  viewState: function (state = "RESUME", action) {
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
  menuState: function (state = "OPEN", action) {
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
