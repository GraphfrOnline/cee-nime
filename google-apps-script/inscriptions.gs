/**
 * CEE · réception des inscriptions du site dans un Google Sheets.
 * 1. Créer un Google Sheets sur le compte du club, onglet nommé "Inscriptions".
 * 2. Extensions > Apps Script, coller ce fichier, enregistrer.
 * 3. Déployer > Nouveau déploiement > Application Web
 *    Exécuter en tant que : moi · Qui a accès : Tout le monde.
 * 4. Copier l'URL du déploiement dans assets/config.js (formEndpoint).
 *    Si le tableur existe déjà avec l'ancienne en-tête, y ajouter la colonne « Établissement »
 *    entre « Département » et « Langue ».
 */
function doPost(e) {
  var sh = SpreadsheetApp.getActive().getSheetByName('Inscriptions')
        || SpreadsheetApp.getActive().insertSheet('Inscriptions');
  if (sh.getLastRow() === 0) sh.appendRow(['Date', 'Prénom', 'Nom', 'Mail', 'Département', 'Établissement', 'Langue']);
  var p = e.parameter || {};
  var clean = function (v) { return String(v || '').slice(0, 200).replace(/^[=+\-@]/, "'$&"); };
  sh.appendRow([new Date(), clean(p.prenom), clean(p.nom), clean(p.email), clean(p.departement), clean(p.etablissement), clean(p.langue)]);
  return ContentService.createTextOutput('ok');
}
