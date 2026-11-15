"""Serveur local qui imite Vercel (URL sans .html, page 404.html).
Usage : python outils/serveur-local.py [port]   puis ouvrir http://localhost:8765
"""
import http.server
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        local = self.translate_path(path)
        if not os.path.exists(local) and os.path.exists(local + '.html'):
            self.path = path + '.html'
        elif not os.path.exists(local):
            self.send_response(404)
            body = open(os.path.join(ROOT, '404.html'), 'rb').read()
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            return __import__('io').BytesIO(body)
        return super().send_head()

    def log_message(self, *a):
        pass


Handler.extensions_map.update({'.webmanifest': 'application/manifest+json', '.js': 'text/javascript', '.svg': 'image/svg+xml'})

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
