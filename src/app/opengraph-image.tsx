import { ImageResponse } from "next/og";
import { pandaDataUri } from "@/lib/panda-svg";
import { PALETTE } from "@/lib/theme";

export const alt = "PandaGame · Aprende pandas jugando";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          background: PALETTE.paper,
          borderBottom: `24px solid ${PALETTE.ink}`,
        }}
      >
        <img src={pandaDataUri()} width={300} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: PALETTE.sealInk, fontWeight: 700 }}>
            30 retos · tutorial completo
          </div>
          <div style={{ fontSize: 112, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.05 }}>PandaGame</div>
          <div style={{ fontSize: 40, color: PALETTE.ink2, marginTop: 12 }}>Aprende pandas jugando, en tu navegador.</div>
        </div>
      </div>
    ),
    size,
  );
}
