// Service Worker - 轻松排班 PWA 离线缓存（根目录版，scope 覆盖全站）
const CACHE_NAME = 'paiban-v3-2026';
const ASSETS = [
  './',
  './index.html',
  './assets/uni.fc23c2ce.css',
  './assets/index-s_pPT4pf.js',
  './assets/index-wAAtYK8w.css',
  './assets/index-B8D03jBM.css',
  './assets/pages-index-index.CTnbYL0F.js',
  './assets/pages-profile-profile.Csamv4xS.js',
  './assets/pages-shift-cycle-shift-cycle.DkCIIiHF.js',
  './assets/pages-shift-manage-shift-manage.DHfcOL6q.js',
  './assets/profile-CnmAtxkW.css',
  './assets/shift-cycle-BbBoOrHG.css',
  './assets/shift-manage-CAB8I1zF.css',
  './assets/_plugin-vue_export-helper.BCo6x5W8.js',
  './assets/6666--gCsUQeg.png',
  './static/pwa/manifest.webmanifest',
  './static/pwa/icons/apple-touch-icon.png',
  './static/pwa/icons/icon-192.png',
  './static/pwa/icons/icon-512.png',
  './static/tab/home.png',
  './static/tab/home_selected.png',
  './static/tab/shift.png',
  './static/tab/shift_selected.png',
  './static/tab/profile.png',
  './static/tab/profile_selected.png',
  './static/tab/6666.png'
];

// 安装：预缓存核心资源
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) {
        console.warn('[SW] 部分资源缓存失败（不影响使用）：', err);
      });
    })
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，网络兜底
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        // 动态缓存新资源
        if (resp.ok && e.request.url.startsWith(self.location.origin)) {
          var respClone = resp.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, respClone);
          });
        }
        return resp;
      }).catch(function() {
        return cached || new Response('离线模式', { status: 503 });
      });
    })
  );
});
