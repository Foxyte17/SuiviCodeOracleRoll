// ---------- COUCHE STOCKAGE (StorageService) ----------
// Abstraction synchrone sur localStorage.
// Toutes les clés applicatives sont centralisées ici.
// Aucun autre module ne doit appeler localStorage directement.

const StorageService = (function () {

  // ---- Clés de stockage ----
  const KEYS = {
    UNIVERSES:  'oracleroll-custom-universes-v1',
    TABLES:     'oracleroll-custom-tables-v1',
    DECKS:      'oracleroll-custom-decks-v1',
    FAVORITES:  'oracleroll-favorites-v1',
    PROGRESS:   'oracleroll-progress-v1',
    BATTLEMAP:  'oracleroll-battlemap-v1',
    ANIM:       'oracleroll-anim-enabled-v1'
  };

  // ---- Primitive générique : lecture ----
  function _load(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[StorageService] Lecture impossible pour "' + key + '"', e);
      return null;
    }
  }

  // ---- Primitive générique : écriture ----
  function _save(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('[StorageService] Écriture impossible pour "' + key + '"', e);
      return false;
    }
  }

  // ---- Helpers JSON ----
  function _loadJSON(key) {
    const raw = _load(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[StorageService] JSON invalide pour "' + key + '"', e);
      return null;
    }
  }

  function _saveJSON(key, data) {
    return _save(key, JSON.stringify(data));
  }

  // ---- API publique ----
  return {
    KEYS: KEYS,

    // Univers personnalisés
    loadUniverses:   function () { return _loadJSON(KEYS.UNIVERSES); },
    saveUniverses:   function (data) { return _saveJSON(KEYS.UNIVERSES, data); },

    // Tables personnalisées
    loadTables:      function () { return _loadJSON(KEYS.TABLES); },
    saveTables:      function (data) { return _saveJSON(KEYS.TABLES, data); },

    // Decks de cartes personnalisés
    loadDecks:       function () { return _loadJSON(KEYS.DECKS); },
    saveDecks:       function (data) { return _saveJSON(KEYS.DECKS, data); },

    // Favoris Oracle
    loadFavorites:   function () { return _loadJSON(KEYS.FAVORITES); },
    saveFavorites:   function (data) { return _saveJSON(KEYS.FAVORITES, data); },

    // Progression (valeur 1-20)
    loadProgress:    function () { return _load(KEYS.PROGRESS); },
    saveProgress:    function (value) { return _save(KEYS.PROGRESS, String(value)); },

    // Battle Map
    loadBattleMap:   function () { return _loadJSON(KEYS.BATTLEMAP); },
    saveBattleMap:   function (data) { return _saveJSON(KEYS.BATTLEMAP, data); },

    // Préférence animation Oracle
    loadAnimPref:    function () { return _load(KEYS.ANIM); },
    saveAnimPref:    function (value) { return _save(KEYS.ANIM, String(value)); }
  };

})();
