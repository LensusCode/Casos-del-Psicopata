import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

const buildHistory = (messages: Message[]) => {
  // Gemini espera que los roles sean 'user' y 'model'.
  return messages.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
};

export const getAiResponse = async (prompt: string, history: Message[]): Promise<string> => {
  try {
    // Instanciar el cliente aquí para evitar errores de carga si `process` no está definido.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const model = 'gemini-2.5-flash';
    const geminiHistory = buildHistory(history);
    const contents = [...geminiHistory, { role: 'user', parts: [{ text: prompt }] }];

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction: "Eres un maestro del misterio al estilo del cine negro de los años 40, actuando como 'El Narrador' en un juego de detectives. Tu tono es directo, atmosférico y un poco cínico, como el de un detective privado clásico. Usa un lenguaje natural y evocador, pero evita palabras demasiado rebuscadas o pomposas. Queremos la atmósfera del cine negro, no un texto literario del siglo XIX. Responde a las acciones del detective para ayudarle a resolver el caso. Si te piden una 'pista', da una sugerencia sutil y enigmática. MUY IMPORTANTE: Nunca incluyas en tu respuesta tus pensamientos, planes o procesos internos (como bloques 'THINK' o similares). Tu respuesta debe ser únicamente la narración del personaje.",
        },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling AI service:", error);
    if (error instanceof Error && (error.message.includes('API key') || error instanceof ReferenceError)) {
        throw new Error('API Key no válida o faltante. Por favor, asegúrese de que esté configurada correctamente.');
    }
    throw new Error('No se pudo contactar al narrador. Revisa tu conexión y la configuración de la API Key.');
  }
};