import React from "react";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSignNda } from "@/lib/hooks/useDealroomQueries";

function NDAOverlay({ room, currentUserId, onSign }) {
  const [agreed, setAgreed] = useState(false);
  const { mutateAsync: signNda, isPending } = useSignNda();

  const handleSign = async () => {
    if (!agreed || isPending) return;
    await signNda({ roomId: room.roomId || room.id });
    onSign?.();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header bar */}
          <div className="bg-amber-500 px-6 py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                Confidentiality Agreement Required
              </p>
              <p className="text-white/80 text-xs mt-0.5">
                You must sign before accessing this deal room
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Room name */}
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Deal Room:{" "}
                <span className="font-semibold text-foreground">
                  {room.roomName}
                </span>
              </p>
            </div>

            {/* Terms */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">
                By signing, you agree to:
              </p>
              <ul className="space-y-2.5">
                {[
                  "Keep all information strictly confidential and not disclose it to any third party",
                  "Not copy, share, or distribute any documents shared in this room outside the platform",
                  "Use all communications solely for the purposes of this deal",
                  "Accept that unauthorized disclosure may result in legal consequences",
                ].map((term, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 h-4 w-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group"  onClick={() => setAgreed((v) => !v)}>
              <div
                className={cn(
                  "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                  agreed
                    ? "bg-stp-blue-light border-stp-blue-light"
                    : "border-border group-hover:border-stp-blue-light/50",
                )}
               
              >
                {agreed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
              </div>
              <span className="text-sm text-foreground leading-snug">
                I have read and fully understand this confidentiality agreement
                and agree to be legally bound by its terms.
              </span>
            </label>

            {/* CTA */}
            <Button
              className="w-full rounded-xl py-5 bg-stp-blue-light hover:bg-stp-blue-light/90 text-white font-semibold gap-2 disabled:opacity-50"
              disabled={!agreed || isPending}
              onClick={handleSign}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Sign & Enter Deal Room
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your signature is timestamped and recorded in the audit log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NDAOverlay;
