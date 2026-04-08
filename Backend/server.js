const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const JWT_SECRET = 'safekids_jwt_secret_2026_changez_moi_en_production';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ====================== DOSSIER UPLOADS ======================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Config multer pour les avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.userId}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format non supporté. Utilisez JPEG, PNG ou WEBP.'));
  },
});

// ====================== CONNEXION MONGODB ======================
mongoose.connect('mongodb://localhost:27017/autisme_bdd')
  .then(() => console.log('✅ Connecté à MongoDB - autisme_bdd'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// ====================== MIDDLEWARE AUTH ======================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

// ====================== ROUTES AUTH ======================

// ── Inscription ───────────────────────────────────────────────────────────────
app.post('/signup', async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, nbrEnfantsAutistes, telephone } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    const existingUser = await mongoose.connection.db.collection('utilisateurs').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const result = await mongoose.connection.db.collection('utilisateurs').insertOne({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      role: 'Parent',
      telephone: telephone || '',
      nbrEnfantsAutistes: parseInt(nbrEnfantsAutistes) || 1,
      ville: '',
      wilaya: '',
      avatar: '',
      dateCreation: new Date(),
    });

    res.status(201).json({ success: true, message: 'Compte créé avec succès', userId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
});

// ── Connexion ─────────────────────────────────────────────────────────────────
app.post('/login', async (req, res) => {
  try {
    const { email, motDePasse, role } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    if (role === 'Admin' || role === 'admin') {
      const adminUser = await mongoose.connection.db
        .collection('utilisateurs')
        .findOne({ email, role: 'Admin' });

      if (!adminUser) return res.status(401).json({ message: 'Identifiants admin invalides' });

      const isMatch = await bcrypt.compare(motDePasse, adminUser.motDePasse);
      if (!isMatch) return res.status(401).json({ message: 'Identifiants admin invalides' });

      const token = jwt.sign(
        { userId: adminUser._id.toString(), email: adminUser.email, role: 'Admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const { motDePasse: _, ...adminData } = adminUser;
      return res.json({ success: true, token, user: adminData });
    }

    const user = await mongoose.connection.db.collection('utilisateurs').findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: 'Rôle incorrect pour cet utilisateur' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { motDePasse: _, ...userWithoutPass } = user;
    res.json({ success: true, token, user: userWithoutPass });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ── Setup Admin (une seule fois) ──────────────────────────────────────────────
app.post('/setup-admin', async (req, res) => {
  try {
    const { email, motDePasse, nom, prenom } = req.body;
    if (!email || !motDePasse) return res.status(400).json({ message: 'Email et mot de passe requis' });

    const existing = await mongoose.connection.db.collection('utilisateurs').findOne({ email });
    if (existing) return res.status(400).json({ message: 'Ce compte existe déjà' });

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    await mongoose.connection.db.collection('utilisateurs').insertOne({
      nom: nom || 'Admin',
      prenom: prenom || 'System',
      email,
      motDePasse: hashedPassword,
      role: 'Admin',
      telephone: '',
      avatar: '',
      dateCreation: new Date(),
    });

    res.status(201).json({ success: true, message: 'Compte admin créé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== ROUTES PROFIL ======================

// ── GET /profile — Lire le profil ────────────────────────────────────────────
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) },
      { projection: { motDePasse: 0 } }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ── PUT /profile — Modifier le profil ────────────────────────────────────────
app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { prenom, nom, telephone, ville, wilaya, departement } = req.body;

    // Construire l'objet de mise à jour dynamiquement
    const updateFields = {};
    if (prenom    !== undefined) updateFields.prenom      = prenom.trim();
    if (nom       !== undefined) updateFields.nom         = nom.trim();
    if (telephone !== undefined) updateFields.telephone   = telephone.trim();
    if (ville     !== undefined) updateFields.ville       = ville.trim();
    if (wilaya    !== undefined) updateFields.wilaya      = wilaya.trim();
    if (departement !== undefined) updateFields.departement = departement.trim();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }

    const result = await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Retourner le profil mis à jour
    const updatedUser = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) },
      { projection: { motDePasse: 0 } }
    );

    res.json({ success: true, message: 'Profil mis à jour avec succès', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ── PUT /change-password — Changer le mot de passe ───────────────────────────
app.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
    }

    if (nouveauMotDePasse.length < 8) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    }

    const user = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    const hashedNew = await bcrypt.hash(nouveauMotDePasse, 10);
    await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) },
      { $set: { motDePasse: hashedNew } }
    );

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ── POST /upload-avatar — Upload photo de profil ─────────────────────────────
app.post('/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    // Supprimer l'ancien avatar si existant
    const user = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) }
    );
    if (user?.avatar) {
      const oldPath = path.join(__dirname, user.avatar.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) },
      { $set: { avatar: avatarUrl } }
    );

    res.json({ success: true, message: 'Avatar mis à jour', avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'upload" });
  }
});

// ── POST /upload-avatar-base64 — Upload avatar en base64 (React Native) ──────
// Plus simple depuis React Native que multipart/form-data
app.post('/upload-avatar-base64', authenticateToken, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'Image base64 requise' });
    }

    const ext = mimeType === 'image/png' ? '.png' : '.jpg';
    const filename = `avatar_${req.user.userId}_${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Supprimer l'ancien avatar
    const user = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) }
    );
    if (user?.avatar && user.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Sauvegarder le fichier
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

    const avatarUrl = `/uploads/${filename}`;
    await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: new mongoose.Types.ObjectId(req.user.userId) },
      { $set: { avatar: avatarUrl } }
    );

    res.json({ success: true, message: 'Avatar mis à jour', avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'upload" });
  }
});

// ====================== ROUTES DE TEST ======================
app.get('/', (req, res) => res.send('Backend SafeKids est en ligne !'));

app.get('/utilisateurs', async (req, res) => {
  try {
    const users = await mongoose.connection.db
      .collection('utilisateurs')
      .find({}, { projection: { motDePasse: 0 } })
      .toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   → Utilise ngrok pour tester sur téléphone`);
});