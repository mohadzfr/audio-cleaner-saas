import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          // LISTE DES FORMATS AUTORISÉS
          allowedContentTypes: [
            'audio/mpeg',       // mp3
            'audio/wav',        // wav
            'audio/x-wav',      // wav
            'audio/ogg',        // ogg
            'audio/x-m4a',      // m4a
            'audio/mp4',        // m4a
            'audio/aac',        // aac
            'audio/webm',       // webm
            'audio/flac',       // flac
            'video/mp4',        // mp4
            'video/quicktime',  // mov
            'video/webm',       // webm
            'video/x-msvideo'   // avi
          ],
          // LA CORRECTION EST ICI 👇
          addRandomSuffix: true, // Ajoute un code unique si le nom existe déjà
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload terminé:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}