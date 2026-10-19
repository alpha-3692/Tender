
const API_BASE_URL = "http://127.0.0.1:8001";

export interface UploadedDocument {
  id: number;
  tender_id: number;
  original_filename: string;
  file_size: number;
  uploaded_at: string;
}





export async function uploadTenderDocument(
  tenderId: number,
  file: File,
  token: string
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/tenders/${tenderId}/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.detail === "string"
        ? body.detail
        : `Upload failed (${response.status}).`;

    throw new Error(message);
  }
}


export async function getTenderDocuments(
  tenderId: number
): Promise<UploadedDocument[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/tenders/${tenderId}/documents`
  );

  if (!response.ok) {
    throw new Error("Unable to load uploaded documents.");
  }

  return response.json();
}
