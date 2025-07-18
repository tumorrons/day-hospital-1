// Configurazione predefinita
let config = {
    patientCount: 15,
    rooms: {},
    patientLabels: {},
    patientFields: ['Nome paziente', 'Data di nascita', 'Diagnosi'],
    tasks: [
        'Medicazione mattutina',
        'Controllo parametri vitali',
        'Somministrazione farmaci',
        'Igiene personale',
        'Alimentazione',
        'Fisioterapia',
        'Medicazione serale',
        'Controllo dolore'
    ],
    interventions: [
        'Ernia inguinale',
        'Appendicectomia',
        'Colecistectomia',
        'Riparazione laparoscopica'
    ],
    interventionAlerts: {
        'Ernia inguinale': [
            'Mutande elastiche necessarie nel post-intervento',
            'Controllo cicatrice chirurgica',
            'Evitare sforzi per 2 settimane'
        ],
        'Appendicectomia': [
            'Controllo drenaggio',
            'Mobilizzazione precoce'
        ],
        'Colecistectomia': [
            'Dieta leggera post-intervento',
            'Controllo dolore addominale'
        ]
    }
};

// Inizializza le stanze e le etichette predefinite
function initializeRoomsAndLabels() {
    for (let i = 1; i <= config.patientCount; i++) {
        if (!config.rooms[i]) {
            config.rooms[i] = `Stanza ${Math.ceil(i / 2)}-${i % 2 === 1 ? 'A' : 'B'}`;
        }
        if (!config.patientLabels[i]) {
            config.patientLabels[i] = `Paziente ${i}`;
        }
    }
}

// Carica configurazione dal localStorage
function loadConfig() {
    const saved = JSON.parse(localStorage.getItem('wardConfig') || '{}');
    if (Object.keys(saved).length > 0) {
        config = { ...config, ...saved };
    }
    initializeRoomsAndLabels();
    updateConfigUI();
    generatePatients();
}

// Salva configurazione nel localStorage
function saveConfig() {
    localStorage.setItem('wardConfig', JSON.stringify(config));
    generatePatients();
    alert('Configurazione salvata con successo!');
}

// Reset configurazione
function resetConfig() {
    if (confirm('Sei sicuro di voler resettare la configurazione?')) {
        localStorage.removeItem('wardConfig');
        localStorage.removeItem('patientsData');
        location.reload();
    }
}

// Funzioni di configurazione UI
function updateConfigUI() {
    document.getElementById('patient-count').value = config.patientCount;
    
    // Aggiorna configurazione stanze
    const roomsContainer = document.getElementById('rooms-config');
    roomsContainer.innerHTML = '';
    
    for (let i = 1; i <= config.patientCount; i++) {
        const roomItem = document.createElement('div');
        roomItem.className = 'room-config-item';
        roomItem.innerHTML = `
            <label>Paziente ${i}:</label>
            <input type="text" value="${config.rooms[i] || ''}" 
                   onchange="updateRoomConfig(${i}, this.value)">
        `;
        roomsContainer.appendChild(roomItem);
    }
    
    // Aggiorna configurazione etichette pazienti
    const patientLabelsContainer = document.getElementById('patient-labels-config');
    patientLabelsContainer.innerHTML = '';
    
    for (let i = 1; i <= config.patientCount; i++) {
        const labelItem = document.createElement('div');
        labelItem.className = 'room-config-item';
        labelItem.innerHTML = `
            <label>Etichetta ${i}:</label>
            <input type="text" value="${config.patientLabels[i] || ''}" 
                   onchange="updatePatientLabelConfig(${i}, this.value)">
        `;
        patientLabelsContainer.appendChild(labelItem);
    }
    
    // Aggiorna altre configurazioni
    updatePatientFieldsConfig();
    updateInterventionsConfig();
    updateInterventionAlertsSelector();
    updateTasksConfig();
}

// Configurazione stanze
function updateRoomConfig(patientNumber, roomName) {
    config.rooms[patientNumber] = roomName;
}

// Configurazione etichette pazienti
function updatePatientLabelConfig(patientNumber, labelName) {
    config.patientLabels[patientNumber] = labelName;
}

// Configurazione campi paziente
function updatePatientFieldsConfig() {
    const fieldsContainer = document.getElementById('patient-fields-config');
    fieldsContainer.innerHTML = '';
    
    config.patientFields.forEach((field, index) => {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'task-config-item';
        fieldItem.innerHTML = `
            <input type="text" value="${field}" 
                   onchange="updatePatientFieldConfig(${index}, this.value)">
            <button class="btn btn-danger" onclick="removeInterventionConfig(${index})">Rimuovi</button>
        `;
        interventionsContainer.appendChild(interventionItem);
    });
}

function updateInterventionConfig(index, value) {
    const oldIntervention = config.interventions[index];
    config.interventions[index] = value;
    
    // Aggiorna anche la chiave negli avvisi se cambia il nome
    if (config.interventionAlerts[oldIntervention]) {
        config.interventionAlerts[value] = config.interventionAlerts[oldIntervention];
        delete config.interventionAlerts[oldIntervention];
    }
    
    updateInterventionAlertsSelector();
}

function removeInterventionConfig(index) {
    if (config.interventions.length > 1) {
        const interventionToRemove = config.interventions[index];
        config.interventions.splice(index, 1);
        
        // Rimuovi anche gli avvisi associati
        if (config.interventionAlerts[interventionToRemove]) {
            delete config.interventionAlerts[interventionToRemove];
        }
        
        updateInterventionsConfig();
        updateInterventionAlertsSelector();
    } else {
        alert('Deve rimanere almeno un intervento!');
    }
}

function addInterventionConfig() {
    const interventionName = prompt('Inserisci il nome del nuovo intervento:');
    if (interventionName && interventionName.trim()) {
        config.interventions.push(interventionName.trim());
        config.interventionAlerts[interventionName.trim()] = [];
        updateInterventionsConfig();
        updateInterventionAlertsSelector();
    }
}

// Configurazione avvisi interventi
function updateInterventionAlertsSelector() {
    const selector = document.getElementById('intervention-selector');
    selector.innerHTML = '<option value="">Seleziona intervento</option>';
    
    config.interventions.forEach(intervention => {
        const option = document.createElement('option');
        option.value = intervention;
        option.textContent = intervention;
        selector.appendChild(option);
    });
}

function showInterventionAlertsConfig(intervention) {
    const container = document.getElementById('alerts-for-intervention');
    
    if (!intervention) {
        container.innerHTML = '';
        return;
    }
    
    if (!config.interventionAlerts[intervention]) {
        config.interventionAlerts[intervention] = [];
    }
    
    container.innerHTML = `
        <h4>Avvisi per: ${intervention}</h4>
        <div id="alerts-list-${intervention.replace(/\s+/g, '-')}" class="tasks-config">
            ${config.interventionAlerts[intervention].map((alert, index) => `
                <div class="task-config-item">
                    <input type="text" value="${alert}" 
                           onchange="updateAlertConfig('${intervention}', ${index}, this.value)">
                    <button class="btn btn-danger" onclick="removeAlertConfig('${intervention}', ${index})">Rimuovi</button>
                </div>
            `).join('')}
        </div>
        <button class="btn btn-success" onclick="addAlertConfig('${intervention}')">+ Aggiungi Avviso</button>
    `;
}

function updateAlertConfig(intervention, index, value) {
    if (config.interventionAlerts[intervention]) {
        config.interventionAlerts[intervention][index] = value;
    }
}

function removeAlertConfig(intervention, index) {
    if (config.interventionAlerts[intervention]) {
        config.interventionAlerts[intervention].splice(index, 1);
        showInterventionAlertsConfig(intervention);
    }
}

function addAlertConfig(intervention) {
    const alertText = prompt('Inserisci il testo dell\'avviso:');
    if (alertText && alertText.trim()) {
        if (!config.interventionAlerts[intervention]) {
            config.interventionAlerts[intervention] = [];
        }
        config.interventionAlerts[intervention].push(alertText.trim());
        showInterventionAlertsConfig(intervention);
    }
}="btn btn-danger" onclick="removePatientFieldConfig(${index})">Rimuovi</button>
        `;
        fieldsContainer.appendChild(fieldItem);
    });
}

function updatePatientFieldConfig(index, value) {
    config.patientFields[index] = value;
}

function removePatientFieldConfig(index) {
    if (config.patientFields.length > 1) {
        config.patientFields.splice(index, 1);
        updatePatientFieldsConfig();
    } else {
        alert('Deve rimanere almeno un campo paziente!');
    }
}

function addPatientFieldConfig() {
    const fieldName = prompt('Inserisci il nome del nuovo campo:');
    if (fieldName && fieldName.trim()) {
        config.patientFields.push(fieldName.trim());
        updatePatientFieldsConfig();
    }
}

// Configurazione attività
function updateTasksConfig() {
    const tasksContainer = document.getElementById('tasks-config');
    tasksContainer.innerHTML = '';
    
    config.tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-config-item';
        taskItem.innerHTML = `
            <input type="text" value="${task}" 
                   onchange="updateTaskConfig(${index}, this.value)">
            <button class="btn btn-danger" onclick="removeTaskConfig(${index})">Rimuovi</button>
        `;
        tasksContainer.appendChild(taskItem);
    });
}

function updateTaskConfig(index, value) {
    config.tasks[index] = value;
}

function removeTaskConfig(index) {
    if (config.tasks.length > 1) {
        config.tasks.splice(index, 1);
        updateTasksConfig();
    } else {
        alert('Deve rimanere almeno una attività!');
    }
}

function addTaskConfig() {
    const taskName = prompt('Inserisci il nome della nuova attività:');
    if (taskName && taskName.trim()) {
        config.tasks.push(taskName.trim());
        updateTasksConfig();
    }
}

// Configurazione interventi
function updateInterventionsConfig() {
    const interventionsContainer = document.getElementById('interventions-config');
    interventionsContainer.innerHTML = '';
    
    config.interventions.forEach((intervention, index) => {
        const interventionItem = document.createElement('div');
        interventionItem.className = 'task-config-item';
        interventionItem.innerHTML = `
            <input type="text" value="${intervention}" 
                   onchange="updateInterventionConfig(${index}, this.value)">
            <button class