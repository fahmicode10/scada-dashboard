from flask import Flask, jsonify, render_template
import random
import time
import csv
import os

app = Flask(__name__)

CSV_FILE = "data_log.csv"

# Fungsi pembantu untuk mencatat data ke file CSV
def log_to_csv(data):
    file_exist = os.path.isfile(CSV_FILE)

    # Membuka file CSV dalam mode 'append' (menambah baris di bawahnya)
    with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
              writer = csv.DictWriter(f, fieldnames=["timestamp", "temperature", "pressure", "level", "status"])

              # Jika file baru dibuat, tulis header kolomnya dulu
              if not file_exist:
                   writer.writeheader()

                   #tulis data sensor
                   writer.writerow(data)

                   f.flush()

# Route utama untuk menampilkan halaman dashboard HTML nanti
@app.route('/')
def index():
    return render_template('index.html')

# Route API untuk menyuplai data sensor (Format JSON)
@app.route('/api/sensor')
def get_sensor_data():
    sensor_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),    
        "temperature": round(random.uniform(60.0, 85.0), 2),    # Simulasi Suhu (°C)
        "pressure": round(random.uniform(2.0, 5.0), 2),         # Simulasi Tekanan (Bar)
        "level": round(random.uniform(40.0, 90.0), 1),          # Simulasi Level Tanki (%)
        "status": "NORMAL"
    }

# Sistem alarm sederhana (Threshold)
    if sensor_data["temperature"] > 80.0 or sensor_data["pressure"] > 4.5:
        sensor_data["status"] = "ALARM"

    log_to_csv(sensor_data)

    return jsonify(sensor_data)

if __name__ == '__main__':
    # Run server Flask di mode debug biar otomatis auto-restart kalau ada perubahan script
    app.run(debug=True, port=5000)