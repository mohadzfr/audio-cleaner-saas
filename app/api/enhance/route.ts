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

    // Correction des extensions pour aider l'IA
    let mimeType = file.type;
    if (file.name.endsWith(".m4a")) mimeType = "audio/mp4";
    if (file.name.endsWith(".mp3")) mimeType = "audio/mpeg";
    if (file.name.endsWith(".wav")) mimeType = "audio/wav";
    if (!mimeType) mimeType = "audio/mpeg";

    const base64Input = buffer.toString("base64");
    const dataURI = `data:${mimeType};base64,${base64Input}`;

    console.log("Envoi à Voice Fixer...");

    // --- MODÈLE VOICE FIXER ---
    const output = await replicate.run(
      "cjwbw/voice-fixer:f07004438b8f3e6c5b720ba889389007cbf8dbbc9caa124afc24d9bbd2d307b8",
      {
        input: {
          // C'EST ICI LA CORRECTION : L'erreur exigeait "audio_file"
          audio_file: dataURI, 
          mode: "high_quality"
        },
      }
    );

    // --- GESTION DE LA SORTIE ---
    let finalUrl = "";
    const responseRaw = output as any;

    if (responseRaw instanceof ReadableStream || responseRaw.locked !== undefined) {
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