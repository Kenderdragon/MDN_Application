document.addEventListener('DOMContentLoaded', () => {
    const timer = document.getElementById('timer');
    const typingArea = document.getElementById('typing-area');
    const submitBtn = document.getElementById('submit-btn');
    const userTextInput = document.getElementById('user-text');
    const timeTakenInput = document.getElementById('time-taken');
    const referenceText = document.getElementById('reference-text').textContent;
    
    // Should be changed to be made variable, hardcoded for now.
    let timeLeft = 60;
    let timerInterval = null;
    let startTime = null;

    // Clunky
    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            timeLeft--;
            timer.textContent = `Time Left: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                endTest();
            }
        }, 1000);
    }

    // Handles Clearing Text
    function endTest() {
        clearInterval(timerInterval);
        typingArea.disabled = true;
        submitBtn.disabled = false;
        
        userTextInput.value = typingArea.value;
        timeTakenInput.value = Math.round((Date.now() - startTime) / 1000);
    }

    // Typing Listener to Start Timer
    typingArea.addEventListener('input', (e) => {
        if (!timerInterval) {
            startTimer();
        }

        const typed = e.target.value;

        //Handling wrong text input, goes red when wrong text
        //Finishing Condition should be editable, perhaps strict vs. lazy mode?
        if (typed === referenceText.substring(0, typed.length)) {
            typingArea.classList.remove('error');
            typingArea.classList.add('correct');
        } else {
            typingArea.classList.remove('correct');
            typingArea.classList.add('error');
        }

        if (typed === referenceText) {
            endTest();
        }
    });
});