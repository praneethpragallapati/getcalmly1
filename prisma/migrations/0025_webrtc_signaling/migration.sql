-- Durable, cross-instance WebRTC signaling relay. In-memory signaling can't work
-- on serverless (each participant hits a different instance), so the tiny SDP/ICE
-- handshake is relayed through this shared table. Swept by TTL; no media stored.
CREATE TABLE IF NOT EXISTS "WebrtcSignal" (
  "seq"       SERIAL NOT NULL,
  "roomId"    TEXT NOT NULL,
  "peerId"    TEXT NOT NULL,
  "kind"      TEXT NOT NULL,
  "data"      JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebrtcSignal_pkey" PRIMARY KEY ("seq")
);
CREATE INDEX IF NOT EXISTS "WebrtcSignal_roomId_seq_idx" ON "WebrtcSignal"("roomId", "seq");
CREATE INDEX IF NOT EXISTS "WebrtcSignal_createdAt_idx" ON "WebrtcSignal"("createdAt");
