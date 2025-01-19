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
            //Following two might be edited to change on end of word? Kind of redundant to dynamically update
            //on EACH button press, as hard to read?

            // Will implement that when I go to review the word error/analysis system, as might have something
            // to piggyback off of.
            this.checkTyping(e.target.value); 
            this.updateTestStats(); 
        });

        // No Cheating
        this.elements.typingBox.addEventListener('paste', e => e.preventDefault());
        this.elements.typingBox.addEventListener('drop', e => e.preventDefault());

        // Reset
        this.elements.retryButton.addEventListener('click', this.resetTest);
    }

    // Clears text and timer and other various stats
    resetTest() {
        this.state.timeRemaining = this.settings.duration;
        this.state.timerRunning = null;
        this.state.testStartTime = null;
        this.elements.timer.textContent = `Time Left: ${this.settings.duration}s`;
        this.elements.accuracyCounter.textContent = 'Accuracy: 100%';
        this.elements.speedCounter.textContent = 'WPM: 0';
        this.elements.typingBox.value = '';
        this.elements.typingBox.disabled = false;
        this.elements.typingBox.classList.remove('correct', 'error');
        this.elements.retryButton.style.display = 'none';

        //Sometimes deselected box if I didn't do this
        this.elements.typingBox.focus(); 
    }

    beginTimer() {
        if (!this.state.timerRunning) {
            this.state.testStartTime = Date.now(); 

            // Interval style counter, can be float but honestly prefer the whole second style countdown
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
        const wordCount = typedText.trim().split(/\s+/).length;
        const minutesElapsed = (Date.now() - this.state.testStartTime) / 60000;
        const currentSpeed = Math.round(wordCount / minutesElapsed);
        this.elements.speedCounter.textContent = `WPM: ${currentSpeed}`;

        // Calculate typing accuracy, letter by letter
        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.elements.targetText[i]) correctChars++;
        }

        // Dynamic Accuracy
        const accuracy = typedText.length > 0 
            ? Math.round((correctChars / typedText.length) * 100) 
            : 100;
        this.elements.accuracyCounter.textContent = `Accuracy: ${accuracy}%`;

        return { wpm: currentSpeed, accuracy };
    }

    finishTest(message) {
        //Finishing block.
        clearInterval(this.state.timerRunning);
        this.state.timerRunning = null;
        this.elements.typingBox.disabled = true;
        const stats = this.updateTestStats();
        this.elements.retryButton.style.display = 'block'; 
        return stats;
    }

    checkTyping(typedText) {
        // Validate typed text against the target text
        if (typedText === this.elements.targetText.substring(0, typedText.length)) {
            this.elements.typingBox.classList.remove('error');
            this.elements.typingBox.classList.add('correct');
        } else {
            this.elements.typingBox.classList.remove('correct');
            this.elements.typingBox.classList.add('error');
        }

        // Finish test if text matches target text (strict or lazy mode)
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
