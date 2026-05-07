import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sdk } from "../../../server/_core/sdk";
import { COOKIE_NAME } from "../../../shared/const";
import { parse as parseCookieHeader } from "cookie";

// Helper para parsear cookies do NextRequest
function parseCookies(cookieHeader: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  const parsed = parseCookieHeader(cookieHeader);
  Object.entries(parsed).forEach(([name, value]) => {
    cookies.set(name, value);
  });

  return cookies;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const cookieHeader = request.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);
    const sessionCookie = cookies.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const session = await sdk.verifySession(sessionCookie);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const transactionId = formData.get("transactionId") as string;

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    if (!transactionId) {
      return NextResponse.json({ error: "El ID de la transacción es obligatorio" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Archivo demasiado grande. Máximo: 10MB" }, { status: 400 });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `transactions/${transactionId}/${fileName}`;

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('transaction-attachments')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir el archivo:", uploadError);
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabaseServer.storage
      .from('transaction-attachments')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: filePath,
      fileSize: file.size,
      mimeType: file.type,
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Error en el upload:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

