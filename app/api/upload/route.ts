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
          allowedContentTypes: [
            'audio/mpeg',       // mp3
            'audio/wav',        // wav
            'audio/x-wav',      // wav (variante)
            'audio/ogg',        // ogg (whatsapp/android)
            'audio/x-m4a',      // m4a (iphone)
            'audio/mp4',        // m4a (variante)
            'audio/aac',        // aac
            'audio/webm',       // webm (enregistrements web)
            'audio/flac',       // flac
            'video/mp4',        // mp4
            'video/quicktime',  // mov (iphone)
            'video/webm',       // webm video
            'video/x-msvideo'   // avi
          ],
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