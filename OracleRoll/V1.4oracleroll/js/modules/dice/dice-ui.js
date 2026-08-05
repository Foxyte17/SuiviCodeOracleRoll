let selectedDie = null;
let diceMode = 'addition';

function setDiceMode(mode) {
  diceMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
}

document.querySelectorAll('.die-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.die-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDie = btn.dataset.sides === 'custom' ? 'custom' : parseInt(btn.dataset.sides, 10);
    document.getElementById('custom-sides-row').style.display = selectedDie === 'custom' ? 'flex' : 'none';
    document.getElementById('dice-label').textContent = selectedDie === 'custom' ? 'D perso' : 'D' + selectedDie;
    document.getElementById('dice-controls').style.display = 'block';
    document.getElementById('dice-result').innerHTML = '';
  });
});
