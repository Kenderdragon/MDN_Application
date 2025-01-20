import { TypingTest } from './testCore.js';
import { HistoryManager } from './historyManager.js';

// Ensure essential DOM elements exist, mostly added for bug fixing reasons
function getRequiredElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element with ID "${id}" not found`);
  }
  return el;
}

document.addEventListener('DOMContentLoaded', () => {
    // Thank you tim dwyer for your Asteroids.ts code I have excecelnty  refactored.
    const closeBtn = document.querySelector('.close-btn');
    const historyModal = document.getElementById('history-modal');

  const elements = {
    timer: getRequiredElement('timer'),
    typingBox: getRequiredElement('typing-area'),
    targetText: getRequiredElement('reference-text').textContent.trim(),
    accuracyCounter: getRequiredElement('accuracy'),
    speedCounter: getRequiredElement('wpm'),
    modeButtons: document.querySelectorAll('input[name="mode"]'),
    retryButton: getRequiredElement('restart-btn')
  };

  // Worst implementation ever
  const historyManager = new HistoryManager('run-history');
  const typingTest = new TypingTest(elements);

  // Load existing test history and set up event listeners
  historyManager.loadHistory();
  historyManager.initializeEventListeners();

  if (!closeBtn || !historyModal) {
    console.error('Could not find close button or modal in the DOM.');
    return;
  }

  // Override finishTest to save run data
  const originalFinishTest = typingTest.finishTest.bind(typingTest);

  // Weird method I have to use for now or else it all breaks.
  closeBtn.addEventListener('click', () => {
    historyModal.classList.remove('show');
  });

  const clearButton = document.getElementById('clear-btn');
  clearButton.addEventListener('click', async () => {
    // This doesn't really need to be a thing. Oh well.
      try {
          if (confirm('Are you sure you want to clear all history?')) {
              const historyManager = new HistoryManager('run-history');
              await historyManager.clearHistory();
              alert('History has been cleared.');
          }
      } catch (error) {
          console.error('Error clearing history:', error);
      }
  });

  typingTest.finishTest = (message) => {
    const stats = originalFinishTest(message);
    if (stats) {
      historyManager.saveRun(stats, typingTest.settings.strictMode);
    }
  };

  typingTest.resetTest();
});
