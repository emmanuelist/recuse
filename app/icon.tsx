import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", background: "#08090B",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 999, border: "2.5px solid #FF5A45",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 15, height: 2.5, background: "#FF5A45" }} />
        </div>
      </div>
    ),
    size,
  );
}
