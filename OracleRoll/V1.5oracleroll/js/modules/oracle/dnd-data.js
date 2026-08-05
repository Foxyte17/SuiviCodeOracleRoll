// ============================================================
// dnd-data.js - Données partagées du système D&D-like (OracleRoll)
// Source unique : fiche d'aventurier + tables oracle « Tirage complet ».
// ============================================================

const DND_RACES = ["Humain", "Elfe", "Nain", "Halfelin", "Drakéide", "Gnome", "Demi-elfe", "Demi-orc", "Tieffelin", "Argonien", "Bouquenar", "Catthar", "Minorog"];

const DND_CLASSES = [
  { name: "Barbare", hitDie: 12 },
  { name: "Barde", hitDie: 8 },
  { name: "Clerc", hitDie: 8 },
  { name: "Druide", hitDie: 8 },
  { name: "Guerrier", hitDie: 10 },
  { name: "Magicien", hitDie: 6 },
  { name: "Moine", hitDie: 8 },
  { name: "Paladin", hitDie: 10 },
  { name: "Rôdeur", hitDie: 10 },
  { name: "Roublard", hitDie: 8 },
  { name: "Sorcier", hitDie: 6 },
  { name: "Occultiste", hitDie: 8 }
];

const DND_CLASS_DETAILS = [
  { name: "Barbare", icon: "flame", role: "Corps-à-corps, dégâts bruts", trait: "Rage : plus de dégâts, moins de précision" },
  { name: "Barde", icon: "lyre", role: "Soutien, inspiration, polyvalence", trait: "Inspire les alliés et cumule les compétences" },
  { name: "Clerc", icon: "heart", role: "Soin et soutien", trait: "Peut stabiliser un allié à l'agonie" },
  { name: "Druide", icon: "tree", role: "Soutien, contrôle du terrain", trait: "Peut prendre une forme animale simple" },
  { name: "Guerrier", icon: "sword", role: "Corps-à-corps, encaisse les coups", trait: "Résiste mieux aux effets physiques" },
  { name: "Magicien", icon: "book", role: "Dégâts à distance, contrôle", trait: "Réserve de sorts limitée par repos" },
  { name: "Moine", icon: "fist", role: "Frappe rapide, mobilité", trait: "Frappe sans arme, résiste aux effets mentaux" },
  { name: "Paladin", icon: "helm", role: "Défense, aura protectrice", trait: "Imposition des mains et serment sacré" },
  { name: "Rôdeur", icon: "bow", role: "Dégâts à distance, pistage", trait: "Avantage contre une proie désignée" },
  { name: "Roublard", icon: "dagger", role: "Dégâts furtifs, discrétion", trait: "Avantage quand la cible est distraite" },
  { name: "Sorcier", icon: "wand", role: "Dégâts à distance, magie brute", trait: "Sorts enracinés dans le sang ou une malédiction" },
  { name: "Occultiste", icon: "pentagram", role: "Magie pactée, contrôle", trait: "Renouvelle ses sorts par de brefs rituels" }
];

const DND_CLASS_IMAGES = {
  "Barbare": "assets/classes/barbare.jpg",
  "Barde": "assets/classes/barde.jpg",
  "Clerc": "assets/classes/clerc.jpg",
  "Druide": "assets/classes/druide.jpg",
  "Guerrier": "assets/classes/guerrier.jpg",
  "Magicien": "assets/classes/magicien.jpg",
  "Moine": "assets/classes/moine.jpg",
  "Paladin": "assets/classes/paladin.jpg",
  "Rôdeur": "assets/classes/rodeur.jpg",
  "Roublard": "assets/classes/roublard.jpg",
  "Sorcier": "assets/classes/sorcier.jpg",
  "Occultiste": "assets/classes/occultiste.jpg"
};

const DND_RACE_DETAILS = [
  { name: "Humain", icon: "star", trait: "Polyvalent, s'adapte vite", avantage: "+1 sur une compétence au choix" },
  { name: "Elfe", icon: "moon", trait: "Fin, à l'aise en pleine nature", avantage: "Meilleure perception, peu de sommeil" },
  { name: "Nain", icon: "mountain", trait: "Robuste, natif des souterrains", avantage: "Résiste mieux au poison, vision dans le noir" },
  { name: "Halfelin", icon: "coin", trait: "Petit, discret, chanceux", avantage: "Relance les échecs critiques une fois" },
  { name: "Drakéide", icon: "dragon", trait: "Fier, héritier des dragons", avantage: "Souffle élémentaire, résiste au poison" },
  { name: "Gnome", icon: "lightning", trait: "Curieux, inventif", avantage: "Résiste mieux aux effets mentaux" },
  { name: "Demi-elfe", icon: "sparkle", trait: "Entre deux mondes, charismatique", avantage: "À l'aise auprès des humains comme des elfes" },
  { name: "Demi-orc", icon: "flame", trait: "Fort, intimidant", avantage: "Reste debout une fois à terre" },
  { name: "Tieffelin", icon: "horns", trait: "Sang infernal, magnétique", avantage: "Résiste au feu et lit dans les ténèbres" },
  { name: "Argonien", icon: "dragon", trait: "Écailleux, à l'aise dans l'eau", avantage: "Respiration aquatique, résiste au poison" },
  { name: "Bouquenar", icon: "horns", trait: "Robuste des montagnes, cornes de bouc", avantage: "Charge aux cornes, grande endurance" },
  { name: "Catthar", icon: "sparkle", trait: "Félin agile et curieux", avantage: "Griffes rétractiles, grande discrétion" },
  { name: "Minorog", icon: "horns", trait: "Puissant, sens de l'orientation", avantage: "Charge aux cornes, jamais perdu" }
];

const DND_RACE_IMAGES = {
  "Humain": "assets/races/humain.jpg",
  "Elfe": "assets/races/elfe.jpg",
  "Nain": "assets/races/nain.jpg",
  "Halfelin": "assets/races/halfelin.jpg",
  "Drakéide": "assets/races/drakeide.jpg",
  "Gnome": "assets/races/gnome.jpg",
  "Demi-elfe": "assets/races/demi-elfe.jpg",
  "Demi-orc": "assets/races/demi-orc.jpg",
  "Tieffelin": "assets/races/tieffelin.jpg",
  "Argonien": "assets/races/argonien.jpg",
  "Bouquenar": "assets/races/bouquenar.jpg",
  "Catthar": "assets/races/catthar.jpg",
  "Minorog": "assets/races/minorog.jpg"
};

const DND_CLASS_SPRITE_POS = {
  "Barbare": "0% 0%", "Barde": "50% 0%", "Clerc": "100% 0%",
  "Druide": "0% 25%", "Guerrier": "50% 25%", "Magicien": "100% 25%",
  "Moine": "0% 50%", "Paladin": "50% 50%", "Rôdeur": "100% 50%",
  "Roublard": "0% 75%", "Sorcier": "50% 75%", "Occultiste": "100% 75%"
};

// ============================================================
// Compétences (liées aux caractéristiques)
// ============================================================
const DND_SKILLS = [
  { name: "Athlétisme", stat: "FOR" },
  { name: "Intimidation", stat: "CHA" },
  { name: "Acrobaties", stat: "DEX" },
  { name: "Discrétion", stat: "DEX" },
  { name: "Escamotage", stat: "DEX" },
  { name: "Endurance", stat: "CON" },
  { name: "Arcanes", stat: "INT" },
  { name: "Histoire", stat: "INT" },
  { name: "Nature", stat: "INT" },
  { name: "Investigation", stat: "INT" },
  { name: "Perception", stat: "SAG" },
  { name: "Survie", stat: "SAG" },
  { name: "Médecine", stat: "SAG" },
  { name: "Perspicacité", stat: "SAG" },
  { name: "Persuasion", stat: "CHA" },
  { name: "Tromperie", stat: "CHA" },
  { name: "Représentation", stat: "CHA" }
];

// ============================================================
// États (base AideDD - SRD 5e)
// ============================================================
const DND_STATES = [
  { name: "À terre", desc: "Avantage pour les attaquants au corps-à-corps, désavantage pour les attaques à distance." },
  { name: "Aveuglé", desc: "Échec automatique des tests liés à la vue, désavantage en attaque." },
  { name: "Charmé", desc: "Ne peut pas attaquer le charmeur, avantage sur ses tests sociaux." },
  { name: "Empoisonné", desc: "Désavantage sur les attaques et les tests de caractéristiques." },
  { name: "Entravé", desc: "Vitesse 0, désavantage en attaque, avantage pour vos attaquants." },
  { name: "Étourdi", desc: "Perd son tour, échec auto des tests de FOR et DEX, avantage pour vos attaquants." },
  { name: "Inconscient", desc: "Incapacité, échec auto des tests de FOR/DEX, coups de grâce automatiques." },
  { name: "Invisible", desc: "Avantage en attaque, désavantage contre vous pour ceux qui ne vous voient pas." },
  { name: "Paralysé", desc: "Incapacité, échec auto des tests de FOR/DEX, coups portés : critique automatique." },
  { name: "Pétrifié", desc: "Transformé en pierre, incapacité, immunité aux dégâts, inconscience." },
  { name: "Saisi", desc: "Vitesse 0, désavantage en attaque, avantage pour vos attaquants." },
  { name: "Sourd", desc: "Échec automatique des tests liés à l'ouïe." }
];

// ============================================================
// Armes et armures
// ============================================================
const DND_WEAPONS = [
  { name: "Poings", dmg: "1D2", mod: "FOR", type: "corps" },
  { name: "Dague", dmg: "1D4", mod: "DEX", type: "corps" },
  { name: "Épée courte", dmg: "1D6", mod: "DEX", type: "corps" },
  { name: "Cimeterre", dmg: "1D6", mod: "FOR", type: "corps" },
  { name: "Hache d'armes", dmg: "1D8", mod: "FOR", type: "corps" },
  { name: "Marteau de guerre", dmg: "1D8", mod: "FOR", type: "corps" },
  { name: "Arc court", dmg: "1D6", mod: "DEX", type: "distance" },
  { name: "Arc long", dmg: "1D8", mod: "DEX", type: "distance" }
];

const DND_ARMOR = [
  { name: "Sans armure", ca: 10, dex: true },
  { name: "Armure de cuir", ca: 11, dex: true },
  { name: "Armure de cuir clouté", ca: 12, dex: true },
  { name: "Chemise de mailles", ca: 13, dex: true }
];

// ============================================================
// Monstres (base AideDD - SRD 5e, sélection raisonnable)
// danger : 1 = faible, 5 = très dangereux (guidage de rencontre)
// ============================================================
const DND_MONSTERS = [
  { name: "Bandit", pv: 11, ca: 12, attack: "Cimeterre", dmg: "1D6+2", xp: 25, danger: 1 },
  { name: "Rat géant", pv: 7, ca: 12, attack: "Morsure", dmg: "1D4+2", xp: 25, danger: 1 },
  { name: "Gobelin", pv: 7, ca: 15, attack: "Rapière", dmg: "1D6+2", xp: 50, danger: 1 },
  { name: "Squelette", pv: 13, ca: 13, attack: "Épée courte", dmg: "1D6+2", xp: 50, danger: 1 },
  { name: "Loup", pv: 11, ca: 13, attack: "Morsure", dmg: "1D6+2", xp: 50, danger: 1 },
  { name: "Chauve-souris géante", pv: 22, ca: 13, attack: "Morsure", dmg: "1D6+3", xp: 100, danger: 2 },
  { name: "Dragonnet noir", pv: 22, ca: 17, attack: "Morsure", dmg: "1D10+2", xp: 200, danger: 2 },
  { name: "Gobours", pv: 39, ca: 15, attack: "Griffe", dmg: "2D4+2", xp: 200, danger: 2 },
  { name: "Harpie", pv: 38, ca: 11, attack: "Griffes", dmg: "2D4+2", xp: 200, danger: 2 },
  { name: "Basilic", pv: 52, ca: 15, attack: "Morsure", dmg: "1D10+3", xp: 700, danger: 3 },
  { name: "Ogre", pv: 59, ca: 11, attack: "Gourdin", dmg: "2D8+4", xp: 450, danger: 3 },
  { name: "Troll", pv: 84, ca: 15, attack: "Griffes", dmg: "2D6+4", xp: 700, danger: 3 },
  { name: "Manticore", pv: 68, ca: 14, attack: "Piques", dmg: "1D8+3", xp: 700, danger: 3 },
  { name: "Loup-garou", pv: 58, ca: 11, attack: "Morsure", dmg: "1D8+3", xp: 450, danger: 3 },
  { name: "Chimère", pv: 114, ca: 14, attack: "Morsure", dmg: "2D6+4", xp: 1100, danger: 4 },
  { name: "Géant des collines", pv: 105, ca: 13, attack: "Massue", dmg: "3D8+5", xp: 1800, danger: 4 },
  { name: "Golem de chair", pv: 93, ca: 9, attack: "Poing", dmg: "2D8+4", xp: 1100, danger: 4 },
  { name: "Liche", pv: 135, ca: 17, attack: "Contact", dmg: "1D10+5", xp: 11000, danger: 5 },
  { name: "Dragon rouge adulte", pv: 256, ca: 19, attack: "Morsure", dmg: "2D10+6", xp: 22000, danger: 5 },
  { name: "Tarrasque", pv: 676, ca: 25, attack: "Morsure", dmg: "4D12+7", xp: 155000, danger: 5 }
];

// ============================================================
// Sorts (base AideDD - SRD 5e, sélection raisonnable)
// Les classes sans magie de base (Barbare, Moine, Roublard)
// reçoivent une liste « maisonnée » pour que le choix de
// sorts fonctionne pour toutes les classes.
// ============================================================
const DND_SPELLS = [
  // --- Niveau 1 ---
  { nom: "Projectile magique", niveau: 1, ecole: "Évocation", temps: "1 action", portee: "36 m", duree: "Instantanée", effet: "Trois rayons infaillibles infligent 1D4+1 dégâts de force chacun.", classes: ["Magicien", "Sorcier"] },
  { nom: "Armure du mage", niveau: 1, ecole: "Abjuration", temps: "1 action", portee: "Contact", duree: "8 h", effet: "CA devient 13 + mod DEX.", classes: ["Magicien", "Sorcier", "Occultiste"] },
  { nom: "Bouclier", niveau: 1, ecole: "Abjuration", temps: "Réaction", portee: "Personnelle", duree: "1 tour", effet: "CA +5 jusqu'au prochain tour.", classes: ["Magicien", "Sorcier"] },
  { nom: "Mains brûlantes", niveau: 1, ecole: "Évocation", temps: "1 action", portee: "4,5 m", duree: "Instantanée", effet: "Cône de feu, 3D6 dégâts de feu.", classes: ["Magicien", "Sorcier"] },
  { nom: "Sommeil", niveau: 1, ecole: "Enchantement", temps: "1 action", portee: "27 m", duree: "1 min", effet: "5D8 PV de créatures s'endorment.", classes: ["Barde", "Sorcier", "Magicien"] },
  { nom: "Charme-personne", niveau: 1, ecole: "Enchantement", temps: "1 action", portee: "9 m", duree: "1 h", effet: "Une créature humanoïde devient amicale.", classes: ["Barde", "Druide", "Sorcier", "Magicien", "Occultiste"] },
  { nom: "Détection de la magie", niveau: 1, ecole: "Divination", temps: "1 action", portee: "Personnelle", duree: "10 min", effet: "Perçoit la magie à proximité.", classes: ["Barde", "Clerc", "Druide", "Magicien", "Sorcier", "Occultiste", "Paladin"] },
  { nom: "Mot de guérison", niveau: 1, ecole: "Évocation", temps: "1 action bonus", portee: "18 m", duree: "Instantanée", effet: "Un allié récupère 1D4+mod de PV.", classes: ["Barde", "Clerc", "Druide", "Paladin"] },
  { nom: "Bénédiction", niveau: 1, ecole: "Enchantement", temps: "1 action", portee: "9 m", duree: "1 min", effet: "Jusqu'à 3 alliés : +1D4 sur attaques et tests.", classes: ["Clerc", "Paladin"] },
  { nom: "Bouclier de la foi", niveau: 1, ecole: "Abjuration", temps: "1 action bonus", portee: "18 m", duree: "10 min", effet: "+2 CA pour une créature.", classes: ["Clerc", "Paladin"] },
  { nom: "Lumière", niveau: 1, ecole: "Évocation", temps: "1 action", portee: "Contact", duree: "1 h", effet: "Un objet émet une lumière vive sur 6 m.", classes: ["Barde", "Clerc", "Magicien", "Sorcier"] },
  { nom: "Graisse", niveau: 1, ecole: "Conjuration", temps: "1 action", portee: "18 m", duree: "1 min", effet: "Une zone de 3 m devient glissante, chute si échec de DEX.", classes: ["Magicien", "Sorcier"] },
  { nom: "Fou rire de Tasha", niveau: 1, ecole: "Enchantement", temps: "1 action", portee: "9 m", duree: "1 min", effet: "La cible est prise d'un rire irrépressible.", classes: ["Barde", "Magicien"] },
  { nom: "Contact glacial", niveau: 1, ecole: "Nécromancie", temps: "1 action", portee: "4,5 m", duree: "Instantanée", effet: "1D8 dégâts nécrotiques, vitesse réduite de 3 m.", classes: ["Sorcier", "Occultiste"] },
  { nom: "Alarme", niveau: 1, ecole: "Abjuration", temps: "1 action", portee: "9 m", duree: "8 h", effet: "Prévient d'une intrusion pendant 8 h.", classes: ["Magicien", "Rôdeur"] },
  { nom: "Compréhension des langues", niveau: 1, ecole: "Divination", temps: "1 action", portee: "Contact", duree: "1 h", effet: "Comprend toutes les langues pendant 1 h.", classes: ["Barde", "Clerc", "Sorcier", "Magicien", "Occultiste"] },
  { nom: "Feu féerique", niveau: 1, ecole: "Évocation", temps: "1 action", portee: "18 m", duree: "1 min", effet: "Des créatures luisent : avantage pour les attaquer.", classes: ["Barde", "Druide", "Sorcier"] },
  { nom: "Bond", niveau: 1, ecole: "Transmutation", temps: "1 action", portee: "Contact", duree: "1 min", effet: "Le saut d'une créature est triplé.", classes: ["Barde", "Druide", "Magicien", "Sorcier"] },
  { nom: "Hurlement de guerre", niveau: 1, ecole: "Évocation", temps: "1 action", portee: "6 m", duree: "Instantanée", effet: "Les ennemis à 6 m sont Effrayés (échec SAG).", classes: ["Barbare"] },
  { nom: "Peau de pierre", niveau: 1, ecole: "Transmutation", temps: "1 action", portee: "Personnelle", duree: "1 min", effet: "+2 CA, peau durcie.", classes: ["Barbare"] },
  { nom: "Souffle de la bête", niveau: 1, ecole: "Conjuration", temps: "1 action bonus", portee: "Personnelle", duree: "1 min", effet: "+1D4 dégâts sur votre prochaine attaque.", classes: ["Barbare"] },
  { nom: "Poing du vent", niveau: 1, ecole: "Évocation", temps: "1 action", portee: "Contact", duree: "Instantanée", effet: "1D6 dégâts + la cible est repoussée.", classes: ["Moine"] },
  { nom: "Méditation profonde", niveau: 1, ecole: "Abjuration", temps: "1 action", portee: "Personnelle", duree: "Instantanée", effet: "Récupère 1D8 PV.", classes: ["Moine"] },
  { nom: "Pas de la brume", niveau: 1, ecole: "Conjuration", temps: "1 action bonus", portee: "Personnelle", duree: "1 tour", effet: "Fondu dans l'ombre, invisible un tour.", classes: ["Moine"] },
  { nom: "Ombre feinte", niveau: 1, ecole: "Illusion", temps: "1 action", portee: "9 m", duree: "1 min", effet: "Crée un double qui attire l'attention.", classes: ["Roublard"] },
  { nom: "Main de l'adresse", niveau: 1, ecole: "Transmutation", temps: "1 action bonus", portee: "Personnelle", duree: "1 min", effet: "+5 à votre prochain test de DEX.", classes: ["Roublard"] },
  { nom: "Poison de nuit", niveau: 1, ecole: "Nécromancie", temps: "1 action bonus", portee: "Contact", duree: "1 min", effet: "Votre arme inflige +1D6 dégâts de poison.", classes: ["Roublard"] },
  { nom: "Cri de bataille", niveau: 1, ecole: "Évocation", temps: "1 action", portee: "6 m", duree: "1 min", effet: "Les alliés à 6 m gagnent +1D4 sur leur prochaine attaque.", classes: ["Guerrier"] },
  { nom: "Posture défensive", niveau: 1, ecole: "Abjuration", temps: "1 action bonus", portee: "Personnelle", duree: "1 tour", effet: "+2 CA jusqu'à votre prochain tour.", classes: ["Guerrier"] },
  { nom: "Frappe précise", niveau: 1, ecole: "Divination", temps: "1 action bonus", portee: "Personnelle", duree: "1 min", effet: "+1D6 aux dégâts de votre prochaine attaque.", classes: ["Guerrier"] },
  { nom: "Marque de la proie", niveau: 1, ecole: "Divination", temps: "1 action bonus", portee: "27 m", duree: "1 h", effet: "Désigne une proie, vous êtes avantagé contre elle.", classes: ["Rôdeur"] },
  { nom: "Piège à mâchoires", niveau: 1, ecole: "Transmutation", temps: "1 action", portee: "9 m", duree: "1 h", effet: "Tend un piège : la première créature qui passe subit 1D8 dégâts.", classes: ["Rôdeur"] },

  // --- Niveau 2 ---
  { nom: "Image miroir", niveau: 2, ecole: "Illusion", temps: "1 action", portee: "Personnelle", duree: "1 min", effet: "Trois doubles détournent les attaques.", classes: ["Magicien", "Sorcier"] },
  { nom: "Invisibilité", niveau: 2, ecole: "Illusion", temps: "1 action", portee: "Contact", duree: "1 h", effet: "La cible devient invisible.", classes: ["Barde", "Magicien", "Sorcier"] },
  { nom: "Pas brumeux", niveau: 2, ecole: "Conjuration", temps: "1 action bonus", portee: "Personnelle", duree: "Instantanée", effet: "Téléportation de 9 m en action bonus.", classes: ["Magicien", "Sorcier", "Occultiste"] },
  { nom: "Rayon ardent", niveau: 2, ecole: "Évocation", temps: "1 action", portee: "36 m", duree: "Instantanée", effet: "Trois rayons, 2D6 dégâts de feu chacun.", classes: ["Magicien", "Sorcier"] },
  { nom: "Vague tonnante", niveau: 2, ecole: "Évocation", temps: "1 action", portee: "Personnelle", duree: "Instantanée", effet: "Onde de choc, 2D8 dégâts + repoussé.", classes: ["Barde", "Druide", "Magicien", "Sorcier"] },
  { nom: "Restauration inférieure", niveau: 2, ecole: "Abjuration", temps: "1 action", portee: "Contact", duree: "Instantanée", effet: "Met fin à une maladie, un poison ou un état.", classes: ["Barde", "Clerc", "Druide", "Paladin", "Rôdeur"] },
  { nom: "Augure", niveau: 2, ecole: "Divination", temps: "1 minute", portee: "Personnelle", duree: "Instantanée", effet: "Pressent le succès ou l'échec d'une action.", classes: ["Clerc", "Druide"] },
  { nom: "Cécité/surdité", niveau: 2, ecole: "Nécromancie", temps: "1 action", portee: "9 m", duree: "1 min", effet: "Aveugle ou rend sourd une créature.", classes: ["Barde", "Clerc", "Sorcier", "Magicien", "Occultiste"] },
  { nom: "Prière de soins", niveau: 2, ecole: "Évocation", temps: "1 action", portee: "9 m", duree: "Instantanée", effet: "Soigne 2D8+mod de PV, plusieurs alliés.", classes: ["Clerc", "Paladin"] },
  { nom: "Croissance d'épines", niveau: 2, ecole: "Transmutation", temps: "1 action", portee: "45 m", duree: "10 min", effet: "Le sol se hérisse d'épines, terrain difficile + dégâts.", classes: ["Druide", "Rôdeur"] },
  { nom: "Châtiment tonitruant", niveau: 2, ecole: "Évocation", temps: "1 action bonus", portee: "Personnelle", duree: "1 min", effet: "Votre prochaine arme frappe : +2D6 dégâts de tonnerre.", classes: ["Paladin"] },

  // --- Niveau 3 ---
  { nom: "Boule de feu", niveau: 3, ecole: "Évocation", temps: "1 action", portee: "45 m", duree: "Instantanée", effet: "Explosion de feu en zone, 8D6 dégâts.", classes: ["Magicien", "Sorcier"] },
  { nom: "Éclair", niveau: 3, ecole: "Évocation", temps: "1 action", portee: "Personnelle", duree: "Instantanée", effet: "Ligne de foudre, 8D6 dégâts.", classes: ["Magicien", "Sorcier"] },
  { nom: "Dissipation de la magie", niveau: 3, ecole: "Abjuration", temps: "1 action", portee: "36 m", duree: "Instantanée", effet: "Met fin à un effet magique.", classes: ["Barde", "Clerc", "Druide", "Magicien", "Sorcier", "Occultiste", "Paladin"] },
  { nom: "Mot de soins", niveau: 3, ecole: "Évocation", temps: "1 action", portee: "Contact", duree: "Instantanée", effet: "Soigne 3D8+mod de PV.", classes: ["Clerc"] },
  { nom: "Lenteur", niveau: 3, ecole: "Transmutation", temps: "1 action", portee: "36 m", duree: "1 min", effet: "Des créatures ralenties perdent vitesse et actions.", classes: ["Magicien", "Sorcier"] },
  { nom: "Peur", niveau: 3, ecole: "Illusion", temps: "1 action", portee: "Personnelle", duree: "1 min", effet: "Les créatures effrayées fuient.", classes: ["Barde", "Magicien", "Sorcier", "Occultiste"] },
  { nom: "Vol", niveau: 3, ecole: "Transmutation", temps: "1 action", portee: "Contact", duree: "10 min", effet: "Vitesse de vol de 18 m.", classes: ["Magicien", "Sorcier", "Occultiste"] },
  { nom: "Ronde de faucon", niveau: 3, ecole: "Divination", temps: "1 action", portee: "Personnelle", duree: "1 h", effet: "Un faucon spirituel vous guide et vous alerte.", classes: ["Rôdeur"] }
];

// ============================================================
// Événements chronométrés (urgences)
// ============================================================
const DND_EVENT_TYPES = [
  {
    id: "surprise", label: "Attaque surprise", timeLimit: 45, urgency: true, dc: 15,
    consequence: "Les bandits vous prennent de court : subissez 1D6 dégâts et vous êtes désavantagé sur la prochaine action.",
    actions: [
      { label: "Fuir", stat: "DEX", skill: "Discrétion" },
      { label: "Combattre", stat: "FOR", skill: "Athlétisme" },
      { label: "Parlementer", stat: "CHA", skill: "Persuasion" }
    ]
  },
  {
    id: "piege", label: "Piège en déclenchement", timeLimit: 30, urgency: true, dc: 15,
    consequence: "Le piège se referme : subissez 2D6 dégâts.",
    actions: [
      { label: "Désamorcer", stat: "DEX", skill: "Escamotage" },
      { label: "Sauter", stat: "FOR", skill: "Athlétisme" },
      { label: "Flairer", stat: "SAG", skill: "Perception" }
    ]
  },
  {
    id: "effondrement", label: "Effondrement", timeLimit: 30, urgency: true, dc: 15,
    consequence: "L'effondrement vous ensevelit : subissez 2D6 dégâts et vous êtes entravé.",
    actions: [
      { label: "Courir", stat: "DEX", skill: "Acrobaties" },
      { label: "Se jeter dans l'ouverture", stat: "FOR", skill: "Athlétisme" },
      { label: "S'abriter", stat: "SAG", skill: "Survie" }
    ]
  },
  {
    id: "fuite", label: "Course-poursuite", timeLimit: 20, urgency: true, dc: 15,
    consequence: "Vous êtes rattrapé : le poursuivant frappe (1D8 dégâts).",
    actions: [
      { label: "Foncer", stat: "FOR", skill: "Endurance" },
      { label: "Semer", stat: "DEX", skill: "Discrétion" },
      { label: "Feinter", stat: "CHA", skill: "Tromperie" }
    ]
  },
  {
    id: "porte", label: "Porte qui se referme", timeLimit: 15, urgency: true, dc: 15,
    consequence: "La porte se verrouille : vous restez piégé et une menace approche.",
    actions: [
      { label: "Forcer", stat: "FOR", skill: "Athlétisme" },
      { label: "Crocheter", stat: "DEX", skill: "Escamotage" },
      { label: "Appeler à l'aide", stat: "CHA", skill: "Persuasion" }
    ]
  },
  {
    id: "naufrage", label: "Naufrage", timeLimit: 40, urgency: true, dc: 15,
    consequence: "Vous coulez : subissez 1D6 dégâts par paquet d'eau avalé.",
    actions: [
      { label: "Nager", stat: "FOR", skill: "Athlétisme" },
      { label: "S'accrocher", stat: "DEX", skill: "Acrobaties" },
      { label: "Garder son sang-froid", stat: "SAG", skill: "Perception" }
    ]
  }
];

// ============================================================
// Scènes (mode A - chapitres générés) et quêtes (mode B)
// ============================================================
const DND_LIEUX = [
  "la forêt de Chêne-Gris", "les ruines d'un temple", "un village en fête",
  "une caverne de cristal", "les quais d'un port", "un marais brumeux",
  "une taverne bondée", "un col de montagne", "un cimetière abandonné",
  "un donjon en ruine", "une foire aux marchands", "un gué sur une rivière"
];

const DND_OBSTACLES = [
  "un pont effondré", "un groupe de bandits", "un piège caché", "une bête affamée",
  "un garde hostile", "une porte verrouillée", "un client menaçant",
  "une créature des ombres", "une trappe au sol", "une embuscade surprise",
  "un glissement de terrain", "un péage forcé"
];

const DND_PNJ = [
  "un marchand nerveux", "une vieille sorcière", "un enfant perdu", "un soldat épuisé",
  "un nobliau hautain", "un pèlerin muet", "une guerrière tatouée", "un étudiant en magie",
  "un barde itinérant", "un prêtre itinérant"
];

const DND_QUESTS = [
  { titre: "Livraison en ville", objectif: "Livrer un paquet à travers le marché sans attirer l'attention.", recompense: "10 PO", dc: 12, type: "social" },
  { titre: "Chasse au rat", objectif: "Dératiser les caves du château.", recompense: "15 PO", dc: 13, type: "combat" },
  { titre: "La relique volée", objectif: "Retrouver une relique dans une nécropole.", recompense: "25 PO", dc: 15, type: "exploration" },
  { titre: "Sauvetage", objectif: "Délivrer un otage tenu par des brigands.", recompense: "30 PO", dc: 15, type: "combat" },
  { titre: "L'exorcisme", objectif: "Purifier un manoir hanté.", recompense: "35 PO", dc: 16, type: "exploration" },
  { titre: "L'ingrédient rare", objectif: "Rapporter une fleur de lune à l'alchimiste.", recompense: "20 PO", dc: 14, type: "exploration" },
  { titre: "Le client insolvable", objectif: "Récupérer une dette auprès d'un client difficile.", recompense: "15 PO", dc: 13, type: "social" }
];

// ============================================================
// Poisons et folie (base AideDD - SRD 5e)
// ============================================================
const DND_POISONS = [
  { name: "Poison de base", effet: "La victime doit réussir un jet de CON (12) ou subir 1D4 dégâts de poison.", prix: 100 },
  { name: "Sérum de vérité", effet: "La victime doit réussir un jet de SAG ou révéler la vérité.", prix: 150 },
  { name: "Poison de nuit", effet: "Dégâts nécrotiques et sommeil profond si échec du jet de CON.", prix: 150 },
  { name: "Venin de serpent", effet: "1D8 dégâts de poison, état Empoisonné si échec de CON.", prix: 200 }
];

const DND_MADNESS = [
  "Une peur irrationnelle vous saisit face aux miroirs.",
  "Vous murmurez seul dans votre sommeil, et les mots ne sont pas les vôtres.",
  "Vous êtes persuadé qu'un objet de votre équipement vous parle.",
  "Le chant d'un ruisseau vous semble un cri d'alerte.",
  "Vous comptez vos pas et refusez de faire un nombre impair.",
  "Vous riez sans raison, surtout quand tout va bien."
];
