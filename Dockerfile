# ─────────────────────────────────────────────────────────────────
# BrainBerry – Production Dockerfile
# Serves the static learning platform via nginx:alpine
# ─────────────────────────────────────────────────────────────────

FROM nginx:alpine

LABEL maintainer="BrainBerry Team"
LABEL description="BrainBerry – Voice-driven learning platform for kids"
LABEL version="1.0.0"

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

# Copy all web-servable content to nginx html root
# .dockerignore ensures only relevant files are included
COPY . /usr/share/nginx/html/

# Clean up non-servable files that shouldn't be in the web root
RUN rm -f /usr/share/nginx/html/Dockerfile \
    && rm -f /usr/share/nginx/html/.dockerignore \
    && rm -f /usr/share/nginx/html/package.json \
    && rm -f /usr/share/nginx/html/README.md \
    && rm -f /usr/share/nginx/html/netlify.toml \
    && rm -f /usr/share/nginx/html/render.yaml \
    && rm -f /usr/share/nginx/html/CONTRIBUTING.md \
    && rm -f /usr/share/nginx/html/SECURITY.md \
    && rm -f /usr/share/nginx/html/LICENSE \
    && rm -f /usr/share/nginx/html/.env.example \
    && rm -f /usr/share/nginx/html/docker-compose.yml \
    && rm -rf /usr/share/nginx/html/.github \
    && rm -rf /usr/share/nginx/html/.git \
    && rm -rf /usr/share/nginx/html/docs \
    && rm -rf /usr/share/nginx/html/demo \
    && rm -rf /usr/share/nginx/html/node_modules \
    && rm -f /usr/share/nginx/html/config/nginx.conf \
    && rm -f /usr/share/nginx/html/config/firestore.rules

# Expose port 80 for HTTP traffic
EXPOSE 80

# Health check to verify nginx is serving content
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
