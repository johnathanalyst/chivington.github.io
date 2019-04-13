/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: GitHub Web App                                                           *
 * Description: Single page GitHub app, modeled after Redux/React.                   *
 * --------------------------------------------------------------------------------- */

/* ------------------------------------- Libs -------------------------------------- *
 *           Barebones modules for initializing/maintaining app/UI state.            *
 * --------------------------------------------------------------------------------- */
// Creates elements and diffs/maintains vdom tree
const React = {
  createElement: function(elem, attrs, children) {
    const element = document.createElement(elem);

    if (attrs) Object.keys(attrs).forEach(k => element.setAttribute(k, attrs[k]));

    if (children.length >= 1) children.forEach(child => element.appendChild((typeof child == 'string')
      ? document.createTextNode(child) : ((child.elem) ? child.elem(child.props, child.dispatch, child.children) : child)
    ));

    return element;
  }
};

// Renders/updates dom based on vdom tree
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
  resource_index: '/index.html',
  resource_app: '/app.js',
  resource_sw: '/sw.js',
  resource_webmanifest: '/site.webmanifest',
  resource_cover_DL_docx: '/includes/docs/j.Chivington.DL.Cover.docx',
  resource_cover_DL_pdf: '/includes/docs/j.Chivington.DL.Cover.pdf',
  resource_cover_WS_docx: '/includes/docs/j.Chivington.WS.Cover.docx',
  resource_cover_WS_pdf: '/includes/docs/j.Chivington.WS.Cover.pdf',
  resource_resume_GEN_docx: '/includes/docs/j.Chivington.Resume.docx',
  resource_resume_GEN_pdf: '/includes/docs/j.Chivington.Resume.pdf',
  resource_avenir: '/includes/fonts/Avenir-Book.otf',
  content_greeting: '/imgs/content/hello.png',
  content_step1: '/imgs/content/step1.jpg',
  content_step2: '/imgs/content/step2.jpg',
  content_meAndWin: '/imgs/me/me-n-win.jpg',
  content_meAndWinBed: '/imgs/me/me-n-win-bed.jpg',
  content_me: '/imgs/me/me.jpg',
  content_qualys: '/imgs/content/qualys.png',
  content_htBridge: '/imgs/content/ht-bridge.svg',
  content_pageSpeed: '/imgs/content/google-pageSpeed.jpg',
  wp_fragmented: '/imgs/wp/fragmented.jpg',
  wp_math: '/imgs/wp/math.jpg',
  wp_pnw: '/imgs/wp/pnw.jpg',
  icon_favicon: '/favicon.ico',
  icon_wifi: '/imgs/icons/network/wifi.svg',
  icon_noWifi: '/imgs/icons/network/noWifi.svg',
  icon_noWifi2: '/imgs/icons/network/noWifi2.svg',
  icon_brain: '/imgs/icons/sm/brain.svg',
  icon_download: '/imgs/icons/sm/dl.svg',
  icon_email: '/imgs/icons/sm/email.svg',
  icon_phone: '/imgs/icons/sm/phone.svg',
  icon_facebook: '/imgs/icons/sm/fb.svg',
  icon_github: '/imgs/icons/sm/git.svg',
  icon_linkedin: '/imgs/icons/sm/li.svg',
  icon_twitter: '/imgs/icons/sm/twt.svg',
  icon_androidChrome192: '/imgs/icons/manifest/android-chrome-192x192.png',
  icon_androidChrome512: '/imgs/icons/manifest/android-chrome-512x512.png',
  icon_appleTouchIcon: '/imgs/icons/manifest/apple-touch-icon.png',
  icon_browserconfig: '/imgs/icons/manifest/browserconfig.xml',
  icon_favicon16: '/imgs/icons/manifest/favicon-16x16.png',
  icon_favicon32: '/imgs/icons/manifest/favicon-32x32.png',
  icon_mstile70: '/imgs/icons/manifest/mstile-70x70.png',
  icon_mstile144: '/imgs/icons/manifest/mstile-144x144.png',
  icon_mstile150: '/imgs/icons/manifest/mstile-150x150.png',
  icon_mstile310: '/imgs/icons/manifest/mstile-310x310.png',
  icon_safariPinnedTab: '/imgs/icons/manifest/safari-pinned-tab.png',
  icon_close: '/imgs/icons/btns/close.svg',
  icon_adsenseSquare: '/imgs/ads/adsense-400x400.jpg',
  icon_adsenseWide: '/imgs/ads/adsense-wide.png'
};


/* ----------------------------------- Blueprint ----------------------------------- *
 *                           Specifies initial app state.                            *
 * --------------------------------------------------------------------------------- */
const Blueprint = {
  app: {
    network: {
      downlink: navigator.connection ? navigator.connection.downlink : 10,
      effectiveType: navigator.connection ? navigator.connection.effectiveType : 'Connecting...',
      previousType: '@@INIT'
    },
    battery: {
      percentage: 100
    },
    workers: {
      available: true,
      installed: false
    },
    about: {
      company: 'chivingtoninc.com',
      author: 'Johnathan Chivington',
      version: '0.0.2',
      reports: [
        {org: 'Qualys SSL Labs', score: 'A+', img: Assets.content_qualys, link: 'https://www.ssllabs.com/ssltest/analyze.html?d=chivingtoninc.com'},
        {org: 'ImmuniWeb SSLScan', score: 'A+', img: Assets.content_htBridge, link: 'https://www.htbridge.com/ssl/?id=uAXLxfew'},
        {org: 'Google PageSpeed', score: '100%', img: Assets.content_pageSpeed, link: 'https://developers.google.com/speed/pagespeed/insights/?url=chivingtoninc.com'}
      ],
      security: [
        'https/http2', 'hsts', 'TLSv1.2', 'CAA Compliant', 'POODLE', 'CVE-2016-2017', 'Insecure Renegotiation', 'ROBOT', 'HEARTBLEED', 'CVE-2014-0224'
      ],
      features: [
        'React/Redux-Style Architecture', 'Responsive Design', 'Offline Capable', 'Network Detection', 'Customizable Themes', 'Plugins'
      ]
    },
    history: []
  },
  user: {
    name: {
      first: 'John', last: 'Doe'
    },
    username: 'Guest',
    keys: null,
    returning: false,
    notifications: [{
      icon: Assets.icon_brain,
      alt: 'brain icon',
      txt: 'Welcome!',
      btn: Assets.icon_close,
      action: 'HIDE_NOTIFICATION'
    }],
    guides: [{
      box: {
        x:0, y:0, h:0, w:0, r:0
      },
      msg: {
        x:0, y:0, h:0, w:0, r:0,
        txt: 'Tap the brain icon for more...',
        action: 'HIDE_GUIDE',
        btn: Assets.icon_close
      },
    }],
    theme: {
      color: 'light',
      landing: 'HOME'
    }
  },
  ui: {
    window: {
      width: window.innerWidth,
      height: window.innerHeight,
      mode: window.innerWidth < 800 ? 'mobile' : (
        window.innerWidth < 950 ? 'small_tab' : (window.innerWidth < 1200 ? 'large_tab' : 'desktop')
      )
    },
    header: {
      icon: Assets.icon_brain,
      alt: 'brain icon',
      title: 'chivingtoninc'
    },
    menu: {
      current: 'CLOSED',
      previous: 'CLOSED'
    },
    view: {
      current: 'COVER',
      previous: '@@INIT',
      scrollTop: 0
    },
    tabs: {

    },
    ads: [{
      type: 'message',
      placement: 'bottom',
      icon: Assets.icon_brain,
      alt: 'brain icon',
      txt: 'Welcome to chivingtoninc.com!',
      btn: Assets.icon_close,
      action: 'DISABLE_ADS'
    }]
  },
  work: {
    contact: {
      firstName: 'Johnathan',
      lastName: 'Chivington',
      title: 'Experienced Full-Stack Engineer',
      phone: '303.900.2861',
      email: 'j.chivington@bellevuecollege.edu',
      linkedin: 'https://linkedin.com/in/johnathan-chivington',
      github: 'https://github.com/chivingtoninc',
      twitter: 'https://twitter.com/chivingtoninc',
      facebook: 'https://facebook.com/chivingtoninc',
      location: 'Seattle, WA',
      search: 'Actively Seeking (local & remote)'
    },
    covers: [
      {name: 'Work Study', links: [Assets.resource_cover_WS_docx, Assets.resource_cover_WS_pdf]},
      {name: 'Deep Learning', links: [Assets.resource_cover_DL_docx, Assets.resource_cover_DL_pdf]}
    ],
    resumes: []
  }
};


/* ----------------------------------- Reducers ----------------------------------- *
 *        Functions that initialize state & reduce it on each state change.         *
 * -------------------------------------------------------------------------------- */
const Reducers = {
  appState: function(state = Blueprint.app, action) {
    return Redux.combineReducers({
      networkState: function(state = Blueprint.app.network, action) {
        const choices = {
          'NET_STATE_CHANGE': () => action.payload,
          'NET_STATE_INIT': () => action.payload,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      batteryState: function(state = Blueprint.app.battery, action) {
        const choices = {
          'BATTERY_STATE_CHANGE': () => action.payload,
          'BATTERY_STATE_INIT': () => action.payload,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      workerState: function(state = Blueprint.app.workers, action) {
        const choices = {
          'CHANGE_WORKER_AVAILABILITY': () => ({available: !state.available, installed: state.installed}),
          'INSTALL_WORKER': () => ({available: state.available, installed: true}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      aboutState: function(state = Blueprint.app.about, action) {
        return state;
      },
      historyState: function(state = Blueprint.app.history, action) {
        return state.length == 5 ? [...state.slice(1), action.type] : [...state, action.type];
      }
    })(state, action);
  },
  userState: function(state = Blueprint.user, action) {
    return Redux.combineReducers({
      nameState: function(state = Blueprint.user.name, action) {
        const choices = {
          'HOME': () => action.payload.name,
          'LOGOUT': () => Blueprint.user.name,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      usernameState: function(state = Blueprint.user.username, action) {
        const choices = {
          'HOME': () => action.payload.username,
          'LOGOUT': () => Blueprint.user.username,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      keyState: function(state = Blueprint.user.keys, action) {
        const choices = {
          'HOME': () => action.payload.keys,
          'LOGOUT': () => null,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      returningState: function(state = Blueprint.user.returning, action) {
        const choices = {
          'LANDING': () => true,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      notificationState: function(state = Blueprint.user.notifications, action) {
        const choices = {
          'HIDE_NOTIFICATION': () => [...state.slice(0, action.payload.idx), ...state.slice(action.payload.idx)],
          'SHOW_NOTIFICATION': () => [...state.slice(0, action.payload.idx), action.payload.notification, ...state.slice(action.payload.idx)],
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      guideState: function(state = Blueprint.user.guides, action) {
        const choices = {
          'HIDE_GUIDE': () => [...state.slice(0, action.idx), ...state.slice(action.idx)],
          'SHOW_GUIDE': () => [...state.slice(0, action.idx), action.guide, ...state.slice(action.idx)],
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      themeState: function(state = Blueprint.user.theme, action) {
        const choices = {
          'CHANGE_COLOR': () => ({color: action.payload.color, landing: state.landing}),
          'CHANGE_LANDING': () => ({color: action.payload.color, landing: state.landing}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      }
    })(state, action);
  },
  uiState: function (state = Blueprint.ui, action) {
    return Redux.combineReducers({
      windowState: function(state = Blueprint.ui.window, action) {
        const choices = {
          'RESIZE': () => action.payload,
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      headerState: function(state = Blueprint.ui.header, action) {
        const choices = {
          'CHANGE_HEADER_ICON': () => ({icon: action.payload.icon, title: state.title}),
          'CHANGE_HEADER_TITLE': () => ({icon: state.icon, title: action.payload.title}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      menuState: function(state = Blueprint.ui.menu, action) {
        const choices = {
          'TOGGLE_MENU': () => ({current: state.current == 'OPEN' ? 'CLOSED' : 'OPEN', previous: state.current}),
          'OPEN_MENU': () => ({current: 'OPEN', previous: state.current}),
          'CLOSE_MENU': () => ({current: 'CLOSED', previous: state.current}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      viewState: function(state = Blueprint.ui.view, action) {
        const choices = {
          'NAV_TO': () => ({current: action.payload, previous: state.current, scrollTop: 0}),
          'UPDATE_SCROLL': () => ({current: state.current, previous: state.previous, scrollTop: action.payload}),
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      },
      adState: function(state = Blueprint.ui.ads, action) {
        const choices = {
          'HIDE_AD': () => [...state.slice(0, action.idx), ...state.slice(action.idx)],
          'SHOW_AD': () => [...state.slice(0, action.idx), action.ad, ...state.slice(action.idx)],
          'DEFAULT': () => state
        };
        return choices[action.type] ? choices[action.type]() : choices['DEFAULT']();
      }
    })(state, action);
  },
  workState: function(state = Blueprint.work, action) {
    return Redux.combineReducers({
      coverState: function(state = Blueprint.work.covers, action) {
        return state;
      },
      contactState: function(state = Blueprint.work.contact, action) {
        return state;
      }
    })(state, action);
  }
};


/* --------------------------------- Middlewares ---------------------------------- *
 *                      Functions that intercept state changes.                     *
 * -------------------------------------------------------------------------------- */
const StoreMiddlewares = {
  logActions: Redux.storeMiddlewares.logActions('@@INIT'),
  listenerBypass: Redux.storeMiddlewares.listenerBypass({
    'UPDATE_SCROLL': ['Render_App'],
    'NET_STATE_INIT': ['Render_App']
  })
};


/* ----------------------------------- Components --------------------------------- *
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
    const E = React.createElement;

    const styles = {
      header: `
        position: fixed; top: 0; left: 0; height: 4em; width: 100%; margin: 0; padding: 0; z-index: 90;
        display: flex; flex-direction: row; justify-content: flext-start; align-items: center;
        background-color: rgba(10,10,10,0.9); border-bottom: 1px solid #aaa; -webkit-box-shadow: 1px 1px 15px 0 rgba(10,10,10,0.5);
      `,
      icon: `margin: 0 1em; height: 2.25em; width: 2.25em; cursor: pointer; fill: #fff;`,
      title: `margin: 0; color: #fff; font-size: 2em; cursor: pointer;`,
      superScript: `font-size: 0.9em; color: #fff; margin: -10px 0 0 3px;`
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
    const status = offline ? 'OFFLINE' : effectiveType.toUpperCase();
    const changed = (effectiveType != previousType);
    const menuOpen = state.uiState.menuState.current == 'OPEN'
    const lastAction = historyState.slice(-1);;
    const display = lastAction == '@@INIT' || lastAction == 'NET_STATE_CHANGE' || (offline && !menuOpen);

    const styles = {
      net: `
        position: absolute; top: 5.45em; left: 0; width: 100%; margin: 0; padding: 0.5em; z-index: 85;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: ${offline?`#e44`:`#4e4`}; font-size: 0.75em; color: #222; font-weight: bold;
        ${display ? `animation: flashNetwork 1000ms ease-in-out 1 forwards;` : `display: none;`}
      `
    };

    if (previousType == '@@INIT') window.setTimeout(function() {
      dispatch({type: 'NET_STATE_INIT', payload: {
        downlink: downlink, effectiveType: effectiveType, previousType: effectiveType
      }});
    }, 1000);

    const Net = React.createElement('div', {style: styles.net}, [`Connection  - ${status}`]);

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
    const E = React.createElement;

    const styles = {
      menu: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; position: fixed;
        top: 4em; left: 0; bottom: 0; width: ${mode != 'desktop' ? `100%` : `25%`}; z-index: 80; overflow: hidden;
        background-color: #000; ${(currentMenu == 'OPEN') ? (previousMenu == 'OPEN' ? `` : `animation: menuOpen 300ms ease-in-out 1 forwards;`)
          : (lastActionClosed ? `animation: menuClosing 300ms ease-in-out 1 forwards;` : ` display: none;`)}
      `,
      menuBtn: `
        margin: 0 2em; padding: 1em 0.25em 0.5em; border-bottom: 0.05em solid rgba(255,255,255,0.3);
        color: #fff; font-size: 1.1em; font-weight: 100; cursor: pointer;
      `,
      appInfo: `
        display: flex; flex-direction: column; justify-content: center; align-items: center; align-self: flex-end;
        position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5em 0; width: 100%; border-top: 1px solid #252525;
      `,
      appInfoRow: `margin: 0.25em auto; color: #454545;`
    };

    const menuBtns = [
      [`Home`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'HOME', check: currentView != 'HOME' }]],
      [`Blog`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'BLOG', check: currentView != 'BLOG' }]],
      [`Cover`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'COVER', check: currentView != 'COVER' }]],
      [`Resume`, [{type: 'CLOSE_MENU', check: true}, {type: 'NAV_TO', payload: 'RESUME', check: currentView != 'RESUME' }]]
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
      router: `position: fixed; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: 5;`
    };

    const views = {
      'HOME': Views.Home,
      'BLOG': Views.Blog,
      'COVER': Views.Cover,
      'RESUME': Views.Resume,
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
  View: function(store, viewComponent, animation) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { windowState, viewState } = state.uiState;
    const { width, height, mode } = windowState;

    const styles = {
      view: `position: fixed; top: 0; left: 0; height: 100%; width: 100%; margin: 0; padding: 4em 0 0 0; overflow-x: hidden;
        overflow-y: scroll; z-index: 10; -webkit-overflow-scrolling: touch; background-color: #353535; ${animation}`
    };

    const View = React.createElement('div', {style: styles.view}, [viewComponent(store)]);
    setTimeout(event => View.scrollTo({top: viewState.scrollTop, left: 0, behavior: 'auto'}), 0);

    let scrollCtr = 0;
    View.addEventListener('scroll', function(event) {
      const [ currentST, eventST ] = [ viewState.scrollTop, event.target.scrollTop ];
      const diff = (eventST - currentST) < 0 ? -(eventST - currentST) : (eventST - currentST);
      if (scrollCtr++ % 2 == 0 && diff > 5) dispatch({type: 'UPDATE_SCROLL', payload: eventST});
    }, false);

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
        min-height: 100%;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        border: 1px solid #f33; background-color: #daa;
      `,
      tabWindow: `
        display: flex; flex-direction: column; flex: 1; justify-content: flex-start; align-items: stretch;
        border: 1px solid #3f3; background-color: #ada;
      `,
      tabBtns: `
        display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        border: 1px solid #33f; background-color: #aad;
      `,
      tabBtn: `
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        border: 1px solid #000; background-color: #999;
      `
    };

    const Tab = E('div', {style: styles.tabComponent}, [
      E('div', {style: styles.tabWindow}, ['TAB VIEW']),
      E('div', {style: styles.tabBtns}, [
        E('div', {style: styles.tabBtn}, ['UI/UX']),
        E('div', {style: styles.tabBtn}, ['Deep Learning']),
        E('div', {style: styles.tabBtn}, ['Computer Architecture'])
      ])
    ]);

    return Tab;
  }
};


/* ------------------------------------- Views ------------------------------------ *
 *                         Groups Components to fit device.                         *
 * -------------------------------------------------------------------------------- */
const Views = {
  Home: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { returning, username } = state.userState;
    const { content_me, content_greeting, icon_github, icon_linkedin, icon_twitter, icon_phone, icon_email } = Assets;
    const { firstName, lastName, title, phone, email, linkedin, github, twitter, facebook, location, search } = state.workState.contactState;
    const DEV = state.uiState.windowState.mode.toLowerCase();
    const [ MB, TB_SM, TB_LG, DT ] = [ DEV == 'mobile', DEV == 'small_tab', DEV == 'large_tab', DEV == 'desktop' ];
    const E = React.createElement;

    const styles = {
      homeView: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 100%; background-color: #069; ${MB?`padding: 0 0 6.5em;`:``}`,
      card: `position: absolute; margin: 0.75em 2.5%; width: 95%; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; z-index: 5; border: 1px solid #000; -webkit-box-shadow: 1px 1px 7px 0 rgba(10,10,10,0.4);`,
      cardBody: `padding: 0; background-color: #353535; display: flex; flex-direction: ${MB?`column`:`row`}; justify-content: ${MB?`flex-start`:`space-between`}; align-items: ${MB?`stretch`:`flex-start`};`,
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
          E('img', {style: styles.leftImg, src: content_me, alt: 'my beautiful face'}, [])
        ]),
        E('div', {style: styles.bodyRight}, [
          E('div', {style: styles.rightTop}, [
            E('img', {style: styles.greetingImg, src: content_greeting, alt: 'greeting image'}, []),
            E('h2', {style: styles.name}, [`${firstName} ${lastName}`]),
            E('h2', {style: styles.title}, [title])
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
        [icon_github, 'gihub icon', github], [icon_linkedin, 'linkedin icon', linkedin], [icon_twitter, 'twitter icon', twitter],
        [icon_phone, 'phone icon', `tel:${phone}`], [icon_email, 'email icon', `mailto:${email}`]
      ].map(icon => E('a', {style: styles.footerLink, href: icon[2], alt: icon[2], target: '_blank'}, [
        E('img', {style: styles.footerIcon, src: icon[0], alt: icon[1]}, [])
      ])))
    ]);

    // Solutions
    // 1. Web/Domain Hosting
    // 2. Website/App Design & Development
    // 3. e-Commerce Solutions
    // 4. Custom Email
    // 5. Cloud Storage Solutions
    // 6. CRM Solutions
    // 6. Portfolios, Galleries, Resumes, Menus

    // About This App
    // 1. https/http2
    // 2. TLSv1.2
    // 3. A+ Qualsys SSL Labs Score (https://www.ssllabs.com/ssltest/analyze.html?d=chivingtoninc.com)
    // 4. A+ ImmuniWeb SSLScan Score (https://www.htbridge.com/ssl/?id=uAXLxfew)
    // 5. 100% on Google PageSpeed Insights (https://developers.google.com/speed/pagespeed/insights/?url=chivingtoninc.com)

    // Widgets
    // 1. Todo
    // 2. Stock ticker
    // 3. Img slider

    return E('div', {style: styles.homeView}, [card]);
  },
  Blog: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const E = React.createElement;

    const styles = {
      blogView: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: center;
        width: 100%; margin: 0 auto; padding: 1em 0; background-color: #960;
      `
    };

    return React.createElement('div', {style: styles.blogView}, [
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['BLOG'])
    ]);
  },
  Cover: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { coverState } = state.workState;
    const DEV = state.uiState.windowState.mode.toLowerCase();
    const [ MB, TB_SM, TB_LG, DT ] = [ DEV == 'mobile', DEV == 'small_tab', DEV == 'large_tab', DEV == 'desktop' ];

    const styles = {
      coverView: `
        background-color: #aaf;
      `
    };

    return React.createElement('div', {style: styles.coverView}, [Components.Tabs(store)]);
  },
  Resume: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const E = React.createElement;

    const styles = {
      resumeView: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: center;
        width: 100%; margin: 0 auto; padding: 1em 0; background-color: #609;
      `
    };

    return React.createElement('div', {style: styles.resumeView}, [
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME']),
      E('h1', {style: 'margin: 1em; border: 1px solid #000;'}, ['RESUME'])
    ]);
  }
};


/* -------------------------------------- App ------------------------------------- *
 *                          Contains all root Components                            *
 * -------------------------------------------------------------------------------- */
const App = function(store) {
  const [ state, dispatch ] = [ store.getState(), store.dispatch ];

  const styles = {
    app: `position: fixed; top: 0; left: 0; height: 0%; width: 100%; margin: 0; padding: 0; z-index: 0;`
  };

  return React.createElement('div', {style: styles.app}, [
    Components.Header(store), Components.Menu(store), Components.Router(store),
    Components.Network(store)// , Components.Ads(store)
  ]);
}


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

// Create ReduxStore, using RootReducer & StoreMiddlewares
const ReduxStore = Redux.createStore(RootReducer, StoreMiddlewares);

// Render app once initially
ReactDOM.render(App, ReduxStore, AppRoot);

// Subscribe render method to ReduxStore
ReduxStore.subscribe({
  name: 'Render_App',
  function: ReactDOM.render,
  params: [App, ReduxStore, AppRoot],
});
