import { createServer } from "node:http";
import { Server } from "socket.io";
import { isSessionCode, type ClientToServerEvents, type ServerToClientEvents } from "@screenshare/shared";
import { RateLimiter } from "./rate-limiter.js";
import { MAX_VIEWERS, SessionStore } from "./session-store.js";

const store = new SessionStore();
const rateLimiter = new RateLimiter();
const allowedOrigin = process.env.WEB_ORIGIN ?? "*";
const socketPath = process.env.VERCEL ? "/api/socket.io" : "/socket.io";
const httpServer = createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Headers", "content-type");
  if (request.method === "OPTIONS") { response.writeHead(204).end(); return; }
  const url = new URL(request.url ?? "/", "http://localhost");
  const ip = request.socket.remoteAddress ?? "unknown";
  if (request.method === "POST" && url.pathname === "/api/sessions") {
    const created = store.create();
    json(response, 201, created); return;
  }
  const match = url.pathname.match(/^\/api\/sessions\/([A-Z0-9]{10})\/validate$/);
  if (request.method === "POST" && match) {
    if (!rateLimiter.allow(ip)) { json(response, 429, { error: "Muitas tentativas. Aguarde um minuto." }); return; }
    const session = store.validate(match[1]);
    json(response, session ? 200 : 404, session ?? { error: "Sessão indisponível." }); return;
  }
  json(response, 404, { error: "Não encontrado." });
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, { path: socketPath, cors: { origin: allowedOrigin, methods: ["GET", "POST"] } });
io.use((socket, next) => {
  const code = typeof socket.handshake.auth.code === "string" ? socket.handshake.auth.code : "";
  const token = typeof socket.handshake.auth.presenterToken === "string" ? socket.handshake.auth.presenterToken : "";
  if (token && store.authenticatePresenter(code, token)) socket.data.role = "presenter";
  else socket.data.role = "viewer";
  socket.data.code = code;
  next();
});
io.on("connection", (socket) => {
  const isPresenter = () => socket.data.role === "presenter";
  const sessionForPresenter = () => isPresenter() ? store.get(socket.data.code) : undefined;
  socket.on("session:join", (code, callback) => {
    if (!isSessionCode(code) || !rateLimiter.allow(socket.handshake.address)) { callback({ ok: false, error: "Sessão indisponível." }); return; }
    const session = store.validate(code);
    if (!session) { callback({ ok: false, error: "Sessão indisponível." }); return; }
    socket.data.code = code; socket.join(`session:${code}`);
    const raw = store.get(code)!;
    if (isPresenter()) { raw.presenterSocketId = socket.id; raw.presenterHasConnected = true; raw.presenterDisconnectedAt = undefined; }
    else { if (raw.viewerSocketIds.size >= MAX_VIEWERS) { socket.leave(`session:${code}`); callback({ ok: false, error: "A sessão atingiu o limite de espectadores." }); return; } raw.viewerSocketIds.add(socket.id); io.to(`session:${code}`).emit("session:viewers", raw.viewerSocketIds.size); if (raw.presenterSocketId) io.to(raw.presenterSocketId).emit("viewer:joined", socket.id); }
    callback({ ok: true, session });
  });
  socket.on("stream:start", (callback) => { const s = sessionForPresenter(); if (!s) { callback({ ok: false, error: "Não autorizado." }); return; } s.state = "streaming"; io.to(`session:${s.code}`).emit("session:state", store.public(s)); for (const viewerId of s.viewerSocketIds) socket.emit("viewer:joined", viewerId); callback({ ok: true }); });
  socket.on("stream:stop", () => { const s = sessionForPresenter(); if (!s) return; s.state = "paused"; io.to(`session:${s.code}`).emit("stream:stopped"); io.to(`session:${s.code}`).emit("session:state", store.public(s)); });
  socket.on("session:end", () => { const s = sessionForPresenter(); if (!s) return; store.end(s); io.to(`session:${s.code}`).emit("session:ended", "presenter"); });
  socket.on("webrtc:offer", (target, description) => relay(socket, target, "webrtc:offer", description));
  socket.on("webrtc:answer", (target, description) => relay(socket, target, "webrtc:answer", description));
  socket.on("webrtc:ice-candidate", (target, candidate) => relay(socket, target, "webrtc:ice-candidate", candidate));
  socket.on("disconnect", () => { const s = store.get(socket.data.code); if (!s) return; if (isPresenter()) { s.presenterSocketId = undefined; s.presenterDisconnectedAt = Date.now(); } else { s.viewerSocketIds.delete(socket.id); io.to(`session:${s.code}`).emit("session:viewers", s.viewerSocketIds.size); } });
});
function relay(socket: typeof io.sockets.sockets extends Map<string, infer T> ? T : never, target: string, event: "webrtc:offer" | "webrtc:answer" | "webrtc:ice-candidate", payload: RTCSessionDescriptionInit | RTCIceCandidateInit): void {
  const recipient = io.sockets.sockets.get(target);
  if (!recipient || recipient.data.code !== socket.data.code) return;
  if (event === "webrtc:offer" && (socket.data.role !== "presenter" || recipient.data.role !== "viewer")) return;
  if (event === "webrtc:answer" && (socket.data.role !== "viewer" || recipient.data.role !== "presenter")) return;
  if (event === "webrtc:ice-candidate" && socket.data.role === recipient.data.role) return;
  if (event === "webrtc:offer") recipient.emit(event, socket.id, payload as RTCSessionDescriptionInit);
  else if (event === "webrtc:answer") recipient.emit(event, socket.id, payload as RTCSessionDescriptionInit);
  else recipient.emit(event, socket.id, payload as RTCIceCandidateInit);
}
function json(response: import("node:http").ServerResponse, status: number, value: unknown): void { response.writeHead(status, { "Content-Type": "application/json" }); response.end(JSON.stringify(value)); }
setInterval(() => { for (const code of store.prune()) io.to(`session:${code}`).emit("session:ended", "expired"); }, 5_000).unref();
const port = Number(process.env.PORT ?? 3001);
httpServer.listen(port, () => console.info(`Signalling server running on :${port}`));
