// Data storage menggunakan LocalStorage
let nasabahData = JSON.parse(localStorage.getItem('nasabahData')) || [];
let currentStep = 1;
let currentNasabahId = null;


// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadDashboard();
    setDefaultDates();
    setupEventListeners();
});

function renderRecentTable(filteredData = nasabahData.slice(0,5)) {
    const tbody = document.getElementById('recentTable');
    if (!tbody) return;
    
    tbody.innerHTML = filteredData.map(n => `
        <tr>
            <td><strong>${n.nama}</strong></td>
            <td>${n.email}</td>
            <td><span class="status ${n.status}">${n.status.toUpperCase()}</span></td>
            <td>${new Date(n.tanggal).toLocaleDateString('id-ID')}</td>
            <td>
                <button onclick="editNasabah(${n.id})" class="btn-mini btn-primary"><i class="fas fa-edit"></i></button>
                <button onclick="deleteNasabah(${n.id})" class="btn-mini btn-danger"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}


function renderAllTable() {
    const tbody = document.getElementById('allNasabahTable');
    tbody.innerHTML = nasabahData.map(n => `
        <tr>
            <td>#${n.id}</td>
            <td><strong>${n.nama}</strong></td>
            <td>${n.email}</td>
            <td>${n.telepon}</td>
            <td><span class="status ${n.status}">${n.status.toUpperCase()}</span></td>
            <td>${new Date(n.tanggal).toLocaleDateString('id-ID')}</td>
            <td>
                <button onclick="editNasabah(${n.id})" class="btn-mini btn-primary">Edit</button>
                <button onclick="deleteNasabah(${n.id})" class="btn-mini btn-danger">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function initApp() {
    // Auto-generate nomor registrasi
    if (nasabahData.length === 0) {
        document.getElementById('nomor_registrasi').value = 'REG-001';
    }
    
    // Update stats
    updateStats();
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal_registrasi').value = today;
    document.getElementById('tanggal_pembukaan').value = today;
}

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    
    mobileMenu.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Form submission
    document.getElementById('form-rekening').addEventListener('submit', handleRegistration);
    
    // Auto-generate nomor registrasi
    document.getElementById('nomor_registrasi').addEventListener('focus', autoGenerateNomorRegistrasi);
}

function autoGenerateNomorRegistrasi() {
    const input = document.getElementById('nomor_registrasi');
    if (!input.value || input.value === 'REG-001') {
        const lastId = nasabahData.length > 0 ? 
            parseInt(nasabahData[nasabahData.length - 1].id_nasabah.slice(4)) : 0;
        input.value = `REG-${String(lastId + 1).padStart(3, '0')}`;
    }
}

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked link
    event.target.classList.add('active');
    
    // Close mobile menu
    document.getElementById('mobile-menu').classList.remove('active');
    document.getElementById('nav-menu').classList.remove('active');
    
    if (sectionId === 'dashboard') {
        loadDashboard();
    }
}

// Form Steps Navigation
function nextStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    currentStep = step;
}

function prevStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    currentStep = step;
}

// Ahli Waris Management
function addAhliWaris() {
    const container = document.getElementById('ahli-waris-container');
    const newItem = document.createElement('div');
    newItem.className = 'ahli-waris-item';
    newItem.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label>Nama Ahli Waris</label>
                <input type="text" class="ahli-waris-nama">
            </div>
            <div class="form-group">
                <label>NIK Ahli Waris</label>
                <input type="text" class="ahli-waris-ktp" maxlength="16">
            </div>
            <div class="form-group">
                <label>Alamat Ahli Waris</label>
                <textarea class="ahli-waris-alamat"></textarea>
            </div>
            <div class="form-group">
                <label>Telepon Ahli Waris</label>
                <input type="tel" class="ahli-waris-telepon">
            </div>
        </div>
        <button type="button" class="btn btn-remove" onclick="removeAhliWaris(this)">Hapus</button>
    `;
    container.appendChild(newItem);
}

function removeAhliWaris(button) {
    button.parentElement.remove();
}

// Dashboard Functions
function loadDashboard() {
    renderNasabahTable();
    updateStats();
}

function updateStats() {
    const totalNasabah = nasabahData.length;
    let totalRekening = 0;
    let totalPasangan = 0;
    let totalAhliWaris = 0;

    nasabahData.forEach(nasabah => {
        if (nasabah.rekening) totalRekening++;
        if (nasabah.pasangan && Object.keys(nasabah.pasangan).length > 0) totalPasangan++;
        if (nasabah.ahli_waris && nasabah.ahli_waris.length > 0) {
            totalAhliWaris += nasabah.ahli_waris.length;
        }
    });

    document.getElementById('total-nasabah').textContent = totalNasabah;
    document.getElementById('total-rekening').textContent = totalRekening;
    document.getElementById('total-pasangan').textContent = totalPasangan;
    document.getElementById('total-ahli-waris').textContent = totalAhliWaris;
}



function renderNasabahTable() {
    const tbody = document.getElementById('nasabah-tbody');
    tbody.innerHTML = '';

    nasabahData.forEach(nasabah => {
        const row = tbody.insertRow();

        row.innerHTML = `
            <td>${nasabah.id_nasabah || '-'}</td>
            <td>${nasabah.nama_lengkap || nasabah.nama || 'TIDAK ADA NAMA'}</td>
            <td>${nasabah.nomor_ktp || '-'}</td>
            <td>${nasabah.nomor_telepon || '-'}</td>
            <td>${nasabah.tanggal_registrasi ? new Date(nasabah.tanggal_registrasi).toLocaleDateString('id-ID') : '-'}</td>
            <td>
                <span class="status ${nasabah.rekening ? 'active' : 'pending'}">
                    ${nasabah.rekening ? 'Aktif' : 'Pending'}
                </span>
            </td>
          <td>
  <button class="btn btn-sm btn-primary" onclick="showNasabahDetail('${nasabah.id_nasabah}')">
      <i class="fas fa-eye"></i> Detail
  </button>

  <button class="btn btn-sm btn-warning" onclick="editNasabah('${nasabah.id_nasabah}')">
      <i class="fas fa-edit"></i> Edit
  </button>

  <button class="btn btn-sm btn-danger" onclick="hapusNasabah('${nasabah.id_nasabah}')">
      <i class="fas fa-trash"></i> Hapus
  </button>
</td>
        `;
    });
}

function hapusNasabah(id) {
    const konfirmasi = confirm("Yakin ingin menghapus data ini?");
    if (!konfirmasi) return;

    nasabahData = nasabahData.filter(n => n.id_nasabah !== id);

    localStorage.setItem('nasabahData', JSON.stringify(nasabahData));

    alert("Data berhasil dihapus!");
    renderNasabahTable();
    updateStats();
}


function handleRegistration(e) {
    e.preventDefault();

    const nasabah = collectNasabahData();

    if (!validateRegistration(nasabah)) return;

    if (currentNasabahId) {
        // MODE EDIT
        const index = nasabahData.findIndex(n => n.id_nasabah === currentNasabahId);

        nasabahData[index] = {
            ...nasabahData[index],
            ...nasabah,
            id_nasabah: currentNasabahId
        };

        alert("Data berhasil diupdate!");
        currentNasabahId = null;

    } else {
        // MODE TAMBAH
        const newNasabah = {
            id_nasabah: nasabah.nomor_registrasi,
            ...nasabah
        };

        nasabahData.push(newNasabah);
        alert("Data berhasil ditambahkan!");
    }

    localStorage.setItem('nasabahData', JSON.stringify(nasabahData));

    resetForm();
    renderNasabahTable();
    updateStats();
    showSection('dashboard');
}



function searchNasabah() {
    const searchTerm = document.getElementById('search-nasabah').value.toLowerCase();
    const rows = document.querySelectorAll('#nasabah-tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function showNasabahDetail(id) {
    const nasabah = nasabahData.find(n => n.id_nasabah === id);
    if (!nasabah) return;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="nasabah-detail">
            <h4><i class="fas fa-user"></i> Data Nasabah</h4>
            <div class="detail-grid">
                <div><strong>ID:</strong> ${nasabah.id_nasabah}</div>
                <div><strong>Nama:</strong> ${nasabah.nama_lengkap}</div>
                <div><strong>NIK:</strong> ${nasabah.nomor_ktp}</div>
                <div><strong>Telepon:</strong> ${nasabah.nomor_telepon}</div>
                <div><strong>Alamat:</strong> ${nasabah.alamat}</div>
                <div><strong>Pekerjaan:</strong> ${nasabah.pekerjaan}</div>
            </div>
            
            ${nasabah.pasangan && Object.keys(nasabah.pasangan).length > 0 ? `
                <h4><i class="fas fa-heart"></i> Data Pasangan</h4>
                <div class="detail-grid">
                    <div><strong>Nama:</strong> ${nasabah.pasangan.nama_pasangan}</div>
                    <div><strong>NIK:</strong> ${nasabah.pasangan.ktp_pasangan}</div>
                    <div><strong>Telepon:</strong> ${nasabah.pasangan.telepon_pasangan}</div>
                </div>
            ` : ''}
            
            ${nasabah.ahli_waris && nasabah.ahli_waris.length > 0 ? `
                <h4><i class="fas fa-user-friends"></i> Data Ahli Waris</h4>
                ${nasabah.ahli_waris.map((aw, index) => `
                    <div class="detail-grid">
                        <div><strong>${index + 1}. Nama:</strong> ${aw.nama}</div>
                        <div><strong>NIK:</strong> ${aw.ktp}</div>
                        <div><strong>Telepon:</strong> ${aw.telepon}</div>
                    </div>
                `).join('')}
            ` : ''}
            
            ${nasabah.rekening ? `
                <h4><i class="fas fa-wallet"></i> Data Rekening</h4>
                <div class="detail-grid">
                    <div><strong>ID Rekening:</strong> ${nasabah.rekening.id_rekening}</div>
                    <div><strong>Setoran Awal:</strong> Rp ${formatRupiah(nasabah.rekening.nominal_setoran)}</div>
                    <div><strong>Tanggal Buka:</strong> ${new Date(nasabah.rekening.tanggal_pembukaan).toLocaleDateString('id-ID')}</div>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('modal-detail').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal-detail').style.display = 'none';
}

// Registration Handler
function handleRegistration(e) {
    e.preventDefault();
    
    // Collect all data
    const nasabah = collectNasabahData();
    const pasangan = collectPasanganData();
    const ahliWaris = collectAhliWarisData();
    const rekening = collectRekeningData();
    
    // Validate required fields
    if (!validateRegistration(nasabah)) {
        alert('Mohon lengkapi data nasabah utama terlebih dahulu!');
        return;
    }
    
    // Check duplicate NIK
    if (isDuplicateNIK(nasabah.nomor_ktp)) {
        alert('NIK sudah terdaftar!');
        return;
    }
    
    // Save data
    const newNasabah = {
        id_nasabah: nasabah.nomor_registrasi,
        ...nasabah,
        pasangan: Object.keys(pasangan).length > 0 ? pasangan : null,
        ahli_waris: ahliWaris.length > 0 ? ahliWaris : null,
        rekening: rekening
    };
    
    nasabahData.push(newNasabah);
    localStorage.setItem('nasabahData', JSON.stringify(nasabahData));
    
    alert('Registrasi nasabah berhasil disimpan!');
    
    // Reset form
    resetForm();
    showSection('dashboard');
}

function collectNasabahData() {
    return {
        nomor_registrasi: document.getElementById('nomor_registrasi').value,
        tanggal_registrasi: document.getElementById('tanggal_registrasi').value,
        nama_lengkap: document.getElementById('nama_lengkap').value,
        nomor_ktp: document.getElementById('nomor_ktp').value,
        tempat_lahir: document.getElementById('tempat_lahir').value,
        tanggal_lahir: document.getElementById('tanggal_lahir').value,
        alamat: document.getElementById('alamat').value,
        nomor_telepon: document.getElementById('nomor_telepon').value,
        jenis_kelamin: document.getElementById('jenis_kelamin').value,
        pekerjaan: document.getElementById('pekerjaan').value,
        penghasilan: parseInt(document.getElementById('penghasilan').value),
        status_perkawinan: document.getElementById('status_perkawinan').value,
        agama: document.getElementById('agama').value,
        pendidikan_terakhir: document.getElementById('pendidikan_terakhir').value
    };
}

function collectPasanganData() {
    const nama = document.getElementById('nama_pasangan').value.trim();
    if (!nama) return {};
    
    return {
        nama_pasangan: nama,
        ktp_pasangan: document.getElementById('ktp_pasangan').value,
        tempat_lahir_pasangan: document.getElementById('tempat_lahir_pasangan').value,
        tanggal_lahir_pasangan: document.getElementById('tanggal_lahir_pasangan').value,
        alamat_pasangan: document.getElementById('alamat_pasangan').value,
        telepon_pasangan: document.getElementById('telepon_pasangan').value,
        pekerjaan_pasangan: document.getElementById('pekerjaan_pasangan').value
    };
}

function collectAhliWarisData() {
    const ahliWarisItems = document.querySelectorAll('.ahli-waris-item');
    const ahliWaris = [];
    
    ahliWarisItems.forEach(item => {
        const nama = item.querySelector('.ahli-waris-nama').value.trim();
        if (nama) {
            ahliWaris.push({
                nama: nama,
                ktp: item.querySelector('.ahli-waris-ktp').value,
                alamat: item.querySelector('.ahli-waris-alamat').value,
                telepon: item.querySelector('.ahli-waris-telepon').value
            });
        }
    });
    
    return ahliWaris;
}

function collectRekeningData() {
    return {
        id_rekening: `REK-${Date.now().toString().slice(-6)}`,
        nominal_setoran: parseInt(document.getElementById('nominal_setoran').value),
        tanggal_pembukaan: document.getElementById('tanggal_pembukaan').value
    };
}

function validateRegistration(nasabah) {
    const requiredFields = ['nomor_registrasi', 'nama_lengkap', 'nomor_ktp', 'alamat', 'nomor_telepon'];
    return requiredFields.every(field => nasabah[field]);
}

function isDuplicateNIK(nik) {
    return nasabahData.some(n => n.nomor_ktp === nik);
}

function resetForm() {
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.value = '';
    });
    document.getElementById('ahli-waris-container').innerHTML = `
        <div class="ahli-waris-item">
            <div class="form-grid">
                <div class="form-group">
                    <label>Nama Ahli Waris 1</label>
                    <input type="text" class="ahli-waris-nama">
                </div>
                <div class="form-group">
                    <label>NIK Ahli Waris 1</label>
                    <input type="text" class="ahli-waris-ktp" maxlength="16">
                </div>
                <div class="form-group">
                    <label>Alamat Ahli Waris 1</label>
                    <textarea class="ahli-waris-alamat"></textarea>
                </div>
                <div class="form-group">
                    <label>Telepon Ahli Waris 1</label>
                    <input type="tel" class="ahli-waris-telepon">
                </div>
            </div>
            <button type="button" class="btn btn-remove" onclick="removeAhliWaris(this)">Hapus</button>
        </div>
    `;
    currentStep = 1;
    nextStep(1);
    setDefaultDates();
}

function exportData() {
    const dataStr = JSON.stringify(nasabahData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nasabah_data_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
}

// Utility Functions
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// Modal close on outside click
window.onclick = function(event) {
    const modal = document.getElementById('modal-detail');
    if (event.target === modal) {
        closeModal();
    }
}

// Responsive adjustments
function handleResize() {
    if (window.innerWidth > 768) {
        document.getElementById('mobile-menu').classList.remove('active');
        document.getElementById('nav-menu').classList.remove('active');
    }
}

window.addEventListener('resize', handleResize);