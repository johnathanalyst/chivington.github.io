// --------------------------------------------------------------------------------------------
// Author: Johnathan Chivington
// Project: Personal blog, resume and research portfolio.
// Description: Personal web application built in my custom UI/UX framework, Unity.
// Version: 2.0.0 - (production - see README.md)
// License: None
// --------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------
//  Unity - A minimal state/UI framework for building complex "native-like" web applications.
// --------------------------------------------------------------------------------------------
const Unity = {
  reducer: function(defaultState,map) {
    return function(state = defaultState, action) {
      return map[action.type] ? map[action.type](state, action) : state;
    }
  },
  combine: function(reducers) {
    return function(state, action) {
      return Object.keys(reducers).reduce((combined, k) => {
        combined[k] = reducers[k](state[k], action);
        return combined;
      }, {});
    }
  },
  store: function(rootReducer,middlewares={},history_length) {
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
  middlewares: {
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
  element: function(elem,attrs,children) {
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
  initialize: function(app_root,load_screen_root,blueprint,reducers,middlewares) {
    const app_title = blueprint.user.name ? blueprint.user.name : 'Unity Application';
    document.title = `${app_title} | Home`;
    if (!app_root) Unity.terminate(app_root,`No Application Root supplied...`);
    if (!blueprint) Unity.terminate(app_root,`No Blueprint supplied...`);
    if (!!load_screen_root) {console.log(`${app_title} | Killing load screen...`);load_screen_root.style.display='none';};
    console.log(`${app_title} | Killing static application...`);
    app_root.firstElementChild.style.display = 'none';
    const init_state = Unity.combine(reducers);
    const UnityStore = Unity.store(init_state, middlewares);
    Unity.render(Modules.App, UnityStore, App_Root);
    UnityStore.subscribe({name:'Render_App',function:Unity.render,params:[Modules.App,UnityStore,App_Root]});
  },
  terminate: function(app_root,msg) {
    while (app_root.lastChild) app_root.lastChild.remove();
    app_root.appendChild(Unity.element('div',{position:`absolute`,left:0,top:0,bottom:0,right:0,index:1000,background:`linear-gradient(#fff,#eee)`},[msg]));
    throw `[Unity] - ${msg}`;
  }
};

// --------------------------------------------------------------------------------------------
//  Reducers - Functions that initialize state & reduce it on each state change.
// --------------------------------------------------------------------------------------------
const Reducers = {
  appState: function(state=Blueprint.app, action) {
    return Unity.combine({
      aboutState: Unity.reducer(Blueprint.app.about, {}),
      historyState: Unity.reducer(Blueprint.app.history, {
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
        'TOGGLE_NETWORKING_RESEARCH_SUBMENU': (s,a) => ({
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
        'TOGGLE_NETWORKING_RESEARCH_FOOTER_MENU': (s,a) => ({
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
    return Unity.combine({
      networkState: Unity.reducer(Blueprint.device.network, {
        'NET_STATE_CHANGE': (s,a) => a.payload,
        'NET_STATE_INIT': (s,a) => a.payload
      })
    })(state, action);
  },
  userState: function(state=Blueprint.user, action) {
    return Unity.combine({
      infoState: Unity.reducer(Blueprint.user, {})
    })(state, action);
  },
  uiState: function (state=Blueprint.ui, action) {
    return Unity.combine({
      mapState: Unity.reducer(Blueprint.ui.map, {}),
      headerState: Unity.reducer(Blueprint.ui.header, {
        'CHANGE_HEADER_ICON': (s,a) => ({icon: a.payload.icon, title: s.title}),
        'CHANGE_HEADER_TITLE': (s,a) => ({icon: s.icon, title: a.payload.title})
      }),
      menuState: Unity.reducer(Blueprint.ui.menu, {
        'UPDATE_MENU_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload}),
        'NAV_TO': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_MENU': (s,a) => ({current: s.current == 'OPEN' ? 'CLOSED' : 'OPEN', previous: s.current, scrollTop: 0}),
        'OPEN_MENU': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: 0}),
        'CLOSE_MENU': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_THEME': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: a.payload})
      }),
      themeState: Unity.reducer(Blueprint.ui.theme, {
        'TOGGLE_THEME': (s,a) => Object.assign({}, s, {selected: s.selected == 'dark' ? 'light' : 'dark'}),
        'TOGGLE_WP': (s,a) => Object.assign({}, s, Object.assign({}, s.wp, a.payload))
      }),
      viewState: Unity.reducer(Blueprint.ui.view, {
        'NAV_TO': (s,a) => ({current: a.payload, previous: s.current, scrollTop: 0}),
        'UPDATE_VIEW_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload})
      }),
      windowState: Unity.reducer(Blueprint.ui.window, {
        'RESIZE': (s,a) => a.payload
      })
    })(state, action);
  }
};

// --------------------------------------------------------------------------------------------
//  Middlewares - Functions that intercept state changes.
// --------------------------------------------------------------------------------------------
const Middlewares = {
  // logActions: Unity.middlewares.logActions('@@INIT'),
  listenerBypass: Unity.middlewares.listenerBypass({
    'NET_STATE_INIT': ['Render_App'],
    'UPDATE_VIEW_SCROLL': ['Render_App'],
    'UPDATE_MENU_SCROLL': ['Render_App']
  })
};

// --------------------------------------------------------------------------------------------
//  Modules - Important/reused modules, UI, etc.
// --------------------------------------------------------------------------------------------
const Modules = {
  Router: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {mapState,viewState} = state.uiState;
    const {current,previous} = viewState;
    const sameView = viewState.current==viewState.previous;
    const lastActionNav = state.appState.historyState.actions.slice(-1)=='NAV_TO';
    const st = {router: `position:fixed; top:0; right:0; bottom:0; left:0; overflow:hidden; z-index:5;`};
    const selected = mapState.flat[current[0]]?mapState.flat[current[0]]:mapState.flat['DEFAULT'];
    const animation = lastActionNav && !sameView ? `animation:viewSlideIn 250ms 1 forwards;` : ``;
    document.title = `${state.userState.infoState.name} | ${selected[1]}`;
    return Unity.element('div', {style:st.router}, [Modules.View(store,selected[0],animation)]);
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

    const st = {
      net: `
        position: absolute; top: ${lg_dev?'5':'4'}em; left: 0; width: 100%; margin: 0; padding: 0.5em; z-index: 85;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: ${offline?theme.error:theme.success}; border-bottom: ${offline?theme.error:theme.success}; font-size: 1em; color: #252525;
        font-weight: bold; ${display ? `animation: flash_network 1700ms ease-in-out 1 forwards;` : `display: none;`}
      `
    };

    const Net = Unity.element('div', {style:st.net}, [offline?'Offline':'Connected']);

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
    const E = Unity.element;

    const st = {
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

    const header_icon = E('img', {style:st.icon, src: icon_img, alt: headerState.alt}, []);
    header_icon.addEventListener('click', function(event) {
      if (viewState.current[0] != 'HOME') dispatch({type:'NAV_TO',payload:['HOME', 'Home']});
      if (viewState.current[0] == 'HOME' && current == 'OPEN') dispatch({type:'CLOSE_MENU'});
    });

    const superscript = E('sup', {style:st.super}, [viewState.current[1]]);

    const header_menu = E('div', {style:st.header_menu}, [
      ['HOME', 'Home'], ['BLOG', 'Blog'], ['CONTACT_ME', 'Contact Me'], ['ABOUT_ME', 'About Me'], ['ALL_RESEARCH', 'Research']
    ].map((view, i, arr) => {
      const btn = E('h2', {style: i == arr.length-1 ? st.header_qt : st.header_btn}, [view[1]]);
      btn.addEventListener('click', () => {
        if (viewState.current[0] != view[0]) dispatch({type:'NAV_TO',payload:view});
      });
      return btn;
    }));

    const menu_btn = E('img', {style:st.menu_btn, src: menu_img, alt: 'Menu Button Icon'}, []);
    menu_btn.addEventListener('click', function(event) { dispatch({type:'TOGGLE_MENU'}); });

    return E('div', {style:st.header}, [
      E('div', {style:st.header_left}, [ header_icon, superscript ]),
      E('div', {style:st.header_right}, windowState.mode == 'desktop' ? [header_menu, menu_btn] : [menu_btn]),
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
    const E = Unity.element;

    const st = {
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

    const copy = E('div', {style:st.copy}, [
      E('img',{src:icons.sm.usa,alt:`USA Icon`,style:st.usa},[]),
      E('p',{style:st.usa},['United States']),
      E('p',{style:st.copy_txt},['Copyright © 2020 chivington.io']),
    ]);

    const toggle = E('div',{style:st.toggle},[E('h4',{style:st.tgl_txt},[`Toggle dark mode`]),E('div',{style:st.tgl_btn},[E('div',{style:st.slider},[])])]);
    toggle.lastChild.addEventListener('click',()=>dispatch({type:'TOGGLE_THEME',payload:store.getState().uiState.menuState.scrollTop}));

    const submenu = Modules.Submenu(store,{orientation:`PORTRAIT`,btns:mapState.tree});
    const Menu = Unity.element('div',{style:st.menu},[submenu,toggle,copy]);
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
    const E = Unity.element;

    const st = {
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

        const b = E('h3', {style: `${flag ? (i==btns.length-1 ? `${st.sub_btn} border:none;` : st.sub_btn) : st.btn}`}, [btn[1]]);
        b.addEventListener('click', function(event) {
          if (state.uiState.viewState.current[0] != btn[0]) dispatch({type: `NAV_TO`,payload:[btn[0], btn[1]]});
          else if (menuState.current == 'OPEN') dispatch({type:'CLOSE_MENU'});
        });

        if (!!btn[2]) {
          b.style.cssText += `border: none;`;
          const submenu_style = sub_states[btn[0]].current == 'CLOSED' ? `height: 0; visibility: hidden;` : `height: auto; visibility: visible`;
          const dropdown = E('img', {style: `${st.dropdown} ${sub_states[btn[0]].current == 'CLOSED' ? `transform: rotate(-90deg);` : `transform: rotate(-180deg);`}`, src: dark_theme ? icons.btns.caret_wht : icons.btns.caret_blk, alt: 'Sub-Menu Button Icon'}, []);
          dropdown.addEventListener('click', function(event) {
            const selected_sub = b.parentNode.parentNode.children[1];
            sub_states[btn[0]].current = sub_states[btn[0]].current == 'OPEN' ? 'CLOSED' : 'OPEN';
            sub_states[btn[0]].previous = sub_states[btn[0]].current;
            const new_style = sub_states[btn[0]].current == 'CLOSED' ? `height: 0; visibility: hidden;` : `height: auto; visibility: visible`;
            selected_sub.style.cssText = `${st.submenu} ${new_style}`;
            event.target.style.cssText = `${st.dropdown} ${sub_states[btn[0]].current == 'CLOSED' ? `transform: rotate(-90deg);` : `transform: rotate(-180deg);`}`;
          });

          return E('div', {style:st.subnemu_wrapper}, [
            E('div',{style:st.parent_row},[b,dropdown]),E('div',{style:`${st.submenu}${submenu_style}`},create_submenu(btn[2],true))
          ]);
        } else return b;
      })
    };

    return E('div', {style:st.container}, create_submenu(config, false));
  },
  View: function(store,view,animation) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {windowState,viewState,menuState,themeState} = state.uiState;
    const theme = themeState[themeState.selected];
    const {width,height,mode} = windowState;

    const st = {
      view: `
        position:fixed; top:0; right:0; bottom:0; left:0; margin:0; padding:0; overflow-x:hidden; overflow-y:scroll; z-index:10;
        background:linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('${themeState.wp.view}'); background-position:center; background-size:cover; background-repeat:no-repeat;
        ${menuState.current=='OPEN'?'filter:blur(5pt);':''} -webkit-overflow-scrolling:touch; background-color:${theme.view}; ${animation}
      `
    };

    const View = Unity.element('div', {style:st.view,content:`minimal-ui`}, [view(store),Modules.Footer(store)]);
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
  Project: function(store, conf) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { mode } = state.uiState.windowState;
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;
    const { beacon } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      project: `margin:${lg_dev?'7em 2em 5':'5em 1em 3'}em; padding:1em; background-color:${theme.well};`,
      title: `margin:0; padding:0 0 0.5em 0; border-bottom:1pt solid ${theme.view_bdr}; font-size:1.25em; text-align:center; color:${theme.view_txt};`,
      subtitle: `margin:0.75em; padding:0; text-align:center; color:${theme.view_txt};`,
      description: `
        display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:${lg_dev?'space-around':'flex-start'}; align-items:${lg_dev?'center':'stretch'};
        margin:0; padding:0; background-color:${theme.panel}; color:${theme.view_txt}; border:1pt solid ${theme.view_bdr};
      `,
      img: `margin:0; padding:0; border-bottom:1pt solid ${theme.view_bdr}; ${lg_dev?'height:250pt':`width:100%`};`,
      wrapper: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; margin:0; padding:1em;`,
      txt: `margin:0; padding:0.5em 0.25em; text-align:${lg_dev?'left':'center'}; color:${theme.view_txt};`
    };

    const description = E('div', {style:st.description}, [
      E('img', {style:st.img, src:conf.img, alt:`${conf.title} Image`}, []),
      E('div', {style:st.wrapper}, conf.description.map((s,i,a)=>E('p',{style:st.txt},[i==0||i==a.length-1?s:`• ${s}`])))
    ]);

    return E('div',{style:st.project},[
      E('h1',{style:st.title},[conf.title]),E('p',{style:st.subtitle},[conf.subtitle]),description
    ])
  },
  Tiles: function(store,conf) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      component: `display:flex; flex-direction:column; justify-content:space-around; align-items:stretch; margin:0; padding:0.5em; background-color:${theme.well};`,
      title: `margin:0 0.5em; padding:0.25em; border-bottom:1pt solid ${theme.view_bdr}; font-size:1.5em; text-align:center; color:${theme.view_txt};`,
      sub: `margin:0.75em; padding:0; font-size:1em; text-align:center; color:${theme.view_txt};`,
      tiles: `
        display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:${lg_dev?'space-between':'flex-start'}; align-items:${lg_dev?'center':'stretch'};
        margin:${lg_dev?0.5:0.25}em; background-color:${theme.panel}; ${lg_dev?'overflow-x:scroll;':''} border:solid ${theme.view_bdr}; border-width:1pt 0;
        ${lg_dev?`border-right:1.5pt solid ${theme.view_bdr}; padding: 1em;`:''} -moz-box-shadow:inset 0 5px 10px #000000;
      `,
      tile: `display:flex; flex-direction:column; justify-content:flex-start; align-items:center; padding:0; margin:${lg_dev?'0 0.75':0.5}em; background-color:${theme.panel}; border:1pt solid ${theme.view_bdr}; cursor:pointer;`,
      img: `margin:0; ${lg_dev?'height:200pt':`width:100%`}; border-bottom:1pt solid ${theme.view_bdr};`,
      name: `margin:${lg_dev?1:0.75}em; color:${theme.menu_txt}; font-size:1em; font-weight:900; text-align:center; color:${theme.view_txt};`
    };

    const tiles = E('div', {style:st.tiles}, conf.tiles.map((t,i) => {
      const e = E('div',{style:st.tile},[E('img',{style:st.img,src:t[2],alt:`${t[1]} Thumbnail`},[]),E('h3',{style:st.name},[t[1]])]);
      e.addEventListener('click',()=>dispatch({type:'NAV_TO',payload:[t[0],t[1]]})); return e;
    }));

    return E('div', {style:st.component}, [E('h1',{style:st.title},[conf.title]), E('h2',{style:st.sub},[conf.subtitle]), tiles]);
  },
  Footer: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {footerState,windowState,mapState} = state.uiState;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const lg_dev = (windowState.mode == 'large_tab' || windowState.mode == 'desktop');
    const {icons,wp} = Assets.imgs;
    const E = Unity.element;

    const st = {
      footer: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:0; margin:0; z-index:75; background-color:${theme.footer}; border-top:1pt solid ${theme.footer_bdr};`,
      msg: `
        display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; background-color:${theme.panel};
        margin:1em 1em 0; padding:${lg_dev?'2':'1'}em; border:solid ${theme.footer_bdr}; border-width:1pt 0; font-size:1.25em; font-weight:700; text-align:center; color:${theme.menu_txt};
        background:linear-gradient(${theme.panel},${theme.panel}), url('${wp.net}'); background-position:center; background-size:cover; background-repeat:no-repeat;
      `,
      quote_btn: `margin:1em auto 0; padding:0.5em 1em; background-color:${theme.btn}; border:1pt solid ${theme.menu_bdr}; color:${theme.menu_txt}; cursor:pointer;`,
      submenus: `margin:1em; padding:0.5em;`,
      copy: `display:flex; flex-direction:row; justify-content:space-between; align-items:center; text-align:center; border-top:1px solid ${theme.footer_bdr}; margin:0; padding:2em; font-size:1em;`,
      copy_left: `display:flex; flex-direction:row; justify-content:flex-start; align-items:flex-start; padding:0; margin:0;`,
      copy_right: `display:flex; flex-direction:row; justify-content:flex-end; align-items:flex-start; padding:0; margin:0;`,
      usa: `height:1.25em; margin:0; color:${theme.footer_txt};`,
      copy_txt: `font-size:1em; margin:0; color:${theme.footer_txt};`
    };

    // const msg = E('div', {style:st.msg}, [``]);
    const submenus = E('div', {style:st.submenus}, [
      Modules.Submenu(store,{orientation:`LANDSCAPE`,btns:[[...mapState.tree[0],[mapState.tree[1],mapState.tree[2],mapState.tree[3]]],mapState.tree[4]]})
    ]);

    const copy = E('div', {style:st.copy}, [
      E('div', {style:st.copy_left}, [E('p', {style:st.copy_txt}, [`Copyright © 2020 chivington.io`])]),
      E('div', {style:st.copy_right}, [E('img', {src:icons.sm.usa,alt:`USA Icon`,style:st.usa}, ['United States'])])
    ]);

    return E('div', {style:st.footer}, [submenus,copy]);
  },
  App: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { width, height, mode } = state.uiState.windowState;

    const st = {
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

    return Unity.element('div', {style:st.app}, [
      Modules.Header(store), Modules.Menu(store), Modules.Router(store), Modules.Network(store)
    ]);
  }
};

// --------------------------------------------------------------------------------------------
//  Views - Groups Modules to fit device.
// --------------------------------------------------------------------------------------------
const Views = {
  Home: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {appState,userState,uiState} = state;
    const {name,phone,email,directions,employer,title,major,school,bio} = userState.infoState;
    const {windowState,mapState} = uiState;
    const lg_dev = ((windowState.mode=='desktop')||(windowState.mode=='large_tab'))?true:false;
    const landing = ((appState.historyState.views.slice(-1)=='@@INIT')&&(appState.historyState.actions.slice(-1)=='@@INIT'))?true:false;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      home: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:0; width:100%; text-align:center; ${landing?'animation: app_fade_in 900ms ease-in-out 1 forwards;':''}`,
      intro: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:${lg_dev?'8em 1em 2':'6em 1em 2'}em;`,
      name: `margin:0 auto; color:#fff; font-size:4em; font-weight:400;`,
      title: `margin:0.25em; color:#fff; font-size:${lg_dev?1.5:1.3}em; font-weight:300;`,
      actions: `display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:center; align-items:${lg_dev?'center':'stretch'}; margin:0 auto; padding:0; width:${lg_dev?80:90}%;`,
      btn: `margin:0.5em ${lg_dev?'':'auto'}; padding:0.4em 0.6em; width:${lg_dev?50:80}%; background-color:${theme.btn}; border:1pt solid #aaa; cursor:pointer;`,
      bio: `margin:${lg_dev?2:1}em; padding:${lg_dev?`1`:`0.25`}em; border:1px solid ${theme.view_bdr}; background-color:${theme.well};`,
      sentence: `color:${theme.view_txt}; font-size:${lg_dev?1.25:1}em; font-weight:700; margin:0.5em;`,
      research: `margin:${lg_dev?`0 2em 2`:`0 1em 1`}em;`
    };

    const intro = E('div',{style:st.intro},[
      E('h1',{style:st.name},[name]), E('h2',{style:st.title},[`${title} and ${major} Student at ${school}`
    ])]);

    const actions = E('div',{style:st.actions},[['CONTACT_ME','Contact Me'],['ALL_RESEARCH','View My Research']].map((b,i,arr) => {
      const btn = E('h2', {style: st.btn}, [b[1]]); btn.addEventListener('click', (event)=>dispatch({type:'NAV_TO',payload:[b[0], b[1]]})); return btn;
    }));

    const work = E('div',{style:st.bio},bio.work.map(s=>E('p',{style:st.sentence},[s])));

    const tiles = E('div',{style:st.research},[Modules.Tiles(store,{
      title: `Research Areas`,
      subtitle: `All currently active and past research areas.`,
      tiles: mapState.tree[4][2].map(route=>([route[0],route[1],mapState.flat[route[0]][2]]))
    })]);

    return E('div',{style:st.home},[intro,actions,work,tiles]);
  },
  Blog: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {wp,thumbs} = Assets.imgs;
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      blogView:`margin:3.5em auto 3em; padding:1em 0 0 0; width:100%; min-height:100%; display:flex; flex-direction:column; justify-content:flex-start; align-items:center;`,
      viewTitle:`margin:0.75em auto 0.25em; color:${theme.menu_txt};`,
      blogPost:`margin:${lg_dev?1.5:0.5}em; padding:1.25em 0; border:1pt solid ${theme.view_bdr}; background-color:${theme.well}; text-align:center;`,
      blogImg:`border:1px solid ${theme.view_bdr};`,
      blogBody:`margin:${lg_dev?1:0.5}em; display:flex; flex-direction:column; justify-content:space-around; text-align:left;`,
      paragraph:`margin:0.5em 0.25em; text-indent:50px; color:${theme.view_txt};`,
      blogTags:`margin:0 1em; padding:${lg_dev?1:0.5}em; border-top:1pt solid ${theme.view_bdr}; display:flex; flex-direction:row; justify-content:space-around; align-items:center; flex-wrap:wrap;`,
      tag:`margin:0.25em; color:${theme.view_txt};`
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

    return E('div', {style:st.blogView}, [
      E('h1', {style:st.viewTitle}, ['Blog Posts']),
      ...posts.map(post => E('div', {style:st.blogPost}, [
        E('img', {style:st.blogImg, width: '80%', src: post.img[0], alt: post.img[1]}, []),
        E('div', {style:st.blogBody}, post.body.map(p => E('p', {style:st.paragraph}, [p]))),
        E('div', {style:st.blogTags}, post.tags.map(t => E('span', {style:st.tag}, [t])))
      ]))
    ]);
  },
  Contact: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {wp,thumbs} = Assets.imgs;
    const {personal,work,social} = state.userState.infoState;
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      view:`display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%;`,
      contact:`margin:${lg_dev?'7em 2em 5':'5em 1em 3'}em; padding:1em; background-color:${theme.well}; display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
      title:`margin:0 1em; padding:0 0.5em; border-bottom:1pt solid ${theme.view_bdr}; text-align:center; color:${theme.view_txt};`,
      intro:`margin:0; padding:0; text-align:center; color:${theme.view_txt};`,
      sections:`display:flex; flex-direction:column; justify-content:${lg_dev?'space-around':'flex-start'};`,
      section:`margin:${lg_dev?'1':'0.25'}em; padding:0; text-align:center; display:flex; flex-direction:column; justify-content:space-around; align-items:center; color:${theme.view_txt}; font-weight:bold; margin:${lg_dev?1:0.5}em;`,
      row:`display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:${lg_dev?'center':'flex-start'}; align-items:stretch;`,
      sec_ttl:`margin:${lg_dev?`0 0.5em 0 0`:`0.5em 0 0 0`}; padding:0; font-weight:bold; font-size:1em; color:${theme.view_txt};`,
      wrp:`display:flex; flex-direction:${lg_dev?`row`:`column`}; margin:0;`,
      lnk: ` color:#09f; margin: 0 0.5em; text-decorate:underline;`,
      map:`border:1px solid ${theme.footer_bdr}; margin:1em auto; width:95%; height:250pt;`
    };

    return E('div', {style:st.view}, [
      E('div',{style:st.contact},[
        E('h1',{style:st.title},['Get In Touch']),
        E('div',{style:st.sections},[
          E(`div`,{style:st.section},[`Phones`,E(`div`,{style:st.wrp},[E(`a`,{href:`tel:${work.phone}`,target:`_blank`,style:st.lnk},[work.phone]),E(`a`,{href:`tel:${personal.phone}`,target:`_blank`,style:st.lnk},[personal.phone])])]),
          E(`div`,{style:st.section},[`Emails`,E(`div`,{style:st.wrp},[E(`a`,{href:`mailto:${work.email}`,target:`_blank`,style:st.lnk},[work.email]),E(`a`,{href:`mailto:${personal.email}`,target:`_blank`,style:st.lnk},[personal.email])])]),
          E(`div`,{style:st.section},[`Web`,E(`div`,{style:st.wrp},[E(`a`,{href:work.web,target:`_blank`,style:st.lnk},[work.web]),E(`a`,{href:personal.web,target:`_blank`,style:st.lnk},[personal.web])])]),
          E('iframe',{frameborder:'0',style:st.map,allowfullscreen:'',src:work.address[1]},[])
        ])])
      ])
  },
  About: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { wp, thumbs } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const { bio } = state.userState.infoState;
    const E = Unity.element;
    const lg_dev = ((state.uiState.windowState.mode=='desktop')||(state.uiState.windowState.mode=='large_tab'))?true:false;

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%;`,
      about: `margin:${lg_dev?'1em 2em':'0.5em 1em'} 3em; padding:${lg_dev?1:0.25}em; background-color:${theme.well};`,
      title: `margin:${lg_dev?3:2.5}em auto 0.25em; padding:${lg_dev?0.25:0.15}em; border-bottom:1pt solid ${theme.view_bdr}; text-align:center; color:${theme.menu_txt};`,
      intro: `margin:0.5em; padding:0; text-align:center; color:${theme.view_txt};`,
      bio: `margin:1em 0 0; padding:0;`,
      section: `margin:1.5em 1em 1em; padding:0;`,
      sec_ttl: `margin:0 0 0.5em; padding:0 1em 0.5em; font-size:1em; color:${theme.view_txt}; border-bottom:1pt solid ${theme.menu_bdr};`,
      txt: `margin:0 0.5em; padding:0; color:${theme.view_txt};`,
      sentence: `margin:0.25em; color:${theme.view_txt};`
    };

    const title = E('h1', {style:st.title}, ['About Me']);

    const intro = E('p', {style:st.intro}, [`intro`]);

    const full_bio = E('div', {style:st.bio}, Object.keys(bio).map(section => E('div', {style:st.section}, [
      E('h2', {style:st.sec_ttl}, [`${section.toUpperCase()} HISTORY`]),
      ...bio[section].map((sentence, i) => E('span', {style: `${st.sentence} ${i==0?'margin-left:1em;':''}`}, [sentence]))
    ])));

    return E('div', {style:st.view}, [
      title,
      E('div', {style:st.about}, [full_bio])
    ]);
  },
  All_Research: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%; padding:6em 1em 3em;`
    };

    const tiles = Modules.Tiles(store,{
      title: `All Research Areas`,
      subtitle: `Choose an area to see specific projects.`,
      tiles: state.uiState.mapState.tree[4][2].map(route=>([route[0],route[1],state.uiState.mapState.flat[route[0]][2]]))
    });

    return Unity.element('div', {style:st.view}, [tiles]);
  },
  AI_Research: function(store) {
    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%;`
    };

    const conf = {
      title: `Artificial Intelligence Research`,
      subtitle: `Vision-based mapping and controls systems; attention mechanisms.`,
      img: Assets.imgs.thumbs.ai,
      description: [
        `My current Artificial Intelligence and Machine Learning research is focused in:`,
        `Computer Vision: classification, object detection, tracking, vision-based 3D environment mapping; for use in controls applications.`,
        `Sequence Learning and Attention: researching RNN & LSTM implementations first principles to develop a better understanding of GANs and Transformers; for future research of more "genenal" intelligences.`,
        `Machine Learning: auditing CSE 546 at University of Washington; taking Convex Optimization certificate course through Stanford on Edx; for deeper statistical foundational ML/AI knowledge.`
      ],idx: 0
    };

    return Unity.element('div', {style:st.view}, [Modules.Project(store,conf)]);
  },
  Networking_Research: function(store) {

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%;`
    };

    const conf = {
      title: `Networking Research`,
      subtitle: `Distributed computing applications`,
      img: Assets.imgs.thumbs.iot,
      description: [
        `My current Networking research focuses on:`,
        `Building fast, efficient proprietary file servers, proxies, load balancers, traffic monitors, etc. to manage my own cloud resources and sesrvices.`,
        `Remote data acquisition and controls systems running on embedded/real-time targets. Particularly, I've been focuse on optimizing a MicroPython runtime on the ESP8266/ESP32 SoC's, which have full HTTP and BLE directly on the chip, 16 GPIO pins, and is about the size of a quarter.`
      ]
    };

    return Unity.element('div', {style:st.view}, [Modules.Project(store,conf)]);
  },
  CPU_Achitecture_Research: function(store) {

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%;`
    };

    const conf = {
      title: `Embedded Research`,
      subtitle: `General computer architectures.`,
      img: Assets.imgs.thumbs.mcu,
      description: [
        `My current Embedded research focuses on:`,
        `Studying Computer Architecture through a course that culminates in the design of a 16-bit machine from first principles with NAND gates.`
      ]
    };

    return Unity.element('div', {style:st.view}, [Modules.Project(store,conf)]);
  },
  UI_Research: function(store) {
    E = Unity.element;

    const st = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`,
      txt: `color: #fff`,
      lnk: ` color:#09f; margin: 0 0 0 0.5em; text-decorate:underline;`
    };

    const conf = {
      title: `UI Architectures Research`,
      subtitle: `Modular, portable, complex UI architectures.`,
      img: Assets.imgs.thumbs.ui,
      description: [
        `My current interface research focuses on creating highly complex UI architectures that:`,
        `Can be ported to any programming language.`,
        `Can be replicated, scaled and deployed rapidly.`,
        `Can run on any target but are optimized for web and embedded/real-time targets, where resources are constrained.`,
        E(`p`,{style:st.txt},[
          `• This web application is an example of such a design that uses "vanilla" Javascript. View the source on`,
          E(`a`,{style:st.lnk,href:`https://github.com/chivington/chivington.github.io`,target:`_blank`},[`Github`])
        ])
      ]
    };

    return Unity.element('div', {style:st.view}, [Modules.Project(store,conf)]);
  }
};

// --------------------------------------------------------------------------------------------
//  Asset Manifest - Everything needed to cache app.
// --------------------------------------------------------------------------------------------
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
      qualys: '/imgs/thumbs/qualys.png',
      plot: '/imgs/thumbs/plot.png',
      linear: '/imgs/thumbs/linear.jpg',
      logistic: '/imgs/thumbs/logistic.jpg',
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

// --------------------------------------------------------------------------------------------
//  Blueprint - Specifies inital app state.
// --------------------------------------------------------------------------------------------
const Blueprint = {
  app:{
    about:{
      '@@ACTIONS':{}
    },
    history:{
      '@@ACTIONS':{
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
        'TOGGLE_NETWORKING_RESEARCH_SUBMENU': (s,a) => ({
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
        'TOGGLE_NETWORKING_RESEARCH_FOOTER_MENU': (s,a) => ({
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
  device:{
    network:{
      '@@ACTIONS':{
        'NET_STATE_CHANGE': (s,a) => a.payload,
        'NET_STATE_INIT': (s,a) => a.payload
      },
      downlink: navigator.connection ? navigator.connection.downlink : 10,
      effectiveType: navigator.connection ? navigator.connection.effectiveType : 'Connecting...',
      previousType: '@@INIT'
    },
    battery: 100
  },
  user:{
    name:'Johnathan Chivington',
    employer:`University of Washington`,
    title:`Fiscal Analyst`,
    school:`University of Washington`,
    major:`Physics`,
    work:{
      address:['185 Stevens Way Paul Allen Center Seattle, WA 98195-2500', 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10750.402713483165!2d-122.3059001!3d47.6533262!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x12de8b2d1ad8504a!2sPaul%20G.%20Allen%20Center%20for%20Computer%20Science%20%26%20Engineering!5e0!3m2!1sen!2sus!4v1589709435841!5m2!1sen!2sus'],
      email:'johnchiv@uw.edu',
      phone:'206.897.1407',
      web: `https://github.com/chivington`
    },
    personal:{
      address:['16th Ave NE Seattle, WA', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2684.205290399708!2d-122.3148723486745!3d47.71926458807909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490116804741175%3A0x9881011855bc85e5!2s12499-12355%2015th%20Ave%20NE%2C%20Seattle%2C%20WA%2098125!5e0!3m2!1sen!2sus!4v1585209347943!5m2!1sen!2sus'],
      email:'john@chivington.io',
      phone:'303-900-2861',
      web:'https://chivington.io'
    },
    social:{
      facebook:'https://facebook.com/jt.chivington',
      github:'https://github.com/chivington',
      linkedin:'https://linkedin.com/in/johnathan-chivington',
      twitter:'https://twitter.com/jt_chivington'
    },
    bio:{
      work: [
        `I'm currently a Fiscal Analyst at the University of Washington in the Department of Electrical & Computer Engineering, supporting a diverse portfolio of research faculty in Grant & Contract Management.`,
        `My professional background has been primarily in finance, business development and sales management, and my personal background is in Computer Science with extensive experience in Machine Learning & Artificial Intelligence, Networked Embedded Real-Time Data Acquisition & Controls Systems, and User Interface Architectures.`,
        `This summer, I'm excited to begin taking courses at UW while transitioning into a part-time role supporting a team working on a large Power Electronics research project in ECE.`,
        `I'm working towards a Physics/Math double-major undergraduate degree at UW and my future endeavours will build on my CS/EE work, as well as move into the areas of MEMS/NEMS systems, quantum optics & quantum computation, biophysical interactions, and other micro/nano-scale physical systems.`
      ],
      education: [
        `For Spring 2020, I'm auditing CSE 546 "Machine Learning" at the University of Washington and working through online courses in Convex Optimization and Computer Architecture in my spare time, as able.`,
        `For Summer 2020, I'm excited to take my first classes at UW (MATH 125 & PHYS 121), while also serving in a support capacity for a large Power Electronics research project in ECE at UW.`,
        `My goal is to continue my undergraduate studies at UW while taking on research positions in ECE as able in an effort to both increase my hands-on research experience as well as to be helpful wherever I can within the department.`,
        `After graduation, I intend to continue into a graduate program at UW and to continue working in various research and teaching capacities for the forseeable future, attempting to bring as much value as I can to the awesome, hardworking teams there.`
      ],
      personal: [
        `My "career" goals are also very personal to me, so I tend to spend most of my spare time pursuing those. I've tried to center my career goals around helping people so it's easy to incorporate that work into everyday life without it feeling like work.`,
        `When we're not terribly busy and/or quarantined by a global pandemic, my girlfriend and I also like to go hiking, kayaking, walking our dog, etc. This summer we're working on greenhouse to grow our own produce year-round and to grow more exotic plants.`
      ]
    }
  },
  ui:{
    '@@ACTIONS':{},
    map:{
      flat:{
        'HOME': [Views.Home,'Home',Assets.imgs.thumbs.ai],
        'BLOG': [Views.Blog,'Blog',Assets.imgs.thumbs.ai],
        'CONTACT_ME': [Views.Contact,'Contact Me',Assets.imgs.thumbs.ai],
        'ABOUT_ME': [Views.About,'About Me',Assets.imgs.thumbs.ai],
        'ALL_RESEARCH': [Views.All_Research,'All Research',Assets.imgs.thumbs.ai],
        'ARTIFICIAL_INTELLIGENCE_RESEARCH': [Views.AI_Research,'Artificial Intelligence Research',Assets.imgs.thumbs.ai],
        'NETWORKING_RESEARCH': [Views.Networking_Research,'Wireless Embedded Research',Assets.imgs.thumbs.iot],
        'COMPUTER_ARCHITECTURE': [Views.CPU_Achitecture_Research,'Computer Architecture Research',Assets.imgs.thumbs.mcu],
        'UI_ARCHITECTURES_RESEARCH': [Views.UI_Research,'UI Architectures Research',Assets.imgs.thumbs.ui],
        'DEFAULT': [Views.Home,'Home',Assets.imgs.thumbs.ai]
      },
      tree: [
        ['HOME','Home'],
        ['BLOG','Blog'],
        ['CONTACT_ME','Contact Me'],
        ['ABOUT_ME','About Me'],
        ['ALL_RESEARCH','All Research', [
          ['ARTIFICIAL_INTELLIGENCE_RESEARCH','Artificial Intelligence Research'],
          ['NETWORKING_RESEARCH','Embedded Research'],
          ['COMPUTER_ARCHITECTURE','Computer Architecture Research'],
          ['UI_ARCHITECTURES_RESEARCH','UI Architectures Research']
        ]]
      ],
      tre: [
        ['HOME'],
        ['BLOG'],
        ['CONTACT_ME'],
        ['ABOUT_ME'],
        ['ALL_RESEARCH', [['ARTIFICIAL_INTELLIGENCE_RESEARCH'],['NETWORKING_RESEARCH'],['COMPUTER_ARCHITECTURE'],['UI_ARCHITECTURES_RESEARCH']]]
      ]
    },
    theme:{
      selected: 'dark',
      dark:{
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
      light:{
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
      wp:{view:Assets.imgs.wp.pnw}
    },
    window:{
      width: window.innerWidth,
      height: window.innerHeight,
      mode: window.innerWidth < 600 ? 'mobile' : (
        window.innerWidth < 750 ? 'small_tab' : (window.innerWidth < 900 ? 'large_tab' : 'desktop')
      )
    },
    header:{
      '@@ACTIONS':{
        'CHANGE_HEADER_ICON': (s,a) => ({icon: a.payload.icon, title: s.title}),
        'CHANGE_HEADER_TITLE': (s,a) => ({icon: s.icon, title: a.payload.title})
      },
      icon: Assets.imgs.icons.manifest.favicon,
      alt: 'chivington.io Icon',
      menu_btn: Assets.imgs.icons.btns.menu
    },
    menu:{
      '@@ACTIONS':{
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
    view:{
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

// --------------------------------------------------------------------------------------------
//  Initialization - Initialize application with Blueprint & Asset Manifest.
// --------------------------------------------------------------------------------------------
const App_Root = document.getElementById('App_Root');
const Load_Screen_Root = document.getElementById('Load_Screen_Root');
Unity.initialize(App_Root,Load_Screen_Root,Blueprint,Reducers,Middlewares);
