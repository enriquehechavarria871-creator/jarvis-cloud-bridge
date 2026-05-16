from flask import Flask, request, jsonify
import uuid
import time
import os

app = Flask(__name__)

SECRET = os.getenv("JARVIS_SECRET", "cambia_esto_123")

commands = []
results = {}

def authorized(req):
    return req.headers.get("X-JARVIS-KEY") == SECRET

@app.route("/")
def home():
    return "Jarvis Cloud Bridge Online"

@app.route("/phone/send", methods=["POST"])
def phone_send():
    if not authorized(request):
        return jsonify({"ok": False, "error": "No autorizado"}), 401

    data = request.get_json()
    text = data.get("command", "").strip()

    if not text:
        return jsonify({"ok": False, "error": "Comando vacío"})

    command_id = str(uuid.uuid4())

    commands.append({
        "id": command_id,
        "command": text,
        "created_at": time.time()
    })

    return jsonify({
        "ok": True,
        "command_id": command_id
    })

@app.route("/phone/result/<command_id>", methods=["GET"])
def phone_result(command_id):
    if not authorized(request):
        return jsonify({"ok": False, "error": "No autorizado"}), 401

    if command_id not in results:
        return jsonify({
            "ok": True,
            "ready": False
        })

    return jsonify({
        "ok": True,
        "ready": True,
        "response": results[command_id]
    })

@app.route("/pc/next", methods=["GET"])
def pc_next():
    if not authorized(request):
        return jsonify({"ok": False, "error": "No autorizado"}), 401

    if not commands:
        return jsonify({
            "ok": True,
            "has_command": False
        })

    command = commands.pop(0)

    return jsonify({
        "ok": True,
        "has_command": True,
        "id": command["id"],
        "command": command["command"]
    })

@app.route("/pc/result", methods=["POST"])
def pc_result():
    if not authorized(request):
        return jsonify({"ok": False, "error": "No autorizado"}), 401

    data = request.get_json()
    command_id = data.get("id")
    response = data.get("response", "")

    results[command_id] = response

    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)