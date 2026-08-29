import { ImageResponse } from "next/og";

export const alt = "Recuse. An agent may draft and prove. It may never authorize.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated, not sourced. The product's claim is that nothing here is
 * fabricated, so its social card is drawn from the same mark the app uses.
 *
 * Satori does not support SVG <text>, so the seal is built from bordered
 * elements with real text nodes rather than from an inline SVG.
 */
export default function OG() {
  const seal = "#FF5A45";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", background: "#08090B",
          padding: 76, alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 44 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 999, border: `2px solid ${seal}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 16, height: 2, background: seal }} />
            </div>
            <div style={{ color: "#F4F5F7", fontSize: 25, fontWeight: 500 }}>Recuse</div>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", color: "#F4F5F7",
            fontSize: 56, lineHeight: 1.1, letterSpacing: -2.2, fontWeight: 500,
          }}>
            <div>An agent may draft and prove.</div>
            <div style={{ color: seal }}>It may never authorize.</div>
          </div>
          <div style={{ marginTop: 34, color: "#8A8F98", fontSize: 22, lineHeight: 1.5 }}>
            The refusal is enforced by the tool, not by a prompt.
          </div>
        </div>

        <div style={{
          width: 300, height: 300, borderRadius: 999, border: `3px solid ${seal}`,
          display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-6deg)",
        }}>
          <div style={{
            width: 214, height: 214, borderRadius: 999, border: `1px solid ${seal}`,
            opacity: 0.55, display: "flex", alignItems: "center", justifyContent: "center",
          }} />
          <div style={{
            position: "absolute", display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ width: 168, height: 1, background: seal, opacity: 0.5 }} />
            <div style={{ color: seal, fontSize: 40, fontWeight: 600, padding: "10px 0" }}>MAY NOT</div>
            <div style={{ color: seal, fontSize: 15, letterSpacing: 6 }}>SIGN</div>
            <div style={{ width: 168, height: 1, background: seal, opacity: 0.5, marginTop: 12 }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
