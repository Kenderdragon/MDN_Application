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
  const elements = {
    timer: getRequiredElement('timer'),
    typingBox: getRequiredElement('typing-area'),
    targetText: getRequiredElement('reference-text').textContent.trim(),
    accuracyCounter: getRequiredElement('accuracy'),
    speedCounter: getRequiredElement('wpm'),
    modeButtons: document.querySelectorAll('input[name="mode"]'),
    retryButton: getRequiredElement('restart-btn')
  };

  // Worst implementation of all time. If you see this dont hire me.
  const historyManager = new HistoryManager('run-history');
  const typingTest = new TypingTest(elements);

  // Load existing test history and set up event listeners
  historyManager.loadHistory();
  historyManager.initializeEventListeners();

  // Override finishTest to save run data
  const originalFinishTest = typingTest.finishTest.bind(typingTest);
  typingTest.finishTest = (message) => {
    const stats = originalFinishTest(message);
    if (stats) {
      historyManager.saveRun(stats, typingTest.settings.strictMode);
    }
  };

  typingTest.resetTest();
});
