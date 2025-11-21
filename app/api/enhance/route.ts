import { NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60; 

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { fileUrl } = await request.json();

    console.log("🚀 Démarrage du job IA pour :", fileUrl);

    // On utilise 'predictions.create' au lieu de 'run'
    // Ça lance le travail et ça répond TOUT DE SUITE avec un ID (pas d'attente)
    const prediction = await replicate.predictions.create({
      version: "de680605b626691a987a46d3c6b672cb411b9e9cca026cfcb946607165391087", // MP-SENet
      input: {
        audio: fileUrl,
      },
    });

    return NextResponse.json({ id: prediction.id });

  } catch (error: any) {
    console.error("ERREUR POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Nouvelle fonction pour vérifier le statut
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    const prediction = await replicate.predictions.get(id);
    
    // On nettoie la réponse pour le frontend
    return NextResponse.json({ 
      status: prediction.status, 
      output: prediction.output 
    });

  } catch (error: any) {
    console.error("ERREUR GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}