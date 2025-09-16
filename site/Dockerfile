FROM nginx:stable-alpine

# Copia gli asset statici
COPY --chown=nginx:nginx dist/site/browser/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
