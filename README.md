# Sistem za upravljanje vzdrževanja

Kompleksna aplikacija za upravljanje vzdrževanja opreme s povezavo med Windows desktop aplikacijo in Android mobilno aplikacijo.

## Funkcionalnosti

### Windows Desktop Aplikacija
- **Upravljanje strank**: Dodajanje, urejanje in brisanje strank z njihovimi podatki
- **Upravljanje opreme**: Pregled in upravljanje opreme za vsako stranko
- **Vzdrževalni nalogi**: Ustvarjanje, urejanje in spremljanje vzdrževalnih nalogov
- **Filtriranje in sortiranje**: Napredne možnosti filtriranja po datumu, stranki, opremi
- **Poročila**: Pregled statistik in poročil
- **Obvestila**: Avtomatska opozorila za prihajajoča vzdrževanja

### Android Mobilna Aplikacija
- **Ustvarjanje nalogov**: Hitro ustvarjanje novih vzdrževalnih nalogov
- **Fotografiranje**: Dodajanje slik opreme ali problemov
- **Offline delovanje**: Delovanje brez internetne povezave z sinhronizacijo
- **Pregled nalogov**: Pregled obstoječih nalogov in njihovih podrobnosti

### Strežniška komponenta
- **REST API**: Kompletna API za upravljanje podatkov
- **SQLite baza podatkov**: Lokalna baza podatkov za shranjevanje
- **Avtomatska opozorila**: Cron job za pošiljanje e-poštnih opozoril
- **Nalaganje slik**: Podpora za nalaganje in shranjevanje slik

## Tehnologije

### Windows Aplikacija
- **Electron**: Desktop aplikacija
- **React**: UI framework
- **Styled Components**: Styling
- **Axios**: HTTP klient

### Android Aplikacija
- **React Native**: Mobilna aplikacija
- **React Native Paper**: UI komponente
- **React Navigation**: Navigacija
- **React Native Image Picker**: Fotografiranje
- **AsyncStorage**: Lokalno shranjevanje

### Strežnik
- **Node.js**: Runtime okolje
- **Express.js**: Web framework
- **SQLite3**: Baza podatkov
- **Multer**: Nalaganje datotek
- **Nodemailer**: E-poštna obvestila
- **Node-cron**: Avtomatske naloge

## Namestitev

### 1. Strežnik (Proxmox)

```bash
# Klonirajte repozitorij
git clone <repository-url>
cd maintenance-manager/server

# Namestite odvisnosti
npm install

# Nastavite okoljske spremenljivke
cp env.example .env
# Uredite .env datoteko z vašimi nastavitvami

# Zaženite strežnik
npm start
```

### 2. Windows Aplikacija

```bash
# V glavni mapi projekta
npm install

# Zaženite v development načinu
npm run electron-dev

# Ali zgradite za produkcijo
npm run build-electron
```

### 3. Android Aplikacija

```bash
# V android-app mapi
cd android-app
npm install

# Zaženite Metro bundler
npm start

# V drugem terminalu zaženite Android aplikacijo
npm run android
```

## Konfiguracija

### Strežniške nastavitve (.env)

```env
# Server Configuration
PORT=3001

# Database
DB_PATH=./maintenance.db

# Email Configuration (for maintenance reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
JWT_SECRET=your-jwt-secret-key
API_KEY=your-api-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Povezava z Android aplikacijo

1. Odprite Android aplikacijo
2. Pojdite v Nastavitve
3. Vnesite URL vašega strežnika (npr. `http://your-proxmox-ip:3001`)
4. Aplikacija se bo povezala s strežnikom

## Uporaba

### Dodajanje nove stranke
1. V Windows aplikaciji kliknite "Dodaj stranko"
2. Izpolnite podatke stranke (ime, priimek, naslov, telefon, e-pošta)
3. Kliknite "Shrani"

### Dodajanje opreme
1. Izberite stranko
2. Kliknite "Dodaj opremo"
3. Izpolnite podatke opreme (tip, znamka, model, serijska številka)
4. Kliknite "Shrani"

### Ustvarjanje vzdrževalnega naloga
1. V Windows aplikaciji ali Android aplikaciji kliknite "Nov nalog"
2. Izberite stranko in opremo
3. Vnesite podrobnosti naloga
4. Dodajte slike (v Android aplikaciji)
5. Kliknite "Ustvari nalog"

### Pregled in filtriranje
- Uporabite iskalno polje za iskanje po imenu stranke
- Razvrščajte po datumu, stranki ali opremi
- Filtrirate po statusu naloga

## API Dokumentacija

### Stranke
- `GET /api/stranke` - Pridobi vse stranke
- `POST /api/stranke` - Ustvari novo stranko
- `PUT /api/stranke/:id` - Posodobi stranko
- `DELETE /api/stranke/:id` - Izbriši stranko

### Oprema
- `GET /api/oprema` - Pridobi vso opremo
- `POST /api/oprema` - Ustvari novo opremo
- `PUT /api/oprema/:id` - Posodobi opremo
- `DELETE /api/oprema/:id` - Izbriši opremo

### Vzdrževalni nalogi
- `GET /api/nalogi` - Pridobi vse naloge
- `POST /api/nalogi` - Ustvari nov nalog
- `PUT /api/nalogi/:id` - Posodobi nalog
- `DELETE /api/nalogi/:id` - Izbriši nalog

### Slike
- `POST /api/nalogi/:id/slike` - Naloži slike za nalog
- `GET /api/nalogi/:id/slike` - Pridobi slike za nalog

## Varnost

- Vsi API klici so zaščiteni z CORS
- Slike so shranjene v ločeni mapi
- E-poštna obvestila se pošiljajo preko SMTP
- Lokalna baza podatkov je zaščitena

## Podpora

Za podporo ali vprašanja kontaktirajte razvijalca.

## Licenca

Ta projekt je licenciran pod MIT licenco.
