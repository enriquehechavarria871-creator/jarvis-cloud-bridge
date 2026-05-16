from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")

@app.route("/styles.css")
def styles():
    return send_from_directory(BASE_DIR, "styles.css")

@app.route("/command", methods=["POST"])
def command():

    data = request.json

    text = data.get("command", "")

    response = f"Jarvis recibió: {text}"

    return jsonify({
        "ok": True,
        "response": response
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
