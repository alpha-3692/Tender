from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database.session import get_db
from models.document import DocumentModel
from models.tender import TenderModel
from models.user import UserModel
from routers.auth import get_current_user

router = APIRouter(prefix="/api/v1", tags=["Documents"])

STORAGE_DIR = (
    Path(__file__).resolve().parents[1]
    / "storage"
    / "tender_documents"
)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def get_company_tender(
    tender_id: int,
    db: Session,
    current_user: UserModel,
) -> TenderModel:
    """Return a tender only when it belongs to the user's company."""
    tender = (
        db.query(TenderModel)
        .filter(
            TenderModel.id == tender_id,
            TenderModel.company_name == current_user.company_name,
        )
        .first()
    )

    if tender is None:
        # Do not reveal whether another company's tender exists.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found.",
        )

    return tender


@router.post(
    "/tenders/{tender_id}/documents",
    status_code=status.HTTP_201_CREATED,
)
async def upload_tender_document(
    tender_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    # Verify ownership before accepting a document.
    get_company_tender(tender_id, db, current_user)

    original_filename = Path(file.filename or "").name

    if Path(original_filename).suffix.lower() != ".pdf":
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed.",
        )

    # Read at most 10 MB plus one byte to detect oversized uploads.
    content = await file.read(MAX_FILE_SIZE + 1)
    await file.close()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="The PDF must be 10 MB or smaller.",
        )

    # Check the PDF signature, not just the filename.
    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The file does not appear to be a valid PDF.",
        )

    STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    # Generate a safe internal filename.
    stored_filename = f"{uuid4().hex}.pdf"
    file_path = STORAGE_DIR / stored_filename

    document = DocumentModel(
        tender_id=tender_id,
        original_filename=original_filename[:255],
        stored_filename=stored_filename,
        file_size=len(content),
    )

    try:
        file_path.write_bytes(content)
        db.add(document)
        db.commit()
        db.refresh(document)
    except Exception:
        db.rollback()
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save the document.",
        )

    return {
        "message": "PDF uploaded successfully.",
        "document": {
            "id": document.id,
            "tender_id": document.tender_id,
            "original_filename": document.original_filename,
            "file_size": document.file_size,
            "uploaded_at": document.uploaded_at,
        },
    }


@router.get("/tenders/{tender_id}/documents")
def list_tender_documents(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    get_company_tender(tender_id, db, current_user)

    documents = (
        db.query(DocumentModel)
        .filter(DocumentModel.tender_id == tender_id)
        .order_by(DocumentModel.id.desc())
        .all()
    )

    return [
        {
            "id": doc.id,
            "tender_id": doc.tender_id,
            "original_filename": doc.original_filename,
            "file_size": doc.file_size,
            "uploaded_at": doc.uploaded_at,
        }
        for doc in documents
    ]


@router.get("/documents")
def list_all_documents(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    documents = (
        db.query(
            DocumentModel,
            TenderModel.title,
            TenderModel.tender_reference,
        )
        .join(
            TenderModel,
            DocumentModel.tender_id == TenderModel.id,
        )
        .filter(
            TenderModel.company_name == current_user.company_name
        )
        .order_by(DocumentModel.id.desc())
        .all()
    )

    return [
        {
            "id": document.id,
            "tender_id": document.tender_id,
            "original_filename": document.original_filename,
            "file_size": document.file_size,
            "uploaded_at": document.uploaded_at,
            "tender_title": tender_title,
            "tender_reference": tender_reference,
        }
        for document, tender_title, tender_reference in documents
    ]


@router.get("/documents/{document_id}/file")
def get_document_file(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    # Join through the tender to enforce company ownership.
    result = (
        db.query(DocumentModel)
        .join(
            TenderModel,
            DocumentModel.tender_id == TenderModel.id,
        )
        .filter(
            DocumentModel.id == document_id,
            TenderModel.company_name == current_user.company_name,
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    file_path = STORAGE_DIR / result.stored_filename

    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The PDF file could not be found on the server.",
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=result.original_filename,
        content_disposition_type="attachment",
    )
