from flask import Flask, render_template
import random

app = Flask(__name__)

text = "Liang Chen"

@app.route('/')
def index():
    return render_template('index.html', text=text)

if __name__ == '__main__':
    app.run(debug=True)