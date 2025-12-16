import { GoogleGenAI, Schema, Type } from "@google/genai";
import { StudyRequest, StudyData } from "../types";

// Schema definition for Structured Output
const studySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        reference: { type: Type.STRING },
        translation: { type: Type.STRING },
        generated_at: { type: Type.STRING },
      },
      required: ["reference", "translation"],
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        executive: { type: Type.STRING },
        key_quote: { type: Type.STRING, description: "A versicle from the text OR a short inspirational quote summarizing the core message, suitable for a book cover." },
        preaching_points: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["executive", "preaching_points", "key_quote"],
    },
    content: {
      type: Type.OBJECT,
      properties: {
        text_base: { type: Type.STRING },
        intro_definition: { type: Type.STRING },
        context_literary: { type: Type.STRING },
        context_historical: { type: Type.STRING },
        parallels: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              reference: { type: Type.STRING },
              text: { type: Type.STRING },
              correlation: { type: Type.STRING, description: "Relationship type: Synoptic, OT Quote, thematic parallel" },
            },
            required: ["reference", "text", "correlation"],
          },
        },
        lexical_analysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              lemma: { type: Type.STRING },
              transliteration: { type: Type.STRING },
              morphology: { type: Type.STRING, description: "Strict morphological breakdown: Part of speech, Tense, Voice, Mood, Case, Gender, Number (e.g. 'Verbo Aoristo Indicativo Ativo, 3ª Sing')" },
              meaning: { type: Type.STRING, description: "Definition and at least 2 distinct semantic nuances or translation options" },
            },
            required: ["word", "lemma", "meaning"],
          },
        },
        intertextuality: { type: Type.STRING },
        interpretations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tradition: { type: Type.STRING, description: "Name of the tradition (e.g. Judaica, Patrística, Reformada, Dispensacionalista, etc)" },
              summary: { type: Type.STRING },
            },
            required: ["tradition", "summary"],
          },
        },
        theologians: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              era: { type: Type.STRING, description: "Historical period/Century (e.g., 'Patrística (Séc IV)', 'Reforma (Séc XVI)', 'Contemporâneo')" },
              view: { type: Type.STRING, description: "Summary of their specific view on this passage" },
            },
            required: ["name", "era", "view"],
          },
        },
        implications: { type: Type.STRING },
        study_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
        bibliography: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              author: { type: Type.STRING },
              title: { type: Type.STRING },
              publisher: { type: Type.STRING },
              year: { type: Type.STRING },
              annotation: { type: Type.STRING, description: "Brief comment on why this source is valuable" },
            },
            required: ["author", "title", "annotation"],
          },
        },
      },
      required: [
        "text_base",
        "intro_definition",
        "context_literary",
        "context_historical",
        "parallels",
        "lexical_analysis",
        "interpretations",
        "implications",
        "theologians",
        "bibliography"
      ],
    },
    sermon: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Um título atraente, homilético e bíblico para o sermão." },
        text_focus: { type: Type.STRING, description: "CRITICALLY MANDATORY: The specific verses focused on (e.g. 'João 3:16' or 'Versículos 10 a 14'). This defines the sermon scope." },
        introduction: { type: Type.STRING, description: "Gancho inicial e proposição do sermão" },
        points: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              explanation: { type: Type.STRING, description: "Explicação exegética. CRÍTICO: Toda afirmação deve ser seguida de sua referência bíblica entre parênteses. Ex: '...pela graça (Ef 2:8)'." },
              illustration: { type: Type.STRING, description: "Ilustração prática ou metáfora." },
              application: { type: Type.STRING, description: "Aplicação direta. CRÍTICO: Fundamente a aplicação com o versículo entre parênteses. Ex: '...orai sem cessar (1 Ts 5:17)'." },
            },
            required: ["title", "explanation", "illustration", "application"]
          }
        },
        conclusion: { type: Type.STRING, description: "Resumo e apelo final" }
      },
      required: ["title", "text_focus", "introduction", "points", "conclusion"]
    },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          image_hint: { type: Type.STRING },
        },
        required: ["title", "bullets"],
      },
    },
  },
  required: ["meta", "summary", "content", "slides", "sermon"],
};

export const generateStudy = async (
  request: StudyRequest
): Promise<StudyData> => {
  // 1. Validate API Key Presence
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in process.env");
    throw new Error("A chave de API do Gemini não está configurada. Por favor, configure a variável de ambiente API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Define instruction logic based on depth
  let depthInstructions = "";
  let toneInstruction = "";
  let lexicalInstruction = "";
  let theologyInstruction = "";
  let sermonInstruction = "";

  switch (request.depth) {
    case 'rapido':
      toneInstruction = "Tom devocional, inspirador, prático e conciso. Linguagem simples e direta.";
      lexicalInstruction = "Selecione 3 palavras-chave essenciais. Inclua morfologia básica.";
      theologyInstruction = "Apresente 3 visões principais (Consenso Histórico, Evangélico, Aplicação Prática).";
      depthInstructions = "Priorize a brevidade. O objetivo é leitura rápida e edificação.";
      sermonInstruction = "Gere um esboço devocional curto de 3 pontos.";
      break;

    case 'academico':
      toneInstruction = "Tom estritamente acadêmico, crítico e exegético. Linguagem formal, técnica.";
      lexicalInstruction = "OBRIGATÓRIO: Analise 5-7 palavras chave. Forneça a MORFOLOGIA COMPLETA e use léxicos acadêmicos (BDAG/HALOT).";
      theologyInstruction = "Análise exaustiva e plural. OBRIGATÓRIO incluir, quando relevante: Exegese Judaica/Antiga, Patrística (Grega/Latina), Reforma, Crítica-Histórica Moderna e Perspectivas Contemporâneas.";
      depthInstructions = "Priorize a profundidade técnica, crítica textual e precisão histórica.";
      sermonInstruction = "Gere um esboço de sermão EXPOSITIVO denso, com forte base exegética.";
      break;
    
    case 'sermao':
      toneInstruction = "Tom pastoral, proclamativo, persuasivo e eloquente. Focado na oratória.";
      lexicalInstruction = "Selecione palavras que enriqueçam a pregação e sejam explicáveis no púlpito.";
      theologyInstruction = "Apresente visões que ajudem na aplicação (ex: Puritana, Avivalista). Cite grandes pregadores indicando a ERA.";
      depthInstructions = "O foco total é gerar um sermão bíblico completo. A exegese deve servir à homilética.";
      sermonInstruction = "PRIORIDADE MÁXIMA: Gere um SERMÃO EXPOSITIVO COMPLETO. OBRIGATÓRIO: Cada ponto de explicação e aplicação DEVE incluir referências bíblicas explícitas entre parênteses para fundamentar o texto.";
      break;

    case 'detalhado':
    default:
      toneInstruction = "Tom educacional, didático e equilibrado. Linguagem acessível mas robusta.";
      lexicalInstruction = "Selecione 5 palavras importantes com morfologia detalhada.";
      theologyInstruction = "Apresente 5 a 6 linhas interpretativas variadas e relevantes para o texto. Não se limite às clássicas; considere tradições como: Judaica, Patrística, Ortodoxa, Reformada, Wesleyana, Pentecostal, Liberal ou Contextual, conforme a pertinência.";
      depthInstructions = "Equilíbrio entre profundidade e clareza. Ideal para professores de Escola Bíblica.";
      sermonInstruction = "Gere um esboço de sermão expositivo equilibrado.";
      break;
  }

  const systemPrompt = `
    ATUE COMO: Um teólogo sênior experiente, especialista em exegese bíblica, línguas originais (Grego/Hebraico) e homilética.
    
    SUA TAREFA: Gerar um estudo bíblico estruturado em JSON estrito para a passagem solicitada.
    
    CONFIGURAÇÃO:
    - Profundidade: ${request.depth.toUpperCase()}
    - Tom de Voz: ${toneInstruction}
    - Instrução Específica: ${depthInstructions}
    
    REGRAS CRÍTICAS DE FORMATAÇÃO:
    1. **Referências Bíblicas no Sermão**: Nos campos 'points.explanation' e 'points.application', é ABSOLUTAMENTE OBRIGATÓRIO incluir a referência bíblica de suporte entre parênteses ao lado da citação. Exemplo Correto: "Paulo exorta a igreja (Rm 12:1)". O frontend depende disso.
    2. **Foco do Texto**: O campo 'text_focus' no objeto 'sermon' é OBRIGATÓRIO. Ele define a base do sermão.
    3. O campo 'era' no array de teólogos é OBRIGATÓRIO. Ex: "Séc IV", "Reforma", "Contemporâneo".
    4. O campo 'key_quote' no resumo deve ser uma frase impactante que resuma a essência do texto, adequada para uma capa de livro.
    5. Respeite a tradução solicitada (${request.translation}) para o 'text_base'.
  `;

  const userPrompt = `
    Analise a passagem: "${request.passage}"
    Tradução preferencial: "${request.translation}"
    
    INSTRUÇÕES DE CONTEÚDO:
    1. LÉXICO: ${lexicalInstruction}
    2. TEOLOGIA: ${theologyInstruction}
    3. SERMÃO: ${sermonInstruction}
    4. PARALELOS: Liste correlações teológicas claras.
    
    Retorne APENAS o JSON válido conforme o schema.
  `;

  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: userPrompt }] },
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: studySchema,
          temperature: request.depth === 'academico' ? 0.2 : 0.6, // Lower temp for academic precision
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text) as StudyData;
        
        // Post-processing defaults to ensure robustness
        data.meta.generated_at = new Date().toISOString();
        data.meta.translation = request.translation;
        data.meta.reference = request.passage;
        
        return data;
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error: any) {
        console.warn(`Gemini API Attempt ${attempt} failed:`, error);
        lastError = error;
        
        // Retry logic: Retry on 5xx errors or network glitches
        const isRetryable = !error.status || error.status >= 500;
        
        if (isRetryable && attempt < maxRetries) {
            const delay = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
        }
        break;
    }
  }

  console.error("Gemini API Final Error:", lastError);
  throw new Error("Falha ao gerar o estudo. Verifique a API Key ou tente novamente.");
};