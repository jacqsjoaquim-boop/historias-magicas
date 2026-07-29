// Função de backend (Vercel Serverless Function).
// Roda no servidor, nunca no celular do usuário — por isso a chave da API fica segura aqui.
// Configure a variável de ambiente ANTHROPIC_API_KEY no painel do Vercel (Settings > Environment Variables).

const SYSTEM_PROMPT = `Você é o narrador de "Histórias Mágicas", um app de histórias interativas para crianças de 4 a 8 anos, em português do Brasil.

Regras obrigatórias:
- Responda SEMPRE apenas com um JSON válido, sem markdown, sem crases, sem texto fora do JSON.
- Formato exato: {"text": "string", "choices": [{"label": "string"}, {"label": "string"}], "chapterEnd": boolean}
- "text": no máximo 3 frases curtas e simples, tom acolhedor, gentil e imaginativo. Sempre continue a partir do que já aconteceu na história.
- "choices": exatamente 2 opções de ação curtas (3-6 palavras), sempre no formato de verbo de ação. Se "chapterEnd" for true, "choices" deve ser uma lista vazia.
- Marque "chapterEnd": true a cada 4-5 trechos, para fechar um capítulo com uma sensação de conquista.
- NUNCA inclua violência, medo intenso, temas adultos, ou qualquer conteúdo assustador demais para crianças pequenas.
- NUNCA peça ou reaja a informações pessoais reais da criança (nome verdadeiro, endereço, escola, idade exata, etc). Se a criança mencionar algo assim, ignore o dado pessoal e continue a história normalmente, sem repetir a informação.
- Se a ideia da criança (quando fornecida como "sugestão da criança") for incoerente ou fora do tema, acolha com carinho e incorpore de forma simples e segura na trama, sem quebrar o tom da história.
- Mantenha o(s) personagem(ns) principais consistentes com o que já foi estabelecido na história.`;

function buildUserPrompt({ themeLabel, history, action }) {
  const historyText = history.length
    ? history.map((h, i) => `${i + 1}. ${h}`).join("\n")
    : "(início da história)";
  return `Tema do mundo: ${themeLabel}.
Histórico da história até agora:
${historyText}

Ação escolhida agora pela criança: ${action}

Gere o próximo trecho no formato JSON pedido.`;
}

const SAFETY_SYSTEM_PROMPT = `Você é um classificador de segurança para conteúdo de um app infantil (crianças de 4 a 8 anos), em português do Brasil.

Você vai receber um trecho de história e uma lista de opções de ação. Sua ÚNICA tarefa é responder EXATAMENTE uma destas duas opções, sem nenhum texto adicional:
- "OK" — se o conteúdo é totalmente apropriado para crianças pequenas
- "BLOQUEAR" — se o conteúdo contém qualquer um destes problemas: violência ou ameaças, medo intenso ou horror, temas adultos ou sexuais, pedido/uso de informação pessoal real (nome completo, endereço, escola, telefone), linguagem ofensiva, ou qualquer coisa inadequada para essa faixa etária

Responda SOMENTE "OK" ou "BLOQUEAR", nada mais.`;

async function checkSafety({ text, choices }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const content = `Trecho da história: "${text}"\nOpções: ${choices.map((c) => c.label).join(", ")}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        system: SAFETY_SYSTEM_PROMPT,
        messages: [{ role: "user", content }],
      }),
    });
    if (!response.ok) return true;
    const data = await response.json();
    const verdict = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim()
      .toUpperCase();
    return verdict.startsWith("OK");
  } catch (e) {
    return true;
  }
}

const SAFE_FALLBACK = {
  text: "A história faz uma pausa mágica por um instante, como se o vento estivesse pensando no próximo capítulo.",
  choices: [{ label: "Continuar a caminhada" }, { label: "Olhar ao redor com calma" }],
  chapterEnd: false,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY não configurada no servidor" });
    return;
  }

  const { themeLabel, history = [], action } = req.body || {};
  if (!themeLabel || !action) {
    res.status(400).json({ error: "themeLabel e action são obrigatórios" });
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt({ themeLabel, history, action }) }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: "Erro na API da Anthropic", details: errText });
      return;
    }

    const data = await response.json();
    const raw = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!parsed.text || !Array.isArray(parsed.choices)) {
      res.status(502).json({ error: "Formato inesperado da IA" });
      return;
    }

    const isSafe = await checkSafety({ text: parsed.text, choices: parsed.choices });
    if (!isSafe) {
      res.status(200).json(SAFE_FALLBACK);
      return;
    }

    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: "Falha ao gerar a história", details: String(e) });
  }
}
