"use client";

import { useRef, useState, useTransition } from "react";

const MAX_BYTES = 10 * 1024 * 1024;

interface DropzoneProps<T> {
  action: (formData: FormData) => Promise<{ data?: T; error?: string }>;
  onExtracted: (data: T) => void;
  label: string;
  pendingLabel: string;
}

export function Dropzone<T>({ action, onExtracted, label, pendingLabel }: DropzoneProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [pending, startTransition] = useTransition();

  function handle(file: File | undefined) {
    if (!file || pending) return;
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      setError("El archivo debe ser un PDF o una imagen.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("El archivo excede 10 MB.");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const { data, error } = await action(formData);
      if (error) setError(error);
      else if (data) onExtracted(data);
    });
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={pending}
        onClick={() => !pending && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !pending) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handle(e.dataTransfer.files[0]);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed border-black px-4 py-5 text-center text-sm font-semibold text-carbon transition focus:ring-[3px] focus:ring-guajillo/18 focus:outline-none ${over ? "bg-mostaza-tinta" : "bg-white"} ${pending ? "cursor-not-allowed opacity-60" : ""}`}
      >
        {label}
        <span className="mt-1 block text-xs font-medium text-carbon/60">PDF o imagen, hasta 10 MB</span>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          hidden
          onChange={(e) => {
            handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p aria-live="polite" className={`mt-2 text-sm font-medium ${error ? "text-guajillo" : "text-carbon/70"}`}>
        {pending ? pendingLabel : error}
      </p>
    </div>
  );
}
