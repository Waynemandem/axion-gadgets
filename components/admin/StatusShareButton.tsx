"use client";

import { useState } from "react";

type Props = {
  product: {
    name: string;
    slug: string;
    price: number;
    condition: string;
    image: string | null;
  };
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

async function buildImage(p: Props["product"]) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const font = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#d9e9ff");
  bg.addColorStop(1, "#f6f9fe");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#0b1220";
  ctx.font = `800 64px ${font}`;
  ctx.fillText("Axion Gadgets", W / 2, 190);
  ctx.fillStyle = "#1677ff";
  ctx.font = `700 32px ${font}`;
  ctx.fillText("ORIGINAL · TESTED · 7-DAY WARRANTY", W / 2, 250);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(60, 320, 960, 1300, 56);
  ctx.fill();

  const px = 100;
  const py = 360;
  const pw = 880;
  const ph = 880;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 40);
  ctx.clip();
  if (p.image) {
    const img = await loadImage(p.image);
    const scale = Math.max(pw / img.width, ph / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, px + (pw - w) / 2, py + (ph - h) / 2, w, h);
  } else {
    ctx.fillStyle = "#e6f0ff";
    ctx.fillRect(px, py, pw, ph);
  }
  ctx.restore();

  // Condition badge
  const badge = p.condition === "used" ? "USED" : "NEW";
  ctx.fillStyle = "#f5a524";
  ctx.beginPath();
  ctx.roundRect(130, 390, 190, 70, 35);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 36px ${font}`;
  ctx.fillText(badge, 225, 438);

  // Name and price
  ctx.textAlign = "left";
  ctx.fillStyle = "#0b1220";
  ctx.font = `800 62px ${font}`;
  const lines = wrap(ctx, p.name, 880, 2);
  let y = 1330;
  for (const line of lines) {
    ctx.fillText(line, 100, y);
    y += 76;
  }
  ctx.fillStyle = "#1677ff";
  ctx.font = `800 96px ${font}`;
  ctx.fillText(`₦${p.price.toLocaleString("en-NG")}`, 100, y + 50);

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#64748b";
  ctx.font = `600 38px ${font}`;
  ctx.fillText("Pickup in Ikeja or delivery · Pay securely online", W / 2, 1740);
  ctx.fillStyle = "#0b1220";
  ctx.font = `800 46px ${font}`;
  ctx.fillText(window.location.host, W / 2, 1815);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );
  if (!blob) throw new Error("Could not create image");
  return blob;
}

export default function StatusShareButton({ product }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function share() {
    setBusy(true);
    setMsg(null);
    try {
      const blob = await buildImage(product);
      const file = new File([blob], `${product.slug}.jpg`, {
        type: "image/jpeg",
      });
      const url = `${window.location.origin}/products/${product.slug}`;
      const text = `${product.name} - ₦${product.price.toLocaleString(
        "en-NG"
      )}\nOrder here: ${url}`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        setMsg("In WhatsApp, choose My status.");
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${product.slug}.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        setMsg("Image saved. Open WhatsApp, then Status, and add it from your gallery.");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setMsg(null);
      } else {
        setMsg("Could not create the image. Check the product photo and try again.");
      }
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={share}
        disabled={busy}
        className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 disabled:opacity-40"
      >
        {busy ? "Preparing..." : "Share to WhatsApp Status"}
      </button>
      {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
    </div>
  );
}