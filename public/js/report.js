document.addEventListener('DOMContentLoaded', () => {
  // 1. Grafik Status Tiket (Doughnut Chart)
  const statusCanvas = document.getElementById('statusChart');
  if (statusCanvas) {
    try {
      const labels = JSON.parse(statusCanvas.getAttribute('data-labels') || '[]');
      const values = JSON.parse(statusCanvas.getAttribute('data-values') || '[]');

      // Warna badge status konsisten dengan Bootstrap:
      // Baru = Primary (Biru), Diproses = Warning (Kuning/Oranye), Selesai = Success (Hijau), Ditutup = Secondary (Abu-abu)
      const colorMap = {
        'Baru': '#0d6efd',
        'Diproses': '#ffc107',
        'Selesai': '#198754',
        'Ditutup': '#6c757d'
      };

      const backgroundColors = labels.map(label => colorMap[label] || '#0dcaf0');

      new Chart(statusCanvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    } catch (err) {
      console.error('Gagal merender grafik status:', err);
    }
  }

  // 2. Grafik Tiket per Kategori (Horizontal Bar Chart)
  const categoryCanvas = document.getElementById('categoryChart');
  if (categoryCanvas) {
    try {
      const labels = JSON.parse(categoryCanvas.getAttribute('data-labels') || '[]');
      const values = JSON.parse(categoryCanvas.getAttribute('data-values') || '[]');

      new Chart(categoryCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Jumlah Tiket',
            data: values,
            backgroundColor: '#0d6efd',
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    } catch (err) {
      console.error('Gagal merender grafik kategori:', err);
    }
  }

  // 3. Grafik Tren Tiket 12 Bulan Terakhir (Line Chart)
  const monthCanvas = document.getElementById('monthChart');
  if (monthCanvas) {
    try {
      const labels = JSON.parse(monthCanvas.getAttribute('data-labels') || '[]');
      const values = JSON.parse(monthCanvas.getAttribute('data-values') || '[]');

      new Chart(monthCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Tiket Dibuat',
            data: values,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    } catch (err) {
      console.error('Gagal merender grafik tren bulanan:', err);
    }
  }
});

