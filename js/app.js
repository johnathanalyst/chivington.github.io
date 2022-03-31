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
    const { logActions, listenerBypass, cacheChat } = middlewares;
    let state = {}, listeners = [], history = [];

    function getState() { return state; }
    function getHistory() { return history; }

    function dispatch(action) {
      if (logActions) logActions('before', state, action);
      if (!!history_length) history = (history.length == history_length) ? [...history.slice(1), state] : [...history, state];
      state = rootReducer(state, action);
      if (logActions) logActions('after', state, action);

      if (!!cacheChat.status && action.type !== '@@INIT') cacheChat.updateCache(state.userState.chatState);

      if (listenerBypass && listenerBypass(action.type)[0])
        listeners.forEach(listener => listenerBypass(action.type).forEach(bypassName => {
          if (bypassName != listener.name) listener.function(...listener.params);
        }));
      else listeners.forEach(listener => listener.function(...listener.params));
    }

    function subscribe(listener) {
      listeners.push(listener);
      return () => { listeners = listeners.filter(l => l !== listener); }
    }

    dispatch({type:'@@INIT'});
    state = !!cacheChat.status ? cacheChat.initCache(state) : state;
    return { getState, getHistory, dispatch, subscribe };
  },
  middlewares: {
    logActions: function(initAction = '') {
      return function(stage, state, action) {
        if  (action.type != initAction) {
          if (stage == 'before') {
            console.log('\n%cPrevious State: ', 'font-weight: bold; color: #0b0;', state);
            console.log(`Action Dispatched: %c'${action.type}'`, 'color: #e00;');
            console.log(`Action Payload: `, action.payload);
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
    },
    cacheChat: function(cache_name) {
      if (!!cache_name && !!window.localStorage) {
        return {
          status: true,
          initCache: function(built_state) {
            const cache_check = localStorage.getItem(cache_name);
            if (!!cache_check) built_state.userState.chatState = JSON.parse(cache_check);
            return built_state;
          },
          updateCache: function(data) {
            localStorage.setItem(cache_name, JSON.stringify(data));
          }
        }
      } else return { status: false }
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
//  Modules - Important/reused widgets, UI, etc.
// --------------------------------------------------------------------------------------------
const Modules = {
  Router: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {mapState,viewState} = state.uiState;
    const {current,previous} = viewState;
    const sameView = viewState.current==viewState.previous;
    const lastAction = state.appState.historyState.actions.slice(-1)[0];
    const animateActions = ['BEGIN_THREAD', 'DELETE_THREAD', 'DELETE_THREADS'];
    const st = {router: `position:fixed; top:0; right:0; bottom:0; left:0; overflow:hidden; z-index:5;`};
    const selected = mapState[current]?mapState[current]:mapState['DEFAULT'];
    const animation = (lastAction=='NAV_TO' && !sameView || animateActions.includes(lastAction)) ? `animation:viewSlideIn 250ms 1 forwards;` : ``;
    document.title = `${state.userState.infoState.name} | ${selected.title}`;
    return Unity.element('div', {style:st.router}, [Modules.View(store, selected.view, animation)]);
  },
  Header: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { uiState } = state;
    const { viewState, menuState, windowState } = uiState;
    const { icons } = Assets.imgs;
    const { current, previous } = menuState;
    const dark_theme = uiState.themeState.selected == 'dark';
    const icon_img = dark_theme ? icons.manifest.favicon_wht : icons.manifest.favicon;
    const menu_img = dark_theme ? (current == 'OPEN' ? icons.btns.close_wht : icons.btns.menu_wht)  : (current == 'OPEN' ? icons.btns.close_blk : icons.btns.menu_blk);
    const last_action = state.appState.historyState.actions.slice(-1)[0];
    const open_action = !!(previous == 'CLOSED' && current == 'OPEN');
    const close_action = !!(previous == 'OPEN' && current == 'CLOSED');
    const menu_action = !!(last_action == 'OPEN_MENU' || last_action == 'CLOSE_MENU' || last_action == 'TOGGLE_MENU');
    const lg_dev = (windowState.mode == 'pc' || windowState.mode == 'lg_tab');
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      header: `
        position: fixed; top: 0; left: 0; width: 100%; height: ${lg_dev?'5':'4'}em; margin: 0; padding: 0; z-index: 90;
        display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        background-color: ${theme.header}; border-bottom: 1pt solid ${theme.header_bdr}; -webkit-box-shadow: 1pt 1pt ${dark_theme?'2':'5'}pt 0 ${theme.header_bdr};
      `,
      header_left: `display: flex; flex-direction: row; justify-content: flex-start; align-items: center;`,
      header_right: `display: flex; flex-direction: row; justify-content: flex-end; align-items: center;`,
      icon: `margin: 0 0 0 1em; padding: 0; height: 4em; width: 4em; cursor:pointer;`,
      super: `font-size: 0.9em; color: ${theme.header_txt}; margin: -1.25em 0 0 0.25em;`,
      menu_btn: `margin: 1em 1.5em; height: 2.5em; width: 2.5em; cursor:pointer; ${open_action ? `animation: menu_btn_opening 300ms ease-in-out 1 forwards;` : (close_action ? (last_action==`REFRESH_THREADS`?``:`animation: menu_btn_closing 300ms ease-in-out 1 forwards;`) : ``)}`,
      header_menu: `display: flex; flex-direction: row; justify-content: center; align-items: center; flex-wrap: wrap; margin: 0; padding: 0;`,
      header_btn: `margin: 0 0.25em; padding: 0.5em 1em; font-size: 1em; text-align: center; color: ${theme.view_txt}; cursor: pointer;`,
      header_qt: `margin: 0 0.25em; padding: 0.5em 1.25em; font-size: 1em; text-align: center; color: ${theme.menu_txt}; background-color: ${theme.btn}; border: 1pt solid ${theme.menu_bdr}; cursor: pointer;`
    };

    const header_icon = E('img', {style:st.icon, src: icon_img, alt: `Header Icon`}, []);
    header_icon.addEventListener('click', function(event) {
      if (viewState.current != 'HOME') dispatch({type:'NAV_TO',payload:'HOME'});
      if (viewState.current == 'HOME' && current == 'OPEN') dispatch({type:'CLOSE_MENU'});
    });

    const superscript = E('sup', {style:st.super}, [state.uiState.mapState[viewState.current].title]);

    const routes = Object.keys(state.uiState.mapState).filter(k => !['CHAT','LOGIN','STAGING','DEFAULT'].includes(k));
    const header_menu = E('div', {style:st.header_menu}, routes.map((route, i, arr) => {
      const map_route = state.uiState.mapState[route];
      const btn = E('h2', {style:st.header_btn}, [map_route.title]);
      // const btn = E('h2', {style: i > arr.length-2 ? st.header_qt : st.header_btn}, [route]);
      btn.addEventListener('click', () => { if (viewState.current != route) dispatch({type:'NAV_TO',payload:route}); });
      return btn;
    }));

    const menu_btn = E('img', {style:st.menu_btn, src: menu_img, alt: 'Menu Button Icon'}, []);
    menu_btn.addEventListener('click', function(event) { dispatch({type:'TOGGLE_MENU'}); });

    return E('div', {style:st.header}, [
      E('div', {style:st.header_left}, [ header_icon, superscript ]),
      E('div', {style:st.header_right}, windowState.mode == 'pc' ? [header_menu, menu_btn] : [menu_btn]),
    ]);
  },
  Menu: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {menuState,windowState,themeState,mapState} = state.uiState;
    const dark_theme = themeState.selected=='dark';
    const {icons} = Assets.imgs;
    const menuWidth = ((windowState.mode=='pc')||(windowState.mode=='lg_tab'))?`35%`:`100%`;
    const current_view = state.uiState.viewState.current;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const last_action = state.appState.historyState.actions.slice(-1);
    const closed_menu_last = !!(last_action=='CLOSE_MENU'||last_action=='TOGGLE_MENU');
    const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;
    const E = Unity.element;

    const st = {
      menu: `
        position:fixed; top:${landscape?'5':'4'}em; left:0; bottom:0; width:${menuWidth}; padding:0; z-index:80; background-color:${theme.menu}; overflow-y:scroll; ${landscape?`border-right:1pt solid ${theme.menu_bdr};`:''}
        ${(menuState.current=='OPEN')?(menuState.previous=='OPEN'?``:`animation:menu_opening 300ms ease-in-out 1 forwards;`):(closed_menu_last?`animation:menu_closing 300ms ease-in-out 1 forwards;`:`display:none;`)}
      `,
      submenu: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:2em 0 0; padding:0;`,
      route: `display:flex; flex-direction:row; justify-content:center; align-items:center; margin:1em; padding:0; color:${theme.lt_txt};`,
      route_title: `margin:0; padding:0; font-size:1.5em; color:${theme.lt_txt}; border-bottom:1pt solid ${theme.menu_bdr};`,
      toggle: `display:flex; flex-direction:row; justify-content:center; align-items:center; margin:2em; padding:0;`,
      tg_txt: `margin:0; padding:0; color:${theme.lt_txt}`,
      tg_btn: `margin:1em; padding:${dark_theme?'0 1.5em 0 0':'0 0 0 1.5em'}; background-color:${theme.panel}; border:1.25pt solid ${dark_theme?theme.success:theme.menu_bdr}; border-radius:1.5em; cursor:pointer;`,
      slider: `height:1.5em; width:1.5em; margin:0; padding:0; background-color:${dark_theme?theme.success:theme.btn}; border-radius:100%;`,
      copy: `
        display:flex; flex-direction:column; justify-content:space-between; align-items:stretch; text-align:center; color:${theme.menu_bdr};
        border-top:1px solid ${theme.menu_bdr}; margin:1em ${landscape?'5em 5':'2em 2em 1'}em; padding:1.5em; font-size:${landscape?'1':'0.9'}em;
      `,
      usa: `height:1.5em; margin:0.25em; font-size:1.1em; color:${theme.menu_txt};`,
      copy_txt: `font-size:1.1em; margin:0; color:${theme.menu_txt};`
    };

    const routes = Object.keys(state.uiState.mapState).filter(k => !['CHAT','LOGIN','STAGING','DEFAULT'].includes(k));
    const submenu = E('div', {style:st.submenu}, routes.map(r => {
      const route = E('div', {style:st.route}, [E('h2', {style:st.route_title}, [state.uiState.mapState[r].title])]);
      route.addEventListener('click', e => dispatch({type:'NAV_TO', payload:r}));
      return route;
    }));

    const copy = E('div', {style:st.copy}, [
      E('img',{src:icons.work.usa,alt:`USA Icon`,style:st.usa},[]),
      E('p',{style:st.usa},['United States']),
      E('p',{style:st.copy_txt},['Copyright © 2021 chivington.net']),
    ]);
    copy.firstChild.addEventListener('click',e=>dispatch({type:`NAV_TO`,payload:`LOGIN`}));

    const toggle = E('div',{style:st.toggle},[E('h4',{style:st.tg_txt},[`Toggle dark mode`]),E('div',{style:st.tg_btn},[E('div',{style:st.slider},[])])]);
    toggle.lastChild.addEventListener('click',()=>dispatch({type:'TOGGLE_THEME',payload:store.getState().uiState.menuState.scrollTop}));

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
  View: function(store,view,animation) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {windowState,viewState,menuState,themeState} = state.uiState;
    const theme = themeState[themeState.selected];
    const {width,height,mode} = windowState;

    const st = {
      view:`
        position:fixed; top:0; right:0; bottom:0; left:0; margin:0; padding:0; overflow-x:hidden; overflow-y:scroll; z-index:10;
        background:linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('${themeState.wp.view}'); background-position:center; background-size:cover; background-repeat:no-repeat;
        ${menuState.current=='OPEN'?'filter:blur(5pt);':''} -webkit-overflow-scrolling:touch; background-color:${theme.view}; ${animation}
      `
    };

    const View = Unity.element('div', {style:st.view,content:`minimal-ui`}, [view(store), Modules.Footer(store)]);
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
  Footer: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {footerState,windowState,mapState} = state.uiState;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const lg_dev = (windowState.mode == 'lg_tab' || windowState.mode == 'pc');
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

    // add menus

    const copy = E('div', {style:st.copy}, [
      E('div', {style:st.copy_left}, [E('p', {style:st.copy_txt}, [`Copyright © 2021 chivington.net`])]),
      E('div', {style:st.copy_right}, [E('img', {src:icons.work.usa,alt:`USA Icon`,style:st.usa}, ['United States'])])
    ]);
    copy.lastChild.addEventListener('click',e=>dispatch({type:`NAV_TO`,payload:`STAGING`}));

    return E('div', {style:st.footer}, [copy]);
  },
  Selector: function(store, selections, selected, orientation, btn_position, shadow, init_scroll) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const { windowState, uiState } = state;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;
    const lg_dev = ((uiState.windowState.mode=='pc')||(uiState.windowState.mode=='lg_tab'))?true:false;

    const st = {
      selector: (orientation == 'LANDSCAPE'
        ? `display:flex; flex-direction:row; justify-content:center; align-items:center;`
        : `display:flex; flex-direction:column${btn_position=='top'?'':'-reverse'}; justify-content:flex-start; align-items:stretch;`)
        + `position:absolute; width:99%; height:99%; margin:0 auto; padding:0; overflow-x:hidden; overflow-y:hidden; border:1pt solid ${theme.menu_bdr}; ${shadow?'-webkit-box-shadow: 0 3pt 4pt 0 ${theme.shadow};':''}`
      ,
      displays: (orientation == 'LANDSCAPE'
        ? `display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; margin:0.5em;`
        : `display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; margin:0.5em auto;`)
        + `width:98%; height:100%; margin:0 auto; padding:0; overflow-x:hidden; overflow-y:hidden;`
      ,
      display: `width:99%; margin:0 auto; padding:0; overflow-x:hidden; overflow-y:scroll;`,
      btns: (orientation == 'LANDSCAPE'
        ? `display:flex; flex-direction:column; justify-content:flex-start; align-items:center; overflow-x:hidden; overflow-y:scroll; border-right:1pt solid ${theme.view_bdr}; width:30%; height:100%; padding:0 0.1em 0.1em 0; margin:0 auto;`
        : `display:flex; flex-direction:row; justify-content:flex-start; align-items:stretch; width:98%; overflow-x:scroll; overflow-y:hidden; border-bottom:1pt solid ${theme.view_bdr}; box-shadow:inset -20px 0 25px -5px ${theme.shadow}; padding:0.25em 0.1em 0.35em 0; margin:0 auto 0.35em;`)
      ,
      btn: (orientation == 'LANDSCAPE'
        ? `margin:0.2em 0.5em 0; width:90%;`
        : `margin:0 0.15em 0 0;`)
        + `height:1em; padding:0.4em 0.6em; background-color:${theme.btn}; border:1pt solid ${theme.btn_bdr}; color:${theme.lt_txt}; cursor:pointer; text-align:center; overflow:hidden;`
    };

    const displays = E('div', {style:st.displays}, selections.map(s => E('div', {style:`${st.display} ${s.name!=selected?'display:none;':''}`}, [s.contents])));
    window.setTimeout(n => {
      for (let i=0; i<displays.children.length; i++) displays.children[i].scrollTop = init_scroll.display == null ? displays.children[i].scrollHeight : init_scroll.display;
    }, 0);

    const btns = E('div', {style:st.btns}, selections.map(s => {
      b = E('div', {style:`${st.btn} ${s.name==selected?`border:1pt solid ${theme.lt_txt}; background-color:${theme.well}; width:${s.name.length/2}em;`:''}`}, [s.name]);
      b.addEventListener('click', (event) => dispatch({type: s.action, payload: s.payload}));
      return b;
    }));
    window.setTimeout(n => {
      if (orientation=='PORTRAIT') btns.scrollLeft = init_scroll.btns == null ? 0 : init_scroll.btns;
      else btns.scrollTop = init_scroll.btns == null ? 0 : init_scroll.btns;
    }, 0);

    return E('div', {style:st.selector}, [btns, displays]);
  },
  Portfolio: function(store, config) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const { windowState, uiState } = state;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;
    const lg_dev = ((uiState.windowState.mode=='pc')||(uiState.windowState.mode=='lg_tab'))?true:false;
    const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;
    const txt_color = uiState.themeState.selected=='dark' ? theme.lt_txt : theme.dk_txt;
    const { projects, bdr, bg } = config;

    const st = {
      Portfolio: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:5em 10em; background-color:${bg?theme.panel_drk:theme.clear};`,
      project: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0; border:1px solid ${bdr?theme.view_bdr:theme.clear}; background-color:${theme.panel_lt};`,
      banner: `display:flex; flex-direction:column; justify-content:center; align-items:center; width:95%; margin:2em auto;`,
      banner_img: `margin:0; width:100%; border-radius:7px;`,
      title: `font-size:2em; font-weight:bold; margin:0.25em auto; text-align:center; color:${txt_color};`,
      summary: `font-size:1em; margin:0.25em ${lg_dev?'2em':''}; text-align:center; color:${txt_color};`,
      links: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0.25em auto; width:80%; border-top:0.5pt solid ${theme.view_bdr};`,
      link: `color:${theme.link}; margin: 0.25em auto; text-align:center; text-decorate:underline; overflow-wrap:anywhere; word-break:break-all;`,
      sections: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:2em 0;`,
      section: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:${landscape?'2em':0};`,
      section_title: `font-size:1.5em; font-weight:bold; margin:0.5em 0.75em 0; text-align:center; color:${txt_color}; border-bottom:1px solid ${theme.view_bdr};`,
      section_summary: `font-size:1em; margin:0.5em 1.5em; text-align:center; color:${txt_color};`,
      sub_section: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0.75em auto;`,
      content: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0;`,
      content_imgs: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0.5em auto;`,
      content_img: `width:${lg_dev?60:90}%; margin:0.5em auto;`,
      video: `height:20em;`,
      content_txt: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0 auto;`,
      content_links: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0 auto;`,
      txt: `font-size:1em; margin:0.25em auto; color:${txt_color};`
    };

    const Portfolio = E('div', {style:st.Portfolio}, projects.map(p => {
      const w = landscape?p.banner.w[0]:p.banner.w[1];
      const banner = E('div', {style:`${st.banner} width:${w}%;`}, [
        E('img', {src:p.banner.src, alt:`${p.title} Banner`, style:st.banner_img}, [])
      ]);
      const title = E('h2', {style:st.title}, [p.title]);
      const summary = E('p', {style:st.summary}, [p.summary]);

      const sections = E('div', {style:st.sections}, p.sections.map(s => {
        const section_title = E('h3', {style:st.section_title}, [s.title]);
        const section_summary = E('p', {style:st.section_summary}, [s.summary]);
        const section_media = [];
        for (i=0; i<s.content.length; i++) {
          for (j=0; j<s.content[i].media.length; j++) {
            const media_src = s.content[i].media[j];
            const media_title = media_src.split('-').join(' ');
            section_media.push({src:media_src, title:media_title});
          };
        };
        const section_slides = Modules.Slideshow(store, {media:section_media, bdr:false, bg:true, def:0});

        const section_content = E('div', {style:st.content}, s.content.map(c => {
          const txt = E('div', {style:st.content_txt}, c.txt.map(ln => E('p', {style:`${st.txt} text-align:${ln.align}; margin:0 1em 0.75em;`}, [ln.line])));
          const links = E('div', {style:st.content_links}, Object.keys(c.links).map(k =>
			E(`a`,{href:c.links[k], target:`_blank`, style:`${st.link} margin:0 1em;`}, [k.split('_').join(' ')])
		  ));
          return E('div', {style:st.sub_section}, [txt, links]);
        }));
        return E('div', {style:st.section}, [section_title, section_summary, section_slides, section_content]);
      }));

      return E('div', {style:st.project}, [banner, title, summary, sections]);
    }));

    return Portfolio;
  },
  Slideshow: function(store, config) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const { windowState, uiState } = state;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;
    const lg_dev = ((uiState.windowState.mode=='pc')||(uiState.windowState.mode=='lg_tab'))?true:false;
    const { media, bdr, bg, def } = config;
    const { left_arrow, right_arrow } = state.uiState.imgState.icons.btns;

    const st = {
      Slideshow: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0; background-color:${bg?theme.panel_drk:theme.clear}; border:1px solid ${bdr?theme.view_bdr:theme.clear};`,
      display: `display:flex; flex-direction:row; justify-content:space-between; align-items:stretch; margin:0; width:100%; border-bottom:1px solid ${theme.view_bdr}; background-color:${theme.panel_lt};`,
      img: `margin:0 auto; max-height:${lg_dev?35:15}em; max-width:100%;`,
      btns: `display:flex; flex-direction:column; justify-content:center; align-items:center; width:${lg_dev?3:2}em; z-index:10; cursor:pointer; background-color:${theme.panel_lt};`,
      l_btn: `margin:0 -${lg_dev?5:2}em 0 0; border-right:1px solid ${theme.panel_drk};`,
      r_btn: `margin:0 0 0 -${lg_dev?5:2}em; border-left:1px solid ${theme.panel_drk};`,
      thumbs: `display:flex; flex-direction:row; justify-content:flex-start; align-items:center; margin:0; overflow-x:scroll; background-color:${theme.panel_lt};`,
      thumb: `height:7em; margin:0.1em; cursor:pointer; background-color:${theme.panel_lt}; border-right:1px solid ${theme.view_bdr};`
    };

    const media_elems = media.map(m => {
      const filetype = m.src.split('.')[1];
      if (filetype == 'mp4') return E('video', {style:st.img, controls:'controls', name:m.title, alt:`${m.title} Video`}, [E('source', {src:m.src, type:'video/mp4'}, [])]);
      else return E('img', {src:m.src, alt:`${m.title} Image`, style:st.img}, []);
    });

    let selected_img = def;
    const display = E('div', {style:st.display}, [
      E('div', {style:`${st.btns} ${st.l_btn}`}, [E('img', {src:left_arrow, alt:`Left Arrow Image`, style:'width:100%;'}, [])]),
      media_elems[selected_img],
      E('div', {style:`${st.btns} ${st.r_btn}`}, [E('img', {src:right_arrow, alt:`Right Arrow Image`, style:'width:100%;'}, [])])
    ]);

    display.firstChild.addEventListener('click', function(event) {
      selected_img = selected_img == 0 ? media_elems.length-1 : selected_img-1;
      display.replaceChild(media_elems[selected_img].cloneNode(true), display.childNodes[1]);
    });

    display.lastChild.addEventListener('click', function(event) {
      selected_img = selected_img == media_elems.length-1 ? 0 : selected_img+1;
      display.replaceChild(media_elems[selected_img].cloneNode(true), display.childNodes[1]);
    });

    const play = E('img', {src:'/imgs/thumbs/play-button.png', alt:`Video Thumbnail Image`, style:st.img}, []);
    const thumbs = E('div', {style:st.thumbs}, media_elems.map((e,i) => {
      copy = e.nodeName == 'VIDEO' ? play.cloneNode(true) : e.cloneNode(true);
      copy.style.cssText += st.thumb;
      copy.addEventListener('click', function(event) {
        selected_img = i;
        display.replaceChild(media_elems[selected_img].cloneNode(true), display.childNodes[1]);
      });
      return copy;
    }));

    return E('div', {style:st.Slideshow}, [display, thumbs]);
  },
  Tabs: function(store, config) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const { windowState, uiState } = state;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;
    const lg_dev = ((uiState.windowState.mode=='pc')||(uiState.windowState.mode=='lg_tab'))?true:false;
    const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;
    const { modules, bdr, lvl, bg, ht, pos, def } = config;

    const st = {
      Tabs: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0; z-index:${50*lvl}; ${ht?'max-height:40em;':''} background-color:${bg?theme.panel_drk:theme.clear}; border:1px solid ${bdr?theme.view_bdr:theme.clear};`,
      tabs: `display:flex; flex-direction:row; justify-content:${landscape?'space-around':'flex-start'}; align-items:stretch; margin:0; overflow-x:scroll; border-bottom:1pt solid ${theme.view_bdr};`,
      tab: `display:flex; flex-direction:column; justify-content:center; align-items:stretch; margin:0; width:${100/modules.length}%; cursor:pointer; background-color:${lvl%2==0?theme.btn_lt:theme.btn}; border:1pt solid ${theme.btn_bdr};`,
      selected_tab: `background-color:rgba(21,32,43,0.9);`,
      tab_title: `margin:0.5em; text-align:center; font-size:${landscape?(1/lvl*1.5):(0.75/lvl*1.5)}em; cursor:pointer; color:${theme.lt_txt};`,
      display: `margin:0 auto; width:100%; padding:0;`,
    };

    let selected_module = def;
    const display = E('div', {style:st.display}, [modules[selected_module].module]);

    const tabs = E('div', {style:st.tabs}, modules.map((m,i) => {
      const tab = E('div', {style:`${st.tab} ${i==selected_module?st.selected_tab:''}`}, [E('h2', {style:st.tab_title}, [m.title])]);
      tab.addEventListener('click', function(event) {
        tabs.childNodes[selected_module].style.cssText = st.tab;
        selected_module = i;
        tabs.childNodes[selected_module].style.cssText += st.selected_tab;
        display.replaceChild(modules[selected_module].module, display.childNodes[0]);
      });
      return tab;
    }));

    return E('div', {style:st.Tabs}, (pos=='top'?[tabs,display]:[display,tabs]));
  },
  Tiles: function(store, thumbnails, bg) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const { windowState, uiState } = state;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;
    const lg_dev = ((uiState.windowState.mode=='pc')||(uiState.windowState.mode=='lg_tab'))?true:false;

    const st = {
      Tiles: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0.5em; background-color:${bg?theme.panel_drk:theme.clear};`,
      thumbs: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0.5em; border:1px solid ${theme.view_bdr}; border-radius:7px;`,
      row: `display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:${lg_dev?'space-between':'flex-start'}; align-items:${lg_dev?'baseline':'stretch'}; margin:0.5em auto; width:90%;`,
      thumb: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; width:${lg_dev?24:95}%; margin:0.5em ${lg_dev?'0.5em':'auto'}; border:1px solid ${theme.view_bdr}; border-radius:7px; cursor:pointer;`,
      thumb_img: `width:100%; height:${lg_dev?10:15}em; border-radius:7px;`,
      thumb_label: `font-size:1em; font-weight:bold; margin:0.5em; text-align:center; color:${uiState.themeState.selected=='dark' ? theme.lt_txt : theme.dk_txt};`
    };

    const rows = lg_dev ? Math.ceil((thumbnails.length)/4) : thumbnails.length;
    const cols = lg_dev ? (thumbnails.length>4 ? 4 : thumbnails.length) : 1;
    const last_row_cols = thumbnails.length % 4;
    const thumbs = [];
    for (i=0; i<rows; i++) {
      thumbs.push([]);
      const row_cols = i==rows ? last_row_cols : cols;
      for (j=0; j<row_cols; j++) {
        const idx = i*row_cols+j;
        thumbs[i].push(E('div', {style:st.thumb}, [
          E('img', {src:thumbnails[idx].src, alt:`${thumbnails[idx].label} Label`, style:st.thumb_img}, []),
          E('h2', {style:st.thumb_label}, [thumbnails[idx].label])
        ]));
        thumbs[i][j].addEventListener('click', function(event) {
          const name = thumbnails[idx].label.replace(' ', '_');
          const route = name.toUpperCase();
          dispatch({type:'NAV_TO', payload:[route, name]});
        });
      };
    };

    return E('div', {style:st.Tiles}, [E('div', {style:st.thumbs}, thumbs.map(r => E('div', {style:st.row}, r)))]);
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
        const nm = nw<600?'mb':(nw<700?'sm_tab':(nw<800?'md_tab':(nw<900?'lg_tab':'pc')))
        if (nm!=mode) dispatch({type:'RESIZE',payload:{width:nw,height:nh,mode:nm}});
      }
    });

    return Unity.element('div', {style:st.app}, [
      Modules.Header(store), Modules.Menu(store), Modules.Router(store)
    ]);
  }
};

// --------------------------------------------------------------------------------------------
//  Views - Groups Modules together to fit device.
// --------------------------------------------------------------------------------------------
const Views = {
  Home: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {appState,userState,uiState} = state;
    const {cs, engineering, presentations} = userState.portfolioState;
    const {name,phone,email,directions,employer,title,major,school,bio} = userState.infoState;
    const {windowState,mapState} = uiState;
    const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;
    const landing = ((appState.historyState.views.slice(-1)=='@@INIT')&&(appState.historyState.actions.slice(-1)=='@@INIT'))?true:false;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      home: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:0; width:100%; text-align:center; ${landing?'animation: app_fade_in 1000ms ease-in-out 1 forwards;':''}`,
      intro: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:${landscape?'13em 1em 2':'7em 1em 2'}em;`,
      name: `margin:0 auto; color:${theme.lt_txt}; font-size:4em; font-weight:400;`,
      title: `margin:0.25em; color:${theme.lt_txt}; font-size:${landscape?1.5:1.3}em; font-weight:300;`,
      actions: `display:flex; flex-direction:${landscape?'row':'column'}; justify-content:center; align-items:${landscape?'center':'stretch'}; margin:0 auto; padding:0; width:90%;`,
      btn: `margin:0.5em ${landscape?'':'auto'}; padding:0.4em 0.6em; width:${landscape?23:80}%; background-color:${theme.btn}; border:1pt solid ${theme.btn_bdr}; color:${theme.lt_txt}; cursor:pointer;`,
      bio: `margin:${landscape?2:1}em; padding:${landscape?`1`:`0.25`}em; border:1px solid ${theme.view_bdr}; background-color:${theme.well};`,
      sentence: `color:${theme.view_txt}; font-size:${landscape?1.25:1}em; font-weight:700; margin:0.5em;`,
      highlights: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:2em 0;`,
      highlight: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:${landscape?2:1}em auto; width:${landscape?70:95}%; background-coulor:#252525; border:1pt solid ${theme.view_bdr}; cursor:pointer;`,
      highlight_img: `margin:0; width:100%; border-bottom:1pt solid ${theme.view_bdr};`,
      highlight_title: `color:${theme.lt_txt}; font-size:${landscape?1.25:1}em; text-align:center;`
    };

    const intro = E('div',{style:st.intro},[
      E('h1',{style:st.name},[name]),
      E('h2',{style:st.title},[`${major} Student at ${school}`])
    ]);

    const actions = E('div',{style:st.actions},['CONTACT','RESEARCH','PUBLICATIONS'].map((b,i,arr) => {
      const btn = E('h2', {style: st.btn}, [`${b[0]}${b.slice(1).toLowerCase()}`]);
      btn.addEventListener('click', (event)=>dispatch({type:'NAV_TO', payload:b}));
      return btn;
    }));

    const config = [
      {type:'PUBLICATIONS', title:'Optics, Electromagnetism and Nanotechnology', src:presentations.mltv[0].sections[0].content[0].media[0]},
      {type:'RESEARCH', title:'Computer Architecture, Deep Learning and Quantum Computation', src:cs.deep_learning[0].banner.src},
      {type:'RESEARCH', title:'Embedded Systems and Power Electronics', src:presentations.phys2_thermometer[0].sections[0].content[0].media[0]}
    ];

    const highlights = E('div', {style:st.highlights}, config.map(h => {
      const img = E('img', {style:st.highlight_img, src:h.src, alt:`${h.title} Image`}, []);
      const title = E('h2', {style:st.highlight_title}, [h.title]);
      const highlight = E('div', {style:st.highlight}, [img, title]);
      highlight.addEventListener('click', e => dispatch({type:'NAV_TO', payload:h.type}));
      return highlight;
    }));

    return E('div',{style:st.home},[intro, actions, highlights]);
  },
  Contact: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {wp,thumbs} = Assets.imgs;
    const {personal,work,social} = state.userState.infoState;
    const lg_dev = ((state.uiState.windowState.mode=='pc')||(state.uiState.windowState.mode=='lg_tab'))?true:false;
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
      lnk: `color:#09f; margin: 0 0.5em; text-decorate:underline;`,
      btn: `margin:0.5em auto 2em; padding:0.5em 1em; background-color:${theme.btn}; border:1pt solid ${theme.btn_bdr}; color:${theme.lt_txt}; cursor:pointer; text-align:center;`,
      map:`border:1px solid ${theme.footer_bdr}; margin:1em auto; width:95%; height:250pt;`
    };

    const chat = E(`div`,{style:st.section},[`Chat`,E(`div`,{style:st.wrp},[E(`div`,{style:st.btn},['Chat with me'])])]);
    chat.addEventListener('click', (event) => dispatch({type: 'NAV_TO', payload: state.uiState.mapState.tree[3]}));

    return E('div', {style:st.view}, [
      E('div',{style:st.contact},[
        E('h1',{style:st.title},['Get In Touch']),
        E('div',{style:st.sections},[
          E(`div`,{style:st.section},[`Phone`,E(`div`,{style:st.wrp},[E(`a`,{href:`tel:${personal.phone}`,target:`_blank`,style:st.lnk},[personal.phone])])]),
          E(`div`,{style:st.section},[`Email`,E(`div`,{style:st.wrp},[E(`a`,{href:`mailto:${personal.email}`,target:`_blank`,style:st.lnk},[personal.email])])]),
          E(`div`,{style:st.section},[`GitHub`,E(`div`,{style:st.wrp},[E(`a`,{href:personal.github,target:`_blank`,style:st.lnk},[personal.github])])]),
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
    const lg_dev = ((state.uiState.windowState.mode=='pc')||(state.uiState.windowState.mode=='lg_tab'))?true:false;

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%; margin:${lg_dev?7:6}em 0 3em;`,
      about: `margin:${lg_dev?'1em 2em':'0.5em 1em'} auto; padding:${lg_dev?1:0.25}em; background-color:${theme.well};`,
      title: `margin:${lg_dev?3:2.5}em auto 0.25em; padding:${lg_dev?0.25:0.15}em; border-bottom:1pt solid ${theme.view_bdr}; text-align:center; color:${theme.menu_txt};`,
      intro: `margin:0.5em; padding:0; text-align:center; color:${theme.view_txt};`,
      bio: `margin:1em 0 0; padding:0;`,
      section: `margin:1.5em 1em 1em; padding:0;`,
      sec_ttl: `margin:0 0 0.5em; padding:0 1em 0.5em; font-size:1em; color:${theme.view_txt}; border-bottom:1pt solid ${theme.menu_bdr};`,
      txt: `margin:0 0.5em; padding:0; color:${theme.view_txt};`,
      sentence: `margin:0.25em; color:${theme.view_txt};`,
      pdf: `width:99.5%; min-height:50em; scrollbar-width:${lg_dev?0.5:1}em;`
    };

    const full_bio = E('div', {style:st.bio}, Object.keys(bio).map(section => E('div', {style:st.section}, [
      E('h2', {style:st.sec_ttl}, [section.toUpperCase()]),
      ...bio[section].map((sentence, i) => E('span', {style: `${st.sentence} ${i==0?'margin-left:1em;':''}`}, [sentence]))
    ])));

    return E('div', {style:st.view}, [ E('div', {style:st.about}, [
      Modules.Tabs(store, {bdr:false, lvl:1, bg:false, ht:false, pos:'top', def:0, modules:[
        {title:'About Me', module:full_bio},
        {title:'Resume/CV', module:E('iframe', {style:st.pdf, type:'application/pdf', src:'/portfolio/resumes/johnathan-chivington-resume-cv.pdf'}, [])}
      ]})
    ])]);
  },
  Research: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { wp, thumbs } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const { bio } = state.userState.infoState;
    const E = Unity.element;
    const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin-top:${landscape?5:4}em; min-height:75%;`,
      container: `width:99.9%; margin:0 auto;`,
      module: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:1em auto; padding:1em; border:1px solid #faa;`,
    };

    const tabs = Modules.Tabs(store, {modules:[
      {title:'Computer Science', module:Modules.Tabs(store, {modules:[
        {title:'Computer Architecture', module:Modules.Portfolio(store, {projects:state.userState.portfolioState.cs.computer_architecture, bdr:false, bg:false})},
        {title:'Deep Learning', module:Modules.Portfolio(store, {projects:state.userState.portfolioState.cs.deep_learning, bdr:false, bg:false})},
        {title:'Quantum Computation', module:Modules.Portfolio(store, {projects:state.userState.portfolioState.cs.quantum_computation, bdr:false, bg:false})},
      ], bdr:false, lvl:2, bg:false, ht:false, pos:'top', def:0})},
      {title:'Chemistry', module:Modules.Portfolio(store, {projects:state.userState.portfolioState.placeholder, bdr:false, bg:false})},
      {title:'Engineering', module:Modules.Portfolio(store, {projects:state.userState.portfolioState.engineering.electronics, bdr:false, bg:false})},
      {title:'Physics', module:Modules.Portfolio(store, {projects:state.userState.portfolioState.physics.nano, bdr:false, bg:false})},
    ], bdr:false, lvl:1, bg:false, ht:false, pos:'top', def:0});

    return E('div', {style:st.view}, [ E('div', {style:st.container}, [tabs]) ]);
  },
  Publications: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { wp, thumbs } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const { bio } = state.userState.infoState;
    const E = Unity.element;
    const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin-top:${landscape?5:4}em; min-height:75%;`,
      container: `width:99.9%; margin:0 auto;`,
      module: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:1em auto; padding:1em; border:1px solid #faa;`,
    };

    const tabs = Modules.Tabs(store, {modules:[
      {title:'Presentations', module:Modules.Portfolio(store, {projects:state.userState.portfolioState.presentations.mltv, bdr:false, bg:false})},
      {title:'Publications', module:Modules.Portfolio(store, {projects:state.userState.portfolioState.placeholder, bdr:false, bg:false})},
    ], bdr:false, lvl:1, bg:false, ht:false, pos:'top', def:0});

    return E('div', {style:st.view}, [ E('div', {style:st.container}, [tabs]) ]);
  },
  Le_Chat: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { uiState, userState } = state;
    const { chatState } = userState;
    const { wp, thumbs } = Assets.imgs;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;
    const lg_dev = ((uiState.windowState.mode=='pc')||(uiState.windowState.mode=='lg_tab'))?true:false;

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%;`,
      msgs: `
        position:relative; margin:${lg_dev?5.75:4.75}em auto 0.25em; padding:0; width:98%; height:25em; overflow-x:hidden; overflow-y:hidden;
        display:flex; flex-direction:column; justify-contents:flex-end; align-items:stretch;
      `,
      thread: `margin:0.25em auto; padding:0.25em; overflow-x:hidden; overflow-y:scroll;`,
      msg: `width:95%; margin:0.25em auto 0.5em; padding:0.5em; border:1pt solid ${theme.panel_dk}; border-radius:5pt; background-color:${theme.menu};`,
      updated_msg: `width:93%; margin:0.25em auto 0.5em; padding:0.5em; border:1pt solid ${theme.panel_dk}; border-radius:5pt; background-color:${theme.menu};`,
      sender: `margin:0.5em auto; padding:0; text-align:left; font-weight:bold; font-size:1.1em; color:${theme.menu_bdr};`,
      txt: `margin:0; padding:0; text-align:right; color:${theme.menu_bdr};`,
      input: `width:90%; height:2em; margin:1em auto 0.5em; padding:${lg_dev?1:0.5}em; border:0.5pt solid ${theme.lt_txt}; border-radius:3pt; background-color:${theme.panel_lt}; color:${theme.lt_txt}; resize:none; overflow-x:hidden; overflow-y:scroll;`,
      new_msg: `width:90%; height:2em; margin:0 2% 1em; padding:${lg_dev?1.25:1}em; border:1pt solid ${theme.view_bdr}; border-radius:3pt; background-color:${theme.panel_lt}; color:${theme.lt_txt}; resize:none; overflow-x:hidden; overflow-y:scroll;`,
      send: `margin:1.5em auto 0.5em; padding:0.4em 0.6em; width:${lg_dev?50:80}%; background-color:${theme.btn}; border:1pt solid ${theme.btn_bdr}; color:${theme.lt_txt}; cursor:pointer; text-align:center;`,
      delete: `margin:0.5em auto 2em; padding:0.4em 0.6em; width:${lg_dev?50:80}%; background-color:${theme.error}; border:1pt solid ${theme.panel_lt}; color:${theme.lt_txt}; cursor:pointer; text-align:center;`,
      welcome: `width:${lg_dev?70:90}%; margin:${lg_dev?6.5:5.5}em auto 2em; padding:0.5em; border:1pt solid ${theme.view_bdr}; border-radius:5pt; background-color:${theme.panel_lt};`,
      instructions: `margin:1em auto; width:${lg_dev?60:90}%; color:${theme.lt_txt}; text-align:center;`,
      sentence: `margin:1em; padding:0; text-align:center; color:${theme.lt_txt};`,
      names: `display:flex; flex-direction:row; justify-content:center; align-items:center; width:${lg_dev?90:95}%; margin:1em auto;`,
      name: `width:45%; height:1em; margin:0.5em auto; padding:${lg_dev?'0.25em 0 0.45':'0.35em 0 0.55'}em; background-color:${theme.panel_lt}; color:${theme.lt_txt}; text-align: center; resize:none; overflow-x:hidden; overflow-y:scroll; border:1pt solid ${theme.menu_bdr};`
    };

    async function server_request(req_type, payload) {
      let response = await fetch('/', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Allow': 'GET, POST' },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({type:req_type, payload:payload})
      });
      if (!response.ok) window.alert('Please try again...');
      else return await response.json();
    };

    function generate_thread_selector(latest_chatState, init_scroll) {
      const selected_name = latest_chatState.threads.reduce((s, t, i) => {
        if (t.thread_name == latest_chatState.selected) s = latest_chatState.users[i];
        return s;
      }, '');

      const selections = [...latest_chatState.threads.map(t => ({
        name: t.thread_name,
        contents: E('div', {style:st.thread}, t.msgs.map(m => E('div', {style:st.msg}, [ E('p', {style:st.sender}, [m.sender]), E('p', {style:st.txt}, [m.msg]) ]))),
        action: `CHANGE_THREAD_SELECTION`,
        payload: t.thread_name
      })), {
        name: '+',
        contents: E('div', {style:st.thread}, ['Begin a new thread...']),
        action: `CHANGE_THREAD_SELECTION`,
        payload: '@@INIT'
      }];

      const orientation = lg_dev ? 'LANDSCAPE' : 'PORTAIT';
      return Modules.Selector(store, selections, chatState.selected, orientation, 'top', 'shadow', init_scroll);
    };

    if (chatState.selected == '@@INIT') {
      const instructions = E('p', {style:st.instructions}, [
        `Welcome to Le Chat. `, `There is no user database and no messages are ever stored to disk. All chats are stored in RAM only, and periodically cleared.`,
        `If able, your device will cache chats locally so that you don't need to type the chat name again when you return. All cached messages are cleared from your device upon returning, if the server has cleared them since your last visit.`,
        `${chatState.threads.length>0 ? '' : 'There are currently no chats. '} To begin or join a chat, choose a username and the name of the chat you're attmpting to join. `,
        `To invite anyone to the chat, simply share the chat name. Use the "delete chat" and "delete chats" buttons to immediately clear chats from the server, as desired.`,
        `Press "enter/return" on your keyboard or click "send" to send a message.`
      ].map(s => E('p', {style:st.sentence}, [s])));

      names_placeholders = ['your name', 'conversation name'];
      const names = E('div', {style:st.names}, [
        E('textarea', {style:`${st.name} border:1pt solid ${theme.view_bdr};`, placeholder:names_placeholders[0]}, []),
        E('textarea', {style:`${st.name} border:1pt solid ${theme.view_bdr};`, placeholder:names_placeholders[1]}, []),
      ]);
      for (i=0; i<names.children.length; i++) {
        const val = names.children[i].value;
        names.children[i].addEventListener('focus', (event) => event.target.value = '');
        names.children[i].addEventListener('blur', (event) => event.target.value = event.target.value == '' ? placeholders[i] : event.target.value);
      }
      window.setTimeout(() => names.children[0].focus(), 0);

      msg_placeholder = 'Type msg here..';
      const new_msg = E('textarea', {style:st.new_msg, placeholder:msg_placeholder}, []);
      const send_msg = (event) => {
        if (names.children[0].value=='' || names.children[0].value==names_placeholders[0] || names.children[1].value=='' || names.children[1].value==names_placeholders[1] || new_msg.value=='' || new_msg.value==msg_placeholder) {
          names.children[0].style = `${st.name} border:1.5pt solid ${theme.error};`;
          names.children[1].style = `${st.name} border:1.5pt solid ${theme.error};`;
          new_msg.style = `${st.new_msg} border:1.5pt solid ${theme.error};`;
        } else server_request('BEGIN_THREAD', {thread_name: `${names.children[1].value}`, msg: {sender: names.children[0].value, msg:new_msg.value}}).then(thread => {
          if (thread.msgs[thread.msgs.length-1].msg == new_msg.value) {
            dispatch({type:'BEGIN_THREAD', payload:{user:names.children[0].value, thread:thread}});
            dispatch({type: 'NAV_TO', payload: state.uiState.mapState.tree[3]});
          }
          else window.alert('Please try again...');
        });
      };
      new_msg.addEventListener('focus', (event) => event.target.value = '');
      new_msg.addEventListener('blur', (event) => event.target.value = event.target.value == '' ? msg_placeholder : event.target.value);
      new_msg.addEventListener('keyup', (event) => { if (event.keyCode == 13) send_msg(event); });

      const start = E('div', {style:st.send}, ['start chat']);
      start.addEventListener('click', send_msg);

      const view_chats = E('div', {style:st.send}, ['view chats']);
      view_chats.addEventListener('click', (event) => dispatch({type: 'CHANGE_THREAD_SELECTION', payload: chatState.threads[0].thread_name}));

      const delete_threads = E('div', {style:st.delete}, ['delete chats']);
      delete_threads.addEventListener('click', (event) => server_request('DELETE_THREADS', {thread_names: chatState.threads.map(t => t.thread_name)}).then(data => dispatch({type:'DELETE_THREADS', payload:''})));

      return E('div', {style:st.view}, [ E('div', {style:st.welcome}, chatState.threads.length>0 ? [instructions, names, new_msg, start, view_chats, delete_threads] : [instructions, names, new_msg, start]) ]);
    }
    else {
      const msgs = E('div', {style:st.msgs}, [generate_thread_selector(chatState, {display:null, btns:null})]);

      const input = E('textarea', {style:st.input, placeholder:chatState.typing}, []);
      input.addEventListener('focus', (event) => { event.target.value = store.getState().userState.chatState.typing; event.target.selectionStart = event.target.selectionEnd = event.target.value.length; });
      input.addEventListener('blur', (event) => event.target.value = store.getState().userState.chatState.typing);
      input.addEventListener('input', (event) => dispatch({type: 'TYPING', payload: event.target.value}));
      input.addEventListener('keyup', (event) => {
        if (event.keyCode == 13) {
          const latest_chatState = store.getState().userState.chatState;
          const latest_sender = latest_chatState.threads.reduce((s, t, i) => { if (t.thread_name == latest_chatState.selected) s = latest_chatState.users[i]; return s; }, '');
          server_request('UPDATE_THREAD', {thread_name:`${latest_chatState.selected}`, msg:{sender:latest_sender, msg:latest_chatState.typing}}).then(data => {
            const last_msg = data.msgs[data.msgs.length-1];
            if (last_msg.msg == latest_chatState.typing) dispatch({type:'UPDATE_THREAD', payload:{user:last_msg.sender, thread:data}});
            else window.alert('Please try again...');
          });
        }
      });

      const send = E('div', {style:st.send}, ['send']);
      send.addEventListener('click', (event) => {
        const latest_chatState = store.getState().userState.chatState;
        const latest_sender = latest_chatState.threads.reduce((s, t, i) => { if (t.thread_name == latest_chatState.selected) s = latest_chatState.users[i]; return s; }, '');
        if (latest_chatState.typing == '') input.attributes.border = `1pt solid ${theme.error}`;
        else server_request('UPDATE_THREAD', {thread_name:`${latest_chatState.selected}`, msg:{sender:latest_sender, msg:latest_chatState.typing}}).then(data => {
          const last_msg = data.msgs[data.msgs.length-1];
          if (last_msg.msg == latest_chatState.typing) dispatch({type:'UPDATE_THREAD', payload:{user:last_msg.sender, thread:data}});
          else window.alert('Please try again...');
        });
      });

      const delete_thread = E('div', {style:st.delete}, ['delete chat']);
      delete_thread.addEventListener('click', (event) => {
        const user = chatState.threads.reduce((u, t, i) => { if (t.thread_name == chatState.selected) u=chatState.users[i]; return u; }, '');
        server_request('DELETE_THREAD', {thread_name: chatState.selected}).then(data => dispatch({type:'DELETE_THREAD', payload:{user:user, thread_name:chatState.selected}}));
      });

      let iter = 0;
      const timer = window.setInterval(() => {
        const latest_state = store.getState();
        if (latest_state.uiState.viewState.current != 'LE_CHAT' || latest_state.userState.chatState.selected == '@@INIT') window.clearInterval(timer);
        else if (iter > 25) dispatch({type: 'NAV_TO', payload: ['LE_CHAT', 'Le Chat']});
        else {
          const latest_chatState = latest_state.userState.chatState;
          server_request('REFRESH_THREADS', {thread_names: latest_chatState.threads.map(t => t.thread_name)}).then(data => {
            dispatch({type: 'REFRESH_THREADS', payload: data});
            let displayed = {scrollHeight:0};
            for (let i=0; i<msgs.firstChild.lastChild.children.length; i++) {
              if (msgs.firstChild.lastChild.children[i].style.display !== 'none') displayed = msgs.firstChild.lastChild.children[i];
            }
            msgs.firstChild.replaceWith(generate_thread_selector(latest_chatState, {display:displayed.scrollTop, btns: msgs.firstChild.firstChild.scrollLeft}));
          });
        }
      }, 1000*2);

      return E('div', {style:st.view}, [ msgs, input, send, delete_thread ]);
    }
  },
  Login: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const lg_dev = ((state.uiState.windowState.mode=='pc')||(state.uiState.windowState.mode=='lg_tab'))?true:false;
    const E = Unity.element;

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%;`,
      welcome: `width:${lg_dev?70:90}%; margin:${lg_dev?6.5:5.5}em auto 0; padding:0.5em; border:1pt solid ${theme.view_bdr}; border-radius:5pt; background-color:${theme.panel_lt};`,
      instructions: `margin:1em auto; width:${lg_dev?60:90}%; color:${theme.lt_txt}; text-align:center;`,
      credentials: `display:flex; flex-direction:row; justify-content:center; align-items:center; width:${lg_dev?90:95}%; margin:1em auto;`,
      credential: `width:45%; height:1em; margin:0.5em auto; padding:${lg_dev?'0.25em 0 0.45':'0.35em 0 0.55'}em; background-color:${theme.panel_lt}; color:${theme.lt_txt}; text-align: center; resize:none; overflow-x:hidden; overflow-y:scroll; border:1pt solid ${theme.menu_bdr};`,
      login: `margin:0.5em auto; padding:0.4em 0.6em; width:${lg_dev?50:80}%; background-color:${theme.btn}; border:1pt solid ${theme.btn_bdr}; color:${theme.lt_txt}; cursor:pointer; text-align:center;`
    };

    async function server_request(req_type, payload) {
      let response = await fetch('/', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Allow': 'GET, POST' },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({type:req_type, payload:payload})
      });
      if (!response.ok) window.alert('Please try again...');
      else return await response.json();
    };

    const instructions = E('p', {style:st.instructions}, ['Login to view all chats.']);

    const credentials = E('div', {style:st.credentials}, [
      E('textarea', {style:`${st.credential} border:1pt solid ${theme.view_bdr};`, placeholder:'username'}, []),
      E('input', {style:`${st.credential} border:1pt solid ${theme.view_bdr};`, type:'password', placeholder:'password'}, [])
    ]);

    for (i=0; i<credentials.children.length; i++) credentials.children[i].addEventListener('focus', (event) => event.target.value = '');
    credentials.children[1].addEventListener('keyup', (event) => {
      if (event.keyCode == 13) {
        const user = credentials.children[0].value;
        const pass = credentials.children[1].value;
        if (user=='' || pass=='') {
          crednetials.children[0].style = `${st.credential} border:1.5pt solid ${theme.error};`;
          crednetials.children[1].style = `${st.credential} border:1.5pt solid ${theme.error};`;
        } else server_request('LOGIN', {user:user, pass:pass}).then(data => {
          if (!data.status) {
            if (data[0].thread_name != 'Le Chat') {
              data.forEach(t => dispatch({type: 'BEGIN_THREAD', payload:{user:user, thread:t}}));
              dispatch({type: 'CHANGE_THREAD_SELECTION', payload: data[0].thread_name});
            }
            else window.alert('No conversations.');
            dispatch({type: 'NAV_TO', payload: state.uiState.mapState.tree[3]});
          }
          else window.alert('Login unsuccessful. Please try again.');
        });
    }});
    window.setTimeout(() => credentials.children[0].focus(), 0);

    const login = E('div', {style:st.login}, ['login']);
    login.addEventListener('click', (event) => {
      const user = credentials.children[0].value;
      const pass = credentials.children[1].value;
      if (user=='' || pass=='') {
        credentials.children[0].style = `${st.name} border:1.5pt solid ${theme.error};`;
        credentials.children[1].style = `${st.name} border:1.5pt solid ${theme.error};`;
      } else server_request('LOGIN', {user:user, pass:pass}).then(data => {
        if (!data.status) {
          if (data[0].thread_name != 'Le Chat') {
            dispatch({type:'DELETE_THREADS', payload:''});
            data.forEach(remote_thread => dispatch({type:'BEGIN_THREAD', payload:{user:names.children[0].value, thread:remote_thread}}));
            dispatch({type: 'CHANGE_THREAD_SELECTION', payload: data[0].thread_name});
          }
          else window.alert('No conversations.');
          dispatch({type: 'NAV_TO', payload: state.uiState.mapState.tree[3]});
        }
        else window.alert('Login unsuccessful. Please try again.');
      });
    });

    return E('div', {style:st.view}, [ E('div', {style:st.welcome}, [instructions, credentials, login]) ]);
  },
  Settings: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.element;
    const lg_dev = ((state.uiState.windowState.mode=='pc')||(state.uiState.windowState.mode=='lg_tab'))?true:false;

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin-top:5em; min-height:75%;`,
      container: `width: 90%; margin:1em auto;`
    };

    // const tabs = Modules.Tabs(store, [
    //   {module:E('p', {}, ['1']), title:'A'},
    //   {module:E('p', {}, ['2']), title:'B'},
    //   {module:E('p', {}, ['3']), title:'C'},
    //   {module:E('p', {}, ['4']), title:'D'}
    // ]);

    return E('div', {style:st.view}, [ E('div', {style:st.container}, ['settings']) ]);
  },
  Staging: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = Unity.element;
    const lg_dev = ((state.uiState.windowState.mode=='pc')||(state.uiState.windowState.mode=='lg_tab'))?true:false;
    const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;

    const st = {
      view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin-top:${landscape?5:4}em; min-height:75%;`,
      container: `width:99.9%; margin:0 auto;`,
      module: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:1em auto; padding:1em; border:1px solid #faa;`
    };

    let ctr = 0;
    const test = E('p', {style:'border:1px solid #faa; color:#faa;'}, ['TEST']);
    test.addEventListener('click', e => {
      console.log(` CLICKED: ${ctr}`);
      ctr++;
    });

    const tabs = Modules.Tabs(store, {modules:[
      {title:'Physics', module:test},
    ], bdr:false, lvl:1, bg:false, ht:false, pos:'top', def:0});

    return E('div', {style:st.view}, [ E('div', {style:st.container}, [tabs]) ]);
  }
};

// --------------------------------------------------------------------------------------------
//  Asset Manifest - Everything needed to cache app.
// --------------------------------------------------------------------------------------------
const Assets = {
  css:{
    fonts:{
      Avenir_Book:'/css/fonts/Avenir-Free/Avenir-Book.otf',
      Avenir_Book:'/css/fonts/Avenir-Free/Avenir-Light.otf',
      Avenir_Book:'/css/fonts/Avenir-Free/Avenir-Roman.otf'
    },
    only_css_file:'/css/only.css'
  },
  imgs:{
    icons:{
      btns:{
        close_wht:'/imgs/icons/btns/close-wht.svg',
        close_blk:'/imgs/icons/btns/close-blk.svg',
        scroll:'/imgs/icons/btns/scroll.svg',
        menu_wht:'/imgs/icons/btns/menu-wht.svg',
        menu_blk:'/imgs/icons/btns/menu-blk.svg',
        caret_wht:'/imgs/icons/btns/caret-wht.svg',
        caret_blk:'/imgs/icons/btns/caret-blk.svg',
        left_arrow:'/imgs/icons/btns/left-arrow.svg',
        right_arrow:'/imgs/icons/btns/right-arrow.svg',
      },
      manifest:{
        android_192:'/imgs/icons/manifest/android-chrome-192x192.png',
        android_512:'/imgs/icons/manifest/android-chrome-512x512.png',
        apple_touch:'/imgs/icons/manifest/apple-touch-icon.png',
        favicon_16:'/imgs/icons/manifest/favicon-16x16.png',
        favicon_32:'/imgs/icons/manifest/favicon-32x32.png',
        favicon:'/imgs/icons/manifest/favicon.ico',
        favicon_wht:'/imgs/icons/manifest/favicon-wht.png',
        mstile_150:'/imgs/icons/manifest/mstile-150x150.png',
        safari_pinned_tab:'/imgs/icons/manifest/safari-pinned-tab.svg'
      },
      work:{
        dl_blk:'/imgs/icons/sm/dl-blk.svg',
        dl_wht:'/imgs/icons/sm/dl-wht.svg',
        resume_blk:'/imgs/icons/sm/resume-blk.svg',
        resume_wht:'/imgs/icons/sm/resume-wht.svg',
        email_blk:'/imgs/icons/sm/email-blk.svg',
        email_wht:'/imgs/icons/sm/email-wht.svg',
        git_blk:'/imgs/icons/sm/git-blk.svg',
        git_wht:'/imgs/icons/sm/git-wht.svg',
        jc_pbc_blk:'/imgs/icons/sm/jc-pcb-blk.svg',
        jc_pbc_wht:'/imgs/icons/manifest/mstile-150x150.png',
        phone_blk:'/imgs/icons/sm/phone-blk.svg',
        phone_wht:'/imgs/icons/sm/phone-wht.svg',
        usa:'/imgs/icons/sm/united-states.svg',
        web_blk:'/imgs/icons/sm/web-blk.svg',
        web_wht:'/imgs/icons/sm/web-wht.svg'
      }
    },
    me:{
      loaf:'/imgs/me/loaf.jpg',
      win_bed:'/imgs/me/win-bed.jpg',
      win:'/imgs/me/win.jpg'
    },
    wp:{
      fragmented:'/imgs/wp/fragmented.jpg',
      geo_sphere:'/imgs/wp/geo-sphere.jpg',
      math:'/imgs/wp/math.jpg',
      yolo:'/imgs/wp/yolo.jpg'
    },
    thumbs: {
      placeholder: '/imgs/thumbs/placeholder.jpg'
    }
  },
  portfolio:{
    physics: {
      afm: {
        banner: '/portfolio/research/physics/nano/afm/banner.jpg',
        afm_diagram: '/portfolio/research/physics/nano/afm/afm-diagram.jpg',
        barium_titanate: '/portfolio/research/physics/nano/afm/barium-titanate.jpg',
        ted: 'https://www.ted.com/talks/robert_wolkow_atom_scale_manufacturing_the_path_to_ultimate_green_technologies',
        fisher: 'https://www.fishersci.com/shop/products/barium-titanate-iv-99-acros-organics-2/AC196865000',
        pubchem: 'https://pubchem.ncbi.nlm.nih.gov/compound/Barium-titanate_IV',
        BaTiO3: '/portfolio/research/physics/nano/afm/barium-titanate.jpg',
        db: '/portfolio/research/physics/nano/afm/dp.pdf'
      }
    },
    engineering: {
      open_phone:{
        logo:'/portfolio/research/engineering/electronics/open-phone/logo.jpg',
        sim_7600:'/portfolio/research/engineering/electronics/open-phone/materials/sim-7600.jpg',
        pi_4:'/portfolio/research/engineering/electronics/open-phone/materials/pi-4.jpg',
        battery_bank:'/portfolio/research/engineering/electronics/open-phone/materials/battery-bank.jpg',
        camera:'/portfolio/research/engineering/electronics/open-phone/materials/camera.jpg',
        screen:'/portfolio/research/engineering/electronics/open-phone/materials/screen.jpg',
        usb_hub:'/portfolio/research/engineering/electronics/open-phone/materials/usb-hub.jpg',
        port_strip_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/teardown/port-strip-1.jpg',
        port_strip_2:'/portfolio/research/engineering/electronics/open-phone/hardware-build/teardown/port-strip-2.jpg',
        usb_leads_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/teardown/usb-leads-1.jpg',
        pi_replaced_ports_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/rebuild/pi-replaced-ports-1.jpg',
        pi_replaced_ports_2:'/portfolio/research/engineering/electronics/open-phone/hardware-build/rebuild/pi-replaced-ports-2.jpg',
        power_supply_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/rebuild/power-supply-1.jpg',
        power_supply_2:'/portfolio/research/engineering/electronics/open-phone/hardware-build/rebuild/power-supply-2.jpg',
        screen_back_taped:'/portfolio/research/engineering/electronics/open-phone/hardware-build/rebuild/screen-back-taped.jpg',
        completed_ports_angle_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/completed-ports-angle-1.jpg',
        completed_camera_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/completed-camera-1.jpg',
        CAD_all:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/CAD-3D-all.jpg',
        CAD_back:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/CAD-3D-front.jpg',
        CAD_front:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/CAD-3D-mid.jpg',
        CAD_mid:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/CAD-3D-back.jpg',
        completed_camera_2:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/completed-camera-2.jpg',
        completed_charge_ports_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/completed-charge-ports-1.jpg',
        completed_usb_ports_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/completed-usb-ports-1.jpg',
        completed_video_audio_ports:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/completed-video-audio-ports.jpg',
        components_test_placement:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/components-test-placement.jpg',
        components_test_placement_2:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/components-test-placement-2.jpg',
        components_test_placement_3:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/components-test-placement-3.jpg',
        test_print_mk_002_group:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/test-print-mk-0.0.2-group.jpg',
        test_print_mk_002_single:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/test-print-mk-0.0.2-single.jpg',
        test_print_mk_002_back_panel:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/test-print-mk-0.0.2-back-panel.jpg',
        test_print_mk_003_group:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/test-print-mk-0.0.3-group.jpg',
        test_print_mk_004_slide_rail:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/test-print-mk-0.0.4-slide-rail.jpg',
        test_print_switches:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/test-print-switches.jpg',
        test_print_switches_2:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/test-print-switches-2.jpg',
        back_panel_inner_1:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/back-panel-inner-1.jpg',
        back_panel_inner_2:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/back-panel-inner-2.jpg',
        open_phone_mk_100:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/open-phone-mk-1.0.0.dwg',
        mk_100_front:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/mk-1.0.0-front.stl',
        mk_100_back:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/mk-1.0.0-back.stl',
        mk_100_mid:'/portfolio/research/engineering/electronics/open-phone/hardware-build/prints/mk-1.0.0-mid.stl',
        demo_call:'/portfolio/research/engineering/electronics/open-phone/demo-call.mp4',
        sim_7600_wiki:`https://www.waveshare.com/wiki/SIM7600A-H_4G_HAT`,
        pi_org:`https://www.raspberrypi.org/products/raspberry-pi-4-model-b/`,
        amzn_screen:`https://www.amazon.com/dp/B07Z685PM6?ref=ppx_yo2_dt_b_product_details&th=1`,
        amzn_pwr_bnk:`https://www.amazon.com/dp/B07M8JWBQ6?psc=1&ref=ppx_yo2_dt_b_product_details`,
        amzn_cam:`https://www.amazon.com/dp/B08M9RY3DQ?psc=1&ref=ppx_yo2_dt_b_product_details`,
        amzn_usb_hub:`https://www.amazon.com/dp/B07FH7XJCD?psc=1&ref=ppx_yo2_dt_b_product_details`,
        tk_docs:`https://docs.python.org/3/library/tkinter.html`,
      }
    },
    cs: {
      mnist_poly_reg: {
        git: 'https://github.com/chivington/MNIST-Polynomial-Regression-Classifier',
        banner: '/portfolio/research/cs/deep-learning/MNIST-Polynomial-Regression-Classifier/banner.jpg',
        rand_img: '/portfolio/research/cs/deep-learning/MNIST-Polynomial-Regression-Classifier/random-img.jpg',
        errs_times: '/portfolio/research/cs/deep-learning/MNIST-Polynomial-Regression-Classifier/errors-and-times.jpg',
        classification: '/portfolio/research/cs/deep-learning/MNIST-Polynomial-Regression-Classifier/classification.jpg'
      },
      qc_hello_world: {
        qubit: '/portfolio/research/cs/quantum-computation/qc-hello-world/qubit.jpg',
        qc_code: '/portfolio/research/cs/quantum-computation/qc-hello-world/code.jpg',
        q_py1: '/portfolio/research/cs/quantum-computation/qc-hello-world/q.py',
        q_py2: '/portfolio/research/cs/quantum-computation/qc-hello-world/q2.py',
        khan: 'https://www.khanacademy.org/science/physics/quantum-physics/quantum-numbers-and-orbitals/a/the-quantum-mechanical-model-of-the-atom',
        medium: 'https://medium.com/quantum-untangled/programming-for-quantum-computing-pt-1-numpy-d3e0c5a843ef'
      },
      nand2tetris: {
        git: `https://github.com/chivington/nand2tetris`,
        banner: '/portfolio/research/cs/cpu-arch/nand2tetris/banner.jpg',
        xor_gate: '/portfolio/research/cs/cpu-arch/nand2tetris/xor_gate.jpg',
        and_gate: '/portfolio/research/cs/cpu-arch/nand2tetris/and_gate.jpg',
        mux16_gate: '/portfolio/research/cs/cpu-arch/nand2tetris/mux16_gate.jpg',
      }
    },
    chemistry: {},
    presentations: {
      mltv:{
        banner: '/portfolio/presentations/mltv/banner.jpeg',
        highlight: '/portfolio/presentations/mltv/highlight.jpg',
        setup_1: '/portfolio/presentations/mltv/setup-1.jpg',
        setup_2: '/portfolio/presentations/mltv/setup-2.jpg',
        setup_3: '/portfolio/presentations/mltv/setup-3.jpg',
        laser_1: '/portfolio/presentations/mltv/laser-1.jpg',
        laser_2: '/portfolio/presentations/mltv/laser-2.jpg',
        ppt: `/portfolio/presentations/mltv/PHYS& 223 – Engineering Physics III - Final Presentation - MLTV .pptx`,
        pdf: `/portfolio/presentations/mltv/PHYS& 223 – Engineering Physics III - Final Presentation - MLTV .pdf`,
        symposium: 'https://sites.google.com/northseattle.edu/mltvdigitalpresentations2021/home#h.8o0gu9f83wix',
        lumiere: `https://www.gutenberg.org/files/14725/14725-h/14725-h.htm#Page_35`,
        snell_law : `https://www.britannica.com/science/Snells-law`,
        silica_idx: `https://www.filmetrics.com/refractive-index-database/SiO2/Fused-Silica-Silica-Silicon-Dioxide-Thermal-Oxide-ThermalOxide`,
        quartz_idx: `https://www.filmetrics.com/refractive-index-database/Quartz`
      },
      phys2_thermometer: {
        banner: `/portfolio/presentations/phys2-thermometer/banner.jpg`,
        analog_code: `/portfolio/presentations/phys2-thermometer/analog-code.jpg`,
        digital_code: `/portfolio/presentations/phys2-thermometer/digital-code.jpg`,
        setup: `/portfolio/presentations/phys2-thermometer/setup.jpg`,
        ppt: `/portfolio/presentations/phys2-thermometer/PHYS& 222 – Engineering Physics II - Final Practicum Presentation.pdf`
      },
      phys2_slidewire: {
        banner: `/portfolio/presentations/phys2-slidewire/banner.jpg`,
        diagram: `/portfolio/presentations/phys2-slidewire/diagram.jpg`,
        ppt: `/portfolio/presentations/PHYS& 222 – Engineering Physics II - Final Theory Presentation.pdf`
      }
    },
    resumes: {
      cv: '/portfolio/resumes/johnathan-chivington-cv.pdf',
      cover: '/portfolio/resumes/johnathan-chivington-cover.pdf',
      resume: '/portfolio/resumes/johnathan-chivington-resume.pdf',
      references: '/portfolio/resumes/johnathan-chivington-references.pdf'
    }
  },
  js:{
    app:'/js/app.js'
  },
  browserconfig:'/browserconfig.xml',
  favicon:'/favicon.ico',
  index:'/index.html',
  license:'/LICENSE',
  webmanifest:'/site.webmanifest'
};

// --------------------------------------------------------------------------------------------
//  Blueprint - Specifies inital app state.
// --------------------------------------------------------------------------------------------
const Blueprint = {
  app:{
    about:{},
    history:{
      actions: ['@@INIT'],
      actions_length: 5,
      views: ['@@INIT'],
      views_length: 5
    }
  },
  user:{
    name:'Johnathan Chivington',
    employer:`Eurofins Scientific`,
    title:`Laboratory Technician`,
    school:`University of West Florida`,
    major:`Physics`,
    work:{
      address:['3355 McLemore St. Pensacola, FL', 'https://www.google.com/maps/place/Eurofins+TestAmerica,+Pensacola/@30.5194576,-87.1970067,15z/data=!4m2!3m1!1s0x0:0xe44f6ffa29fadc49?sa=X&ved=2ahUKEwiU4p2n6u72AhWQSTABHZNIDf0Q_BJ6BAgpEAM'],
      email:'j.chivington@EurofinsET.com',
      phone:'850.474.1001',
      web:'https://www.eurofins.com/contact-us/worldwide-interactive-map/usa/eurofins-testamerica-pensacola/'
    },
    personal:{
      address:['12050 Scenic Hwy. Pensacola, FL', 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d54985.777402073196!2d-87.2882108!3d30.5320345!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8890eae222f45a3f%3A0x8efd15bc940ebc5e!2sWoodSpring%20Suites%20Pensacola%20Northeast!5e0!3m2!1sen!2sus!4v1648678291641!5m2!1sen!2sus'],
      email:'j.chivington@ieee.com',
      phone:'360.660.7499',
      web: `https://chivington.net`,
	  github:'https://github.com/chivington'
    },
    bio:{
      work: [
        `I am currently a full-time student at North Seattle College, pursuing an undergraduate degree in physics and math.`,
        `Most recently, I worked as a Fiscal Analyst at the University of Washington in the Department of Electrical & Computer Engineering (ECE) and the School of Social Work (SSW).`,
        `In ECE and SSW I supported a diverse portfolio of faculty in research Grant & Contract Management, working closely with federal agencies such as the National Institute of Health and the Department of Energy.`,
        `My professional background is in fiscal analysis, auditing and compliance, budgeting, business development, and sales management.`,
        `My research background is in machine learning & artificial intelligence, embedded systems, computer architecture, networking, and user interfaces.`
      ],
      education: [
        `After completing my undergraduate degree, I will continue research involving manufacturing and fabrication techniques for atomic-scale Field-Coupled Nanocomputing (FCN) platforms, particularly in the area of "Silicon Dangling Bonds" (SiDBs).`,
        `SiDBs are a promising avenue for developing robust, non-consumable, high-performance, atomic-scale computational platforms that operate near current theoretical limits, in terms of physical size and power consumption.`,
        `Eventually, I will be able to incorporate aspects of computer architecture, machine learning, distributed computing, SiDBs, etc. to develop computational systems at the atomic-scale.`,
        `Recently, I have been awarded an "S-STEM" scholarship through the NSF and this summer I am working with a faculty mentor on a project designing and building an Atomic Force Microscope that I will later build upon for working with SiDBs.`
      ],
      personal: [
        `Most of my free time is dedicated to my family, dog, and personal projects.`,
        `Lately I am focused on building an open source Raspberry Pi based smartphone, a low cost/high power pure sine wave inverter, and welding projects like a roof rack for my vehicle.`,
        `In general I tend to enjoy creative activities like wood or metal working and automating things around the house, as well as more physical activities like hiking, weight-lifting and snowboarding.`,
        `Eventually I want to get into more extreme hobbies like sky diving, building and flying small aircraft, long-distance sailing, and scuba diving.`
      ]
    },
    portfolio: {
      cs: {
        deep_learning: [{
          title: 'MNIST Polynomial Regression Classifier',
          banner: {src:Assets.portfolio.cs.mnist_poly_reg.banner, w:[75,95]},
          summary: `This is a Polynomial Regression model that learns to classify hand-written digits from the MNIST dataset. Try different values for 'lambda' and 'p' to experiment with output.`,
          sections: [{
            title: 'Usage',
            summary: `Below are the steps to use the classifier on MNIST data and some screenshots of the performance and results.`,
            content: [{
              media: [
                Assets.portfolio.cs.mnist_poly_reg.rand_img,
                Assets.portfolio.cs.mnist_poly_reg.errs_times,
                Assets.portfolio.cs.mnist_poly_reg.classification
              ],
              txt: [
                { align:'center', line:`Open the file 'mnist_polynomial_regression_classifier.py' and edit the hyperparameters 'lambda' (named "lambd" in the code since "lambda" is a reserved keyword in the Python programming language) and the vector 'p' to experiment with finding optimal values for accuracy and quick convergence. The program will:` },
                { align:'center', line:`` },
                { align:'left', line:`1. Load the MNIST dataset.` },
                { align:'left', line:`2. Split it into "training," "validation," and "testing" sets.` },
                { align:'left', line:`3. Display a random digit from the training set.` },
                { align:'left', line:`4. Train the model on the various p-values, displaying the training error, test error and training time.` },
                { align:'left', line:`5. Display a plot of the training errors, validation errors, training times, with respect to the various p-values.` },
                { align:'left', line:`6. Display a digit from the test set, along with it's classification and label.` },
                { align:'left', line:`7. Print out the final training and test set errors to the terminal.` },
                { align:'left', line:`8. End.` },
                { align:'center', line:`` },
				{ align:'center', line: `Large values of 'p' will result in increased training times. For my Surface Book (2.81ghz i7, 8gb ram, GeForce 940m), a p-value of 7500 takes ~374 seconds to train and achieves ~4.48% testing error rate, as shown in the images above. The datasets needed to train and make predictions are included and you should not have to move or rename any files or filenames in the code.`},
                { align:'left', line: `Full repository on GitHub:`}
			  ],
			  links: {
                GitHub_Repo: Assets.portfolio.cs.mnist_poly_reg.git
              }
            }]
          }]
        }],
        computer_architecture: [{
          title: 'Nand2Tetris',
          banner: {src:Assets.portfolio.cs.nand2tetris.banner, w:[65,95]},
          summary: `This is a VHDL/HDL project with all the components necessary for building a NAND-based general-purpose computer system and a modern software hierarchy from the ground up.`,
          sections: [{
            title: 'Code',
            summary: `Some of the annotated code, illustrating key concepts.`,
            content: [{
              media: [
                Assets.portfolio.cs.nand2tetris.xor_gate,
                Assets.portfolio.cs.nand2tetris.and_gate,
                Assets.portfolio.cs.nand2tetris.mux16_gate
              ],
			  txt: [
                {align:'left', line:`Full repository on GitHub:`}
			  ],
              links: {
				  GitHub_Repo: Assets.portfolio.cs.nand2tetris.git
			  }
            }]
          }]
        }],
        quantum_computation: [{
          title: 'Quantum Computation Hello World',
          banner: {src:Assets.portfolio.cs.qc_hello_world.qubit, w:[75,95]},
          summary: `These are basic quantum algorithms I'm working on to learn the basics of quantum computation.`,
          sections: [{
            title: 'Code',
            summary: `Some of the algorithms I am trying and tutorials that inspired them.`,
            content: [{
              media: [Assets.portfolio.cs.qc_hello_world.qc_code],
              txt: [
                { align:'center', line:`Links 1 and 2 below are working code I am using to learn the basics of quantum computation. The remaining links are materials I'm using as a guide.` }
			  ],
			  links: {
                Hello_World_Example_1: Assets.portfolio.cs.qc_hello_world.q_py1,
                Hello_World_Example_2: Assets.portfolio.cs.qc_hello_world.q_py2,
                Khan_Academy_Quantum_Tutorial: Assets.portfolio.cs.qc_hello_world.khan,
                Medium_Quantum_Tutorial: Assets.portfolio.cs.qc_hello_world.medium
              }
            }]
          }]
        }],
      },
      chemistry: {},
      engineering: {
        electronics: [{
          title: 'Open Phone',
          banner: {src:Assets.portfolio.engineering.open_phone.logo, w:[35,90]},
          summary: `The Open Phone is an open source, modular phone that gives users their choice of full PC operating system, and hardware components like screen, camera, battery, usb ports, etc. It is designed with security and privacy in mind and features a hardware power switch for the LTE radio. The Open Phone is also the perfect device for electronics engineers and hobbyists, as it features a full 40-pin GPIO header.`,
          sections: [{
            title: 'Materials',
            summary: `Below are some of the materials you need for the build.`,
            content: [{
              media: [Assets.portfolio.engineering.open_phone.sim_7600],
			  txt: [{ align:'center', line:'4G/3G/2G/GSM/GPRS/GNSS HAT for Raspberry Pi, Based on SIM7600X-H' }],
              links: {sim_7600_Wikipedia_Article: Assets.portfolio.engineering.open_phone.sim_7600_wiki}
            },{
              media: [Assets.portfolio.engineering.open_phone.pi_4],
			  txt: [{ align:'center', line:'Your choice of Raspberry Pi or similar computer. This build uses a Pi 4B 8GB model.' }],
              links: {Pi_Org: Assets.portfolio.engineering.open_phone.pi_org}
            },{
              media: [Assets.portfolio.engineering.open_phone.screen],
			  txt: [{ align:'center', line:'Your choice of screen. A 15-pin touchscreen is reccomended. This build will not cover how to connect a HDMI/USB-powered screen. This build uses the OSOYOO 7 Inch DSI Touch Screen LCD Display.' }],
              links: {Screen_on_Amazon: Assets.portfolio.engineering.open_phone.amzn_screen}
            },{
              media: [Assets.portfolio.engineering.open_phone.battery_bank],
			  txt: [{ align:'center', line:'Your choice of battery bank, but must be 18-18.5W output to power the Pi and screen effectively. This build uses the OKZU Slim Portable Charger.' }],
              links: {Power_Bank_on_Amazon: Assets.portfolio.engineering.open_phone.amzn_pwr_bnk}
            },{
              media: [Assets.portfolio.engineering.open_phone.camera],
			  txt: [{ align:'center', line:'Your choice of 15-pin camera. Some kits come with these. This build uses the OV5647 Mini Camera Module.' }],
              links: {Camera_on_Amazon: Assets.portfolio.engineering.open_phone.amzn_cam}
            },{
              media: [Assets.portfolio.engineering.open_phone.usb_hub],
			  txt: [{ align:'center', line:'A USB hub if you want additional USB ports. This build uses the BYEASY 4-Port USB 3.0 Hub.' }],
              links: {USB_Hub_on_Amazon: Assets.portfolio.engineering.open_phone.amzn_usb_hub}
            }]
          },{
            title: 'Hardware Build Process',
            summary: `Here are some pictures and videos I took of the hardware build process along the way. I replaced and removed some items to reduce the depth of the phone, and made some connections for the power supply, radio and GPIO header. Make sure to use solid core wire for all of the leads to make soldering easier.`,
            content: [{
              media: [
                Assets.portfolio.engineering.open_phone.port_strip_1,
                Assets.portfolio.engineering.open_phone.port_strip_2,
                Assets.portfolio.engineering.open_phone.usb_leads_1,
                Assets.portfolio.engineering.open_phone.pi_replaced_ports_1,
                Assets.portfolio.engineering.open_phone.pi_replaced_ports_2,
                Assets.portfolio.engineering.open_phone.power_supply_1,
                Assets.portfolio.engineering.open_phone.power_supply_2,
                Assets.portfolio.engineering.open_phone.screen_back_taped
              ],
              links: {},
              txt: [
                {align:'center', line:'Remove the double-stacked USB ports, ethernet port, and GPIO headers. Replace the USB ports with single-stacked ports and leave the ethernet port bare. Solder ribbon cables or jumpers into the GPIO header for mounting into the wall of the phone.'},
                {align:'center', line:'Solder a USB cable in into one of the unused USB ports for the LTE radio. You can solder the leads directly to the LTE board but I wanted to leave the plug so that I can easily remove the radio for use with other computers.'},
                {align:'center', line:'Solder two leads into the 5V and GND of your Raspberry Pi or chosen computer. Remove the battery and power circuitry from the power bank, remove one of the USB ports and attach the other ends of the 5V and GND leads from your computer to the corresponding 5V and GND of the removed USB port on the battery bank power board.'},
                {align:'center', line:'If your battery bank provides more than one USB charging port, leave it as-is if you want. I left the second port (orange USB port) functional for charging other devices, e.g. mini projectors, other phones, etc.'}
              ]
            }]
          },{
            title: 'Printing Process',
            summary: `Here are some pictures of the printing process along the way. I went through 5 major design changes, trying to balance size with risk to components.`,
            content: [{
              media: [
                Assets.portfolio.engineering.open_phone.completed_ports_angle_1,
                Assets.portfolio.engineering.open_phone.CAD_all,
                Assets.portfolio.engineering.open_phone.CAD_front,
                Assets.portfolio.engineering.open_phone.CAD_mid,
                Assets.portfolio.engineering.open_phone.CAD_back,
                Assets.portfolio.engineering.open_phone.completed_camera_1,
                Assets.portfolio.engineering.open_phone.completed_camera_2,
                Assets.portfolio.engineering.open_phone.completed_charge_ports_1,
                Assets.portfolio.engineering.open_phone.completed_usb_ports_1,
                Assets.portfolio.engineering.open_phone.completed_video_audio_ports,
                Assets.portfolio.engineering.open_phone.components_test_placement,
                Assets.portfolio.engineering.open_phone.components_test_placement_2,
                Assets.portfolio.engineering.open_phone.components_test_placement_3,
                Assets.portfolio.engineering.open_phone.test_print_mk_002_group,
                Assets.portfolio.engineering.open_phone.test_print_mk_002_single,
                Assets.portfolio.engineering.open_phone.test_print_mk_002_back_panel,
                Assets.portfolio.engineering.open_phone.test_print_mk_003_group,
                Assets.portfolio.engineering.open_phone.test_print_mk_004_slide_rail,
                Assets.portfolio.engineering.open_phone.test_print_switches,
                Assets.portfolio.engineering.open_phone.test_print_switches_2,
                Assets.portfolio.engineering.open_phone.back_panel_inner_1,
                Assets.portfolio.engineering.open_phone.back_panel_inner_2
              ],
              links: {
                Open_Phone_Mk_1: Assets.portfolio.engineering.open_phone.open_phone_mk_100,
                Mk_1_Front: Assets.portfolio.engineering.open_phone.mk_100_front,
                Mk_1_Back: Assets.portfolio.engineering.open_phone.mk_100_back,
                Mk_1_Mid: Assets.portfolio.engineering.open_phone.mk_100_mid
              },
              txt: [
                {align:'center', line:'The first 1-2 designs attempted to use the Pi as is without removing components, and extending ports from the Pi to the phone wall with cables. Ultimately, this did not provide a small enough device to prove useable. Later designs were targeted at the stripped Pi configuration.'},
                {align:'center', line:'The final design resulted in a depth/thickness ~3.7x most modern smartphones, ~27.5mm vs. iPhone 12 Pro Max 7.4mm. With the choice of screen, the height and width are almost identical to an iPhone 12 Pro Max at 169mm x 105mm, vs. iPhone at 160.8mm x 78.1mm.'},
                {align:'center', line:'Most of the depth in this build is due to the screen thickness alone. Future iterations will target an OLED screen with a drastically reduced depth, with the aim of reducing the overall depth ~5-8mm.'},
                {align:'center', line:`The switches aren't necessary if you want to use a regular switch for the radio power switch, but I wanted to experiment with building custom switches that I could print a lot of for various projects.`},
                {align:'center', line:`The back panel lifted off of the print bed slightly during printing, which is why there is a slight bow by the charging ports.`},
                {align:'center', line:`Below are the files of the most recent build.`}
              ]
            }]
          },{
            title: 'Software Development',
            summary: `Here are some demo videos I took of the software build process along the way, demonstrating various functionalities.`,
            content: [{
              media: [Assets.portfolio.engineering.open_phone.demo_call],
              links: {TK_Docs: Assets.portfolio.engineering.open_phone.tk_docs},
              txt: [{ align:'center', line:`Demo call and SMS from 4G LTE radio connected over USB to Pi and displayed over HDMI on tv. I didn't have an effective way of blurring the numbers so that's the reason for all the black squares. The later videos are better.` }]
            }]
          }]
        }]
      },
      physics: {
        nano: [{
          title: 'Atomic Force Microscope',
          banner: {src:Assets.portfolio.physics.afm.banner, w:[45,90]},
          summary: `This project details an AFM I am building as a research project to develop skills for working with nanoscale materials, such as imaging, nanopositioning, etc. This project will continue in phases of modification to add and enhance funcationalities over time. The first goal is imaging, after which I will work on functionalizing the AFM cantilever probe to allow it to apply small charges to precise surface locations for creating and breaking atomic bonds on silicon substrates.`,
          sections: [{
            title: 'Materials',
            summary: `These are some of the materials you will need for the project.`,
            content: [{
              media: [Assets.portfolio.physics.afm.BaTiO3],
              txt: [{ align:'center', line:'Barium Titanate used for fabrication of piezoelectric actuators and sensors. Piezoelectric actuators will drive the x, y, and z positioning stages.' }],
			  links: {
				Ted_Talk: Assets.portfolio.physics.afm.ted,
                ThermoFisher: Assets.portfolio.physics.afm.fisher,
                PubChem: Assets.portfolio.physics.afm.pubchem
              }
            }]
          }]
        }],
      },
      presentations: {
        mltv: [{
          title: 'Making Learning and Teaching Visible Symposium',
          banner: {src:Assets.portfolio.presentations.mltv.banner, w:[85,95]},
          summary: `This is a presentation I worked on with a group in Engineering Physics III for the MLTV Symposium at North Seattle College.`,
          sections: [{
            title: 'Presentation',
            summary: `Below are some images from the experiment and the PowerPoint presentation.`,
            content: [{
              media: [
                Assets.portfolio.presentations.mltv.highlight,
                Assets.portfolio.presentations.mltv.setup_1,
                Assets.portfolio.presentations.mltv.setup_2,
                Assets.portfolio.presentations.mltv.setup_3,
                Assets.portfolio.presentations.mltv.laser_1,
                Assets.portfolio.presentations.mltv.laser_2
              ],
			  txt: [{ align:'center', line:'Links to the symposium and citations from the presentation.' }],
              links: {
				MLTV_Symposium: Assets.portfolio.presentations.mltv.symposium,
                Lumiere: Assets.portfolio.presentations.mltv.lumiere,
                Snells_Law: Assets.portfolio.presentations.mltv.snell_law,
                Silica_Index: Assets.portfolio.presentations.mltv.silica_idx,
                Quartz_Index: Assets.portfolio.presentations.mltv.quartz_idx
              }
            }]
          }]
        }],
        phys2_thermometer: [{
          title: 'Engineering Physics II - Embedded Digital Thermometer (Arduino)',
          banner: {src:Assets.portfolio.presentations.phys2_thermometer.banner, w:[85,95]},
          summary: `This is a presentation for my final project in Engineering Physics II at North Seattle College.`,
          sections: [{
            title: 'Presentation',
            summary: `Below are some images from the experiment and the PowerPoint presentation.`,
            content: [{
              media: [
                Assets.portfolio.presentations.phys2_thermometer.setup,
                Assets.portfolio.presentations.phys2_thermometer.analog_code,
                Assets.portfolio.presentations.phys2_thermometer.digital_code
              ],
			  txt: [{ align:'center', line:'Images of the project setup and screenshots of the Arduino code.' }],
              links: {
				Power_Point: Assets.portfolio.presentations.phys2_thermometer.ppt
			  }
            }]
          }]
        }],
        phys2_slidewire: [{
          title: 'Engineering Physics II - Analysis of Induced EMF in a Slidewire',
          banner: {src:Assets.portfolio.presentations.phys2_slidewire.banner, w:[85,95]},
          summary: `This is a presentation for my final project in Engineering Physics II at North Seattle College.`,
          sections: [{
            title: 'Presentation',
            summary: `Below are some images from the experiment and the PowerPoint presentation.`,
            content: [{
              media: [
                Assets.portfolio.presentations.phys2_slidewire.diagram
              ],
			  txt: [{ align:'center', line:'Diagram of the theoretical setup and screenshots of the derivations and equations.' }],
              links: {
				Power_Point: Assets.portfolio.presentations.phys2_slidewire.ppt
			  }
            }]
          }]
        }]
      },
      resumes: {},
      placeholder: [{
        title: 'Coming soon...',
        banner: {src:Assets.imgs.thumbs.placeholder, w:[75,90]},
        summary: `I'm working on the content for this section now, check back soon...`,
        links: {},
        sections: []
      }]
    },
    chat: {
      selected: '@@INIT',
      users: [],
      threads: [],
      typing: ''
    },
    notifications: {
      permission: false
    }
  },
  ui:{
    map:{
      'HOME': {view:Views.Home, title:'Home', icon:Assets.imgs.me.win},
      'RESEARCH': {view:Views.Research, title:'Research', icon:Assets.imgs.me.win},
      'PUBLICATIONS': {view:Views.Publications, title:'Publications', icon:Assets.imgs.me.win},
      'ABOUT': {view:Views.About, title:'About', icon:Assets.imgs.me.win},
      'CONTACT': {view:Views.Contact, title:'Contact', icon:Assets.imgs.me.win},
      'CHAT': {view:Views.Chat, title:'Chat', icon:Assets.imgs.me.win},
      'LOGIN': {view:Views.Login, title:'Login', icon:Assets.imgs.me.win},
      'STAGING': {view:Views.Staging, title:'Staging', icon:Assets.imgs.me.win},
      'DEFAULT': {view:Views.Home, title:'Home', icon:Assets.imgs.me.win}
    },
    theme:{
      selected: 'dark',
      blue:{
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
        lt_txt: `rgba(255,255,255,1)`,
        dk_txt: `rgba(25,25,25,1)`,
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
        shadow: `rgba(50,50,50,0.9)`,
        success: '#4e4',
        error: '#e44',
        link: '#09f',
        clear: `rgba(0,0,0,0)`
      },
      dark:{
        header: `rgba(19,19,19,1)`,
        header_txt: `rgba(255,255,255,1)`,
        header_bdr: `rgba(255,255,255,0.6)`,
        menu: `rgba(21,32,43,0.9)`,
        menu_bdr: `rgba(255,255,255,0.9)`,
        menu_btn: `rgba(21,32,43,0.9)`,
        menu_sub: `rgba(70,87,117,0.5)`,
        menu_txt: `rgba(255,255,255,1)`,
        view: `rgba(70,77,97,0.9)`,
        view_bdr: `rgba(255,255,255,0.9)`,
        view_txt: `rgba(255,255,255,1)`,
        lt_txt: `rgba(255,255,255,1)`,
        dk_txt: `rgba(25,25,25,1)`,
        well: `rgba(70,87,117,0.9)`,
        panel_lt: `rgba(61,61,61,0.5)`,
        panel: `rgba(33,33,33,0.7)`,
        panel_drk: `rgba(11,11,11,0.7)`,
        btn: `rgba(53,92,146,1)`,
        btn_lt: `rgba(70,77,97,1)`,
        btn_bdr: `rgba(70,122,194,0.9)`,
        footer: `rgba(33,33,33,0.9)`,
        footer_bdr: `rgba(70,122,194,0.9)`,
        footer_txt: `rgba(255,255,255,1)`,
        shadow: `rgba(50,50,50,0.9)`,
        success: '#4e4',
        link: '#09f',
        error: '#e44',
        clear: `rgba(0,0,0,0)`
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
        lt_txt: `rgba(255,255,255,1)`,
        dk_txt: `rgba(25,25,25,1)`,
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
        shadow: `rgba(50,50,75,0.7)`,
        success: '#4e4',
        error: '#e44',
        link: '#09f',
        clear: `rgba(0,0,0,0)`
      },
      wp:{view:Assets.imgs.wp.yolo}
    },
    window:{
      width: window.innerWidth,
      height: window.innerHeight,
      mode: window.innerWidth<600?'mb':(window.innerWidth<700?'sm_tab':(window.innerWidth<800?'md_tab':(window.innerWidth<900?'lg_tab':'pc'))),
      orientation: window.innerWidth > window.innerHeight ? 'LANDSCAPE' : 'PORTRAIT'
    },
    header:{
      icon: Assets.imgs.icons.manifest.favicon,
      alt: 'chivington.net Icon',
      menu_btn: Assets.imgs.icons.btns.menu
    },
    menu:{
      current: 'CLOSED',
      previous: 'CLOSED',
      scrollTop: 0
    },
    view:{
      '@@ACTIONS': {
        'NAV_TO': (s,a) => ({current: a.payload, previous: s.current, scrollTop: 0}),
        'UPDATE_VIEW_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload})
      },
      current: 'HOME',
      previous: '@@INIT',
      scrollTop: 0
    },
    imgs: Assets.imgs
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
          actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type],
          views: s.views.length == Blueprint.app.history.views_length ? [...s.views.slice(1), a.payload] : [...s.views, a.payload]
        }),
        'TOGGLE_MENU': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'OPEN_MENU': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'CLOSE_MENU': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'CHANGE_THEME': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'RESIZE': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'BEGIN_THREAD': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'TYPING': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'UPDATE_THREAD': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'REFRESH_THREADS': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'DELETE_THREAD': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'DELETE_THREADS': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views})
      })
    })(state, action);
  },
  userState: function(state=Blueprint.user, action) {
    return Unity.combine({
      infoState: Unity.reducer(Blueprint.user, {}),
      portfolioState: Unity.reducer(Blueprint.user.portfolio, {}),
      chatState: Unity.reducer(Blueprint.user.chat, {
        'BEGIN_THREAD': (s,a) => ({selected:a.payload.thread.thread_name, users:[...s.users, a.payload.user], threads:[...s.threads, a.payload.thread], typing:''}),
        'TYPING': (s,a) => ({selected:s.selected, users:s.users, threads:s.threads, typing:a.payload}),
        'UPDATE_THREAD': (s,a) => ({selected:a.payload.thread.thread_name, users:s.users, typing:'', threads:s.threads.map(t => { if (t.thread_name==a.payload.thread.thread_name) t = a.payload.thread; return t; })}),
        'CHANGE_THREAD_SELECTION': (s,a) => ({selected:a.payload, users:s.users, threads:s.threads, typing:''}),
        'REFRESH_THREADS': (s,a) => ({selected:s.selected, users:s.users, threads:a.payload, typing:s.typing}),
        'DELETE_THREAD': (s,a) => ({selected:'@@INIT', users:s.users.filter(u => u !== a.payload.user), typing:'', threads:s.threads.filter(t => { if (t.thread_name!==a.payload.thread_name) return t; })}),
        'DELETE_THREADS': (s,a) => ({selected:'@@INIT', users:[], threads:[], typing:''})
      }),
      notificationState: Unity.reducer(Blueprint.user.notifications, {
        'GRANT_NOTIFICATIONS': (s,a) => ({permission: true})
      })
    })(state, action);
  },
  uiState: function (state=Blueprint.ui, action) {
    return Unity.combine({
      mapState: Unity.reducer(Blueprint.ui.map, {}),
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
      }),
      imgState: Unity.reducer(Blueprint.ui.imgs, {})
    })(state, action);
  }
};

// --------------------------------------------------------------------------------------------
//  Middlewares - Functions that intercept state changes.
// --------------------------------------------------------------------------------------------
const Middlewares = {
  // logActions: Unity.middlewares.logActions('@@INIT'),
  listenerBypass: Unity.middlewares.listenerBypass({
    'UPDATE_VIEW_SCROLL': ['Render_App'],
    'UPDATE_MENU_SCROLL': ['Render_App'],
    'TYPING': ['Render_App'],
    'REFRESH_THREADS': ['Render_App'],
    'BEGIN_THREAD': ['Render_App']
  }),
  cacheChat: Unity.middlewares.cacheChat(null)
};

// --------------------------------------------------------------------------------------------
//  Initialization - Initialize application with Blueprint & Asset Manifest.
// --------------------------------------------------------------------------------------------
const App_Root = document.getElementById('App_Root');
const Load_Screen_Root = document.getElementById('Load_Screen_Root');
Unity.initialize(App_Root,Load_Screen_Root,Blueprint,Reducers,Middlewares);
