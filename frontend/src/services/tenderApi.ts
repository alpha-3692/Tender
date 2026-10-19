
const API_BASE_URL = "http://127.0.0.1:8001";

export interface Tender {
  id: number;
  title: string;
  organization: string;
  tender_reference: string;
  deadline: string;
  estimated_value: number | null;
  description: string;
  status: "open" | "under_review" | "qualified" | "not_qualified";
}

export interface TenderCreate {
  title: string;
  organization: string;
  tender_reference: string;
  deadline: string;
  estimated_value: number | null;
  description: string;
}

async function handleResponse(response: Response): Promise<Tender> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.detail === "string"
        ? body.detail
        : "Request failed. Please try again.";

    throw new Error(message);
  }

  return body as Tender;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}


export async function getTenders(token: string): Promise<Tender[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tenders/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.detail === "string"
        ? body.detail
        : "Unable to load tenders.";

    throw new Error(message);
  }

  return response.json();
}


export async function createTender(
  tender: TenderCreate,
  token: string
): Promise<Tender> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tenders/`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tender),
  });

  return handleResponse(response);
}
