import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";

// Inicializa o Google Generative AI com sua API Key
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error('API Key não definida nas variáveis de ambiente');
}

const genAI = new GoogleGenerativeAI(apiKey);  // Passa apenas a chave da API como string

export async function POST(request: Request) {
  try {
    // Recebe o corpo da requisição com o prompt
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt não fornecido.' }, { status: 400 });
    }

    // Inicializa o modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Executa o prompt e define o tipo de resultado como GenerateContentResult
    const result: GenerateContentResult = await model.generateContent([prompt]);

    // Log completo da resposta para depuração
    console.log("Resposta completa da API:", result);

    // Verifica se o resultado tem a resposta e os metadados de uso
    if (!result?.response?.usageMetadata) {
      return NextResponse.json({ error: 'Uso de metadados não retornado pela API.' }, { status: 500 });
    }

    // Extraímos a contagem de tokens da resposta
    const { promptTokenCount, candidatesTokenCount, totalTokenCount } = result.response.usageMetadata;

    // Exibe a contagem de tokens
    console.log(`Prompt tokens: ${promptTokenCount}`);
    console.log(`Resposta tokens (candidates): ${candidatesTokenCount}`);
    console.log(`Total tokens: ${totalTokenCount}`);
    console.log(result.response.text());

    // Retorna o texto gerado pela API e a contagem de tokens
    return NextResponse.json({
      response: result.response.text, // Verifique se o `text` está correto
      tokens: {
        promptTokenCount,
        candidatesTokenCount,
        totalTokenCount
      }
    });

  } catch (error) {
    console.error('Erro ao chamar a API do Google Generative AI:', error);
    return NextResponse.json({ error: 'Falha ao gerar conteúdo.' }, { status: 500 });
  }
}
