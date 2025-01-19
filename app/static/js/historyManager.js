export class HistoryManager {
    constructor(historyContainerId) {
        this.containerId = historyContainerId;
        this.container = document.getElementById(historyContainerId);
        // Ensure the container element exists
        if (!this.container) {
            throw new Error(`Element with ID '${historyContainerId}' not found.`);
        }

        // Initialize IndexedDB
        this.dbPromise = this.initDatabase();
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TypingApp', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('history')) {
                    db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async loadHistory() {
        const db = await this.dbPromise;
        const transaction = db.transaction('history', 'readonly');
        const store = transaction.objectStore('history');

        const request = store.getAll();

        request.onsuccess = () => {
            const history = request.result;
            // Generate and render the markup for the latest 10 entries
            const historyMarkup = history
                .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp, newest first
                .slice(0, 10) // Limit to the 10 most recent entries
                .map(this.createHistoryEntryMarkup) // Create HTML for each entry
                .join('');

            // Update the container with the generated markup
            this.container.innerHTML = historyMarkup;
        };

        request.onerror = () => {
            console.error('Failed to load history from IndexedDB.');
        };
    }

    async saveRun(stats, mode) {
        const db = await this.dbPromise;
        const transaction = db.transaction('history', 'readwrite');
        const store = transaction.objectStore('history');

        const run = this.createRunEntry(stats, mode);
        store.add(run);

        transaction.oncomplete = () => {
            // Reload the history to reflect the update
            this.loadHistory();
        };

        transaction.onerror = () => {
            console.error('Failed to save run to IndexedDB.');
        };
    }

    async clearHistory() {
        const db = await this.dbPromise;
        const transaction = db.transaction('history', 'readwrite');
        const store = transaction.objectStore('history');

        const request = store.clear();

        request.onsuccess = () => {
            // Reload the history to reflect the cleared state
            this.loadHistory();
        };

        request.onerror = () => {
            console.error('Failed to clear history from IndexedDB.');
        };
    }

    createRunEntry(stats, mode) {
        // Create a new run entry object with the current timestamp and mode
        return {
            ...stats,
            timestamp: Date.now(),
            mode: mode ? 'Perfect' : 'Lazy',
        };
    }

    createHistoryEntryMarkup(run) {
        // Generate the HTML markup for a single history entry
        return `
            <div class="run-entry">
                <span>${new Date(run.timestamp).toLocaleTimeString()}</span>
                <span>${run.wpm} WPM</span>
                <span>${run.accuracy}%</span>
                <span>${run.mode}</span>
            </div>
        `;
    }
}
