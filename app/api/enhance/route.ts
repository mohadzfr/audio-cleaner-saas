import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb', // On garde la limite haute pour les vidéos
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

    console.log(`Traitement : ${file.name} (${file.type})`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- DÉTECTION DU TYPE MIME ---
    let mimeType = file.type;
    if (file.name.endsWith(".m4a")) mimeType = "audio/mp4";
    if (file.name.endsWith(".mp3")) mimeType = "audio/mpeg";
    if (file.name.endsWith(".wav")) mimeType = "audio/wav";
    // Vidéo
    if (file.name.endsWith(".mp4")) mimeType = "video/mp4";
    if (file.name.endsWith(".mov")) mimeType = "video/quicktime";

    const base64Input = buffer.toString("base64");
    const dataURI = `data:${mimeType};base64,${base64Input}`;

    console.log("Envoi à MP-SENet (Ton nouveau modèle)...");

    // --- APPEL IA AVEC TON ID ---
    const output = await replicate.run(
      // L'ID que tu m'as donné :
      "lucataco/mp-senet:de680605b626691a987a46d3c6b672cb411b9e9cca026cfcb946607165391087",
      {
        input: {
          audio: dataURI, // Ce modèle prend "audio"
        },
      }
    );

    // --- GESTION SORTIE ---
    let finalUrl = "";
    const responseRaw = output as any;

    // Gestion des Streams ou String simple
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
      { error: "Erreur IA : " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}