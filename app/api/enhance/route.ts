import { NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60; 

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { fileUrl } = await request.json();

    console.log("🚀 Démarrage Job Qualité (MP-SENet) pour :", fileUrl);

    // ON UTILISE LE MODÈLE DE QUALITÉ (MP-SENet)
    // Mais on utilise .create() pour ne pas attendre et bloquer le serveur
    const prediction = await replicate.predictions.create({
      version: "de680605b626691a987a46d3c6b672cb411b9e9cca026cfcb946607165391087",
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

// La fonction qui vérifie si c'est fini
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  try {
    const prediction = await replicate.predictions.get(id);
    
    // Si c'est fini, on nettoie la sortie pour le frontend
    if (prediction.status === "succeeded") {
       return NextResponse.json({ 
         status: "succeeded", 
         output: prediction.output 
       });
    }
    
    // Sinon on renvoie juste le statut (starting, processing...)
    return NextResponse.json({ status: prediction.status });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}