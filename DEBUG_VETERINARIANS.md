# Guide de débogage - Création de vétérinaires

## Améliorations apportées

J'ai ajouté les améliorations suivantes pour mieux diagnostiquer les erreurs :

### 1. **Affichage d'erreur détaillé dans le formulaire**
- Un bandeau rouge s'affichera maintenant avec le message d'erreur complet
- Le status HTTP sera affiché

### 2. **Logs console détaillés**
- Les données envoyées sont loggées : `console.log('Creating veterinarian:', createData)`
- Les erreurs sont loggées : `console.error('Error submitting veterinarian form:', error)`

## Comment déboguer

### Étape 1 : Ouvrir la console du navigateur
1. Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
2. Allez dans l'onglet **Console**
3. Essayez de créer un vétérinaire

### Étape 2 : Analyser les logs
Vous devriez voir :
```
Creating veterinarian: { firstName: "...", lastName: "...", ... }
```

Si erreur, vous verrez :
```
Error submitting veterinarian form: { message: "...", status: ... }
```

### Étape 3 : Vérifier l'onglet Network
1. Dans les DevTools, allez dans **Network**
2. Filtrez par **Fetch/XHR**
3. Essayez de créer un vétérinaire
4. Cliquez sur la requête `veterinarians`
5. Regardez :
   - **Request** : les données envoyées
   - **Response** : la réponse du serveur
   - **Headers** : le status code

## Champs requis pour créer un vétérinaire

Selon l'API (WEB_API_SPECIFICATIONS.md section 3.5), les champs **obligatoires** sont :
- `firstName` (string)
- `lastName` (string)
- `licenseNumber` (string)
- `specialties` (string, ex: "Bovins, Ovins")
- `phone` (string)

## Erreurs courantes

### 1. Status 400 - Bad Request
**Cause** : Champs requis manquants ou format invalide
**Solution** : Vérifier que tous les champs requis sont remplis

### 2. Status 401 - Unauthorized
**Cause** : Token d'authentification manquant ou invalide
**Solution** : Vérifier que vous êtes connecté

### 3. Status 500 - Internal Server Error
**Cause** : Erreur côté backend
**Solution** : Vérifier les logs du backend

## Vérifier le backend

Si vous avez accès au backend, vérifiez les logs :
```bash
# Vérifier si le backend tourne
curl http://localhost:3000/health

# Tester l'endpoint veterinarians
curl -X GET http://localhost:3000/farms/TEMP_FARM_ID/veterinarians \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Prochaines étapes

1. **Ouvrez la console du navigateur (F12)**
2. **Essayez de créer un vétérinaire**
3. **Regardez les messages d'erreur** dans :
   - Le bandeau rouge dans le formulaire
   - La console
   - L'onglet Network
4. **Partagez-moi** le message d'erreur exact et je pourrai vous aider

## Contact

Si le problème persiste, partagez-moi :
- Le message d'erreur affiché dans le bandeau rouge
- Les logs de la console
- Le code de statut HTTP de la requête
