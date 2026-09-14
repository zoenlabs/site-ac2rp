# AC2RP — site estático servido por nginx
FROM nginx:1.27-alpine

# Configuração do nginx (gzip, cache, headers de segurança)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Arquivos do site (cópia seletiva — sem Dockerfile/README/etc.)
COPY index.html favicon.ico robots.txt sitemap.xml site.webmanifest /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY termos /usr/share/nginx/html/termos
COPY politica-de-privacidade /usr/share/nginx/html/politica-de-privacidade

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
