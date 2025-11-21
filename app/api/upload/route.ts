import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Ici tu pourras ajouter une sécurité (ex: vérifier si l'user est connecté)
        // Pour l'instant, on laisse ouvert pour la démo
        return {
          allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'video/mp4', 'video/quicktime'],
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
      { status: 400 }, // Bad Request
    );
  }
}