document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    var addButton = document.getElementById('addButton');
    var noteInput = document.getElementById('noteInput');
    var categoryInput = document.getElementById('categoryInput');
    var colorInput = document.getElementById('colorInput');
    var reminderInput = document.getElementById('reminderInput');
    var saveButton = document.getElementById('saveButton');
    var leftContainer = document.getElementById('leftContainer');
    var rightContainer = document.getElementById('rightContainer');
    var clock = document.getElementById('clock');
    var voiceButton = document.getElementById('voiceButton');

    // Función para actualizar el reloj
    function updateClock() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // El reloj en formato 12 horas
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        var timeString = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
        clock.textContent = timeString;
    }

    // Actualizar el reloj cada segundo
    setInterval(updateClock, 1000);
    updateClock(); // Llamada inicial para mostrar el reloj inmediatamente

    // Evento para mostrar los campos de entrada al agregar una nota
    addButton.addEventListener('click', function() {
        addButton.style.display = 'none';
        noteInput.style.display = 'block';
        categoryInput.style.display = 'block';
        colorInput.style.display = 'block';
        reminderInput.style.display = 'block';
        saveButton.style.display = 'block';
        noteInput.focus();
    });

    // Evento para guardar la nota
    saveButton.addEventListener('click', function() {
        addOrUpdateNote();
    });

    // Cargar notas al iniciar la página
    loadNotes();

    // Función para cargar notas desde el Local Storage
    function loadNotes() {
        var notes = JSON.parse(localStorage.getItem('notes')) || [];
        renderNotes(notes);
    }

    // Función para renderizar las notas en el contenedor
    function renderNotes(notes) {
        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';

        notes.forEach(function(note, index) {
            var noteElement = createNoteElement(note, index);
            if (index % 2 === 0) {
                leftContainer.appendChild(noteElement);
            } else {
                rightContainer.appendChild(noteElement);
            }
            setReminder(note);
        });
    }

    // Función para crear el elemento de la nota
    function createNoteElement(note, index) {
        var noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.style.backgroundColor = note.color;

        var textNode = document.createTextNode(note.text);
        noteElement.appendChild(textNode);

        var categoryNode = document.createElement('span');
        categoryNode.textContent = ' (' + note.category + ')';
        noteElement.appendChild(categoryNode);

        var reminderNode = document.createElement('span');
        reminderNode.textContent = note.reminder ? ' (Recordatorio: ' + new Date(note.reminder).toLocaleString() + ')' : '';
        noteElement.appendChild(reminderNode);

        var editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.textContent = 'Editar';
        editButton.onclick = function() {
            editNote(index);
        };
        noteElement.appendChild(editButton);

        var deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = function() {
            deleteNote(index);
        };
        noteElement.appendChild(deleteButton);

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = note.completed;
        checkbox.onchange = function() {
            toggleComplete(index);
        };
        noteElement.appendChild(checkbox);

        if (note.completed) {
            noteElement.classList.add('completed');
        }

        return noteElement;
    }

    // Función para agregar o actualizar una nota
    function addOrUpdateNote() {
        var notes = JSON.parse(localStorage.getItem('notes')) || [];
        var note = {
            text: noteInput.value,
            category: categoryInput.value,
            color: colorInput.value,
            reminder: reminderInput.value,
            completed: false
        };

        if (saveButton.dataset.index) {
            notes[saveButton.dataset.index] = note;
            delete saveButton.dataset.index;
        } else {
            notes.push(note);
        }

        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes(notes);
        resetForm();
    }

    // Función para editar una nota
    function editNote(index) {
        var notes = JSON.parse(localStorage.getItem('notes')) || [];
        var note = notes[index];

        noteInput.value = note.text;
        categoryInput.value = note.category;
        colorInput.value = note.color;
        reminderInput.value = note.reminder;
        saveButton.dataset.index = index;

        addButton.style.display = 'none';
        noteInput.style.display = 'block';
        categoryInput.style.display = 'block';
        colorInput.style.display = 'block';
        reminderInput.style.display = 'block';
        saveButton.style.display = 'block';
        noteInput.focus();
    }

    // Función para eliminar una nota
    function deleteNote(index) {
        var notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes(notes);
    }

    // Función para resetear el formulario
    function resetForm() {
        noteInput.value = '';
        categoryInput.value = 'personal';
        colorInput.value = '#ffebcd';
        reminderInput.value = '';
        addButton.style.display = 'block';
        noteInput.style.display = 'none';
        categoryInput.style.display = 'none';
        colorInput.style.display = 'none';
        reminderInput.style.display = 'none';
        saveButton.style.display = 'none';
    }

    // Función para establecer el recordatorio
    function setReminder(note) {
        if (note.reminder) {
            var now = new Date();
            var reminderDate = new Date(note.reminder);
            if (reminderDate > now) {
                var timeout = reminderDate.getTime() - now.getTime();
                setTimeout(function() {
                    alert('Recordatorio: ' + note.text);
                }, timeout);
            }
        }
    }

    // Función para alternar el estado de completado de una nota
    function toggleComplete(index) {
        var notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes[index].completed = !notes[index].completed;
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes(notes);
    }

    // Función para reconocimiento de voz
    if ('webkitSpeechRecognition' in window) {
        var recognition = new webkitSpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        voiceButton.addEventListener('click', function() {
            recognition.start();
        });

        recognition.onresult = function(event) {
            var transcript = event.results[0][0].transcript;
            noteInput.value = transcript;
            recognition.stop();
        };

        recognition.onerror = function(event) {
            console.error('Error en el reconocimiento de voz: ', event.error);
        };
    } else {
        console.warn('API de reconocimiento de voz no soportada en este navegador.');
    }
});
