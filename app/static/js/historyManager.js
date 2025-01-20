export class HistoryManager {
    constructor(historyContainerId) {
        this.containerId = historyContainerId;
        this.container = document.getElementById(historyContainerId);
        if (!this.container) {
            throw new Error(`Element with ID '${historyContainerId}' not found.`);
        }

        this.dbPromise = this.initDatabase();
    }

    // Index Database
    // Needs to be handled better, but I'm not a database engineer, and I don't have time.

    initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TypingApp', 2);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('history')) {
                    db.createObjectStore('history', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('Error initializing IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Data Wrangling

    async getAllHistory() {
        // Good for future export feature
        const db = await this.dbPromise;
        const transaction = db.transaction('history', 'readonly');
        const store = transaction.objectStore('history');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async loadHistory() {
        try {
            //Async now
            const history = await this.getAllHistory();
            this.renderHistory(history);
        } catch (error) {
            console.error("Failed to load history:", error);
        }
    }

    async saveRun(stats, mode) {
        try {
            //Avoids using raw HTML Markup
            const db = await this.dbPromise;
            const transaction = db.transaction('history', 'readwrite');
            const store = transaction.objectStore('history');
            
            // Refactored to use Promises
            const run = this.createRunEntry(stats, mode);
            await new Promise((resolve, reject) => {
                const request = store.add(run);
                request.onsuccess = resolve;
                request.onerror = () => reject(request.error);
            });
            
            await this.loadHistory();
        } catch (error) {
            console.error("Failed to save run:", error);
        }
    }

    async clearHistory() {
        try {
            // ARGHHHHH
            // This is so stupid I should really learn some kind of front end framework
            const db = await this.dbPromise;
            const transaction = db.transaction('history', 'readwrite');
            const store = transaction.objectStore('history');
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = resolve;
                request.onerror = () => reject(request.error);
            });
            
            // Reload the history to reflect the cleared state
            await this.loadHistory();
        } catch (error) {
            console.error("Failed to clear history:", error);
        }
    }

    // Markup Helpers, probably need to be able to handle this data differently
    // Don't think it's good practice to be handling these elements here directly.

    renderHistory(history) {
        const historyMarkup = history
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .map(this.createHistoryEntryMarkup)
            .join('');
        this.container.innerHTML = historyMarkup;
    }

    createRunEntry(stats, mode) {
        return {
            // Should be expanded on further
            ...stats,
            mode: mode ? 'Perfect' : 'Lazy',
            timestamp: Date.now(),
            typedText: stats.typedText || '',
            mistakenWords: Array.isArray(stats.mistakenWords) ? stats.mistakenWords : [],
        };
    }

    createHistoryEntryMarkup(run) {
        // Escape special chars, got some bugs with this
        const runString = JSON.stringify(run)
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;');

        return `
            <div class="run-entry" data-run='${runString}'>
                <span>${new Date(run.timestamp).toLocaleTimeString()}</span>
                <span>${run.wpm} WPM</span>
                <span>${run.accuracy}%</span>
                <span>${run.mode}</span>
            </div>
        `;
    }

    //Event Handling 

    initializeEventListeners() {
        this.container.addEventListener('click', (event) => {
            const entry = event.target.closest('.run-entry');
            if (entry) {
                // unescape single/double quotes, then parse
                const runData = JSON.parse(
                    entry.dataset.run
                        .replace(/&#39;/g, "'")
                        .replace(/&quot;/g, '"')
                );
                this.showRunDetails(runData);
            }
        });
    }

    showRunDetails(run) {
        const modal = document.getElementById('history-modal');
        if (!modal) return;
      
        // Fill in your run data...
        document.getElementById('typed-text').textContent = run.typedText;
        document.getElementById('modal-wpm').textContent = `WPM: ${run.wpm}`;
        document.getElementById('modal-accuracy').textContent = `Accuracy: ${run.accuracy}%`;
      
        const mistakeList = document.getElementById('mistaken-words');
        if (mistakeList) {
          mistakeList.innerHTML = run.mistakenWords
            .map(word => `<li>${word}</li>`)
            .join('');
        }
      
        // Show the modal
        modal.classList.add('show');
      
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
          }, { once: true }); 
          // "once: true" means this listener auto-removes after first click
        }
      
    }
}
