/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: GitHub Web App                                                           *
 * Description: Single page web app, modeled after Redux/React.                      *
 * --------------------------------------------------------------------------------- */

/* ----------------------------------- Libraries ----------------------------------- *
 *           Barebones modules for initializing/maintaining app/UI state.            *
 * --------------------------------------------------------------------------------- */
// Creates elements
const React = {
  createElement: function(type, attrs, children) {
    // Create element
    const ReactElement = document.createElement(type);

    // Set attributes
    if (attrs) Object.keys(attrs).forEach(k => ReactElement.setAttribute(k, attrs[k]));

    // Append children
    if (children.length >= 1) children.forEach(child => ReactElement.appendChild((typeof child == 'string')
      ? document.createTextNode(child) : ((child.type) ? child.type(child.props, child.dispatch, child.children) : child)
    ));

    return ReactElement;
  }
};

// Renders/maintains vdom
const ReactDOM = {
  render: function(component, store, root) {
    while (root.lastChild) root.lastChild.remove();
    root.appendChild(component(store));
  }
};

// Maintains application state
const Redux = {
  createStore: function(rootReducer, middlewares = {}) {
    var state = {}, listeners = [];
    const { logActions, listenerBypass } = middlewares;

    function getState() {
      return state;
    }

    function dispatch(action) {
      if (logActions) logActions('before', state, action);
      state = rootReducer(state, action);
      if (logActions) logActions('after', state, action);

      if (listenerBypass && listenerBypass(action.type)[0])
        listeners.forEach(listener => listenerBypass(action.type).forEach(bypassName => {
          if (bypassName != listener.name) listener.function(...listener.params);
        }));
      else listeners.forEach(listener => listener.function(...listener.params));
    }

    function subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      }
    }

    dispatch({type: '@@INIT'});
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
    logActions: function(initAction = '') {
      return function(stage, state, action) {
        if  (action.type != initAction) {
          if (stage == 'before') {
            console.log('\n%cCurrent State: ', 'font-weight: bold; color: #0b0;', state);
            console.log(`Action Dispatched: %c'${action.type}'`, 'color: #e00;');
          }
          if (stage == 'after')
            console.log('%cUpdated State: ', 'font-weight: bold; color: #0b0;', state);
        }
      }
    },
    listenerBypass: function(bypassActions = {}) {
      return function(actionType) {
        return bypassActions[actionType] || [];
      }
    }
  }
};


/* -------------------------------- Asset Manifest --------------------------------- *
 *                      Defines everything needed to cache app.                      *
 * --------------------------------------------------------------------------------- */
const Assets = {
  resource: {
    index: '/index.html',
    app: '/app.js',
    sw: '/sw.js',
    webmanifest: '/site.webmanifest',
    resume_docx: '/includes/docs/j.Chivington.Resume.docx',
    resume_pdf: '/includes/docs/j.Chivington.Resume.pdf',
    avenir: '/includes/fonts/Avenir-Book.otf'
  },
  content: {
    greeting: '/imgs/content/hello.png',
    step1: '/imgs/content/step1.jpg',
    step2: '/imgs/content/step2.jpg',
    meAndLoaf: '/imgs/me/me-n-loaf.jpg',
    meAndWin: '/imgs/me/me-n-win.jpg',
    meAndWinBed: '/imgs/me/me-n-win-bed.jpg',
    me: '/imgs/me/me.jpg',
    qualys: '/imgs/content/qualys.png',
    htBridge: '/imgs/content/ht-bridge.svg',
    pageSpeed: '/imgs/content/google-pageSpeed.jpg'
  },
  wp: {
    yolo: '/imgs/wp/yolo.png',
    fragmented: '/imgs/wp/fragmented.jpg',
    math: '/imgs/wp/math.jpg',
    pnw: '/imgs/wp/pnw.jpg',
    sphere: '/imgs/wp/geoSphere.png'
  },
  icon: {
    favicon: '/favicon.ico',
    wifi: '/imgs/icons/network/wifi.svg',
    noWifi: '/imgs/icons/network/noWifi.svg',
    noWifi2: '/imgs/icons/network/noWifi2.svg',
    brain: '/imgs/icons/sm/brain.svg',
    download: '/imgs/icons/sm/dl.svg',
    email: '/imgs/icons/sm/email.svg',
    phone: '/imgs/icons/sm/phone.svg',
    facebook: '/imgs/icons/sm/fb.svg',
    github: '/imgs/icons/sm/git.svg',
    linkedin: '/imgs/icons/sm/li.svg',
    twitter: '/imgs/icons/sm/twt.svg',
    androidChrome192: '/imgs/icons/manifest/android-chrome-192x192.png',
    androidChrome512: '/imgs/icons/manifest/android-chrome-512x512.png',
    appleTouchIcon: '/imgs/icons/manifest/apple-touch-icon.png',
    browserconfig: '/imgs/icons/manifest/browserconfig.xml',
    favicon16: '/imgs/icons/manifest/favicon-16x16.png',
    favicon32: '/imgs/icons/manifest/favicon-32x32.png',
    mstile70: '/imgs/icons/manifest/mstile-70x70.png',
    mstile144: '/imgs/icons/manifest/mstile-144x144.png',
    mstile150: '/imgs/icons/manifest/mstile-150x150.png',
    mstile310: '/imgs/icons/manifest/mstile-310x310.png',
    safariPinnedTab: '/imgs/icons/manifest/safari-pinned-tab.png',
    close: '/imgs/icons/btns/close.svg',
    scroll: '/imgs/icons/btns/scroll.svg',
    adsenseSquare: '/imgs/ads/adsense-400x400.jpg',
    adsenseWide: '/imgs/ads/adsense-wide.png'
  },
  thumb: {
    knn: '/imgs/thumbs/knn.png',
    linear: '/imgs/thumbs/linear.jpg',
    logistic: '/imgs/thumbs/logistic.png',
    svm: '/imgs/thumbs/svm.png'
  },
  project: {
    knn: '/imgs/projects/knn.py',
    linear: '/imgs/projects/linear.py',
    logistic: '/imgs/projects/logistic.py',
    svm: '/imgs/projects/svm.py'
  }
};


/* ----------------------------------- Blueprint ----------------------------------- *
 *                           Specifies initial app state.                            *
 * --------------------------------------------------------------------------------- */
const Blueprint = {
  about: {
    author: 'Johnathan Chivington',
    version: '1.0.0',
    reports: [
      {org: 'Qualys SSL Labs', score: 'A+', img: Assets.content.qualys, link: 'https://www.ssllabs.com/ssltest/analyze.html?d=chivingtoninc.com'},
      {org: 'ImmuniWeb SSLScan', score: 'A+', img: Assets.content.htBridge, link: 'https://www.htbridge.com/ssl/?id=uAXLxfew'},
      {org: 'Google PageSpeed', score: '100%', img: Assets.content.pageSpeed, link: 'https://developers.google.com/speed/pagespeed/insights/?url=chivingtoninc.com'}
    ],
    security: [
      'https/http2', 'hsts', 'TLSv1.2', 'CAA Compliant', 'POODLE', 'CVE-2016-2017', 'Insecure Renegotiation', 'ROBOT', 'HEARTBLEED', 'CVE-2014-0224'
    ],
    features: [
      'React/Redux-Style Architecture', 'Responsive Design', 'Offline Capable', 'Network Detection', 'Customizable Themes', 'Plugins'
    ]
  },
  device: {
    network: {
      downlink: navigator.connection ? navigator.connection.downlink : 10,
      effectiveType: navigator.connection ? navigator.connection.effectiveType : 'Connecting...',
      previousType: '@@INIT'
    },
    workers: {
      available: null,
      installed: null
    }
  },
  ui: {
    window: {
      width: window.innerWidth,
      height: window.innerHeight,
      mode: window.innerWidth < 800 ? 'mobile' : (window.innerWidth < 1200 ? 'large_tab' : 'desktop')
    },
    header: {
      icon: Assets.icon.brain,
      alt: 'brain icon',
      title: 'chivingtoninc'
    },
    menu: {
      current: 'CLOSED',
      previous: 'CLOSED'
    },
    view: {
      current: 'HOME',
      previous: '@@INIT',
      scrollTop: 0
    },
    history: [],
    ads: [{
      type: 'message',
      placement: 'bottom',
      icon: Assets.icon.brain,
      alt: 'brain icon',
      txt: 'Welcome to chivingtoninc.com!',
      btn: Assets.icon.close,
      action: 'DISABLE_ADS'
    }],
    notifications: [{
      icon: Assets.icon.brain,
      alt: 'brain icon',
      txt: 'Welcome!',
      btn: Assets.icon.close,
      action: 'HIDE_NOTIFICATION'
    }],
    guides: [{
      name: ,
      steps: [{
        box: {
          x:0, y:0, h:0, w:0, r:0
        },
        msg: {
          x:0, y:0, h:0, w:0, r:0,
          txt: 'Tap the brain icon for more...',
          action: 'HIDE_GUIDE',
          btn: Assets.icon.close
        }
      }],
    }],
    themes: {
      dark: {
        primary: 'rgba(21,31,42,1)',
        primaryLight: 'rgba(27,40,56,1)',
        primaryDark: 'rgba(16,24,30,1)',
        primaryGradient: 'rgba(16,24,30,1), rgba(27,40,56,1)',
        secondary: 'rgba(69,161,242,1)',
        secondaryLight: 'rgba(120,212,255,1)',
        secondaryDark: 'rgba(18,110,191,1)',
        secondaryGradient: 'rgba(120,212,255,1), rgba(18,110,191,1)',
        shadow: 'rgba(100,100,100,0.5)',
        textPrimary: 'rgba(255,255,255,1)',
        textSecondary: 'rgba(103,117,130,1)'
      },
      light: {
        primary: 'rgba(255,255,255,1)',
        primaryLight: 'rgba(230,236,240,1)',
        primaryDark: 'rgba(255,255,255,1)',
        primaryGradient: 'rgba(230,236,240,1), rgba(255,255,255,1)',
        secondary: 'rgba(69,161,242,1)',
        secondaryLight: 'rgba(120,212,255,1)',
        secondaryDark: 'rgba(18,110,191,1)',
        secondaryGradient: 'rgba(120,212,255,1), rgba(18,110,191,1)',
        shadow: 'rgba(100,100,100,0.5)',
        textPrimary: 'rgba(0,0,0,1)',
        textSecondary: 'rgba(150,150,150,1)'
      }
    }
  },
  personal: {
    work: {
      contact: {
        firstName: 'Johnathan',
        lastName: 'Chivington',
        title: ['Full-Stack Engineer', '(...and aspiring Data Scientist.)'],
        phone: '303.900.2861',
        email: 'j.chivington@bellevuecollege.edu',
        linkedin: 'https://linkedin.com/in/johnathan-chivington',
        github: 'https://github.com/chivingtoninc',
        twitter: 'https://twitter.com/chivingtoninc',
        facebook: 'https://facebook.com/chivingtoninc',
        location: 'Seattle, WA',
        search: 'Open to offers'
      },
      resumes: [
        {name: 'Deep Learning', links: [Assets.resource.cover_WS_docx, Assets.resource.cover_WS_pdf]}
      ]
    },
    projects: {
      summary: `Welcome to my projects gallery. Select a project for more details.`,
      tiles: [
        ['K-Nearest Neighbors', Assets.thumb.knn, Assets.project.knn],
        ['Linear Regression', Assets.thumb.linear, Assets.project.linear],
        ['Logistic Regression', Assets.thumb.logistic, Assets.project.logistic],
        ['Support Vector Machine', Assets.thumb.svm, Assets.project.svm]
      ]
    }
  }
};


/* ----------------------------------- Reducers ----------------------------------- *
 *        Functions that initialize state & reduce it on each state change.         *
 * -------------------------------------------------------------------------------- */
const Reducers = {
  appState: function(state = Blueprint.app, action) {
    return Redux.combineReducers({
      network: function(state = Blueprint.app.network, action) {
        const choices = {
          'NET_STATE_CHANGE': () => action.payload,
          'NET_STATE_INIT': () => action.payload,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      battery: function(state = Blueprint.app.battery, action) {
        const choices = {
          'BATTERY_STATE_CHANGE': () => action.payload,
          'BATTERY_STATE_INIT': () => action.payload,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      workers: function(state = Blueprint.app.workers, action) {
        const choices = {
          'CHANGE_WORKER_AVAILABILITY': () => ({available: !state.available, installed: state.installed}),
          'INSTALL_WORKER': () => ({available: state.available, installed: true}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      about: function(state = Blueprint.app.about, action) {
        return state;
      },
      history: function(state = Blueprint.app.history, action) {
        return state.length == 5 ? [...state.slice(1), action.type] : [...state, action.type];
      }
    })(state, action);
  },
  userState: function(state = Blueprint.user, action) {
    return Redux.combineReducers({
      contact: function(state = Blueprint.work.contact, action) {
        const choices = {
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      username: function(state = Blueprint.user.username, action) {
        const choices = {
          'HOME': () => action.payload.username,
          'LOGOUT': () => Blueprint.user.username,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      key: function(state = Blueprint.user.keys, action) {
        const choices = {
          'HOME': () => action.payload.keys,
          'LOGOUT': () => null,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      returning: function(state = Blueprint.user.returning, action) {
        const choices = {
          'LANDING': () => true,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      notification: function(state = Blueprint.user.notifications, action) {
        const choices = {
          'HIDE_NOTIFICATION': () => [...state.slice(0, action.payload.idx), ...state.slice(action.payload.idx)],
          'SHOW_NOTIFICATION': () => [...state.slice(0, action.payload.idx), action.payload.notification, ...state.slice(action.payload.idx)],
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      guide: function(state = Blueprint.user.guides, action) {
        const choices = {
          'HIDE_GUIDE': () => [...state.slice(0, action.idx), ...state.slice(action.idx)],
          'SHOW_GUIDE': () => [...state.slice(0, action.idx), action.guide, ...state.slice(action.idx)],
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      }
    })(state, action);
  },
  uiState: function (state = Blueprint.ui, action) {
    return Redux.combineReducers({
      window: function(state = Blueprint.ui.window, action) {
        const choices = {
          'RESIZE': () => action.payload,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      header: function(state = Blueprint.ui.header, action) {
        const choices = {
          'CHANGE_HEADER_ICON': () => ({icon: action.payload.icon, title: state.title}),
          'CHANGE_HEADER_TITLE': () => ({icon: state.icon, title: action.payload.title}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      menu: function(state = Blueprint.ui.menu, action) {
        const choices = {
          'TOGGLE_MENU': () => ({current: state.current == 'OPEN' ? 'CLOSED' : 'OPEN', previous: state.current}),
          'OPEN_MENU': () => ({current: 'OPEN', previous: state.current}),
          'CLOSE_MENU': () => ({current: 'CLOSED', previous: state.current}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      view: function(state = Blueprint.ui.view, action) {
        const choices = {
          'NAV_TO': () => ({current: action.payload, previous: state.current, scrollTop: 0}),
          'UPDATE_SCROLL': () => ({current: state.current, previous: state.previous, scrollTop: action.payload}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      ad: function(state = Blueprint.ui.ads, action) {
        const choices = {
          'HIDE_AD': () => [...state.slice(0, action.idx), ...state.slice(action.idx)],
          'SHOW_AD': () => [...state.slice(0, action.idx), action.ad, ...state.slice(action.idx)],
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      theme: function(state = {name: 'DARK', palette: Blueprint.ui.themes.dark, wp: Assets.wp}, action) {
        const choices = {
          'CHANGE_THEME': () => (action.payload == 'DARK' ? Blueprint.ui.themes.dark : Blueprint.ui.themes.light),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      }
    })(state, action);
  },
  personalState: function (state = Blueprint.personal, action) {
    return Redux.combineReducers({
      projects: function(state = Blueprint.personal.projects, action) {
        const choices = {
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      work: function(state = Blueprint.personal.work, action) {
        const choices = {
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      }
    })(state, action);
  }
};


/* --------------------------------- Middlewares ---------------------------------- *
 *                      Functions that intercept state changes.                     *
 * -------------------------------------------------------------------------------- */
const Middlewares = {
  logActions: Redux.storeMiddlewares.logActions('@@INIT'),
  listenerBypass: Redux.storeMiddlewares.listenerBypass({
    'UPDATE_SCROLL': ['Render_App'],
    'NET_STATE_INIT': ['Render_App']
  })
};


/* ---------------------------------- Components ---------------------------------- *
 *                        Important/reused modules, UI, etc.                        *
 * -------------------------------------------------------------------------------- */
const Components = {
  Guide: function(store) {
    // z-index: 100;
  },
  Notification: function(store) {
    // z-index: 95;
  },
  Ads: function(store) {
    // z-index: 90;
  },
  Header: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { headerState, viewState, menuState } = state.uiState;
    const { icon, alt, title } = headerState;
    const { dark, light, lightOpaque, shadow } = Blueprint.ui.themes.standard;
    const E = React.createElement;

    const styles = {
      header: `
        position: fixed; top: 0; left: 0; height: 4em; width: 100%; margin: 0; padding: 0; z-index: 90;
        display: flex; flex-direction: row; justify-content: flext-start; align-items: center;
        background-color: ${dark}; border-bottom: 1px solid ${lightOpaque}; -webkit-box-shadow: 1px 1px 15px 0 ${shadow};
      `,
      icon: `margin: 0 1em; height: 2.25em; width: 2.25em; cursor: pointer; fill: ${light};`,
      title: `margin: 0; color: ${light}; font-size: 2em; cursor: pointer;`,
      superScript: `font-size: 0.9em; color: ${light}; margin: -10px 0 0 3px;`
    };

    const headerIcon = E('img', {style: styles.icon, src: icon, alt: alt}, []);
    headerIcon.addEventListener('click', function(event) { dispatch({type: 'TOGGLE_MENU'}); });

    const headerTitle = E('h1', {style: styles.title}, [title]);
    headerTitle.addEventListener('click', function(event) {
      if (menuState.current == 'OPEN') dispatch({type: 'CLOSE_MENU'});
      if (viewState.current != 'HOME') dispatch({type: 'NAV_TO', payload: 'HOME'});
    });

    return E('div', {style: styles.header}, [
      headerIcon, headerTitle, E('sup', {style: styles.superScript}, [viewState.current.toLowerCase()])
    ]);
  },
  Network: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { networkState, historyState } = state.appState;
    const { downlink, effectiveType, previousType } = networkState;
    const offline = downlink == 0 ? true : false;
    const status = offline ? 'Offline' : 'Connected';
    const changed = (effectiveType != previousType);
    const menuOpen = state.uiState.menuState.current == 'OPEN'
    const lastAction = historyState.slice(-1);;
    const display = lastAction == '@@INIT' || lastAction == 'NET_STATE_CHANGE' || (offline && !menuOpen);

    const styles = {
      net: `
        position: absolute; top: 5.45em; left: 0; width: 100%; margin: 0; padding: 0.5em; z-index: 85;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: ${offline?`#e44`:`#4e4`}; font-size: 0.75em; color: #222; font-weight: bold;
        ${display ? `animation: flashNetwork 1500ms ease-in-out 1 forwards;` : `display: none;`}
      `
    };

    if (previousType == '@@INIT') window.setTimeout(function() {
      dispatch({type: 'NET_STATE_INIT', payload: {
        downlink: downlink, effectiveType: effectiveType, previousType: effectiveType
      }});
    }, 1000);

    const Net = React.createElement('div', {style: styles.net}, [status]);

    window.addEventListener('online', function(event) {
      if (changed) dispatch({type: 'NET_STATE_CHANGE',  payload: {
        downlink: navigator.connection ? navigator.connection.downlink : 10,
        effectiveType: navigator.connection ? navigator.connection.effectiveType : 'Connecting...',
        previousType: effectiveType
      }});
    });

    window.addEventListener('offline', function(event) {
      if (changed) dispatch({type: 'NET_STATE_CHANGE',  payload: {
        downlink: navigator.connection ? navigator.connection.downlink : 10,
        effectiveType: 'OFFLINE',
        previousType: effectiveType
      }});
    });

    return Net;
  },
  Menu: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { appState, uiState } = state;
    const { aboutState, historyState } = appState;
    const { company, author, version } = aboutState;
    const lastActionClosed = !!(historyState.slice(-1) == 'CLOSE_MENU' || historyState.slice(-1) == 'TOGGLE_MENU');
    const { windowState, viewState, menuState } = uiState;
    const { width, height, mode } = windowState;
    const [ currentView, isPreviousView ] = [ viewState.current, viewState.previous ];
    const [ currentMenu, previousMenu ] = [ menuState.current, menuState.previous ];
    const { component, accent, accentOpaque, light, lightOpaque } = Blueprint.ui.themes.standard;
    const E = React.createElement;

    const styles = {
      menu: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; position: fixed;
        top: 4em; left: 0; bottom: 0; width: ${mode != 'desktop' ? `100%` : `25%`}; z-index: 80; overflow: hidden;
        background-color: ${component}; ${(currentMenu == 'OPEN') ? (previousMenu == 'OPEN' ? `` : `animation: menuOpen 300ms ease-in-out 1 forwards;`)
          : (lastActionClosed ? `animation: menuClosing 300ms ease-in-out 1 forwards;` : ` display: none;`)} border-right: 1px solid ${accentOpaque};
      `,
      menuBtn: `
        margin: 0 2em; padding: 1em 0.25em 0.5em; border-bottom: 0.05em solid ${accent};
        color: ${light}; font-size: 1.1em; font-weight: 100; cursor: pointer; text-align: left;
      `,
      appInfo: `
        display: flex; flex-direction: column; justify-content: center; align-items: center; align-self: flex-end;
        position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5em 0; width: 100%; border-top: 1px solid ${accentOpaque};
      `,
      appInfoRow: `margin: 0.1em auto; color: ${lightOpaque}`
    };

    const menuBtns = [
      [`Home`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'HOME', check: currentView != 'HOME' }]],
      [`Blog`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'BLOG', check: currentView != 'BLOG' }]],
      [`About`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'ABOUT', check: currentView != 'ABOUT' }]],
      [`Projects`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'PROJECTS', check: currentView != 'PROJECTS' }]],
      [`Resume`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'RESUME', check: currentView != 'RESUME' }]],
      [`Contact`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'CONTACT', check: currentView != 'CONTACT' }]]
    ].map(btn => {
      const b = E('h3', {style: styles.menuBtn}, [btn[0]]);
      b.addEventListener('click', () => btn[1].forEach(action => {
        if (action.check) dispatch({type: action.type, payload: action.payload});
      }));
      return b;
    });

    const info = E('div', {style: styles.appInfo}, [company,`v ${version}`,author].map(row => E('h3', {style: styles.appInfoRow}, [row])));

    return E ('div', {style: styles.menu}, [...menuBtns, info]);
  },
  Router: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { current, previous } = state.uiState.viewState;
    const [ sameView, lastActionNav ] = [ (current == previous), (state.appState.historyState.slice(-1) == 'NAV_TO') ];
    const animate = lastActionNav && !sameView;

    const styles = {
      router: `position: fixed; top: 4em; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: 5;`
    };

    const views = {
      'HOME': Views.Home,
      'BLOG': Views.Blog,
      'ABOUT': Views.About,
      'PROJECTS': Views.Projects,
      'RESUME': Views.Resume,
      'CONTACT': Views.Contact,
      'DEFAULT': Views.Home
    };

    const view = views[current] ? views[current] : views['DEFAULT'];
    const prev = views[previous] ? views[previous] : views['DEFAULT'];

    const currentAnimation = animate ? `animation: viewSlideIn 250ms 1 forwards;` : ``;
    const previousAnimation = animate ? `animation: viewSlideOut 500ms 1 forwards;` : ``;

    return React.createElement('div', {style: styles.router}, [
      Components.View(store, prev, previousAnimation), Components.View(store, view, currentAnimation)
    ]);
  },
  View: function(store, view, animation) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { windowState, viewState, menuState } = state.uiState;
    const { width, height, mode } = windowState;

    const styles = {
      view: `position: fixed; top: 4em; right: 0; bottom: 0; left: 0; margin: 0; padding: 0; overflow-x: hidden;
        overflow-y: scroll; z-index: 10; -webkit-overflow-scrolling: touch; background-color: ${Blueprint.ui.themes.standard.view}; ${animation}`
    };

    const View = React.createElement('div', {style: styles.view}, [view(store)]);
    setTimeout(event => View.scrollTo({top: viewState.scrollTop, left: 0, behavior: 'auto'}), 0);

    let scrollCtr = 0;
    View.addEventListener('scroll', function(event) {
      const [ currentST, eventST ] = [ viewState.scrollTop, event.target.scrollTop ];
      const diff = (eventST - currentST) < 0 ? -(eventST - currentST) : (eventST - currentST);
      if (scrollCtr++ % 2 == 0 && diff > 5) dispatch({type: 'UPDATE_SCROLL', payload: eventST});
    }, false);

    View.addEventListener('click', function(event) {
      if (menuState.current == 'OPEN') dispatch({type: 'CLOSE_MENU'});
    })

    let resizeCtr = 0;
    window.addEventListener('resize', function(event) {
      const [ nw, nh ] = [ window.innerWidth, window.innerHeight ];
      const nm = nw < 800 ? 'mobile' : (nw < 950 ? 'small_tab' : (nw < 1200 ? 'large_tab' : 'desktop'));
      if (resizeCtr++ % 10 == 0 && nm != mode) dispatch({type: 'RESIZE', payload: {width: nw, height: nh, mode: nm} });
    });

    return View;
  },
  Tabs: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { tabState } = state.uiState;
    const DEV = state.uiState.windowState.mode.toLowerCase();
    const [ MB, TB_SM, TB_LG, DT ] = [ DEV == 'mobile', DEV == 'small_tab', DEV == 'large_tab', DEV == 'desktop' ];
    const E = React.createElement;

    const styles = {
      tabComponent: `
        position: absolute; top: 0; left: 0; bottom: 4em; width: 100%;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
      `,
      tabWindow: `
        display: flex; flex-direction: column; flex: 1; justify-content: flex-start; align-items: stretch;
      `,
      tabBtns: `
        display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        border-top: 1px solid #000; background-color: #000;
      `,
      tabBtn: `
        display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;
        height: 3em; margin: 0 1px; background-color: #aaa; cursor: pointer;
      `
    };

    const Tab = E('div', {style: styles.tabComponent}, [
      E('div', {style: styles.tabWindow}, ['TAB VIEW']),
      E('div', {style: styles.tabBtns}, [
        E('div', {style: `${styles.tabBtn} margin: 0 1px 0 0`}, ['UI/UX']),
        E('div', {style: styles.tabBtn}, ['Deep Learning'])
      ])
    ]);

    return Tab;
  },
  Gallery: function(store, tiles, cols) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { dark, component, accent, accentOpaque, light, lightSubtle, lightOpaque, shadow } = Blueprint.ui.themes.standard;
    const E = React.createElement;

    const styles = {
      gallery: `
        position: absolute; top: 0; left: 0; width: 99.5%; height: 99.5%;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background-color: ${lightSubtle}; border: 2px solid ${shadow}; -webkit-box-shadow: 1px 1px 15px 0 ${shadow};
      `,
      row: `
        display: flex; flex-direction: row; justify-content: space-around; align-items: center;
        margin: 0 0.5em; padding: 0 0.5em; border-bottom: 1px solid ${shadow};
      `,
      tile: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        width: ${Math.floor(100/cols)}%; margin: 1em 0.5em; cursor: pointer; border: 1px solid #000;
        background-color: ${light}; -webkit-box-shadow: 1px 1px 15px 0 ${shadow};
      `,
      tileImg: `margin: 1em 1em 0.5em; width: 15em; height: 10em; border: 1px solid ${dark};`,
      tileTitle: `font-size: 1em;`
    };

    const Gallery = E('div', {style: styles.gallery}, []);

    for (let i in tiles) {
      if (i%cols == 0) Gallery.appendChild(E('div', {style: styles.row}, []));

      Gallery.lastChild.appendChild(E('div', {style: styles.tile}, [
        E('img', {style: styles.tileImg, src: tiles[i][1], alt: `${tiles[i][0]}-thumb`}, []),
        E('h2', {style: styles.tileTitle}, [tiles[i][0]])
      ]));
    }

    return Gallery;
  }
};


/* ------------------------------------- Views ------------------------------------ *
 *                         Groups Components to fit device.                         *
 * -------------------------------------------------------------------------------- */
const Views = {
  Home: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { palette, wp } = state.uiState.themeState;
    const { title } = state.userState.contactState;
    const E = React.createElement;

    const styles = {
      homeView: `
        position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7) ), url('${wp.yolo}');
        background-position: center; background-size: cover; background-repeat: no-repeat; text-align: center;
      `,
      title: `margin: 0; color: ${palette.textPrimary}; font-size: 3em; font-weight: 900;`,
      subtitle: `margin: 0; color: ${palette.textPrimary}; font-size: 1em;`,
      summary: `margin: 0.5em 0 0; color: ${palette.textPrimary}; font-size: 1.5em;`,
    };

    return E('div', {style: styles.homeView}, [
      E('h1', {style: styles.title}, [title[0]]),
      E('p', {style: styles.subtitle}, [title[1]]),
      E('p', {style: styles.summary}, [`Always ascending gradients when I should be descending...`])
    ]);
  },
  About: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { palette, wp } = state.uiState.themeState;
    const { title } = state.userState.contactState;
    const E = React.createElement;

    const styles = {
      aboutView: `
        position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow-y: scroll; overflow-x: hidden;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        background: linear-gradient(${palette.primaryDark}), url('${wp.sphere}');
        background-position: center; background-size: cover; background-repeat: no-repeat; text-align: center;
      `,
      about: `margin: 1em; border: 1px solid ${palette.text};`,
      title: `color: ${palette.text};`,
      summary: `color: ${palette.text};`
    };

    const about = E('div', {style: styles.about}, [
      E('h1', {style: styles.title}, [title[0]]),
      E('div', {style: styles.summary}, Blueprint.about.map(p => E('p', {style: styles.summary}, [p])))
    ]);

    return E('div', {style: styles.aboutView}, [about]);
  },
  Blog: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { component, accent, accentOpaque, light, lightOpaque } = Blueprint.ui.themes.standard;
    const E = React.createElement;

    const styles = {
      blogView: `
        position: absolute; top: 0; left: 0; bottom: 0; width: 100%;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: center;
      `,
      blogPost: 'margin: 1.5em 1em 0; width: 60%; border: 1px solid #333;',
      blogBody: `margin: 1em;`,
      blogTags: `margin: 0 1em; padding: 0.5em; border-top: 1px solid #333;`
    };

    // First Blog Post - Deploy & Secure a Server
    // 1. https/http2
    // 2. TLSv1.2
    // 3. A+ Qualsys SSL Labs Score (https://www.ssllabs.com/ssltest/analyze.html?d=chivingtoninc.com)
    // 4. A+ ImmuniWeb SSLScan Score (https://www.htbridge.com/ssl/?id=uAXLxfew)
    // 5. 100% on Google PageSpeed Insights (https://developers.google.com/speed/pagespeed/insights/?url=chivingtoninc.com)

    return React.createElement('div', {style: styles.blogView}, [
      E('div', {style: styles.blogPost}, [
        E('div', {style: styles.blogBody}, ['This is a blog post.']),
        E('div', {style: styles.blogTags}, ['#these #are #blog #tags'])
      ]),
      E('div', {style: styles.blogPost}, [
        E('div', {style: styles.blogBody}, ['This is another blog post.']),
        E('div', {style: styles.blogTags}, ['#these #are #more #blog #tags'])
      ])
    ]);
  },
  Projects: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { component, view, accent, accentOpaque, light, lightOpaque } = Blueprint.ui.themes.standard;
    const { summary, tiles } = Blueprint.projects;
    const E = React.createElement;

    const styles = {
      projectsView: `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: ${component};
      `,
      galleryRoot: `
        position: absolute; top: 2.5%; left: 2.5%; width: 95%; height: 95%;`
    };

    return E('div', {style: styles.projectsView}, [
      E('h1', {style: styles.summary}, [summary]),
      E('div', {style: styles.galleryRoot}, [ Components.Gallery(store, tiles, 4) ])
    ]);
  },
  Contact: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { returning, username } = state.userState;
    const { content.meAndLoaf, content.greeting, icon.github, icon.linkedin, icon.twitter, icon.phone, icon.email, wp.pnw } = Assets;
    const { firstName, lastName, title, phone, email, linkedin, github, twitter, facebook, location, search } = state.workState.contactState;
    const DEV = state.uiState.windowState.mode.toLowerCase();
    const [ MB, TB_SM, TB_LG, DT ] = [ DEV == 'mobile', DEV == 'small_tab', DEV == 'large_tab', DEV == 'desktop' ];
    const { component, accent, accentOpaque, light, lightOpaque } = Blueprint.ui.themes.standard;
    const E = React.createElement;

    const styles = {
      contactView: `display: flex; flex-direction: column; justify-content: center; align-items: stretch; min-height: 100%; ${MB?`padding: 0 0 6.5em;`:``} background-image: url("${wp.pnw}"); background-position: center; background-repeat: no-repeat;`,
      card: `position: absolute; margin: auto 2.5%; width: 95%; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; z-index: 5; border: 1px solid #000; -webkit-box-shadow: 1px 1px 7px 0 rgba(10,10,10,0.4);`,
      cardBody: `padding: 0; background-color: ${component}; display: flex; flex-direction: ${MB?`column`:`row`}; justify-content: ${MB?`flex-start`:`space-between`}; align-items: ${MB?`stretch`:`flex-start`};`,
      bodyLeft: `display: flex; flex-direction: column; justify-content: center; align-items: center;`,
      leftImg: `border: 1px solid #222; height: ${MB?`17em`:`22em`}; border-radius: 100%; margin: 1em;`,
      bodyRight: `display: flex; flex: 1; flex-direction: column; justify-content: flex-start; align-items: stretch; background-color: #ccc; margin: ${MB?`0`:`0 0 0 0.5em`};`,
      rightTop: `background-color: #ddd; padding: 0.5em; border-bottom: 1px solid #444; ${MB?` text-align: center;`:``}`,
      greetingImg: `height: 4em; margin: 0.5em 0;`,
      name: `margin: 0; font-size: 1.5em;`,
      title: `margin: 0; font-size: 0.9em; font-weight: 300;`,
      rightBottom: `display: flex; ${MB?``:`height: 13em;`} flex-direction: column; justify-content: space-between; align-items: stretch; padding: 1em; background-color: #aaa;`,
      row: `display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding: 0; margin: ${MB?`1em 0`:`0.5em 0`};`,
      label: `font-size: 1em; margin: 0;`,
      text: `font-size: 0.8em; margin: 0;`,
      footer: `display: flex; flex-direction: row; justify-content: space-around; align-items: center;background-color: #222; padding: 1.15em 0 0.85em;`,
      footerLink: `color: #fff`,
      footerIcon: `height: 1.25em; width: 1.25em;`
    };

    const card = E('div', {style: styles.card}, [
      E('div', {style: styles.cardBody}, [
        E('div', {style: styles.bodyLeft}, [
          E('img', {style: styles.leftImg, src: content.meAndLoaf, alt: 'my beautiful face'}, [])
        ]),
        E('div', {style: styles.bodyRight}, [
          E('div', {style: styles.rightTop}, [
            E('img', {style: styles.greetingImg, src: content.greeting, alt: 'greeting image'}, []),
            E('h2', {style: styles.name}, [`${firstName} ${lastName}`]),
            E('h2', {style: styles.title}, [title[0]])
          ]),
          E('div', {style: styles.rightBottom}, ['location', 'phone', 'email', 'search'].map(k => {
            return E('div', {style: styles.row}, [
              E('h3', {style: styles.label}, [k[0].toUpperCase()+k.slice(1)]),
              E('p', {style: styles.text}, [{location, phone, email, search}[k]])
            ])
          }))
        ])
      ]),
      E('div', {style: styles.footer}, [
        [icon.github, 'gihub icon', github], [icon.linkedin, 'linkedin icon', linkedin], [icon.twitter, 'twitter icon', twitter],
        [icon.phone, 'phone icon', `tel:${phone}`], [icon.email, 'email icon', `mailto:${email}`]
      ].map(icon => E('a', {style: styles.footerLink, href: icon[2], alt: icon[2], target: '_blank'}, [
        E('img', {style: styles.footerIcon, src: icon[0], alt: icon[1]}, [])
      ])))
    ]);

    return E('div', {style: styles.contactView}, [card]);
  },
  Resume: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const E = React.createElement;

    const styles = {
      resumeView: `
        position: absolute; top: 0; left: 0; height: 100%; width: 100%;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: center;
      `,
      resume: `
        position: absolute; top: 0; left: 0; height: 100%; width: 100%;
      `
    };

    return E('div', {style: styles.resumeView}, [
      E('embed', {style: styles.resume, width: '100%',
        src: `${Assets.resource.resume_pdf}`, type: 'application/pdf'}, [])
    ]);
  }
};


/* -------------------------------------- App ------------------------------------- *
 *                          Contains all root Components                            *
 * -------------------------------------------------------------------------------- */
const App = function(store) {
  const styles = {
    app: `position: fixed; top: 0; left: 0; height: 0%; width: 100%; margin: 0; padding: 0; z-index: 0;`
  };

  return React.createElement('div', {style: styles.app}, [
    Components.Header(store), Components.Menu(store), Components.Router(store), Components.Network(store)
  ]);
};


/* ---------------------------------- Rendering ----------------------------------- *
 *   Create ReduxStore & subscribe ReactDOM.render method to it, passing App. App   *
 * renders based on current ReduxStore state. State changes cause App to re-render. *
 * -------------------------------------------------------------------------------- *
 *   Note: Currently results in refresh of entire app. For most apps, this is fine. *
 * For very large apps like Googe Sheets, Word Online, etc., this can be a problem. *
 * Soon to add React-style state diffing engine so that only a particular 'branch'  *
 * of the app refreshes, based on changes in the corresponding branch of state.     *
 * -------------------------------------------------------------------------------- */

// Root node to render app into.
const AppRoot = document.getElementById('AppRoot');

//  Create root state reducer from Reducers.
const RootReducer = Redux.combineReducers(Reducers);

// Create ReduxStore, using RootReducer & Middlewares
const ReduxStore = Redux.createStore(RootReducer, Middlewares);

// Render app once initially
ReactDOM.render(App, ReduxStore, AppRoot);

// Subscribe render method to ReduxStore
ReduxStore.subscribe({
  name: 'Render_App',
  function: ReactDOM.render,
  params: [App, ReduxStore, AppRoot],
});
