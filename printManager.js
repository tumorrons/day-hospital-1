// Funzione per stampare il report giornaliero
function printDailyReport() {
    const savedPatientsData = JSON.parse(localStorage.getItem('patientsData') || '{}');
    const currentDate = new Date().toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let printContent = `
        <div class="print-content">
            <div class="print-header">
                <div class="print-date">${currentDate}</div>
                <h1 class="print-title">REPORT GIORNALIERO REPARTO</h1>
            </div>
            <div class="print-patients-grid">
    `;
    
    // Genera il report per ogni paziente
    for (let i = 1; i <= config.patientCount; i++) {
        const patientData = savedPatientsData[i] || {
            notes: '',
            tasks: {},
            customFields: {},
            customTasks: {},
            interventionAlerts: {}
        };
        
        const patientLabel = config.patientLabels[i] || `Paziente ${i}`;
        const roomInfo = config.rooms[i] || 'Stanza non assegnata';
        
        // Calcola progresso
        const allTasks = [...config.tasks, ...(patientData.customTasks ? Object.keys(patientData.customTasks) : [])];
        const completedTasks = allTasks.filter(task => 
            patientData.tasks[task] || patientData.customTasks?.[task]?.completed
        ).length;
        const totalTasks = allTasks.length;
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        printContent += `
            <div class="print-patient">
                <div class="print-patient-header">
                    ${patientLabel}<br>${roomInfo}
                </div>
                
                <div class="print-patient-info">
        `;
        
        // Campi pazienti (limitiamo ai primi 3 per spazio)
        const fieldsToShow = [...config.patientFields, 'Sesso'].slice(0, 4);
        fieldsToShow.forEach((field, index) => {
            let value = patientData.customFields?.[field] || '';
            
            // Per il sesso, mostra per esteso
            if (field === 'Sesso') {
                value = value === 'M' ? 'Maschio' : value === 'F' ? 'Femmina' : value;
            }
            // Per la data di nascita, mostra età
            else if (field === 'Data di nascita' && value) {
                const age = calculateAge(value);
                value = age !== null ? `${age} anni` : value;
            }
            
            printContent += `
                <div class="print-field">
                    <span class="print-field-label">${field.slice(0, 8)}:</span>
                    <span class="print-field-value">${value}</span>
                </div>
            `;
        });
        
        printContent += `
                </div>
                
                <div class="print-tasks">
                    <div class="print-tasks-title">ATTIVITÀ</div>
        `;
        
        // Attività (limitiamo per spazio)
        const tasksToShow = [...config.tasks, ...(patientData.customTasks ? Object.keys(patientData.customTasks) : [])].slice(0, 8);
        tasksToShow.forEach(task => {
            const isCompleted = patientData.tasks[task] || patientData.customTasks?.[task]?.completed || false;
            const taskName = task.length > 15 ? task.slice(0, 15) + '...' : task;
            printContent += `
                <div class="print-task">
                    <span class="print-checkbox ${isCompleted ? 'checked' : ''}"></span>
                    ${taskName}
                </div>
            `;
        });
        
        printContent += `
                </div>
                
                <div class="print-notes">
                    <div class="print-notes-title">NOTE</div>
                    <div class="print-notes-content">${(patientData.notes || '').slice(0, 50)}</div>
                </div>
                
                <div class="print-progress">
                    ${completedTasks}/${totalTasks} (${progressPercent}%)
                </div>
            </div>
        `;
    }
    
    printContent += '</div></div>';
    
    // Crea un documento temporaneo per la stampa
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Report Giornaliero - ${currentDate}</title>
            <style>
                @page { margin: 15mm; size: A4; }
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: 8px; }
                .print-content { width: 100%; max-height: 100vh; overflow: hidden; }
                .print-header { text-align: center; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 5px; }
                .print-date { font-size: 10px; margin-bottom: 2px; }
                .print-title { font-size: 12px; font-weight: bold; margin: 0; }
                .print-patients-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; width: 100%; }
                .print-patient { border: 1px solid #000; padding: 4px; font-size: 7px; height: fit-content; }
                .print-patient-header { background: #f0f0f0; padding: 2px; margin: -4px -4px 3px -4px; border-bottom: 1px solid #000; font-weight: bold; font-size: 8px; text-align: center; }
                .print-patient-info { margin-bottom: 3px; }
                .print-field { margin-bottom: 1px; display: flex; }
                .print-field-label { font-weight: bold; width: 25px; flex-shrink: 0; font-size: 6px; }
                .print-field-value { flex: 1; border-bottom: 1px dotted #ccc; min-height: 8px; font-size: 6px; }
                .print-tasks { margin-top: 3px; }
                .print-tasks-title { font-weight: bold; margin-bottom: 2px; font-size: 7px; border-bottom: 1px solid #ccc; }
                .print-task { margin-bottom: 1px; display: flex; align-items: center; font-size: 6px; }
                .print-checkbox { width: 8px; height: 8px; border: 1px solid #000; margin-right: 2px; display: inline-block; position: relative; flex-shrink: 0; }
                .print-checkbox.checked::after { content: "✓"; position: absolute; left: 0px; top: -1px; font-size: 6px; font-weight: bold; }
                .print-notes { margin-top: 3px; border-top: 1px solid #ccc; padding-top: 2px; }
                .print-notes-title { font-weight: bold; margin-bottom: 1px; font-size: 6px; }
                .print-notes-content { min-height: 12px; border-bottom: 1px dotted #ccc; font-size: 6px; }
                .print-progress { text-align: right; font-style: italic; margin-top: 2px; font-size: 6px; }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Aspetta che il documento sia caricato, poi stampa
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}