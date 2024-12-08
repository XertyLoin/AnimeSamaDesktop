const { app, BrowserWindow } = require('electron');
const DiscordRPC = require('discord-rpc'); // Importation du module Discord RPC
const path = require('path'); // Pour gérer les chemins de fichiers

const clientId = '1315112775789580298'; // Remplace par ton Client ID Discord
const rpc = new DiscordRPC.Client({ transport: 'ipc' });

let mainWindow;

app.on('ready', () => {
  // Connexion à Discord
  rpc.login({ clientId }).catch(console.error);

  rpc.on('ready', () => {
    function updatePresence() {
      const currentUrl = mainWindow.webContents.getURL();
      console.log("Current URL: ", currentUrl);  // Log de l'URL pour vérifier sa validité

      const urlPattern = /https:\/\/anime-sama.fr\/catalogue\/([^\/]+)/;
      const match = currentUrl.match(urlPattern);

      let activityDetails = 'Sur le menu principal';
      let animeUrl = ''; // Lien vers l'anime, à vérifier

      if (match && match[1]) {
        activityDetails = 'Regarde ' + match[1];
        animeUrl = currentUrl;  // Enregistrer l'URL de l'anime actuel
        console.log("Anime URL: ", animeUrl); // Log de l'URL de l'anime
      }

      // Si l'URL animeUrl est vide, utiliser une URL simple pour tester
      if (!animeUrl) {
        animeUrl = "https://example.com"; // URL de test
      }

      // Vérification de la validité de l'URL
      if (!animeUrl.startsWith('https://')) {
        console.error('Invalid URL: ', animeUrl);
        return; // Si l'URL est invalide, on arrête la mise à jour de la Rich Presence
      }

      // Chemin de l'image icon.png dans le dossier 'images'
      const imagePath = path.join(__dirname, 'assets', 'icon.png');

      // Mise à jour de la présence Discord avec un bouton uniquement
      rpc.setActivity({
        details: activityDetails,
        startTimestamp: new Date(),
        largeImageKey: imagePath,
        largeImageText: 'Anime-Sama',
        buttons: [{label: 'Voir l\'anime',  url: "https://google.com",}]
      });

      // Mettre à jour le titre de la fenêtre en fonction de l'URL
      mainWindow.setTitle(activityDetails);
    }

    updatePresence();

    // Mise à jour de la présence et du titre quand la page a fini de se charger
    mainWindow.webContents.on('did-finish-load', () => {
      updatePresence();
    });

    mainWindow.webContents.on('did-navigate', () => {
      updatePresence();
    });

    mainWindow.webContents.on('did-navigate-in-page', () => {
      updatePresence();
    });
  });

  // Créer la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + '/assets/icon.ico',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: false,
      sandbox: true,
    },
    autoHideMenuBar: true,
  });

  // Prévenir l'ouverture des pop-ups
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    mainWindow.loadURL(url);  // Charger l'URL dans la fenêtre principale
  });

  mainWindow.setTitle('MonApplication - Titre Fixe');
  mainWindow.loadURL('https://anime-sama.fr/');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
