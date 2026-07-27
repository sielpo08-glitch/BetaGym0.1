document.addEventListener('DOMContentLoaded', function () { // aspetta che si è caricata la pagina
    leggiDati();

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', salvaContatto);
    }

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        document.getElementById('save-booking-btn').addEventListener('click', function () {
            salvaPrenotazione(bookingForm);
        });
        document.getElementById('delete-booking-btn').addEventListener('click', eliminaPrenotazione);
    }

    mostraTabellaContatti();
    mostraTabellaPrenotazioni();
});

let contactCollection = [];
let bookingCollection = [];

function leggiDati() {
    try {
        contactCollection = JSON.parse(localStorage.getItem('contactCollection')) || [];  // prova se non ce o da errore = array vuoto
    } catch (error) {
        contactCollection = [];
    }

    try {
        bookingCollection = JSON.parse(localStorage.getItem('bookingCollection')) || [];
    } catch (error) {
        bookingCollection = [];
    }
}

function salvaDati(key, dati) {
    localStorage.setItem(key, JSON.stringify(dati));
}

function salvaContatto(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const dati = {
        nome: form.querySelector('#nome').value.trim(),
        email: form.querySelector('#email').value.trim(),
        telefono: form.querySelector('#telefono').value.trim(),
        messaggio: form.querySelector('#messaggio').value.trim()
    };

    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']+$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexTelefono = /^[0-9\s+]{6,20}$/;

    if (!regexNome.test(dati.nome)) {
        alert('Inserisci un nome valido.');
        return;
    }

    if (!regexEmail.test(dati.email)) {
        alert("Inserisci un'email valida.");
        return;
    }

    if (dati.telefono && !regexTelefono.test(dati.telefono)) {
        alert('Inserisci un numero di telefono valido.');
        return;
    }

    if (dati.messaggio.length < 10) {
        alert('Scrivi un messaggio più dettagliato.');
        return;
    }

    contactCollection.push({ ...dati, data: new Date().toISOString() });
    salvaDati('contactCollection', contactCollection);
    form.reset();
    mostraTabellaContatti();
}

function salvaPrenotazione(form) {
    const dati = {
        nome: form.querySelector('#nome').value.trim(),
        cognome: form.querySelector('#cognome').value.trim(),
        email: form.querySelector('#email').value.trim(),
        telefono: form.querySelector('#telefono').value.trim(),
        data: form.querySelector('#data').value,
        orario: form.querySelector('#orario').value,
        servizio: form.querySelector('#servizio').value
    };

    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']+$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexTelefono = /^[0-9\s+]{6,20}$/;

    if (!regexNome.test(dati.nome) || !regexNome.test(dati.cognome)) {
        alert('Inserisci nome e cognome validi.');
        return;
    }

    if (!regexEmail.test(dati.email)) {
        alert("Inserisci un'email valida.");
        return;
    }

    if (dati.telefono && !regexTelefono.test(dati.telefono)) {
        alert('Inserisci un numero di telefono valido.');
        return;
    }

    if (!dati.data || !dati.orario || !dati.servizio) {
        alert('Compila tutti i campi della prenotazione.');
        return;
    }

    bookingCollection.push(dati);
    salvaDati('bookingCollection', bookingCollection);
    form.reset();
    mostraTabellaPrenotazioni();
}

function eliminaPrenotazione() {
    const form = document.getElementById('booking-form');
    if (form) {
        form.reset();
    }

    if (bookingCollection.length) {
        bookingCollection.pop();
        salvaDati('bookingCollection', bookingCollection);
    }

    mostraTabellaPrenotazioni();
}

function mostraTabellaContatti() {
    const output = document.getElementById('tabella');
    if (!output) return;

    if (!contactCollection.length) {
        output.innerHTML = '<p>Nessuna richiesta salvata.</p>';
        output.style.display = 'block';
        return;
    }

    let html = "<table border='1' cellpadding='5'><tr>" +
        '<th>Nome</th><th>Email</th><th>Telefono</th><th>Messaggio</th><th>Azioni</th></tr>';

    contactCollection.forEach(function (item, index) {
        html += '<tr><td>' + (item.nome || '') + '</td><td>' + (item.email || '') + '</td><td>' + (item.telefono || '') + '</td><td>' + (item.messaggio || '') + '</td><td>' +
            "<button type='button' class='table-action-btn table-action-btn-edit' onclick=\"modificaElemento('contatti', " + index + ")\">Modifica</button> " +
            "<button type='button' class='table-action-btn table-action-btn-delete' onclick=\"eliminaElemento('contatti', " + index + ")\">Elimina</button>" +
            '</td></tr>';
    });

    html += '</table><br><button id="confermaInvioContatti" class="table-submit-btn" type="button">Conferma invio</button>';
    output.innerHTML = html;
    output.style.display = 'block';

    const button = document.getElementById('confermaInvioContatti');
    if (button) {
        button.addEventListener('click', function () {
            confermaInvio('contatti');
        });
    }
}

function mostraTabellaPrenotazioni() {
    const output = document.getElementById('booking-result');
    if (!output) return;

    if (!bookingCollection.length) {
        output.innerHTML = '<p>Nessuna prenotazione salvata.</p>';
        output.style.display = 'block';
        return;
    }

    let html = "<table border='1' cellpadding='5'><tr>" +
        '<th>Nome</th><th>Cognome</th><th>Email</th><th>Servizio</th><th>Data</th><th>Orario</th><th>Azioni</th></tr>';

    bookingCollection.forEach(function (item, index) {
        html += '<tr><td>' + (item.nome || '') + '</td><td>' + (item.cognome || '') + '</td><td>' + (item.email || '') + '</td><td>' + (item.servizio || '') + '</td><td>' + (item.data || '') + '</td><td>' + (item.orario || '') + '</td><td>' +
            "<button type='button' class='table-action-btn table-action-btn-edit' onclick=\"modificaElemento('prenotazioni', " + index + ")\">Modifica</button> " +
            "<button type='button' class='table-action-btn table-action-btn-delete' onclick=\"eliminaElemento('prenotazioni', " + index + ")\">Elimina</button>" +
            '</td></tr>';
    });

    html += '</table><br><button id="confermaInvioPrenotazioni" class="table-submit-btn" type="button">Invia prenotazione</button>';
    output.innerHTML = html;
    output.style.display = 'block';

    const button = document.getElementById('confermaInvioPrenotazioni');
    if (button) {
        button.addEventListener('click', function () {
            confermaInvio('prenotazioni');
        });
    }
}

function modificaElemento(tipo, index) {
    if (tipo === 'contatti') {
        const item = contactCollection[index];
        if (!item) return;

        const form = document.getElementById('contact-form');
        if (form) {
            form.querySelector('#nome').value = item.nome || '';
            form.querySelector('#email').value = item.email || '';
            form.querySelector('#telefono').value = item.telefono || '';
            form.querySelector('#messaggio').value = item.messaggio || '';
        }

        contactCollection.splice(index, 1);
        salvaDati('contactCollection', contactCollection);
        mostraTabellaContatti();
    } else {
        const item = bookingCollection[index];
        if (!item) return;

        const form = document.getElementById('booking-form');
        if (form) {
            form.querySelector('#nome').value = item.nome || '';
            form.querySelector('#cognome').value = item.cognome || '';
            form.querySelector('#email').value = item.email || '';
            form.querySelector('#telefono').value = item.telefono || '';
            form.querySelector('#data').value = item.data || '';
            form.querySelector('#orario').value = item.orario || '';
            form.querySelector('#servizio').value = item.servizio || '';
        }

        bookingCollection.splice(index, 1);
        salvaDati('bookingCollection', bookingCollection);
        mostraTabellaPrenotazioni();
    }
}

function eliminaElemento(tipo, index) {
    if (tipo === 'contatti') {
        contactCollection.splice(index, 1);
        salvaDati('contactCollection', contactCollection);
        mostraTabellaContatti();
    } else {
        bookingCollection.splice(index, 1);
        salvaDati('bookingCollection', bookingCollection);
        mostraTabellaPrenotazioni();
    }
}

function confermaInvio(tipo) {
    const output = tipo === 'contatti' ? document.getElementById('tabella') : document.getElementById('booking-result');

    if (tipo === 'contatti') {
        localStorage.removeItem('contactCollection');
        contactCollection = [];
        if (output) {
            output.innerHTML = '<p>Richiesta inviata con successo.</p>';
            output.style.display = 'block';
        }
        alert('Richiesta inviata.');
    } else {
        localStorage.removeItem('bookingCollection');
        bookingCollection = [];
        if (output) {
            output.innerHTML = '<p>Prenotazione inviata con successo.</p>';
            output.style.display = 'block';
        }
        alert('Prenotazione inviata.');
    }
}

