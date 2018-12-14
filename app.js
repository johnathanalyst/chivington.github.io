/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: GitHub Web App                                                           *
 * Description: Single page GitHub app, modeled after Redux/React.                   *
 * --------------------------------------------------------------------------------- */


/* ------------------------------------- Libs -------------------------------------- *
 *    These barebones modules for initializing and maintaining application state/UI  *
 *  are modeled after React & Redux.                                                 *
 * --------------------------------------------------------------------------------- */

// React - creates elements and diffs/maintains vdom tree
const React = {
  createElement: function(elem, attrs, children) {
    const element = document.createElement(elem);

    if (attrs) Object.keys(attrs).forEach(k => element.setAttribute(k, attrs[k]));

    if (children.length >= 1) children.forEach(child => element.appendChild((typeof child == "string")
      ? document.createTextNode(child) : ((child.elem) ? child.elem(child.props, child.dispatch, child.children) : child)
    ));

    return element;
  }
};

// ReactDOM - renders/updates dom based on vdom tree
const ReactDOM = {
  render: function(component, root) {
    while (root.children[0]) root.removeChild(root.children[0]);
    root.appendChild(component.elem(component.props, component.dispatch, component.children));
  }
};

// Redux - maintains application state
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
      dispatch({type: "SUBSCRIBED"});
      return () => {
        listeners = listeners.filter(l => l !== listener);
      }
    }

    dispatch({type: "@@INIT"});

    return { getState, dispatch, subscribe };
  },
  combineReducers: function(reducers) {
    return function(state, action) {
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


/* -------------------------------- Asset Manifest --------------------------------- *
 *                         Define everything needed to cache.                        *
 * --------------------------------------------------------------------------------- */
const Assets = {
  resource_index: "/index.html",
  resource_app: "/app.js",
  resource_sw: "/sw.js",
  resource_webmanifest: "/site.webmanifest",
  resource_coverDocx: "/includes/docs/j.Chivington.Cover.docx",
  resource_coverPdf: "/includes/docs/j.Chivington.Cover.pdf",
  resource_resumeDocx: "/includes/docs/j.Chivington.Resume.docx",
  resource_resumePdf: "/includes/docs/j.Chivington.Resume.pdf",
  resource_avenir: "/includes/fonts/Avenir-Book.otf",
  content_greeting: "/imgs/content/hello.png",
  content_step1: "/imgs/content/step1.jpg",
  content_step2: "/imgs/content/step2.jpg",
  content_meAndWin: "/imgs/me/me-n-win.jpg",
  content_meAndWinBed: "/imgs/me/me-n-win-bed.jpg",
  content_me: "/imgs/me/me.jpg",
  wp_fragmented: "/imgs/wp/fragmented.jpg",
  wp_math: "/imgs/wp/math.jpg",
  wp_pnw: "/imgs/wp/pnw.jpg",
  icon_favicon: "/favicon.ico",
  icon_wifi: "/imgs/icons/network/wifi.svg",
  icon_noWifi: "/imgs/icons/network/noWifi.svg",
  icon_noWifi2: "/imgs/icons/network/noWifi2.svg",
  icon_brain: "/imgs/icons/sm/brain.svg",
  icon_download: "/imgs/icons/sm/dl.svg",
  icon_email: "/imgs/icons/sm/email.svg",
  icon_facebook: "/imgs/icons/sm/fb.svg",
  icon_github: "/imgs/icons/sm/git.svg",
  icon_linkedin: "/imgs/icons/sm/li.svg",
  icon_phone: "/imgs/icons/sm/phone.svg",
  icon_twitter: "/imgs/icons/sm/twt.svg",
  icon_androidChrome192: "/imgs/icons/android-chrome-192x192.png",
  icon_androidChrome512: "/imgs/icons/android-chrome-512x512.png",
  icon_appleTouchIcon: "/imgs/icons/apple-touch-icon.png",
  icon_browserconfig: "/imgs/icons/browserconfig.xml",
  icon_favicon16: "/imgs/icons/favicon-16x16.png",
  icon_favicon32: "/imgs/icons/favicon-32x32.png",
  icon_mstile70: "/imgs/icons/mstile-70x70.png",
  icon_mstile144: "/imgs/icons/mstile-144x144.png",
  icon_mstile150: "/imgs/icons/mstile-150x150.png",
  icon_mstile310: "/imgs/icons/mstile-310x310.png",
  icon_safariPinnedTab: "/imgs/icons/safari-pinned-tab.png",
  icon_close: "/imgs/icons/btns/close.svg",
  icon_adsenseSquare: "/imgs/ads/adsense-400x400.jpg",
  icon_adsenseWide: "/imgs/ads/adsense-wide.png"
};

/* ----------------------------------- Blueprint ----------------------------------- *
 *    This object specifies the initial app features, such as themes, wallpapers,    *
 *  guides, notifications, etc.                                                      *
 * --------------------------------------------------------------------------------- */

const Blueprint = {
  app: {
    initConnection: {
      downlink: navigator.connection ? navigator.connection.downlink : 10,
      effectiveType: navigator.connection ? navigator.connection.effectiveType : "Connecting...",
      prev: "@@INIT"
    },
    initBattery: {
      percent: 0
    },
    initWorkers: {
      installed:  false, domain: null
    }
  },
  ui: {
    initSubscription: false,
    initUser: {
      user: "GUEST", returning: false, appMsg: false
    },
    initWindow: {
      width: window.innerWidth,
      height: window.innerHeight,
      mode: window.innerWidth < 950 ? "MOBILE" : (window.innerWidth < 1200 ? "TABLET" : "DESKTOP")
    },
    initHeader: {
      visibility: "VISIBLE", icon: Assets.icon_brain
    },
    initMenu: "CLOSED",
    initNotification: {
      visibility: "HIDDEN", msg: "Welcome!", tile: Assets.icon_brain, alt: "brain icon", action: null
    },
    initGuide: {
      visibility: "HIDDEN",
      box: { boxx:0, boxy:0, boxh:0, boxw:0, boxr:0 },
      msg: { position: {msgx:0, msgy:0, msgh:0, msgw:0, msgr:0}, txt: "Guide Message!" },
      btn: { position: {btnx:0, btny:0, btnh:0, btnw:0, btnr:0}, txt: "Guide Button!" },
      animation: "animation: menuGuide 750ms 1 ease-in-out forwards;"
     },
    initView: {
      view: "BLOG", prev: "@@INIT", scroll: {x: 0, y: 0},
      views: {
        "HOME": [],
        "BLOG": [],
        "PROJECTS": [],
        "COVER": [],
        "RESUME": [],
        "GUIDE": [],
      }
    },
    initTheme: {
      headerColor: "background-image: linear-gradient(#333, #222);",
      menuIcon: Assets.icon_brain,
      menuColor: "background-image: linear-gradient(to bottom right, rgba(25,110,214,1), rgba(6,90,204,1));",
      networkIndicator: "SHOWN",
      viewBackground: Assets.wp_pnw
    }
  },
  chivingtoninc: {
    initContact: {
      firstName: "Johnathan",
      lastName: "Chivington",
      title: "Deep Learning & AI Engineer",
      phone: "303.900.2861",
      email: "j.chivington@bellevuecollege.edu",
      linkedin: "https://linkedin.com/in/johnathan-chivington",
      github: "https://github.com/chivingtoninc",
      twitter: "https://twitter.com/chivingtoninc",
      facebook: "https://facebook.com/chivingtoninc",
      location: "Seattle, WA",
      search: "Actively Seeking (local & remote)"
    },
    initResume: {
      visible: {
        skills: "OPEN", history: "OPEN", education: "OPEN", certifications: "OPEN", volunteering: "OPEN"
      },
      sections: {
        skills: [
          ["Convolutional Neural Networks", "Recurrent Neural Networks", "Parallel Computing (CUDA)"],
          ["Data Structures / Algorithms", "ML Project Pipelining", "Embedded Systems"],
          ["C, Python, Java, Js", "Matlab & Octave", "Windows/Unix System Admin."]
        ],
        technologies: [],
        history: [
          ["Accounts Receivable Specialist", "ABC Legal Services", "(July 2018 – Present)",
          "Prepare monthly receivable statements. Post receipts to appropriate accounts and verify transaction details."],
          ["Logistics Specialist", "ABC Legal Services", "(March 2018 – July 2018)",
          "Reviewed court filings for key information and performed data entry. Determined case venues. Directed process service attempts. Followed best practices for handling sensitive legal information."],
          ["Caregiver", "Woodway Senior Living", "(March 2017 – Jan. 2018)",
          "Assisted elderly patients in daily living activities such as nutrition, ambulation, administering medications and personal care/hygiene."],
          ["Mobile Developer", "ServiceMonster", "(Dec. 2016 – March 2017)",
          "Developed business management software for POS, invoices & estimates, inventory, accounting, and fleet routing & tracking. Worked with mobile team to develop tablet-based solutions using React Native."],
          ["Assembler", "Itek Energy", "(Sept. 2016 – Dec. 2016)",
          "Performed basic assembly tasks for solar panel construction. Made bus bars, placed bars on panels to be spot welded, soldered broken welds, and installed junction boxes."],
          ["Sales Associate", "Brivity", "(June 2016 – Sept. 2016)",
          "Helped grow leads & sales for a CRM, text-to-lead, and home valuation SaaS company. Assisted in developing on-boarding and training programs. Also served in an IT support position."],
          ["Sales Supervisor", "Best Buy", "(Aug. 2015 – June 2016)",
          "Produced ~$700k in sales Q4 '15 through use of solutions-based sales techniques. Generated b2b leads. Improved financial services sales & lead one of the strongest locations for that metric in the West Coast market."]
        ],
        education: [
          ["BS Computer Science - ", "Bellevue College ", "(2018 – ongoing)"]
        ],
        certifications: [
          ["Machine Learning", "Stanford University on Coursera", "(08.10.2018)", "https://www.coursera.org/account/accomplishments/verify/NK67XWS3X7ZK"],
          ["Neural Networks and Deep Learning", "deeplearning.ai on Coursera", "(08.31.2018)", "https://www.coursera.org/account/accomplishments/verify/H5ECGGJT5WM2"],
          ["Improving Deep Neural Networks: Hyperparameter tuning, Regularization and Optimization", "deeplearning.ai on Coursera", "(09.09.2018)", "https://www.coursera.org/account/accomplishments/verify/UCFYFEDXJ5CP"],
          ["Structuring Machine Learning Projects", " deeplearning.ai on Coursera", "(09.11.2018)", "https://www.coursera.org/account/accomplishments/verify/RRARJ2BRWZ7Y"],
          ["Convolutional Neural Networks","deeplearning.ai on Coursera", "(11.05.2018)", "https://www.coursera.org/account/accomplishments/verify/PBHCCPXZWFGY"],
          ["Certified Nurse Aide", "Queen's University of Charlotte", "2012", "http://www.queens.edu/academics/schools-colleges/presbyterian-school-of-nursing.html"]
        ],
        volunteering: [
          ["Hands-On Atlanta", "Maintenance and repair work for low/no-rent community helping single parents and families near or recovering from homelessness.", "(2012-2013)"]
        ]
      }
    },
    initCover: {
      lines: [
        `I am an adept software engineer, experienced with object-oriented, algorithmic design in C, Python, Java & Javascript, as well as learning algorithms & models, and I am seeking entry-level Deep Learning roles in Computer Vision & Natural Language Processing.`,
        `I am a Computer Science student at Bellevue College and have completed additional courses in Machine & Deep Learning from Stanford & deeplearning.ai through Coursera. Currently, I am focused on creating CV, NLP, and SLAM applications for embedded & cloud-based systems. I am building a modular ecosystem of AI tools from embedded & IoT devices to cloud-based fleet management systems.`,
        `Deep Learning is revolutionizing many industries and I am learning to leverage it’s incredible capabilities for enhancing daily life. My primary career interests are in automated robotics for manufacturing, food production and sustainable technologies.`,
        `Lastly, I am a conversational Spanish speaker, a beginner in several other languages, and I enjoy connecting with people from different cultures and backgrounds. It would be a rewarding experience to work alongside dedicated professionals who are also passionate about bringing useful AI technologies to life.`
      ]
    },
    initBlog: {
      viewingPost: 0,
      visibility: "VISIBLE",
      list: [{
        title: "Sample Post Title",
        summary: "Sample Post Summary",
        img: Assets.icon_brain,
        thumb: Assets.icon_brain,
        body: [
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`,
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`,
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`,
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`,
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`,
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`,
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`,
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`,
          `Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body... Sample body...`
        ],
        tags: ["#missing"]
      }]
    }
  },
  math: {
    initGraph: {
      rows: 0, cols: 0
    }
  },
  ad: {
    initAd: {
      adTheme: "FOOTER",
      adVisibility: "HIDDEN",
      adMsg: "Welcome to chivingtoninc.com",
      adImg: Assets.icon_adsenseSquare
    }
  }
};

for (let i = 0; i < 20; i++)
  Blueprint.chivingtoninc.initBlog.list.push(Blueprint.chivingtoninc.initBlog.list[0]);

/* ----------------------------------- Reducers ----------------------------------- *
 *   Functions that initialize & reduce state into store based on several choices.  *
 * -------------------------------------------------------------------------------- */
const Reducers = {
 // initializes/maintains ui state
 uiState: function(state = Blueprint.ui, action) {
   return Redux.combineReducers({
     // initializes/maintains app subscription state
     subscriptionState: function(state = Blueprint.ui.initSubscription, action) {
       const choices = {
         "SUBSCRIBED": () => true,
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains user state
     userState: function(state = Blueprint.ui.initUser, action) {
       const choices = {
         "LANDING": () => Object.assign({}, state, {returning: true}),
         "APP_MSG": () => Object.assign({}, state, {appMsg: true}),
         "LOGIN": () => Object.assign({}, state, {user: action.payload.user}),
         "LOGOUT": () => Object.assign({}, state, {user: "GUEST"}),
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains window state
     windowState: function(state = Blueprint.ui.initWindow, action) {
       const choices = {
         "RESIZE": () => action.payload,
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains header state
     headerState: function(state = Blueprint.ui.initHeader, action) {
       const choices = {
         "TOGGLE_HEADER": () => (state == "VISIBLE") ? "HIDDEN" : "VISIBLE",
         "SHOW_SUB_MENU": () => "VISIBLE",
         "CLOSE_SUB_MENU": () => "HIDDEN",
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains menu state
     menuState: function(state = Blueprint.ui.initMenu, action) {
       const choices = {
         "TOGGLE_MENU": () => (state == "OPEN") ? "CLOSING" : "OPEN",
         "OPEN_MENU": () => "OPEN",
         "CLOSE_MENU": () => (state == "OPEN") ? "CLOSING" : "CLOSED",
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains notification state
     notificationState: function(state = Blueprint.ui.initNotification, action) {
       const choices = {
         "SHOW_NOTIFICATION": () => Object.assign({visibility: "VISIBLE"}, action.payload),
         "HIDE_NOTIFICATION": () => Blueprint.ui.initNotification,
         "FLASH_NOTIFICATION": () => Object.assign({visibility: "FLASH"}, action.payload),
         "DEFAULT": () => state
       }
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains guide state
     guideState: function(state = Blueprint.ui.initGuide, action) {
       const choices = {
         "SHOW_GUIDE": () => Object.assign({visibility: "VISIBLE"}, action.payload),
         "HIDE_GUIDE": () => Blueprint.initGuide,
         "FLASH_GUIDE": () => Object.assign({visibility: "FLASH"}, action.payload),
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains view state
     viewState: function(state = Blueprint.ui.initView, action) {
       const choices = {
         "NAV_TO": () => Object.assign({}, state, {view: action.payload, prev: state.view}),
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains theme state
     themeState: function(state = Blueprint.ui.initTheme, action) {
       const choices = {
         "THEME_CHANGE": () => Object.assign({}, state),
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     }
   })(state, action);
 },
 // initializes/maintains chivingtoninc-specific state
 chivingtonincState: function(state = Blueprint.chivingtoninc, action) {
   return Redux.combineReducers({
     // initializes/maintains contact info state
     contactState: function(state = Blueprint.chivingtoninc.initContact, action) {
       return state;
     },
     // initializes/maintains cover state
     coverState: function(state = Blueprint.chivingtoninc.initCover, action) {
       return state;
     },
     // initializes/maintains resume state
     resumeState: function(state = Blueprint.chivingtoninc.initResume, action) {
       const { visible, sections } = Blueprint.chivingtoninc.initResume;
       const { skills, history, education, certifications, volunteer } = visible;
       const choices = {
         "TOGGLE_SKILLS_SECTION": () => Object.assign({}, visible, {skills: skills == "OPEN" ? "CLOSED" : "OPEN"}),
         "TOGGLE_HIST_SECTION": () => Object.assign({}, visible, {history: history == "OPEN" ? "CLOSED" : "OPEN"}),
         "TOGGLE_EDU_SECTION": () => Object.assign({}, visible, {education: education == "OPEN" ? "CLOSED" : "OPEN"}),
         "TOGGLE_CERTS_SECTION": () => Object.assign({}, visible, {certifications: certifications == "OPEN" ? "CLOSED" : "OPEN"}),
         "TOGGLE_VOLUNTEER_SECTION": () => Object.assign({}, visible, {volunteering: volunteering == "OPEN" ? "CLOSED" : "OPEN"}),
         "DEFAULT": () => state
       };
       return choices[action.type] ? Object.assign({}, sections, choices[action.type]()) : Object.assign({}, sections, choices["DEFAULT"]());
     },
     // initializes/maintains blog state
     blogState: function(state = Blueprint.chivingtoninc.initBlog, action) {
       const choices = {
         "DISPLAY_POST": () => Object.assign({}, state, {displayingPost: action.payload}),
         "SHOW_POST": () => Object.assign({}, state, {viewingPost: action.payload}),
         "HIDE_POST": () => Object.assign({}, state, {visibility: "HIDDEN"}),
         "ADD_POST": () => Object.assign({}, state, {list: [
           ...state.list.slice(0, action.payload.position), action.payload.post, ...state.list.slice(action.payload.position)
         ]}),
         "DELETE_POST": () => Object.assign({}, state, {list: [
           ...state.list.slice(0, action.payload.position), ...state.list.slice(action.payload.position+1)
         ]}),
         "DEFAULT": () => state.list[0] ? state : Blueprint.chivingtoninc.initBlog
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     }
   })(state, action);
 },
 // initializes/maintains math module state
 mathState: function(state = Blueprint.math, action) {
   return Redux.combineReducers({
     // initializes/maintains function graph state
     graphState: function(state = Blueprint.math.initGraph, action) {
       const choices = {
         "BASIC_GRAPH": () => Object.assign({}, state, {rows: 100, cols: 100}),
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     }
   })(state, action);
 },
 // initializes/maintains application state
 appState: function(state = [], action) {
   return Redux.combineReducers({
     // initializes/maintains action history state
     actionHistory: function(state = [], action) {
       return state.length == 5 ? [...state.slice(1), action.type] : [...state, action.type];
     },
     // initializes/maintains connectivity/network state
     connectionState: function(state = Blueprint.app.initConnection, action) {
       const choices = {
         "NETWORK_CHANGE": () => action.payload,
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains offline features to cache
     workerState: function(state = Blueprint.app.initWorkers, action) {
       const choices = {
         "WORKER_INSTALL": () => action.payload,
         "APP_CACHE": () => action.payload,
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     },
     // initializes/maintains battery state
     batteryState: function(state = Blueprint.app.initBattery, action) {
       const choices = {
         "BATTERY_CHANGE": () => action.payload,
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     }
   })(state, action);
 },
 // initializes/maintains ad state
 adState: function(state = Blueprint.ad, action) {
   return Redux.combineReducers({
     ad: function(state = Blueprint.ad.initAd, action) {
       const choices = {
         "SHOW_AD": () => Object.assign({}, state, {adVisibility: "VISIBLE"}, action.payload),
         "HIDE_AD": () => Object.assign({}, state, {adVisibility: "HIDDEN"}),
         "GLANCE_AD": () => Object.assign({}, state, action.payload),
         "DEFAULT": () => state
       };
       return choices[action.type] ? choices[action.type]() : choices["DEFAULT"]();
     }
   })(state, action);
 }
};

 /*  Combine reducers into one function & create store. Initializes state based pn
   default params or "DEFAULT" choices of reducer functions. */
 const InitialState = Redux.combineReducers(Reducers);
 const ReduxStore = Redux.createStore(InitialState, Redux.storeMiddlewares);


/* ----------------------------------- Components --------------------------------- *
 *    Components can be entire views, important/reused parts of views, or more      *
 *  abstract/hidden devices like the Shell or Router that contain multiple views or *
 *  more complex infrastructure.                                                    *
 * -------------------------------------------------------------------------------- */
const Components = {
  App: {
    // Net - interfaces with Network Information API
    Net: function(props, dispatch, children) {
      // Net Globals
      const state = props.store.getState();
      const { connectionState } = state.appState;
      const { effectiveType, downlink, prev } = connectionState;
      const offline = downlink == 0 ? true : false;
      const status = offline ? "OFFLINE" : effectiveType.toUpperCase();
      const changed = (effectiveType != prev);
      const DEV = state.uiState.windowState.mode.toLowerCase();
      const MB = DEV == "mobile", TB = DEV == "tablet", DT = DEV == "desktop";
      const E = React.createElement;

      // // Net Styles
      const styles = {
        net: `
          position: absolute; top: 5.5em; left: 0; width: 100%; margin: 0; padding: 0.5em; z-index: 10;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          background-color: ${offline?`#e44`:`#4e4`}; font-size: 0.75em; color: #222; font-weight: bold;
          ${changed ? `animation: flashNetwork 2500ms ease-in-out 1 forwards;` : `display: none;`}
        `
      };

      // Connection Listener
      // navigator.connection.onchange = function(event) {
      //   const newState = event.currentTarget;
      //   const offline = newState.downlink == 0 ? true : false;
      //   const newStatus = offline ? "offline" : newState.effectiveType.toUpperCase();
      //
      //   if (newState.effectiveType != status) {
      //     dispatch({type: "NETWORK_CHANGE", payload: {
      //       effectiveType: offline ? "OFFLINE" : newState.effectiveType, downlink: newState.downlink, prev: effectiveType
      //     }});
      //     window.setTimeout(function() {
      //       dispatch({type: "NETWORK_CHANGE", payload: {
      //         effectiveType: effectiveType, downlink: downlink, prev: effectiveType
      //       }});
      //     }, 3500);
      //   }
      // };

      // Display on initialization
      if (prev == "@@INIT") window.setTimeout(function() {
        dispatch({type: "NETWORK_CHANGE", payload: {
          effectiveType: effectiveType, downlink: downlink, prev: effectiveType
        }});
      }, 2000);

      const Net = E("div", {style: styles.net}, [status]);

      return Net;
    },
    // Ad - Google AdSense Interface
    Ad: function(props, dispatch, children) {
      // Ad Globals
      const state = props.store.getState();
      const { adTheme, adVisibility, adImg, adMsg } = state.adState.ad;
      const { icon_close } = Assets;
      const DEV = state.uiState.windowState.mode.toLowerCase();
      const MB = DEV == "mobile", TB = DEV == "tablet", DT = DEV == "desktop";
      const E = React.createElement;

      // Bypass
      if (adVisibility == "HIDDEN") return E("h3", {style: `display: none;`}, ["Hidden Ad"]);

      // Ad Styles
      const styles = {
        ad: `
          position: absolute; bottom: 0; left: 50%; width: 100%; margin: 0; padding: 0; z-index: 10;
          display: flex; flex-direction: row; justify-content: center; align-items: center;
          transform: translate(-50%, 0); background-color: #aaa; border-top: 1px solid #222; box-shadow: 0 0 1px -5px #000;
        `,
        adImgDiv: `flex-direction: column;`,
        adImg: `height: 2em; margin: 1em 1em 0.65em; border: 1px solid #666;`,
        adMsgDiv: `flex: 1; flex-direction: column;`,
        adMsg: `margin: 0;`,
        adDismissDiv: `flex-direction: column; justify-content: flex-start; align-items: right; margin: 0; padding: 0 0.65em 1.25em 0;`,
        adDismissIcon: `flex: 1; width: 1em; margin: 0; -webkit-box-shadow: 1px 1px 2px 1px rgba(10,10,10,0.5); border-radius: 100%;`
      };

      // Ad Image
      const img = E("div", {style: styles.adImgDiv}, [
        E("img", {style: styles.adImg, src: adImg, alt: "ad image"}, [])
      ]);

      // Ad Message
      const msg = E("div", {style: styles.adMsgDiv}, [
        E("p", {style: styles.adMsg}, [adMsg])
      ]);

      // Dismiss Ad
      const dismiss = E("div", {style: styles.adDismissDiv}, [
        E("img", {style: styles.adDismissIcon, src: icon_close, alt: "dismiss ad"}, [])
      ]);

      dismiss.addEventListener("click", function() {
        dispatch({type: "HIDE_AD"});
      });

      // Ad Element
      const Ad = E("div", {style: styles.ad}, [img, msg, dismiss]);

      return Ad;
    }
  },
  UI: {
    // Shell - contains the Header, Menu, Router, and Guide modules.
    Shell: function(props, dispatch, children) {
      // Shell Globals
      const state = props.store.getState();
      const fullProps = Object.assign({}, props, {display: true});
      const { width, height, mode } = state.uiState.windowState;
      const MOB = state.uiState.windowState.mode == "MOBILE";
      const E = React.createElement;

      // Shell Styles
      const styles = {
        shell: `
          display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; overflow: hidden;
          position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; margin: auto; background-color: #07e;
        `
      };

      // Resize Listener
      window.addEventListener("resize", function(event) {
        const newWidth = event.target.innerWidth;
        const newMode = newWidth < 950 ? "MOBILE" : (newWidth < 1200 ? "TABLET" : "DESKTOP");
        const sameMode = mode == newMode;
        if (!sameMode) dispatch({type: "RESIZE", payload: {
          width: newWidth, height: event.target.innerWidth, mode: newMode
        }});
      });

      // Shell Element
      const Shell = React.createElement("div", {style: styles.shell}, [
        Components.UI.Header(fullProps, dispatch, []),
        Components.UI.Menu(fullProps, dispatch, []),
        Components.UI.Router(fullProps, dispatch, []),
        Components.App.Net(fullProps, dispatch, []),
        Components.App.Ad(fullProps, dispatch, [])
      ]);

      return Shell;
    },
    // Header - contains Menu toggle button and title/home link.
    Header: function(props, dispatch, children) {
      // Header Globals
      const store = props.store;
      const state = store.getState();
      const { headerState, viewState, } = state.uiState;
      const { view, views } = viewState;
      const viewName = view.toLowerCase();
      const submenu = views[view];
      const { icon, visibility } = headerState;
      const MOB = state.uiState.windowState.mode == "MOBILE";
      const E = React.createElement;

      // Header Styles
      const styles = {
        header: `
          position: absolute; top: 0; left: 0; right: 0; z-index: 15;
          display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
          height: 4em; padding: 0.1em 0 0 1em; border-bottom: 1px solid #fff;
          background-image: linear-gradient(#333, #222); -webkit-box-shadow: 1px 1px 1px 1px rgba(0,0,0,0.3);
        `,
        icon: `height: 2.25em; width: 2.25em; cursor: pointer;`,
        title: `margin-left: 0.35em; color: #fff; font-size: 2.15em; cursor: pointer;`,
        superScript: `font-size: 0.3em; margin-left: 1px;`,
        subMenu: `flex-direction: row; justify-content: flex-start; align-items: center; margin: ${MOB?"0 0.5em":"0 2em"}; padding: 0.5em 0; border-bottom: 1px solid #aaa;`,
        smBtn: `font-size: 1em; cursor: pointer; color: #fff; margin: 0 0.5em;`
      };

      // Header Icon & Listeners
      const headerIcon = E("img", {style: styles.icon, src: icon, alt: "chivingtoninc Icon"}, []);
      headerIcon.addEventListener("click", function(event) {
        dispatch({type: "TOGGLE_MENU"})
      });

      // Superscript for current view
      const superScript = E("sup", {style: styles.superScript}, [viewName]);

      // Title Element Listeners
      const title = E("h1", {style: styles.title}, ["chivingtoninc", superScript]);
      title.addEventListener("click", function(event) {
        const newScroll = {x: window, y: window};
        dispatch({type: "CLOSE_MENU"});
        dispatch({type: "HIDE_NOTIFICATION"});
        dispatch({type: "NAV_TO", payload: "HOME"});
      });

      // SubMenu for each view
      const subMenu = E("div", {style: styles.subMenu}, submenu.map(btn => {
        const smBtn = E("h3", {style: styles.smBtn}, [btn[0]]);
        if (!!btn[1]) smBtn.addEventListener("click", function() {
          dispatch({type: btn[1], payload: btn[2]});
        });
        return smBtn;
      }));

      // Header Element
      const Header = E("div", {style: styles.header}, [headerIcon, title, subMenu]);

      return Header;
    },
    // Menu - layered/collapsible full-route menu.
    Menu: function(props, dispatch, children) {
      const styles = {
        menu: (m) => `
          position: absolute; top: 4em; left: 0; bottom: 0; width: ${m ? "100%" : "20em"}; padding: 0.25em 1em 0 0; z-index: 10;
          display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
          background-image: linear-gradient(to bottom right, rgba(25,110,214,1), rgba(6,90,204,1));
          border-right: 1px solid #000; -webkit-box-shadow: 1px 1px 1px 1px rgba(0,0,0,0.3);
        `,
        link: `
          padding: 1em; border-bottom: 0.5px solid #ddd; color: #fff; cursor: pointer;
        `
      };

      // Menu Globals
      const store = props.store;
      const state = store.getState();
      const menuState = state.uiState.menuState;
      const notificationState = state.uiState.notificationState;
      const MOB = state.uiState.windowState.mode == "MOBILE";
      const E = React.createElement;

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

      // Menu Styles & Animation
      const menuStyles = styles.menu(MOB) + ((menuState == "OPEN") ? `animation: menuOpen 150MS 1 forwards;`
        : (menuState == "CLOSING" ? `animation: menuClosing 150MS 1 forwards;` : `display: none;`));

      // Menu Element
      const Menu = React.createElement("div", {style: menuStyles}, [home, blog, projects, cover, resume]);

      return Menu;
    },
    // Router - maintains views/routes. (viewing, tabs, minimized...)
    Router: function(props, dispatch, children) {
      // Router Styles
      const styles = {
        router: `
          position: absolute; top: -4em; left: 0; bottom: 0; right: 0; overflow: hidden;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          background-image: linear-gradient(rgba(25,110,214,1), rgba(6,90,204,1));
        `
      };

      // Router Globals
      const store = props.store;
      const state = store.getState();
      const viewName = state.uiState.viewState.view;
      const prevName = state.uiState.viewState.prev;
      const MOB = state.uiState.windowState.mode == "MOBILE";
      const E = React.createElement;

      // Views
      const views = {
        "HOME": Views.Home,
        "BLOG": Views.Blog,
        "PROJECTS": Views.Projects,
        "COVER": Views.Cover,
        "RESUME": Views.Resume,
        "GUIDES": Views.Guide,
        "DEFAULT": Views.Home
      };

      // Current & Previous Views
      const view = views[viewName] ? views[viewName] : views["DEFAULT"];
      const prev = views[prevName] ? views[prevName] : views["DEFAULT"];

      // Router Element
      const Router = React.createElement("div", {style: styles.router}, [
        Components.UI.View(Object.assign(props, {viewName: viewName}), dispatch, [view]),
        Components.UI.View(Object.assign(props, {viewName: prevName}), dispatch, [prev])
      ]);

      return Router;
    },
    // DocHeader - responsive cover/resume header
    DocHeader: function(props, dispatch, children) {
      // DocHeader Styles
      const styles = {
        header: `
          padding: 1.25em 2em 1.25em 3em; display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        `,
        headerMobile: `
          padding: 0.5em 0 1em; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        `,
        common: (wp) => `
          background-image: linear-gradient(rgba(20,20,20,0.6), rgba(30,30,30,0.7)), url("${wp}");
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
            margin: 1em;
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
          label: `
            margin: 0 0.4em 0 0; font-size: 0.8em; color: #fff;
          `,
          link: `
            text-decoration: underline; cursor: pointer; font-size: 0.8em; color: #fff;
          `,
          sep: `
            color: #fff; margin: 0 0.2em;
          `
        }
      };

      // DocHeader Globals
      const store = props.store;
      const state = store.getState();
      const viewName = state.uiState.viewState.view.toLowerCase();
      const capitalized = viewName.charAt(0).toUpperCase() + viewName.slice(1);
      const { firstName, lastName, title, phone, email, linkedin, github, twitter, facebook } = state.chivingtonincState.contactState;
      const { icon_download, content_meAndWin, icon_phone, icon_email, icon_linkedin, icon_github, icon_twitter, icon_facebook, wp_math } = Assets;
      const doc = Assets[`${viewName}DocxPath`];
      const pdf = Assets[`${viewName}PdfPath`];
      const alt = `Download ${capitalized}`;
      const MOB = state.uiState.windowState.mode == "MOBILE";
      const E = React.createElement;

      // Responsive Styles
      const rowStyle = MOB ? styles.right.rowMobile : styles.right.row;
      const headerStyle = (MOB ? styles.headerMobile : styles.header) + styles.common(wp_math);
      // const

      // Download Link
      const download = E("div", {style: rowStyle}, [
        ["img", {style: styles.right.icon, src: icon_download, alt: alt}, []],
        ["p", {style: styles.right.label}, [alt+": "]],
        ["a", {style: styles.right.link + "color: #5bf; font-size: 0.75em;", href: doc, target: "_self", download:""}, [`(.docx)`]],
        ["p", {style: styles.right.sep}, [`|`]],
        ["a", {style: styles.right.link + "color: #5bf; font-size: 0.75em;", href: pdf, target: "_self", download:""}, [`(.pdf)`]]
      ].map(e => E(e[0], e[1], e[2])));

      // Download Link  Listeners
      download.addEventListener("click", function(event) {
        dispatch({type: "SHOW_NOTIFICATION", payload: {
          visibility: "VISIBLE", msg: alt, tile: icon_download, alt: "download icon"
        }});
      });

      // DocHeader Element
      const DocHeader = E("div", {style: headerStyle}, [
        E("div", {style: MOB ? styles.left.mobile : styles.left.window}, [
          E("img", {style: MOB ? styles.left.imgMobile : styles.left.img, src: content_meAndWin, alt: "Winston and I"}, []),
          E("h2", {style: styles.left.name}, [`${firstName} ${lastName}`]),
          E("p", {style: styles.left.title}, [title])
        ]),
        E("div", {style: styles.right.window}, [...[
          [icon_phone, "phone icon", `tel:${phone}`, phone],
          [icon_email, "email icon", `mailto:${email}`, email],
          [icon_linkedin, "linkedin icon", linkedin, linkedin.slice(8)],
          [icon_github, "gihub icon", github, github.slice(8)],
          [icon_twitter, "twitter icon", twitter, twitter.slice(8)]
        ].map(r => E("div", {style: rowStyle}, [
          E("img", {style: styles.right.icon, src: r[0], alt: r[1]}, []),
          E("a", {style: styles.right.link, href: r[2], target: "_blank"}, [r[3]])
        ])),
        download
      ])])

      return DocHeader;
    },
    // View - responsive view container w/ wallpaper & filter
    View: function(props, dispatch, children) {
      // View Globals
      const state = props.store.getState();
      const landing = !state.uiState.userState.returning;
      const appMsg = state.uiState.userState.appMsg;
      const loggedIn = state.uiState.userState.user != "GUEST";
      const notificationState = state.uiState.notificationState;
      const menuState = state.uiState.menuState;
      const actionHistory = state.appState.actionHistory;
      const lastAction = actionHistory[actionHistory.length - 1];
      const navAction = lastAction == "NAV_TO";
      const viewState = state.uiState.viewState;
      const currentView = viewState.view;
      const previousView = viewState.prev;
      const isCurrent = props.viewName == currentView;
      const isPrevious = props.viewName == previousView;
      const sameView = currentView == previousView;
      const MOB = state.uiState.windowState.mode == "MOBILE";
      const E = React.createElement;

      // View Styles
      const styles = {
        view: `position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; overflow-y: ${currentView=="BLOG"?`hidden`:`scroll`}; overflow-x: hidden; padding: 8.25em 0 0 0;`,
        appNotification: `display: flex; flex-direction: column; justify: center; align-items: center; text-align: center;`,
        notificationTxt: `margin: 0.1em auto;`,
        notificationBtn: `padding: 0.25em 0.75em; margin: 0.5em 0 0 0; border: 1px solid #fff; border-radius: 5px; background: rgba(25,110,214,1); color: #fff;`
      };

      // View Animation
      if (navAction && isCurrent && !sameView) styles.view += `animation: viewSlideIn 250ms 1 forwards;`;
      if (navAction && isPrevious && !sameView) styles.view += `animation: viewSlideOut 2000ms 1 forwards;`;
      if (!navAction && isPrevious && !sameView) styles.view += `display: none;`;

      // Menu Guide if landing
      if (landing) {
        // dispatch({type: "LANDING"});
        // dispatch({type: "SHOW_GUIDE", payload: {
        //   box: {boxx:"0.5em", boxy:"7em", boxh:"3em", boxw:"3em", boxr:"100%"},
        //   msg: {position: {msgx:"4.5em", msgy:"7em", msgh:"2.65em", msgw:""}, txt: "Tap the brain for more..."},
        //   btn: {position: {btnx:"9.25em", btny:"10.75em", btnh:"1.25em", btnw:"3.5em", btnr: "7px"}, txt: "Got it."},
        //   animation:  "animation: menuGuide 750ms 1 ease-in-out forwards;"
        // }});
      }

      // Recommend "Add to Homescreen"
      if (!landing && !appMsg) {
        dispatch({type: "APP_MSG"});

        dispatch({type: "FLASH_NOTIFICATION", payload: {
          tile: Assets.icon_brain, alt: "brain icon", action: {type:"NAV_TO", payload:"GUIDES"},
          msg: E("div", {style: styles.appNotification}, [
            E("p", {style: styles.notificationTxt}, ["Welcome!"]),
            E("p", {style: styles.notificationTxt}, ["For the best experience, choose \"Add to homescreen.\""]),
            E("button", {style: styles.notificationBtn}, ["Need help?"])
          ])
        }});
      }

      // View Wallpaper
      const wallpaper = state.uiState.themeState.viewBackground;
      styles.view += ` background-image: linear-gradient(rgba(20,20,20,0.3), rgba(30,30,30,0.3)), url("./${wallpaper}"); background-position: center; background-repeat: no-repeat; background-size: cover;`;

      // View
      const View = React.createElement("div", {style: styles.view}, [
        children[0](props, dispatch, children), Components.UI.Notification(props, dispatch, [])
      ]);

      // View Scroll Position
      // if (sameView) {
      //   console.log("scrollTop: ", View.scrollTop);
      //   View.scrollTop += 250;
      //   console.log("scrollTop: ", View.scrollTop);
      // }

      // View Listeners
      View.addEventListener("click", function(event) {
        if (notificationState.visibility == "VISIBLE" || notificationState.visibility == "FLASH") dispatch({type: "HIDE_NOTIFICATION"});
        if (menuState == "OPEN") dispatch({type: "CLOSE_MENU"});
      });

      return View;
    },
    // Notification - app-wide notification module
    Notification: function(props, dispatch, children) {
      // Notification Styles
      const styles = {
        desktop: `position: absolute; top: 10em; right: 1.75em; padding: 0.5em; z-index: 100;`,
        mobile: `position: absolute; width: 95%; top: 9em; left: 2.5%; z-index: 100;`,
        common: `
          display: flex; flex-direction: row; justify-content: center; align-items: center; overflow: hidden;
          background-image: linear-gradient(#333, #222); color: #fff; border: 1px solid #aaa; border-radius: 10px; cursor: pointer;
          -webkit-box-shadow: 1px 1px 1px 1px rgba(0,0,0,0.3);
        `,
        tile: `
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          height: 4em; width: 4em; border-right: 1px solid #aaa;
        `,
        img: `height: 2.5em; width: 2.5em;`,
        msg: `display: flex; flex-direction: column; justify-content: center; align-items: center; margin: auto 1em;`,
        txt: `font-size: 1em;`,
        dismiss: `margin: 0 auto 0.75em; font-size: 0.65em;`,
        hidden: `display: none;`
      };

      // Notification Animations
      const animations = {
        visible: (m) => `animation: notificationShow${m ? "Mobile" : "Desktop"} 0.5s 1 ease-in-out forwards;`,
        glance: (m) => `animation: notificationGlance${m ? "Mobile" : "Desktop"} 5s 1 ease-in-out forwards;`
      };

      // Notification Globals
      const store = props.store;
      const state = store.getState();
      const notificationState = state.uiState.notificationState;
      const { visibility, tile, alt, msg, action } = notificationState;
      const MOB = state.uiState.windowState.mode == "MOBILE";
      const E = React.createElement;

      // Choose Notification Styles & Animation
      const notificationStyle = styles.common + (visibility == "HIDDEN" ? styles.hidden : (MOB ? styles.mobile : styles.desktop));
      const notificationAnimation = visibility == "HIDDEN" ? "" : (visibility == "VISIBLE" ? animations.visible(MOB) : animations.glance(MOB));

      // Notification Element
      const Notification = E("div", {style: notificationStyle + notificationAnimation}, [
        E("div", {style: styles.tile}, [ E("img", {style: styles.img, src: tile, alt: alt}, []) ]),
        E("div", {style: styles.msg}, [ E("p", {style: styles.txt}, [msg]), E("p", {style: styles.dismiss}, ["(Click to dismiss.)"]) ])
      ]);

      // Notification Listeners
      Notification.addEventListener("click", function(event) {
        dispatch({type: "HIDE_NOTIFICATION", payload: { msg: "Welcome!", tile: Assets.icon_brain, alt: "brain icon" }});
        if (action) dispatch(action);
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
          border: 1px solid #aaa; border-radius: ${r}; -webkit-box-shadow: 0 0 0 1000em rgba(0,0,0,0.7);
        `,
        msg: (x,y,h,w,r) => `
          position: absolute; top: ${y}; left: ${x}; height: ${h||"auto"}; width: ${w||"auto"}; z-index: 1000;
          padding: 0.5em 1em; border: 1px solid #aaa; border-radius: 5px; background-image: linear-gradient(#333, #222); font-size: 0.9em;
        `,
        btn: (x,y,h,w,r) => `
          position: absolute; top: ${y}; left: ${x}; z-index: 1000; display: flex; flex-direction: row; justify-content: center; align-items: center;
          padding: 0.15em 0.75em; background-color: rgba(25,110,214,1); color: #fff; border: 1px solid #aaa; border-radius: 5px; cursor: pointer;
        `,
        hidden: `display: none;`
      };

      // Guide Globals
      const store = props.store;
      const state = store.getState();
      const visibility = state.uiState.guideState.visibility;
      const animation = state.uiState.guideState.animation;
      const { boxx,boxy,boxh,boxw,boxr } = state.uiState.guideState.box;
      const { msgx,msgy,msgh,msgw } = state.uiState.guideState.msg.position;
      const { btnx,btny,btnh,btnw } = state.uiState.guideState.btn.position;
      const msgTxt = state.uiState.guideState.msg.txt;
      const btnTxt = state.uiState.guideState.btn.txt;
      const MOB = state.uiState.windowState.mode == "MOBILE";
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
      const btn = E("button", {style: styles.btn(btnx,btny,btnh,btnw)}, [btnTxt]);

      // Guide
      const Guide = E("div", {style: displayType}, [box, msg, btn]);

      // Guide Listeners
      Guide.addEventListener("click", function(event) {
        dispatch({type: "HIDE_GUIDE"});
      });

      return Guide;
    }
  },
  Math: {
    Graph: function(props, dispatch, children) {
      // Graph Styles
      const styles = {
        visible: `
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          margin: 1em; padding: 1em;
          background-image: linear-gradient(#666, #777); border: solid #fff;
        `,
        collapsed: `height: 0; overflow: hidden;`,
        row:`
          display: flex; flex-direction: row; justify-content: center; align-items: center;
          border: 1px solid #f00; border-right: 0;
        `,
        cell: (c) => `
          height: 2px; width: 2px; border-right: 1px solid #000;
          background-color: ${c};
        `
      };

      // Graph Globals
      const store = props.store;
      const state = store.getState();
      const loggedIn = state.uiState.userState.user != "GUEST";
      const rows = state.mathState.graphstate;
      const MOB = state.uiState.windowState.mode == "MOBILE";
      const E = React.createElement;

      // Graph
      const Graph = E("div", {style: styles.visible}, ["graph"]);

      Graph.addEventListener("click", function(event) {
        dispatch({type: "BASIC_GRAPH"});
      });

      return Graph;
    }
  }
};


/* ------------------------------------- Views ------------------------------------ *
 *    Views are a type of Component that group several individual Components into   *
 *  one device-screen-sized object to render.                                       *
 * -------------------------------------------------------------------------------- */
const Views = {
  // Home View - contains contact card.
  Home: function(props, dispatch, children) {
    // Home View Globals
    const store = props.store;
    const state = store.getState();
    const landing = !state.uiState.userState.returning;
    const appMsg = state.uiState.userState.appMsg;
    const loggedIn = state.uiState.userState.user != "GUEST";
    const { content_meAndWinBed, content_greeting, icon_github, icon_linkedin, icon_twitter, icon_phone, icon_email, wp_pnw } = Assets;
    const { firstName, lastName, title, phone, email, linkedin, github, twitter, facebook, location, search } = state.chivingtonincState.contactState;
    const DEV = state.uiState.windowState.mode.toLowerCase();
    const MB = DEV == "mobile", TB = DEV == "tablet", DT = DEV == "desktop";
    const E = React.createElement;

    // Home View Styles
    const styles = {
      view: `display: flex; flex-direction: column; justify-content: center; align-items: stretch; min-height: 100%;`,
      card: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; z-index: 5; margin: ${MB ? `1em` : `0 3em`}; -webkit-box-shadow: 1px 1px 2px 0 rgba(10,10,10,0.4);`,
      cardBody: `padding: 0.5em; background-color: #fff; display: flex; flex-direction: ${MB?`column`:`row`}; justify-content: ${MB?`flex-start`:`space-between`}; align-items: ${MB?`stretch`:`flex-start`};`,
      bodyLeft: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; ${MB?``:`height: 25em;`}`,
      leftImg: `border: 1px solid #222; ${MB ? `width: 100%;` : `height: 100%;`}`,
      bodyRight: `display: flex; flex: 1; flex-direction: column; justify-content: flex-start; align-items: stretch; background-color: #ccc; margin: ${MB?`0`:`0 0 0 0.5em`};`,
      rightTop: `background-color: #ddd; padding: 0.5em; border-bottom: 1px solid #444; ${MB?` text-align: center;`:``}`,
      greetingImg: `height: 4em; margin: 0.5em 0;`,
      name: `margin: 0; font-size: 1.5em;`,
      title: `margin: 0; font-size: 0.9em; font-weight: 300;`,
      rightBottom: `display: flex; flex-direction: column; justify-content: space-between; align-items: stretch; padding: 1em; background-color: #aaa;`,
      row: `display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding: 0; margin: ${MB?`1em 0`:`0.5em 0`};`,
      label: `font-size: 1em; margin: 0;`,
      text: `font-size: 0.8em; margin: 0;`,
      footer: `display: flex; flex-direction: row; justify-content: space-around; align-items: center;background-color: #222; padding: 1.15em 0 0.85em;`,
      footerLink: `color: #fff`,
      footerIcon: `height: 1.25em; width: 1.25em;`
    };

    // Card
    const card = E("div", {style: styles.card}, [
      E("div", {style: styles.cardBody}, [
        E("div", {style: styles.bodyLeft}, [
          E("img", {style: styles.leftImg, src: content_meAndWinBed, alt: "my beautiful face"}, [])
        ]),
        E("div", {style: styles.bodyRight}, [
          E("div", {style: styles.rightTop}, [
            E("img", {style: styles.greetingImg, src: content_greeting, alt: "greeting image"}, []),
            E("h2", {style: styles.name}, [`${firstName} ${lastName}`]),
            E("h2", {style: styles.title}, [title])
          ]),
          E("div", {style: styles.rightBottom}, Object.keys({location, phone, email, search}).map(k => {
            return E("div", {style: styles.row}, [
              E("h3", {style: styles.label}, [k[0].toUpperCase()+k.slice(1)]),
              E("p", {style: styles.text}, [{location, phone, email, search}[k]])
            ])
          }))
        ])
      ]),
      E("div", {style: styles.footer}, [
        [icon_github, "gihub icon", github], [icon_linkedin, "linkedin icon", linkedin], [icon_twitter, "twitter icon", twitter],
        [icon_phone, "phone icon", `tel:${phone}`], [icon_email, "email icon", `mailto:${email}`]
      ].map(icon => E("a", {style: styles.footerLink, href: icon[2], alt: icon[2], target: "_blank"}, [
        E("img", {style: styles.footerIcon, src: icon[0], alt: icon[1]}, [])
      ])))
    ]);

    // Home View
    const HomeView = E("div", {style: styles.view}, [card]);

    return HomeView;
  },
  // Blog View - description.
  Blog: function(props, dispatch, children) {
    // Blog Globals
    const state = props.store.getState();
    const { blogState } = state.chivingtonincState;
    const { viewingPost, visibility, list } = blogState;
    const { img, thumb, title, summary, body } = list[viewingPost];
    const [ imgAlt, thumbAlt ] = [ `${title} - Image`, `${title} - Thumbnail` ];
    const DEV = state.uiState.windowState.mode.toLowerCase();
    const MB = DEV == "mobile", TB = DEV == "tablet", DT = DEV == "desktop";
    const E = React.createElement;

    // Blog Styles
    const styles = {
      blog: `
        display: flex; flex-direction: ${MB?`column`:`row`}; justify-content: center; align-items: center; ${MB?``:`height: 100%;`};
      `,
      post: `
        display: flex; flex-direction: column; justify-content: flex-start; height: 100%; width: ${MB?`100%`:`70%`};
        overflow-x: hidden; overflow-y: scroll; background-image: linear-gradient(to right, #eee, #fff);
      `,
      postImg: `
        background-color: #224; display: flex; max-height: 20em; padding: 1em; border-bottom: 1px solid #333;
      `,
      postCaption: `
        display: flex; flex-direction: ${MB?`column`:`row`}; justify-content: center; align-items: center; position: absolute;
        padding: 1em; margin: 2em 0; background-image: linear-gradient(to right, rgba(255,255,255,0.7), rgba(255,255,255,0.6)); border: 1px solid #333;
      `,
      postTitle: `
        display: flex; color: 555; margin: 0 ${MB?`0`:`1em`} 0 0; border-bottom: 1px solid #555;
      `,
      postSummary: `
        display: flex; margin: 0;
      `,
      postBody: `
        display: flex; flex-direction: column; align-items: center; padding: 0 1em; text-align: center;
        min-height: 100%; background-image: linear-gradient(to right, rgba(225,225,225,0.8), rgba(225,225,225,0.9));
      `,
      postBodyLine: `
        display: flex; padding: 1em; background-image: linear-gradient(to left, rgba(225,225,225,0.8), rgba(225,225,225,0.9)); -webkit-box-shadow: 1px 1px 2px 0 rgba(10,10,10,0.4);
      `,
      list: `
        display: flex; flex-direction: column; justify-content: flex-start; height: 100%; width: ${MB?`100%`:`30%`};
        overflow-x: hidden; overflow-y: scroll; background-image: linear-gradient(to right, rgba(225,225,225,0.8), rgba(225,225,225,0.9));
        border: 1px solid #f00;
      `,
      listRow: `
        display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
        border: 1px solid #00f;
        background-image: linear-gradient(to right, rgba(225,225,225,0.8), rgba(225,225,225,0.9))
      `,
      listThumb: `
        display: flex; max-height: 3em; border: 1px solid #0f0;
      `,
      listCaption: ` padding: 1em;
        display: flex; flex-direction: column; overflow: hidden; white-space: nowrap;
        -webkit-box-shadow: inset 1px 1px 2px 0 rgba(10,10,10,0.4); border: 1px solid #f00;
      `,
      listTitle: `
        margin: 0; border: 1px solid #faf;
      `,
      listSummary: `
        margin: 0; border: 1px solid #aaf;
      `
    };

    // Blog
    const Blog = E("div", {style: styles.blog}, [
      E("div", {style: styles.post}, [
        E("img", {style: styles.postImg, src: img, alt: imgAlt}, []),
        E("div", {style: styles.postCaption}, [
          E("h3", {style: styles.postTitle}, [title]),
          E("p", {style: styles.postSummary}, [summary]),
        ]),
        E("div", {style: styles.postBody}, body.map(line => E("p", {style: styles.postBodyLine}, [line])) )
      ]),
      E("div", {style: styles.list}, list.map(post => {
        return E("div", {style: styles.listRow}, [
          E("img", {style: styles.listThumb, src: post.img, alt: `${post.title} Thumbnail`}, []),
          E("div", {style: styles.listCaption} ,[
            E("h4", {style: styles.listTitle}, [post.title]),
            E("p", {style: styles.listSummary}, [post.summary])
          ])
        ])
      }) )
    ]);

    return Blog;
  },
  // Projects View - description.
  Projects: function(props, dispatch, children) {
    // ProjectsView Styles
    const styles = {
      view: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height: 100%;
      `
    };

    // ProjectsView Globals
    const store = props.store;
    const state = store.getState();
    const landing = !state.uiState.userState.returning;
    const appMsg = state.uiState.userState.appMsg;
    const loggedIn = state.uiState.userState.user != "GUEST";
    const MOB = state.uiState.windowState.mode == "MOBILE";
    const E = React.createElement;

    // ProjectsView Content
    const graph = Components.Math.Graph(props, dispatch, []);

    // ProjectsView
    const ProjectsView = E("div", {style: styles.view}, [graph]);

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
        padding: 1em 3em; background-image: linear-gradient(to right, #eee,#fff); color: #222;
      `,
      coverLine: `
        margin: 0 auto 2em; padding: 1em; text-align: center; background-image: linear-gradient(to left, rgba(225,225,225,0.8), rgba(225,225,225,0.9)); -webkit-box-shadow: 1px 1px 2px 0 rgba(10,10,10,0.4);
      `
    };

    // CoverView Globals
    const store = props.store;
    const state = store.getState();
    const { coverState } = state.chivingtonincState;

    // CoverView
    const CoverView = React.createElement("div", {style: styles.cover}, [
      Components.UI.DocHeader(props, dispatch, []),
      React.createElement("div", {style: styles.coverBody}, coverState.lines.map(l => React.createElement("p", {style: styles.coverLine}, [l])))
    ]);

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
        padding: 1em;  background-image: linear-gradient(to right, #eee, #fff); color: #000;
      `,
      section: {
        win: `background-image: linear-gradient(to left, rgba(225,225,225,0.8), rgba(225,225,225,0.9)); -webkit-box-shadow: 1px 1px 2px 0 rgba(10,10,10,0.4);`,
        title: `
          margin: 1em 0 0; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
          font-weight: 200;
          padding: 0.25em 1em; font-size: 1.15em; border-bottom: 1px solid #000; cursor: pointer; background-color: #336; color: #fff;

        `,
        hidden: `
          display: none;
        `
      },
      skills: {
        window: `
          display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        `,
        mobile: `
          display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
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

        `,
        mobile: `
          display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        `,
        position: `
          display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
          margin: 0.5em;
        `,
        infoRow: `
          display: flex; flex-direction: row; justify-content: center; align-items: center;
          margin: 0; padding: 0 0.5em; border-bottom: 1px solid #222;
        `,
        infoField: `
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          margin: 0; font-size: 0.95em; width: 33.3%
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
        `,
        mobile: `
          display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
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
        `,
        mobile: `
          display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
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
          margin: 0 0 0 0.5em; padding: 0; font-size: 0.95em; text-decoration: none; color: rgba(25,110,214,1);
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
      }
    };

    // ResumeView Globals
    const store = props.store;
    const state = store.getState();
    const resumeState = state.chivingtonincState.resumeState;
    const { visible, sections } = state.chivingtonincState.resumeState;
    const { skills, history, education, certifications, volunteering } = sections;
    const MOB = state.uiState.windowState.mode == "MOBILE";
    const E = React.createElement;

    // ResumeView Content
    // Skills Section
    const skillsButton = E("h2", {style: styles.section.title}, ["Skills"]);
    skillsButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_SKILLS_SECTION"}));

    const showSkills = visible.skills == "OPEN";
    const skillsWindow = E("div", {style: showSkills ? (MOB ? styles.skills.mobile : styles.skills.window) : styles.section.hidden},
      skills.map(c => E("div", {style: styles.skills.column}, c.map(s => E("p", {style: styles.skills.skill}, [s]))))
    );

    // History Section
    const historyButton = E("h2", {style: styles.section.title}, ["History"]);
    historyButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_HIST_SECTION"}));

    const showHist = visible.history == "OPEN";
    const historyWindow = E("div", {style: showHist ? (MOB ? styles.history.mobile : styles.history.window) : styles.section.hidden},
      history.map((position,i) => E("div", {style: styles.history.position}, [
        E("div", {style: styles.history.infoRow}, position.filter((field,idx) => idx !== 3).map((f,i) => E("h3", {style: styles.history.infoField}, [f]))),
        E("div", {style: styles.history.descriptionRow}, [E("p", {style: styles.history.description}, [position[3]])])
    ])));

    // Education Section
    const eduButton = E("h2", {style: styles.section.title}, ["Education"]);
    eduButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_EDU_SECTION"}));

    const showEdu = visible.education == "OPEN";
    const eduWindow = E("div", {style: showEdu ? (MOB ? styles.edu.mobile : styles.edu.window) : styles.section.hidden},
      education.map(row => E("div", {style: styles.edu.row}, row.map((field,idx) => (idx==0) ?
        E("h3", {style: styles.edu.degree}, [field]) : E("p", {style: styles.edu.field}, [field])
    ))));

    // Certifications Section
    const certsButton = E("h2", {style: styles.section.title}, ["Certifications"]);
    certsButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_CERTS_SECTION"}));

    const showCerts = visible.certifications == "OPEN";
    const certsWindow = E("div", {style: showCerts ? (MOB ? styles.certs.mobile : styles.certs.window) : styles.section.hidden},
      certifications.map(r => E("div", {style: MOB ? styles.certs.col : styles.certs.row}, r.map((f,i) => (i==0)
        ? E("h3", {style: styles.certs.title}, [f])
        : ((i==3) ? E("a", {style: styles.certs.link, href: f, target: "_blank"}, ["(Link)"]) : E("p", {style: styles.certs.field}, [f]))
    ))));

    // Volunteering Section
    const volunteerButton = E("h2", {style: styles.section.title}, ["Volunteering"]);
    volunteerButton.addEventListener("click", (e) => dispatch({type: "TOGGLE_VOLUNTEER_SECTION"}));

    const showVolunteer = visible.volunteering == "OPEN";
    const volunteerWindow = E("div", {style: showVolunteer ? (MOB ? styles.volunteer.mobile : styles.volunteer.window) : styles.section.hidden},
      volunteering.map(row => E("div", {style: styles.volunteer.row}, row.map((field,idx) => (idx==0)
        ? E("h3", {style: styles.volunteer.org}, [field]) : E("p", {style: styles.volunteer.description}, [field])
    ))));

    // Resume
    const resume = E("div", {style: styles.resume}, [Components.UI.DocHeader(props, dispatch, []),
      E("div", {style: styles.body}, [
        E("div", {style: styles.section.win}, [skillsButton, skillsWindow]),
        E("div", {style: styles.section.win}, [historyButton, historyWindow]),
        E("div", {style: styles.section.win}, [eduButton, eduWindow]),
        E("div", {style: styles.section.win}, [certsButton, certsWindow]),
        E("div", {style: styles.section.win}, [volunteerButton, volunteerWindow])
      ])
    ]);

    // ResumeView
    const ResumeView = E("div", {style: styles.view}, [resume]);

    return ResumeView;
  },
  // Guide View - description.
  Guide: function(props, dispatch, children) {
    // GuideView Styles
    const styles = {
      view: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: center; height: 100%;
      `,
      title: `
        margin: 0.75em auto 0.5em; color: #fff; text-decoration: underline; font-weight: 300;
      `,
      imgs: (w) => `
        width: ${w}; margin: 1em auto;
      `
    };

    // GuideView Globals
    const store = props.store;
    const state = store.getState();
    const landing = !state.uiState.userState.returning;
    const appMsg = state.uiState.userState.appMsg;
    const loggedIn = state.uiState.userState.user != "GUEST";
    const MOB = state.uiState.windowState.mode == "MOBILE";
    const E = React.createElement;

    // GuideView Content
    const title = E("h2", {style: styles.title}, ["Add to Homescreen Guide"]);
    const stepOneImg = E("img", {style: MOB ? styles.imgs("85%") : styles.imgs("60%"), src: Assets.content_step1, alt: "step1 img"}, []);
    const stepTwoImg = E("img", {style: MOB ? styles.imgs("85%") : styles.imgs("60%"), src: Assets.content_step2, alt: "step2 img"}, []);


    // GuideView
    const GuideView = E("div", {style: styles.view}, [title, stepOneImg, stepTwoImg]);

    return GuideView;
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
  elem: Components.UI.Shell,
  props: {store: ReduxStore},
  dispatch: ReduxStore.dispatch,
  children: []
}, document.getElementById("AppRoot"));

// Subscribe render method to ReduxStore
ReduxStore.subscribe({
  func: ReactDOM.render,
  params: [{
    elem: Components.UI.Shell,
    props: {store: ReduxStore},
    dispatch: ReduxStore.dispatch,
    children: []
  }, document.getElementById("AppRoot")]
});


/* --------------------------------- Cache Assets --------------------------------- *
 *    Cache assets, using service workers. No support planned for fringe devices.   *
 * -------------------------------------------------------------------------------- */
//
// if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js")
//   .then(reg => console.log("\n REG SUCCESS: ", reg), reg => console.log("\n REG FAIL: ", reg));
