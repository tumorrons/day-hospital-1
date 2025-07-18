// Mostra/nascondi sezioni
function showSection(section) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    if (section === 'main') {
        document.getElementById('main-content').classList.remove('hidden');
        document.getElementById('config-section').classList.remove('active');
    } else {
        document.getElementById('main-content').classList.add('hidden');
        document.getElementById('config-section').classList.add('active');
    }
}

// Inizializzazione degli event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Gestione cambio numero pazienti
    document.getElementById('patient-count').addEventListener('change', function() {
        const newCount = parseInt(this.value);
        if (newCount > 0 && newCount <= 50) {
            config.patientCount = newCount;
            initializeRoomsAndLabels();
            updateConfigUI();
        }
    });
    
    // Chiudi modal cliccando fuori
    document.getElementById('room-selector').addEventListener('click', function(e) {
        if (e.target === this) {
            closeRoomSelector();
        }
    });
    
    // Inizializza l'applicazione
    loadConfig();
});