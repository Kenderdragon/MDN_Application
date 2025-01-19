export class TypingTest {
    constructor(elements, options = {}) {
        this.elements = elements;

        this.settings = {
            duration: options.duration || 60,
            strictMode: false
        };

        // IDK if this state approach is the best, slow but convenient
        // Probably should avoid this for anything more complex than basic variables.
        this.state = {
            timeRemaining: this.settings.duration,
            timerRunning: null,
            testStartTime: null,
            mistakenWords: [] // store mistakes
        };

        // Not Very familiar with binding as a practice. If it works it works.
        this.resetTest = this.resetTest.bind(this);
        this.beginTimer = this.beginTimer.bind(this);
        this.checkTyping = this.checkTyping.bind(this);
        this.updateTestStats = this.updateTestStats.bind(this);
        this.finishTest = this.finishTest.bind(this);

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Handle mode toggle (strict/lazy)
        this.elements.modeButtons.forEach(button => {
            button.addEventListener('change', (e) => {
                // I like js. I like comparing strings. I hate C.
                this.settings.strictMode = e.target.value === 'perfect';
                this.checkTyping(this.elements.typingBox.value);
            });
        });

        // Typing input
        this.elements.typingBox.addEventListener('input', (e) => {
            if (!this.state.timerRunning) this.beginTimer();
            // Following might be edited to change on end of word? 
            // Kind of redundant to dynamically update on EACH button press,
            // as it's hard to read?

            // Will implement that when I go to review the word error/analysis system,
            // as might have something to piggyback off of.
            this.checkTyping(e.target.value);
            this.updateTestStats();
        });

        // No Cheating
        this.elements.typingBox.addEventListener('paste', e => e.preventDefault());
        this.elements.typingBox.addEventListener('drop', e => e.preventDefault());

        // Reset
        this.elements.retryButton.addEventListener('click', this.resetTest);
    }

    resetTest() {
        this.state.timeRemaining = this.settings.duration;
        this.state.timerRunning = null;
        this.state.testStartTime = null;
        this.state.mistakenWords = [];

        this.elements.timer.textContent = `Time Left: ${this.settings.duration}s`;
        this.elements.accuracyCounter.textContent = 'Accuracy: 100%';
        this.elements.speedCounter.textContent = 'WPM: 0';

        this.elements.typingBox.value = '';
        this.elements.typingBox.disabled = false;
        this.elements.typingBox.classList.remove('correct', 'error');
        this.elements.retryButton.style.display = 'none';

        // Sometimes deselected box if I didn't do this
        this.elements.typingBox.focus();
    }

    beginTimer() {
        if (!this.state.timerRunning) {
            this.state.testStartTime = Date.now();

            // Interval style counter, can be float but honestly prefer
            // the whole second style countdown
            this.state.timerRunning = setInterval(() => {
                this.state.timeRemaining--;
                this.elements.timer.textContent = `Time Left: ${this.state.timeRemaining}s`;
                if (this.state.timeRemaining <= 0) {
                    this.finishTest('Time up!');
                }
                this.updateTestStats(); // Update stats periodically
            }, 1000); // Update every second
        }
    }

    updateTestStats() {
        const typedText = this.elements.typingBox.value;

        // WPM
        const { wpm, accuracy } = this.computeStats(typedText);

        this.elements.speedCounter.textContent = `WPM: ${wpm}`;
        this.elements.accuracyCounter.textContent = `Accuracy: ${accuracy}%`;

        return { wpm, accuracy };
    }

    // Separate the calculation logic
    computeStats(typedText) {
        const wordCount = typedText.trim().split(/\s+/).length || 0;
        const minutesElapsed = (Date.now() - (this.state.testStartTime || Date.now())) / 60000;
        const currentSpeed = minutesElapsed > 0 ? Math.round(wordCount / minutesElapsed) : 0;

        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.elements.targetText[i]) {
                correctChars++;
            }
        }

        const accuracy = typedText.length > 0
            ? Math.round((correctChars / typedText.length) * 100)
            : 100;

        return { wpm: currentSpeed, accuracy };
    }

    // Probably shoul be modularised, handles everything, literally even the popup box.
    // Also could benefit from differnet state and element handling.
    finishTest(message) {
        clearInterval(this.state.timerRunning);
        this.state.timerRunning = null;
        this.elements.typingBox.disabled = true;
        const stats = this.updateTestStats();
    
        // Gather typed text and mistakes
        stats.typedText = this.elements.typingBox.value;
        stats.mistakenWords = this.state.mistakenWords;
        this.elements.retryButton.style.display = 'block';
    
        // 1. Update the modal's content
        const modal = document.getElementById('history-modal');
        const typedTextEl = document.getElementById('typed-text');
        const mistakenWordsEl = document.getElementById('mistaken-words');
        const modalWpm = document.getElementById('modal-wpm');
        const modalAccuracy = document.getElementById('modal-accuracy');
    
        typedTextEl.textContent = stats.typedText;
    
        mistakenWordsEl.innerHTML = '';
        stats.mistakenWords.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            mistakenWordsEl.appendChild(li);
        });
    
        modalWpm.textContent = `WPM: ${stats.wpm}`;
        modalAccuracy.textContent = `Accuracy: ${stats.accuracy}%`;
    
        // 2. Show the modal by adding the 'show' class
        modal.classList.add('show');
    
        // (We've removed any lines like `modal.style.display = 'flex';`)
    
        console.log(message || 'Test finished.');
        return stats;
    }
    
    checkTyping(typedText) {
        // Compare word by word
        const mistakenWords = [];
        const targetWords = this.elements.targetText.split(/\s+/);
        const typedWords = typedText.split(/\s+/);

        // I'd like to make the word checking dynamic in the future.
        // Im thinking flag the mistake and increment a counter for each additional non-delete keystroke
        // This solution also fails so many edge cases, but alas.
        for (let i = 0; i < typedWords.length; i++) {
            if (typedWords[i] !== targetWords[i]) {
                mistakenWords.push(typedWords[i]); // Add incorrect word
            }
        }

        this.state.mistakenWords = mistakenWords; // Store mistaken words

        // Validate typed text for styling
        if (typedText === this.elements.targetText.substring(0, typedText.length)) {
            this.elements.typingBox.classList.remove('error');
            this.elements.typingBox.classList.add('correct');
        } else {
            this.elements.typingBox.classList.remove('correct');
            this.elements.typingBox.classList.add('error');
        }

        // If typed text meets or exceeds target length...
        if (typedText.length >= this.elements.targetText.length) {
            const isLazyMode = !this.settings.strictMode;
            const isPerfectMatch = typedText === this.elements.targetText;

            if (isLazyMode || isPerfectMatch) {
                return this.finishTest('Test complete!');
            }
        }

        return null;
    }
}
