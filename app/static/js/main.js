import { TypingTest } from './testCore.js';
import { HistoryManager } from './historyManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        timer: document.getElementById('timer'),
        typingBox: document.getElementById('typing-area'),
        // Store the text content directly
        targetText: document.getElementById('reference-text').textContent.trim(),
        accuracyCounter: document.getElementById('accuracy'),
        speedCounter: document.getElementById('wpm'),
        modeButtons: document.querySelectorAll('input[name="mode"]'),
        retryButton: document.getElementById('restart-btn')
    };

    // Buggy shitty managers I've made, probably needs to be refactored
    const historyManager = new HistoryManager('run-history');
    const typingTest = new TypingTest(elements);
    historyManager.loadHistory();

    // Saves the test 
    const originalFinishTest = typingTest.finishTest.bind(typingTest);
    typingTest.finishTest = (message) => {
        const stats = originalFinishTest(message);
        if (stats) {
            historyManager.saveRun(stats, typingTest.settings.strictMode);
        }
    };

    // Start first test
    typingTest.resetTest();
});