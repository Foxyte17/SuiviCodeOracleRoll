let progressValue = 1;

function loadProgress() {
  const raw = StorageService.loadProgress();
  if (raw) progressValue = Math.min(20, Math.max(1, parseInt(raw, 10) || 1));
  updateProgressDisplay();
}

function saveProgress() {
  StorageService.saveProgress(progressValue);
}

function resetProgress() {
  progressValue = 1;
  updateProgressDisplay();
  saveProgress();
}

function changeProgress(delta) {
  progressValue = Math.min(20, Math.max(1, progressValue + delta));
  updateProgressDisplay();
  saveProgress();
}

function updateProgressDisplay() {
  const pct = ((progressValue - 1) / 19) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = progressValue + ' / 20';
}
