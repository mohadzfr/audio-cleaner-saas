import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    // --- 1. PRÉPARATION DE L'ENTRÉE ---
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    // Conversion en Data URI pour l'envoi
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "audio/wav";
    const base64Input = buffer.toString("base64");
    const dataURI = `data:${mimeType};base64,${base64Input}`;

    console.log(`Traitement de ${file.name}...`);

    // --- 2. APPEL A L'IA ---
    const output = await replicate.run(
      // 👇 TON ID DEEPFILTERNET ICI 👇
      "meronym/deepfilternet:f07004438b8f3e6c5b720ba889389007cbf8dbbc9caa124afc24d9bbd2d307b8", 
      {
        input: {
          audio_file: dataURI,
        },
      }
    );

    console.log("Type de réponse reçu :", typeof output);

    // --- 3. TRAITEMENT DE LA SORTIE (Le Fix TypeScript) ---
    let finalUrl = "";

    // On force le type en 'any' pour que TypeScript arrête de pleurer sur .locked
    const responseRaw = output as any;

    // CAS A : C'est un Stream (Le flux de données)
    if (responseRaw instanceof ReadableStream || responseRaw.locked !== undefined) {
      console.log("🌊 C'est un Stream ! Conversion en cours...");
      
      // On lit le stream pour en faire un fichier
      const response = new Response(responseRaw);
      const blob = await response.blob();
      const arrayBufferOutput = await blob.arrayBuffer();
      const bufferOutput = Buffer.from(arrayBufferOutput);
      const base64Output = bufferOutput.toString("base64");
      
      // On crée un "faux lien" Base64 jouable immédiatement
      finalUrl = `data:audio/wav;base64,${base64Output}`;
    } 
    // CAS B : C'est déjà un lien (String)
    else if (typeof output === "string") {
      finalUrl = output;
    }
    // CAS C : C'est un objet ou une liste
    else {
       // @ts-ignore
       finalUrl = Array.isArray(output) ? output[0] : (output.audio || output.file || "");
    }

    console.log("✅ URL Finale générée (taille) :", finalUrl.length > 100 ? "Lien Base64 Long (OK)" : finalUrl);

    return NextResponse.json({ cleanedUrl: finalUrl });

  } catch (error: any) {
    console.error("ERREUR :", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}