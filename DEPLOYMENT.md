# Navodila za namestitev na Proxmox

Ta dokument opisuje, kako namestiti sistem za upravljanje vzdrževanja na vaš Proxmox strežnik.

## Predpogoji

- Proxmox strežnik z dostopom do interneta
- Node.js (verzija 16 ali novejša)
- npm ali yarn
- Git

## 1. Priprava Proxmox strežnika

### Namestitev Node.js

```bash
# Posodobite sistem
apt update && apt upgrade -y

# Namestite Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Preverite namestitev
node --version
npm --version
```

### Namestitev Git

```bash
apt install git -y
```

## 2. Namestitev aplikacije

### Kloniranje repozitorija

```bash
# Ustvarite mapo za aplikacijo
mkdir -p /opt/maintenance-manager
cd /opt/maintenance-manager

# Klonirajte repozitorij (zamenjajte z vašim URL-jem)
git clone <your-repository-url> .

# Ali če nimate Git repozitorija, ustvarite strukturo ročno
mkdir -p server
cd server
```

### Namestitev strežniških odvisnosti

```bash
cd /opt/maintenance-manager/server
npm install
```

## 3. Konfiguracija

### Ustvarjanje .env datoteke

```bash
cd /opt/maintenance-manager/server
cp env.example .env
nano .env
```

### Vsebina .env datoteke

```env
# Server Configuration
PORT=3001

# Database
DB_PATH=/opt/maintenance-manager/server/maintenance.db

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
JWT_SECRET=your-very-secure-jwt-secret-key-here
API_KEY=your-api-key-for-authentication

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/opt/maintenance-manager/server/uploads
```

### Ustvarjanje potrebnih map

```bash
mkdir -p /opt/maintenance-manager/server/uploads
chmod 755 /opt/maintenance-manager/server/uploads
```

## 4. Nastavitev systemd servisa

### Ustvarjanje servisa

```bash
nano /etc/systemd/system/maintenance-manager.service
```

### Vsebina servisa

```ini
[Unit]
Description=Maintenance Manager Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/maintenance-manager/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Omogočanje in zagon servisa

```bash
# Ponovno naložite systemd
systemctl daemon-reload

# Omogočite servis
systemctl enable maintenance-manager

# Zaženite servis
systemctl start maintenance-manager

# Preverite status
systemctl status maintenance-manager
```

## 5. Nastavitev firewall-a

### Ustvarjanje firewall pravil

```bash
# Odprite port 3001
ufw allow 3001/tcp

# Ali za iptables
iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
iptables-save > /etc/iptables/rules.v4
```

## 6. Nastavitev reverse proxy (opcijsko)

### Namestitev Nginx

```bash
apt install nginx -y
```

### Konfiguracija Nginx

```bash
nano /etc/nginx/sites-available/maintenance-manager
```

### Vsebina konfiguracije

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Zamenjajte z vašo domeno

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Za nalaganje slik
    location /uploads/ {
        alias /opt/maintenance-manager/server/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Omogočanje konfiguracije

```bash
ln -s /etc/nginx/sites-available/maintenance-manager /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 7. SSL certifikat (opcijsko)

### Namestitev Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### Pridobitev SSL certifikata

```bash
certbot --nginx -d your-domain.com
```

## 8. Avtomatsko varnostno kopiranje

### Ustvarjanje backup skripte

```bash
nano /opt/maintenance-manager/backup.sh
```

### Vsebina backup skripte

```bash
#!/bin/bash

BACKUP_DIR="/opt/backups/maintenance-manager"
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_DIR="/opt/maintenance-manager/server"

# Ustvarite backup mapo
mkdir -p $BACKUP_DIR

# Kopirajte bazo podatkov
cp $SOURCE_DIR/maintenance.db $BACKUP_DIR/maintenance_$DATE.db

# Kopirajte naložene slike
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz $SOURCE_DIR/uploads/

# Ohranite samo zadnjih 7 backup-ov
find $BACKUP_DIR -name "maintenance_*.db" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete

echo "Backup zaključen: $DATE"
```

### Omogočanje backup skripte

```bash
chmod +x /opt/maintenance-manager/backup.sh

# Dodajte v crontab za dnevni backup
crontab -e
# Dodajte to vrstico:
0 2 * * * /opt/maintenance-manager/backup.sh
```

## 9. Monitoring in logi

### Pregled logov

```bash
# Pregled servisnih logov
journalctl -u maintenance-manager -f

# Pregled aplikacijskih logov
tail -f /opt/maintenance-manager/server/logs/app.log
```

### Monitoring uporabe

```bash
# Pregled uporabe CPU in RAM
htop

# Pregled disk prostora
df -h

# Pregled mrežnih povezav
netstat -tlnp | grep :3001
```

## 10. Posodabljanje aplikacije

### Skripta za posodabljanje

```bash
nano /opt/maintenance-manager/update.sh
```

### Vsebina update skripte

```bash
#!/bin/bash

cd /opt/maintenance-manager

# Ustvarite backup pred posodabljanjem
./backup.sh

# Ustavite servis
systemctl stop maintenance-manager

# Posodobite kodo
git pull origin main

# Namestite nove odvisnosti
cd server
npm install

# Zaženite servis
systemctl start maintenance-manager

echo "Aplikacija je bila posodobljena"
```

### Omogočanje update skripte

```bash
chmod +x /opt/maintenance-manager/update.sh
```

## 11. Testiranje namestitve

### Preverjanje API-ja

```bash
# Testiranje health check endpoint-a
curl http://localhost:3001/api/health

# Testiranje pridobivanja strank
curl http://localhost:3001/api/stranke
```

### Preverjanje iz Windows aplikacije

1. Odprite Windows aplikacijo
2. V nastavitvah vnesite URL strežnika: `http://your-proxmox-ip:3001`
3. Preverite, ali se aplikacija poveže

### Preverjanje iz Android aplikacije

1. Odprite Android aplikacijo
2. V nastavitvah vnesite URL strežnika
3. Preizkusite ustvarjanje novega naloga

## 12. Varnostni nasveti

- Redno posodabljajte sistem
- Uporabite močna gesla
- Omogočite samo potrebne portove
- Redno ustvarjajte varnostne kopije
- Spremljajte log datoteke
- Uporabite SSL certifikat za produkcijo

## Podpora

Če imate težave z namestitvijo, preverite:

1. Ali je Node.js pravilno nameščen
2. Ali so vsi porti odprti
3. Ali so datoteke dovoljenj pravilno nastavljene
4. Ali servis teče brez napak

Za dodatno podporo kontaktirajte razvijalca.
