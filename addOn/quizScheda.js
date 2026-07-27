let collection = [];
const STORAGE_KEY = 'collection';

function leggiCollection() {
    try {
        const datiSalvati = localStorage.getItem(STORAGE_KEY);
        collection = datiSalvati ? JSON.parse(datiSalvati) : [];
    } catch (error) {
        collection = [];
    }
}

function salvaCollection() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

function ottieniDatiForm() {
    const nome = document.getElementById('nome').value.trim();
    const esperienza = document.getElementById('livello').value;
    const obbiettivo = document.querySelector('input[name="obiettivo"]:checked')?.value || '';
    const disponibilita = document.getElementById('disponibilita').value;
    const preferenze = Array.from(document.querySelectorAll('input[name="preferenza"]:checked'))
        .map((checkbox) => checkbox.value);

    return {
        nome,
        esperienza,
        obbiettivo,
        disponibilita,
        preferenza: preferenze.join(', ') || 'Nessuna'
    };
}

function mostraAnteprimaLive() {
    const output = document.getElementById('quiz-result');
    if (!output) return;

    const dati = ottieniDatiForm();
    const nome = dati.nome || '—';
    const livello = dati.esperienza || '—';
    const obbiettivo = dati.obbiettivo || '—';
    const disponibilita = dati.disponibilita || '—';
    const preferenza = dati.preferenza || 'Nessuna';

    output.innerHTML = `
        <h3>Anteprima della scheda</h3>
        <table border="1" cellpadding="5">
            <tr><th>Nome</th><td>${nome}</td></tr>
            <tr><th>Livello</th><td>${livello}</td></tr>
            <tr><th>Obbiettivo</th><td>${obbiettivo}</td></tr>
            <tr><th>Disponibilità</th><td>${disponibilita}</td></tr>
            <tr><th>Preferenza</th><td>${preferenza}</td></tr>
        </table>
        <p style="margin-top:10px;">Controlla i dati qui sopra prima di inviare.</p>
    `;
    output.style.display = 'block';
}

function mostraTabella() {
    const output = document.getElementById('quiz-result');
    if (!output) return;

    if (!collection.length) {
        mostraAnteprimaLive();
        return;
    }

    let html = `
        <h3>Riepilogo schede</h3>
        <table border="1" cellpadding="5">
            <tr>
                <th>Nome</th>
                <th>Livello</th>
                <th>Obbiettivo</th>
                <th>Disponibilità</th>
                <th>Preferenza</th>
                <th>Azioni</th>
            </tr>
    `;

    collection.forEach((item, index) => {
        html += `
            <tr>
                <td>${item.nome || ''}</td>
                <td>${item.esperienza || ''}</td>
                <td>${item.obbiettivo || ''}</td>
                <td>${item.disponibilita || ''}</td>
                <td>${item.preferenza || ''}</td>
                <td>
                    <button type="button" class="quiz-action-btn" onclick="modificaElemento(${index})">Modifica</button>
                    <button type="button" class="quiz-action-btn quiz-action-btn-delete" onclick="eliminaElemento(${index})">Elimina</button>
                </td>
            </tr>
        `;
    });

    html += `
        </table>
        <br>
        <button id="confermaInvio" class="quiz-submit-btn" type="button">Conferma invio</button>
    `;

    output.innerHTML = html;
    output.style.display = 'block';

    const confermaInvio = document.getElementById('confermaInvio');
    if (confermaInvio) {
        confermaInvio.addEventListener('click', function () {
            alert('Dati inviati.');
            azzeraDati();
        });
    }
}

// ====================== FUNZIONE PRINCIPALE CON LLM ======================
async function salvaDati(event) {
    event.preventDefault();

    const dati = ottieniDatiForm();
    const regexNome = /^[A-Za-zÀ-ÿ\s'-]+$/;

    if (!regexNome.test(dati.nome)) {
        alert('Nome non valido');
        return;
    }

    if (!dati.esperienza || !dati.obbiettivo || !dati.disponibilita) {
        alert('Compila tutti i campi richiesti');
        return;
    }

    const resultDiv = document.getElementById('quiz-result');
    resultDiv.innerHTML = `<p><strong>🤖 Generazione della tua scheda personalizzata in corso...</strong><br>Attendi qualche secondo.</p>`;

    try {
        const response = await fetch('/api/genera-scheda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dati)
        });

        const data = await response.json();

        if (data.success) {
            resultDiv.innerHTML = `
                <h3>✅ Scheda Generata per ${dati.nome || 'Atleta'}</h3>
                <div style="background:#f8f9fa; padding:25px; border-radius:10px; margin:15px 0; line-height:1.7; font-size:1.05em; white-space:pre-wrap;">
                    ${data.scheda}
                </div>
                <div style="margin-top:20px;">
                    <button onclick="window.print()" style="padding:12px 24px; margin-right:12px; font-size:1.1em;">🖨️ Stampa Scheda</button>
                    <button onclick="location.reload()" style="padding:12px 24px; font-size:1.1em;">🔄 Nuova Scheda</button>
                </div>
            `;

            // Salva comunque nella cronologia locale
            collection.push(dati);
            salvaCollection();

        } else {
            resultDiv.innerHTML = `<p style="color:red;">❌ ${data.error || 'Errore durante la generazione della scheda'}</p>`;
        }

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `<p style="color:red;">❌ Errore di connessione. Assicurati che il backend sia attivo.</p>`;
    }
}

function modificaElemento(index) {
    const item = collection[index];
    if (!item) return;

    document.getElementById('nome').value = item.nome || '';
    document.getElementById('livello').value = item.esperienza || '';

    document.querySelectorAll('input[name="obiettivo"]').forEach((radio) => {
        radio.checked = radio.value === item.obbiettivo;
    });

    document.getElementById('disponibilita').value = item.disponibilita || '';

    document.querySelectorAll('input[name="preferenza"]').forEach((checkbox) => {
        checkbox.checked = false;
    });

    const preferenze = (item.preferenza || '').split(',').map(v => v.trim()).filter(Boolean);
    preferenze.forEach((value) => {
        const checkbox = document.querySelector(`input[name="preferenza"][value="${value}"]`);
        if (checkbox) checkbox.checked = true;
    });

    collection.splice(index, 1);
    salvaCollection();
    mostraTabella();
}

function eliminaElemento(index) {
    collection.splice(index, 1);
    salvaCollection();
    mostraTabella();
}

function pulisciForm() {
    document.getElementById('nome').value = '';
    document.getElementById('livello').value = '';
    document.querySelectorAll('input[name="obiettivo"]').forEach(radio => radio.checked = false);
    document.getElementById('disponibilita').value = '';
    document.querySelectorAll('input[name="preferenza"]').forEach(cb => cb.checked = false);
}

function azzeraDati() {
    localStorage.removeItem(STORAGE_KEY);
    collection = [];
    mostraAnteprimaLive();
}

// Espone le funzioni globali per i bottoni inline
window.modificaElemento = modificaElemento;
window.eliminaElemento = eliminaElemento;

document.addEventListener('DOMContentLoaded', function () {
    leggiCollection();

    const form = document.getElementById('quiz-form');
    if (form) {
        form.addEventListener('submit', salvaDati);

        // Anteprima live
        form.querySelectorAll('input, select').forEach(function (element) {
            element.addEventListener('input', mostraAnteprimaLive);
            element.addEventListener('change', mostraAnteprimaLive);
        });
    }

    mostraAnteprimaLive();
});