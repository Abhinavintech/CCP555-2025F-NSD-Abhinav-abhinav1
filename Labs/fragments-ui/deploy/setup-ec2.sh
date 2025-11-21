#!/usr/bin/env bash
set -euo pipefail

# Usage: sudo ./setup-ec2.sh your-domain.example.com
DOMAIN=${1:-}
if [ -z "$DOMAIN" ]; then
  echo "Usage: sudo $0 your-domain"
  exit 1
fi

echo "Installing prerequisites..."
yum update -y || apt-get update -y
# Install nginx and certbot
if command -v yum >/dev/null 2>&1; then
  yum install -y nginx git
  curl -sL https://rpm.nodesource.com/setup_18.x | bash -
  yum install -y nodejs
else
  apt-get install -y nginx git curl
  curl -sL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

echo "Building fragments-ui..."
cd /var/www || exit 1
if [ ! -d fragments-ui ]; then
  git clone https://github.com/Abhinavintech/CCP555-2025F-NSD-Abhinav-abhinav1.git fragments-ui-repo
  mv fragments-ui-repo/Labs/fragments-ui fragments-ui
fi
cd fragments-ui
npm ci
npm run build

echo "Copying built files to /var/www/fragments-ui/dist"
mkdir -p /var/www/fragments-ui/dist
cp -a dist/* /var/www/fragments-ui/dist/

echo "Installing nginx config"
NGINX_CONF=/etc/nginx/conf.d/fragments-ui.conf
sudo cp deploy/nginx.conf.template "$NGINX_CONF"
sudo sed -i "s/YOUR_DOMAIN_OR_EC2_PUBLIC_DNS/$DOMAIN/g" "$NGINX_CONF"

echo "Restarting nginx"
systemctl enable nginx
systemctl restart nginx

echo "Obtaining TLS cert with certbot... (you will need EPEL/certbot available)"
if ! command -v certbot >/dev/null 2>&1; then
  if command -v yum >/dev/null 2>&1; then
    yum install -y epel-release
    yum install -y certbot python3-certbot-nginx
  else
    apt-get install -y certbot python3-certbot-nginx
  fi
fi
certbot --nginx -d "$DOMAIN"

echo "Setup complete. UI is served at https://$DOMAIN and proxied /v1/ to localhost:8080"
