// Mostra/nascondi sezioni
function showSection(section) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Trova il bottone cliccato
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        if ((section === 'main' && btn.textContent.includes('Pazienti')) || 
            (section === 'config' && btn.textContent.includes('Configurazione'))) {
            btn.classList.add('active');
        }
    });
    
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
    // Aspetta un po' per assicurarsi che tutti i file siano caricati
    setTimeout(function() {
        // Gestione cambio numero pazienti
        const patientCountInput = document.getElementById('patient-count');
        if (patientCountInput) {
            patientCountInput.addEventListener('change', function() {
                const newCount = parseInt(this.value);
                if (newCount > 0 && newCount <= 50) {
                    config.patientCount = newCount;
                    initializeRoomsAndLabels();
                    updateConfigUI();
                }
            });
        }
        
        // Chiudi modal cliccando fuori
        const roomSelector = document.getElementById('room-selector');
        if (roomSelector) {
            roomSelector.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeRoomSelector();
                }
            });
        }
        
        // Inizializza l'applicazione
        if (typeof loadConfig === 'function') {
            loadConfig();
        }
    }, 100);
});

// Funzioni globali per le chiamate onClick nell'HTML
window.showSection = showSection;