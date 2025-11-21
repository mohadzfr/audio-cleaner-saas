import { NextResponse } from "next/server";
import Replicate from "replicate";

// On garde une durée max élevée pour les gros fichiers
export const maxDuration = 60; 

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    // CHANGEMENT : On ne reçoit plus un fichier, mais une URL (texte)
    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "Aucune URL de fichier reçue" }, { status: 400 });
    }

    console.log("Traitement de l'URL :", fileUrl);

    // --- APPEL IA (MP-SENet) ---
    const output = await replicate.run(
      "lucataco/mp-senet:de680605b626691a987a46d3c6b672cb411b9e9cca026cfcb946607165391087",
      {
        input: {
          audio: fileUrl, // L'IA télécharge directement depuis le lien Vercel Blob
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
    console.error("ERREUR :", error);
    return NextResponse.json(
      { error: "Erreur IA : " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}