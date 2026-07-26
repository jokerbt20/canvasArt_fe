import { useRef, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

interface ImageDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  existingPreviewUrls?: string[];
  multiple?: boolean;
  accept?: string;
}

export function ImageDropzone({ files, onChange, existingPreviewUrls = [], multiple = false, accept = "image/*" }: ImageDropzoneProps) {
  const { t } = useTranslation("admin");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const previews = files.map((f) => URL.createObjectURL(f));
  const allPreviews = [...existingPreviewUrls, ...previews];

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    onChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        sx={{
          border: "2px dashed",
          borderColor: dragOver ? "primary.main" : "divider",
          bgcolor: dragOver ? "rgba(184,150,90,0.08)" : "transparent",
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 200ms ease",
        }}
      >
        <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: "text.secondary", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {t("form.dragDropHint")}
        </Typography>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </Box>

      {allPreviews.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2 }}>
          {allPreviews.map((src, i) => (
            <Box key={src} sx={{ position: "relative", width: 84, height: 84 }}>
              <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i >= existingPreviewUrls.length && (
                <IconButton
                  size="small"
                  onClick={() => removeAt(i - existingPreviewUrls.length)}
                  sx={{ position: "absolute", top: -8, right: -8, bgcolor: "background.paper", boxShadow: 1, "&:hover": { bgcolor: "background.paper" } }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
