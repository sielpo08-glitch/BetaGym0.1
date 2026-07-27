export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { nome, esperienza, obbiettivo, disponibilita, preferenza } = req.body;

    const prompt = `Sei un personal trainer di Beta Gym. Crea una scheda chiara e professionale in italiano per:
- Nome: ${nome || "Cliente"}
- Livello: ${esperienza}
- Obiettivo: ${obbiettivo}
- Giorni/settimana: ${disponibilita}
- Preferenze: ${preferenza}

Struttura la scheda per giorni, con serie, ripetizioni, riscaldamento e consigli. Usa Markdown.`;

    try {
        const apiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.75,
                max_tokens: 1400
            })
        });

        const data = await apiResponse.json();
        const scheda = data.choices?.[0]?.message?.content || "Errore nella generazione.";

        return res.status(200).json({ success: true, scheda });

    } catch (error) {
        console.error("Errore LLM:", error);
        return res.status(500).json({ success: false, error: "Errore server" });
    }
}




