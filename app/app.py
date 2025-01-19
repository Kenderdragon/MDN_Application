from flask import Flask, render_template, request, redirect, url_for
import random
import json

app = Flask(__name__)

SAMPLE_TEXTS = [
    "The quick brown fox jumps over the lazy dog"
]

@app.route('/')
def index():
    text = random.choice(SAMPLE_TEXTS)
    return render_template('index.html', text=text)

@app.route('/results', methods=['POST'])
def results():
    user_text = request.form.get('user_text', '')
    time_taken = float(request.form.get('time_taken', 0))
    reference_text = request.form.get('reference_text', '')  
    typing_mode = request.form.get('typing_mode', 'lazy')   
    
    # Calculate WPM
    words = len(user_text.split())
    minutes = time_taken / 60
    wpm = round(words / minutes) if minutes > 0 else 0
    
    # Calculate accuracy
    if reference_text:
        correct_chars = sum(1 for a, b in zip(user_text, reference_text) if a == b)
        total_chars = len(reference_text)
        accuracy = round((correct_chars / total_chars) * 100, 2)
    else:
        accuracy = 0

    # Additional stats
    stats = {
        'wpm': wpm,
        'accuracy': accuracy,
        'time_taken': round(time_taken, 2),
        'mode': typing_mode,
        'total_characters': len(user_text),
        'correct_characters': correct_chars if reference_text else 0,
    }
    
    return render_template('results.html', **stats)

if __name__ == '__main__':
    app.run(debug=True)