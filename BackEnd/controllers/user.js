const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {
    console.log('Requête reçue pour inscription:', req.body);

    const email = req.body.email.toLowerCase();
    console.log('Email normalisé:', email);

    User.findOne({ email })
        .then(existingUser => {
            if (existingUser) {
                console.log('Email déjà utilisé');
                return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
            }

            console.log('Email disponible, hachage du mot de passe en cours...');
            bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    console.log('Mot de passe haché avec succès:', hash);

                    const user = new User({
                        email,
                        password: hash
                    });

                    console.log('Tentative d\'enregistrement de l\'utilisateur...');
                    user.save()
                        .then(() => {
                            console.log('Utilisateur créé avec succès');
                            res.status(201).json({ message: 'Utilisateur créé !' });
                        })
                        .catch(error => {
                            console.error('Erreur lors de l\'enregistrement en base de données:', error);
                            res.status(400).json({ error });
                        });
                })
                .catch(error => {
                    console.error('Erreur lors du hachage du mot de passe:', error);
                    res.status(500).json({ error: 'Erreur de hachage du mot de passe.' });
                });
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'email:', error);
            res.status(500).json({ error: 'Erreur lors de la vérification de l\'email.' });
        });
};

exports.login = (req, res, next) => {
    console.log('Requête reçue pour le login:', req.body);
    const email = req.body.email.toLowerCase(); 

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Identifiants incorrects.' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Identifiants incorrects.' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET', 
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error: 'Erreur lors de la vérification du mot de passe.' }));
        })
        .catch(error => res.status(500).json({ error: 'Erreur de connexion à la base de données.' }));
};