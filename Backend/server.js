const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = 'safekids_jwt_secret_2026_changez_moi_en_production';

app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/autisme_bdd')
  .then(() => console.log('✅ Connecté à MongoDB - autisme_bdd'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// ====================== ROUTES AUTH ======================

// Inscription (Signup) - Parent uniquement
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

    const newUser = {
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      role: 'Parent',
      telephone: telephone || '',
      nbrEnfantsAutistes: parseInt(nbrEnfantsAutistes) || 1,
      dateCreation: new Date()
    };

    const result = await mongoose.connection.db.collection('utilisateurs').insertOne(newUser);

    res.status(201).json({ 
      success: true,
      message: 'Compte créé avec succès',
      userId: result.insertedId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// Connexion (Login)
app.post('/login', async (req, res) => {
  try {
    const { email, motDePasse, role } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await mongoose.connection.db.collection('utilisateurs').findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Admin hardcoded
    if (role === 'admin') {
      if (email === 'admin@gmail.com' && motDePasse === 'admin123') {
        const token = jwt.sign({ userId: user._id, email, role: 'Admin' }, JWT_SECRET, { expiresIn: '7d' });
        const { motDePasse: _, ...userData } = user;
        return res.json({ success: true, token, user: { ...userData, role: 'Admin' } });
      }
      return res.status(401).json({ message: 'Identifiants admin invalides' });
    }

    // Vérification rôle pour Parent / Médecin
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: 'Rôle incorrect pour cet utilisateur' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { motDePasse: _, ...userWithoutPass } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPass
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes de test
app.get('/', (req, res) => {
  res.send('Backend SafeKids est en ligne !');
});

app.get('/utilisateurs', async (req, res) => {
  try {
    const users = await mongoose.connection.db.collection('utilisateurs')
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
});