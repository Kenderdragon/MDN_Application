document.addEventListener('DOMContentLoaded', () => {
    // Get all our UI elements
    const elements = {
        timer: document.getElementById('timer'),
        typingBox: document.getElementById('typing-area'),
        targetText: document.getElementById('reference-text').textContent,
        accuracyCounter: document.getElementById('accuracy'),
        speedCounter: document.getElementById('wpm'),
        modeButtons: document.querySelectorAll('input[name="mode"]'),
        retryButton: document.getElementById('restart-btn')
    };

    // Test settings and state
    const testSettings = {
        duration: 60,
        strictMode: false  // false = lazy mode, true = perfect mode
    };

    let testState = {
        timeRemaining: testSettings.duration,
        timerRunning: null,
        testStartTime: null
    };

    // Core test functions
    function resetTest() {
        // Reset our timer state
        testState.timeRemaining = testSettings.duration;
        testState.timerRunning = null;
        testState.testStartTime = null;
        
        // Reset what the user sees
        elements.timer.textContent = `Time Left: ${testSettings.duration}s`;
        elements.accuracyCounter.textContent = 'Accuracy: 100%';
        elements.speedCounter.textContent = 'WPM: 0';
        
        // Clear and enable typing box
        elements.typingBox.value = '';
        elements.typingBox.disabled = false;
        elements.typingBox.classList.remove('correct', 'error');
        
        // Hide retry button and focus typing box
        elements.retryButton.style.display = 'none';
        elements.typingBox.focus();
    }

    function beginTimer() {
        if (!testState.timerRunning) {
            testState.testStartTime = Date.now();
            testState.timerRunning = setInterval(() => {
                testState.timeRemaining--;
                elements.timer.textContent = `Time Left: ${testState.timeRemaining}s`;
                
                if (testState.timeRemaining <= 0) {
                    finishTest('Time up!');
                }
                updateTestStats();
            }, 1000);
        }
    }

    function updateTestStats() {
        const typedText = elements.typingBox.value;
        
        // Speed calculation
        const wordCount = typedText.trim().split(/\s+/).length;
        const minutesElapsed = (Date.now() - testState.testStartTime) / 60000;
        const currentSpeed = Math.round(wordCount / minutesElapsed);
        elements.speedCounter.textContent = `WPM: ${currentSpeed}`;

        // Accuracy calculation
        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === elements.targetText[i]) correctChars++;
        }
        
        const accuracy = typedText.length > 0 
            ? Math.round((correctChars / typedText.length) * 100) 
            : 100;
            
        elements.accuracyCounter.textContent = `Accuracy: ${accuracy}%`;
    }

    function finishTest(message) {
        clearInterval(testState.timerRunning);
        elements.typingBox.disabled = true;
        updateTestStats();
        elements.retryButton.style.display = 'block';
    }

    function checkTyping(typedText) {
        // Visual feedback
        if (typedText === elements.targetText.substring(0, typedText.length)) {
            elements.typingBox.classList.remove('error');
            elements.typingBox.classList.add('correct');
        } else {
            elements.typingBox.classList.remove('correct');
            elements.typingBox.classList.add('error');
        }

        // Check if test is complete
        if (typedText.length >= elements.targetText.length) {
            const isLazyMode = !testSettings.strictMode;
            const isPerfectMatch = typedText === elements.targetText;
            
            if (isLazyMode || isPerfectMatch) {
                finishTest('Test complete!');
            }
        }
    }

    // Event listeners
    elements.modeButtons.forEach(button => {
        button.addEventListener('change', (e) => {
            testSettings.strictMode = e.target.value === 'perfect';
            checkTyping(elements.typingBox.value);
        });
    });

    elements.typingBox.addEventListener('input', (e) => {
        if (!testState.timerRunning) beginTimer();
        checkTyping(e.target.value);
        updateTestStats();
    });

    // Prevent cheating
    elements.typingBox.addEventListener('paste', e => e.preventDefault());
    elements.typingBox.addEventListener('drop', e => e.preventDefault());

    // Retry handler
    elements.retryButton.addEventListener('click', resetTest);

    // Start first test
    resetTest();
});