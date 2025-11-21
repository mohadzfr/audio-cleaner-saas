import { NextResponse } from "next/server";
import Replicate from "replicate";

// Configuration pour Vercel (App Router)
export const maxDuration = 60; // On demande 60 secondes (le max gratuit)
export const dynamic = 'force-dynamic';

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

    // Vérification taille (Vercel limite à 4.5MB en gratuit sur le Body)
    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop lourd pour la version démo (Max 4.5Mo). Essayez un fichier plus court." },
        { status: 413 }
      );
    }

    console.log(`Traitement : ${file.name} (${file.type})`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Détection type
    let mimeType = file.type;
    if (file.name.endsWith(".m4a")) mimeType = "audio/mp4";
    if (file.name.endsWith(".mp3")) mimeType = "audio/mpeg";
    if (file.name.endsWith(".wav")) mimeType = "audio/wav";
    if (file.name.endsWith(".mp4")) mimeType = "video/mp4";
    
    const base64Input = buffer.toString("base64");
    const dataURI = `data:${mimeType};base64,${base64Input}`;

    console.log("Envoi à MP-SENet...");

    // --- APPEL IA ---
    const output = await replicate.run(
      // 👇 TON ID ICI
      "lucataco/mp-senet:de680605b626691a987a46d3c6b672cb411b9e9cca026cfcb946607165391087",
      {
        input: {
          audio: dataURI,
        },
      }
    );

    // --- GESTION SORTIE ---
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
    console.error("ERREUR SERVEUR:", error);
    return NextResponse.json(
      { error: "Erreur : " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}