loadCustomUniverses();
loadCustomTables();
loadFavorites();
loadCardDecks();
renderUniverseGrid();
renderFavoritesSection();
renderEditorUniverseOptions();
renderDeckEditorUniverseOptions();
renderExistingUniverses();
renderExistingTables();
renderDeckEditorExisting();
renderTirageDecksList();
loadProgress();
loadOracleAnimationPref();
loadBattleMap();
renderBmConfig();
renderBmGrid();
renderBmPionList();

function updateAppStats() {
  const box = document.getElementById('app-stats');
  if (!box) return;
  const universeCount = Object.keys(universes).length;
  const deckCount = cardDecks.length;
  box.textContent = `${universeCount} univers · ${deckCount} deck${deckCount > 1 ? 's' : ''}`;
}
updateAppStats();

(function () {
  var splash = document.getElementById('splash-screen');
  if (!splash) return;
  setTimeout(function () {
    splash.classList.add('hide');
    setTimeout(function () { splash.style.display = 'none'; }, 650);
  }, 2200);
})();
