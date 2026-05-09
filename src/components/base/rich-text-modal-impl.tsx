"use client";

import { useState, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import InlineCode from "@editorjs/inline-code";
import Delimiter from "@editorjs/delimiter";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Spinner from "../ui/spinner";

interface RichTextDialogProps {
  initialData?: any;
  open: boolean;
  triggerSize?: "sm" | "default" | "lg" | "icon";
  showTrigger?: boolean;
  isSaving?: boolean;
  triggerText?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  classNames?: {
    trigger?: string;
  };
}

export function RichTextDialog({
  title = "Product Description",
  description,
  showTrigger,
  triggerText,
  triggerSize,
  initialData,
  classNames,
  isSaving,
  open,
  onOpenChange,
  placeholder = "Write your description here...",
  onSave,
}: RichTextDialogProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize editor
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!isMounted || !open) return;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        tools: {
          header: {
            class: Header as any,
            config: {
              placeholder: "Enter a header",
              levels: [2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: List,
          paragraph: {
            class: Paragraph as any,
            inlineToolbar: true,
          },
          inlineCode: {
            class: InlineCode,
            shortcut: "CMD+SHIFT+C",
          },
          delimiter: Delimiter,
        },
        data: initialData || { blocks: [] },
        placeholder,
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isMounted, open, initialData]);

  const handleSave = async () => {
    if (!editorRef.current) return;

    try {
      const savedData = await editorRef.current.save();

      await onSave(savedData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button
            className={cn(
              "font-semibold w-full md:max-w-sm",
              classNames?.trigger,
            )}
            disabled={false}
            size={triggerSize}
          >
            {triggerText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl sm:max-w-3xl max-h-[81svh] sm:max-h-[85svh] w-full md:max-h-[90svh] pb-4 flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <div
            className=" w-full bg-slate-50/40 rounded-md px-4 py-2  overflow-y-scroll"
            id="editorjs"
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isSaving}
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? (
              <span className="flex items-center gap-1 ">
                <Spinner color="white" size={"sm"} /> Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
