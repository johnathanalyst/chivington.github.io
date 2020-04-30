// -------------------------------------------------------------------------------------
// Author: Johnathan Chivington
// Project: Personal blog, resume and research portfolio.
// Description: Personal web application built in my custom UI/UX framework, Unity.
// Version: 2.0.0 - (production - see README.md)
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
//  Unity - A minimal framework used to build complex "native-like" web applications.
// -------------------------------------------------------------------------------------
const Unity = {
  createReducer: function(defaultState,map) {
    return function(state = defaultState, action) {
      return map[action.type] ? map[action.type](state, action) : state;
    }
  },
  combineReducers: function(reducers) {
    return function(state, action) {
      return Object.keys(reducers).reduce((combined, k) => {
        combined[k] = reducers[k](state[k], action);
        return combined;
      }, {});
    }
  },
  createStore: function(rootReducer,middlewares={},history_length) {
    var state = {}, listeners = [], history = [];
    const { logActions, listenerBypass } = middlewares;

    function getState() { return state; }
    function getHistory() { return history; }

    function dispatch(action) {
      if (logActions) logActions('before', state, action);
      if (!!history_length) history = (history.length == history_length) ? [...history.slice(1), state] : [...history, state];
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

    dispatch({type:'@@INIT'});
    return { getState, getHistory, dispatch, subscribe };
  },
  storeMiddlewares: {
    logActions: function(initAction = '') {
      return function(stage, state, action) {
        if  (action.type != initAction) {
          if (stage == 'before') {
            console.log('\n%cPrevious State: ', 'font-weight: bold; color: #0b0;', state);
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
  },
  createElement: function(elem,attrs,children) {
    const element = document.createElement(elem);
    if (attrs) Object.keys(attrs).forEach(k => element.setAttribute(k, attrs[k]));
    if (children.length >= 1) children.forEach(child => element.appendChild((typeof child == 'string')
      ? document.createTextNode(child) : ((child.elem) ? child.elem(child.props, child.dispatch, child.children) : child)
    ));
    return element;
  },
  render: function(component,store,root) {
    while (root.lastChild) root.lastChild.remove();
    root.appendChild(component(store));
  },
  initializeApplication: function(app_root,load_screen_root,blueprint,reducers,middlewares) {
    const app_title = blueprint.user.name ? blueprint.user.name : 'Unity Application';
    document.title = `${app_title} | Home`;

    if (!app_root) Unity.terminate(app_root,`No Application Root supplied...`);
    if (!blueprint) Unity.terminate(app_root,`No Blueprint supplied...`);
    if (!!load_screen_root) {console.log(`${app_title} | Killing load screen...`);load_screen_root.style.display='none';};

    console.log(`${app_title} | Killing static application...`);
    app_root.firstElementChild.style.display = 'none';

    const init_state = Unity.combineReducers(reducers);
    const UnityStore = Unity.createStore(init_state, middlewares);

    Unity.render(Modules.App, UnityStore, App_Root);
    UnityStore.subscribe({
     name: 'Render_App',
     function: Unity.render,
     params: [Modules.App, UnityStore, App_Root]
    });
  },
  terminate: function(app_root,msg) {
    while (app_root.lastChild) app_root.lastChild.remove();
    app_root.appendChild(Unity.createElement('div',{position:`absolute`,left:0,top:0,bottom:0,right:0,index:1000,background:`linear-gradient(#fff,#eee)`},[msg]));
    throw `[Unity] - ${msg}`;
  }
};

// -------------------------------------------------------------------------------------
//  Reducers - Functions that initialize state & reduce it on each state change.
// -------------------------------------------------------------------------------------
const Reducers = {
  appState: function(state=Blueprint.app, action) {
    return Unity.combineReducers({
      aboutState: Unity.createReducer(Blueprint.app.about, {}),
      historyState: Unity.createReducer(Blueprint.app.history, {
        'NAV_TO': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type],
          views: s.views.length == 5 ? [...s.views.slice(1), a.payload] : [...s.views, a.payload]
        }),
        'NET_STATE_CHANGE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'NET_STATE_INIT': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'BATTERY_STATE_CHANGE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'BATTERY_STATE_INIT': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'CHANGE_HEADER_ICON': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'CHANGE_HEADER_TITLE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'OPEN_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'CLOSE_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'CHANGE_THEME': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'OPEN_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_ALL_RESEARCH_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_ARTIFICIAL_INTELLIGENCE_RESEARCCH_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_WIRELESS_EMBEDDED_RESEARCH_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_COMPUTER_ARCHITECTURE_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_HOME_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_ALL_RESEARCH_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_ARTIFICIAL_INTELLIGENCE_RESEARCCH_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_WIRELESS_EMBEDDED_RESEARCH_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_COMPUTER_ARCHITECTURE_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'RESIZE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        })
      })
    })(state, action);
  },
  deviceState: function(state=Blueprint.device, action) {
    return Unity.combineReducers({
      networkState: Unity.createReducer(Blueprint.device.network, {
        'NET_STATE_CHANGE': (s,a) => a.payload,
        'NET_STATE_INIT': (s,a) => a.payload
      })
    })(state, action);
  },
  userState: function(state=Blueprint.user, action) {
    return Unity.combineReducers({
      infoState: Unity.createReducer(Blueprint.user, {})
    })(state, action);
  },
  uiState: function (state=Blueprint.ui, action) {
    return Unity.combineReducers({
      mapState: Unity.createReducer(Blueprint.ui.map, {}),
      headerState: Unity.createReducer(Blueprint.ui.header, {
        'CHANGE_HEADER_ICON': (s,a) => ({icon: a.payload.icon, title: s.title}),
        'CHANGE_HEADER_TITLE': (s,a) => ({icon: s.icon, title: a.payload.title})
      }),
      menuState: Unity.createReducer(Blueprint.ui.menu, {
        'UPDATE_MENU_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload}),
        'NAV_TO': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_MENU': (s,a) => ({current: s.current == 'OPEN' ? 'CLOSED' : 'OPEN', previous: s.current, scrollTop: 0}),
        'OPEN_MENU': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: 0}),
        'CLOSE_MENU': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_THEME': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: a.payload})
      }),
      themeState: Unity.createReducer(Blueprint.ui.theme, {
        'TOGGLE_THEME': (s,a) => Object.assign({}, s, {selected: s.selected == 'dark' ? 'light' : 'dark'}),
        'TOGGLE_WP': (s,a) => Object.assign({}, s, Object.assign({}, s.wp, a.payload))
      }),
      viewState: Unity.createReducer(Blueprint.ui.view, {
        'NAV_TO': (s,a) => ({current: a.payload, previous: s.current, scrollTop: 0}),
        'UPDATE_VIEW_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload})
      }),
      windowState: Unity.createReducer(Blueprint.ui.window, {
        'RESIZE': (s,a) => a.payload
      })
    })(state, action);
  }
};

// -------------------------------------------------------------------------------------
//  Middlewares - Functions that intercept state changes.
// -------------------------------------------------------------------------------------
const Middlewares = {
  // logActions: Unity.storeMiddlewares.logActions('@@INIT'),
  listenerBypass: Unity.storeMiddlewares.listenerBypass({
    'NET_STATE_INIT': ['Render_App'],
    'UPDATE_VIEW_SCROLL': ['Render_App'],
    'UPDATE_MENU_SCROLL': ['Render_App']
  })
};

// -------------------------------------------------------------------------------------
//  Modules - Important/reused modules, UI, etc.
// -------------------------------------------------------------------------------------
const Modules = {
  Router: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {mapState,viewState} = state.uiState;
    const {current,previous} = viewState;
    const sameView = viewState.current==viewState.previous;
    const lastActionNav = state.appState.historyState.actions.slice(-1)=='NAV_TO';
    const styles = {router: `position:fixed; top:0; right:0; bottom:0; left:0; overflow:hidden; z-index:5;`};
    const selected = mapState.flat[current[0]]?mapState.flat[current[0]]:mapState.flat['DEFAULT'];
    const animation = lastActionNav && !sameView ? `animation:viewSlideIn 250ms 1 forwards;` : ``;
    document.title = `${state.userState.infoState.name} | ${selected[1]}`;
    return Unity.createElement('div', {style:styles.router}, [Modules.View(store,selected[0],animation)]);
  },
  Network: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const { downlink, effectiveType, previousType } = state.deviceState.networkState;
    const offline = downlink == 0 ? true : false;
    const menu_opening = state.uiState.menuState.current == 'OPEN';
    const prevAction = state.appState.historyState.actions.slice(-1);
    const display = offline || prevAction == '@@INIT' || prevAction == 'NET_STATE_CHANGE';
    const lg_dev = (state.uiState.windowState.mode == 'large_tab' || state.uiState.windowState.mode == 'desktop');

    const styles = {
      net: `
        position: absolute; top: ${lg_dev?'5':'4'}em; left: 0; width: 100%; margin: 0; padding: 0.5em; z-index: 85;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: ${offline?theme.error:theme.success}; border-bottom: ${offline?theme.error:theme.success}; font-size: 1em; color: #252525;
        font-weight: bold; ${display ? `animation: flash_network 1700ms ease-in-out 1 forwards;` : `display: none;`}
      `
    };

    const Net = Unity.createElement('div', {style:styles.net}, [offline?'Offline':'Connected']);

    window.addEventListener('online', function(event) {
      if (effectiveType != previousType) dispatch({type:'NET_STATE_CHANGE',  payload: {
        downlink: !!navigator.connection ? navigator.connection.downlink : 10,
        effectiveType: navigator.connection ? navigator.connection.effectiveType : 'Connecting...',
        previousType: effectiveType
      }});
    });

    window.addEventListener('offline', function(event) {
      if (effectiveType != previousType) dispatch({type:'NET_STATE_CHANGE',  payload: {
        downlink: !!navigator.connection ? navigator.connection.downlink : 0,
        effectiveType: 'OFFLINE',
        previousType: effectiveType
      }});
    });

    return Net;
  },
  Notification: function(store) {
    // z-index: 95;

    // // function for creating the notification
    // function createNotification(title) {
    //
    //   // Let's check if the browser supports notifications
    //   if (!"Notification" in window) console.log("This browser does not support notifications.");
    //
    //   // Let's check if the user is okay to get some notification
    //   else if (Notification.permission === "granted") {
    //     // If it's okay let's create a notification
    //     const img = '/to-do-notifications/img/icon-128.png';
    //     const text = 'HEY! Your task "' + title + '" is now overdue.';
    //     const notification = new Notification('To do list', { body: text, icon: img });
    //     window.navigator.vibrate(500);
    //   }
    //
    //   // Otherwise, we need to ask the user for permission
    //   // Note, Chrome does not implement the permission static property
    //   // So we have to check for NOT 'denied' instead of 'default'
    //   else if (Notification.permission !== 'denied') {
    //     Notification.requestPermission(function (permission) {
    //       // Whatever the user answers, we make sure Chrome stores the information
    //       if (!('permission' in Notification)) Notification.permission = permission;
    //
    //       // If the user is okay, let's create a notification
    //       if (permission === "granted") {
    //         const img = '/to-do-notifications/img/icon-128.png';
    //         const text = 'HEY! Your task "' + title + '" is now overdue.';
    //         const notification = new Notification('To do list', { body: text, icon: img });
    //         window.navigator.vibrate(500);
    //       }
    //     });
    // }

  },
  Header: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { headerState, viewState, menuState, windowState } = state.uiState;
    const { icons } = Assets.imgs;
    const { current, previous } = menuState;
    const dark_theme = state.uiState.themeState.selected == 'dark';
    const icon_img = dark_theme ? icons.manifest.favicon_wht : icons.manifest.favicon;
    const menu_img = dark_theme ? (current == 'OPEN' ? icons.btns.close_wht : icons.btns.menu_wht)  : (current == 'OPEN' ? icons.btns.close_blk : icons.btns.menu_blk);
    const last_action = state.appState.historyState.actions.slice(-1);
    const open_action = !!(previous == 'CLOSED' && current == 'OPEN');
    const close_action = !!(previous == 'OPEN' && current == 'CLOSED');
    const menu_action = !!(last_action == 'OPEN_MENU' || last_action == 'CLOSE_MENU' || last_action == 'TOGGLE_MENU');
    const lg_dev = (windowState.mode == 'desktop' || windowState.mode == 'large_tab');
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.createElement;

    const styles = {
      header: `
        position: fixed; top: 0; left: 0; width: 100%; height: ${lg_dev?'5':'4'}em; margin: 0; padding: 0; z-index: 90;
        display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        background-color: ${theme.header}; border-bottom: 1pt solid ${theme.header_bdr}; -webkit-box-shadow: 1pt 1pt ${dark_theme?'5':'15'}pt 0 ${theme.header_bdr};
      `,
      header_left: `display: flex; flex-direction: row; justify-content: flex-start; align-items: center;`,
      header_right: `display: flex; flex-direction: row; justify-content: flex-end; align-items: center;`,
      icon: `margin: 0 0 0 1em; padding: 0; height: 4em; width: 4em; cursor:pointer;`,
      super: `font-size: 0.9em; color: ${theme.header_txt}; margin: -1.25em 0 0 0.25em;`,
      menu_btn: `margin: 1em 1.5em; height: 2.5em; width: 2.5em; cursor:pointer; ${open_action ? `animation: menu_btn_opening 300ms ease-in-out 1 forwards;` : (close_action ? `animation: menu_btn_closing 300ms ease-in-out 1 forwards;` : ``)}`,
      header_menu: `display: flex; flex-direction: row; justify-content: center; align-items: center; flex-wrap: wrap; margin: 0; padding: 0;`,
      header_btn: `margin: 0 0.25em; padding: 0.5em 1em; font-size: 1em; text-align: center; color: ${theme.view_txt}; cursor: pointer;`,
      header_qt: `margin: 0 0.25em; padding: 0.5em 1.25em; font-size: 1em; text-align: center; color: ${theme.menu_txt}; background-color: ${theme.btn}; border: 1pt solid ${theme.menu_bdr}; cursor: pointer;`
    };

    const header_icon = E('img', {style:styles.icon, src: icon_img, alt: headerState.alt}, []);
    header_icon.addEventListener('click', function(event) {
      if (viewState.current[0] != 'HOME') dispatch({type:'NAV_TO',payload:['HOME', 'Home']});
      if (viewState.current[0] == 'HOME' && current == 'OPEN') dispatch({type:'CLOSE_MENU'});
    });

    const superscript = E('sup', {style:styles.super}, [viewState.current[1]]);

    const header_menu = E('div', {style:styles.header_menu}, [
      ['HOME', 'Home'], ['BLOG', 'Blog'], ['CONTACT_ME', 'Contact Me'], ['ABOUT_ME', 'About Me'], ['ALL_RESEARCH', 'Research']
    ].map((view, i, arr) => {
      const btn = E('h2', {style: i == arr.length-1 ? styles.header_qt : styles.header_btn}, [view[1]]);
      btn.addEventListener('click', () => {
        if (viewState.current[0] != view[0]) dispatch({type:'NAV_TO',payload:view});
      });
      return btn;
    }));

    const menu_btn = E('img', {style:styles.menu_btn, src: menu_img, alt: 'Menu Button Icon'}, []);
    menu_btn.addEventListener('click', function(event) { dispatch({type:'TOGGLE_MENU'}); });

    return E('div', {style:styles.header}, [
      E('div', {style:styles.header_left}, [ header_icon, superscript ]),
      E('div', {style:styles.header_right}, windowState.mode == 'desktop' ? [header_menu, menu_btn] : [menu_btn]),
    ]);
  },
  Menu: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {menuState,windowState,themeState,mapState} = state.uiState;
    const dark_theme = themeState.selected=='dark';
    const {icons} = Assets.imgs;
    const menuWidth = windowState.mode==`desktop`?`45%`:`100%`;
    const current_view = state.uiState.viewState.current[0];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const last_action = state.appState.historyState.actions.slice(-1);
    const closed_menu_last = !!(last_action=='CLOSE_MENU'||last_action=='TOGGLE_MENU');
    const lg_dev = (windowState.mode=='large_tab'||windowState.mode=='desktop');
    const E = Unity.createElement;

    const styles = {
      menu: `
        position:fixed; top:${lg_dev?'5':'4'}em; left:0; bottom:0; width:${menuWidth}; padding:0; z-index:80; background-color:${theme.menu}; overflow-y:scroll; ${lg_dev?`border-right:1pt solid ${theme.menu_bdr};`:''}
        ${(menuState.current=='OPEN')?(menuState.previous=='OPEN'?``:`animation:menu_opening 300ms ease-in-out 1 forwards;`):(closed_menu_last?`animation:menu_closing 300ms ease-in-out 1 forwards;`:`display:none;`)}
      `,
      toggle: `display:flex; flex-direction:row; justify-content:center; align-items:center; margin:2em; padding:0;`,
      tgl_txt: `margin:0; padding:0; color:${theme.menu_txt}`,
      tgl_btn: `margin:1em; padding:${dark_theme?'0 1.5em 0 0':'0 0 0 1.5em'}; background-color:${theme.panel}; border:1.25pt solid ${dark_theme?theme.success:theme.menu_bdr}; border-radius:1.5em; cursor:pointer;`,
      slider: `height:1.5em; width:1.5em; margin:0; padding:0; background-color:${dark_theme?theme.success:theme.btn}; border-radius:100%;`,
      copy: `
        display:flex; flex-direction:column; justify-content:space-between; align-items:stretch; text-align:center; color:${theme.menu_bdr};
        border-top:1px solid ${theme.menu_bdr}; margin:1em ${lg_dev?'5em 5':'2em 2em 1'}em; padding:1.5em; font-size:${lg_dev?'1':'0.9'}em;
      `,
      usa: `height:1.5em; margin:0.25em; font-size:1.1em; color:${theme.menu_txt};`,
      copy_txt: `font-size:1.1em; margin:0; color:${theme.menu_txt};`
    };

    const copy = E('div', {style:styles.copy}, [
      E('img',{src:icons.sm.usa,alt:`USA Icon`,style:styles.usa},[]),
      E('p',{style:styles.usa},['United States']),
      E('p',{style:styles.copy_txt},['Copyright © 2020 chivington.io']),
    ]);

    const toggle = E('div',{style:styles.toggle},[E('h4',{style:styles.tgl_txt},[`Toggle dark mode`]),E('div',{style:styles.tgl_btn},[E('div',{style:styles.slider},[])])]);
    toggle.lastChild.addEventListener('click',()=>dispatch({type:'TOGGLE_THEME',payload:store.getState().uiState.menuState.scrollTop}));

    const submenu = Modules.Submenu(store,{orientation:`PORTRAIT`,btns:mapState.tree});
    const Menu = Unity.createElement('div',{style:styles.menu},[submenu,toggle,copy]);
    setTimeout(event=>Menu.scrollTo({top:menuState.scrollTop,left:0,behavior:'auto'}),50);

    let scroll_ctr = 0;
    Menu.addEventListener('scroll', function(event) {
      const [current_st,event_st] = [menuState.scrollTop,event.target.scrollTop];
      const diff = (event_st-current_st)<0?-(event_st-current_st):(event_st-current_st);
      if (scroll_ctr++ %2==0 && diff>5) dispatch({type:'UPDATE_MENU_SCROLL',payload:event_st});
    },false);

    return Menu;
  },
  Submenu: function(store,config) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { menuState, windowState } = state.uiState;
    const { icons } = Assets.imgs;
    const dark_theme = state.uiState.themeState.selected == 'dark';
    const menuWidth = ((windowState.mode == `desktop`) || (windowState.mode == `large_tab`)) ? `35%` : `100%`;
    const current_view = state.uiState.viewState.current[0];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const last_action = state.appState.historyState.actions.slice(-1);
    const closed_menu_last = !!(last_action == 'CLOSE_MENU' || last_action == 'TOGGLE_MENU');
    const lg_dev = (windowState.mode == 'large_tab' || windowState.mode == 'desktop');
    const landscape = config.orientation == 'LANDSCAPE' && lg_dev;
    const E = Unity.createElement;

    const styles = {
      container: `display: flex; flex-direction: ${landscape?'row':'column'}; justify-content: ${landscape?'center':'flex-start'}; align-items: ${landscape?'flex-start':'stretch'}; ${lg_dev?``:`border-top: 1pt solid ${theme.menu_bdr};`}`,
      subnemu_wrapper: `margin: ${landscape?'0.5em':'0'}; padding: 0; display: flex; ${landscape?'flex: 1;':''} flex-direction: column; justify-content: flex-start; align-items: stretch; background-color: ${theme.menu_sub};`,
      parent_row: `margin: 0; padding: 0; width: 100%; max-height: 5em; display: flex; flex-direction: row; justify-content: stretch; align-items: center; background-color: ${theme.btn}; border-bottom: 1pt solid ${theme.menu_bdr};`,
      btn: `display: flex; flex: 1; margin: 0; padding: 0.9em; max-height: 2em; font-size: 1.1em; color: ${theme.menu_txt}; cursor: pointer; background-color: ${theme.btn}; border-bottom: 1pt solid ${theme.menu_bdr};`,
      dropdown: `width: 1.75em; margin: 0 1em; color: ${theme.menu_txt}; cursor: pointer;`,
      submenu: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; margin: 0; padding: 0; color: ${theme.menu_txt};`,
      sub_btn: `display: flex; flex: 1; margin: 0 0.25em; padding: 0.75em 2em; font-size: 1.1em; color: ${theme.menu_txt}; border-bottom: 1pt solid ${theme.menu_bdr}; cursor: pointer;`
    };

    const sub_states = {};

    const create_submenu = (sub_config, flag) => {
      const btns = flag ? sub_config : sub_config.btns;

      return btns.map((btn, i, arr) => {
        sub_states[btn[0]] = {current: lg_dev?'OPEN':'CLOSED', previous: 'CLOSED'};

        const b = E('h3', {style: `${flag ? (i==btns.length-1 ? `${styles.sub_btn} border:none;` : styles.sub_btn) : styles.btn}`}, [btn[1]]);
        b.addEventListener('click', function(event) {
          if (state.uiState.viewState.current[0] != btn[0]) dispatch({type: `NAV_TO`,payload:[btn[0], btn[1]]});
          else if (menuState.current == 'OPEN') dispatch({type:'CLOSE_MENU'});
        });

        if (!!btn[2]) {
          b.style.cssText += `border: none;`;
          const submenu_style = sub_states[btn[0]].current == 'CLOSED' ? `height: 0; visibility: hidden;` : `height: auto; visibility: visible`;
          const dropdown = E('img', {style: `${styles.dropdown} ${sub_states[btn[0]].current == 'CLOSED' ? `transform: rotate(-90deg);` : `transform: rotate(-180deg);`}`, src: dark_theme ? icons.btns.caret_wht : icons.btns.caret_blk, alt: 'Sub-Menu Button Icon'}, []);
          dropdown.addEventListener('click', function(event) {
            const selected_sub = b.parentNode.parentNode.children[1];
            sub_states[btn[0]].current = sub_states[btn[0]].current == 'OPEN' ? 'CLOSED' : 'OPEN';
            sub_states[btn[0]].previous = sub_states[btn[0]].current;
            const new_style = sub_states[btn[0]].current == 'CLOSED' ? `height: 0; visibility: hidden;` : `height: auto; visibility: visible`;
            selected_sub.style.cssText = `${styles.submenu} ${new_style}`;
            event.target.style.cssText = `${styles.dropdown} ${sub_states[btn[0]].current == 'CLOSED' ? `transform: rotate(-90deg);` : `transform: rotate(-180deg);`}`;
          });

          return E('div', {style:styles.subnemu_wrapper}, [
            E('div',{style:styles.parent_row},[b,dropdown]),E('div',{style:`${styles.submenu}${submenu_style}`},create_submenu(btn[2],true))
          ]);
        } else return b;
      })
    };

    return E('div', {style:styles.container}, create_submenu(config, false));
  },
  View: function(store,view,animation) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {windowState,viewState,menuState,themeState} = state.uiState;
    const theme = themeState[themeState.selected];
    const {width,height,mode} = windowState;

    const styles = {
      view: `
        position:fixed; top:0; right:0; bottom:0; left:0; margin:0; padding:0; overflow-x:hidden; overflow-y:scroll; z-index:10;
        background:linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('${themeState.wp.view}'); background-position:center; background-size:cover; background-repeat:no-repeat;
        ${menuState.current=='OPEN'?'filter:blur(5pt);':''} -webkit-overflow-scrolling:touch; background-color:${theme.view}; ${animation}
      `
    };

    const View = Unity.createElement('div', {style:styles.view,content:`minimal-ui`}, [view(store),Modules.Footer(store)]);
    setTimeout(event=>View.scrollTo({top:viewState.scrollTop,left:0,behavior:'auto'}),50);

    let scroll_ctr = 0;
    View.addEventListener('scroll', function(event) {
      const [ current_st, event_st ] = [ viewState.scrollTop, event.target.scrollTop ];
      const diff = (event_st - current_st) < 0 ? -(event_st - current_st) : (event_st - current_st);
      if (scroll_ctr++ % 2 == 0 && diff > 5) dispatch({type:'UPDATE_VIEW_SCROLL',payload:event_st});
    },false);

    View.addEventListener('click', function(event) { if (menuState.current=='OPEN') dispatch({type:'CLOSE_MENU'}); });
    return View;
  },
  Project: function(store, config) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { mode } = state.uiState.windowState;
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;
    const { beacon } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.createElement;

    const styles = {
      project: `margin:${lg_dev?'7em 2em 5':'5em 1em 3'}em; padding:1em; background-color:${theme.well};`,
      title: `margin:0; padding:0 0 0.5em 0; border-bottom:1pt solid ${theme.view_bdr}; font-size:1.25em; text-align:center; color:${theme.view_txt};`,
      subtitle: `margin:0.75em; padding:0; text-align:center; color:${theme.view_txt};`,
      description: `
        display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:${lg_dev?'space-around':'flex-start'}; align-items:${lg_dev?'center':'stretch'};
        margin:0; padding:0; background-color:${theme.panel}; color:${theme.view_txt}; border:1pt solid ${theme.view_bdr};
      `,
      img: `margin:0; padding:0; border-bottom:1pt solid ${theme.view_bdr}; ${lg_dev?'height:250pt':`width:100%`};`,
      wrapper: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; margin:0; padding:0; background-color: ${theme.panel};`,
      txt: `margin:0; padding:0.75em 0.25em; text-align:${lg_dev?'left':'center'}; color:${theme.view_txt};`
    };

    const description = E('div', {style:styles.description}, [
      E('img', {style:styles.img, src:config.img, alt:`${config.title} Image`}, []),
      E('div', {style:styles.wrapper}, config.description.map((s,i)=>E('p',{style:styles.txt},[`${i>config.idx?'• ':''}${s}`])))
    ]);

    return E('div',{style:styles.project},[
      E('h1',{style:styles.title},[config.title]),E('p',{style:styles.subtitle},[config.subtitle]),description
    ])
  },
  Tiles: function(store, tile_config) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.createElement;

    const styles = {
      tiles_component: `display: flex; flex-direction: column; justify-content: space-around; align-items: stretch; margin: 0; padding: 0.5em; background-color: ${theme.well};`,
      title: `margin: 0 0.5em; padding: 0.25em; border-bottom: 1pt solid ${theme.view_bdr}; font-size: 1.5em; text-align: center; color: ${theme.view_txt};`,
      subtitle: `margin: 0.75em; padding: 0; font-size: 1em; text-align: center; color: ${theme.view_txt};`,
      tiles: `
        display: flex; flex-direction: ${lg_dev?'row':'column'}; justify-content: flex-start; align-items: stretch; padding: ${lg_dev?0.5:0.25}em;
        margin: ${lg_dev?0.5:0.25}em; background-color: ${theme.panel}; ${lg_dev?'overflow-x: scroll;':''} border: solid ${theme.footer_bdr}; border-width: 1pt 0;
      `,
      tile: `display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 0; margin: ${lg_dev?0.75:0.5}em; background-color: ${theme.panel}; border: 1pt solid ${theme.view_bdr}; cursor: pointer;`,
      img: `margin:0; ${lg_dev?'height:200pt':`width:100%`}; border-bottom: 1pt solid ${theme.view_bdr};`,
      name: `margin:${lg_dev?1:0.75}em; color: ${theme.menu_txt}; font-size: 1em; font-weight: 900; text-align:center; color: ${theme.view_txt};`
    };

    const tiles = E('div', {style:styles.tiles}, tile_config.tiles.map((tile,i) => {
      const t = E('div',{style:styles.tile},[E('img',{style:styles.img,src:tile[2],alt:`${tile[1]} Thumbnail`},[]),E('h3',{style:styles.name},[tile[1]])]);
      t.addEventListener('click',()=>dispatch({type:'NAV_TO',payload:[tile[0],tile[1]]})); return t;
    }));

    setTimeout(e => {
      if (lg_dev) {
        const tile_width = Object.keys(tiles.children).reduce((acc,cur,idx,arr) => tiles.children[arr[idx]].offsetWidth+acc,0);
        if (tile_width>tiles.clientWidth) tiles.style.cssText = `${styles.tiles} border-right:1.5pt solid ${theme.view_bdr}; -webkit-box-shadow:inset -25px 5 50px -25px #000; padding:3em;`
      }
    }, 250);

    return E('div', {style:styles.tiles_component}, [
      E('h1',{style:styles.title},[tile_config.title]), E('h2',{style:styles.subtitle},[tile_config.subtitle]), tiles
    ]);
  },
  Footer: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {footerState,windowState,mapState} = state.uiState;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const lg_dev = (windowState.mode == 'large_tab' || windowState.mode == 'desktop');
    const {icons,wp} = Assets.imgs;
    const E = Unity.createElement;

    const styles = {
      footer: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:${lg_dev?'1em':'0'}; margin:0; z-index:75; background-color:${theme.footer}; border-top:1pt solid ${theme.footer_bdr};`,
      msg: `
        display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; background-color:${theme.panel};
        margin:1em 1em 0; padding:${lg_dev?'2':'1'}em; border:solid ${theme.footer_bdr}; border-width:1pt 0; font-size:1.25em; font-weight:700; text-align:center; color:${theme.menu_txt};
        background:linear-gradient(${theme.panel},${theme.panel}), url('${wp.net}'); background-position:center; background-size:cover; background-repeat:no-repeat;
      `,
      quote_btn: `margin:1em auto 0; padding:0.5em 1em; background-color:${theme.btn}; border:1pt solid ${theme.menu_bdr}; color:${theme.menu_txt}; cursor:pointer;`,
      submenus: `margin:1em; padding:0.5em;`,
      copy: `display:flex; flex-direction:row; justify-content:space-between; align-items:center; text-align:center; border-top:1px solid ${theme.footer_bdr}; margin:0; padding:1em 2em; font-size:1em;`,
      copy_left: `display:flex; flex-direction:row; justify-content:flex-start; align-items:flex-start; padding:0; margin:0;`,
      copy_right: `display:flex; flex-direction:row; justify-content:flex-end; align-items:flex-start; padding:0; margin:0;`,
      usa: `height:1.25em; margin:0; color:${theme.footer_txt};`,
      copy_txt: `font-size:1em; margin:0; color:${theme.footer_txt};`
    };

    // const msg = E('div', {style:styles.msg}, [``]);
    const submenus = E('div', {style:styles.submenus}, [
      Modules.Submenu(store,{orientation:`LANDSCAPE`,btns:[[...mapState.tree[0],[mapState.tree[1],mapState.tree[2],mapState.tree[3]]],mapState.tree[4]]})
    ]);

    const copy = E('div', {style:styles.copy}, [
      E('div', {style:styles.copy_left}, [E('p', {style:styles.copy_txt}, [`Copyright © 2020 chivington.io`])]),
      E('div', {style:styles.copy_right}, [E('img', {src:icons.sm.usa,alt:`USA Icon`,style:styles.usa}, ['United States'])])
    ]);

    return E('div', {style:styles.footer}, [submenus,copy]);
  },
  App: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { width, height, mode } = state.uiState.windowState;

    const styles = {
      app: `position: fixed; top: 0; left: 0; height: 0%; width: 100%; margin: 0; padding: 0; z-index: 0;`
    };

    let resizeCtr = 0;
    window.addEventListener('resize', function(event) {
      if (resizeCtr++ % 5 == 0) {
        const [nw,nh] = [window.innerWidth,window.innerHeight];
        const nm = nw<600?'mobile':(nw<750?'small_tab':(nw<900?'large_tab':'desktop'));
        if (nm!=mode) dispatch({type:'RESIZE',payload:{width:nw,height:nh,mode:nm}});
      }
    });

    return Unity.createElement('div', {style:styles.app}, [
      Modules.Header(store), Modules.Menu(store), Modules.Router(store), Modules.Network(store)
    ]);
  }
};

// -------------------------------------------------------------------------------------
//  Views - Groups Modules to fit device.
// -------------------------------------------------------------------------------------
const Views = {
  Home: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {appState,userState,uiState} = state;
    const {name,phone,email,directions,employer,title,major,school,bio} = userState.infoState;
    const {windowState,mapState} = uiState;
    const lg_dev = ((windowState.mode=='desktop')||(windowState.mode=='large_tab'))?true:false;
    const landing = ((appState.historyState.views.slice(-1)=='@@INIT')&&(appState.historyState.actions.slice(-1)=='@@INIT'))?true:false;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.createElement;

    const styles = {
      home: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:0; width:100%; text-align:center; ${landing?'animation: app_fade_in 900ms ease-in-out 1 forwards;':''}`,
      intro: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:${lg_dev?'7em 1em 2':'6em 1em 2'}em;`,
      name: `margin:0 auto; color:#fff; font-size:4em; font-weight:400;`,
      title: `margin:0.25em; color:#fff; font-size:${lg_dev?1.5:1.3}em; font-weight:300;`,
      actions: `display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:center; align-items:${lg_dev?'center':'stretch'}; margin:0 auto; padding:0; width:${lg_dev?80:90}%;`,
      btn: `margin:0.5em ${lg_dev?'':'auto'}; padding:0.4em 0.6em; width:${lg_dev?50:80}%; background-color:${theme.btn}; border:1pt solid #aaa; cursor:pointer;`,
      bio: `margin:${lg_dev?1.5:1}em; padding:${lg_dev?`0.5`:`0.25`}em; border:1px solid ${theme.view_bdr}; background-color:${theme.well};`,
      sentence: `color:${theme.view_txt}; font-size:${lg_dev?1.25:1}em; font-weight:700; margin:0.5em;`,
      research: `margin:0 ${lg_dev?`1.5em 1.5`:`1em 1`}em;`
    };

    const intro = E('div',{style:styles.intro},[E('h1',{style:styles.name},[name]),E('h2',{style:styles.title},[`${major} Student at ${school}`])]);

    const actions = E('div',{style:styles.actions},[['CONTACT_ME','Contact Me'],['ALL_RESEARCH','View My Research']].map((b,i,arr) => {
      const btn = E('h2', {style: styles.btn}, [b[1]]);
      btn.addEventListener('click', (event) => dispatch({type:'NAV_TO',payload:[b[0], b[1]]})); return btn;
    }));

    const bioe = E('div',{style:styles.bio},bio.work.map(s=>E('p',{style:styles.sentence},[s])));

    const tiles = E('div',{style:styles.research},[Modules.Tiles(store,{
      title: `Research Areas`,
      subtitle: `These are the areas I try to stay most active in as I pursue my education.`,
      tiles: mapState.tree[4][2].map(route=>([route[0],route[1],mapState.flat[route[0]][2]]))
    })]);

    return E('div',{style:styles.home},[intro,actions,bioe,tiles]);
  },
  Blog: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {wp,thumbs} = Assets.imgs;
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.createElement;

    const styles = {
      blogView: `margin: 3.5em auto 3em; padding: 1em 0 0 0; width: 100%; min-height: 100%; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;`,
      viewTitle: `margin: 0.75em auto 0.25em; color: ${theme.menu_txt};`,
      blogPost: `margin: ${lg_dev?1.5:0.5}em; padding: 0.5em; border: 1pt solid ${theme.view_bdr}; background-color: ${theme.well}; text-align: center;`,
      blogImg: `border: 1px solid ${theme.view_bdr};`,
      blogBody: `margin: ${lg_dev?1:0.5}em; display: flex; flex-direction: column; justify-content: space-around; text-align: left;`,
      paragraph: `margin: 0.5em 0.25em; text-indent: 50px; color: ${theme.view_txt};`,
      blogTags: `margin: 0 1em; padding: ${lg_dev?1:0.5}em; border-top: 1pt solid ${theme.view_bdr}; display: flex; flex-direction: row; justify-content: space-around; align-items: center; flex-wrap: wrap;`,
      tag: `margin: 0.25em; color: ${theme.view_txt};`
    };

    const posts = [{
      img: [thumbs.linear_gif, 'Linear Regression Thumbnail'],
      body: [
        `In an upcoming post I'll be discussing an interactive Linear Regression demo that I'll be hosting here on the Projects section. This will be a live Machine Learning model that will run in your browser and is the perfect tool to help explain the first principles to data science new-comers. `,
        `If you're interested in Machine Learning, Data Science, or Artificial Intelligence, this is a must have tool that will lay foundations for more complex and capable models like Neural Networks. `,
        `I'm really excited about it and will share more soon. Thanks for standing by.`
      ],
      tags: [`#LinearRegression`,`#DataScience`,`#MachineLearning`,`#Regularization`]
    },{
      img: [thumbs.qualys, 'Qualys Thumbnail'],
      body: [
        `In an upcoming post, I'll be detailing all of the steps needed to set up and secure a "bare metal" Linux machine for hosting your own web apps. `,
        `We'll use NameCheap to get a domain name, DigitalOcean for the hosting, LetsEncrypt for SSL/TLS, Nginx for a proxy, and then we'll write our own backend app servers and load balancers in NodeJs. We'll also cover setting up SSH, configuring your firewall, and a few other administravtive and security server tasks. `,
        `This setup will have an A/A+ Qualsys SSL Labs Score, an A/A+ ImmuniWeb SSLScan Score, and will only cost you the price of your domain name (usually ~$15/year or less) and $5/month for the server. With this, you can host a number of web apps, databases, etc. and it'll take less than an hour to set up. `,
        `P.S. If you don't want to pay anything for a domain name or server at all, I'll be covering that shortly after so stay tuned.`
      ],
      tags: [`#ServerAdmin`,`#Security`,`#SSL`,`#TLS`,`#http2`,`#NameCheap`,`#DigitalOcean`,`#LetsEncrypt`,`#Nginx`,`#Linux`,`#NodeJs`]
    }];

    return E('div', {style:styles.blogView}, [
      E('h1', {style:styles.viewTitle}, ['Blog Posts']),
      ...posts.map(post => E('div', {style:styles.blogPost}, [
        E('img', {style:styles.blogImg, width: '80%', src: post.img[0], alt: post.img[1]}, []),
        E('div', {style:styles.blogBody}, post.body.map(p => E('p', {style:styles.paragraph}, [p]))),
        E('div', {style:styles.blogTags}, post.tags.map(t => E('span', {style:styles.tag}, [t])))
      ]))
    ]);
  },
  Contact: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {wp,thumbs} = Assets.imgs;
    const {emails,phones,locations} = state.userState.infoState;
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.createElement;

    const styles = {
      view:`display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%;`,
      contact:`margin:${lg_dev?'7em 2em 5':'5em 1em 3'}em; padding:1em; background-color:${theme.well}; display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
      title:`margin:0 1em; padding:0.75em; border-bottom:1pt solid ${theme.view_bdr}; text-align:center; color:${theme.view_txt};`,
      intro:`margin:0; padding:0; text-align:center; color:${theme.view_txt};`,
      section:`margin:${lg_dev?'1':'0.25'}em; padding:0; text-align:center; display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:space-around; align-items:center;`,
      row:`display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:${lg_dev?'center':'flex-start'}; align-items:stretch;`,
      sxn_title:`margin:${lg_dev?`0 0.5em 0 0`:`0.5em 0 0 0`}; padding:0; font-weight:bold; font-size:1em; color:${theme.view_txt};`,
      txt:`margin:0; padding:0; color:${theme.view_txt};`,
      map:`border:1px solid ${theme.footer_bdr}; margin:1em auto; width:95%; height:250pt;`
    };

    const section = (info,name)=>E('div',{style:styles.section},Object.keys(info).map(key=>E('div',{style:styles.row},[
      E('h2',{style:styles.sxn_title},[`${name}${lg_dev?`: `:``}`]),E('p',{style:styles.txt},[info[key].length==2?info[key][0]:info[key]])
    ])));

    return E('div', {style:styles.view}, [
      E('div',{style:styles.contact},[
        E('h1',{style:styles.title},['StayInTouch']),section(phones,'Number'),section(emails,'Email'),
        E('iframe',{frameborder:'0',style:styles.map,allowfullscreen:'',src:locations.home[1]},[])
      ])
    ]);
  },
  About: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { wp, thumbs } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const { bio } = state.userState.infoState;
    const E = Unity.createElement;
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;

    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`,
      about: `margin: ${lg_dev?'1em 2em':'0.5em 1em'} 3em; padding: ${lg_dev?1:0.25}em; background-color: ${theme.well};`,
      title: `margin: ${lg_dev?3:2.5}em auto 0.25em; padding: ${lg_dev?0.25:0.15}em; border-bottom: 1pt solid ${theme.view_bdr}; text-align: center; color: ${theme.menu_txt};`,
      intro: `margin: 0.5em; padding: 0; text-align: center; color: ${theme.view_txt};`,
      bio: `margin: 1em 0 0; padding: 0;`,
      section: `margin: 1.5em 1em 1em; padding: 0;`,
      sxn_title: `margin: 0 0 0.5em; padding: 0 1em 0.5em; font-size: 1em; color: ${theme.view_txt}; border-bottom: 1pt solid ${theme.menu_bdr};`,
      txt: `margin: 0 0.5em; padding: 0; color: ${theme.view_txt};`,
      sentence: `margin: 0.25em; color: ${theme.view_txt};`
    };

    const title = E('h1', {style:styles.title}, ['About Me']);

    const intro = E('p', {style:styles.intro}, [`intro`]);

    const full_bio = E('div', {style:styles.bio}, Object.keys(bio).map(section => E('div', {style:styles.section}, [
      E('h2', {style:styles.sxn_title}, [`${section.toUpperCase()} HISTORY`]),
      ...bio[section].map((sentence, i) => E('span', {style: `${styles.sentence} ${i==0?'margin-left:1em;':''}`}, [sentence]))
    ])));

    return E('div', {style:styles.view}, [
      title,
      E('div', {style:styles.about}, [full_bio])
    ]);
  },
  All_Research: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {windowState,mapState} = state.uiState;
    const {thumbs} = Assets.imgs;

    const styles = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%; padding:6em 1em 3em;`
    };

    const tiles = Modules.Tiles(store,{
      title: `All Research Areas`,
      subtitle: `Choose an area to see specific projects.`,
      tiles: mapState.tree[4][2].map(route=>([route[0],route[1],mapState.flat[route[0]][2]]))
    });

    return Unity.createElement('div', {style:styles.view}, [tiles]);
  },
  Artificial_Intelligence_Research: function(store) {
    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`
    };

    const product_config = {
      title: `Artificial Intelligence Research`,
      subtitle: `Custom Neural Network architecture research.`,
      img: Assets.imgs.thumbs.ai,
      description: [
        `My current AI research is focused on:`,
        `Computer Vision`,
        `Natural Language Processing`,
        `Simultaneous Localization & Mapping`
      ],
      idx: 0
    };

    return Unity.createElement('div', {style:styles.view}, [Modules.Project(store,product_config)]);
  },
  Embedded_Research: function(store) {

    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`
    };

    const product_config = {
      title: `Embedded Research`,
      subtitle: `Custom chip design & SoC research.`,
      img: Assets.imgs.thumbs.mcu,
      description: [
        `My current Embedded research focuses on a Computer Architecture course that culminates in the design & fabrication of a 16-bit machine from first principles with NAND gates.`,
        `Tensor Processing Units (TPUs) for use in a stand-alone capacity.`,
        `Embedded neural circuits for use in subroutines of custom SoCs.`
      ],
      idx: 0
    };

    return Unity.createElement('div', {style:styles.view}, [ Modules.Project(store, product_config) ]);
  },
  Wireless_Networking_Research: function(store) {

    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`
    };

    const product_config = {
      title: `Computer Architecture Research`,
      subtitle: `Low power, long range, control & monitoring systems.`,
      img: Assets.imgs.thumbs.iot,
      description: [
        `My current research focuses on the use of low-power networked embedded devices to:`,
        `Monitor various sensors and feeback loops for data collection and analysis`,
        `Decentralizing Deep Learning models across collections of embeeded TPUs`
      ],
      idx: 0
    };

    return Unity.createElement('div', {style:styles.view}, [ Modules.Project(store, product_config) ]);
  },
  User_Interface_Research: function(store) {

    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`
    };

    const product_config = {
      title: `UI Architectures Research`,
      subtitle: `Modular, portable, complex user interface architectures designed for any platform.`,
      img: Assets.imgs.thumbs.ui,
      description: [
        `My current interface research invloves creating highly complex user interfaces that:`,
        `Are hardware & software agnostic.`,
        `Can be ported to any programming language.`,
        `Can be replicated, scale and deployed rapidly.`
      ],
      idx: 0
    };

    return Unity.createElement('div', {style:styles.view}, [Modules.Project(store,product_config)]);
  }
};

// -------------------------------------------------------------------------------------
//  Asset Manifest - Everything needed to cache app.
// -------------------------------------------------------------------------------------
const Assets = {
  css: {
    fonts: {
      Avenir_Book: '/css/fonts/Avenir-Free/Avenir-Book.otf',
      Avenir_Book: '/css/fonts/Avenir-Free/Avenir-Light.otf',
      Avenir_Book: '/css/fonts/Avenir-Free/Avenir-Roman.otf'
    },
    only_css_file: '/css/only.css'
  },
  imgs: {
    icons: {
      btns: {
        close_wht: '/imgs/icons/btns/close-wht.svg',
        close_blk: '/imgs/icons/btns/close-blk.svg',
        scroll: '/imgs/icons/btns/scroll.svg',
        menu_wht: '/imgs/icons/btns/menu-wht.svg',
        menu_blk: '/imgs/icons/btns/menu-blk.svg',
        caret_wht: '/imgs/icons/btns/caret-wht.svg',
        caret_blk: '/imgs/icons/btns/caret-blk.svg'
      },
      manifest: {
        android_192: '/imgs/icons/manifest/android-chrome-192x192.png',
        android_512: '/imgs/icons/manifest/android-chrome-512x512.png',
        apple_touch: '/imgs/icons/manifest/apple-touch-icon.png',
        favicon_16: '/imgs/icons/manifest/favicon-16x16.png',
        favicon_32: '/imgs/icons/manifest/favicon-32x32.png',
        favicon: '/imgs/icons/manifest/favicon.ico',
        favicon_wht: '/imgs/icons/manifest/favicon-wht.png',
        mstile_150: '/imgs/icons/manifest/mstile-150x150.png',
        safari_pinned_tab: '/imgs/icons/manifest/safari-pinned-tab.svg'
      },
      network: {
        no_wifi_1: '/imgs/icons/network/no-wifi-1.svg',
        no_wifi_2: '/imgs/icons/network/no-wifi-2.svg',
        wifi: '/imgs/icons/network/wifi.svg'
      },
      sm: {
        dl_blk: '/imgs/icons/sm/dl-blk.svg',
        dl_wht: '/imgs/icons/sm/dl-wht.svg',
        resume_blk: '/imgs/icons/sm/resume-blk.svg',
        resume_wht: '/imgs/icons/sm/resume-wht.svg',
        email_blk: '/imgs/icons/sm/email-blk.svg',
        email_wht: '/imgs/icons/sm/email-wht.svg',
        fb: '/imgs/icons/sm/fb.svg',
        git_blk: '/imgs/icons/sm/git-blk.svg',
        git_wht: '/imgs/icons/sm/git-wht.svg',
        jc_pbc_blk: '/imgs/icons/sm/jc-pcb-blk.svg',
        jc_pbc_wht: '/imgs/icons/manifest/mstile-150x150.png',
        li_blk: '/imgs/icons/sm/li-blk.svg',
        li_wht: '/imgs/icons/sm/li-wht.svg',
        phone_blk: '/imgs/icons/sm/phone-blk.svg',
        phone_wht: '/imgs/icons/sm/phone-wht.svg',
        twt_blk: '/imgs/icons/sm/twt-blk.svg',
        twt_wht: '/imgs/icons/sm/twt-wht.svg',
        usa: '/imgs/icons/sm/united-states.svg',
        web_blk: '/imgs/icons/sm/web-blk.svg',
        web_wht: '/imgs/icons/sm/web-wht.svg'
      }
    },
    me: {
      loaf: '/imgs/me/loaf.jpg',
      win_bed: '/imgs/me/win-bed.jpg',
      win: '/imgs/me/win.jpg'
    },
    thumbs: {
      pagespeed: '/imgs/thumbs/google-pagespeed.jpg',
      hello: '/imgs/thumbs/hello.png',
      ht_bridge: '/imgs/thumbs/ht-bridge.svg',
      linear: '/imgs/thumbs/linear.jpg',
      logistic: '/imgs/thumbs/logistic.jpg',
      qualys: '/imgs/thumbs/qualys.png',
      svm: '/imgs/thumbs/svm.jpg',
      linear_gif: '/imgs/thumbs/linear_regression.gif',
      iot: '/imgs/thumbs/iot.jpg',
      mcu: '/imgs/thumbs/mcu.jpg',
      ai: '/imgs/thumbs/ai.jpg',
      ui: '/imgs/thumbs/ui.jpg'
    },
    wp: {
      fragmented: '/imgs/wp/fragmented.jpg',
      geo_sphere: '/imgs/wp/geo-sphere.jpg',
      math: '/imgs/wp/math.jpg',
      pnw: '/imgs/wp/pnw.jpg',
      seattle: '/imgs/wp/seattle.jpg',
      yolo: '/imgs/wp/yolo.jpg',
      net: `
        background-color: #000000; background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='769' cy='229' r='5'/%3E%3Ccircle cx='539' cy='269' r='5'/%3E%3Ccircle cx='603' cy='493' r='5'/%3E%3Ccircle cx='731' cy='737' r='5'/%3E%3Ccircle cx='520' cy='660' r='5'/%3E%3Ccircle cx='309' cy='538' r='5'/%3E%3Ccircle cx='295' cy='764' r='5'/%3E%3Ccircle cx='40' cy='599' r='5'/%3E%3Ccircle cx='102' cy='382' r='5'/%3E%3Ccircle cx='127' cy='80' r='5'/%3E%3Ccircle cx='370' cy='105' r='5'/%3E%3Ccircle cx='578' cy='42' r='5'/%3E%3Ccircle cx='237' cy='261' r='5'/%3E%3Ccircle cx='390' cy='382' r='5'/%3E%3C/g%3E%3C/svg%3E");
      `,
      scales: `
        background-color: #b459ff; background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='100' y1='33' x2='100' y2='-3'%3E%3Cstop offset='0' stop-color='%23000' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23000' stop-opacity='1'/%3E%3C/linearGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='100' y1='135' x2='100' y2='97'%3E%3Cstop offset='0' stop-color='%23000' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23000' stop-opacity='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='%23994cd9' fill-opacity='0.6'%3E%3Crect x='100' width='100' height='100'/%3E%3Crect y='100' width='100' height='100'/%3E%3C/g%3E%3Cg fill-opacity='0.5'%3E%3Cpolygon fill='url(%23a)' points='100 30 0 0 200 0'/%3E%3Cpolygon fill='url(%23b)' points='100 100 0 130 0 100 200 100 200 130'/%3E%3C/g%3E%3C/svg%3E");
      `,
      tiled: `
        background-color: #ffffff; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='50' height='25' viewBox='0 0 50 25'%3E%3Cdefs%3E%3Crect stroke='%23ffffff' stroke-width='0.1' width='1' height='1' id='s'/%3E%3Cpattern id='a' width='2' height='2' patternUnits='userSpaceOnUse'%3E%3Cg stroke='%23ffffff' stroke-width='0.1'%3E%3Crect fill='%23fafafa' width='1' height='1'/%3E%3Crect fill='%23ffffff' width='1' height='1' x='1' y='1'/%3E%3Crect fill='%23f5f5f5' width='1' height='1' y='1'/%3E%3Crect fill='%23f0f0f0' width='1' height='1' x='1'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='b' width='5' height='11' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23ebebeb'%3E%3Cuse xlink:href='%23s' x='2' y='0'/%3E%3Cuse xlink:href='%23s' x='4' y='1'/%3E%3Cuse xlink:href='%23s' x='1' y='2'/%3E%3Cuse xlink:href='%23s' x='2' y='4'/%3E%3Cuse xlink:href='%23s' x='4' y='6'/%3E%3Cuse xlink:href='%23s' x='0' y='8'/%3E%3Cuse xlink:href='%23s' x='3' y='9'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='c' width='7' height='7' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23e5e5e5'%3E%3Cuse xlink:href='%23s' x='1' y='1'/%3E%3Cuse xlink:href='%23s' x='3' y='4'/%3E%3Cuse xlink:href='%23s' x='5' y='6'/%3E%3Cuse xlink:href='%23s' x='0' y='3'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='d' width='11' height='5' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23ffffff'%3E%3Cuse xlink:href='%23s' x='1' y='1'/%3E%3Cuse xlink:href='%23s' x='6' y='3'/%3E%3Cuse xlink:href='%23s' x='8' y='2'/%3E%3Cuse xlink:href='%23s' x='3' y='0'/%3E%3Cuse xlink:href='%23s' x='0' y='3'/%3E%3C/g%3E%3Cg fill='%23e0e0e0'%3E%3Cuse xlink:href='%23s' x='8' y='3'/%3E%3Cuse xlink:href='%23s' x='4' y='2'/%3E%3Cuse xlink:href='%23s' x='5' y='4'/%3E%3Cuse xlink:href='%23s' x='10' y='0'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='e' width='47' height='23' patternUnits='userSpaceOnUse'%3E%3Cg fill='%239861bb'%3E%3Cuse xlink:href='%23s' x='2' y='5'/%3E%3Cuse xlink:href='%23s' x='23' y='13'/%3E%3Cuse xlink:href='%23s' x='4' y='18'/%3E%3Cuse xlink:href='%23s' x='35' y='9'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='f' width='61' height='31' patternUnits='userSpaceOnUse'%3E%3Cg fill='%239861bb'%3E%3Cuse xlink:href='%23s' x='16' y='0'/%3E%3Cuse xlink:href='%23s' x='13' y='22'/%3E%3Cuse xlink:href='%23s' x='44' y='15'/%3E%3Cuse xlink:href='%23s' x='12' y='11'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23a)' width='50' height='25'/%3E%3Crect fill='url(%23b)' width='50' height='25'/%3E%3Crect fill='url(%23c)' width='50' height='25'/%3E%3Crect fill='url(%23d)' width='50' height='25'/%3E%3Crect fill='url(%23e)' width='50' height='25'/%3E%3Crect fill='url(%23f)' width='50' height='25'/%3E%3C/svg%3E");background-attachment: fixed;background-size: cover;
      `
    }
  },
  js: {
    app: '/js/app.js'
  },
  browserconfig: '/browserconfig.xml',
  favicon: '/favicon.ico',
  index: '/index.html',
  license: '/LICENSE',
  webmanifest: '/site.webmanifest'
};

// -------------------------------------------------------------------------------------
//  Blueprint - Specifies inital app state.
// -------------------------------------------------------------------------------------
const Blueprint = {
  app: {
    about: {
      '@@ACTIONS': {}
    },
    history: {
      '@@ACTIONS': {
        'NAV_TO': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type],
          views: s.views.length == 5 ? [...s.views.slice(1), a.payload] : [...s.views, a.payload]
        }),
        'NET_STATE_CHANGE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'NET_STATE_INIT': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'BATTERY_STATE_CHANGE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'BATTERY_STATE_INIT': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'CHANGE_HEADER_ICON': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'CHANGE_HEADER_TITLE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'OPEN_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'CLOSE_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'CHANGE_THEME': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'OPEN_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_ALL_RESEARCH_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_ARTIFICIAL_INTELLIGENCE_RESEARCCH_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_WIRELESS_EMBEDDED_RESEARCH_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_COMPUTER_ARCHITECTURE_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_HOME_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_ALL_RESEARCH_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_ARTIFICIAL_INTELLIGENCE_RESEARCCH_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_WIRELESS_EMBEDDED_RESEARCH_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_COMPUTER_ARCHITECTURE_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'RESIZE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        })
      },
      actions: ['@@INIT'],
      views: ['@@INIT']
    },
    reports: [
      {org: 'Qualys SSL Labs', score: 'A+', img: Assets.imgs.thumbs.qualys, link: 'https://www.ssllabs.com/ssltest/analyze.html?d=chivington.io'},
      {org: 'ImmuniWeb SSLScan', score: 'A+', img: Assets.imgs.thumbs.ht_bridge, link: 'https://www.htbridge.com/ssl/?id=uAXLxfew'},
      {org: 'Google PageSpeed', score: '100%', img: Assets.imgs.thumbs.pagespeed, link: 'https://developers.google.com/speed/pagespeed/insights/?url=chivington.io'}
    ],
    security: [
      'https/http2', 'hsts', 'TLSv1.2', 'CAA Compliant', 'POODLE', 'CVE-2016-2017', 'Insecure Renegotiation', 'ROBOT', 'HEARTBLEED', 'CVE-2014-0224'
    ],
    features: [
      'Unity/Unity-Style Architecture', 'Responsive Design', 'Offline Capable', 'Network Detection', 'Customizable Themes'
    ]
  },
  device: {
    network: {
      '@@ACTIONS': {
        'NET_STATE_CHANGE': (s,a) => a.payload,
        'NET_STATE_INIT': (s,a) => a.payload
      },
      downlink: navigator.connection ? navigator.connection.downlink : 10,
      effectiveType: navigator.connection ? navigator.connection.effectiveType : 'Connecting...',
      previousType: '@@INIT'
    },
    battery: 100
  },
  user: {
    name: 'Johnathan Chivington',
    employer: `University of Washington`,
    title: `Fiscal Analyst`,
    school: `North Seattle College`,
    major: `Physics & Computer Science`,
    phones: {mobile:'303-900-2861'},
    emails: {personal: 'j.chivington@outlook.com'},
    web: {
      linkedin: 'https://linkedin.com/in/johnathan-chivington',
      github: 'https://github.com/chivington',
      twitter: 'https://twitter.com/jt_chivington',
      facebook: 'https://facebook.com/jt.chivington'
    },
    locations: {
      home: ['16th Ave NE Seattle, WA', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2684.205290399708!2d-122.3148723486745!3d47.71926458807909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490116804741175%3A0x9881011855bc85e5!2s12499-12355%2015th%20Ave%20NE%2C%20Seattle%2C%20WA%2098125!5e0!3m2!1sen!2sus!4v1585209347943!5m2!1sen!2sus']
    },
    bio: {
      work: [
        `I'm currently a Fiscal Analyst at the University of Washington in the Department of Electrical & Computer Engineering and my experience has been primarily in finance, business development and sales.`,
        `My background is in Computer Science with extensive experience in the areas of Machine Learning & Artificial Intelligence, Computer Architecture, Networked Embedded Systems, and User Interface Architectures.`,
        `My future endeavours will be in the areas of MEMS/NEMS systems, quantum optics, quantum computation, biophysical interactions, and other nano-scale physical systems.`
      ],
      education: [
        `This quarter I'm auditing CSE 546 "Machine Learning" at the University of Washington.`,
      ],
      personal: [
        `My "career" goals are also very personal to me, so I tend to spend most of my spare time pursuing those.`,
        `I'm currently taking Computer Architecture and Convex Optimization courses online and auditing CSE 546 at the University of Washington. `,
        `When we're not terribly busy or quarantined by a global pandemic, my girlfriend and I also like to go hiking, kayaking, walking our dog, etc.`
      ]
    }
  },
  ui: {
    '@@ACTIONS': {},
    map: {
      flat: {
        'HOME': [Views.Home,'Home',Assets.imgs.thumbs.ai],
        'BLOG': [Views.Blog,'Blog',Assets.imgs.thumbs.ai],
        'CONTACT_ME': [Views.Contact,'Contact Me',Assets.imgs.thumbs.ai],
        'ABOUT_ME': [Views.About,'About Me',Assets.imgs.thumbs.ai],
        'ALL_RESEARCH': [Views.All_Research,'All Research',Assets.imgs.thumbs.ai],
        'ARTIFICIAL_INTELLIGENCE_RESEARCH': [Views.Artificial_Intelligence_Research,'Artificial Intelligence Research',Assets.imgs.thumbs.ai],
        'WIRELESS_EMBEDDED_RESEARCH': [Views.Embedded_Research,'Embedded Research',Assets.imgs.thumbs.iot],
        'COMPUTER_ARCHITECTURE': [Views.Wireless_Networking_Research,'Computer Architecture Research',Assets.imgs.thumbs.mcu],
        'UI_ARCHITECTURES_RESEARCH': [Views.User_Interface_Research,'UI Architectures Research',Assets.imgs.thumbs.ui],
        'DEFAULT': [Views.Home,'Home',Assets.imgs.thumbs.ai]
      },
      tree: [
        ['HOME','Home'],
        ['BLOG','Blog'],
        ['CONTACT_ME','Contact Me'],
        ['ABOUT_ME','About Me'],
        ['ALL_RESEARCH','All Research', [
          ['ARTIFICIAL_INTELLIGENCE_RESEARCH','Artificial Intelligence Research'],
          ['WIRELESS_EMBEDDED_RESEARCH','Embedded Research'],
          ['COMPUTER_ARCHITECTURE','Computer Architecture Research'],
          ['UI_ARCHITECTURES_RESEARCH','UI Architectures Research']
        ]]
      ],
      tre: [
        ['HOME'],
        ['BLOG'],
        ['CONTACT_ME'],
        ['ABOUT_ME'],
        ['ALL_RESEARCH', [['ARTIFICIAL_INTELLIGENCE_RESEARCH'],['WIRELESS_EMBEDDED_RESEARCH'],['COMPUTER_ARCHITECTURE'],['UI_ARCHITECTURES_RESEARCH']]]
      ]
    },
    theme: {
      selected: 'light',
      dark: {
        header: `rgba(21,32,43,1)`,
        header_txt: `rgba(255,255,255,1)`,
        header_bdr: `rgba(70,122,194,0.7)`,
        menu: `rgba(21,32,43,0.9)`,
        menu_bdr: `rgba(70,122,194,0.9)`,
        menu_btn: `rgba(21,32,43,0.9)`,
        menu_sub: `rgba(70,87,117,0.5)`,
        menu_txt: `rgba(255,255,255,1)`,
        view: `rgba(70,77,97,0.9)`,
        view_bdr: `rgba(70,122,194,0.9)`,
        view_txt: `rgba(255,255,255,1)`,
        well: `rgba(70,87,117,0.9)`,
        panel_lt: `rgba(35,43,59,0.5)`,
        panel: `rgba(35,43,59,0.7)`,
        panel_drk: `rgba(50,50,75,0.7)`,
        btn: `rgba(53,92,146,1)`,
        btn_lt: `rgba(70,122,194,1)`,
        btn_bdr: `rgba(70,122,194,0.9)`,
        footer: `rgba(21,32,43,0.9)`,
        footer_bdr: `rgba(70,122,194,0.9)`,
        footer_txt: `rgba(255,255,255,1)`,
        success: '#4e4',
        error: '#e44'
      },
      light: {
        header: `rgba(255,255,255,1)`,
        header_txt: `rgba(55,55,75,0.9)`,
        header_bdr: `rgba(25,25,25,1)`,
        menu: `rgba(112,140,188,0.9)`,
        menu_bdr: `rgba(35,45,75,0.9)`,
        menu_btn: `rgba(66,103,178,1)`,
        menu_sub: `rgba(120,160,195,1)`,
        menu_txt: `rgba(255,255,255,1)`,
        view: `rgba(255,255,255,1)`,
        view_bdr: `rgba(75,75,75,0.9)`,
        view_txt: `rgba(55,55,75,0.9)`,
        well: `rgba(255,255,255,1)`,
        panel_lt: `rgba(112,140,200,0.3)`,
        panel: `rgba(112,140,188,0.5)`,
        panel_drk: `rgba(50,50,75,0.7)`,
        btn: `rgba(81,128,193,1)`,
        btn_lt: `rgba(105,155,225,1)`,
        btn_bdr: `rgba(25,25,25,0.9)`,
        footer: `rgba(255,255,255,1)`,
        footer_bdr: `rgba(25,25,25,0.9)`,
        footer_btn: `rgba(70,87,117,0.4)`,
        footer_txt: `rgba(55,55,75,0.9)`,
        success: '#7e7',
        error: '#e77'
      },
      wp: {view:Assets.imgs.wp.pnw}
    },
    window: {
      width: window.innerWidth,
      height: window.innerHeight,
      mode: window.innerWidth < 600 ? 'mobile' : (
        window.innerWidth < 750 ? 'small_tab' : (window.innerWidth < 900 ? 'large_tab' : 'desktop')
      )
    },
    header: {
      '@@ACTIONS': {
        'CHANGE_HEADER_ICON': (s,a) => ({icon: a.payload.icon, title: s.title}),
        'CHANGE_HEADER_TITLE': (s,a) => ({icon: s.icon, title: a.payload.title})
      },
      icon: Assets.imgs.icons.manifest.favicon,
      alt: 'chivington.io Icon',
      menu_btn: Assets.imgs.icons.btns.menu
    },
    menu: {
      '@@ACTIONS': {
        'UPDATE_MENU_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload}),
        'NAV_TO': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_MENU': (s,a) => ({current: s.current == 'OPEN' ? 'CLOSED' : 'OPEN', previous: s.current, scrollTop: 0}),
        'OPEN_MENU': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: 0}),
        'CLOSE_MENU': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_THEME': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: a.payload})
      },
      current: 'CLOSED',
      previous: 'CLOSED',
      scrollTop: 0
    },
    view: {
      '@@ACTIONS': {
        'NAV_TO': (s,a) => ({current: a.payload, previous: s.current, scrollTop: 0}),
        'UPDATE_VIEW_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload})
      },
      current: ['HOME', 'Home'],
      previous: '@@INIT',
      scrollTop: 0
    }
  }
};

// -------------------------------------------------------------------------------------
//  Initialization - Initialize application with Blueprint & Asset Manifest.
// -------------------------------------------------------------------------------------
const App_Root = document.getElementById('App_Root');
const Load_Screen_Root = document.getElementById('Load_Screen_Root');
Unity.initializeApplication(App_Root,Load_Screen_Root,Blueprint,Reducers,Middlewares);
