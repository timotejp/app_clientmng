const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database setup
const db = new sqlite3.Database('maintenance.db');

// Initialize database tables
db.serialize(() => {
  // Stranke (Clients)
  db.run(`CREATE TABLE IF NOT EXISTS stranke (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ime TEXT NOT NULL,
    priimek TEXT NOT NULL,
    naslov TEXT,
    telefon TEXT,
    email TEXT,
    datum_dodajanja DATETIME DEFAULT CURRENT_TIMESTAMP,
    opombe TEXT
  )`);

  // Oprema (Devices)
  db.run(`CREATE TABLE IF NOT EXISTS oprema (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stranka_id INTEGER,
    tip_opreme TEXT NOT NULL,
    znamka TEXT,
    model TEXT,
    serijska_stevilka TEXT,
    datum_nakupa DATE,
    garancija_do DATE,
    opombe TEXT,
    FOREIGN KEY (stranka_id) REFERENCES stranke (id)
  )`);

  // Vzdrževalni nalogi (Maintenance Tasks)
  db.run(`CREATE TABLE IF NOT EXISTS vzdrzevalni_nalogi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stranka_id INTEGER,
    oprema_id INTEGER,
    naslov TEXT NOT NULL,
    opis TEXT,
    datum_ustvarjanja DATETIME DEFAULT CURRENT_TIMESTAMP,
    datum_načrtovanega_vzdrževanja DATE,
    datum_izvedbe DATE,
    status TEXT DEFAULT 'načrtovan',
    prioriteta TEXT DEFAULT 'srednja',
    rezervni_deli TEXT,
    opombe TEXT,
    FOREIGN KEY (stranka_id) REFERENCES stranke (id),
    FOREIGN KEY (oprema_id) REFERENCES oprema (id)
  )`);

  // Slike (Images)
  db.run(`CREATE TABLE IF NOT EXISTS slike (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nalog_id INTEGER,
    ime_datoteke TEXT NOT NULL,
    pot TEXT NOT NULL,
    datum_dodajanja DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nalog_id) REFERENCES vzdrzevalni_nalogi (id)
  )`);

  // Obvestila (Notifications)
  db.run(`CREATE TABLE IF NOT EXISTS obvestila (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nalog_id INTEGER,
    tip TEXT NOT NULL,
    naslov TEXT NOT NULL,
    sporočilo TEXT,
    datum_pošiljanja DATETIME,
    status TEXT DEFAULT 'ne_poslano',
    FOREIGN KEY (nalog_id) REFERENCES vzdrzevalni_nalogi (id)
  )`);
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Email configuration (configure with your SMTP settings)
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// API Routes

// Stranke (Clients)
app.get('/api/stranke', (req, res) => {
  db.all('SELECT * FROM stranke ORDER BY ime, priimek', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/stranke', (req, res) => {
  const { ime, priimek, naslov, telefon, email, opombe } = req.body;
  
  db.run(
    'INSERT INTO stranke (ime, priimek, naslov, telefon, email, opombe) VALUES (?, ?, ?, ?, ?, ?)',
    [ime, priimek, naslov, telefon, email, opombe],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Stranka uspešno dodana' });
    }
  );
});

app.put('/api/stranke/:id', (req, res) => {
  const { ime, priimek, naslov, telefon, email, opombe } = req.body;
  const id = req.params.id;
  
  db.run(
    'UPDATE stranke SET ime = ?, priimek = ?, naslov = ?, telefon = ?, email = ?, opombe = ? WHERE id = ?',
    [ime, priimek, naslov, telefon, email, opombe, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Stranka uspešno posodobljena' });
    }
  );
});

app.delete('/api/stranke/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM stranke WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Stranka uspešno izbrisana' });
  });
});

// Oprema (Devices)
app.get('/api/oprema', (req, res) => {
  const strankaId = req.query.stranka_id;
  let query = `
    SELECT o.*, s.ime, s.priimek 
    FROM oprema o 
    LEFT JOIN stranke s ON o.stranka_id = s.id
  `;
  
  if (strankaId) {
    query += ' WHERE o.stranka_id = ?';
    db.all(query, [strankaId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    db.all(query, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

app.post('/api/oprema', (req, res) => {
  const { stranka_id, tip_opreme, znamka, model, serijska_stevilka, datum_nakupa, garancija_do, opombe } = req.body;
  
  db.run(
    'INSERT INTO oprema (stranka_id, tip_opreme, znamka, model, serijska_stevilka, datum_nakupa, garancija_do, opombe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [stranka_id, tip_opreme, znamka, model, serijska_stevilka, datum_nakupa, garancija_do, opombe],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Oprema uspešno dodana' });
    }
  );
});

// Vzdrževalni nalogi (Maintenance Tasks)
app.get('/api/nalogi', (req, res) => {
  const { sort_by, filter_status, filter_stranka, filter_oprema, filter_datum } = req.query;
  
  let query = `
    SELECT vn.*, s.ime, s.priimek, s.telefon, s.email, o.tip_opreme, o.znamka, o.model
    FROM vzdrzevalni_nalogi vn
    LEFT JOIN stranke s ON vn.stranka_id = s.id
    LEFT JOIN oprema o ON vn.oprema_id = o.id
  `;
  
  const conditions = [];
  const params = [];
  
  if (filter_status) {
    conditions.push('vn.status = ?');
    params.push(filter_status);
  }
  
  if (filter_stranka) {
    conditions.push('vn.stranka_id = ?');
    params.push(filter_stranka);
  }
  
  if (filter_oprema) {
    conditions.push('vn.oprema_id = ?');
    params.push(filter_oprema);
  }
  
  if (filter_datum) {
    conditions.push('vn.datum_načrtovanega_vzdrževanja = ?');
    params.push(filter_datum);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  // Sorting
  switch (sort_by) {
    case 'datum_ustvarjanja':
      query += ' ORDER BY vn.datum_ustvarjanja DESC';
      break;
    case 'datum_vzdrževanja':
      query += ' ORDER BY vn.datum_načrtovanega_vzdrževanja ASC';
      break;
    case 'stranka':
      query += ' ORDER BY s.ime, s.priimek';
      break;
    case 'oprema':
      query += ' ORDER BY o.tip_opreme, o.znamka';
      break;
    default:
      query += ' ORDER BY vn.datum_ustvarjanja DESC';
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/nalogi', (req, res) => {
  const { stranka_id, oprema_id, naslov, opis, datum_načrtovanega_vzdrževanja, prioriteta, rezervni_deli, opombe } = req.body;
  
  db.run(
    'INSERT INTO vzdrzevalni_nalogi (stranka_id, oprema_id, naslov, opis, datum_načrtovanega_vzdrževanja, prioriteta, rezervni_deli, opombe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [stranka_id, oprema_id, naslov, opis, datum_načrtovanega_vzdrževanja, prioriteta, rezervni_deli, opombe],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Nalog uspešno ustvarjen' });
    }
  );
});

app.put('/api/nalogi/:id', (req, res) => {
  const { naslov, opis, datum_načrtovanega_vzdrževanja, datum_izvedbe, status, prioriteta, rezervni_deli, opombe } = req.body;
  const id = req.params.id;
  
  db.run(
    'UPDATE vzdrzevalni_nalogi SET naslov = ?, opis = ?, datum_načrtovanega_vzdrževanja = ?, datum_izvedbe = ?, status = ?, prioriteta = ?, rezervni_deli = ?, opombe = ? WHERE id = ?',
    [naslov, opis, datum_načrtovanega_vzdrževanja, datum_izvedbe, status, prioriteta, rezervni_deli, opombe, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Nalog uspešno posodobljen' });
    }
  );
});

// Upload images
app.post('/api/nalogi/:id/slike', upload.array('slike', 10), (req, res) => {
  const nalogId = req.params.id;
  const files = req.files;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nobena slika ni bila naložena' });
  }
  
  const insertPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO slike (nalog_id, ime_datoteke, pot) VALUES (?, ?, ?)',
        [nalogId, file.originalname, file.filename],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  });
  
  Promise.all(insertPromises)
    .then(() => {
      res.json({ message: 'Slike uspešno naložene' });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

app.get('/api/nalogi/:id/slike', (req, res) => {
  const nalogId = req.params.id;
  
  db.all('SELECT * FROM slike WHERE nalog_id = ? ORDER BY datum_dodajanja', [nalogId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Cron job for maintenance reminders (runs daily at 9 AM)
cron.schedule('0 9 * * *', () => {
  console.log('Checking for maintenance reminders...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  db.all(`
    SELECT vn.*, s.ime, s.priimek, s.email, o.tip_opreme, o.znamka, o.model
    FROM vzdrzevalni_nalogi vn
    LEFT JOIN stranke s ON vn.stranka_id = s.id
    LEFT JOIN oprema o ON vn.oprema_id = o.id
    WHERE vn.datum_načrtovanega_vzdrževanja = ? AND vn.status = 'načrtovan'
  `, [tomorrowStr], (err, rows) => {
    if (err) {
      console.error('Error checking reminders:', err);
      return;
    }
    
    rows.forEach(row => {
      if (row.email) {
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: row.email,
          subject: `Opomnik za vzdrževanje - ${row.naslov}`,
          html: `
            <h2>Opomnik za vzdrževanje</h2>
            <p>Pozdravljeni ${row.ime} ${row.priimek},</p>
            <p>To je opomnik, da je načrtovano vzdrževanje za jutri:</p>
            <ul>
              <li><strong>Nalog:</strong> ${row.naslov}</li>
              <li><strong>Oprema:</strong> ${row.tip_opreme} - ${row.znamka} ${row.model}</li>
              <li><strong>Datum:</strong> ${row.datum_načrtovanega_vzdrževanja}</li>
              <li><strong>Opis:</strong> ${row.opis || 'Ni opisa'}</li>
            </ul>
            <p>Lep pozdrav,<br>Ekipa za vzdrževanje</p>
          `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Reminder email sent:', info.messageId);
          }
        });
      }
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server je zagnan na portu ${PORT}`);
  console.log(`API je dostopen na http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Zapiranje serverja...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Povezava z bazo podatkov zaprta.');
    process.exit(0);
  });
});
