this.addEventListener("install", function(event) {
  event.waitUntil(caches.create("chivingtoninc-v1".then(function(cache) {
    return cache.add({
      './index.html',
      './app.js',
      './sw.js',
      './favicon.ico',
      './site.webmanifest',
      './includes/docs/j.Chivington.Cover.docx',
      './includes/docs/j.Chivington.Cover.pdf',
      './includes/docs/j.Chivington.Resume.docx',
      './includes/docs/j.Chivington.Resume.pdf',
      './includes/fonts/Avenir-Book.otf',
      './imgs/content/hello.png',
      './imgs/content/step1.jpg',
      './imgs/content/step2.jpg',
      './imgs/icons/sm/brain.svg',
      './imgs/icons/sm/dl.svg',
      './imgs/icons/sm/email.svg',
      './imgs/icons/sm/fb.svg',
      './imgs/icons/sm/git.svg',
      './imgs/icons/sm/li.svg',
      './imgs/icons/sm/phone.svg',
      './imgs/icons/sm/twt.svg',
      './imgs/icons/android-chrome-192x192.png',
      './imgs/icons/android-chrome-512x512.png',
      './imgs/icons/apple-touch-icon.png',
      './imgs/icons/browserconfig.xml',
      './imgs/icons/favicon-16x16.png',
      './imgs/icons/favicon-32x32.png',
      './imgs/icons/mstile-70x70.png',
      './imgs/icons/mstile-144x144.png',
      './imgs/icons/mstile-150x150.png',
      './imgs/icons/mstile-310x150.png',
      './imgs/icons/mstile-310x310.png',
      './imgs/icons/safari-pinned-tab.png',
      './imgs/me/me-n-win.jpg',
      './imgs/me/me.jpg',
      './imgs/wp/fragmented.jpg',
      './imgs/wp/math.jpg',
      './imgs/wp/pnw.jpg'
    });
  })));
});

this.addEventListener("fetch", function(event) {
  console.log("\n FETCH IS GOING TO HAPPEN!");
});
