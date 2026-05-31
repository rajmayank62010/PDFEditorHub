# PDFEditorHub — VPS Deployment Guide

## Prerequisites
- Ubuntu 22.04 LTS VPS (minimum 2 vCPU, 4GB RAM, 40GB SSD)
- Domain name pointed to your server IP
- SSH access

---

## 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y curl wget git ufw fail2ban

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Create deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy
```

---

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 3. Install .NET 9 (for non-Docker deployment)

```bash
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-9.0
```

---

## 4. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 5. Clone and Configure

```bash
cd /var/www
sudo git clone https://github.com/yourusername/pdfeditorhub.git
sudo chown -R deploy:deploy pdfeditorhub
cd pdfeditorhub

# Configure environment
cp backend/PDFEditorHub.API/appsettings.json backend/PDFEditorHub.API/appsettings.Production.json
# Edit appsettings.Production.json with your domain
```

---

## 6. SSL Certificate with Let's Encrypt

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d pdfeditorhub.com -d www.pdfeditorhub.com

# Certificates will be at:
# /etc/letsencrypt/live/pdfeditorhub.com/fullchain.pem
# /etc/letsencrypt/live/pdfeditorhub.com/privkey.pem

# Create SSL directory for nginx
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/pdfeditorhub.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/pdfeditorhub.com/privkey.pem nginx/ssl/
sudo chown -R deploy:deploy nginx/ssl

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet && cp /etc/letsencrypt/live/pdfeditorhub.com/*.pem /var/www/pdfeditorhub/nginx/ssl/ && docker-compose -f /var/www/pdfeditorhub/docker/docker-compose.yml restart nginx
```

---

## 7. Deploy with Docker Compose

```bash
cd /var/www/pdfeditorhub/docker

# Build and start
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f

# Restart services
docker-compose restart

# Update deployment
git pull
docker-compose up -d --build
```

---

## 8. Manual Deployment (without Docker)

### Backend (.NET)

```bash
cd /var/www/pdfeditorhub/backend
dotnet publish PDFEditorHub.API/PDFEditorHub.API.csproj -c Release -o /var/www/pdfeditorhub-api

# Create systemd service
sudo nano /etc/systemd/system/pdfeditorhub-api.service
```

```ini
[Unit]
Description=PDFEditorHub API
After=network.target

[Service]
Type=notify
User=deploy
WorkingDirectory=/var/www/pdfeditorhub-api
ExecStart=/usr/bin/dotnet PDFEditorHub.API.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=pdfeditorhub-api
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable pdfeditorhub-api
sudo systemctl start pdfeditorhub-api
sudo systemctl status pdfeditorhub-api
```

### Frontend (React)

```bash
cd /var/www/pdfeditorhub/frontend
npm ci
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/html/pdfeditorhub/
```

### Nginx (manual)

```bash
sudo apt install -y nginx
sudo cp /var/www/pdfeditorhub/nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

---

## 9. CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy PDFEditorHub

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/pdfeditorhub
            git pull origin main
            cd docker
            docker-compose up -d --build
            docker system prune -f
```

---

## 10. Monitoring

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Resource usage
docker stats

# Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

---

## Performance Tuning

- Set `worker_processes auto` in nginx.conf (already done)
- Increase `worker_connections` to 2048 for high traffic
- Configure swap: `sudo fallocate -l 2G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`
- Use a CDN (Cloudflare) in front for static assets

---

## Security Checklist

- [x] HTTPS with Let's Encrypt
- [x] Security headers (HSTS, CSP, X-Frame-Options)
- [x] Rate limiting on API endpoints
- [x] File type validation
- [x] File size limits (50MB)
- [x] No permanent file storage
- [x] Non-root Docker user
- [x] UFW firewall
- [x] Fail2ban for SSH protection
