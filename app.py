import json
import os
import time
from pathlib import Path

import serial
from flask import Flask, jsonify, render_template
from serial.tools import list_ports

app = Flask(__name__)

BAUDRATE = 9600
TIMEOUT = 2
STATUS_FILE = Path("status.json")

DEFAULT_STATUS = {
    "connected": False,
    "hand": "unknown",
    "object": "unknown",
    "sensor": "unknown",
    "message": "Arduino не подключена"
}


def save_status(data):
    STATUS_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )


def load_status():
    if STATUS_FILE.exists():
        try:
            return json.loads(STATUS_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return DEFAULT_STATUS.copy()


def find_port():
    env_port = os.getenv("ARDUINO_PORT")
    if env_port:
        return env_port

    ports = list(list_ports.comports())
    for port in ports:
        text = f"{port.device} {port.description} {port.manufacturer or ''}".lower()
        if any(name in text for name in ["arduino", "ch340", "usb serial", "usb-serial"]):
            return port.device

    return ports[0].device if ports else None


def ask_arduino(command):
    port = find_port()
    if not port:
        data = DEFAULT_STATUS.copy()
        save_status(data)
        return data

    try:
        with serial.Serial(port, BAUDRATE, timeout=TIMEOUT) as ser:
            time.sleep(2)
            ser.reset_input_buffer()
            ser.write((command + "\n").encode("utf-8"))
            line = ser.readline().decode("utf-8", errors="ignore").strip()
    except serial.SerialException as error:
        data = DEFAULT_STATUS.copy()
        data["message"] = str(error)
        save_status(data)
        return data

    if not line:
        data = DEFAULT_STATUS.copy()
        data["message"] = "Нет ответа от Arduino"
        save_status(data)
        return data

    try:
        data = json.loads(line)
    except json.JSONDecodeError:
        data = DEFAULT_STATUS.copy()
        data["message"] = line

    data["connected"] = True
    data["port"] = port
    save_status(data)
    return data


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/status")
def status():
    return jsonify(ask_arduino("STATUS"))


@app.route("/api/open", methods=["POST"])
def open_hand():
    return jsonify(ask_arduino("OPEN"))


@app.route("/api/close", methods=["POST"])
def close_hand():
    return jsonify(ask_arduino("CLOSE"))


@app.route("/api/last")
def last_status():
    return jsonify(load_status())


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
