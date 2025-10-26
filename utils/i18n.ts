import { View } from '../types';

export type Language = 'en' | 'fr';

const translations = {
  // General & Common
  loading: { en: 'Loading Application...', fr: 'Chargement de l\'application...' },
  cancel: { en: 'Cancel', fr: 'Annuler' },
  save: { en: 'Save', fr: 'Enregistrer' },
  edit: { en: 'Edit', fr: 'Modifier' },
  date: { en: 'Date', fr: 'Date' },
  description: { en: 'Description', fr: 'Description' },
  amount: { en: 'Amount', fr: 'Montant' },
  status: { en: 'Status', fr: 'Statut' },
  name: { en: 'Name', fr: 'Nom' },
  role: { en: 'Role', fr: 'Rôle' },
  location: { en: 'Location', fr: 'Lieu' },
  
  // App/Header
  appName: { en: 'AgriConnect Mali', fr: 'AgriConnect Mali' },
  logout: { en: 'Logout', fr: 'Déconnexion' },
  
  // Sidebar
  navDashboard: { en: 'Dashboard', fr: 'Tableau de bord' },
  navMarketplace: { en: 'Marketplace', fr: 'Marché' },
  navAnalytics: { en: 'Analytics', fr: 'Analyses' },
  navFinance: { en: 'Finance', fr: 'Finances' },
  navProfile: { en: 'Profile', fr: 'Profil' },
  navImageStudio: { en: 'Image Studio', fr: 'Studio d\'Image' },
  navVoiceAssistant: { en: 'Voice Assistant', fr: 'Assistant Vocal' },
  
  // View Titles
  [View.DASHBOARD]: { en: 'Dashboard', fr: 'Tableau de bord' },
  [View.MARKETPLACE]: { en: 'Marketplace', fr: 'Marché' },
  [View.ANALYTICS]: { en: 'Analytics', fr: 'Analyses' },
  [View.FINANCE]: { en: 'Finance', fr: 'Finances' },
  [View.PROFILE]: { en: 'My Profile', fr: 'Mon Profil' },
  [View.IMAGE_STUDIO]: { en: 'Image Studio', fr: 'Studio d\'Image' },
  [View.VOICE_ASSISTANT]: { en: 'Voice Assistant', fr: 'Assistant Vocal' },
  
  // Dashboard
  welcomeBack: { en: 'Welcome back, {name}!', fr: 'Bon retour, {name}!' },
  activeProjects: { en: 'Active Projects', fr: 'Projets Actifs' },
  productsListed: { en: 'Products Listed', fr: 'Produits Listés' },
  totalIncomeMock: { en: 'Total Income (Mock)', fr: 'Revenu Total (Démo)' },
  yourRecentProjects: { en: 'Your Recent Projects', fr: 'Vos Projets Récents' },
  projectName: { en: 'Project Name', fr: 'Nom du Projet' },
  cropType: { en: 'Crop Type', fr: 'Type de Culture' },
  endDate: { en: 'End Date', fr: 'Date de Fin' },
  
  // Marketplace
  listNewProduct: { en: '+ List New Product', fr: '+ Lister un Produit' },
  contactSeller: { en: 'Contact Seller', fr: 'Contacter le Vendeur' },
  available: { en: 'Available', fr: 'Disponible' },
  outOfStock: { en: 'Out of Stock', fr: 'Rupture de Stock' },
  preOrder: { en: 'Pre-order', fr: 'Pré-commande' },
  
  // Analytics
  analyticsAndInsights: { en: 'Analytics & Insights', fr: 'Analyses et Perspectives' },
  cropYieldOverTime: { en: 'Crop Yield Over Time', fr: 'Rendement des Cultures' },
  revenueVsExpenses: { en: 'Revenue vs. Expenses', fr: 'Revenus vs. Dépenses' },
  chartPlaceholder: { en: '[Chart Placeholder]', fr: '[Espace Réservé Graphique]' },
  aiInsightsTitle: { en: 'Get AI-Powered Market Insights', fr: 'Obtenez des Analyses de Marché par IA' },
  aiInsightsPlaceholder: { en: 'e.g., Cotton demand in Europe', fr: 'ex: Demande de coton en Europe' },
  aiInsightsAnalyzing: { en: 'Analyzing...', fr: 'Analyse en cours...' },
  aiInsightsButton: { en: 'Get Insights', fr: 'Obtenir une Analyse' },
  analysisResults: { en: 'Analysis Results:', fr: 'Résultats de l\'analyse :' },
  
  // Profile
  editProfile: { en: 'Edit Profile', fr: 'Modifier le Profil' },
  updating: { en: 'Updating...', fr: 'Mise à jour...' },
  profileUpdateSuccess: { en: 'Profile updated successfully!', fr: 'Profil mis à jour avec succès !' },
  profileUpdateFailed: { en: 'Failed to update profile.', fr: 'Échec de la mise à jour du profil.' },
  fullName: { en: 'Full Name', fr: 'Nom Complet' },
  emailAddress: { en: 'Email Address', fr: 'Adresse E-mail' },
  phoneNumber: { en: 'Phone Number', fr: 'Numéro de Téléphone' },
  saveChanges: { en: 'Save Changes', fr: 'Enregistrer' },

  // Finance
  financialOverview: { en: 'Financial Overview', fr: 'Aperçu Financier' },
  totalIncome: { en: 'Total Income', fr: 'Revenu Total' },
  totalExpenses: { en: 'Total Expenses', fr: 'Dépenses Totales' },
  netBalance: { en: 'Net Balance', fr: 'Solde Net' },
  recentTransactions: { en: 'Recent Transactions', fr: 'Transactions Récentes' },
  investments: { en: 'Investments', fr: 'Investissements' },
  
  // Image Studio
  changeImage: { en: 'Change Image', fr: 'Changer l\'Image' },
  uploadImage: { en: 'Upload an Image', fr: 'Télécharger une Image' },
  original: { en: 'Original', fr: 'Original' },
  edited: { en: 'Edited', fr: 'Modifiée' },
  noImageUploaded: { en: 'No image uploaded', fr: 'Aucune image téléchargée' },
  generating: { en: 'Generating...', fr: 'Génération en cours...' },
  editResultPlaceholder: { en: 'Edit result will appear here', fr: 'Le résultat apparaîtra ici' },
  editInstruction: { en: 'Edit Instruction:', fr: 'Instruction de modification :' },
  editInstructionPlaceholder: { en: 'e.g., \'Add a basket next to the tomatoes\'', fr: 'ex: \'Ajouter un panier à côté des tomates\'' },
  processing: { en: 'Processing...', fr: 'Traitement...' },
  generateEdit: { en: 'Generate Edit', fr: 'Générer la Modification' },
  
  // Voice Assistant
  voiceAssistantDesc: { en: 'This feature requires microphone access to have a real-time conversation with our AI assistant.', fr: 'Cette fonctionnalité nécessite l\'accès au microphone pour une conversation en temps réel avec notre assistant IA.' },
  startConversation: { en: 'Start Conversation', fr: 'Démarrer la Conversation' },
  stopConversation: { en: 'Stop Conversation', fr: 'Arrêter la Conversation' },
  connecting: { en: 'Connecting...', fr: 'Connexion...' },
  listening: { en: 'Listening...', fr: 'Écoute en cours...' },
  speakNow: { en: 'Speak now...', fr: 'Parlez maintenant...' },
  
  // ChatBot
  chatBotWelcome: { en: 'Hello! How can I help you with your farm today?', fr: 'Bonjour ! Comment puis-je vous aider avec votre ferme aujourd\'hui ?' },
  chatBotHeader: { en: 'Agri-Assistant', fr: 'Agri-Assistant' },
  chatBotPlaceholder: { en: 'Ask something...', fr: 'Posez une question...' },
  chatBotSend: { en: 'Send', fr: 'Envoyer' },
  
  // Auth Modal
  login: { en: 'Login', fr: 'Connexion' },
  createAccount: { en: 'Create Account', fr: 'Créer un Compte' },
  invalidCredentials: { en: 'Invalid email or password.', fr: 'Email ou mot de passe incorrect.' },
  loggingIn: { en: 'Logging in...', fr: 'Connexion en cours...' },
  registering: { en: 'Registering...', fr: 'Inscription en cours...' },
  noAccount: { en: "Don't have an account?", fr: 'Pas encore de compte ?' },
  haveAccount: { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?' },
  signUp: { en: 'Sign Up', fr: 'S\'inscrire' },
  logIn: { en: 'Log In', fr: 'Se connecter' },
  password: { en: 'Password', fr: 'Mot de passe' },
  confirmPassword: { en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
  passwordsNoMatch: { en: 'Passwords do not match.', fr: 'Les mots de passe ne correspondent pas.' },
  registerFailed: { en: 'Registration failed. Email may already be in use.', fr: 'Échec de l\'inscription. L\'email est peut-être déjà utilisé.' },
  registerSuccessLoginFailed: { en: 'Registration succeeded, but failed to log in.', fr: 'Inscription réussie, mais la connexion a échoué.' },
  farmer: { en: 'Farmer', fr: 'Agriculteur' },
  seller: { en: 'Seller', fr: 'Vendeur' },
  both: { en: 'Both', fr: 'Les deux' },
  
  // New Project Modal
  newProjectTitle: { en: 'Create New Project', fr: 'Créer un Nouveau Projet' },
  generateWithAI: { en: 'Generate with AI', fr: 'Générer avec l\'IA' },
  site: { en: 'Site', fr: 'Site' },
  startDate: { en: 'Start Date', fr: 'Date de Début' },
  expectedYield: { en: 'Expected Yield (kg)', fr: 'Rendement Prévu (kg)' },
  createProject: { en: 'Create Project', fr: 'Créer le Projet' },
  newProjectNameCropTypeAlert: { en: "Please enter a project name and crop type first.", fr: "Veuillez d'abord saisir un nom de projet et un type de culture." },

  // Product Listing Modal
  newProductListingTitle: { en: 'New Product Listing', fr: 'Nouvelle Annonce de Produit' },
  productName: { en: 'Product Name', fr: 'Nom du Produit' },
  quantity: { en: 'Quantity', fr: 'Quantité' },
  pricePerUnit: { en: 'Price per Unit', fr: 'Prix par Unité' },
  unit: { en: 'Unit (e.g., kg, bag)', fr: 'Unité (ex: kg, sac)' },
  availability: { en: 'Availability', fr: 'Disponibilité' },
  productImage: { en: 'Product Image', fr: 'Image du Produit' },
  upload: { en: 'Upload', fr: 'Télécharger' },
  submitListing: { en: 'Submit Listing', fr: 'Soumettre l\'Annonce' },
};

type TranslationKey = keyof typeof translations;

export const t = (key: TranslationKey, lang: Language, options?: { [key: string]: string | number }): string => {
  let text = translations[key]?.[lang] || key;
  if (options) {
    Object.keys(options).forEach(placeholder => {
      text = text.replace(`{${placeholder}}`, String(options[placeholder]));
    });
  }
  return text;
};
