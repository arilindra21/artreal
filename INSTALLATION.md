# ArtReal Installation Guide

Complete guide for deploying ArtReal on an Ubuntu server with Nginx, SSL, and automatic service management.

## Prerequisites

- **Ubuntu Server 20.04 or 22.04** (fresh installation recommended)
- **Domain name** pointed to your server's IP address
- **SSH access** to your server
- **Google AI API Key** for Gemini 3 ([get one free](https://aistudio.google.com/apikey))
- **Minimum 2GB RAM** and 20GB disk space

## Quick Installation

### 1. Connect to Your Server

```bash
ssh your-user@your-server-ip
```

### 2. Clone the Repository

```bash
cd /home/your-user
git clone <your-repo-url>
cd ArtReal
```

### 3. Make Installation Script Executable

```bash
chmod +x install.sh
```

### 4. Run Installation Script

```bash
./install.sh
```

The script will ask for:
- **Domain name** (e.g., `artreal.yoursite.com`)
- **Email address** (for SSL certificates)
- **Google AI API Key**

The installation process will:
1. Update system packages
2. Install dependencies (Python, Node.js, Nginx, Certbot)
3. Create Python virtual environment
4. Install backend dependencies
5. Configure environment variables
6. Initialize database
7. Build frontend
8. Create systemd service for backend
9. Configure Nginx with SSL
10. Setup firewall rules
11. Create update and backup scripts

## Post-Installation

### Verify Installation

1. **Check backend service:**
   ```bash
   sudo systemctl status artreal-backend
   ```

2. **Check Nginx:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Visit your domain:**
   ```
   https://your-domain.com
   ```

### View Logs

- **Backend logs:**
  ```bash
  sudo journalctl -u artreal-backend -f
  ```
  Or:
  ```bash
  tail -f /var/log/artreal-backend.log
  ```

- **Nginx logs:**
  ```bash
  tail -f /var/log/nginx/access.log
  tail -f /var/log/nginx/error.log
  ```

## Management Commands

### Backend Service

```bash
# Start backend
sudo systemctl start artreal-backend

# Stop backend
sudo systemctl stop artreal-backend

# Restart backend
sudo systemctl restart artreal-backend

# View status
sudo systemctl status artreal-backend

# View logs (live)
sudo journalctl -u artreal-backend -f
```

### Nginx

```bash
# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (no downtime)
sudo systemctl reload nginx

# Test Nginx configuration
sudo nginx -t
```

### SSL Certificates

```bash
# Renew SSL certificates manually
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

## Update Application

The installation creates an `update.sh` script for easy updates:

```bash
cd /home/your-user/ArtReal
./update.sh
```

This will:
1. Pull latest code from Git
2. Update backend dependencies
3. Rebuild frontend
4. Restart backend service

## Backup and Restore

### Automatic Backups

The installation sets up automatic daily backups at 2 AM via cron.

Backups are stored in: `/home/your-user/ArtReal/backups/`

### Manual Backup

```bash
cd /home/your-user/ArtReal
./backup.sh
```

Backups include:
- SQLite database
- Projects directory
- Environment configuration

### Restore from Backup

```bash
# Stop backend
sudo systemctl stop artreal-backend

# Restore database
cp backups/artreal_TIMESTAMP.db backend/artreal.db

# Restore projects
cd backend
tar -xzf ../backups/projects_TIMESTAMP.tar.gz

# Start backend
sudo systemctl start artreal-backend
```

## Configuration

### Backend Configuration

Edit backend environment variables:

```bash
cd /home/your-user/ArtReal/backend
nano .env
```

After changes, restart backend:

```bash
sudo systemctl restart artreal-backend
```

### Frontend Configuration

Frontend configuration is set during build. To change API URL:

```bash
cd /home/your-user/ArtReal/front
VITE_API_URL=https://your-domain.com/api npm run build
sudo systemctl reload nginx
```

### Nginx Configuration

Edit Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/artreal
```

Test configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

## Troubleshooting

### Backend Not Starting

1. **Check logs:**
   ```bash
   sudo journalctl -u artreal-backend -n 50
   ```

2. **Check if port 8000 is available:**
   ```bash
   sudo netstat -tlnp | grep 8000
   ```

3. **Test manually:**
   ```bash
   cd /home/your-user/ArtReal/backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

### Nginx Errors

1. **Test configuration:**
   ```bash
   sudo nginx -t
   ```

2. **Check error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Verify file permissions:**
   ```bash
   ls -la /home/your-user/ArtReal/front/dist
   ```

### SSL Certificate Issues

1. **Check certificate status:**
   ```bash
   sudo certbot certificates
   ```

2. **Renew manually:**
   ```bash
   sudo certbot renew --force-renewal
   ```

### Database Issues

1. **Check database file:**
   ```bash
   ls -la /home/your-user/ArtReal/backend/artreal.db
   ```

2. **Reinitialize database (WARNING: deletes all data):**
   ```bash
   cd /home/your-user/ArtReal/backend
   rm artreal.db
   source venv/bin/activate
   python init_db.py
   sudo systemctl restart artreal-backend
   ```

### WebContainer Errors

If you see "Failed to resolve import" errors in WebContainer:

1. Check that files are being created properly
2. Increase the reload delay in frontend code
3. Check browser console for specific errors

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Enable automatic security updates:**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. **Secure SSH:**
   - Use SSH keys instead of passwords
   - Disable root login
   - Change default SSH port

4. **Monitor logs regularly:**
   ```bash
   sudo tail -f /var/log/auth.log
   ```

5. **Setup fail2ban:**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

## Performance Optimization

### Backend Workers

Adjust worker count in systemd service:

```bash
sudo nano /etc/systemd/system/artreal-backend.service
```

Change `--workers 2` to desired number (CPU cores recommended).

Reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart artreal-backend
```

### Nginx Caching

Add caching for static files in Nginx config:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

For production with many projects, consider migrating to PostgreSQL:

1. Install PostgreSQL
2. Update DATABASE_URL in backend/.env
3. Run migrations
4. Restart backend

## Uninstallation

To completely remove ArtReal:

```bash
# Stop and disable services
sudo systemctl stop artreal-backend
sudo systemctl disable artreal-backend

# Remove systemd service
sudo rm /etc/systemd/system/artreal-backend.service
sudo systemctl daemon-reload

# Remove Nginx configuration
sudo rm /etc/nginx/sites-available/artreal
sudo rm /etc/nginx/sites-enabled/artreal
sudo systemctl reload nginx

# Remove SSL certificate
sudo certbot delete --cert-name your-domain.com

# Remove project files
rm -rf /home/your-user/ArtReal

# Remove log files
sudo rm /var/log/artreal-*

# Remove cron job
crontab -e  # Remove backup line manually
```

## Support

For issues or questions:

1. Check logs first (backend and Nginx)
2. Review this documentation
3. Check GitHub issues
4. Open a new issue with logs attached

## License

MIT License
