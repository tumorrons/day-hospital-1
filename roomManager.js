// Variabili per la gestione dello spostamento
let currentPatientToMove = null;
let selectedRoom = null;

// Funzioni per gestione spostamento pazienti
function openRoomSelector(patientNumber) {
    currentPatientToMove = patientNumber;
    selectedRoom = null;
    
    // Aggiorna l'intestazione
    const patientLabel = config.patientLabels[patientNumber] || `Paziente ${patientNumber}`;
    const currentRoom = config.rooms[patientNumber] || 'Stanza non assegnata';
    document.getElementById('room-selector-patient-info').textContent = 
        `${patientLabel} - Stanza attuale: ${currentRoom}`;
    
    // Genera opzioni stanze
    generateRoomOptions();
    
    // Mostra il modal
    document.getElementById('room-selector').classList.add('active');
}

function generateRoomOptions() {
    const roomsContainer = document.getElementById('room-options');
    roomsContainer.innerHTML = '';
    
    // Ottieni tutte le stanze uniche
    const allRooms = new Set();
    for (let i = 1; i <= config.patientCount; i++) {
        if (config.rooms[i]) {
            allRooms.add(config.rooms[i]);
        }
    }
    
    // Converti in array e ordina
    const roomsArray = Array.from(allRooms).sort();
    
    roomsArray.forEach(room => {
        const roomOption = document.createElement('div');
        roomOption.className = 'room-option';
        
        // Verifica se la stanza è occupata da qualcun altro
        const patientsInRoom = findPatientsInRoom(room);
        const isOccupiedByOthers = patientsInRoom.some(patientId => {
            if (patientId === currentPatientToMove) return false;
            
            // Controlla se il paziente ha effettivamente dati inseriti
            const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
            const patientData = savedData[patientId];
            
            if (!patientData) return false;
            
            // Considera occupato se ha almeno un campo compilato o una nota
            const hasData = patientData.notes ||
                           (patientData.customFields && Object.values(patientData.customFields).some(val => val && val.trim())) ||
                           (patientData.tasks && Object.values(patientData.tasks).some(val => val)) ||
                           (patientData.customTasks && Object.keys(patientData.customTasks).length > 0);
            
            return hasData;
        });
        
        if (isOccupiedByOthers) {
            roomOption.classList.add('occupied');
        }
        
        roomOption.textContent = room;
        roomOption.onclick = () => selectRoom(room, roomOption);
        roomsContainer.appendChild(roomOption);
    });
}

function findPatientInRoom(room) {
    for (let i = 1; i <= config.patientCount; i++) {
        if (config.rooms[i] === room) {
            return i;
        }
    }
    return null;
}

function findPatientsInRoom(room) {
    const patients = [];
    for (let i = 1; i <= config.patientCount; i++) {
        if (config.rooms[i] === room) {
            patients.push(i);
        }
    }
    return patients;
}

function selectRoom(room, element) {
    // Rimuovi selezione precedente
    document.querySelectorAll('.room-option').forEach(opt => opt.classList.remove('selected'));
    
    // Seleziona la nuova stanza
    element.classList.add('selected');
    selectedRoom = room;
}

function confirmRoomMove() {
    if (!selectedRoom) {
        alert('Seleziona una stanza prima di procedere!');
        return;
    }
    
    // Trova il paziente che già occupa la stanza selezionata
    const currentOccupant = findPatientInRoom(selectedRoom);
    
    if (currentOccupant && currentOccupant !== currentPatientToMove) {
        // Propone lo scambio
        const confirmSwap = confirm(
            `La stanza "${selectedRoom}" è occupata da ${config.patientLabels[currentOccupant] || `Paziente ${currentOccupant}`}. ` +
            `Vuoi scambiare i dati dei pazienti?`
        );
        
        if (confirmSwap) {
            // Scambia TUTTI i dati dei pazienti
            swapPatientData(currentPatientToMove, currentOccupant);
            
            alert(`Scambio completato! I dati di ${config.patientLabels[currentPatientToMove] || `Paziente ${currentPatientToMove}`} e ${config.patientLabels[currentOccupant] || `Paziente ${currentOccupant}`} sono stati scambiati.`);
        } else {
            return;
        }
    } else {
        // Spostamento semplice - sposta i dati del paziente nella nuova posizione
        movePatientToRoom(currentPatientToMove, selectedRoom);
        
        alert(`${config.patientLabels[currentPatientToMove] || `Paziente ${currentPatientToMove}`} è stato spostato in "${selectedRoom}"`);
    }
    
    closeRoomSelector();
}

function swapPatientData(patient1, patient2) {
    // Ottieni i dati salvati dei pazienti
    const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    
    // Scambia i dati completi dei pazienti
    const tempData = savedData[patient1] || { notes: '', tasks: {}, customFields: {}, customTasks: {} };
    savedData[patient1] = savedData[patient2] || { notes: '', tasks: {}, customFields: {}, customTasks: {} };
    savedData[patient2] = tempData;
    
    // Salva i dati aggiornati
    localStorage.setItem('patientsData', JSON.stringify(savedData));
    
    // Rigenera l'interfaccia
    generatePatients();
}

function movePatientToRoom(patientNumber, targetRoom) {
    // Trova il paziente che occupa la stanza target
    const targetOccupant = findPatientInRoom(targetRoom);
    
    if (targetOccupant) {
        // Se la stanza target è occupata, sposta quell'occupante nella stanza del paziente corrente
        const currentRoom = config.rooms[patientNumber];
        config.rooms[targetOccupant] = currentRoom;
    }
    
    // Sposta il paziente corrente nella stanza target
    config.rooms[patientNumber] = targetRoom;
    
    // Salva la configurazione e rigenera i pazienti
    localStorage.setItem('wardConfig', JSON.stringify(config));
    generatePatients();
}

function closeRoomSelector() {
    document.getElementById('room-selector').classList.remove('active');
    currentPatientToMove = null;
    selectedRoom = null;
}

// Funzioni globali per le chiamate onClick nell'HTML
window.openRoomSelector = openRoomSelector;
window.confirmRoomMove = confirmRoomMove;
window.closeRoomSelector = closeRoomSelector;