const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'safekids_jwt_secret_2026_changez_moi_en_production';
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ====================== RATE LIMITING ======================
const loginAttempts = new Map();
function rateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const key = (req.ip || '') + (req.body?.email || '');
    const now = Date.now();
    const entry = loginAttempts.get(key) || { count: 0, firstAttempt: now };
    if (now - entry.firstAttempt > windowMs) {
      loginAttempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }
    if (entry.count >= maxAttempts) {
      const retryAfter = Math.ceil((windowMs - (now - entry.firstAttempt)) / 1000);
      return res.status(429).json({ message: `Trop de tentatives. Réessayez dans ${retryAfter}s.` });
    }
    entry.count++;
    loginAttempts.set(key, entry);
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of loginAttempts.entries()) {
    if (now - val.firstAttempt > 15 * 60 * 1000) loginAttempts.delete(key);
  }
}, 30 * 60 * 1000);

// ====================== UPLOADS ======================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.set('ngrok-skip-browser-warning', 'true');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  },
}));

// ====================== MONGODB ======================
mongoose.connect('mongodb://localhost:27017/autisme_bdd')
  .then(() => console.log('✅ Connecté à MongoDB — autisme_bdd'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

process.on('SIGTERM', async () => { await mongoose.connection.close(); process.exit(0); });
process.on('SIGINT',  async () => { await mongoose.connection.close(); process.exit(0); });

// ====================== UTILITAIRES ======================
function toObjectId(id) {
  try { return new mongoose.Types.ObjectId(id); } catch { return null; }
}

function cleanDoc(doc) {
  if (!doc) return null;
  const clean = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v && typeof v === 'object' && v.constructor?.name === 'ObjectId') {
      clean[k] = v.toString();
    } else if (v instanceof Date) {
      clean[k] = v.toISOString();
    } else {
      clean[k] = v;
    }
  }
  if (clean._id) clean._id = clean._id.toString();
  return clean;
}

function validateTelephone(tel) {
  if (!tel || tel.trim() === '') return { valid: true, cleaned: '' };
  const cleaned = tel.replace(/[\s\-\.]/g, '');
  if (!/^\d{10}$/.test(cleaned))
    return { valid: false, message: 'Le numéro doit contenir exactement 10 chiffres.' };
  if (!/^0[567]/.test(cleaned))
    return { valid: false, message: 'Le numéro doit commencer par 05, 06 ou 07.' };
  return { valid: true, cleaned };
}

// ====================== FIX V3 : FILTRES ROBUSTES ======================
// Filtre pour notifications - gère destinataire OU idDestinataire en string OU ObjectId
function buildDestinatireFilter(userId) {
  const userIdStr = userId.toString();
  const oid = toObjectId(userId);
  
  const conditions = [];
  
  // Format string
  conditions.push({ destinataire: userIdStr });
  conditions.push({ idDestinataire: userIdStr });
  
  // Format ObjectId (si valide)
  if (oid) {
    conditions.push({ destinataire: oid });
    conditions.push({ idDestinataire: oid });
  }
  
  return { $or: conditions };
}

// Filtre pour conversations/RDV - gère un champ qui peut être string OU ObjectId
function buildIdFilter(field, userId) {
  const userIdStr = userId.toString();
  const oid = toObjectId(userId);
  
  const conditions = [{ [field]: userIdStr }];
  if (oid) conditions.push({ [field]: oid });
  
  return { $or: conditions };
}

// Vérifie si l'utilisateur est participant d'une conversation
function isParticipant(conv, userId) {
  const userIdStr = userId.toString();
  const convParentId = conv.idParent?.toString ? conv.idParent.toString() : conv.idParent;
  const convMedecinId = conv.idMedecin?.toString ? conv.idMedecin.toString() : conv.idMedecin;
  return convParentId === userIdStr || convMedecinId === userIdStr;
}

// ====================== CONSTANTES ======================
const SPECIALITES_LISTE = [
  'Psychologue',
  'Pédopsychiatrie',
  'Orthophonie',
  'Psychomotricien',
  'Psychiatre',
  'Neuropédiatrie',
  'Ergothérapie',
  'ABA Thérapeute',
];

const JOURS_VALIDES = [
  'Samedi', 'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi',
];

// ====================== MIDDLEWARE AUTH ======================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide';
    return res.status(403).json({ message: msg });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin')
    return res.status(403).json({ message: "Accès réservé à l'administrateur" });
  next();
};

// Dans server.js, ajoute cette route :

app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
  
    res.json({ success: true, message: 'Déconnecté avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== TEST ======================
app.get('/', (req, res) => res.send('🚀 Backend SafeKids en ligne !'));

// ====================== SPÉCIALITÉS ======================
app.get('/api/specialites', authenticateToken, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const counts = await db.collection('utilisateurs').aggregate([
      { $match: { role: 'Medecin', status: 'actif', specialite: { $exists: true, $ne: '' } } },
      { $group: { _id: '$specialite', medecins: { $sum: 1 } } },
    ]).toArray();
    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.medecins; });
    const result = SPECIALITES_LISTE.map(nom => ({
      _id: nom, nom, medecins: countMap[nom] || 0,
    }));
    res.json(result);
  } catch (error) {
    console.error('Get specialites error:', error);
    res.json(SPECIALITES_LISTE.map(nom => ({ _id: nom, nom, medecins: 0 })));
  }
});

app.get('/api/specialites/public', (req, res) => {
  res.json(SPECIALITES_LISTE.map(nom => ({ _id: nom, nom, medecins: 0 })));
});

app.get('/api/jours', authenticateToken, (req, res) => {
  res.json(JOURS_VALIDES);
});

// ====================== AUTH ======================

app.post('/signup', rateLimit(10, 60 * 60 * 1000), async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, nbrEnfantsAutistes, telephone } = req.body;

    if (!nom || !prenom || !email || !motDePasse)
      return res.status(400).json({ message: 'nom, prenom, email et motDePasse sont obligatoires' });
    if (motDePasse.length < 6)
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ message: 'Format email invalide' });

    const telCheck = validateTelephone(telephone || '');
    if (!telCheck.valid) return res.status(400).json({ message: telCheck.message });

    const db = mongoose.connection.db;
    const existing = await db.collection('utilisateurs').findOne({
      email: email.trim().toLowerCase(),
    });
    if (existing) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const result = await db.collection('utilisateurs').insertOne({
      nom:                nom.trim(),
      prenom:             prenom.trim(),
      email:              email.trim().toLowerCase(),
      motDePasse:         hashedPassword,
      role:               'Parent',
      telephone:          telCheck.cleaned,
      nbrEnfantsAutistes: parseInt(nbrEnfantsAutistes) || 1,
      ville:              '',
      wilaya:             '',
      avatar:             '',
      status:             'actif',
      dateCreation:       new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      userId:  result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
});

app.post('/login', rateLimit(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, motDePasse, role } = req.body;
    if (!email || !motDePasse)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const db = mongoose.connection.db;
    const user = await db.collection('utilisateurs').findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      await bcrypt.hash('dummy_anti_timing', 10);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    if (role && user.role.toLowerCase() !== role.toLowerCase())
      return res.status(403).json({ message: 'Rôle incorrect pour cet utilisateur' });
    if (user.status === 'bloque')
      return res.status(403).json({ message: "Votre compte a été bloqué. Contactez l'administrateur." });

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { motDePasse: _, ...userWithoutPass } = user;
    res.json({
      success:            true,
      token,
      user:               cleanDoc(userWithoutPass),
      mustChangePassword: !!user.mustChangePassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/setup-admin', async (req, res) => {
  try {
    const { email, motDePasse, nom, prenom } = req.body;
    if (!email || !motDePasse)
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    const db = mongoose.connection.db;
    const existing = await db.collection('utilisateurs').findOne({
      email: email.trim().toLowerCase(),
    });
    if (existing) return res.status(400).json({ message: 'Ce compte existe déjà' });
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    await db.collection('utilisateurs').insertOne({
      nom:          nom?.trim()    || 'Admin',
      prenom:       prenom?.trim() || 'System',
      email:        email.trim().toLowerCase(),
      motDePasse:   hashedPassword,
      role:         'Admin',
      telephone:    '',
      avatar:       '',
      status:       'actif',
      dateCreation: new Date(),
    });
    res.status(201).json({ success: true, message: 'Compte admin créé avec succès' });
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== PROFIL ======================

app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: toObjectId(req.user.userId) },
      { projection: { motDePasse: 0 } }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(cleanDoc(user));
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { prenom, nom, telephone, ville, wilaya, disponibilite } = req.body;

    if (telephone !== undefined && telephone !== '') {
      const telCheck = validateTelephone(telephone);
      if (!telCheck.valid) return res.status(400).json({ message: telCheck.message });
    }

    const updateFields = {};
    if (prenom        !== undefined) updateFields.prenom        = prenom.trim();
    if (nom           !== undefined) updateFields.nom           = nom.trim();
    if (telephone     !== undefined) updateFields.telephone     = telephone.replace(/[\s\-\.]/g, '').trim();
    if (ville         !== undefined) updateFields.ville         = ville.trim();
    if (wilaya        !== undefined) updateFields.wilaya        = wilaya.trim();
    if (disponibilite !== undefined) updateFields.disponibilite = disponibilite;

    if (Object.keys(updateFields).length === 0)
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });

    await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: toObjectId(req.user.userId) },
      { $set: updateFields }
    );
    const updated = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: toObjectId(req.user.userId) },
      { projection: { motDePasse: 0 } }
    );
    res.json({ success: true, message: 'Profil mis à jour', user: cleanDoc(updated) });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    if (!ancienMotDePasse || !nouveauMotDePasse)
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
    if (nouveauMotDePasse.length < 6)
      return res.status(400).json({ message: 'Minimum 6 caractères' });
    if (ancienMotDePasse === nouveauMotDePasse)
      return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent' });

    const user = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: toObjectId(req.user.userId) }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!isMatch) return res.status(401).json({ message: 'Ancien mot de passe incorrect' });

    const hashed = await bcrypt.hash(nouveauMotDePasse, 10);
    await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: toObjectId(req.user.userId) },
      { $set: { motDePasse: hashed, mustChangePassword: false } }
    );
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== UPLOAD AVATAR ======================
app.post('/upload-avatar-base64', authenticateToken, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) return res.status(400).json({ message: 'imageBase64 est requis' });
    if (!mimeType)    return res.status(400).json({ message: 'mimeType est requis' });

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType))
      return res.status(400).json({
        message: `Format d'image invalide. Formats acceptés : jpeg, png, webp. Reçu : ${mimeType}`,
      });

    let cleanBase64 = imageBase64.trim();
    if (cleanBase64.includes(',')) cleanBase64 = cleanBase64.split(',')[1];
    cleanBase64 = cleanBase64.replace(/\s+/g, '');

    if (cleanBase64.length < 100)
      return res.status(400).json({ message: 'Base64 trop petit ou invalide' });

    const estimatedBytes = (cleanBase64.length * 3) / 4;
    if (estimatedBytes > 5 * 1024 * 1024)
      return res.status(400).json({ message: "L'image ne doit pas dépasser 5 Mo" });

    const ext = mimeType === 'image/png' ? '.png'
               : mimeType === 'image/webp' ? '.webp' : '.jpg';
    const filename = `avatar_${req.user.userId}_${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const user = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: toObjectId(req.user.userId) }
    );
    if (user?.avatar && user.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const imageBuffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(filepath, imageBuffer);

    const avatarUrl = `/uploads/${filename}`;
    await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: toObjectId(req.user.userId) },
      { $set: { avatar: avatarUrl } }
    );

    console.log(`✅ Avatar mis à jour : ${filename} (${imageBuffer.length} bytes)`);
    res.json({ success: true, avatarUrl, message: 'Photo de profil mise à jour avec succès' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: "Erreur lors de l'upload de l'image", error: error.message });
  }
});

// ====================== MÉDECINS (ADMIN) ======================

app.get('/api/medecins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const medecins = await mongoose.connection.db
      .collection('utilisateurs')
      .find({ role: 'Medecin' }, { projection: { motDePasse: 0 } })
      .sort({ nom: 1 })
      .toArray();

    const enriched = await Promise.all(medecins.map(async (m) => {
      const patients = await mongoose.connection.db
        .collection('consultations')
        .distinct('idEnfant', { idMedecin: m._id.toString() })
        .then(ids => ids.length)
        .catch(() => 0);

      return {
        ...cleanDoc(m),
        patients,
        status:        m.status        || 'actif',
        specialite:    m.specialite    || '',
        telephone:     m.telephone     || '',
        disponibilite: m.disponibilite || [],
        avatar:        m.avatar        || '',
      };
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Get medecins error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/medecins/annuaire', authenticateToken, async (req, res) => {
  try {
    const { specialite } = req.query;
    const filter = { role: 'Medecin', status: 'actif' };
    if (specialite && SPECIALITES_LISTE.includes(specialite)) filter.specialite = specialite;

    const medecins = await mongoose.connection.db
      .collection('utilisateurs')
      .find(filter, { projection: { motDePasse: 0, mustChangePassword: 0 } })
      .sort({ nom: 1 })
      .toArray();

    res.json(medecins.map(m => ({
      _id:           m._id.toString(),
      prenom:        m.prenom        || '',
      nom:           m.nom           || '',
      specialite:    m.specialite    || '',
      telephone:     m.telephone     || '',
      disponibilite: Array.isArray(m.disponibilite) ? m.disponibilite : [],
      avatar:        m.avatar        || '',
    })));
  } catch (error) {
    console.error('Get medecins annuaire error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/medecins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { prenom, nom, email, specialite, telephone, disponibilite, password } = req.body;

    if (!prenom || !nom || !email || !specialite || !password)
      return res.status(400).json({
        message: 'Champs obligatoires : prénom, nom, email, spécialité, mot de passe',
      });
    if (password.length < 6)
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ message: 'Format email invalide' });
    if (!SPECIALITES_LISTE.includes(specialite.trim()))
      return res.status(400).json({ message: `Spécialité invalide. Choisissez parmi : ${SPECIALITES_LISTE.join(', ')}` });
    if (!telephone || telephone.trim() === '')
      return res.status(400).json({ message: 'Le téléphone est obligatoire pour un médecin' });

    const telCheck = validateTelephone(telephone);
    if (!telCheck.valid) return res.status(400).json({ message: telCheck.message });

    let dispoArray = [];
    if (disponibilite) {
      dispoArray = Array.isArray(disponibilite) ? disponibilite : [disponibilite];
      const invalids = dispoArray.filter(j => !JOURS_VALIDES.includes(j));
      if (invalids.length > 0)
        return res.status(400).json({ message: `Jours invalides : ${invalids.join(', ')}` });
    }

    const db = mongoose.connection.db;
    const existing = await db.collection('utilisateurs').findOne({
      email: email.trim().toLowerCase(),
    });
    if (existing) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('utilisateurs').insertOne({
      nom:                nom.trim(),
      prenom:             prenom.trim(),
      email:              email.trim().toLowerCase(),
      motDePasse:         hashedPassword,
      role:               'Medecin',
      specialite:         specialite.trim(),
      telephone:          telCheck.cleaned,
      disponibilite:      dispoArray,
      status:             'actif',
      mustChangePassword: true,
      avatar:             '',
      dateCreation:       new Date(),
    });

    res.status(201).json({
      _id:           result.insertedId.toString(),
      nom:           nom.trim(),
      prenom:        prenom.trim(),
      email:         email.trim().toLowerCase(),
      specialite:    specialite.trim(),
      telephone:     telCheck.cleaned,
      disponibilite: dispoArray,
      status:        'actif',
      patients:      0,
      avatar:        '',
    });
  } catch (error) {
    console.error('Create medecin error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/api/medecins/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });

    const { prenom, nom, email, specialite, telephone, disponibilite } = req.body;

    if (specialite !== undefined && !SPECIALITES_LISTE.includes(specialite.trim()))
      return res.status(400).json({ message: 'Spécialité invalide' });
    if (telephone !== undefined && telephone !== '') {
      const telCheck = validateTelephone(telephone);
      if (!telCheck.valid) return res.status(400).json({ message: telCheck.message });
    }
    if (email !== undefined) {
      const emailExists = await mongoose.connection.db.collection('utilisateurs').findOne({
        email: email.trim().toLowerCase(), _id: { $ne: id },
      });
      if (emailExists) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const updateFields = {};
    if (prenom        !== undefined) updateFields.prenom        = prenom.trim();
    if (nom           !== undefined) updateFields.nom           = nom.trim();
    if (email         !== undefined) updateFields.email         = email.trim().toLowerCase();
    if (specialite    !== undefined) updateFields.specialite    = specialite.trim();
    if (telephone     !== undefined) updateFields.telephone     = telephone.replace(/[\s\-\.]/g, '').trim();
    if (disponibilite !== undefined)
      updateFields.disponibilite = Array.isArray(disponibilite) ? disponibilite : [disponibilite];

    if (Object.keys(updateFields).length === 0)
      return res.status(400).json({ message: 'Aucun champ à modifier' });

    const result = await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: id, role: 'Medecin' }, { $set: updateFields }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Médecin non trouvé' });

    const updated = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: id }, { projection: { motDePasse: 0 } }
    );
    res.json({
      ...cleanDoc(updated),
      status:        updated.status        || 'actif',
      disponibilite: updated.disponibilite || [],
    });
  } catch (error) {
    console.error('Update medecin error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/medecins/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const { status } = req.body;
    if (!['actif', 'bloque', 'attente'].includes(status))
      return res.status(400).json({ message: 'Statut invalide (actif | bloque | attente)' });
    const result = await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: id, role: 'Medecin' }, { $set: { status } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Médecin non trouvé' });
    res.json({ _id: req.params.id, status });
  } catch (error) {
    console.error('Set medecin status error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/medecins/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Minimum 6 caractères' });
    const hashed = await bcrypt.hash(password, 10);
    const result = await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: id, role: 'Medecin' },
      { $set: { motDePasse: hashed, mustChangePassword: true } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Médecin non trouvé' });
    res.json({ success: true, message: 'Mot de passe réinitialisé' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/medecins/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const result = await mongoose.connection.db.collection('utilisateurs').deleteOne(
      { _id: id, role: 'Medecin' }
    );
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Médecin non trouvé' });
    res.json({ success: true, message: 'Médecin supprimé' });
  } catch (error) {
    console.error('Delete medecin error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== PARENTS ======================

app.get('/api/parents', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const parents = await db
      .collection('utilisateurs')
      .find({ role: 'Parent' }, { projection: { motDePasse: 0 } })
      .sort({ nom: 1 })
      .toArray();

    const enriched = await Promise.all(parents.map(async (p) => {
      const enfants = await db.collection('enfants')
        .countDocuments({ idParent: p._id.toString() })
        .catch(() => 0);

      let medecinNom = null;
      try {
        const consult = await db.collection('consultations').findOne({
          idParent: p._id.toString(),
        });
        if (consult?.idMedecin) {
          const med = await db.collection('utilisateurs').findOne({
            _id: toObjectId(consult.idMedecin), role: 'Medecin',
          });
          if (med) medecinNom = `${med.prenom} ${med.nom}`;
        }
      } catch {}

      return {
        ...cleanDoc(p),
        enfants,
        medecin:         medecinNom,
        status:          p.status    || 'actif',
        telephone:       p.telephone || '',
        avatar:          p.avatar    || '',
        dateInscription: p.dateCreation
          ? new Date(p.dateCreation).toLocaleDateString('fr-DZ', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : null,
      };
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/parents/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const { status } = req.body;
    if (!['actif', 'bloque', 'attente'].includes(status))
      return res.status(400).json({ message: 'Statut invalide' });
    const result = await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: id, role: 'Parent' }, { $set: { status } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Parent non trouvé' });
    res.json({ _id: req.params.id, status });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/parents/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const result = await mongoose.connection.db.collection('utilisateurs').deleteOne(
      { _id: id, role: 'Parent' }
    );
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Parent non trouvé' });
    res.json({ success: true, message: 'Parent supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== STATISTIQUES ======================

app.get('/api/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const MOIS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

    const [totalEnfants, totalConsults, totalMedecins, totalParents, totalSeances, totalRdv] =
      await Promise.all([
        db.collection('enfants').countDocuments().catch(() => 0),
        db.collection('consultations').countDocuments().catch(() => 0),
        db.collection('utilisateurs').countDocuments({ role: 'Medecin' }).catch(() => 0),
        db.collection('utilisateurs').countDocuments({ role: 'Parent' }).catch(() => 0),
        db.collection('seances').countDocuments().catch(() => 0),
        db.collection('rendezvous').countDocuments().catch(() => 0),
      ]);

    const debutMois = new Date();
    debutMois.setDate(1); debutMois.setHours(0, 0, 0, 0);
    const debutMoisPrecedent = new Date(debutMois);
    debutMoisPrecedent.setMonth(debutMoisPrecedent.getMonth() - 1);

    const [nouveauxCasMois, nouveauxCasPrecedent] = await Promise.all([
      db.collection('enfants').countDocuments({ dateCreation: { $gte: debutMois } }).catch(() => 0),
      db.collection('enfants').countDocuments({ dateCreation: { $gte: debutMoisPrecedent, $lt: debutMois } }).catch(() => 0),
    ]);
    const anciensCas = Math.max(0, totalEnfants - nouveauxCasMois);
    const nouveauxPct = nouveauxCasPrecedent > 0
      ? Math.round(((nouveauxCasMois - nouveauxCasPrecedent) / nouveauxCasPrecedent) * 100)
      : null;

    const [garcons, filles] = await Promise.all([
      db.collection('enfants').countDocuments({ genre: { $in: ['M','Garçon','garcon','m'] } }).catch(() => 0),
      db.collection('enfants').countDocuments({ genre: { $in: ['F','Fille','fille','f'] } }).catch(() => 0),
    ]);

    let niveauxTSA = [];
    try {
      const r = await db.collection('enfants').aggregate([
        { $group: { _id: '$niveauTSA', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();
      niveauxTSA = r.map(x => ({ nom: x._id || 'Non défini', count: x.count }));
    } catch {}

    let domaines = [];
    try {
      const r = await db.collection('activites').aggregate([
        { $group: { _id: '$domaine', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();
      const total = r.reduce((a, x) => a + x.count, 0);
      domaines = r.map(x => ({
        nom: x._id || 'Non défini',
        pct: total > 0 ? Math.round((x.count / total) * 100) : 0,
        count: x.count,
      }));
    } catch {}

    let tauxSuccesMoyen = null, engagementMoyen = null;
    try {
      const seances = await db.collection('seances').find({ 'evaluation.note': { $exists: true } }).toArray();
      const notesMap = { 'Très bien': 5, 'Bien': 4, 'Moyen': 3, 'Difficile': 2, 'Très difficile': 1 };
      const notes = seances.map(s => notesMap[s.evaluation?.note]).filter(Boolean);
      if (notes.length > 0) {
        tauxSuccesMoyen = Math.round((notes.filter(n => n >= 4).length / notes.length) * 100);
        engagementMoyen = Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10;
      }
    } catch {}

    const evolution = [], barNouveaux = [], barAnciens = [], barLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); d.setHours(0, 0, 0, 0);
      d.setMonth(d.getMonth() - i);
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = MOIS_FR[d.getMonth()];
      const [consults, enfsNouv, enfsAnc] = await Promise.all([
        db.collection('consultations').countDocuments({ date: { $gte: d, $lte: fin } }).catch(() => 0),
        db.collection('enfants').countDocuments({ dateCreation: { $gte: d, $lte: fin } }).catch(() => 0),
        db.collection('enfants').countDocuments({ dateCreation: { $lt: d } }).catch(() => 0),
      ]);
      barNouveaux.push(enfsNouv);
      barAnciens.push(enfsAnc);
      barLabels.push(label);
      evolution.push({ label, value: consults });
    }

    let statutsRdv = {};
    try {
      const r = await db.collection('rendezvous').aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } },
      ]).toArray();
      r.forEach(x => { statutsRdv[x._id || 'inconnu'] = x.count; });
    } catch {}

    res.json({
      totalEnfants, totalConsults, totalMedecins, totalParents, totalSeances, totalRdv,
      nouveauxCasMois, nouveauxPct, anciensCas, garcons, filles,
      tauxSuccesMoyen, engagementMoyen, domaines, niveauxTSA,
      evolution, barNouveaux, barAnciens, barLabels, statutsRdv,
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== ENFANTS (ADMIN) ======================

app.get('/api/enfants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const enfants = await db.collection('enfants').find({}).sort({ nom: 1 }).toArray();
    const enriched = await Promise.all(enfants.map(async (e) => {
      let parentNom = null;
      try {
        const idParent = e.idParent?.toString ? e.idParent.toString() : e.idParent;
        const parent = await db.collection('utilisateurs').findOne(
          { _id: toObjectId(idParent) }, { projection: { nom: 1, prenom: 1 } }
        );
        if (parent) parentNom = `${parent.prenom} ${parent.nom}`;
      } catch {}
      return { ...cleanDoc(e), parentNom };
    }));
    res.json(enriched);
  } catch (error) {
    console.error('Get enfants error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== ACTIVITÉS ======================

app.get('/api/activites', authenticateToken, async (req, res) => {
  try {
    const { domaine } = req.query;
    const filter = domaine ? { domaine } : {};
    const activites = await mongoose.connection.db
      .collection('activites')
      .find(filter)
      .sort({ domaine: 1, type: 1 })
      .toArray();
    res.json(activites.map(cleanDoc));
  } catch (error) {
    console.error('Get activites error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/activites/:id', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const activite = await mongoose.connection.db.collection('activites').findOne({ _id: id });
    if (!activite) return res.status(404).json({ message: 'Activité non trouvée' });
    res.json(cleanDoc(activite));
  } catch (error) {
    console.error('Get activite error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/activites', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { domaine, type, materiel_requis, objectif, conseils, attention, duree, url } = req.body;

    if (!domaine?.trim()) return res.status(400).json({ message: 'Le domaine est obligatoire' });
    if (!type?.trim())    return res.status(400).json({ message: 'Le type est obligatoire' });

    let materiel = [];
    if (Array.isArray(materiel_requis))
      materiel = materiel_requis.map(m => m.trim()).filter(Boolean);
    else if (typeof materiel_requis === 'string' && materiel_requis.trim())
      materiel = [materiel_requis.trim()];

    const result = await mongoose.connection.db.collection('activites').insertOne({
      domaine:         domaine.trim(),
      type:            type.trim(),
      materiel_requis: materiel,
      objectif:        objectif?.trim()  || '',
      conseils:        conseils?.trim()  || '',
      attention:       attention?.trim() || '',
      duree:           duree?.trim()     || '',
      url:             url?.trim()       || '',
      dateCreation:    new Date(),
    });

    res.status(201).json({
      _id:             result.insertedId.toString(),
      domaine:         domaine.trim(),
      type:            type.trim(),
      materiel_requis: materiel,
      objectif:        objectif?.trim()  || '',
      conseils:        conseils?.trim()  || '',
      attention:       attention?.trim() || '',
      duree:           duree?.trim()     || '',
      url:             url?.trim()       || '',
    });
  } catch (error) {
    console.error('Create activite error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/api/activites/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });

    const { domaine, type, materiel_requis, objectif, conseils, attention, duree, url } = req.body;
    const updateFields = {};

    if (domaine   !== undefined) updateFields.domaine   = domaine.trim();
    if (type      !== undefined) updateFields.type      = type.trim();
    if (objectif  !== undefined) updateFields.objectif  = objectif.trim();
    if (conseils  !== undefined) updateFields.conseils  = conseils.trim();
    if (attention !== undefined) updateFields.attention = attention.trim();
    if (duree     !== undefined) updateFields.duree     = duree.trim();
    if (url       !== undefined) updateFields.url       = url.trim();

    if (materiel_requis !== undefined) {
      if (Array.isArray(materiel_requis))
        updateFields.materiel_requis = materiel_requis.map(m => m.trim()).filter(Boolean);
      else if (typeof materiel_requis === 'string')
        updateFields.materiel_requis = materiel_requis.trim() ? [materiel_requis.trim()] : [];
    }

    if (Object.keys(updateFields).length === 0)
      return res.status(400).json({ message: 'Aucun champ à modifier' });

    const result = await mongoose.connection.db.collection('activites').updateOne(
      { _id: id }, { $set: updateFields }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Activité non trouvée' });

    const updated = await mongoose.connection.db.collection('activites').findOne({ _id: id });
    res.json(cleanDoc(updated));
  } catch (error) {
    console.error('Update activite error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/activites/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const result = await mongoose.connection.db.collection('activites').deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Activité non trouvée' });
    res.json({ success: true, message: 'Activité supprimée' });
  } catch (error) {
    console.error('Delete activite error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/domaines', authenticateToken, async (req, res) => {
  try {
    const domaines = await mongoose.connection.db
      .collection('activites')
      .distinct('domaine');
    res.json(domaines.filter(Boolean).sort());
  } catch (error) {
    console.error('Get domaines error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/activites/migrate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const oldDocs = await db.collection('activites').find({
      materiel_requis: { $type: 'string' },
    }).toArray();

    let migrated = 0;
    for (const doc of oldDocs) {
      const materiel = doc.materiel_requis?.trim() ? [doc.materiel_requis.trim()] : [];
      await db.collection('activites').updateOne(
        { _id: doc._id },
        {
          $set: {
            materiel_requis: materiel,
            objectif:  doc.objectif  || '',
            conseils:  doc.conseils  || '',
            attention: doc.attention || '',
            duree:     doc.duree     || '',
            url:       doc.url       || '',
          },
        }
      );
      migrated++;
    }
    res.json({ success: true, message: `${migrated} activité(s) migrée(s)`, migrated });
  } catch (error) {
    console.error('Migrate activites error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== DEBUG ======================
app.get('/utilisateurs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await mongoose.connection.db
      .collection('utilisateurs')
      .find({}, { projection: { motDePasse: 0 } })
      .toArray();
    res.json(users.map(cleanDoc));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ====================== ENFANTS (PARENT) ======================

app.get('/api/mes-enfants', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const enfants = await mongoose.connection.db.collection('enfants').find({
      $or: [
        { parentId: uid },
        { parentId: toObjectId(uid) },
        { idParent: uid },
        { idParent: toObjectId(uid) },
      ],
    }).sort({ prenomEnfant: 1 }).toArray();

    res.json(enfants.map(e => ({
      _id:       e._id.toString(),
      prenom:    e.prenomEnfant || e.prenom || '',
      nom:       e.nomEnfant   || e.nom    || '',
      age:       e.age         || '',
      niveauTSA: e.niveauTSA   || '',
    })));
  } catch (error) {
    console.error('Get mes-enfants error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== RENDEZ-VOUS ======================

app.post('/api/rendezvous', authenticateToken, async (req, res) => {
  try {
    const { idMedecin, idEnfant, jour, heure, type = 'Presentiel', message = '' } = req.body;

    if (!idMedecin || !jour || !heure)
      return res.status(400).json({ message: 'idMedecin, jour et heure sont obligatoires' });
    if (!idEnfant)
      return res.status(400).json({ message: 'Veuillez sélectionner un enfant' });

    const db = mongoose.connection.db;

    const medecin = await db.collection('utilisateurs').findOne({
      _id: toObjectId(idMedecin), role: 'Medecin', status: 'actif',
    });
    if (!medecin) return res.status(404).json({ message: 'Médecin non trouvé ou inactif' });

    const uid = req.user.userId;
    const enfant = await db.collection('enfants').findOne({
      _id: toObjectId(idEnfant),
      $or: [
        { parentId: uid },
        { parentId: toObjectId(uid) },
        { idParent: uid },
        { idParent: toObjectId(uid) },
      ],
    });
    if (!enfant) return res.status(404).json({ message: 'Enfant non trouvé' });

    const parent = await db.collection('utilisateurs').findOne(
      { _id: toObjectId(uid) }, { projection: { nom: 1, prenom: 1 } }
    );

    const typeNorm = (type === 'Présentiel' || type === 'Presentiel') ? 'Presentiel' : 'Teleconsultation';
    const rdvDoc = {
      idParent:     uid,
      idMedecin,
      idEnfant,
      nomEnfant:    `${enfant.prenomEnfant || enfant.prenom || ''} ${enfant.nomEnfant || enfant.nom || ''}`.trim(),
      jour,
      heure,
      type:         typeNorm,
      statut:       'en_attente',
      message:      message.trim(),
      noteReponse:  '',
      dateCreation: new Date(),
      dateReponse:  null,
    };

    const result = await db.collection('rendezvous').insertOne(rdvDoc);
    const rdvId  = result.insertedId.toString();
    const parentNom = `${parent?.prenom || ''} ${parent?.nom || ''}`.trim();

    await db.collection('notifications').insertOne({
      destinataire:  idMedecin,
      role:          'Medecin',
      type:          'rdv_demande',
      titre:         'Nouvelle demande de RDV',
      message:       `${parentNom} demande un RDV pour ${rdvDoc.nomEnfant} le ${jour} à ${heure} (${typeNorm === 'Presentiel' ? 'Présentiel' : 'Téléconsultation'})`,
      idRdv:         rdvId,
      actionRequise: true,
      lu:            false,
      dateCreation:  new Date(),
    });

    const admins = await db.collection('utilisateurs').find({ role: 'Admin' }).toArray();
    if (admins.length > 0) {
      await db.collection('notifications').insertMany(admins.map(admin => ({
        destinataire:  admin._id.toString(),
        role:          'Admin',
        type:          'rdv_info',
        titre:         'Nouveau RDV en attente',
        message:       `${parentNom} a demandé un RDV pour ${rdvDoc.nomEnfant} avec Dr. ${medecin.prenom} ${medecin.nom} le ${jour} à ${heure}`,
        idRdv:         rdvId,
        actionRequise: false,
        lu:            false,
        dateCreation:  new Date(),
      })));
    }

    res.status(201).json({
      success: true,
      message: 'Demande de rendez-vous envoyée',
      _id:     rdvId,
      statut:  'en_attente',
    });
  } catch (error) {
    console.error('Create RDV error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/rendezvous/mes-rdv', authenticateToken, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const rdvs = await db.collection('rendezvous')
      .find(buildIdFilter('idParent', req.user.userId))
      .sort({ dateCreation: -1 })
      .toArray();

    const enriched = await Promise.all(rdvs.map(async (r) => {
      let medecinNom = '', specialite = '';
      try {
        const med = await db.collection('utilisateurs').findOne(
          { _id: toObjectId(r.idMedecin) },
          { projection: { nom: 1, prenom: 1, specialite: 1 } }
        );
        if (med) { medecinNom = `Dr. ${med.prenom} ${med.nom}`; specialite = med.specialite || ''; }
      } catch {}
      return { ...cleanDoc(r), medecinNom, specialite };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/rendezvous/mes-demandes', authenticateToken, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const rdvs = await db.collection('rendezvous')
      .find(buildIdFilter('idMedecin', req.user.userId))
      .sort({ dateCreation: -1 })
      .toArray();

    const enriched = await Promise.all(rdvs.map(async (r) => {
      let parentNom = '';
      try {
        const p = await db.collection('utilisateurs').findOne(
          { _id: toObjectId(r.idParent) },
          { projection: { nom: 1, prenom: 1, telephone: 1 } }
        );
        if (p) parentNom = `${p.prenom} ${p.nom}`;
      } catch {}
      return { ...cleanDoc(r), parentNom };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/rendezvous', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db     = mongoose.connection.db;
    const filter = req.query.statut ? { statut: req.query.statut } : {};
    const rdvs   = await db.collection('rendezvous').find(filter).sort({ dateCreation: -1 }).toArray();

    const enriched = await Promise.all(rdvs.map(async (r) => {
      let parentNom = '', medecinNom = '';
      try {
        const [p, m] = await Promise.all([
          db.collection('utilisateurs').findOne({ _id: toObjectId(r.idParent) },  { projection: { nom: 1, prenom: 1 } }),
          db.collection('utilisateurs').findOne({ _id: toObjectId(r.idMedecin) }, { projection: { nom: 1, prenom: 1 } }),
        ]);
        if (p) parentNom  = `${p.prenom} ${p.nom}`;
        if (m) medecinNom = `Dr. ${m.prenom} ${m.nom}`;
      } catch {}
      return { ...cleanDoc(r), parentNom, medecinNom };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/rendezvous/:id/repondre', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });

    const { statut, noteReponse } = req.body;
    if (!['accepte', 'annule'].includes(statut))
      return res.status(400).json({ message: 'statut invalide (accepte | annule)' });

    const db  = mongoose.connection.db;
    const rdv = await db.collection('rendezvous').findOne({ _id: id });
    if (!rdv) return res.status(404).json({ message: 'RDV non trouvé' });

    if (rdv.idMedecin !== req.user.userId && rdv.idMedecin?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Non autorisé' });
    if (rdv.statut !== 'en_attente')
      return res.status(400).json({ message: 'Ce RDV a déjà été traité' });

    await db.collection('rendezvous').updateOne(
      { _id: id },
      { $set: { statut, noteReponse: noteReponse?.trim() || '', dateReponse: new Date() } }
    );

    const medecin = await db.collection('utilisateurs').findOne(
      { _id: toObjectId(req.user.userId) }, { projection: { nom: 1, prenom: 1 } }
    );
    const medecinNom = medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Le médecin';
    const isOk = statut === 'accepte';

    await db.collection('notifications').insertOne({
      destinataire:  rdv.idParent.toString(),
      role:          'Parent',
      type:          isOk ? 'rdv_accepte' : 'rdv_annule',
      titre:         isOk ? '✅ Rendez-vous confirmé !' : '❌ Rendez-vous annulé',
      message:       isOk
        ? `${medecinNom} a confirmé votre RDV pour ${rdv.nomEnfant || 'votre enfant'} le ${rdv.jour} à ${rdv.heure}.`
        : `${medecinNom} a annulé le RDV pour ${rdv.nomEnfant || 'votre enfant'} le ${rdv.jour} à ${rdv.heure}.${noteReponse ? ' Motif : ' + noteReponse : ''}`,
      idRdv:         req.params.id,
      actionRequise: false,
      lu:            false,
      dateCreation:  new Date(),
    });

    const admins = await db.collection('utilisateurs').find({ role: 'Admin' }).toArray();
    if (admins.length > 0) {
      await db.collection('notifications').insertMany(admins.map(admin => ({
        destinataire:  admin._id.toString(),
        role:          'Admin',
        type:          isOk ? 'rdv_accepte_info' : 'rdv_annule_info',
        titre:         isOk ? 'RDV confirmé par médecin' : 'RDV annulé par médecin',
        message:       `${medecinNom} a ${isOk ? 'confirmé' : 'annulé'} le RDV de ${rdv.nomEnfant || '?'} le ${rdv.jour} à ${rdv.heure}.`,
        idRdv:         req.params.id,
        actionRequise: false,
        lu:            false,
        dateCreation:  new Date(),
      })));
    }

    await db.collection('notifications').updateMany(
      { idRdv: req.params.id, ...buildDestinatireFilter(req.user.userId) },
      { $set: { lu: true } }
    );

    res.json({ success: true, _id: req.params.id, statut });
  } catch (error) {
    console.error('Repondre RDV error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/rendezvous/:id/annuler', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const db  = mongoose.connection.db;
    const rdv = await db.collection('rendezvous').findOne({ _id: id });
    if (!rdv) return res.status(404).json({ message: 'RDV non trouvé' });
    if (rdv.idParent !== req.user.userId && rdv.idParent?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Non autorisé' });
    if (rdv.statut !== 'en_attente')
      return res.status(400).json({ message: "Impossible d'annuler ce RDV" });
    await db.collection('rendezvous').updateOne(
      { _id: id },
      { $set: { statut: 'annule', noteReponse: 'Annulé par le parent', dateReponse: new Date() } }
    );
    res.json({ success: true, statut: 'annule' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Ajouter dans votre server.js ou dans le fichier routes correspondant
app.post('/profile/increment-rdv', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    user.nbRdv = (user.nbRdv || 0) + 1;
    await user.save();
    
    res.json({ nbRdv: user.nbRdv });
  } catch (error) {
    console.error('Erreur incrément RDV:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== NOTIFICATIONS ======================

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const filter = buildDestinatireFilter(req.user.userId);
    console.log('🔍 Notifications filter:', JSON.stringify(filter, null, 2));
    console.log('👤 User ID:', req.user.userId, 'role:', req.user.role);
    
    const notifs = await mongoose.connection.db.collection('notifications')
      .find(filter)
      .sort({ dateCreation: -1 })
      .limit(100)
      .toArray();
    
    console.log(`✅ ${notifs.length} notifications trouvées pour ${req.user.userId}`);
    
    res.json(notifs.map(n => ({
      ...cleanDoc(n),
      destinataire: (n.destinataire || n.idDestinataire)?.toString() || '',
    })));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/notifications/count', authenticateToken, async (req, res) => {
  try {
    const count = await mongoose.connection.db.collection('notifications')
      .countDocuments({ ...buildDestinatireFilter(req.user.userId), lu: false });
    res.json({ count });
  } catch (error) {
    console.error('Get notifications count error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/notifications/:id/lire', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    await mongoose.connection.db.collection('notifications').updateOne(
      { _id: id, ...buildDestinatireFilter(req.user.userId) },
      { $set: { lu: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/notifications/tout-lire', authenticateToken, async (req, res) => {
  try {
    await mongoose.connection.db.collection('notifications').updateMany(
      { ...buildDestinatireFilter(req.user.userId), lu: false },
      { $set: { lu: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const result = await mongoose.connection.db.collection('notifications').deleteOne({
      _id: id,
      ...buildDestinatireFilter(req.user.userId),
    });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: 'Notification non trouvée' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== MESSAGES / DISCUSSIONS ======================

app.post('/api/messages/demande', authenticateToken, async (req, res) => {
  try {
    const { idMedecin, messageInitial } = req.body;
    if (!idMedecin) return res.status(400).json({ message: 'idMedecin requis' });

    const db = mongoose.connection.db;
    const medecin = await db.collection('utilisateurs').findOne({
      _id: toObjectId(idMedecin), role: 'Medecin', status: 'actif',
    });
    if (!medecin) return res.status(404).json({ message: 'Médecin non trouvé' });

    const parent = await db.collection('utilisateurs').findOne(
      { _id: toObjectId(req.user.userId) },
      { projection: { nom: 1, prenom: 1, avatar: 1 } }
    );
    const uid = req.user.userId;

    const existing = await db.collection('conversations').findOne({
      $and: [
        buildIdFilter('idParent', uid),
        buildIdFilter('idMedecin', idMedecin),
      ],
    });

    if (existing) {
      if (existing.statut === 'refusee') {
        await db.collection('conversations').updateOne(
          { _id: existing._id },
          { $set: { statut: 'en_attente', dateCreation: new Date(), messageInitial: messageInitial?.trim() || '' } }
        );
        await db.collection('notifications').insertOne({
          destinataire:   idMedecin,
          role:           'Medecin',
          type:           'discussion_demande',
          titre:          'Nouvelle demande de discussion',
          message:        `${parent?.prenom} ${parent?.nom} souhaite discuter avec vous.`,
          idConversation: existing._id.toString(),
          actionRequise:  true,
          lu:             false,
          dateCreation:   new Date(),
        });
        return res.json({ success: true, _id: existing._id.toString(), statut: 'en_attente' });
      }
      return res.status(400).json({
        message:  'Une conversation existe déjà avec ce médecin',
        _id:      existing._id.toString(),
        statut:   existing.statut,
      });
    }

    const convDoc = {
      idParent:          uid,
      idMedecin,
      nomParent:         `${parent?.prenom || ''} ${parent?.nom || ''}`.trim(),
      avatarParent:      parent?.avatar || '',
      nomMedecin:        `Dr. ${medecin.prenom} ${medecin.nom}`,
      specialiteMedecin: medecin.specialite || '',
      avatarMedecin:     medecin.avatar || '',
      statut:            'en_attente',
      messageInitial:    messageInitial?.trim() || '',
      dernierMessage:    '',
      dernierMessageDate: null,
      dateCreation:      new Date(),
      nonLusParent:      0,
      nonLusMedecin:     0,
    };

    const result = await db.collection('conversations').insertOne(convDoc);
    const convId = result.insertedId.toString();

    await db.collection('notifications').insertOne({
      destinataire:   idMedecin,
      role:           'Medecin',
      type:           'discussion_demande',
      titre:          '💬 Demande de discussion',
      message:        `${parent?.prenom} ${parent?.nom} souhaite discuter avec vous.${messageInitial ? ' Message : ' + messageInitial : ''}`,
      idConversation: convId,
      actionRequise:  true,
      lu:             false,
      dateCreation:   new Date(),
    });

    const admins = await db.collection('utilisateurs').find({ role: 'Admin' }).toArray();
    if (admins.length > 0) {
      await db.collection('notifications').insertMany(admins.map(admin => ({
        destinataire:   admin._id.toString(),
        role:           'Admin',
        type:           'discussion_info',
        titre:          'Nouvelle demande de discussion',
        message:        `${parent?.prenom} ${parent?.nom} a demandé une discussion avec Dr. ${medecin.prenom} ${medecin.nom}`,
        idConversation: convId,
        actionRequise:  false,
        lu:             false,
        dateCreation:   new Date(),
      })));
    }

    res.status(201).json({ success: true, _id: convId, statut: 'en_attente' });
  } catch (error) {
    console.error('Demande discussion error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/messages/demande/:id/repondre', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });

    const { statut } = req.body;
    if (!['acceptee', 'refusee'].includes(statut))
      return res.status(400).json({ message: 'statut invalide (acceptee | refusee)' });

    const db   = mongoose.connection.db;
    const conv = await db.collection('conversations').findOne({ _id: id });
    if (!conv) return res.status(404).json({ message: 'Conversation non trouvée' });

    if (!isParticipant(conv, req.user.userId))
      return res.status(403).json({ message: 'Non autorisé' });
    if (conv.statut !== 'en_attente')
      return res.status(400).json({ message: 'Cette demande a déjà été traitée' });

    await db.collection('conversations').updateOne(
      { _id: id },
      { $set: { statut, dateReponse: new Date() } }
    );

    const medecin = await db.collection('utilisateurs').findOne(
      { _id: toObjectId(req.user.userId) }, { projection: { nom: 1, prenom: 1 } }
    );
    const medecinNom = medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Le médecin';
    const isOk = statut === 'acceptee';

    await db.collection('notifications').insertOne({
      destinataire:   conv.idParent.toString(),
      role:           'Parent',
      type:           isOk ? 'discussion_acceptee' : 'discussion_refusee',
      titre:          isOk ? '✅ Discussion acceptée !' : '❌ Discussion refusée',
      message:        isOk
        ? `${medecinNom} a accepté votre demande de discussion. Vous pouvez maintenant échanger.`
        : `${medecinNom} a refusé votre demande de discussion.`,
      idConversation: req.params.id,
      actionRequise:  false,
      lu:             false,
      dateCreation:   new Date(),
    });

    await db.collection('notifications').updateMany(
      { idConversation: req.params.id, ...buildDestinatireFilter(req.user.userId) },
      { $set: { lu: true } }
    );

    res.json({ success: true, _id: req.params.id, statut });
  } catch (error) {
    console.error('Repondre discussion error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const uid = req.user.userId;
    const isParent = req.user.role === 'Parent';
    const isMedecin = req.user.role === 'Medecin';

    let filter = {};
    if (isParent) filter = buildIdFilter('idParent', uid);
    if (isMedecin) filter = buildIdFilter('idMedecin', uid);

    const convs = await db.collection('conversations')
      .find(filter)
      .sort({ dernierMessageDate: -1, dateCreation: -1 })
      .toArray();

    res.json(convs.map(c => ({
      ...cleanDoc(c),
      nonLus: isParent ? (c.nonLusParent || 0) : (c.nonLusMedecin || 0),
    })));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/messages/:idConv', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.idConv);
    if (!id) return res.status(400).json({ message: 'ID invalide' });

    const db = mongoose.connection.db;
    const conv = await db.collection('conversations').findOne({ _id: id });
    if (!conv) return res.status(404).json({ message: 'Conversation non trouvée' });

    if (!isParticipant(conv, req.user.userId))
      return res.status(403).json({ message: 'Non autorisé' });

    const msgs = await db.collection('messages')
      .find({ idConversation: req.params.idConv })
      .sort({ dateCreation: 1 })
      .toArray();

    const unreadField = req.user.role === 'Parent' ? 'nonLusParent' : 'nonLusMedecin';
    await db.collection('conversations').updateOne(
      { _id: id }, { $set: { [unreadField]: 0 } }
    );

    res.json(msgs.map(cleanDoc));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/messages/:idConv', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.idConv);
    if (!id) return res.status(400).json({ message: 'ID invalide' });

    const { texte } = req.body;
    if (!texte?.trim()) return res.status(400).json({ message: 'Message vide' });

    const db = mongoose.connection.db;
    const conv = await db.collection('conversations').findOne({ _id: id });
    if (!conv) return res.status(404).json({ message: 'Conversation non trouvée' });

    if (!isParticipant(conv, req.user.userId))
      return res.status(403).json({ message: 'Non autorisé' });
    if (conv.statut !== 'acceptee')
      return res.status(400).json({ message: "La conversation n'est pas active" });

    const now = new Date();
    const msgDoc = {
      idConversation: req.params.idConv,
      idAuteur:       req.user.userId,
      role:           req.user.role,
      texte:          texte.trim(),
      lu:             false,
      dateCreation:   now,
    };

    const result = await db.collection('messages').insertOne(msgDoc);
    const isParent = req.user.role === 'Parent';
    const nonLusField = isParent ? 'nonLusMedecin' : 'nonLusParent';

    await db.collection('conversations').updateOne(
      { _id: id },
      {
        $set: { dernierMessage: texte.trim(), dernierMessageDate: now },
        $inc: { [nonLusField]: 1 },
      }
    );

    const destinataire = isParent ? conv.idMedecin?.toString() : conv.idParent?.toString();
    const expediteur = isParent ? conv.nomParent : conv.nomMedecin;

    await db.collection('notifications').insertOne({
      destinataire,
      role: isParent ? 'Medecin' : 'Parent',
      type: 'nouveau_message',
      titre: '💬 Nouveau message',
      message: `${expediteur} : ${texte.trim().substring(0, 80)}${texte.trim().length > 80 ? '…' : ''}`,
      idConversation: req.params.idConv,
      actionRequise: false,
      lu: false,
      dateCreation: now,
    });

    res.status(201).json(cleanDoc({ ...msgDoc, _id: result.insertedId }));
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/messages/msg/:id', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const db = mongoose.connection.db;
    const msg = await db.collection('messages').findOne({ _id: id });
    if (!msg) return res.status(404).json({ message: 'Message non trouvé' });
    
    if (msg.idAuteur !== req.user.userId && msg.idAuteur?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Non autorisé' });

    await db.collection('messages').deleteOne({ _id: id });

    const lastMsg = await db.collection('messages')
      .findOne({ idConversation: msg.idConversation }, { sort: { dateCreation: -1 } });
    await db.collection('conversations').updateOne(
      { _id: toObjectId(msg.idConversation) },
      { $set: { dernierMessage: lastMsg?.texte || '', dernierMessageDate: lastMsg?.dateCreation || null } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/messages/conv/:id', authenticateToken, async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const db = mongoose.connection.db;
    const conv = await db.collection('conversations').findOne({ _id: id });
    if (!conv) return res.status(404).json({ message: 'Conversation non trouvée' });

    if (!isParticipant(conv, req.user.userId))
      return res.status(403).json({ message: 'Non autorisé' });

    await db.collection('conversations').deleteOne({ _id: id });
    await db.collection('messages').deleteMany({ idConversation: req.params.id });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete conv error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/messages/statut/:idMedecin', authenticateToken, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const uid = req.user.userId;
    const conv = await db.collection('conversations').findOne({
      $and: [
        buildIdFilter('idParent', uid),
        buildIdFilter('idMedecin', req.params.idMedecin),
      ],
    });
    if (!conv) return res.json({ exists: false });
    res.json({ exists: true, _id: conv._id.toString(), statut: conv.statut });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// ====================== NOTIFICATIONS PARENT ======================
app.get('/api/parent/notifications', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Parent') {
      return res.status(403).json({ message: 'Accès réservé aux parents' });
    }
    
    const filter = buildDestinatireFilter(req.user.userId);
    console.log('🔍 Parent notifications filter:', JSON.stringify(filter, null, 2));
    
    const notifs = await mongoose.connection.db.collection('notifications')
      .find(filter)
      .sort({ dateCreation: -1 })
      .limit(100)
      .toArray();
    
    console.log(`✅ ${notifs.length} notifications trouvées pour parent ${req.user.userId}`);
    
    res.json(notifs.map(n => ({
      ...cleanDoc(n),
      destinataire: (n.destinataire || n.idDestinataire)?.toString() || '',
    })));
  } catch (error) {
    console.error('Get parent notifications error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/parent/notifications/count', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Parent') {
      return res.status(403).json({ message: 'Accès réservé aux parents' });
    }
    const count = await mongoose.connection.db.collection('notifications')
      .countDocuments({ ...buildDestinatireFilter(req.user.userId), lu: false });
    res.json({ count });
  } catch (error) {
    console.error('Get parent notifications count error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/parent/notifications/:id/lire', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Parent') {
      return res.status(403).json({ message: 'Accès réservé aux parents' });
    }
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    await mongoose.connection.db.collection('notifications').updateOne(
      { _id: id, ...buildDestinatireFilter(req.user.userId) },
      { $set: { lu: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/api/parent/notifications/tout-lire', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Parent') {
      return res.status(403).json({ message: 'Accès réservé aux parents' });
    }
    await mongoose.connection.db.collection('notifications').updateMany(
      { ...buildDestinatireFilter(req.user.userId), lu: false },
      { $set: { lu: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/parent/notifications/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Parent') {
      return res.status(403).json({ message: 'Accès réservé aux parents' });
    }
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID invalide' });
    const result = await mongoose.connection.db.collection('notifications').deleteOne({
      _id: id,
      ...buildDestinatireFilter(req.user.userId),
    });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: 'Notification non trouvée' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== SOCKET.IO ======================
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Stockage des utilisateurs connectés
const connectedUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ Utilisateur connecté: ${socket.userId} (${socket.userRole})`);
  connectedUsers.set(socket.userId, socket.id);

  socket.on('join-conversation', (conversationId) => {
    socket.join(`conv_${conversationId}`);
    console.log(`📱 ${socket.userId} a rejoint la conversation ${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conv_${conversationId}`);
    console.log(`📱 ${socket.userId} a quitté la conversation ${conversationId}`);
  });

  // Dans io.on('connection'), modifie send-message :

socket.on('send-message', async (data) => {
  const { conversationId, texte } = data;
  try {
    const db = mongoose.connection.db;
    
    const conv = await db.collection('conversations').findOne({ _id: toObjectId(conversationId) });
    if (!conv) return;
    
    const now = new Date();
    const isParent = socket.userRole === 'Parent';
    const nonLusField = isParent ? 'nonLusMedecin' : 'nonLusParent';
    
    const msgDoc = {
      idConversation: conversationId,
      idAuteur: socket.userId,
      role: socket.userRole,
      texte: texte.trim(),
      lu: false,
      dateCreation: now,
    };
    
    const result = await db.collection('messages').insertOne(msgDoc);
    
    await db.collection('conversations').updateOne(
      { _id: toObjectId(conversationId) },
      {
        $set: { dernierMessage: texte.trim(), dernierMessageDate: now },
        $inc: { [nonLusField]: 1 }
      }
    );
    
    const destinataire = isParent ? conv.idMedecin?.toString() : conv.idParent?.toString();
    const expediteur = isParent ? conv.nomParent : conv.nomMedecin;
    
    // Notification (optionnelle, peut être enlevée si trop de doublons)
    // await db.collection('notifications').insertOne({ ... }); // ← Commenté si besoin
    
    const savedMsg = { ...msgDoc, _id: result.insertedId };
    
    // Émettre à tous SAUF à l'émetteur (pour éviter le doublon côté client)
    socket.to(`conv_${conversationId}`).emit('new-message', savedMsg);
    // Émettre aussi à l'émetteur avec un flag spécial
    socket.emit('message-sent', savedMsg);
    
  } catch (error) {
    console.error('Socket send-message error:', error);
    socket.emit('message-error', { error: error.message });
  }
});

  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(`conv_${conversationId}`).emit('user-typing', {
      userId: socket.userId,
      isTyping
    });
  });

  socket.on('mark-read', async (data) => {
    const { conversationId } = data;
    try {
      const db = mongoose.connection.db;
      const unreadField = socket.userRole === 'Parent' ? 'nonLusParent' : 'nonLusMedecin';
      
      await db.collection('conversations').updateOne(
        { _id: toObjectId(conversationId) },
        { $set: { [unreadField]: 0 } }
      );
      
      io.to(`conv_${conversationId}`).emit('messages-read', {
        userId: socket.userId,
        conversationId
      });
    } catch (error) {
      console.error('mark-read error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Utilisateur déconnecté: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
  });
});

// ====================== 404 ======================
app.use((req, res) => {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.path}` });
});

// ====================== DÉMARRAGE ======================
// ⚠️ IMPORTANT: Utiliser server.listen au lieu de app.listen
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Serveur SafeKids démarré sur http://localhost:${PORT}`);
  console.log('✅ Correctifs V3 intégrés :');
  console.log('   • buildDestinatireFilter amélioré — 4 combinaisons string/ObjectId');
  console.log('   • buildIdFilter robuste');
  console.log('   • isParticipant() helper');
  console.log('   • Logs debug pour notifications');
  console.log('🔌 WebSocket Socket.IO activé');
});