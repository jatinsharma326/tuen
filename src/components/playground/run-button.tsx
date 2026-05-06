"use client";

import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function RunButton({ loading, disabled, onClick }: Props) {
  return (
    <Button
      size="lg"
      className="w-full"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Running...
        </>
      ) : (
        <>
          <Play size={16} />
          Run
        </>
      )}
    </Button>
  );
}
