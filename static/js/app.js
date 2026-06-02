let scadaChart;
const maxDataPoints = 10; // Batasan jumlah data yang muncul di grafik biar gak kepenuhan

// Fungsi inisialisasi Grafik Chart.js
function initChart() {
    const ctx = document.getElementById('scadaChart').getContext('2d');
    scadaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Tempat timestamp waktu
            datasets: [
                {
                    label: 'Suhu (°C)',
                    data: [],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Tekanan (Bar)',
                    data: [],
                    borderColor: '#0dcaf0',
                    backgroundColor: 'rgba(13, 202, 240, 0.1)',
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                // ---> 1. MENGUBAH WARNA TEKS LEGENDA (KOTAK KETERANGAN DI ATAS) <---
                legend: {
                    labels: {
                        color: '#ffffff', // Mengubah teks "Suhu (°C)" & "Tekanan (Bar)" jadi putih
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            scales: {
                // ---> 2. MENGUBAH WARNA TEKS SUMBU X (WAKTU / TIMESTAMP) <---
                x: {
                    ticks: { color: '#ffffff' }, // Angka jam di bawah jadi putih terang
                    grid: { color: 'rgba(255, 255, 255, 0.1)' } // Garis grid vertikal samar-samar
                },
                // ---> 3. MENGUBAH WARNA TEKS SUMBU Y KIRI (SUHU) <---
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { color: '#ffc107' }, // Angka skala suhu jadi warna kuning
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }, // Garis grid horizontal samar-samar
                    title: { 
                        display: true, 
                        text: 'Suhu (°C)', 
                        color: '#ffc107', // Judul sumbu kiri jadi kuning mencolok
                        font: { size: 12, weight: 'bold' }
                    }
                },
                // ---> 4. MENGUBAH WARNA TEKS SUMBU Y KANAN (TEKANAN) <---
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: { color: '#0dcaf0' }, // Angka skala tekanan jadi warna biru muda
                    grid: { drawOnChartArea: false }, // Biar tidak tumpukan garis gridnya
                    title: { 
                        display: true, 
                        text: 'Tekanan (Bar)', 
                        color: '#0dcaf0', // Judul sumbu kanan jadi biru muda mencolok
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });
}

function fetchSensorData() {
    fetch('/api/sensor')
        .then(response => response.json())
        .then(data => {
            // 1. Update teks angka
            document.getElementById('val-temperature').innerText = data.temperature;
            document.getElementById('val-pressure').innerText = data.pressure;
            document.getElementById('val-level').innerText = data.level;
            document.getElementById('val-timestamp').innerText = data.timestamp;

            // 2. Logika Alarm
            const statusBadge = document.getElementById('system-status');
            const cardTemp = document.getElementById('card-temp');
            const alarmAudio = document.getElementById('alarm-sound');
            if (data.status === "ALARM") {
                statusBadge.innerText = "⚠️ SYSTEM ALARM";
                statusBadge.className = "badge bg-danger text-white animate-pulse";
                if (data.temperature > 80.0) {
                    cardTemp.className = "card bg-danger text-light border-0 shadow";
                }

                alarmAudio.play().catch(error => console.log("Menunggu interaksi user untuk memutar audio..."));

            } else {
                statusBadge.innerText = "SYSTEM OK";
                statusBadge.className = "badge bg-success text-white";
                cardTemp.className = "card bg-secondary text-light border-0 shadow";

                alarmAudio.pause();
                alarmAudio.currentTime = 0;
            }

            // 3. UPDATE DATA GRAFIK (Push Data Baru)
            if (scadaChart) {
                // Ambil jamnya saja untuk label (HH:MM:SS)
                const timeLabel = data.timestamp.split(' ')[1]; 
                
                scadaChart.data.labels.push(timeLabel);
                scadaChart.data.datasets[0].data.push(data.temperature);
                scadaChart.data.datasets[1].data.push(data.pressure);

                // Jika data melebihi batas maksimun, hapus data paling lawas (shift)
                if (scadaChart.data.labels.length > maxDataPoints) {
                    scadaChart.data.labels.shift();
                    scadaChart.data.datasets[0].data.shift();
                    scadaChart.data.datasets[1].data.shift();
                }

                // Render ulang grafik dengan data baru
                scadaChart.update();
            }
        })
        .catch(error => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    initChart(); // Jalankan grafiknya dulu
    fetchSensorData();
    setInterval(fetchSensorData, 2000); // Ambil data tiap 2 detik
});