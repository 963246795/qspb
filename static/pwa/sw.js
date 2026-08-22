// Service Worker - 轻松排班 PWA 离线缓存（通用版：不含哈希文件名，编译后无需修改）
// 使用方法：编译 H5 后，将本文件复制到 dist/web 根目录（与 index.html 同级）
const CACHE_NAME = 'paiban-v4-2026';

// 安装：只预缓存入口，其余资源运行时动态缓存
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['./', './index.html']).catch(function(err) {
        console.warn('[SW] 入口缓存失败（不影响使用）：', err);
      });
    })
  );
  self.skipWaiting();
});

// 激活：清理所有旧版本缓存
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

// 请求拦截：缓存优先，网络兜底，并把新资源动态写入缓存
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
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
