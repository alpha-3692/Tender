
import { useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  X,
  FileText,
  RefreshCw,
  Upload,
} from "lucide-react";

import Sidebar from "../Components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  createTender,
  getTenders,
  type Tender,
} from "../services/tenderApi";
import { uploadTenderDocument } from "../services/documentApi";
import "./Tenders.css";

const emptyForm = {
  title: "",
  organization: "",
  tender_reference: "",
  deadline: "",
  estimated_value: "",
  description: "",
};

export default function Tenders() {
  const { token } = useAuth();

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [uploadingTenderId, setUploadingTenderId] = useState<number | null>(
    null
  );
  const [uploadMessage, setUploadMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load tenders using the current login token.
  async function loadTenders() {
    if (!token) {
      setTenders([]);
      setError("Please log in again to view your tenders.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getTenders(token);
      setTenders(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load tenders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTenders();
    // Reload tenders when the login token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Upload a PDF using the current login token.
  async function handleFileUpload(tenderId: number, file?: File) {
    if (!file) return;

    setUploadMessage("");
    setError("");

    if (!token) {
      setError("Please log in again before uploading a document.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The PDF must be 10 MB or smaller.");
      return;
    }

    setUploadingTenderId(tenderId);

    try {
      const document = await uploadTenderDocument(tenderId, file, token);

      setUploadMessage(
        `${document.original_filename} uploaded successfully for tender ID ${tenderId}.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "PDF upload failed."
      );
    } finally {
      setUploadingTenderId(null);
    }
  }

  // Filter tenders by search text and status.
  const filteredTenders = tenders.filter((tender) => {
  const term = search.trim().toLowerCase();

  const matchesSearch =
    tender.title.toLowerCase().includes(term) ||
    tender.organization.toLowerCase().includes(term) ||
    tender.tender_reference.toLowerCase().includes(term);

  const matchesStatus =
    statusFilter === "all" || tender.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Create a new tender using the current login token.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Please log in again before saving a tender.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const created = await createTender(
        {
          title: form.title.trim(),
          organization: form.organization.trim(),
          tender_reference: form.tender_reference.trim(),
          deadline: form.deadline,
          estimated_value:
            form.estimated_value.trim() === ""
              ? null
              : Number(form.estimated_value),
          description: form.description.trim(),
        },
        token
      );

      setTenders((current) =>
        [created, ...current].sort((a, b) => b.id - a.id)
      );

      setForm(emptyForm);
      setShowForm(false);
      setSuccess(
        `Tender ${created.tender_reference} was saved successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save the tender."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatValue(value: number | null) {
    if (value === null) return "Not specified";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="tenders-main">
        <header className="tenders-header">
          <div>
            <span className="tenders-breadcrumb">
              Workspace / Tenders
            </span>
            <h1>Tender Explorer</h1>
            <p>Find, organize, and manage your tender opportunities.</p>
          </div>

          <button
            className="add-tender-button"
            onClick={() => {
              setShowForm((current) => !current);
              setError("");
              setSuccess("");
              setUploadMessage("");
            }}
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? "Close form" : "Add tender"}
          </button>
        </header>

        {error && (
          <div className="tender-message tender-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="tender-message tender-success" role="status">
            {success}
          </div>
        )}

        {uploadMessage && (
          <div className="tender-message tender-success" role="status">
            {uploadMessage}
          </div>
        )}

        {showForm && (
          <section className="tender-form-panel">
            <h2>Add a new tender</h2>
            <p>
              Enter the tender details below and save them to your database.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="tender-form-grid">
                <label>
                  Tender title *
                  <input
                    required
                    minLength={3}
                    maxLength={200}
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. Supply of Office Furniture"
                  />
                </label>

                <label>
                  Organization *
                  <input
                    required
                    minLength={2}
                    maxLength={200}
                    value={form.organization}
                    onChange={(e) =>
                      updateField("organization", e.target.value)
                    }
                    placeholder="e.g. Municipal Corporation"
                  />
                </label>

                <label>
                  Tender reference *
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.tender_reference}
                    onChange={(e) =>
                      updateField("tender_reference", e.target.value)
                    }
                    placeholder="e.g. MC-2026-005"
                  />
                </label>

                <label>
                  Submission deadline *
                  <input
                    required
                    type="date"
                    value={form.deadline}
                    onChange={(e) => updateField("deadline", e.target.value)}
                  />
                </label>

                <label>
                  Estimated value (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimated_value}
                    onChange={(e) =>
                      updateField("estimated_value", e.target.value)
                    }
                    placeholder="e.g. 250000"
                  />
                </label>

                <label className="tender-description-field">
                  Description
                  <textarea
                    maxLength={5000}
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    placeholder="Describe the goods, services, or work required."
                  />
                </label>
              </div>

              <div className="tender-form-actions">
                <button
                  type="button"
                  className="cancel-tender-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-tender-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save tender"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="tender-list-panel">
          <div className="tender-list-heading">
            <div>
              <h2>All tenders</h2>
              <p>{tenders.length} saved tender(s)</p>
            </div>

            <button
              className="refresh-tenders-button"
              onClick={() => void loadTenders()}
              disabled={loading}
              aria-label="Refresh tenders"
              title="Refresh tenders"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          <div className="tender-filters">
            <div className="tender-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, organization, or reference..."
                aria-label="Search tenders"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under review</option>
              <option value="qualified">Qualified</option>
              <option value="not_qualified">Not qualified</option>
            </select>
          </div>

          {loading ? (
            <p className="tender-empty">Loading tenders...</p>
          ) : filteredTenders.length === 0 ? (
            <div className="tender-empty">
              <FileText size={30} />
              <strong>No matching tenders</strong>
              <span>Try another search or add a new tender.</span>
            </div>
          ) : (
            <div className="tender-cards">
              {filteredTenders.map((tender) => (
                <article className="tender-card" key={tender.id}>
                  <div className="tender-card-icon">
                    <FileText size={21} />
                  </div>

                  <div className="tender-card-content">
                    <div className="tender-card-title-row">
                      <h3>{tender.title}</h3>
                      <span
                        className={`explorer-status status-${tender.status}`}
                      >
                        {tender.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="tender-card-organization">
                      {tender.organization}
                    </p>

                    <div className="tender-card-details">
                      <span>
                        <strong>Reference:</strong>{" "}
                        {tender.tender_reference}
                      </span>

                      <span>
                        <strong>Deadline:</strong>{" "}
                        {formatDate(tender.deadline)}
                      </span>

                      <span>
                        <strong>Value:</strong>{" "}
                        {formatValue(tender.estimated_value)}
                      </span>
                    </div>

                    {tender.description && (
                      <p className="tender-card-description">
                        {tender.description}
                      </p>
                    )}

                    <div className="tender-upload-actions">
                      <label className="upload-pdf-button">
                        <Upload size={16} />
                        {uploadingTenderId === tender.id
                          ? "Uploading..."
                          : "Upload PDF"}

                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          disabled={uploadingTenderId !== null}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            void handleFileUpload(tender.id, file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
