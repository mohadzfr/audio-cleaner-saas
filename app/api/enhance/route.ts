import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    console.log(`Traitement : ${file.name} (Type détecté: ${file.type})`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- CORRECTION DU FORMAT ---
    // On force le bon type MIME si le navigateur se trompe
    let mimeType = file.type;
    if (file.name.endsWith(".m4a")) mimeType = "audio/mp4";
    if (file.name.endsWith(".mp3")) mimeType = "audio/mpeg";
    if (file.name.endsWith(".wav")) mimeType = "audio/wav";
    
    // Si vraiment on sait pas, on met audio/mpeg qui est plus tolérant que wav
    if (!mimeType) mimeType = "audio/mpeg";

    const base64Input = buffer.toString("base64");
    const dataURI = `data:${mimeType};base64,${base64Input}`;

    // --- CHANGEMENT DE MODÈLE (PLAN B) ---
    // DeepFilterNet est parfois trop agressif.
    // On passe sur "Voice Fixer" (version stable) qui est meilleur pour reconstruire la voix
    const output = await replicate.run(
      "cjwbw/voice-fixer:f07004438b8f3e6c5b720ba889389007cbf8dbbc9caa124afc24d9bbd2d307b8",
      {
        input: {
          audio: dataURI, // Attention: Ce modèle veut "audio", pas "audio_file"
          mode: "high_quality" // On force la haute qualité
        },
      }
    );

    // --- GESTION DE LA SORTIE ---
    let finalUrl = "";
    const responseRaw = output as any;

    if (responseRaw instanceof ReadableStream || responseRaw.locked !== undefined) {
       // Conversion Stream -> DataURI
      const response = new Response(responseRaw);
      const blob = await response.blob();
      const arrayBufferOutput = await blob.arrayBuffer();
      const bufferOutput = Buffer.from(arrayBufferOutput);
      const base64Output = bufferOutput.toString("base64");
      finalUrl = `data:audio/wav;base64,${base64Output}`;
    } else if (typeof output === "string") {
      finalUrl = output;
    } else {
       // @ts-ignore
       finalUrl = Array.isArray(output) ? output[0] : (output.audio || output.file || "");
    }

    return NextResponse.json({ cleanedUrl: finalUrl });

  } catch (error: any) {
    console.error("ERREUR :", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}