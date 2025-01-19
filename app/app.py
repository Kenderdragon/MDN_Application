from flask import Flask, render_template, request, redirect, url_for
import random

app = Flask(__name__)

SAMPLE_TEXTS = [
    "Im Going to Skin Liang"
]

@app.route('/')
def index():
    text = random.choice(SAMPLE_TEXTS)
    return render_template('index.html', text=text)

@app.route('/results', methods=['POST'])
def results():
    user_text = request.form.get('user_text', '')
    time_taken = float(request.form.get('time_taken', 0))
    
    words = len(user_text.split())
    print(time_taken)
    minutes = time_taken / 60
    print(minutes)
    wpm = round(words / minutes) if minutes > 0 else 0
    
    # Need to find a way to calculate this dynamically, also requires changing the submit conditions.
    accuracy = 0 
    
    return render_template('results.html', wpm=wpm, accuracy=accuracy)

if __name__ == '__main__':
    app.run(debug=True)