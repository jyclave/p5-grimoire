Cette API permet de gérer une collection de livres : ajout, modification, suppression et notation.  
Développée avec **Node.js**, **Express** et **MongoDB**.
Un visiteur peut visualiser la collection de livres et afficher la fiche d'un livre avec sa note
Un visiteur avec un compte peut ajouter un livre - peut noter une seule fois un livre qu'un autre utilisateur a ajouté à la collection. Il peut modifier ou supprimer un livre 
qu'il a ajouté.

L’API est accessible sur http://localhost:4000
npm run dev
Le frontend sur 3000
npm run start

Routes de l’API
Books
Get /api/books / récupérer tous les livres
Get /api/books/bestrating / récupérer la fiche de notation du livre
Get /api/books/:id / afficher un livre par son ID
Post /api/books / ajouter un livre
Post /api/books/:id/rating / ajoputer une note à un livre 
Put /api/books/:id / modifier un livre
Delete /api/books/:id / supprimer un livre
Users
Post /api/auth/signup / créer un compte utilisateur
Post /api/auth/login / se connecter et obtenir un token

Stack Technique
	•	Node.js & Express.js (Backend)
	•	MongoDB & Mongoose (Base de données)
	•	JWT (Authentification)
	•	Multer (Upload d’images)


Crée un fichier .env à la racine et ajoute :
PORT = 4000
MONGO_URI=mongodb+srv://user:password@openclassrooms.muaak.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=RANDOM_TOKEN_SECRET





 
