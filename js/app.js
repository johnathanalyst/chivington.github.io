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
        'RESIZE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        })
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
  logActions: Unity.middlewares.logActions('@@INIT'),
  listenerBypass: Unity.middlewares.listenerBypass({
    'UPDATE_VIEW_SCROLL': ['Render_App'],
    'UPDATE_MENU_SCROLL': ['Render_App']
  })
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
    const lastActionNav = state.appState.historyState.actions.slice(-1)=='NAV_TO';
    const st = {router: `position:fixed; top:0; right:0; bottom:0; left:0; overflow:hidden; z-index:5;`};
    const selected = mapState.flat[current[0]]?mapState.flat[current[0]]:mapState.flat['DEFAULT'];
    const animation = lastActionNav && !sameView ? `animation:viewSlideIn 250ms 1 forwards;` : ``;
    document.title = `${state.userState.infoState.name} | ${selected[1]}`;
    return Unity.element('div', {style:st.router}, [Modules.View(store,selected[0],animation)]);
  },
  Header: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { viewState, menuState, windowState } = state.uiState;
    const { icons } = Assets.imgs;
    const { current, previous } = menuState;
    const dark_theme = state.uiState.themeState.selected == 'dark';
    const icon_img = dark_theme ? icons.manifest.favicon_wht : icons.manifest.favicon;
    const menu_img = dark_theme ? (current == 'OPEN' ? icons.btns.close_wht : icons.btns.menu_wht)  : (current == 'OPEN' ? icons.btns.close_blk : icons.btns.menu_blk);
    const last_action = state.appState.historyState.actions.slice(-1);
    const open_action = !!(previous == 'CLOSED' && current == 'OPEN');
    const close_action = !!(previous == 'OPEN' && current == 'CLOSED');
    const menu_action = !!(last_action == 'OPEN_MENU' || last_action == 'CLOSE_MENU' || last_action == 'TOGGLE_MENU');
    const lg_dev = (windowState.mode == 'pc' || windowState.mode == 'lg_tab');
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

    const header_icon = E('img', {style:st.icon, src: icon_img, alt: `Header Icon`}, []);
    header_icon.addEventListener('click', function(event) {
      if (viewState.current[0] != 'HOME') dispatch({type:'NAV_TO',payload:['HOME', 'Home']});
      if (viewState.current[0] == 'HOME' && current == 'OPEN') dispatch({type:'CLOSE_MENU'});
    });

    const superscript = E('sup', {style:st.super}, [viewState.current[1]]);

    const header_menu = E('div', {style:st.header_menu}, [
      ['HOME', 'Home'], ['BLOG', 'Blog'], ['CONTACT', 'Contact Me'], ['ABOUT', 'About Me'], ['RESEARCH', 'Research']
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
      E('div', {style:st.header_right}, windowState.mode == 'pc' ? [header_menu, menu_btn] : [menu_btn]),
    ]);
  },
  Menu: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {menuState,windowState,themeState,mapState} = state.uiState;
    const dark_theme = themeState.selected=='dark';
    const {icons} = Assets.imgs;
    const menu_width = windowState.mode==`pc`?`40%`:(windowState.mode==`lg_tab`?`40%`:(windowState.mode==`md_tab`?`45%`:`100%`));
    const current_view = state.uiState.viewState.current[0];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const last_action = state.appState.historyState.actions.slice(-1);
    const closed_menu_last = !!(last_action=='CLOSE_MENU'||last_action=='TOGGLE_MENU');
    const lg_dev = (windowState.mode=='lg_tab'||windowState.mode=='pc');
    const E = Unity.element;

    const st = {
      menu: `
        position:fixed; top:${lg_dev?'5':'4'}em; left:0; bottom:0; width:${menu_width}; padding:0; z-index:80; background-color:${theme.menu}; overflow-y:scroll; ${lg_dev?`border-right:1pt solid ${theme.menu_bdr};`:''}
        ${(menuState.current=='OPEN')?(menuState.previous=='OPEN'?``:`animation:menu_opening 300ms ease-in-out 1 forwards;`):(closed_menu_last?`animation:menu_closing 300ms ease-in-out 1 forwards;`:`display:none;`)}
      `,
      settings: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0; padding:1em;`,
      toggle: `display:flex; flex-direction:row; justify-content:center; align-items:center; margin:2em; padding:0;`,
      tg_txt: `margin:0; padding:0; color:${theme.menu_txt}`,
      tg_btn: `margin:1em; padding:${dark_theme?'0 0 0 1.5em':'0 1.5em 0 0'}; background-color:${theme.panel}; border:1.25pt solid ${dark_theme?theme.success:theme.menu_bdr}; border-radius:1.5em; cursor:pointer;`,
      slider: `height:1.5em; width:1.5em; margin:0; padding:0; background-color:${dark_theme?theme.success:theme.btn}; border-radius:100%;`,
      copy: `
        display:flex; flex-direction:column; justify-content:space-between; align-items:stretch; text-align:center; color:${theme.menu_bdr};
        border-top:1px solid ${theme.menu_bdr}; margin:1em ${lg_dev?'5em 5':'2em 2em 1'}em; padding:1.5em; font-size:${lg_dev?'1':'0.9'}em;
      `,
      copy_txt: `font-size:1.1em; margin:0; color:${theme.menu_txt};`,
      usa: `height:1.5em; margin:0.25em; font-size:1.1em; color:${theme.menu_txt};`
    };

    const toggle = E('div',{style:st.toggle},[E('h4',{style:st.tg_txt},[`Toggle dark mode`]),E('div',{style:st.tg_btn},[E('div',{style:st.slider},[])])]);
    toggle.lastChild.addEventListener('click',()=>dispatch({type:'TOGGLE_THEME',payload:store.getState().uiState.menuState.scrollTop}));

    const copy = E('div', {style:st.copy}, [
      E('img',{src:icons.sm.usa,alt:`USA Icon`,style:st.usa},[]),
      E('p',{style:st.usa},['United States']),
      E('p',{style:st.copy_txt},['Copyright © 2020 chivington.net']),
    ]);
    copy.firstChild.addEventListener('click',e=>dispatch({type:`NAV_TO`,payload:[`MESSAGES`,`Messages`]}));

    const Menu = Unity.element('div',{style:st.menu},[toggle,copy]);
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

    const View = Unity.element('div', {style:st.view,content:`minimal-ui`}, [view(store)]);
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
    const {name,phone,email,directions,employer,title,major,school,bio} = userState.infoState;
    const {windowState,mapState} = uiState;
    const lg_dev = ((windowState.mode=='pc')||(windowState.mode=='lg_tab'))?true:false;
    const landing = ((appState.historyState.views.slice(-1)=='@@INIT')&&(appState.historyState.actions.slice(-1)=='@@INIT'))?true:false;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      home: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:0; width:100%; text-align:center; ${landing?'animation: app_fade_in 900ms ease-in-out 1 forwards;':''}`,
      intro: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:${lg_dev?'8em 1em 2':'6em 1em 2'}em;`,
      name: `margin:0 auto; color:${theme.lt_txt}; font-size:4em; font-weight:400;`,
      title: `margin:0.25em; color:${theme.lt_txt}; font-size:${lg_dev?1.5:1.3}em; font-weight:300;`,
      actions: `display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:center; align-items:${lg_dev?'center':'stretch'}; margin:0 auto; padding:0; width:${lg_dev?80:90}%;`,
      btn: `margin:0.5em ${lg_dev?'':'auto'}; padding:0.4em 0.6em; width:${lg_dev?50:80}%; background-color:${theme.btn}; border:1pt solid ${theme.btn_bdr}; color:${theme.lt_txt}; cursor:pointer;`,
      bio: `margin:${lg_dev?2:1}em; padding:${lg_dev?`1`:`0.25`}em; border:1px solid ${theme.view_bdr}; background-color:${theme.well};`,
      sentence: `color:${theme.view_txt}; font-size:${lg_dev?1.25:1}em; font-weight:700; margin:0.5em;`,
      tiles: `margin:${lg_dev?`0 2em 2`:`0 1em 1`}em;`
    };

    const intro = E('div',{style:st.intro},[
      E('h1',{style:st.name},[name]), E('h2',{style:st.title},[`${major} Student at ${school}`
    ])]);

    const actions = E('div',{style:st.actions},[['CONTACT','Contact Me'],['RESEARCH','View My Research']].map((b,i,arr) => {
      const btn = E('h2', {style: st.btn}, [b[1]]); btn.addEventListener('click', (event)=>dispatch({type:'NAV_TO',payload:[b[0], b[1]]})); return btn;
    }));

    const work = E('div',{style:st.bio},bio.work.map(s=>E('p',{style:st.sentence},[s])));

    return E('div',{style:st.home},[intro,actions,work]);
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
      lnk: ` color:#09f; margin: 0 0.5em; text-decorate:underline;`,
      map:`border:1px solid ${theme.footer_bdr}; margin:1em auto; width:95%; height:250pt;`
    };

    return E('div', {style:st.view}, [
      E('div',{style:st.contact},[
        E('h1',{style:st.title},['Get In Touch']),
        E('div',{style:st.sections},[
          E(`div`,{style:st.section},[`Phone`,E(`div`,{style:st.wrp},[E(`a`,{href:`tel:${work.phone}`,target:`_blank`,style:st.lnk},[work.phone])])]),
          E(`div`,{style:st.section},[`Email`,E(`div`,{style:st.wrp},[E(`a`,{href:`mailto:${work.email}`,target:`_blank`,style:st.lnk},[work.email])])]),
          E(`div`,{style:st.section},[`Web`,E(`div`,{style:st.wrp},[E(`a`,{href:work.web,target:`_blank`,style:st.lnk},[work.web])])]),
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
        caret_blk:'/imgs/icons/btns/caret-blk.svg'
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
      network:{
        no_wifi_1:'/imgs/icons/network/no-wifi-1.svg',
        no_wifi_2:'/imgs/icons/network/no-wifi-2.svg',
        wifi:'/imgs/icons/network/wifi.svg'
      },
      sm:{
        dl_blk:'/imgs/icons/sm/dl-blk.svg',
        dl_wht:'/imgs/icons/sm/dl-wht.svg',
        resume_blk:'/imgs/icons/sm/resume-blk.svg',
        resume_wht:'/imgs/icons/sm/resume-wht.svg',
        email_blk:'/imgs/icons/sm/email-blk.svg',
        email_wht:'/imgs/icons/sm/email-wht.svg',
        fb:'/imgs/icons/sm/fb.svg',
        git_blk:'/imgs/icons/sm/git-blk.svg',
        git_wht:'/imgs/icons/sm/git-wht.svg',
        jc_pbc_blk:'/imgs/icons/sm/jc-pcb-blk.svg',
        jc_pbc_wht:'/imgs/icons/manifest/mstile-150x150.png',
        li_blk:'/imgs/icons/sm/li-blk.svg',
        li_wht:'/imgs/icons/sm/li-wht.svg',
        phone_blk:'/imgs/icons/sm/phone-blk.svg',
        phone_wht:'/imgs/icons/sm/phone-wht.svg',
        twt_blk:'/imgs/icons/sm/twt-blk.svg',
        twt_wht:'/imgs/icons/sm/twt-wht.svg',
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
    thumbs:{
      ai:'/imgs/thumbs/ai.jpg',
      ui:'/imgs/thumbs/ui.jpg'
    },
    wp:{
      fragmented:'/imgs/wp/fragmented.jpg',
      geo_sphere:'/imgs/wp/geo-sphere.jpg',
      math:'/imgs/wp/math.jpg',
      pnw:'/imgs/wp/pnw.jpg',
      seattle:'/imgs/wp/seattle.jpg',
      yolo:'/imgs/wp/yolo.jpg'
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
    about:{
      '@@ACTIONS':{}
    },
    history:{
      '@@ACTIONS':{
        'NAV_TO':(s,a) => ({
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
        'RESIZE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        })
      },
      actions: ['@@INIT'],
      views: ['@@INIT']
    }
  },
  user:{
    name:'Johnathan Chivington',
    employer:`University of Washington`,
    title:`Fiscal Analyst`,
    school:`North Seattle College`,
    major:`Physics`,
    work:{
      address:['16th Ave NE Seattle, WA', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2684.205290399708!2d-122.3148723486745!3d47.71926458807909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490116804741175%3A0x9881011855bc85e5!2s12499-12355%2015th%20Ave%20NE%2C%20Seattle%2C%20WA%2098125!5e0!3m2!1sen!2sus!4v1585209347943!5m2!1sen!2sus'],
      email:'john@chivington.net',
      phone:'303.900.2861',
      web:'https://chivington.net'
    },
    personal:{
      address:['16th Ave NE Seattle, WA', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2684.205290399708!2d-122.3148723486745!3d47.71926458807909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490116804741175%3A0x9881011855bc85e5!2s12499-12355%2015th%20Ave%20NE%2C%20Seattle%2C%20WA%2098125!5e0!3m2!1sen!2sus!4v1585209347943!5m2!1sen!2sus'],
      email:'j.chivington@outlook.com',
      phone:'303.900.2861',
      web: `https://github.com/chivington`
    },
    social:{
      facebook:'https://facebook.com/jt.chivington',
      github:'https://github.com/chivington',
      linkedin:'https://linkedin.com/in/johnathan-chivington',
      twitter:'https://twitter.com/jt_chivington'
    },
    bio:{
      work: [
        `I am currently a full-time student at North Seattle College, pursuing a double-major in math and physics.`,
        `Most recently, I worked as a Fiscal Analyst at the University of Washington in the Department of Electrical & Computer Engineering, where I supported a diverse portfolio of research faculty in Grant & Contract Management.`,
        `My professional background has been in fiscal analysis, budgeting, business development, and sales management.`,
        `My research background has been in machine learning & artificial intelligence, embedded systems, networking, and user interfaces.`,
        `Curently, I am focused on quantum computational models and computers, as well as manufacturing techniques for atomic-scale computer technologies.`
      ],
      education: [
        `This.`
      ],
      personal: [
        `My career.`
      ]
    }
  },
  ui:{
    '@@ACTIONS':{},
    map:{
      flat:{
        'HOME':[Views.Home,'Home',Assets.imgs.me.win],
        'ABOUT':[Views.About,'About Me',Assets.imgs.thumbs.win],
        'CONTACT':[Views.Contact,'Contact Me',Assets.imgs.thumbs.win],
        'DEFAULT':[Views.Home,'Home',Assets.imgs.thumbs.ai]
      },
      tree: [
        ['HOME','Home'],
        ['ABOUT','About Me'],
        ['CONTACT','Contact Me'],
        ['RESEARCH','Research', [
          ['AI_RESEARCH','Artificial Intelligence Research'],
          ['CPU_EGR_RESEARCH','Computer Engineering Research'],
          ['UI_RESEARCH','UI Architectures Research']
        ]]
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
        success: '#7e7',
        error: '#e77'
      },
      wp:{view:Assets.imgs.wp.pnw}
    },
    window:{
      width: window.innerWidth,
      height: window.innerHeight,
      mode: window.innerWidth<600?'mb':(window.innerWidth<700?'sm_tab':(window.innerWidth<800?'md_tab':(window.innerWidth<900?'lg_tab':'pc')))
    },
    header:{
      '@@ACTIONS':{
        'CHANGE_HEADER_ICON': (s,a) => ({icon: a.payload.icon, title: s.title}),
        'CHANGE_HEADER_TITLE': (s,a) => ({icon: s.icon, title: a.payload.title})
      },
      icon: Assets.imgs.icons.manifest.favicon,
      alt: 'chivington.net Icon',
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
