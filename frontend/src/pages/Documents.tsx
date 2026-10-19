import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Documents.css";

const API_BASE_URL = "http://127.0.0.1:8001";

interface Document {
  id: number;
  tender_id: number;
  original_filename: string;
  file_size: number;
  uploaded_at: string;
  tender_title: string;
  tender_reference: string;
}

function Documents() {
  const { token } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openingId, setOpeningId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!token) {
      setDocuments([]);
      setError("Please log in to view your documents.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        throw new Error("Unable to load documents.");
      }

      const data: Document[] = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the backend. Check that FastAPI is running on port 8001."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function openDocument(documentId: number) {
    if (!token) {
      setError("Please log in to open this document.");
      return;
    }

    setOpeningId(documentId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/documents/${documentId}/file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : "Unable to open this PDF."
        );
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, "_blank");

      if (!newWindow) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download =
          documents.find((doc) => doc.id === documentId)
            ?.original_filename ?? "document.pdf";
        link.click();
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to open this PDF."
      );
    } finally {
      setOpeningId(null);
    }
  }

  async function downloadDocument(
    documentId: number,
    filename: string
  ) {
    if (!token) {
      setError("Please log in to download this document.");
      return;
    }

    setDownloadingId(documentId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/documents/${documentId}/file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : "Unable to download this PDF."
        );
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to download this PDF. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  function formatFileSize(bytes: number) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return (
    <main className="documents-page">
      <header className="documents-header">
        <div>
          <p className="documents-eyebrow">TENDERMITRA WORKSPACE</p>
          <h1>Document Vault</h1>
          <p className="documents-subtitle">
            View, open, and download your uploaded tender documents.
          </p>
        </div>

        <button
          className="documents-refresh"
          onClick={() => void loadDocuments()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="documents-summary">
        <div className="documents-summary-icon">
          <FileText size={24} />
        </div>
        <div>
          <span>Total documents</span>
          <strong>{documents.length}</strong>
        </div>
      </section>

      {error && (
        <div className="documents-error" role="alert">
          {error}
          <button onClick={() => void loadDocuments()}>Try again</button>
        </div>
      )}

      <section className="documents-panel">
        <div className="documents-panel-heading">
          <div>
            <h2>Uploaded Documents</h2>
            <p>Your stored tender PDFs appear here.</p>
          </div>
        </div>

        {loading ? (
          <p className="documents-message">Loading your documents...</p>
        ) : documents.length === 0 && !error ? (
          <div className="documents-empty">
            <FileText size={36} />
            <h3>No documents uploaded yet</h3>
            <p>Upload a PDF from the Tenders page to see it here.</p>
            <a href="/tenders">Go to Tenders</a>
          </div>
        ) : (
          <div className="documents-table-wrapper">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Tender</th>
                  <th>File size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="document-name">
                        <FileText size={20} />
                        <div>
                          <strong>{doc.original_filename}</strong>
                          <span>PDF document</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="document-tender">
                        <strong>{doc.tender_title}</strong>
                        <span>{doc.tender_reference}</span>
                      </div>
                    </td>

                    <td>{formatFileSize(doc.file_size)}</td>

                    <td>
                      {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <div className="document-actions">
                        <button
                          type="button"
                          title="Open PDF"
                          aria-label={`Open ${doc.original_filename}`}
                          disabled={openingId === doc.id}
                          onClick={() => void openDocument(doc.id)}
                        >
                          {openingId === doc.id ? (
                            <RefreshCw size={17} />
                          ) : (
                            <ExternalLink size={17} />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Download PDF"
                          aria-label={`Download ${doc.original_filename}`}
                          disabled={downloadingId === doc.id}
                          onClick={() =>
                            void downloadDocument(
                              doc.id,
                              doc.original_filename
                            )
                          }
                        >
                          {downloadingId === doc.id ? (
                            <RefreshCw size={17} />
                          ) : (
                            <Download size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Documents;