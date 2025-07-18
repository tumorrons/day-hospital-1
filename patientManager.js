// Calcola età dalla data di nascita
function calculateAge(birthDateString) {
    if (!birthDateString) return null;
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    
    if (isNaN(birthDate)) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Genera schede pazienti
function generatePatients() {
    const container = document.getElementById('patients-container');
    container.innerHTML = '';
    
    const savedPatientsData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    
    for (let i = 1; i <= config.patientCount; i++) {
        const patientData = savedPatientsData[i] || {
            notes: '',
            tasks: {},
            customFields: {},
            customTasks: {},
            interventionAlerts: {}
        };
        
        const patientCard = createPatientCard(i, patientData);
        container.appendChild(patientCard);
    }
}

// Crea scheda paziente
function createPatientCard(patientNumber, patientData) {
    const card = document.createElement('div');
    card.className = 'patient-card';
    
    // Calcola progresso includendo task personalizzati
    const allTasks = [...config.tasks, ...(patientData.customTasks ? Object.keys(patientData.customTasks) : [])];
    const completedTasks = allTasks.filter(task => 
        patientData.tasks[task] || patientData.customTasks?.[task]?.completed
    ).length;
    const totalTasks = allTasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calcola età se presente data di nascita
    const birthDate = patientData.customFields?.['Data di nascita'];
    let ageDisplay = '';
    let isMinor = false;
    
    if (birthDate) {
        const age = calculateAge(birthDate);
        if (age !== null) {
            isMinor = age < 18;
            ageDisplay = `${age} anni${isMinor ? ' <span class="minor-badge">MINORENNE</span>' : ''}`;
        }
    }
    
    // Ottieni il sesso salvato
    const gender = patientData.customFields?.['Sesso'] || '';
    
    card.innerHTML = `
        <div class="patient-header">
            <div class="patient-title">
                <div class="patient-number">${config.patientLabels[patientNumber] || `Paziente ${patientNumber}`}</div>
                <select class="header-gender-select" onchange="updateGender(${patientNumber}, this.value)">
                    <option value="" ${gender === '' ? 'selected' : ''}>👤 Non specificato</option>
                    <option value="M" ${gender === 'M' ? 'selected' : ''}>♂ Maschio</option>
                    <option value="F" ${gender === 'F' ? 'selected' : ''}>♀ Femmina</option>
                </select>
            </div>
            <div class="room-info" onclick="openRoomSelector(${patientNumber})">${config.rooms[patientNumber] || 'Stanza non assegnata'}</div>
        </div>
        
        <div class="patient-fields">
            <div class="section-header">
                <h4>Informazioni:</h4>
                <button class="btn-mini btn-mini-success" onclick="addCustomField(${patientNumber})">+</button>
            </div>
            
            ${config.patientFields.filter(field => field !== 'Sesso').map((field, index) => {
                if (field === 'Data di nascita') {
                    return `
                        <div class="patient-field">
                            <input type="date" placeholder="${field}" value="${patientData.customFields?.[field] || ''}" 
                                   onchange="updateCustomField(${patientNumber}, '${field}', this.value)"
                                   style="flex: 1;">
                            ${ageDisplay ? `<div class="age-display-inline">${ageDisplay}</div>` : ''}
                        </div>
                    `;
                } else {
                    return `
                        <div class="patient-field">
                            <input type="text" placeholder="${field}" value="${patientData.customFields?.[field] || ''}" 
                                   onchange="updateCustomField(${patientNumber}, '${field}', this.value)">
                        </div>
                    `;
                }
            }).join('')}
            
            <!-- Campo Tipo di Intervento -->
            <div class="patient-field">
                <select onchange="updateIntervention(${patientNumber}, this.value)" style="width: 100%;">
                    <option value="">Seleziona tipo di intervento</option>
                    ${config.interventions.map(intervention => `
                        <option value="${intervention}" ${(patientData.customFields?.['Tipo di intervento'] === intervention) ? 'selected' : ''}>
                            ${intervention}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            ${patientData.customFields ? Object.keys(patientData.customFields).filter(key => !config.patientFields.includes(key) && key !== 'Sesso' && key !== 'Tipo di intervento').map(field => `
                <div class="patient-field">
                    <input type="text" placeholder="${field}" value="${patientData.customFields[field] || ''}" 
                           onchange="updateCustomField(${patientNumber}, '${field}', this.value)">
                    <button class="btn-mini btn-mini-primary" onclick="removeCustomField(${patientNumber}, '${field}')">×</button>
                </div>
            `).join('') : ''}
        </div>
        
        <!-- Avvisi Intervento -->
        ${patientData.customFields?.['Tipo di intervento'] && config.interventionAlerts[patientData.customFields['Tipo di intervento']] ? `
            <div class="intervention-alerts">
                <h4>Avvisi Post-Intervento:</h4>
                ${config.interventionAlerts[patientData.customFields['Tipo di intervento']].map((alert, alertIndex) => {
                    const alertKey = `${patientData.customFields['Tipo di intervento']}_${alertIndex}`;
                    const isCompleted = patientData.interventionAlerts?.[alertKey] || false;
                    return `
                        <div class="alert-item ${isCompleted ? 'completed' : ''}">
                            <input type="checkbox" class="alert-checkbox" 
                                   ${isCompleted ? 'checked' : ''} 
                                   onchange="updateInterventionAlert(${patientNumber}, '${alertKey}', this.checked)">
                            <span class="alert-label">${alert}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : ''}
        
        <div class="notes-section">
            <h4>Note:</h4>
            <textarea placeholder="Inserisci note sul paziente..." 
                      onchange="updatePatientData(${patientNumber}, 'notes', this.value)">${patientData.notes || ''}</textarea>
        </div>
        
        <div class="tasks-section">
            <div class="section-header">
                <h4>Attività:</h4>
                <button class="btn-mini btn-mini-success" onclick="addCustomTask(${patientNumber})">+</button>
            </div>
            ${config.tasks.map((task, index) => `
                <div class="task-item ${patientData.tasks[task] ? 'completed' : ''}">
                    <input type="checkbox" class="task-checkbox" 
                           ${patientData.tasks[task] ? 'checked' : ''} 
                           onchange="updateTaskStatus(${patientNumber}, '${task}', this.checked)">
                    <span class="task-label">${task}</span>
                </div>
            `).join('')}
            ${patientData.customTasks ? Object.keys(patientData.customTasks).map(task => `
                <div class="task-item ${patientData.customTasks[task].completed ? 'completed' : ''}">
                    <input type="checkbox" class="task-checkbox" 
                           ${patientData.customTasks[task].completed ? 'checked' : ''} 
                           onchange="updateCustomTaskStatus(${patientNumber}, '${task}', this.checked)">
                    <span class="task-label">${task}</span>
                    <button class="btn-mini btn-mini-primary" onclick="removeCustomTask(${patientNumber}, '${task}')">×</button>
                </div>
            `).join('') : ''}
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">${completedTasks}/${totalTasks} (${Math.round(progress)}%)</div>
    `;
    
    return card;
}

// Funzione per aggiornare il sesso del paziente
function updateGender(patientNumber, gender) {
    const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    if (!savedData[patientNumber]) {
        savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {}, interventionAlerts: {} };
    }
    if (!savedData[patientNumber].customFields) {
        savedData[patientNumber].customFields = {};
    }
    savedData[patientNumber].customFields['Sesso'] = gender;
    localStorage.setItem('patientsData', JSON.stringify(savedData));
    generatePatients();
}

// Funzione per aggiornare il tipo di intervento
function updateIntervention(patientNumber, intervention) {
    const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    if (!savedData[patientNumber]) {
        savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {}, interventionAlerts: {} };
    }
    if (!savedData[patientNumber].customFields) {
        savedData[patientNumber].customFields = {};
    }
    if (!savedData[patientNumber].interventionAlerts) {
        savedData[patientNumber].interventionAlerts = {};
    }
    
    // Se cambia intervento, resetta gli avvisi precedenti
    if (savedData[patientNumber].customFields['Tipo di intervento'] !== intervention) {
        savedData[patientNumber].interventionAlerts = {};
    }
    
    savedData[patientNumber].customFields['Tipo di intervento'] = intervention;
    localStorage.setItem('patientsData', JSON.stringify(savedData));
    generatePatients();
}

// Funzione per aggiornare lo stato degli avvisi intervento
function updateInterventionAlert(patientNumber, alertKey, completed) {
    const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    if (!savedData[patientNumber]) {
        savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {}, interventionAlerts: {} };
    }
    if (!savedData[patientNumber].interventionAlerts) {
        savedData[patientNumber].interventionAlerts = {};
    }
    
    savedData[patientNumber].interventionAlerts[alertKey] = completed;
    localStorage.setItem('patientsData', JSON.stringify(savedData));
    generatePatients();
}

// Aggiorna dati paziente
function updatePatientData(patientNumber, field, value) {
    const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    if (!savedData[patientNumber]) {
        savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {}, interventionAlerts: {} };
    }
    savedData[patientNumber][field] = value;
    localStorage.setItem('patientsData', JSON.stringify(savedData));
}

// Aggiorna campo personalizzato
function updateCustomField(patientNumber, fieldName, value) {
    const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    if (!savedData[patientNumber]) {
        savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {}, interventionAlerts: {} };
    }
    if (!savedData[patientNumber].customFields) {
        savedData[patientNumber].customFields = {};
    }
    savedData[patientNumber].customFields[fieldName] = value;
    localStorage.setItem('patientsData', JSON.stringify(savedData));
    
    // Se è stata aggiornata la data di nascita, rigenera le schede per aggiornare l'età
    if (fieldName === 'Data di nascita') {
        generatePatients();
    }
}

// Aggiungi campo personalizzato
function addCustomField(patientNumber) {
    const fieldName = prompt('Inserisci il nome del nuovo campo:');
    if (fieldName && fieldName.trim()) {
        const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
        if (!savedData[patientNumber]) {
            savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {}, interventionAlerts: {} };
        }
        if (!savedData[patientNumber].customFields) {
            savedData[patientNumber].customFields = {};
        }
        savedData[patientNumber].customFields[fieldName.trim()] = '';
        localStorage.setItem('patientsData', JSON.stringify(savedData));
        generatePatients();
    }
}

// Rimuovi campo personalizzato
function removeCustomField(patientNumber, fieldName) {
    if (confirm(`Sei sicuro di voler rimuovere il campo "${fieldName}"?`)) {
        const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
        if (savedData[patientNumber] && savedData[patientNumber].customFields) {
            delete savedData[patientNumber].customFields[fieldName];
            localStorage.setItem('patientsData', JSON.stringify(savedData));
            generatePatients();
        }
    }
}

// Aggiungi task personalizzato
function addCustomTask(patientNumber) {
    const taskName = prompt('Inserisci il nome della nuova attività:');
    if (taskName && taskName.trim()) {
        const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
        if (!savedData[patientNumber]) {
            savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {} };
        }
        if (!savedData[patientNumber].customTasks) {
            savedData[patientNumber].customTasks = {};
        }
        savedData[patientNumber].customTasks[taskName.trim()] = { completed: false };
        localStorage.setItem('patientsData', JSON.stringify(savedData));
        generatePatients();
    }
}

// Rimuovi task personalizzato
function removeCustomTask(patientNumber, taskName) {
    if (confirm(`Sei sicuro di voler rimuovere l'attività "${taskName}"?`)) {
        const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
        if (savedData[patientNumber] && savedData[patientNumber].customTasks) {
            delete savedData[patientNumber].customTasks[taskName];
            localStorage.setItem('patientsData', JSON.stringify(savedData));
            generatePatients();
        }
    }
}

// Aggiorna stato task personalizzato
function updateCustomTaskStatus(patientNumber, taskName, completed) {
    const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    if (!savedData[patientNumber]) {
        savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {}, interventionAlerts: {} };
    }
    if (!savedData[patientNumber].customTasks) {
        savedData[patientNumber].customTasks = {};
    }
    savedData[patientNumber].customTasks[taskName] = { completed: completed };
    localStorage.setItem('patientsData', JSON.stringify(savedData));
    generatePatients();
}

// Aggiorna stato attività
function updateTaskStatus(patientNumber, taskName, completed) {
    const savedData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    if (!savedData[patientNumber]) {
        savedData[patientNumber] = { notes: '', tasks: {}, customFields: {}, customTasks: {}, interventionAlerts: {} };
    }
    savedData[patientNumber].tasks[taskName] = completed;
    localStorage.setItem('patientsData', JSON.stringify(savedData));
    generatePatients();
}