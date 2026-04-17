const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const JWT_SECRET = 'safekids_jwt_secret_2026_changez_moi_en_production';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ====================== UPLOADS ======================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// ====================== MONGODB ======================
mongoose.connect('mongodb://localhost:27017/autisme_bdd')
  .then(() => console.log('✅ Connecté à MongoDB - autisme_bdd'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

function toObjectId(id) {
  try { return new mongoose.Types.ObjectId(id); } catch { return null; }
}

function cleanDoc(doc) {
  if (!doc) return null;
  const clean = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v && typeof v === 'object' && v.constructor && v.constructor.name === 'ObjectId') {
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
  if (!/^\d{10}$/.test(cleaned)) {
    return { valid: false, message: 'Le numéro doit contenir exactement 10 chiffres.' };
  }
  if (!/^0[567]/.test(cleaned)) {
    return { valid: false, message: 'Le numéro doit commencer par 05, 06 ou 07.' };
  }
  return { valid: true, cleaned };
}


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

// ====================== JOURS DISPONIBILITÉ ======================
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
  } catch {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: "Accès réservé à l'administrateur" });
  }
  next();
};

// ====================== TEST ======================
app.get('/', (req, res) => res.send('🚀 Backend SafeKids en ligne !'));

// ====================== SPÉCIALITÉS (lecture seule) ======================
// Retourne toujours la liste fixe + compte les médecins par spécialité depuis la BDD
app.get('/api/specialites', authenticateToken, async (req, res) => {
  try {
    const db = mongoose.connection.db;

    // Compter les médecins par spécialité
    const counts = await db.collection('utilisateurs').aggregate([
      { $match: { role: 'Medecin', specialite: { $exists: true, $ne: '' } } },
      { $group: { _id: '$specialite', medecins: { $sum: 1 } } },
    ]).toArray();

    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.medecins; });

    const result = SPECIALITES_LISTE.map(nom => ({
      _id:      nom,
      nom,
      medecins: countMap[nom] || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get specialites error:', error);
    // En cas d'erreur BDD, on retourne quand même la liste fixe
    res.json(SPECIALITES_LISTE.map(nom => ({ _id: nom, nom, medecins: 0 })));
  }
});

// Route publique (sans auth) pour les spécialités — utile si besoin côté signup
app.get('/api/specialites/public', (req, res) => {
  res.json(SPECIALITES_LISTE.map(nom => ({ _id: nom, nom, medecins: 0 })));
});

// Retourner aussi les jours disponibles
app.get('/api/jours', authenticateToken, (req, res) => {
  res.json(JOURS_VALIDES);
});

// ====================== AUTH ======================

app.post('/signup', async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, nbrEnfantsAutistes, telephone } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: 'nom, prenom, email et motDePasse sont obligatoires' });
    }
    if (motDePasse.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Format email invalide' });
    }

    // Téléphone optionnel mais validé s'il est fourni
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

app.post('/login', async (req, res) => {
  try {
    const { email, motDePasse, role } = req.body;
    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const db = mongoose.connection.db;
    const user = await db.collection('utilisateurs').findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: 'Rôle incorrect pour cet utilisateur' });
    }
    if (user.status === 'bloque') {
      return res.status(403).json({
        message: "Votre compte a été bloqué. Contactez l'administrateur.",
      });
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { motDePasse: _, ...userWithoutPass } = user;
    res.json({
      success:           true,
      token,
      user:              cleanDoc(userWithoutPass),
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
    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
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
    if (disponibilite !== undefined) updateFields.disponibilite = disponibilite; // tableau ou string

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }

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
    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
    }
    if (nouveauMotDePasse.length < 6) {
      return res.status(400).json({ message: 'Minimum 6 caractères' });
    }
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

// ====================== UPLOAD AVATAR (Version améliorée) ======================
// ====================== UPLOAD AVATAR (Version corrigée) ======================
app.post('/upload-avatar-base64', authenticateToken, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    console.log('📥 Upload reçu - Taille base64:', imageBase64 ? Math.round(imageBase64.length / 1024) + ' KB' : 0);
    console.log('MimeType reçu:', mimeType);

    if (!imageBase64) {
      return res.status(400).json({ message: 'imageBase64 est requis' });
    }
    if (!mimeType) {
      return res.status(400).json({ message: 'mimeType est requis' });
    }

    // Vérification des formats acceptés
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ 
        message: `Format d'image invalide. Formats acceptés : jpeg, png, webp. Reçu : ${mimeType}` 
      });
    }

    // Nettoyage renforcé du base64
    let cleanBase64 = imageBase64.trim();
    if (cleanBase64.includes(',')) {
      cleanBase64 = cleanBase64.split(',')[1];
    }
    cleanBase64 = cleanBase64.replace(/\s+/g, '');

    if (cleanBase64.length < 100) {
      return res.status(400).json({ message: 'Base64 trop petit ou invalide' });
    }

    const ext = mimeType === 'image/png' ? '.png' : 
                mimeType === 'image/webp' ? '.webp' : '.jpg';

    const filename = `avatar_${req.user.userId}_${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Supprimer ancien avatar (sécurisé)
    const user = await mongoose.connection.db.collection('utilisateurs').findOne(
      { _id: toObjectId(req.user.userId) }
    );
    if (user?.avatar && user.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const imageBuffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(filepath, imageBuffer);

    const avatarUrl = `/uploads/${filename}`;

    await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: toObjectId(req.user.userId) },
      { $set: { avatar: avatarUrl } }
    );

    console.log(`✅ Upload réussi : ${filename} (${imageBuffer.length} bytes)`);

    res.json({ 
      success: true, 
      avatarUrl,
      message: 'Photo de profil mise à jour avec succès' 
    });

  } catch (error) {
    console.error('❌ Upload error détaillée:', error);
    res.status(500).json({ 
      message: "Erreur lors de l'upload de l'image",
      error: error.message 
    });
  }
});
// ====================== MÉDECINS ======================

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

app.post('/api/medecins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { prenom, nom, email, specialite, telephone, disponibilite, password } = req.body;

    // Validation champs obligatoires
    if (!prenom || !nom || !email || !specialite || !password) {
      return res.status(400).json({
        message: 'Champs obligatoires : prénom, nom, email, spécialité, mot de passe',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Format email invalide' });
    }

    // Validation spécialité (doit être dans la liste fixe)
    if (!SPECIALITES_LISTE.includes(specialite.trim())) {
      return res.status(400).json({
        message: `Spécialité invalide. Choisissez parmi : ${SPECIALITES_LISTE.join(', ')}`,
      });
    }

    // Validation téléphone (obligatoire pour médecin)
    if (!telephone || telephone.trim() === '') {
      return res.status(400).json({ message: 'Le téléphone est obligatoire pour un médecin' });
    }
    const telCheck = validateTelephone(telephone);
    if (!telCheck.valid) return res.status(400).json({ message: telCheck.message });

    // Validation disponibilité
    let dispoArray = [];
    if (disponibilite) {
      dispoArray = Array.isArray(disponibilite) ? disponibilite : [disponibilite];
      const invalids = dispoArray.filter(j => !JOURS_VALIDES.includes(j));
      if (invalids.length > 0) {
        return res.status(400).json({ message: `Jours invalides : ${invalids.join(', ')}` });
      }
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

    if (specialite !== undefined && !SPECIALITES_LISTE.includes(specialite.trim())) {
      return res.status(400).json({ message: 'Spécialité invalide' });
    }
    if (telephone !== undefined && telephone !== '') {
      const telCheck = validateTelephone(telephone);
      if (!telCheck.valid) return res.status(400).json({ message: telCheck.message });
    }

    const updateFields = {};
    if (prenom     !== undefined) updateFields.prenom     = prenom.trim();
    if (nom        !== undefined) updateFields.nom        = nom.trim();
    if (email      !== undefined) updateFields.email      = email.trim().toLowerCase();
    if (specialite !== undefined) updateFields.specialite = specialite.trim();
    if (telephone  !== undefined) updateFields.telephone  = telephone.replace(/[\s\-\.]/g, '').trim();
    if (disponibilite !== undefined) {
      updateFields.disponibilite = Array.isArray(disponibilite) ? disponibilite : [disponibilite];
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à modifier' });
    }

    const result = await mongoose.connection.db.collection('utilisateurs').updateOne(
      { _id: id, role: 'Medecin' },
      { $set: updateFields }
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
    if (!['actif', 'bloque', 'attente'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide (actif | bloque | attente)' });
    }
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
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Minimum 6 caractères' });
    }
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
    if (!['actif', 'bloque', 'attente'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
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
      const result = await db.collection('enfants').aggregate([
        { $group: { _id: '$niveauTSA', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();
      niveauxTSA = result.map(r => ({ nom: r._id || 'Non défini', count: r.count }));
    } catch {}

    let domaines = [];
    try {
      const result = await db.collection('activites').aggregate([
        { $group: { _id: '$domaine', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();
      const total = result.reduce((a, r) => a + r.count, 0);
      domaines = result.map(r => ({
        nom:   r._id || 'Non défini',
        pct:   total > 0 ? Math.round((r.count / total) * 100) : 0,
        count: r.count,
      }));
    } catch {}

    let tauxSuccesMoyen = null;
    let engagementMoyen = null;
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
      const result = await db.collection('rendezvous').aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } },
      ]).toArray();
      result.forEach(r => { statutsRdv[r._id || 'inconnu'] = r.count; });
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

// ====================== ENFANTS ======================

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
// Structure : { domaine, type, materiel_requis: [string], objectif, conseils, attention, duree, url }

// GET /api/activites — liste toutes les activités (filtre optionnel par domaine)
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

// GET /api/activites/:id — une activité par ID
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

// POST /api/activites — créer une activité
app.post('/api/activites', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { domaine, type, materiel_requis, objectif, conseils, attention, duree, url } = req.body;

    if (!domaine?.trim()) return res.status(400).json({ message: 'Le domaine est obligatoire' });
    if (!type?.trim())    return res.status(400).json({ message: 'Le type est obligatoire' });

    // materiel_requis doit être un tableau
    let materiel = [];
    if (Array.isArray(materiel_requis)) {
      materiel = materiel_requis.map(m => m.trim()).filter(Boolean);
    } else if (typeof materiel_requis === 'string' && materiel_requis.trim()) {
      materiel = [materiel_requis.trim()];
    }

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

// PUT /api/activites/:id — modifier une activité
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
      if (Array.isArray(materiel_requis)) {
        updateFields.materiel_requis = materiel_requis.map(m => m.trim()).filter(Boolean);
      } else if (typeof materiel_requis === 'string') {
        updateFields.materiel_requis = materiel_requis.trim() ? [materiel_requis.trim()] : [];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Aucun champ à modifier' });
    }

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

// DELETE /api/activites/:id
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

// GET /api/domaines — liste des domaines distincts
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

// POST /api/activites/migrate — migrer materiel_requis string → array (à appeler une seule fois)
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

// ====================== DÉMARRAGE ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Serveur SafeKids démarré sur http://localhost:${PORT}`);
  console.log('\n📋 Routes :');
  console.log('  POST   /signup');
  console.log('  POST   /login');
  console.log('  POST   /setup-admin');
  console.log('  GET    /profile  |  PUT /profile');
  console.log('  PUT    /change-password');
  console.log('  POST   /upload-avatar-base64');
  console.log('  GET    /api/specialites      ← liste fixe, toujours disponible');
  console.log('  GET    /api/specialites/public');
  console.log('  GET    /api/jours            ← jours de disponibilité');
  console.log('  GET    /api/medecins  |  POST /api/medecins');
  console.log('  PUT    /api/medecins/:id');
  console.log('  PATCH  /api/medecins/:id/status');
  console.log('  PATCH  /api/medecins/:id/reset-password');
  console.log('  DELETE /api/medecins/:id');
  console.log('  GET    /api/parents');
  console.log('  PATCH  /api/parents/:id/status');
  console.log('  DELETE /api/parents/:id');
  console.log('  GET    /api/stats/overview');
  console.log('  GET    /api/enfants');
  console.log('  GET    /api/activites  |  POST /api/activites');
  console.log('  GET    /api/activites/:id');
  console.log('  PUT    /api/activites/:id');
  console.log('  DELETE /api/activites/:id');
  console.log('  GET    /api/domaines');
  console.log('  POST   /api/activites/migrate');
  console.log('  GET    /utilisateurs  (debug)\n');
});