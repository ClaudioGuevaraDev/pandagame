import { ImageResponse } from "next/og";
import { pandaDataUri } from "@/lib/panda-svg";
import { PALETTE } from "@/lib/theme";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: PALETTE.paper }}>
        <img src={pandaDataUri()} width={140} height={140} alt="" />
      </div>
    ),
    size,
  );
}
