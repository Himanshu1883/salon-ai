"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  uploadEmployeeDocument,
  removeEmployeeDocument,
} from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Upload,
  ExternalLink,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import {
  EmployeeOtherDocument,
  formatDocumentLabel,
  getEmployeeDocumentUrl,
} from "@/lib/employee";

type DocumentFields = {
  aadharDocumentUrl: string | null;
  panDocumentUrl: string | null;
  offerLetterUrl: string | null;
  otherDocuments: EmployeeOtherDocument[];
};

function DocumentRow({
  label,
  url,
  canEdit,
  onUpload,
  onRemove,
  uploading,
}: {
  label: string;
  url: string | null;
  canEdit: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const publicUrl = getEmployeeDocumentUrl(url);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        {publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#6C3BFF] hover:underline"
          >
            {url ? formatDocumentLabel(url) : "View document"}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="mt-0.5 text-xs text-stone-400">Not uploaded</p>
        )}
      </div>
      {canEdit && (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="border-violet-200 text-[#6C3BFF] hover:bg-violet-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {url ? "Replace" : "Upload"}
          </Button>
          {url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={onRemove}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function MemberDocumentsSection({
  memberId,
  fields,
  canEdit,
}: {
  memberId: string;
  fields: DocumentFields;
  canEdit: boolean;
}) {
  const router = useRouter();
  const otherInputRef = useRef<HTMLInputElement>(null);
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showAddOther, setShowAddOther] = useState(false);
  const [otherName, setOtherName] = useState("");

  async function handleUpload(
    kind: "aadhar" | "pan" | "offerLetter" | "other",
    file: File,
    documentName?: string
  ) {
    setUploadingKind(kind);
    setError("");

    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("file", file);
    if (documentName) formData.set("documentName", documentName);

    const result = await uploadEmployeeDocument(memberId, formData);
    setUploadingKind(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (kind === "other") {
      setShowAddOther(false);
      setOtherName("");
    }
    router.refresh();
  }

  async function handleRemove(
    kind: "aadhar" | "pan" | "offerLetter" | "other",
    documentUrl?: string
  ) {
    setUploadingKind(`remove-${kind}`);
    setError("");

    const formData = new FormData();
    formData.set("kind", kind);
    if (documentUrl) formData.set("documentUrl", documentUrl);

    const result = await removeEmployeeDocument(memberId, formData);
    setUploadingKind(null);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="rounded-2xl border-violet-100 shadow-sm">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C3BFF]/10">
            <FileText className="h-5 w-5 text-[#6C3BFF]" />
          </div>
          <div>
            <CardTitle className="text-lg text-stone-900">Documents</CardTitle>
            <CardDescription>
              Aadhar, PAN, offer letter, and other HR documents
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <DocumentRow
          label="Aadhar card"
          url={fields.aadharDocumentUrl}
          canEdit={canEdit}
          uploading={uploadingKind === "aadhar"}
          onUpload={(file) => handleUpload("aadhar", file)}
          onRemove={() => handleRemove("aadhar")}
        />
        <DocumentRow
          label="PAN card"
          url={fields.panDocumentUrl}
          canEdit={canEdit}
          uploading={uploadingKind === "pan"}
          onUpload={(file) => handleUpload("pan", file)}
          onRemove={() => handleRemove("pan")}
        />
        <DocumentRow
          label="Offer letter"
          url={fields.offerLetterUrl}
          canEdit={canEdit}
          uploading={uploadingKind === "offerLetter"}
          onUpload={(file) => handleUpload("offerLetter", file)}
          onRemove={() => handleRemove("offerLetter")}
        />

        {fields.otherDocuments.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Other documents
            </p>
            {fields.otherDocuments.map((doc) => (
              <div
                key={doc.url}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-800">{doc.name}</p>
                  <a
                    href={getEmployeeDocumentUrl(doc.url) ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#6C3BFF] hover:underline"
                  >
                    {formatDocumentLabel(doc.url)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingKind === `remove-other-${doc.url}`}
                    onClick={() => handleRemove("other", doc.url)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {canEdit && (
          <div className="pt-2">
            {!showAddOther ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddOther(true)}
                className="border-violet-200 text-[#6C3BFF] hover:bg-violet-50"
              >
                <Plus className="h-4 w-4" />
                Add document
              </Button>
            ) : (
              <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="otherDocName">Document name</Label>
                  <Input
                    id="otherDocName"
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder="e.g. Appointment letter, ID proof"
                  />
                </div>
                <input
                  ref={otherInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && otherName.trim()) {
                      handleUpload("other", file, otherName.trim());
                    } else if (file && !otherName.trim()) {
                      setError("Enter a document name first");
                    }
                    e.target.value = "";
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={!otherName.trim() || uploadingKind === "other"}
                    onClick={() => otherInputRef.current?.click()}
                  >
                    {uploadingKind === "other" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Choose file
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddOther(false);
                      setOtherName("");
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!canEdit && (
          <p className="text-xs text-stone-400">
            Only owners and managers can upload or edit documents.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
