"use client";

import dynamic from "next/dynamic";

import type { ComponentProps } from "react";

import type { RichTextDialog as RichTextDialogImpl } from "./rich-text-modal-impl";

const RichTextModal = dynamic(
  () =>
    import("./rich-text-modal-impl").then((m) => m.RichTextDialog),
  {
    ssr: false,
    loading: () => null,
  },
);

export default RichTextModal;
export type RichTextModalProps = ComponentProps<typeof RichTextDialogImpl>;
