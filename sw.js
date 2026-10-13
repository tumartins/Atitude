/* Service worker — guarda o app no aparelho para abrir sem internet.
   AO PUBLICAR NOVA VERSÃO: mude VERSAO aqui (igual a APP_VERSAO no index.html).
   É a mudança deste arquivo que faz os aparelhos baixarem a atualização.
   Os DADOS ficam no IndexedDB e não são afetados por atualizações. */
const VERSAO = 'antropo-1.3.1';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  // cache: 'reload' evita pegar arquivo velho do cache HTTP do navegador
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('antropo-') && k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// A página pede para ativar a nova versão só quando o usuário toca em "Atualizar agora"
self.addEventListener('message', e => { if (e.data === 'ativar') self.skipWaiting(); });

// Cache primeiro: abre instantâneo e offline. Atualização chega pela troca de VERSAO.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(VERSAO).then(c =>
      c.match(req, { ignoreSearch: true })
        .then(r => r || (req.mode === 'navigate' ? c.match('./index.html') : null))
        .then(r => r || fetch(req))
    )
  );
});
