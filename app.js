/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: GitHub Web App                                                           *
 * Description: Single page GitHub app, modeled after Redux/React.                   *
 * --------------------------------------------------------------------------------- */


/* ------------------------------------- Libs -------------------------------------- *
 * -- UI & state "libraries"                                                         *
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
        height: 4em; padding: 0 0 0 1em; border-bottom: 1px solid #fff;
        background-image: linear-gradient(rgba(30,60,100,1), rgba(30,60,100,1), rgba(30,60,100,0.9));
      `,
      icon: `height: 2.25em; width: 2.25em; cursor: pointer;`,
      title: `margin-left: 0.35em; color: #fff; font-size: 2.15em; cursor: pointer;`,
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

    const about = React.createElement("a", {style: styles.link}, ["About Me"]);
    about.addEventListener("click", function() {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "ABOUT"});
    });

    const blog = React.createElement("a", {style: styles.link}, ["Blog"]);
    blog.addEventListener("click", function() {
      dispatch({type: "CLOSE_MENU"});
      dispatch({type: "NAV_TO", payload: "BLOG"});
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


    return React.createElement("div", {style: menuStyle}, [home, about, blog, projects, cover, resume, ...children]);
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
      "BLOG": Views.Blog,
      "PROJECTS": Views.Projects,
      "COVER": Views.Cover,
      "RESUME": Views.Resume,
      "DEFAULT": Views.Home
    }

    // Router Globals
    const name = props.store.getState().viewState;
    const view = views[name] ? views[name](props, dispatch, children) : views["DEFAULT"](props, dispatch, children);

    // Create Router & Add Even Listeners
    const Router = React.createElement("div", {style: styles.router}, [Components.View(props, dispatch, [view])]);

    // Return Router
    return Router;
  },
  // DocHeader - responsive cover/resume header
  DocHeader: function(props, dispatch, children) {
    // DocHeader Styles
    const styles = {
      docHeader: `
        padding: 1.25em 4em; display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        background-image: linear-gradient(rgba(20,20,20,0.6), rgba(30,30,30,0.7)), url("./imgs/wp/math.jpg");
        background-size: contain; background-repeat: no-repeat; background-position: center;
        background-color: #000; color: #eee; border-bottom: 1px solid #ccc;
      `,
      docHeaderMobile: `
        padding: 0.5em 0 1em; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-image: linear-gradient(rgba(20,20,20,0.6), rgba(30,30,30,0.7)), url("./imgs/wp/math.jpg");
        background-size: contain; background-repeat: no-repeat; background-position: center;
        background-color: #000; color: #eee; border-bottom: 1px solid #fff;
      `,
      docHeaderLeft: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
      `,
      docHeaderLeftMobile: `
        display: flex; flex-direction: column; justify-content: center; align-items: center; border-bottom: 1px solid #fff; margin: 0 1em;
      `,
      docImg: `
        margin: 0 0 0.25em 0; width: 8em; border: 1px solid #fff; border-radius: 100%;
      `,
      docImgMobile: `
        margin: 0.75em 0 0 0; width: 10em; border: 1px solid #fff; border-radius: 100%;
      `,
      docName: `
        margin: 0; font-size: 1.75em;
      `,
      docTitle: `
        margin: 0 0 0.2em 0; font-size: 1em;
      `,
      docHeaderRight: `
        margin: 1.25em;
      `,
      docHeaderRow: `
        margin: 0.5em; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
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
  },
  // View - responsive view container w/ wallpaper & filter
  View: function(props, dispatch, children) {
    // View Styles
    const styles = {
      view: `
        position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; overflow-y: scroll; padding: 8em 0 0 0;
      `
    }

    // View Globals
    const store = props.store;

    // Create View Wallpaper
    const wallpaperName = store.getState().wallpaperState.name;
    const wallpaperRoute = store.getState().wallpaperState.route;
    styles.view += ` background-image: linear-gradient(rgba(20,20,20,0.5), rgba(30,30,30,0.5)), url("./${wallpaperRoute}");`;
    // const wallpaper = React.createElement("img", {src: wallpaperRoute, alt: wallpaperName, style: styles.wallpaper}, [children]);

    // Create View
    const View = React.createElement("div", {style: styles.view}, children);

    // Even listener to close menu
    View.addEventListener("click", function(){
      dispatch({type: "CLOSE_MENU"});
    });

    // Return View
    return View;
  }
}


/* ------------------------------------- Views ------------------------------------ *
 * -- Views are a type of Component that group several individual Components into   *
 *  one device-screen-sized object to render.                                       *
 * -------------------------------------------------------------------------------- */
 const Views = {
   // Home View - description.
   Home: function(props, dispatch, children) {
     // -- HomeView Styles
     const styles = {
       view: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height: 100%;
       `,
       link: `
        color: #fff; font-family: sans-serif; cursor: pointer; text-decoration: underline;
       `
     }

     // -- HomeView Globals
     const store = props.store;

     // -- HomeView Content
     const link = React.createElement("a", {style: styles.link, href: "https://github.com/chivingtoninc/chivingtoninc.github.io"}, ["chivingtoninc.github.io repo"]);

     // -- HomeView
     const HomeView = React.createElement("div", {style: styles.view}, [link]);

     // -- HomeView Listeners
     HomeView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return HomeView;
   },
   // About View - description.
   About: function(props, dispatch, children) {
     // -- AboutView Styles
     const styles = {
       view: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height: 100%;
       `,
       p: `
        color: #fff; font-family: sans-serif; cursor: pointer;
       `
     }

     // -- AboutView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();

     // -- AboutView Content
     const p = React.createElement("p", {style: styles.p}, [viewName]);

     // -- AboutView
     const AboutView = React.createElement("div", {style: styles.view}, [p]);

     // -- AboutView Listeners
     AboutView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return AboutView;
   },
   // Blog View - description.
   Blog: function(props, dispatch, children) {
     // -- BlogView Styles
     const styles = {
       view: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height: 100%;
       `,
       link: `
        color: #fff; font-family: sans-serif; cursor: pointer; text-decoration: underline;
       `
     }

     // -- BlogView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();

     // -- BlogView Content
     const p = React.createElement("p", {style: styles.p}, [viewName]);

     // -- BlogView
     const BlogView = React.createElement("div", {style: styles.view}, [p]);

     // -- BlogView Listeners
     BlogView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return BlogView;
   },
   // Projects View - description.
   Projects: function(props, dispatch, children) {
     // -- ProjectsView Styles
     const styles = {
       view: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height: 100%;
       `,
       p: `
        color: #fff; font-family: sans-serif; cursor: pointer;
       `
     }

     // -- ProjectsView Globals
     const store = props.store;
     const viewName = store.getState().viewState.toLowerCase();

     // -- ProjectsView Content
     const p = React.createElement("p", {style: styles.p}, [viewName]);

     // -- ProjectsView
     const ProjectsView = React.createElement("div", {style: styles.view}, [p]);

     // -- ProjectsView Listeners
     ProjectsView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return ProjectsView;
   },
   // Cover View - description.
   Cover: function(props, dispatch, children) {
     // -- CoverView Styles
     const styles = {
       cover: `
         margin: 0.75em; background-color: rgba(100,100,100,0.9); border: 1px solid #000;
       `,
       coverBody: `
         padding: 1em 3em; background-color: #fff; color: #222;
       `,
       coverLine: `
         margin: 1em auto; text-align: center;
       `
     }

     // -- CoverView Globals
     const store = props.store;
     const state = store.getState();

     // -- CoverView Content
     const header = Components.DocHeader(props, dispatch, []);
     const body = React.createElement("div", {style: styles.coverBody}, [
       `I am an adept software engineer, experienced with object-oriented, algorithmic design in C, Python, Java & Javascript, as well as learning algorithms & models, and I am seeking entry-level Deep Learning roles in Computer Vision & Natural Language Processing.`,
       `I am a Computer Science student at Bellevue College and have completed additional courses in Machine & Deep Learning from Stanford & deeplearning.ai through Coursera. Currently, I am focused on creating CV, NLP, and SLAM applications for embedded & cloud-based systems. I am building a modular ecosystem of AI tools from embedded & IoT devices to cloud-based fleet management systems.`,
       `Deep Learning is revolutionizing many industries and I am learning to leverage it’s incredible capabilities for enhancing daily life. My primary career interests are in automated robotics for manufacturing, food production and sustainable technologies.`,
       `Lastly, I am a conversational Spanish speaker, a beginner in several other languages, and I enjoy connecting with people from different cultures and backgrounds. It would be a rewarding experience to work alongside dedicated professionals who are also passionate about bringing useful AI technologies to life.`
     ].map(l => React.createElement("p", {style: styles.coverLine}, [l])));

     // -- CoverView
     const CoverView = React.createElement("div", {style: styles.cover}, [header, body]);

     // -- CoverView listeners
     CoverView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return CoverView;
   },
   // Resume View - description.
   Resume: function(props, dispatch, children) {
     // -- ResumeView Styles
     const styles = {
       resume: `
         margin: 0.75em; background-color: rgba(100,100,100,0.9); border: 1px solid #000;
       `,
       body: `
         padding: 0 1em; background-color: #fff; color: #000;
         border: 1px solid #444;
       `,
       bodyMobile: `
         padding: 0 1em; background-color: #fff; color: #000;
         border: 1px solid #444;
       `,
       section: {
         title: `
           margin: 1em 0 0; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
           padding: 0 0.25em; font-size: 1.05em; border-bottom: 1px solid #000; cursor: pointer;
         `,
         hidden: `
           display: none;
         `
       },
       skills: {
         window: `
           display: flex; flex-direction: row; justify-content: space-between; align-items: center;
           background-color: rgba(100,100,100,0.2);
         `,
         mobile: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,100,0.2);
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
           padding: 0.5em; background-color: rgba(100,100,100,0.2);
         `,
         mobile: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           background-color: rgba(100,100,100,0.2);
         `,
         position: `
           display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
           margin: 0.5em;
         `,
         infoRow: `
           display: flex; flex-direction: row; justify-content: space-between; align-items: center;
           margin: 0; border-bottom: 1px solid #222;
         `,
         infoField: `
           display: flex; flex-direction: column; justify-content: center; align-items: center;
           margin: 0; font-size: 0.95em;
         `,
         descriptionRow: `
           display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
           margin: 0 0 0.5em; padding: 0 0.5em;
         `,
         description: `
           display: flex; flex-direction: column; justify-content: center; align-items: center;
           margin: 0; padding: 0; font-size: 0.9em;
         `
       },
       edu: {
         window: `
           background-color: rgba(100,100,100,0.2);
         `,
         mobile: `
           background-color: rgba(100,100,100,0.2);
         `,
         row: `
           display: flex; flex-direction: row; justify-content: space-between; align-items: center;
           border: 1px solid #00f;
         `,
         field: `
           border: 1px solid #f00;
         `
       },
       certs: {
         window: `
           background-color: rgba(100,100,100,0.2);
         `,
         mobile: `
           background-color: rgba(100,100,100,0.2);
         `,
         row: `
           display: flex; flex-direction: row; justify-content: space-between; align-items: center;
           border: 1px solid #00f;
         `,
         field: `
           border: 1px solid #f00;
         `
       },
       volunteer: {
         window: `
           background-color: rgba(100,100,100,0.2);
         `,
         mobile: `
           background-color: rgba(100,100,100,0.2);
         `,
         row: `
           display: flex; flex-direction: row; justify-content: space-between; align-items: center;
           border: 1px solid #00f;
         `,
         field: `
           border: 1px solid #f00;
         `
       },
     }

     // -- ResumeView Globals
     const store = props.store;
     const state = store.getState();
     const MOB = window.innerWidth < 700;
     const E = React.createElement;

     // -- ResumeView Content
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
     ].map(position => E("div", {style: styles.history.position}, [
       E("div", {style: styles.history.infoRow}, position.filter((field,idx) => idx !== 3).map(f => E("h3", {style: styles.history.infoField}, [f]))),
       E("div", {style: styles.history.descriptionRow}, [E("p", {style: styles.history.description}, [position[3]])])
     ])) );

     // Education Section
     const eduButton = E("h2", {style: styles.section.title}, ["Education"]);
     eduButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_EDU_SECTION"}));

     // Bellevue College – BS Computer Science (2018 – ongoing)
     // Central Piedmont Community College – BS Electronics Engineering (2013 – unfinished)
     // Queen's University of Charlotte – Cert. Nurse Aide (2012 – 4.0)

     const showEdu = state.resumeState.education == "OPEN";
     const eduWindow = E("div", {style: showEdu ? (MOB ? styles.edu.mobile : styles.edu.window) : styles.section.hidden}, [
       ["school1", "dates1", "degree1"],
       ["school2", "dates2", "degree2"],
       ["school3", "dates3", "degree3"]
     ].map(r => E("div", {style: styles.edu.row}, r.map(f => E("p", {style: styles.edu.field}, [f])))));

     // Certifications Section
     const certsButton = E("h2", {style: styles.section.title}, ["Certifications"]);
     certsButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_CERTS_SECTION"}));

     // Deeplearning.ai on Coursera – 5 Course Deep Learning Specialization (2018 – ongoing)
     // Stanford University on Coursera – Machine Learning Certificate (Aug. 2018 – 4.0)

     const showCerts = state.resumeState.certifications == "OPEN";
     const certsWindow = E("div", {style: showCerts ? (MOB ? styles.certs.mobile : styles.certs.window) : styles.section.hidden}, [
       ["certification1", "issuer1", "date1", "expiration1"],
       ["certification2", "issuer2", "date2", "expiration2"],
       ["certification3", "issuer3", "date3", "expiration3"],
       ["certification4", "issuer4", "date4", "expiration4"]
     ].map(r => E("div", {style: styles.certs.row}, r.map(f => E("p", {style: styles.certs.field}, [f])))));

     // Volunteering Section
     const volunteerButton = E("h2", {style: styles.section.title}, ["Volunteering"]);
     volunteerButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_VOLUNTEER_SECTION"}));

     // Hands-On Atlanta – maintenance and repair work for low/no-rent community helping single parents
     // and families near or recovering from homelessness. (2014)

     const showVolunteer = state.resumeState.volunteering == "OPEN";
     const volunteerWindow = E("div", {style: showVolunteer ? (MOB ? styles.skillsWindowMobile : styles.skillsWindow) : styles.section.hidden}, [
       ["organization1", "description1", "dates1"],
       ["organization2", "description2", "dates2"],
       ["organization3", "description3", "dates3"]
     ].map(r => E("div", {style: styles.volunteer.row}, r.map(f => E("p", {style: styles.volunteer.field}, [f])))));

     // -- Resume
     const resume = E("div", {style: styles.resume}, [Components.DocHeader(props, dispatch, []),
       E("div", {style: MOB ? styles.bodyMobile : styles.body}, [
         E("div", {style: styles.skillsSection}, [skillsButton, skillsWindow]),
         E("div", {style: styles.skillsSection}, [historyButton, historyWindow]),
         E("div", {style: styles.skillsSection}, [eduButton, eduWindow]),
         E("div", {style: styles.skillsSection}, [certsButton, certsWindow]),
         E("div", {style: styles.skillsSection}, [volunteerButton, volunteerWindow])
       ])
     ]);

     // -- ResumeView
     const ResumeView = E("div", {style: styles.view}, [resume]);

     // -- ResumeView Listeners
     ResumeView.addEventListener("click", function(){
       dispatch({type: "CLOSE_MENU"});
     });

     return ResumeView;
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
  menuState: function (state = "CLOSED", action) {
    const choices = {
      "TOGGLE_MENU": () => (state == "CLOSED") ? "OPEN" : "CLOSED",
      "OPEN_MENU": () => "OPEN",
      "CLOSE_MENU": () => "CLOSED",
      "DEFAULT": () => state
    }
    return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
  },
  // initializes/maintains resume state
  resumeState: function (state = {skills: "OPEN", history: "OPEN", education: "OPEN", certifications: "OPEN", volunteering: "OPEN"}, action) {
    const choices = {
      "TOGGLE_SKILLS_SECTION": () => Object.assign({}, state, {skills: state.skills == "OPEN" ? "CLOSED" : "OPEN"}),
      "TOGGLE_HIST_SECTION": () => Object.assign({}, state, {history: state.history == "OPEN" ? "CLOSED" : "OPEN"}),
      "TOGGLE_EDU_SECTION": () => Object.assign({}, state, {education: state.education == "OPEN" ? "CLOSED" : "OPEN"}),
      "TOGGLE_CERTS_SECTION": () => Object.assign({}, state, {certifications: state.certifications == "OPEN" ? "CLOSED" : "OPEN"}),
      "TOGGLE_VOLUNTEER_SECTION": () => Object.assign({}, state, {volunteering: state.volunteering == "OPEN" ? "CLOSED" : "OPEN"}),
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
