import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Configuration pour accepter des fichiers un peu plus gros (limite Next.js)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // On essaie de pousser la limite
    },
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    console.log(`Traitement : ${file.name} (Type: ${file.type})`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- DÉTECTION INTELLIGENTE DU TYPE ---
    let mimeType = file.type;
    // Audio
    if (file.name.endsWith(".m4a")) mimeType = "audio/mp4";
    if (file.name.endsWith(".mp3")) mimeType = "audio/mpeg";
    if (file.name.endsWith(".wav")) mimeType = "audio/wav";
    // Vidéo (Nouveau !)
    if (file.name.endsWith(".mp4")) mimeType = "video/mp4";
    if (file.name.endsWith(".mov")) mimeType = "video/quicktime";
    if (file.name.endsWith(".webm")) mimeType = "video/webm";

    // Conversion en Base64 pour l'envoi
    const base64Input = buffer.toString("base64");
    const dataURI = `data:${mimeType};base64,${base64Input}`;

    console.log("Envoi à l'IA...");

    // On utilise Voice Fixer car il est tolérant avec les fichiers vidéo en entrée
    const output = await replicate.run(
      "cjwbw/voice-fixer:f07004438b8f3e6c5b720ba889389007cbf8dbbc9caa124afc24d9bbd2d307b8",
      {
        input: {
          audio_file: dataURI, // Il va extraire l'audio de la vidéo tout seul
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
      { error: "Fichier trop lourd ou erreur serveur. Essayez un fichier plus court (<5Mo)." },
      { status: 500 }
    );
  }
}