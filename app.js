 /* ------------------------------------------------------------------------------- *
 * Author: Johnathan Chivington                                                       *
 * Project: Personal Web App                                                        *
 * Description: Single page web app, modeled after Redux/React.                     *
 * Version: 0.0.1 - (production - see README.md)                                    *
 * -------------------------------------------------------------------------------- */

/* ----------------------------------- Modules ------------------------------------ *
 *           Barebones modules for initializing/maintaining app/UI state.           *
 * -------------------------------------------------------------------------------- */
// Creates elements and diffs/maintains vdom tree
const React = {
  createElement: function(elem, attrs, children) {
    const element = document.createElement(elem);

    if (attrs) Object.keys(attrs).forEach(k => element.setAttribute(k, attrs[k]));

    if (children.length >= 1) children.forEach(child => element.appendChild((typeof child == 'string')
      ? document.createTextNode(child) : ((child.elem) ? child.elem(child.props, child.dispatch, child.children) : child)
    ));

    return element;
  },
  createComponent: function() {}
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
  createReducer: function(defaultState, map) {
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
  createStore: function(rootReducer, middlewares = {}, history_length) {
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

    dispatch({type: '@@INIT'});
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
  }
};


/* ------------------------------- Asset Manifest --------------------------------- *
 *                         Everything needed to cache app.                          *
 * -------------------------------------------------------------------------------- */
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


/* ---------------------------------- Blueprint ----------------------------------- *
 *                            Specifies inital app state.                           *
 * -------------------------------------------------------------------------------- */
const Blueprint = {
  app: {
    about: {},
    history: {
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
      'React/Redux-Style Architecture', 'Responsive Design', 'Offline Capable', 'Network Detection', 'Customizable Themes'
    ]
  },
  device: {
    network: {
      downlink: navigator.connection ? navigator.connection.downlink : 10,
      effectiveType: navigator.connection ? navigator.connection.effectiveType : 'Connecting...',
      previousType: '@@INIT'
    },
    battery: 100
  },
  myInfo: {
    name: 'Johnathan Chivington',
    employer: `University of Washington`,
    title: `Fiscal Analyst`,
    school: `University of Washington`,
    major: `Physics & Electrical Engineering`,
    phones: [['Mobile Number', '303-900-2861'], ['Work Number', '206-897-1407']],
    emails: [['Personal Email', 'j.chivington@outlook.com'], ['Work Email', 'johnchiv@uw.edu']],
    web: {
      linkedin: 'https://linkedin.com/in/johnathan-chivington',
      github: 'https://github.com/chivington',
      twitter: 'https://twitter.com/jt_chivington',
      facebook: 'https://facebook.com/jt.chivington'
    },
    locations: [
      ['Home Address', '16th Ave NE Seattle, WA', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2684.205290399708!2d-122.3148723486745!3d47.71926458807909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490116804741175%3A0x9881011855bc85e5!2s12499-12355%2015th%20Ave%20NE%2C%20Seattle%2C%20WA%2098125!5e0!3m2!1sen!2sus!4v1585209347943!5m2!1sen!2sus'],
      ['Work Address', '185 E Stevens Way NE, Seattle, WA 98195', 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2687.591733504735!2d-122.3053456!3d47.6535!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x549014ed3251f07f%3A0x12de8b2d1ad8504a!2sPaul%20G.%20Allen%20Center%20for%20Computer%20Science%20%26%20Engineering!5e0!3m2!1sen!2sus!4v1585208912448!5m2!1sen!2sus']
    ],
    bio: {
      work: [
        `I'm a Fiscal Analyst at the University of Washington in the Department of Electrical & Computer Engineering.`,
        `I have a background in sales and business development, working in the retail, automotive parts, and SaaS industries.`,
        `I transitioned into Finance in 2018 while working at ABC Legal Services, a legal process service & e-filing automation company headquartered here in Seattle.`,
        `After working in temporary positions at UW for most of 2019, I found my current position in ECE.`,
        `I am truly blessed to work in such a great field, with such wonderful people at one of the best research institutions in the world.`,
        `However my aspirations lie at the intersection of Computer Science, Electrical & Computer Engineering, and Applied Physics so I'm pursuing an undergraduate Physics degree at UW.`
      ],
      education: [
        `I'm a student at North Seattle College and auditing a graduate Machine Learning course at the University of Washington this Spring.`,
        `One amazing benefit of working at UW is their employee tuition waiver program which enables employees to take up to 6 credit hours per quarter.`,
        `This was the primary motivating factor for me in seeking employment with UW and I'm utilizing this benefit to begin taking classes at UW this Summer as well.`,
        `After completing the required credits, I'll apply to UW's Physics program with the goal of pursuing a double major in Physics and Electrical Engineering.`
      ],
      personal: [
        `In my spare time I work on various research projects, study and care for my microscopic "pets" and spend time with my amazing girlfriend.`,
        `My research focus is in the interdisciplinary use of Artificial Intelligence, Wireless Embedded Systems, Power Electronics and MEMS/NEMS technologies in applications for Autonomous Manufacturing & Fabrication, as well as Energy Generation & Storage.`,
        `I'm currently researching Computer Architectures via a two-course series that culminates in a fully working 16-bit computer built from first principles of NAND gates.`,
        `I'm also acquiring various microscopic "pets" like Tardigrades and Planaria to research and care for.`,
        `When we're not terribly busy or quarantined by a global pandemic, my girlfriend and I also like to go hiking, swimming, walking our dog or anything outdoors.`,
        `Lately we've been focused on propogating our house plants and building a greenhouse in our back yard so we have a personal jungle year-round.`,
        `My "career" goals are also very personal to me though, so I tend to spend most of my spare time pursuing those.`
      ]
    }
  },
  ui: {
    map: {
      home: 'HOME',
      contact: 'CONTACT_ME',
      profile: 'PERSONAL_PROFILE',
      All_Research: ['ARTIFICIAL_INTELLIGENCE_RESEARCH', 'EMBEDDED_RESEARCH', 'WIRELESS_NETWORKING_RESEARCH']
    },
    theme: {
      selected: 'dark',
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
        menu: `rgba(112,140,188,0.5)`,
        menu_bdr: `rgba(25,25,25,0.9)`,
        menu_btn: `rgba(95,125,180,1)`,
        menu_sub: `rgba(112,140,188,0.5)`,
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
      wp: {
        view: Assets.imgs.wp.pnw
      }
    },
    window: {
      width: window.innerWidth,
      height: window.innerHeight,
      mode: window.innerWidth < 600 ? 'mobile' : (
        window.innerWidth < 750 ? 'small_tab' : (window.innerWidth < 900 ? 'large_tab' : 'desktop')
      )
    },
    header: {
      icon: Assets.imgs.icons.manifest.favicon,
      alt: 'chivington.io Icon',
      menu_btn: Assets.imgs.icons.btns.menu
    },
    menu: {
      current: 'CLOSED',
      previous: 'CLOSED',
      scrollTop: 0
    },
    view: {
      current: ['HOME', 'Home'],
      previous: '@@INIT',
      scrollTop: 0
    }
  }
};


/* ----------------------------------- Reducers ----------------------------------- *
 *        Functions that initialize state & reduce it on each state change.         *
 * -------------------------------------------------------------------------------- */
const Reducers = {
  appState: function(state = Blueprint.app, action) {
    return Redux.combineReducers({
      aboutState: Redux.createReducer(Blueprint.app.about, {}),
      historyState: Redux.createReducer(Blueprint.app.history, {
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
        'TOGGLE_EMBEDDED_RESEARCH_SUBMENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_WIRELESS_NETWORKING_RESEARCH_SUBMENU': (s,a) => ({
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
        'TOGGLE_EMBEDDED_RESEARCH_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'TOGGLE_WIRELESS_NETWORKING_RESEARCH_FOOTER_MENU': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        }),
        'RESIZE': (s,a) => ({
          actions: s.actions.length == 5 ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views
        })
      })
    })(state, action);
  },
  deviceState: function(state = Blueprint.device, action) {
    return Redux.combineReducers({
      networkState: Redux.createReducer(Blueprint.device.network, {
        'NET_STATE_CHANGE': (s,a) => a.payload,
        'NET_STATE_INIT': (s,a) => a.payload
      }),
      batteryState: Redux.createReducer(Blueprint.device.battery, {
        'BATTERY_STATE_CHANGE': (s,a) => a.payload,
        'BATTERY_STATE_INIT': (s,a) => a.payload
      })
    })(state, action);
  },
  myInfoState: function(state = Blueprint.myInfo, action) {
    return Redux.combineReducers({
      infoState: Redux.createReducer(Blueprint.myInfo, {})
    })(state, action);
  },
  uiState: function (state = Blueprint.ui, action) {
    return Redux.combineReducers({
      headerState: Redux.createReducer(Blueprint.ui.header, {
        'CHANGE_HEADER_ICON': (s,a) => ({icon: a.payload.icon, title: s.title}),
        'CHANGE_HEADER_TITLE': (s,a) => ({icon: s.icon, title: a.payload.title})
      }),
      menuState: Redux.createReducer(Blueprint.ui.menu, {
        'UPDATE_MENU_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload}),
        'NAV_TO': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_MENU': (s,a) => ({current: s.current == 'OPEN' ? 'CLOSED' : 'OPEN', previous: s.current, scrollTop: 0}),
        'OPEN_MENU': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: 0}),
        'CLOSE_MENU': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_THEME': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: a.payload})
      }),
      themeState: Redux.createReducer(Blueprint.ui.theme, {
        'TOGGLE_THEME': (s,a) => Object.assign({}, s, {selected: s.selected == 'dark' ? 'light' : 'dark'}),
        'TOGGLE_WP': (s,a) => Object.assign({}, s, Object.assign({}, s.wp, a.payload))
      }),
      viewState: Redux.createReducer(Blueprint.ui.view, {
        'NAV_TO': (s,a) => ({current: a.payload, previous: s.current, scrollTop: 0}),
        'UPDATE_VIEW_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload})
      }),
      windowState: Redux.createReducer(Blueprint.ui.window, {
        'RESIZE': (s,a) => a.payload
      })
    })(state, action);
  }
};


/* --------------------------------- Middlewares ---------------------------------- *
 *                      Functions that intercept state changes.                     *
 * -------------------------------------------------------------------------------- */
const Middlewares = {
  // logActions: Redux.storeMiddlewares.logActions('@@INIT'),
  listenerBypass: Redux.storeMiddlewares.listenerBypass({
    'NET_STATE_INIT': ['Render_App'],
    'UPDATE_VIEW_SCROLL': ['Render_App'],
    'UPDATE_MENU_SCROLL': ['Render_App']
  })
};


/* ---------------------------------- Components ---------------------------------- *
 *                        Important/reused modules, UI, etc.                        *
 * -------------------------------------------------------------------------------- */
const Components = {
  Router: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { current, previous } = state.uiState.viewState;
    const sameView = current == previous;
    const lastActionNav = state.appState.historyState.actions.slice(-1) == 'NAV_TO';
    const animate = lastActionNav && !sameView;

    const styles = {
      router: `position: fixed; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden; z-index: 5;`
    };

    const views = {
      'HOME': [Views.Home, 'Home'],
      'BLOG': [Views.Blog, 'Blog'],
      'CONTACT_ME': [Views.Contact, 'Contact Me'],
      'PERSONAL_PROFILE': [Views.Profile, 'Profile'],
      'ALL_RESEARCH': [Views.All_Research, 'All Research'],
      'ARTIFICIAL_INTELLIGENCE_RESEARCH': [Views.Artificial_Intelligence_Research, 'Artificial Intelligence Research'],
      'EMBEDDED_RESEARCH': [Views.Embedded_Research, 'Embedded Research'],
      'WIRELESS_NETWORKING_RESEARCH': [Views.Wireless_Networking_Research, 'Wireless & Networking Research'],
      'DEFAULT': [Views.Home, 'Home']
    };

    const selected = views[current[0]] ? views[current[0]] : views['DEFAULT'];
    const animation = animate ? `animation: viewSlideIn 250ms 1 forwards;` : ``;
    document.title = `chivington.io | ${selected[1]}`;

    return React.createElement('div', {style:styles.router}, [Components.View(store, selected[0], animation)]);
  },
  Network: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const { downlink, effectiveType, previousType } = state.deviceState.networkState;
    const offline = downlink == 0 ? true : false;
    const menu_opening = state.uiState.menuState.current == 'OPEN';
    const prevAction = state.appState.historyState.actions.slice(-1);
    const display = offline || prevAction == '@@INIT' || prevAction == 'NET_STATE_CHANGE';
    const lg_device = (state.uiState.windowState.mode == 'large_tab' || state.uiState.windowState.mode == 'desktop');

    const styles = {
      net: `
        position: absolute; top: ${lg_device?'5':'4'}em; left: 0; width: 100%; margin: 0; padding: 0.5em; z-index: 85;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-color: ${offline?theme.error:theme.success}; border-bottom: ${offline?theme.error:theme.success}; font-size: 1em; color: #252525;
        font-weight: bold; ${display ? `animation: flash_network 1700ms ease-in-out 1 forwards;` : `display: none;`}
      `
    };

    const Net = React.createElement('div', {style:styles.net}, [offline?'Offline':'Connected']);

    window.addEventListener('online', function(event) {
      if (effectiveType != previousType) dispatch({type: 'NET_STATE_CHANGE',  payload: {
        downlink: !!navigator.connection ? navigator.connection.downlink : 10,
        effectiveType: navigator.connection ? navigator.connection.effectiveType : 'Connecting...',
        previousType: effectiveType
      }});
    });

    window.addEventListener('offline', function(event) {
      if (effectiveType != previousType) dispatch({type: 'NET_STATE_CHANGE',  payload: {
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
    const lg_device = (windowState.mode == 'desktop' || windowState.mode == 'large_tab');
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = React.createElement;

    const styles = {
      header: `
        position: fixed; top: 0; left: 0; width: 100%; height: ${lg_device?'5':'4'}em; margin: 0; padding: 0; z-index: 90;
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
      if (viewState.current[0] != 'HOME') dispatch({type: 'NAV_TO', payload: ['HOME', 'Home']});
      if (viewState.current[0] == 'HOME' && current == 'OPEN') dispatch({type: 'CLOSE_MENU'});
    });

    const superscript = E('sup', {style:styles.super}, [viewState.current[1]]);

    const header_menu = E('div', {style: styles.header_menu}, [
      ['HOME', 'Home'], ['BLOG', 'Blog'], ['CONTACT_ME', 'Contact Me'], ['PERSONAL_PROFILE', 'Profile'], ['ALL_RESEARCH', 'Research']
    ].map((view, i, arr) => {
      const btn = E('h2', {style: i == arr.length-1 ? styles.header_qt : styles.header_btn}, [view[1]]);
      btn.addEventListener('click', () => {
        if (viewState.current[0] != view[0]) dispatch({type: 'NAV_TO', payload: view});
      });
      return btn;
    }));

    const menu_btn = E('img', {style: styles.menu_btn, src: menu_img, alt: 'Menu Button Icon'}, []);
    menu_btn.addEventListener('click', function(event) { dispatch({type: 'TOGGLE_MENU'}); });

    return E('div', {style:styles.header}, [
      E('div', {style: styles.header_left}, [ header_icon, superscript ]),
      E('div', {style: styles.header_right}, windowState.mode == 'desktop' ? [header_menu, menu_btn] : [menu_btn]),
    ]);
  },
  Menu: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { menuState, windowState } = state.uiState;
    const dark_theme = state.uiState.themeState.selected == 'dark';
    const { icons } = Assets.imgs;
    const menuWidth = windowState.mode == `desktop` ? `45%` : `100%`;
    const current_view = state.uiState.viewState.current[0];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const last_action = state.appState.historyState.actions.slice(-1);
    const closed_menu_last = !!(last_action == 'CLOSE_MENU' || last_action == 'TOGGLE_MENU');
    const lg_device = (windowState.mode == 'large_tab' || windowState.mode == 'desktop');
    const E = React.createElement;

    const styles = {
      menu: `
        position: fixed; top: ${lg_device?'5':'4'}em; left: 0; bottom: 0; width: ${menuWidth}; padding: 0; z-index: 80;
        background-color: ${theme.menu}; overflow-y: scroll; ${lg_device?`border-right: 1pt solid ${theme.menu_bdr};`:''}
        ${(menuState.current == 'OPEN') ? (menuState.previous == 'OPEN' ? `` : `animation: menu_opening 300ms ease-in-out 1 forwards;`) : (closed_menu_last ? `animation: menu_closing 300ms ease-in-out 1 forwards;` : ` display: none;`)}
      `,
      toggle_theme: `display: flex; flex-direction: row; justify-content: center; align-items: center; margin: 2em; padding: 0;`,
      toggle_theme_txt: `margin: 0; padding: 0; color: ${theme.menu_txt}`,
      toggle_theme_btn: `margin: 1em; padding: ${dark_theme?'0 1.5em 0 0':'0 0 0 1.5em'}; background-color: ${theme.panel}; border: 1.25pt solid ${dark_theme?theme.success:theme.menu_btn}; border-radius: 1.5em; cursor: pointer;`,
      toggle_theme_btn_slider: `height: 1.5em; width: 1.5em; margin: 0; padding: 0; background-color: ${dark_theme?theme.success:theme.panel}; border-radius: 100%;`,
      copy: `
        display: flex; flex-direction: column; justify-content: space-between; align-items: stretch; text-align: center; color: ${theme.menu_bdr};
        border-top: 1px solid ${theme.menu_bdr}; margin: 1em ${lg_device?'5em 5':'2em 2em 1'}em; padding: 1.5em; font-size: ${lg_device?'1':'0.9'}em;
      `,
      usa: `height: 1.5em; margin: 0.25em; font-size: 1.1em; color: ${theme.menu_txt};`,
      copy_txt: `font-size: 1.1em; margin: 0; color: ${theme.menu_txt};`
    };

    const submenu_config = {
      orientation: `PORTRAIT`,
      btns: [
        ['HOME', 'Home'],
        ['BLOG', 'Blog'],
        ['CONTACT_ME', 'Contact Me'],
        ['PERSONAL_PROFILE', 'Profile'],
        ['ALL_RESEARCH', 'All Research', [
          ['ARTIFICIAL_INTELLIGENCE_RESEARCH', 'Artificial Intelligence Research'], ['EMBEDDED_RESEARCH', 'Embedded Research'], ['WIRELESS_NETWORKING_RESEARCH', 'Wireless & Networking Research']
        ]]
      ]
    };

    const copy = E('div', {style: styles.copy}, [
      E('img', {src: icons.sm.usa, alt: `USA Icon `, style: styles.usa}, ['United States']),
      E('p', {style: styles.usa}, ['United States']),
      E('p', {style: styles.copy_txt}, ['Copyright © 2020 chivington.io']),
    ]);

    const toggle_theme = E('div', {style: styles.toggle_theme}, [
      E('h4', {style: styles.toggle_theme_txt}, [`Toggle dark mode`]),
      E('div', {style: styles.toggle_theme_btn}, [ E('div', {style: styles.toggle_theme_btn_slider}, []) ])
    ]);
    toggle_theme.lastChild.addEventListener('click', () => dispatch({type: 'TOGGLE_THEME', payload: store.getState().uiState.menuState.scrollTop}));

    const submenu = Components.Submenu(store, submenu_config);

    const Menu = React.createElement('div', {style: styles.menu}, [submenu, toggle_theme, copy]);
    setTimeout(event => Menu.scrollTo({top: menuState.scrollTop, left: 0, behavior: 'auto'}), 50);

    let scroll_ctr = 0;
    Menu.addEventListener('scroll', function(event) {
      const [ current_st, event_st ] = [ menuState.scrollTop, event.target.scrollTop ];
      const diff = (event_st - current_st) < 0 ? -(event_st - current_st) : (event_st - current_st);
      if (scroll_ctr++ % 2 == 0 && diff > 5) dispatch({type: 'UPDATE_MENU_SCROLL', payload: event_st});
    }, false);

    return Menu;
  },
  Submenu: function(store, submenu_config) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { menuState, windowState } = state.uiState;
    const { icons } = Assets.imgs;
    const dark_theme = state.uiState.themeState.selected == 'dark';
    const menuWidth = ((windowState.mode == `desktop`) || (windowState.mode == `large_tab`)) ? `35%` : `100%`;
    const current_view = state.uiState.viewState.current[0];
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const last_action = state.appState.historyState.actions.slice(-1);
    const closed_menu_last = !!(last_action == 'CLOSE_MENU' || last_action == 'TOGGLE_MENU');
    const lg_device = (windowState.mode == 'large_tab' || windowState.mode == 'desktop');
    const landscape = submenu_config.orientation == 'LANDSCAPE' && lg_device;
    const E = React.createElement;

    const styles = {
      container: `display: flex; flex-direction: ${landscape?'row':'column'}; justify-content: ${landscape?'center':'flex-start'}; align-items: ${landscape?'flex-start':'stretch'}; ${lg_device?``:`border-top: 1pt solid ${theme.menu_bdr};`}`,
      subnemu_wrapper: `margin: ${landscape?'0.5em':'0'}; padding: 0; display: flex; ${landscape?'flex: 1;':''} flex-direction: column; justify-content: flex-start; align-items: stretch; background-color: ${theme.menu_sub};`,
      parent_row: `margin: 0; padding: 0; width: 100%; max-height: 5em; display: flex; flex-direction: row; justify-content: stretch; align-items: center; background-color: ${theme.btn}; border-bottom: 1pt solid ${theme.menu_bdr};`,
      btn: `display: flex; flex: 1; margin: 0; padding: 1em; max-height: 2em; font-size: 1.1em; color: ${theme.menu_txt}; cursor: pointer; background-color: ${theme.btn}; border-bottom: 1pt solid ${theme.menu_bdr};`,
      dropdown: `width: 1.75em; margin: 0 1em; color: ${theme.menu_txt}; cursor: pointer;`,
      submenu: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; margin: 0; padding: 0; color: ${theme.menu_txt};`,
      sub_btn: `display: flex; flex: 1; margin: 0 0.25em; padding: 0.75em 2em; font-size: 1.1em; color: ${theme.menu_txt}; border-bottom: 1pt solid ${theme.menu_bdr}; cursor: pointer;`
    };

    const sub_states = {};

    const create_submenu = (sub_config, flag) => {
      const btns = flag ? sub_config : sub_config.btns;

      return btns.map((btn, i, arr) => {
        sub_states[btn[0]] = {current: lg_device?'OPEN':'CLOSED', previous: 'CLOSED'};

        const b = E('h3', {style: `${flag ? (i==btns.length-1 ? `${styles.sub_btn} border:none;` : styles.sub_btn) : styles.btn}`}, [btn[1]]);
        b.addEventListener('click', function(event) {
          if (state.uiState.viewState.current[0] != btn[0]) dispatch({type: `NAV_TO`, payload: [btn[0], btn[1]]});
          else if (menuState.current == 'OPEN') dispatch({type: 'CLOSE_MENU'});
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

          return E('div', {style: styles.subnemu_wrapper}, [
            E('div', {style: styles.parent_row}, [b, dropdown]),
            E('div', {style: `${styles.submenu} ${submenu_style}`}, create_submenu(btn[2], true))
          ]);
        } else return b;
      })
    };

    return E('div', {style: styles.container}, create_submenu(submenu_config, false));
  },
  View: function(store, view, animation) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { windowState, viewState, menuState, themeState } = state.uiState;
    const theme = themeState[themeState.selected];
    const { width, height, mode } = windowState;

    const styles = {
      view: `position: fixed; top: 0; right: 0; bottom: 0; left: 0; margin: 0; padding: 0; overflow-x: hidden; overflow-y: scroll; z-index: 10;
      background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('${themeState.wp.view}');
      background-position: center; background-size: cover; background-repeat: no-repeat;
      ${menuState.current == 'OPEN' ? ' filter: blur(5pt);' : ''} -webkit-overflow-scrolling: touch; background-color: ${theme.view}; ${animation}
      `
    };

    const View = React.createElement('div', {style:styles.view, content: `minimal-ui`}, [view(store), Components.Footer(store)]);
    setTimeout(event => View.scrollTo({top: viewState.scrollTop, left: 0, behavior: 'auto'}), 50);

    let scroll_ctr = 0;
    View.addEventListener('scroll', function(event) {
      const [ current_st, event_st ] = [ viewState.scrollTop, event.target.scrollTop ];
      const diff = (event_st - current_st) < 0 ? -(event_st - current_st) : (event_st - current_st);
      if (scroll_ctr++ % 2 == 0 && diff > 5) dispatch({type: 'UPDATE_VIEW_SCROLL', payload: event_st});
    }, false);

    View.addEventListener('click', function(event) {
      if (menuState.current == 'OPEN') dispatch({type: 'CLOSE_MENU'});
    });

    return View;
  },
  Product: function(store, product_config) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { mode } = state.uiState.windowState;
    const lg_device = ((mode == 'desktop') || (mode == 'large_tab')) ? true : false;
    const { beacon } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = React.createElement;

    const styles = {
      product: `margin: ${lg_device?'7em 2em 5':'5em 1em 3'}em; padding: 1em; background-color: ${theme.well};`,
      title: `margin: 0; padding: 0; border-bottom: 1pt solid ${theme.view_bdr}; text-align: center; color: ${theme.view_txt};`,
      subtitle: `margin: 0.75em; padding: 0; text-align: center; color: ${theme.view_txt};`,
      description: `
        display: flex; flex-direction: ${lg_device?'row':'column'}; justify-content: ${lg_device?'space-around':'flex-start'};
        align-items: ${lg_device?'center':'stretch'}; margin: 0; padding: 0; background-color: ${theme.panel}; color: ${theme.view_txt};
        border: 1pt solid ${theme.view_bdr};
      `,
      description_img: `margin: ${lg_device?'1em':'1em auto'}; padding: 0; border: 1pt solid ${theme.view_bdr}; ${lg_device?'height:225pt':`max-width:80%`};`,
      description_txt_wrapper: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;
        margin: ${lg_device?'1em 1em 1em 0':'1em'}; padding: 1em; background-color: ${theme.panel};
      `,
      description_txt: `margin: 0.25em; padding: 0; text-align: ${lg_device?'left':'center'}; color: ${theme.view_txt};`
    };

    const title = E('h1', {style: styles.title}, [product_config.title]);

    const subtitle = E('p', {style: styles.subtitle}, [product_config.subtitle]);

    const description = E('div', {style: styles.description}, [
      E('img', {style: styles.description_img, src: product_config.img, alt: `${product_config.title} Image`}, []),
      E('div', {style: styles.description_txt_wrapper}, product_config.description.map((sentence, i) =>
        E('p', {style: styles.description_txt}, [`${i > product_config.idx ? '• ' : ''}${sentence}`])
      ))
    ]);

    return E('div', {style: styles.product}, [ title, subtitle, description ])
  },
  Tiles: function(store, tile_config) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { mode } = state.uiState.windowState;
    const lg_device = ((mode == 'desktop') || (mode == 'large_tab')) ? true : false;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = React.createElement;

    const styles = {
      tiles_component: `
        display: flex; flex-direction: column; justify-content: space-around; align-items: stretch;
        margin: ${lg_device?'2':'1'}em; padding: 0.5em; background-color: ${theme.well};
      `,
      title: `margin: 0 0.5em; padding: 0.5em; border-bottom: 1pt solid ${theme.view_bdr}; font-size: 1.5em; text-align: center; color: ${theme.view_txt};`,
      subtitle: `margin: 0.75em; padding: 0; font-size: 1.15em; text-align: center; color: ${theme.view_txt};`,
      tiles: `
        display: flex; flex-direction: ${lg_device?'row':'column'}; justify-content: flex-start; align-items: stretch; padding: ${lg_device?'1.5':'0.5'}em;
        margin: ${lg_device?'1em 2':'0.5'}em; background-color: ${theme.panel}; ${lg_device?'overflow-x: scroll;':''} border: solid ${theme.footer_bdr}; border-width: 1pt 0;
      `,
      tile: `
        display: flex; flex-direction: column; justify-content: space-around; align-items: stretch; padding: ${lg_device?'1.5':'1'}em;
        margin: ${lg_device?'1.5':'0.5'}em; background-color: ${theme.panel};
        border: 1pt solid ${theme.view_bdr}; border-radius: 5pt; cursor: pointer;
      `,
      tile_img: `margin: ${lg_device?`0.5`:`0.25`}em auto; ${lg_device?'height:125pt':`max-width:80%`}; border: 1pt solid ${theme.view_bdr};`,
      tile_title: `margin: 1em auto 0.5em; color: ${theme.menu_txt}; font-size: ${lg_device?`1.25`:`1`}em; font-weight: 500; text-align: center; color: ${theme.view_txt};`
    };

    const title = E('h1', {style: styles.title}, [tile_config.title]);

    const subtitle = E('h2', {style: styles.subtitle}, [tile_config.subtitle]);

    const tiles = E('div', {style: styles.tiles}, tile_config.tiles.map((tile,i) => {
      const t = E('div', {style: styles.tile}, [
        E('img', {style: styles.tile_img, src: tile[2], alt: `${tile[1]} Thumbnail`}, []), E('h3', {style: styles.tile_title}, [tile[1]])
      ]);
      t.addEventListener('click', () => dispatch({type: 'NAV_TO', payload: [tile[0], tile[1]]}));
      return t;
    }));

    setTimeout(e => {
      if (lg_device) {
        const container_width = tiles.clientWidth;
        const tile_width = Object.keys(tiles.children).reduce((acc,cur,idx,arr) => tiles.children[arr[idx]].offsetWidth + acc, 0);
        if (tile_width > container_width) {
          tiles.style.cssText = `${styles.tiles} border-right: 1.5pt solid ${theme.view_bdr}; -webkit-box-shadow: inset -25px 5 50px -25px #000; padding: 3em;`
        }
      }
    }, 250);

    return E('div', {style: styles.tiles_component}, [ title, subtitle, tiles ]);
  },
  Footer: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { footerState, windowState } = state.uiState;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const lg_device = (windowState.mode == 'large_tab' || windowState.mode == 'desktop');
    const { icons, wp } = Assets.imgs;
    const E = React.createElement;

    const styles = {
      footer: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; padding: ${lg_device?'1em':'0'};
        margin: 0; z-index: 75; background-color: ${theme.footer}; border-top: 1pt solid ${theme.footer_bdr};
      `,
      msg: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; background-color: ${theme.panel};
        margin: 1em 1em 0; padding: ${lg_device?'2':'1'}em; border: solid ${theme.footer_bdr}; border-width: 1pt 0; font-size: 1.25em; font-weight: 700; text-align: center; color: ${theme.menu_txt};
        background: linear-gradient(${theme.panel}, ${theme.panel}), url('${wp.net}'); background-position: center; background-size: cover; background-repeat: no-repeat;
      `,
      quote_btn: `margin: 1em auto 0; padding: 0.5em 1em; background-color: ${theme.btn}; border: 1pt solid ${theme.menu_bdr}; color: ${theme.menu_txt}; cursor: pointer;`,
      submenus: `margin: 1em; padding: 0.5em;`,
      copy: `
        display: flex; flex-direction: row; justify-content: space-between; align-items: center; text-align: center;
        border-top: 1px solid ${theme.footer_bdr}; margin: 0; padding: ${lg_device?'1em 2em 0':'1em 1em 3em'}; font-size: 1em;
      `,
      copy_left: `display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; padding: 0;`,
      copy_right: `display: flex; flex-direction: row; justify-content: flex-end; align-items: flex-start; padding: 0; min-width: 30%;`,
      usa: `height: 1.5em; margin: 0 0.5em; color: ${theme.footer_txt};`,
      copy_txt: `font-size: 1em; color: ${theme.footer_txt};`
    };

    const msg = E('div', {style: styles.msg}, [`
      Makers of durable and reliable products for the aerosol can and commercial candy making industries. Our EVAC systems
      include aerosol can crusher machines and aerosol can disposal systems for recycling. Our innovative candy making
      equipment for production of candy sticks and canes and the sizing and cane forming of hard candy, taffy and caramel.
    `]);

    const submenu_config = {
      orientation: `LANDSCAPE`,
      btns: [
        ['HOME', 'Home', [
          ['BLOG', 'Blog'], ['CONTACT_ME', 'Contact Me'], ['PERSONAL_PROFILE', 'Profile']
        ]],
        ['ALL_RESEARCH', 'All Research', [
          ['ARTIFICIAL_INTELLIGENCE_RESEARCH', 'Artificial Intelligence Research'], ['EMBEDDED_RESEARCH', 'Embedded Research'], ['WIRELESS_NETWORKING_RESEARCH', 'Wireless & Networking Research']
        ]]
      ]
    };

    const submenus = E('div', {style: styles.submenus}, [ Components.Submenu(store, submenu_config) ]);

    const copy = E('div', {style: styles.copy}, [
      E('div', {style: styles.copy_left}, [ E('p', {style: styles.copy_txt}, ['Copyright © 2020 chivington.io']) ]),
      E('div', {style: styles.copy_right}, [
        E('p', {style: styles.usa}, ['Site designed & built by Johnathan Chivington']),
        E('img', {src: icons.sm.usa, alt: `USA Icon `, style: styles.usa}, ['United States'])
      ])
    ]);

    return E('div', {style: styles.footer}, [submenus, copy]);
  }
};


/* ------------------------------------ Views ------------------------------------- *
 *                        Groups Components to fit device.                          *
 * -------------------------------------------------------------------------------- */
const Views = {
  Home: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { appState, myInfoState, uiState } = state;
    const { name, phone, email, directions, employer, title, major, school, bio } = myInfoState.infoState;
    const { windowState } = uiState;
    const lg_device = ((windowState.mode == 'desktop') || (windowState.mode == 'large_tab')) ? true : false;
    const landing = ((appState.historyState.views.slice(-1)=='@@INIT') && (appState.historyState.actions.slice(-1)=='@@INIT')) ? true : false;
    const { thumbs } = Assets.imgs;
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = React.createElement;

    const styles = {
      home: `
        display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; padding: 0; width: 100%; text-align: center;
         ${landing?'animation: app_fade_in 900ms ease-in-out 1 forwards;':''}
      `,
      intro: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; margin: ${lg_device?'10em 1em 3':'7em 1em 2'}em;`,
      name: `margin: ${lg_device?`0.1`:`0.05`}em 0; color: #fff; font-size: ${lg_device?`5`:`4`}em; font-weight: 500;`,
      title: `margin: ${lg_device?`0.1`:`0.05`}em; color: #fff; font-size: ${lg_device?`2.5`:`1.5`}em; font-weight: 500;`,
      actions: `display: flex; flex-direction: ${lg_device?'row':'column'}; justify-content: center; align-items: ${lg_device?'center':'stretch'}; margin: 0 auto; padding: 0; ${lg_device?'':'width: 90%;'}`,
      action_btn: `margin: 0.5em ${lg_device?'':'auto'}; padding: 0.5em 1em; width: ${lg_device?'15em':'60%'}; border: 1pt solid #aaa; cursor: pointer;`,
      bio: `margin: ${lg_device?'2':'1'}em; padding: 1.5em ${lg_device?'0.5':'2.5'}em; border: 1px solid ${theme.view_bdr}; border-radius: 5px; background-color: ${theme.well};`,
      sentence: `color: ${theme.view_txt}; font-size: ${lg_device?'1.25':'1'}em; font-weight: 900; margin: 0.5em;`
    };

    const intro = E('div', {style: styles.intro}, [
      E('h1', {style: styles.name}, [ name ]), E('h2', {style: styles.title}, [ `${major} Student at ${school}` ])
    ]);

    const actions = E('div', {style: styles.actions}, [
      ['CONTACT_ME', 'Contact Me'], ['ALL_RESEARCH', 'View My Research']
    ].map((action_btn,i,arr) => {
      const b = E('h2', {style: `${styles.action_btn} background-color: ${i==0?theme.btn_lt:theme.btn_lt};`}, [action_btn[1]]);
      b.addEventListener('click', (event) => dispatch({type: 'NAV_TO', payload: [action_btn[0], action_btn[1]]}));
      return b;
    }));

    const work_bio = E('div', {style: styles.bio}, bio.work.map(s => E('p', {style: styles.sentence}, [s])));

    const tile_config = {
      title: `Research Areas`,
      subtitle: ``,
      tiles: [
        ['ARTIFICIAL_INTELLIGENCE_RESEARCH', 'Artificial Intelligence Research', thumbs.ai],
        ['EMBEDDED_RESEARCH', 'Embedded Controls Systems Research', thumbs.mcu],
        ['WIRELESS_NETWORKING_RESEARCH', 'Wireless & Networking Research', thumbs.iot]
      ]
    };

    const research_tiles = Components.Tiles(store, tile_config);

    return E('div', {style:styles.home}, [ intro, actions, work_bio, research_tiles ]);
  },
  Blog: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { wp, thumbs } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = React.createElement;

    const styles = {
      blogView: `
        margin: 4em auto; padding: 1em 0 0 0; width: 100%; min-height: 100%;
        display: flex; flex-direction: column; justify-content: flex-start; align-items: center;
      `,
      viewTitle: `margin: 0.75em auto 0.25em; color: ${theme.header_txt};`,
      blogPost: `
        margin: 1.25em auto 0; padding: 1.5em 0 0; width: 85%; border: 1pt solid ${theme.view_bdr}; border-radius: 6pt;
        background-color: ${theme.well}; text-align: center;
      `,
      blogImg: `border: 1px solid ${theme.view_bdr}; border-radius: 5pt;`,
      blogBody: `
        margin: 1.5em; display: flex; flex-direction: column; justify-content: space-around; text-align: left;
      `,
      paragraph: `margin: 0.5em 0.25em; text-indent: 50px; color: ${theme.view_txt};`,
      blogTags: `
        margin: 0 1em; padding: 1em; border-top: 1pt solid ${theme.view_bdr};
        display: flex; flex-direction: row; justify-content: space-around; align-items: center; flex-wrap: wrap;
      `,
      tag: `margin: 0.25em; color: ${theme.view_txt};`
    };

    // First Blog Post - Deploy & Secure a Server
    // 1. https/http2
    // 2. TLSv1.2
    // 3. A+ Qualsys SSL Labs Score (https://www.ssllabs.com/ssltest/analyze.html?d=chivington.io)
    // 4. A+ ImmuniWeb SSLScan Score (https://www.immuniweb.com/ssl/?id=RdHwgWdq)
    // 5. 100% on Google PageSpeed Insights (https://developers.google.com/speed/pagespeed/insights/?url=chivington.io)

    const posts = [{
      img: [thumbs.linear_gif, 'Linear Regression Thumbnail'],
      body: [
        `In an upcoming post I'll be discussing an interactive Linear Regression demo that I'll be hosting here on the Projects section. This will be a live Machine Learning model that will run in your browser and is the perfect tool to help explain the first principles to data science new-comers. `,
        `If you're interested in Machine Learning, Data Science, or Artificial Intelligence, this is a must have tool that will lay foundations for more complex and capable models like Neural Networks. `,
        `I'm really excited about it and will share more soon. Thanks for standing by.`
      ],
      tags: [
        `#LinearRegression `, `#DataScience`, `#MachineLearning`, `#Regularization`
      ]
    },{
      img: [thumbs.qualys, 'Qualys Thumbnail'],
      body: [
        `In an upcoming post, I'll be detailing all of the steps needed to set up and secure a "bare metal" Linux machine for hosting your own web apps. `,
        `We'll use NameCheap to get a domain name, DigitalOcean for the hosting, LetsEncrypt for SSL/TLS, Nginx for a proxy, and then we'll write our own backend app servers and load balancers in NodeJs. We'll also cover setting up SSH, configuring your firewall, and a few other administravtive and security server tasks. `,
        `This setup will have an A/A+ Qualsys SSL Labs Score, an A/A+ ImmuniWeb SSLScan Score, and will only cost you the price of your domain name (usually ~$15/year or less) and $5/month for the server. With this, you can host a number of web apps, databases, etc. and it'll take less than an hour to set up. `,
        `P.S. If you don't want to pay anything for a domain name or server at all, I'll be covering that shortly after so stay tuned.`
      ],
      tags: [
        `#ServerAdmin `, `#Security`, `#SSL`, `#TLS`, `#http2`, `#NameCheap`, `#DigitalOcean`, `#LetsEncrypt`, `#Nginx`, `#Linux`, `#NodeJs`
      ]
    }];

    return E('div', {style:styles.blogView}, [
      E('h1', {style: styles.viewTitle}, ['Johnathan Chivington Blog']),
      ...posts.map(post => E('div', {style:styles.blogPost}, [
        E('img', {style: styles.blogImg, width: '80%', src: post.img[0], alt: post.img[1]}, []),
        E('div', {style:styles.blogBody}, post.body.map(p => E('p', {style:styles.paragraph}, [p]))),
        E('div', {style:styles.blogTags}, post.tags.map(t => E('span', {style:styles.tag}, [t])))
      ]))
    ]);
  },
  Contact: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { wp, thumbs } = Assets.imgs;
    const { infoState } = state.myInfoState;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const E = React.createElement;
    const { mode } = state.uiState.windowState;
    const lg_device = ((mode == 'desktop') || (mode == 'large_tab')) ? true : false;

    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`,
      contact: `margin: ${lg_device?'7em 2em 5':'5em 1em 3'}em; padding: 1em; background-color: ${theme.well}; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch;`,
      title: `margin: 0 1em 1em; padding: 0.75em; border-bottom: 1pt solid ${theme.view_bdr}; text-align: center; color: ${theme.view_txt};`,
      intro: `margin: 0; padding: 0; text-align: center; color: ${theme.view_txt};`,
      sections: `margin: 1em; padding: 0; display: flex; flex-direction: ${lg_device?'row':'column'}; justify-content: space-around; align-items: center;`,
      section: `margin: 0.5em; padding: 0; text-align: center;`,
      section_title: `margin: 0; padding: 0; font-weight: bold; font-size: 1.1em; color: ${theme.view_txt};`,
      section_txt: `margin: 0; padding: 0; color: ${theme.view_txt};`,
      map: `border: 1px solid ${theme.footer}; margin: 1em auto; width: 95%; height: 250pt;`
    };

    const title = E('h1', {style: styles.title}, ['Contact Me']);

    const addresses = E('div', {style: styles.sections}, infoState.locations.map(section => E('div', {style: styles.section}, [
      E('h2', {style: styles.section_title}, [section[0]]), E('p', {style: styles.section_txt}, [section[1]])
    ])));

    const phones = E('div', {style: styles.sections}, infoState.phones.map(section => E('div', {style: styles.section}, [
      E('h2', {style: styles.section_title}, [section[0]]), E('p', {style: styles.section_txt}, [section[1]])
    ])));

    const map = E('iframe', { frameborder: '0', style: styles.map, allowfullscreen: '', src: infoState.locations[1][2] }, []);

    return E('div', {style: styles.view}, [
      E('div', {style: styles.contact}, [title, addresses, phones, map])
    ]);
  },
  Profile: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { wp, thumbs } = Assets.imgs;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const { bio } = state.myInfoState.infoState;
    const E = React.createElement;
    const { mode } = state.uiState.windowState;
    const lg_device = ((mode == 'desktop') || (mode == 'large_tab')) ? true : false;

    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`,
      profile: `margin: ${lg_device?'7em 2em 5':'5em 1em 3'}em; padding: 1em; background-color: ${theme.well};`,
      title: `margin: 0; padding: 0.25em; border-bottom: 1pt solid ${theme.view_bdr}; text-align: center; color: ${theme.view_txt};`,
      intro: `margin: 0.5em; padding: 0; text-align: center; color: ${theme.view_txt};`,
      bio: `margin: 1em 0 0; padding: 0;`,
      section: `margin: 1.5em 1em 1em; padding: 0;`,
      section_title: `margin: 0 0 0.5em; padding: 0 1em 0.5em; font-size: 1em; color: ${theme.view_txt}; border-bottom: 1pt solid ${theme.menu_bdr};`,
      section_txt: `margin: 0 0.5em; padding: 0; color: ${theme.view_txt};`,
      sentence: `margin: 0.25em; color: ${theme.view_txt};`
    };

    const title = E('h1', {style: styles.title}, ['Personal Profile']);

    const intro = E('p', {style: styles.intro}, [`intro`]);

    const full_bio = E('div', {style: styles.bio}, Object.keys(bio).map(section => E('div', {style: styles.section}, [
      E('h2', {style: styles.section_title}, [section.toUpperCase()]),
      ...bio[section].map((sentence, i) => E('span', {style: `${styles.sentence} ${i==0?'margin-left:3em;':''}`}, [sentence]))
    ])));

    return E('div', {style: styles.view}, [
      E('div', {style: styles.profile}, [title, full_bio])
    ]);
  },
  All_Research: function(store) {
    const { thumbs } = Assets.imgs;

    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%; padding: 6em 1em 3em;`
    };

    const tile_config = {
      title: `All Research Areas`,
      subtitle: `Choose an area to see specific projects.`,
      tiles: [
        ['ARTIFICIAL_INTELLIGENCE_RESEARCH', 'Artificial Intelligence Research', thumbs.ai],
        ['EMBEDDED_RESEARCH', 'Embedded Controls Systems Research', thumbs.mcu],
        ['WIRELESS_NETWORKING_RESEARCH', 'Wireless & Networking Research', thumbs.iot]
      ]
    };

    return React.createElement('div', {style: styles.view}, [ Components.Tiles(store, tile_config) ]);
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

    return React.createElement('div', {style: styles.view}, [ Components.Product(store, product_config) ]);
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

    return React.createElement('div', {style: styles.view}, [ Components.Product(store, product_config) ]);
  },
  Wireless_Networking_Research: function(store) {

    const styles = {
      view: `display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; min-height: 75%;`
    };

    const product_config = {
      title: `Wireless & Networking Research`,
      subtitle: `Low power, long range, control & monitoring systems.`,
      img: Assets.imgs.thumbs.iot,
      description: [
        `My current research focuses on the use of low-power networked embedded devices to:`,
        `Monitor various sensors and feeback loops for data collection and analysis`,
        `Decentralizing Deep Learning models across collections of embeeded TPUs`
      ],
      idx: 0
    };

    return React.createElement('div', {style: styles.view}, [ Components.Product(store, product_config) ]);
  }
};

const research_areas = {
  ai: {
    prediction: ['linear regression'],
    classification: ['binary logistic regression', 'multi-class logistic regression', 'neural networks', 'convolutional neural networks'],
    translation: ['recurrent neural networks']
  },
  embedded: {

  }
}

/* ------------------------------------- App -------------------------------------- *
 *                          Contains all root Components                            *
 * -------------------------------------------------------------------------------- */
const App = function(store) {
  const [ state, dispatch ] = [ store.getState(), store.dispatch ];
  const { width, height, mode } = state.uiState.windowState;

  const styles = {
    app: `position: fixed; top: 0; left: 0; height: 0%; width: 100%; margin: 0; padding: 0; z-index: 0;`
  };

  let resizeCtr = 0;
  window.addEventListener('resize', function(event) {
    if (resizeCtr++ % 5 == 0) {
      const [ nw, nh ] = [ window.innerWidth, window.innerHeight ];
      const nm = nw < 600 ? 'mobile' : (nw < 750 ? 'small_tab' : (nw < 900 ? 'large_tab' : 'desktop'));
      if (nm != mode) dispatch({type: 'RESIZE', payload: {width: nw, height: nh, mode: nm} });
    }
  });

  return React.createElement('div', {style:styles.app}, [
    Components.Header(store), Components.Menu(store), Components.Router(store), Components.Network(store)
  ]);
};


/* ----------------------------------- Rendering ---------------------------------- *
 *   Create ReduxStore & subscribe ReactDOM.render method to it, passing App. App   *
 * renders based on current ReduxStore state. State changes cause App to re-render. *
 * -------------------------------------------------------------------------------- *
 *   Note: Currently results in refresh of entire app. For most apps, this is fine. *
 * For very large apps like Googe Sheets, Word Online, etc., this can be a problem. *
 *                                                                                  *
 *   v2.0.0 will ship with fully-functional React-style DOM diffing engine. This    *
 * will render at most a single branch of the DOM Tree whose corresponding branch   *
 * of the vDOM tree has updates it's state.                                         *
 * -------------------------------------------------------------------------------- */

// App & Load Screen Roots
const App_Root = document.getElementById('App_Root');
const Load_Screen_Root = document.getElementById('Load_Screen_Root');

// Display rendered app & kill loading screen after 50ms
document.title = `chivington.io | Home`;
Load_Screen_Root.style.display = 'none';
App_Root.firstElementChild.style.display = 'none';
console.log(`${document.title}`);
console.log(`chivington.io | Killing load screen...`);
console.log(`chivington.io | Killing static application...`);

// Create root state reducer from Reducers.
const RootReducer = Redux.combineReducers(Reducers);

// Create ReduxStore, using RootReducer & Middlewares
const ReduxStore = Redux.createStore(RootReducer, Middlewares);

// Initial app render
ReactDOM.render(App, ReduxStore, App_Root);

// Subscribe render method to ReduxStore state updates
ReduxStore.subscribe({
  name: 'Render_App',
  function: ReactDOM.render,
  params: [App, ReduxStore, App_Root]
});

// setTimeout(console.log(document.getElementsByTagName('html')[0].innerHTML), 500);
