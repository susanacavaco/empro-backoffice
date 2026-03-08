import { useState, useEffect } from "react";
import {
  Home, Package, ShoppingBag, Users, BarChart2, Settings,
  LogOut, Bell, Search, Plus, Edit2, Trash2, CheckCircle,
  Clock, AlertCircle, TrendingUp, Euro, ChevronDown,
  ChevronRight, X, Check, Filter, Download, RefreshCw,
  Tag, Truck, Eye, MapPin, Phone, Building2, Mail,
  ArrowUp, ArrowDown, Upload, FileText, FileSpreadsheet
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";

/* ── Firebase ── */
const firebaseConfig = {
  apiKey: "AIzaSyDNj0GlusY9akmJsDL4gmWfwXEKkyKStYI",
  authDomain: "empro-plataforma.firebaseapp.com",
  projectId: "empro-plataforma",
  storageBucket: "empro-plataforma.firebasestorage.app",
  messagingSenderId: "1019620030255",
  appId: "1:1019620030255:web:45d823642969d12a3313da",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/* ── Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap";
document.head.appendChild(fontLink);

/* ── Tokens ── */
const T = {
  navy: "#13294B", navyD: "#0a1a30", navyL: "#1e3d6e",
  red: "#E73C3E", redL: "#ff6b6d",
  bg: "#F5F4F0", bgWarm: "#FDFCF8",
  white: "#ffffff",
  text: "#1a2744", muted: "#7a8ba8", mutedL: "#b0bdd0",
  border: "#E2DDD6",
  green: "#1aab6d", orange: "#f59e0b", blue: "#3b82f6",
  sidebar: "#0f2240",
};
const S = {
  font: "'DM Sans', sans-serif",
  display: "'Playfair Display', Georgia, serif",
};

function fmt(n) {
  if (n === undefined || n === null) return "0,00";
  return Number(n).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Badge({ children, color, small }) {
  return (
    <span style={{ background: color + "22", color, padding: small ? "2px 8px" : "4px 12px", borderRadius: 20, fontSize: small ? 10 : 11, fontWeight: 700, fontFamily: "monospace", letterSpacing: 0.4, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, full, disabled }) {
  const styles = {
    primary: { bg: T.red, color: "white", border: "none" },
    secondary: { bg: "white", color: T.navy, border: `1px solid ${T.border}` },
    ghost: { bg: "transparent", color: T.muted, border: "none" },
    navy: { bg: T.navy, color: "white", border: "none" },
    green: { bg: T.green, color: "white", border: "none" },
  };
  const sizes = { sm: "7px 12px", md: "10px 18px", lg: "13px 24px" };
  const st = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: st.bg, color: st.color, border: st.border,
      padding: sizes[size], borderRadius: 9, fontSize: size === "sm" ? 12 : 13,
      fontWeight: 600, fontFamily: S.font, cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1,
      width: full ? "100%" : "auto", justifyContent: "center", transition: "all .15s",
    }}>
      {Icon && <Icon size={size === "sm" ? 12 : 14} />}{children}
    </button>
  );
}

/* ══════════════════════════════════════
   ECRÃ: ENCOMENDAS (Firebase real-time)
══════════════════════════════════════ */
function EcrãEncomendas() {
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [search, setSearch] = useState("");
  const [atualizando, setAtualizando] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "encomendas"), orderBy("criadoEm", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEncomendas(docs);
      setLoading(false);
    }, (err) => {
      console.error("Firebase error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const atualizarEstado = async (id, novoEstado) => {
    setAtualizando(id);
    try {
      await updateDoc(doc(db, "encomendas", id), { estado: novoEstado });
    } catch (e) {
      console.error("Erro ao atualizar:", e);
    }
    setAtualizando(null);
  };

  const estadoCor = { pendente: T.orange, confirmada: T.blue, em_entrega: T.navy, entregue: T.green, cancelada: T.red };
  const estadoLabel = { pendente: "Pendente", confirmada: "Confirmada", em_entrega: "Em Entrega", entregue: "Entregue", cancelada: "Cancelada" };
  const estadoProx = { pendente: "confirmada", confirmada: "em_entrega", em_entrega: "entregue" };

  const filtered = encomendas.filter(e => {
    const matchFiltro = filtro === "todas" || e.estado === filtro;
    const matchSearch = !search || (e.cliente || "").toLowerCase().includes(search.toLowerCase()) || (e.nif || "").includes(search);
    return matchFiltro && matchSearch;
  });

  const totalPendente = encomendas.filter(e => e.estado === "pendente").reduce((s, e) => s + (e.total || 0), 0);
  const totalHoje = encomendas.filter(e => {
    if (!e.criadoEm) return false;
    const d = e.criadoEm.toDate ? e.criadoEm.toDate() : new Date(e.criadoEm);
    return d.toDateString() === new Date().toDateString();
  }).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>Loja B2B</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: T.navy, fontFamily: S.display }}>Encomendas</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {loading && <div style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 6 }}><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />A sincronizar...</div>}
          <div style={{ background: `${T.green}18`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>Tempo real</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Encomendas", value: encomendas.length, icon: ShoppingBag, color: T.navy, sub: "histórico total" },
          { label: "Hoje", value: totalHoje, icon: Clock, color: T.blue, sub: "novas hoje" },
          { label: "Pendentes", value: encomendas.filter(e => e.estado === "pendente").length, icon: AlertCircle, color: T.orange, sub: "aguardam confirmação" },
          { label: "Valor Pendente", value: `€${fmt(totalPendente)}`, icon: Euro, color: T.red, sub: "por processar" },
        ].map((k, i) => {
          const KIcon = k.icon;
          return (
            <div key={i} style={{ background: T.white, borderRadius: 14, padding: "18px 20px", border: `1px solid ${T.border}`, borderTop: `3px solid ${k.color}` }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <KIcon size={16} color={k.color} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: k.color, fontFamily: S.display }}>{k.value}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{k.label}</div>
              <div style={{ fontSize: 10, color: T.mutedL }}>{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Filtros + Pesquisa */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["todas", "pendente", "confirmada", "em_entrega", "entregue"].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              padding: "7px 14px", borderRadius: 20, border: `1px solid ${filtro === f ? T.navy : T.border}`,
              background: filtro === f ? T.navy : T.white, color: filtro === f ? "white" : T.muted,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: S.font,
            }}>
              {f === "todas" ? `Todas (${encomendas.length})` : estadoLabel[f]}
              {f !== "todas" && ` (${encomendas.filter(e => e.estado === f).length})`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.white, border: `1px solid ${T.border}`, borderRadius: 9, padding: "8px 12px" }}>
          <Search size={13} color={T.muted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar cliente ou NIF..." style={{ border: "none", outline: "none", fontSize: 13, color: T.text, width: 200, background: "transparent", fontFamily: S.font }} />
          {search && <X size={12} color={T.muted} style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>
          <RefreshCw size={32} color={T.border} style={{ margin: "0 auto 12px", display: "block", animation: "spin 1s linear infinite" }} />
          <div>A carregar encomendas do Firebase...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>
          <ShoppingBag size={48} color={T.border} style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontSize: 16 }}>{encomendas.length === 0 ? "Ainda sem encomendas da loja." : "Nenhuma encomenda encontrada."}</div>
          {encomendas.length === 0 && <div style={{ fontSize: 13, marginTop: 6 }}>Quando um cliente confirmar na loja B2B, aparece aqui automaticamente.</div>}
        </div>
      ) : (
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 70px 110px 130px 110px 40px", padding: "10px 20px", background: T.bg, borderBottom: `1px solid ${T.border}` }}>
            {["Cliente", "Data", "Arts.", "Total", "Estado", "Ação", ""].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{h}</div>
            ))}
          </div>

          {filtered.map((enc, i) => {
            const cor = estadoCor[enc.estado] || T.muted;
            const isLast = i === filtered.length - 1;
            const isExpanded = expanded === enc.id;
            const proxEstado = estadoProx[enc.estado];

            return (
              <div key={enc.id}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : enc.id)}
                  style={{ display: "grid", gridTemplateColumns: "1fr 130px 70px 110px 130px 110px 40px", padding: "14px 20px", borderBottom: `1px solid ${T.border}`, alignItems: "center", cursor: "pointer", background: isExpanded ? `${T.navy}04` : "transparent", transition: "background .1s" }}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = T.bg + "88"; }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{enc.cliente || "—"}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>NIF {enc.nif || "—"} · {enc.local || "—"}</div>
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>{fmtDate(enc.criadoEm)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{(enc.items || []).length}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.navy, fontFamily: S.display }}>€{fmt(enc.total)}</div>
                  <Badge color={cor} small>{estadoLabel[enc.estado] || enc.estado}</Badge>
                  <div onClick={e => e.stopPropagation()}>
                    {proxEstado ? (
                      <button
                        onClick={() => atualizarEstado(enc.id, proxEstado)}
                        disabled={atualizando === enc.id}
                        style={{
                          padding: "5px 10px", borderRadius: 7, border: `1px solid ${estadoCor[proxEstado]}44`,
                          background: `${estadoCor[proxEstado]}15`, color: estadoCor[proxEstado],
                          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: S.font,
                          opacity: atualizando === enc.id ? 0.5 : 1, whiteSpace: "nowrap",
                        }}
                      >
                        {atualizando === enc.id ? "..." : `→ ${estadoLabel[proxEstado]}`}
                      </button>
                    ) : enc.estado === "entregue" ? (
                      <CheckCircle size={18} color={T.green} />
                    ) : null}
                  </div>
                  <ChevronDown size={15} color={T.muted} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </div>

                {isExpanded && (
                  <div style={{ background: `${T.navy}03`, borderBottom: `1px solid ${T.border}`, padding: "20px 20px 20px 36px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "monospace" }}>Artigos</div>
                        <div style={{ background: T.white, borderRadius: 10, border: `1px solid ${T.border}`, overflow: "hidden" }}>
                          {(enc.items || []).map((item, j) => (
                            <div key={j} style={{ display: "grid", gridTemplateColumns: "1fr 50px 80px 80px", padding: "10px 14px", borderBottom: j < enc.items.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{item.nome}</div>
                                <div style={{ fontSize: 10, color: T.muted, fontFamily: "monospace" }}>{item.ref} · {item.unidade}</div>
                              </div>
                              <div style={{ fontSize: 13, color: T.muted }}>×{item.qty}</div>
                              <div style={{ fontSize: 11, color: T.muted }}>€{fmt(item.precoUnit)}/un</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>€{fmt(item.total)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "monospace" }}>Resumo</div>
                        <div style={{ background: T.white, borderRadius: 10, border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 12 }}>
                          {[["Subtotal s/ IVA", `€${fmt(enc.subtotal)}`], ["IVA", `€${fmt(enc.iva)}`]].map(([l, v]) => (
                            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                              <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
                              <span style={{ fontSize: 12, color: T.navy }}>{v}</span>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `2px solid ${T.border}`, marginTop: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Total c/ IVA</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: T.red, fontFamily: S.display }}>€{fmt(enc.total)}</span>
                          </div>
                        </div>
                        <div style={{ background: T.white, borderRadius: 10, border: `1px solid ${T.border}`, padding: "12px 14px", marginBottom: 12 }}>
                          <div style={{ fontSize: 12, color: T.muted }}><strong style={{ color: T.navy }}>Comercial:</strong> {enc.comercial || "—"}</div>
                          {enc.observacoes && <div style={{ fontSize: 12, color: T.muted, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.border}` }}><strong style={{ color: T.navy }}>Obs:</strong> {enc.observacoes}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {proxEstado && (
                            <Btn variant="green" size="sm" icon={Check} onClick={() => atualizarEstado(enc.id, proxEstado)} disabled={atualizando === enc.id}>
                              → {estadoLabel[proxEstado]}
                            </Btn>
                          )}
                          {enc.estado !== "cancelada" && enc.estado !== "entregue" && (
                            <Btn variant="secondary" size="sm" icon={X} onClick={() => atualizarEstado(enc.id, "cancelada")}>Cancelar</Btn>
                          )}
                          <Btn variant="secondary" size="sm" icon={Mail} onClick={() => window.open(`mailto:geral@empro.pt?subject=Encomenda ${enc.cliente}`)}>Email</Btn>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   ECRÃ: PROMOÇÕES
══════════════════════════════════ */
const PROMOS_INIT = [
  { id: 1, titulo: "Pack Verão Cerveja", desc: "Compre 5 caixas, leve 6", valor: "17% OFF", ativa: true, produto: "Cerveja", inicio: "01/06/2025", fim: "31/08/2025" },
  { id: 2, titulo: "Promoção Red Bull", desc: "Encomendas +10cx: €0.20/cx desconto", valor: "€0.20/cx", ativa: true, produto: "Energéticas", inicio: "01/05/2025", fim: "30/06/2025" },
  { id: 3, titulo: "Vinho Verde Quintas", desc: "Seleção Vinhos Verdes +50un", valor: "10% OFF", ativa: false, produto: "Vinho", inicio: "15/03/2025", fim: "30/04/2025" },
];

function EcrãPromoções() {
  const [promos, setPromos] = useState(PROMOS_INIT);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [mostraForm, setMostraForm] = useState(false);

  const toggleAtiva = (id) => setPromos(p => p.map(x => x.id === id ? { ...x, ativa: !x.ativa } : x));
  const apagar = (id) => setPromos(p => p.filter(x => x.id !== id));
  const nova = () => { setForm({ titulo: "", desc: "", valor: "", produto: "", inicio: "", fim: "", ativa: true }); setEditando("new"); setMostraForm(true); };
  const editar = (p) => { setForm({ ...p }); setEditando(p.id); setMostraForm(true); };
  const guardar = () => {
    if (editando === "new") setPromos(p => [...p, { ...form, id: Date.now() }]);
    else setPromos(p => p.map(x => x.id === editando ? { ...form, id: editando } : x));
    setMostraForm(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>Loja B2B</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: T.navy, fontFamily: S.display }}>Promoções</h1>
        </div>
        <Btn icon={Plus} onClick={nova}>Nova Promoção</Btn>
      </div>

      {mostraForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: T.white, borderRadius: 20, padding: 36, width: 480, boxShadow: "0 32px 80px rgba(0,0,0,.3)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.navy, fontFamily: S.display, marginBottom: 24 }}>{editando === "new" ? "Nova Promoção" : "Editar Promoção"}</div>
            {[
              { label: "Título", key: "titulo", ph: "Ex: Pack Verão Cerveja" },
              { label: "Descrição", key: "desc", ph: "Ex: Compre 5, leve 6" },
              { label: "Valor destaque", key: "valor", ph: "Ex: 17% OFF" },
              { label: "Produto / Família", key: "produto", ph: "Ex: Cerveja" },
              { label: "Data início", key: "inicio", ph: "DD/MM/AAAA" },
              { label: "Data fim", key: "fim", ph: "DD/MM/AAAA" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5, fontFamily: "monospace" }}>{f.label}</label>
                <input value={form[f.key] || ""} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} placeholder={f.ph}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 13, color: T.text, outline: "none", fontFamily: S.font, boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Btn onClick={guardar} full icon={Check}>Guardar</Btn>
              <Btn variant="secondary" onClick={() => setMostraForm(false)} full icon={X}>Cancelar</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 14 }}>
        {promos.map(p => (
          <div key={p.id} style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden", opacity: p.ativa ? 1 : 0.6 }}>
            <div style={{ background: p.ativa ? `linear-gradient(135deg,${T.navy},${T.navyL})` : T.bg, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: p.ativa ? `${T.red}cc` : T.border, color: "white", fontWeight: 800, fontSize: 13, padding: "4px 12px", borderRadius: 20 }}>{p.valor}</span>
              <button onClick={() => toggleAtiva(p.id)} style={{ background: p.ativa ? `${T.green}33` : `${T.muted}22`, border: "none", borderRadius: 20, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: p.ativa ? T.green : T.muted, fontFamily: S.font }}>
                {p.ativa ? "● Ativa" : "○ Inativa"}
              </button>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, fontFamily: S.display, marginBottom: 4 }}>{p.titulo}</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>{p.desc}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <Badge color={T.blue} small>{p.produto}</Badge>
                <Badge color={T.muted} small>{p.inicio} → {p.fim}</Badge>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" size="sm" icon={Edit2} onClick={() => editar(p)}>Editar</Btn>
                <Btn variant="secondary" size="sm" icon={Trash2} onClick={() => apagar(p.id)}>Apagar</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   ECRÃ: PRODUTOS (Firebase + Storage)
══════════════════════════════════ */
const FAMILIAS = ["Cerveja", "Refrigerantes", "Vinho", "Espumante", "Água", "Energéticas", "Destilados", "Outros"];

// Abre PDF Base64 ou URL numa nova janela via Blob
function openPdf(pdfData) {
  if (!pdfData) return;
  try {
    if (pdfData.startsWith("data:")) {
      const base64 = pdfData.split(",")[1];
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } else {
      window.open(pdfData, "_blank");
    }
  } catch(e) { alert("Erro ao abrir PDF: " + e.message); }
}
 (PT, EN, fórmula simples) para float
function parseNumPT(val) {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  let s = String(val).trim();
  // Se é fórmula Excel simples tipo =3.10*6 ou =E7*F7 — tentar avaliar se só tem números e operadores
  if (s.startsWith("=")) {
    const expr = s.slice(1).replace(/[A-Z]+\d+/g, "0"); // substitui refs por 0
    try { const r = Function('"use strict"; return (' + expr + ')')(); if (typeof r === "number" && isFinite(r)) return r; } catch {}
    return 0;
  }
  // Formato PT: 1.234,56 → remover pontos de milhar, trocar vírgula por ponto
  if (s.includes(",") && s.includes(".")) return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  // Só vírgula: 17,28 → 17.28
  if (s.includes(",")) return parseFloat(s.replace(",", ".")) || 0;
  return parseFloat(s) || 0;
}

const PRODUTO_VAZIO = { nome: "", ref: "", familia: "Cerveja", preco: "", precoUnit: "", unidade: "cx", stock: "", ativo: true, descricao: "", foto: "", pdf: "" };

/* ── Modal Import Excel ── */
function ModalImportExcel({ onClose, onImport }) {
  const [ficheiro, setFicheiro] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [erro, setErro] = useState("");

  const handleFicheiro = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFicheiro(file);
    setErro("");
    try {
      const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellFormula: false, cellNF: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
      // Mapear colunas flexivelmente
      const mapped = rows.map((r, i) => {
        const keys = Object.keys(r).map(k => k.toLowerCase().trim());
        const get = (...names) => {
          for (const n of names) {
            // limpa cabeçalho: remove acentos, parênteses, (€), espaços extra
            const k = Object.keys(r).find(k => {
              const clean = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s*\(.*?\)\s*/g, "").trim();
              return clean.includes(n);
            });
            if (k && r[k] !== "" && r[k] !== null && r[k] !== undefined) return r[k];
          }
          return "";
        };
        return {
          _row: i + 2,
          nome: get("nome", "name", "produto", "artigo", "descri") || "",
          ref: get("ref", "cod", "sku", "código") || "",
          familia: get("famil", "categ", "tipo", "grupo") || "Outros",
          preco: parseNumPT(get("preco", "preço", "price", "pvf", "valor")),
          precoUnit: parseNumPT(get("precounit", "unid", "unitário")),
          unidade: get("unidade", "unit", "embal") || "cx",
          stock: parseInt(get("stock", "existên", "qty", "quant")) || 0,
          descricao: get("desc", "obs", "nota") || "",
          ativo: true, foto: "", pdf: "",
        };
      }).filter(r => {
        // Ignorar linhas vazias ou linhas de descrição (nome muito longo ou contém "Ex:")
        if (!r.nome) return false;
        if (String(r.nome).includes("Ex:") || String(r.nome).length > 80) return false;
        if (r.preco === 0 && r.stock === 0 && !r.ref) return false;
        return true;
      });
      setPreview(mapped);
    } catch (e) {
      setErro("Erro ao ler o ficheiro. Certifique-se que é um .xlsx ou .csv válido.");
      console.error(e);
    }
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setImporting(true);
    try {
      for (const p of preview) {
        await addDoc(collection(db, "produtos"), { ...p, criadoEm: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      onImport(preview.length);
    } catch (e) {
      setErro("Erro ao importar: " + e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000066", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.white, borderRadius: 16, padding: 28, width: 680, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px #0003" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.navy, fontFamily: S.display }}>Importar via Excel</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: T.muted }}>Carregue um ficheiro .xlsx ou .csv com os seus produtos</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={20} /></button>
        </div>

        {/* Colunas esperadas */}
        <div style={{ background: T.bg, borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
          <strong style={{ color: T.navy }}>Colunas reconhecidas:</strong>{" "}
          <code>Nome</code>, <code>Ref</code>, <code>Família</code>, <code>Preço</code>, <code>PreçoUnit</code>, <code>Unidade</code>, <code>Stock</code>, <code>Descrição</code>
          <br />Os cabeçalhos não precisam de ser exactos — o sistema tenta reconhecê-los automaticamente.
        </div>

        {/* Upload */}
        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${T.border}`, borderRadius: 12, padding: "28px 20px", cursor: "pointer", background: ficheiro ? T.green + "08" : T.bg, marginBottom: 16, transition: "all .2s" }}>
          <FileSpreadsheet size={36} color={ficheiro ? T.green : T.mutedL} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: ficheiro ? T.green : T.navy }}>{ficheiro ? ficheiro.name : "Clique para escolher ficheiro"}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>.xlsx, .xls ou .csv</div>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFicheiro} style={{ display: "none" }} />
        </label>

        {erro && <div style={{ background: T.red + "11", color: T.red, borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>{erro}</div>}

        {/* Preview */}
        {preview.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 10 }}>
              {preview.length} produto(s) encontrado(s) — pré-visualização:
            </div>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", maxHeight: 260, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 80px", padding: "8px 14px", background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                {["Nome", "Ref", "Família", "Preço", "Stock"].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{h}</div>
                ))}
              </div>
              {preview.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 80px", padding: "9px 14px", borderBottom: i < preview.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>{p.ref || "—"}</div>
                  <div style={{ fontSize: 12, color: T.blue }}>{p.familia}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>€{p.preco.toFixed(2)}</div>
                  <div style={{ fontSize: 13, color: T.green }}>{p.stock}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
          {preview.length > 0 && (
            <Btn variant="green" icon={Upload} onClick={handleImport} disabled={importing}>
              {importing ? "A importar..." : `Importar ${preview.length} produto(s)`}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalProduto({ produto, onClose, onSave }) {
  const [form, setForm] = useState(produto || PRODUTO_VAZIO);
  const [fotoFile, setFotoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(produto?.foto || null);
  const [fotoMode, setFotoMode] = useState("ficheiro"); // "ficheiro" | "url"
  const [pdfMode, setPdfMode] = useState("ficheiro");   // "ficheiro" | "url"
  const [fotoUrl, setFotoUrlInput] = useState("");
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    // Comprimir e converter para Base64 via canvas
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 600; // px máximo
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const b64 = canvas.toDataURL("image/jpeg", 0.75);
      setFotoPreview(b64);
      setFotoFile({ _b64: b64 }); // guardar base64 em vez do File
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Fetch imagem por URL → Base64
  const handleFotoUrl = async (url) => {
    setFotoUrlInput(url);
    if (!url) return;
    try {
      setUploadProgress("A carregar imagem...");
      const resp = await fetch(url);
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const img = new window.Image();
      img.onload = () => {
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const b64 = canvas.toDataURL("image/jpeg", 0.75);
        setFotoPreview(b64);
        setFotoFile({ _b64: b64 });
        URL.revokeObjectURL(objectUrl);
        setUploadProgress("Imagem carregada ✓");
      };
      img.onerror = () => {
        // CORS bloqueou — guardar URL diretamente
        setFotoPreview(url);
        setFotoFile({ _url: url });
        setUploadProgress("URL guardado ✓");
      };
      img.src = objectUrl;
    } catch {
      // Guardar URL diretamente
      setFotoPreview(url);
      setFotoFile({ _url: url });
      setUploadProgress("URL guardado ✓");
    }
  };

  // Fetch PDF por URL → Base64
  const handlePdfUrl = async (url) => {
    setPdfUrlInput(url);
    if (!url) return;
    try {
      setUploadProgress("A carregar PDF...");
      const resp = await fetch(url);
      const buf = await resp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      bytes.forEach(b => binary += String.fromCharCode(b));
      const b64 = "data:application/pdf;base64," + btoa(binary);
      setPdfFile({ _b64: b64 });
      setUploadProgress("PDF carregado ✓");
    } catch {
      // CORS bloqueou — guardar URL diretamente
      setPdfFile({ _url: url });
      setUploadProgress("URL PDF guardado ✓");
    }
  };


    if (!form.nome || !form.ref || !form.preco) return alert("Preencha Nome, Referência e Preço.");
    setSaving(true);
    let fotoUrl = form.foto || "";
    let pdfUrl = form.pdf || "";

    // Foto — Base64 ou URL direto
    if (fotoFile?._b64) {
      fotoUrl = fotoFile._b64;
      setUploadProgress("Foto pronta ✓");
    } else if (fotoFile?._url) {
      fotoUrl = fotoFile._url;
    }

    // PDF — Base64 ou URL direto
    if (pdfFile?._b64) {
      pdfUrl = pdfFile._b64;
      setUploadProgress("PDF pronto ✓");
    } else if (pdfFile?._url) {
      pdfUrl = pdfFile._url;
    }

    // Guardar dados no Firestore (sempre acontece)
    try {
      setUploadProgress("A guardar produto...");
      const dados = {
        nome: form.nome, ref: form.ref, familia: form.familia,
        preco: parseFloat(form.preco) || 0,
        precoUnit: parseFloat(form.precoUnit) || 0,
        unidade: form.unidade || "cx",
        stock: parseInt(form.stock) || 0,
        ativo: form.ativo, descricao: form.descricao || "",
        foto: fotoUrl,
        pdf: pdfUrl,
        updatedAt: serverTimestamp(),
      };
      if (produto?.firestoreId) {
        await updateDoc(doc(db, "produtos", produto.firestoreId), dados);
      } else {
        await addDoc(collection(db, "produtos"), { ...dados, criadoEm: serverTimestamp() });
      }
      onSave(); // fecha o modal
    } catch (e) {
      console.error(e);
      alert("Erro ao guardar no Firestore: " + e.message);
    } finally {
      setSaving(false);
      setUploadProgress("");
    }
  };

  const inp = (label, key, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5, fontFamily: "monospace" }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: S.font, color: T.text, outline: "none", boxSizing: "border-box" }} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000066", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.white, borderRadius: 16, padding: 28, width: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px #0003" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.navy, fontFamily: S.display }}>{produto?.firestoreId ? "Editar Produto" : "Novo Produto"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={20} /></button>
        </div>

        {/* Foto */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <label style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:1, fontFamily:"monospace" }}>Foto do Produto</label>
            <div style={{ display:"flex", gap:4 }}>
              {["ficheiro","url"].map(m => (
                <button key={m} onClick={() => setFotoMode(m)} style={{ fontSize:11, padding:"3px 10px", borderRadius:6, border:`1px solid ${fotoMode===m ? T.navy : T.border}`, background: fotoMode===m ? T.navy : "white", color: fotoMode===m ? "white" : T.muted, cursor:"pointer", fontWeight:600 }}>
                  {m === "ficheiro" ? "📁 Ficheiro" : "🔗 URL"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ width:90, height:90, borderRadius:12, border:`2px dashed ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", background:T.bg, flexShrink:0 }}>
              {fotoPreview ? <img src={fotoPreview} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <Package size={28} color={T.mutedL} />}
            </div>
            <div style={{ flex:1 }}>
              {fotoMode === "ficheiro" ? (
                <label style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.navy, color:"white", padding:"9px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                  <Download size={13} /> Escolher Foto
                  <input type="file" accept="image/*" onChange={handleFoto} style={{ display:"none" }} />
                </label>
              ) : (
                <input
                  placeholder="https://exemplo.com/foto.jpg"
                  value={fotoUrl}
                  onChange={e => handleFotoUrl(e.target.value)}
                  onBlur={e => handleFotoUrl(e.target.value)}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:13, fontFamily:S.font, boxSizing:"border-box" }}
                />
              )}
              <div style={{ fontSize:11, color:T.muted, marginTop:6 }}>
                {fotoMode === "ficheiro" ? "JPG, PNG ou WebP · Máx. 5MB" : "Cole o URL direto da imagem"}
              </div>
              {uploadProgress && <div style={{ fontSize:11, color:T.green, marginTop:4, fontWeight:600 }}>{uploadProgress}</div>}
            </div>
          </div>
        </div>

        {/* PDF */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <label style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:1, fontFamily:"monospace" }}>Ficha Técnica (PDF)</label>
            <div style={{ display:"flex", gap:4 }}>
              {["ficheiro","url"].map(m => (
                <button key={m} onClick={() => setPdfMode(m)} style={{ fontSize:11, padding:"3px 10px", borderRadius:6, border:`1px solid ${pdfMode===m ? T.navy : T.border}`, background: pdfMode===m ? T.navy : "white", color: pdfMode===m ? "white" : T.muted, cursor:"pointer", fontWeight:600 }}>
                  {m === "ficheiro" ? "📁 Ficheiro" : "🔗 URL"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ width:90, height:90, borderRadius:12, border:`2px dashed ${T.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.bg, flexShrink:0, gap:4 }}>
              <FileText size={24} color={pdfFile || form.pdf ? T.red : T.mutedL} />
              <span style={{ fontSize:9, color:T.muted, fontFamily:"monospace" }}>PDF</span>
            </div>
            <div style={{ flex:1 }}>
              {pdfMode === "ficheiro" ? (
                <label style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.navy, color:"white", padding:"9px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                  <Upload size={13} /> {pdfFile ? "PDF carregado ✓" : "Escolher PDF"}
                  <input type="file" accept=".pdf" onChange={e => { const f = e.target.files[0]; if (!f) return; setPdfFile(null); f.arrayBuffer().then(buf => { const bytes = new Uint8Array(buf); let bin=""; bytes.forEach(b=>bin+=String.fromCharCode(b)); setPdfFile({ _b64: "data:application/pdf;base64,"+btoa(bin) }); }); }} style={{ display:"none" }} />
                </label>
              ) : (
                <input
                  placeholder="https://exemplo.com/ficha.pdf"
                  value={pdfUrlInput}
                  onChange={e => setPdfUrlInput(e.target.value)}
                  onBlur={e => handlePdfUrl(e.target.value)}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:13, fontFamily:S.font, boxSizing:"border-box" }}
                />
              )}
              {form.pdf && !pdfFile && (
                <button onClick={() => openPdf(form.pdf)} style={{ display:"block", fontSize:11, color:T.blue, marginTop:6, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", padding:0 }}>Ver PDF atual</button>
              )}
              <div style={{ fontSize:11, color:T.muted, marginTop:6 }}>
                {pdfMode === "ficheiro" ? "Ficha técnica visível na loja e app" : "Cole o URL direto do PDF"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <div style={{ gridColumn: "1 / -1" }}>{inp("Nome do Produto", "nome", "text", "Ex: Sagres 33cl NR")}</div>
          {inp("Referência", "ref", "text", "Ex: SAG-33NR")}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5, fontFamily: "monospace" }}>Família</label>
            <select value={form.familia} onChange={e => set("familia", e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: S.font, color: T.text, background: "white" }}>
              {FAMILIAS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          {inp("Preço cx/un (€)", "preco", "number", "0.00")}
          {inp("Preço unitário (€)", "precoUnit", "number", "0.00")}
          {inp("Unidade", "unidade", "text", "cx 24un")}
          {inp("Stock", "stock", "number", "0")}
          <div style={{ gridColumn: "1 / -1", marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5, fontFamily: "monospace" }}>Descrição (opcional)</label>
            <textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} rows={2} placeholder="Breve descrição do produto..."
              style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: S.font, color: T.text, resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => set("ativo", e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="ativo" style={{ fontSize: 13, color: T.text, fontFamily: S.font, cursor: "pointer" }}>Produto ativo (visível na loja e app)</label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving ? "A guardar..." : "Guardar Produto"}</Btn>
        </div>
      </div>
    </div>
  );
}

function EcrãProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [modalExcel, setModalExcel] = useState(false); // null | "novo" | produto

  useEffect(() => {
    const q = query(collection(db, "produtos"), orderBy("nome"));
    const unsub = onSnapshot(q, snap => {
      setProdutos(snap.docs.map(d => ({ firestoreId: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const apagar = async (p) => {
    if (!window.confirm(`Apagar "${p.nome}"?`)) return;
    await deleteDoc(doc(db, "produtos", p.firestoreId));
  };

  const filtered = produtos.filter(p =>
    p.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.ref?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>Catálogo</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: T.navy, fontFamily: S.display }}>Produtos</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.white, border: `1px solid ${T.border}`, borderRadius: 9, padding: "8px 12px" }}>
            <Search size={13} color={T.muted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar..." style={{ border: "none", outline: "none", fontSize: 13, color: T.text, width: 160, background: "transparent", fontFamily: S.font }} />
          </div>
          <Btn variant="secondary" icon={FileSpreadsheet} onClick={() => setModalExcel(true)}>Importar Excel</Btn>
          <Btn icon={Plus} onClick={() => setModal("novo")}>Novo Produto</Btn>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: T.muted }}>A carregar produtos...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: T.white, borderRadius: 16, border: `1px solid ${T.border}` }}>
          <Package size={40} color={T.mutedL} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 6 }}>Sem produtos</div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 18 }}>Adicione o primeiro produto ao catálogo</div>
          <Btn icon={Plus} onClick={() => setModal("novo")}>Adicionar Produto</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(p => (
            <div key={p.firestoreId} style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Foto quadrada */}
              <div style={{ position:"relative", width:"100%", paddingBottom:"100%", background: T.bg, overflow:"hidden" }}>
                {p.foto
                  ? <img src={p.foto} alt={p.nome} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", padding:"12px" }} />
                  : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}><Package size={48} color={T.mutedL} /></div>}
                <span style={{ position:"absolute", top:10, right:10, background: p.ativo ? T.green : T.muted, color:"white", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20, fontFamily:"monospace" }}>
                  {p.ativo ? "ATIVO" : "INATIVO"}
                </span>
                {p.pdf && (
                  <button onClick={() => openPdf(p.pdf)}
                    style={{ position:"absolute", bottom:10, left:10, display:"flex", alignItems:"center", gap:5, background:"white", border:`1px solid ${T.red}`, borderRadius:8, padding:"4px 9px", color:T.red, fontSize:11, fontWeight:700, cursor:"pointer", boxShadow:"0 1px 4px #0002" }}>
                    <FileText size={12} /> Ficha Técnica
                  </button>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{p.nome}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>{p.ref}</span>
                  <Badge color={T.blue} small>{p.familia}</Badge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.red }}>€{fmt(p.preco)}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{p.unidade || "cx"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: p.stock < 50 ? T.red : T.green }}>{p.stock || 0} un</div>
                    <div style={{ fontSize: 11, color: T.muted }}>stock</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Btn variant="secondary" size="sm" icon={Edit2} full onClick={() => setModal(p)}>Editar</Btn>
                  <button onClick={() => apagar(p)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: T.red, display: "flex", alignItems: "center" }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ModalProduto
          produto={modal === "novo" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => setModal(null)}
        />
      )}
      {modalExcel && (
        <ModalImportExcel
          onClose={() => setModalExcel(false)}
          onImport={(n) => { setModalExcel(false); alert(`✅ ${n} produto(s) importado(s) com sucesso!`); }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════
   ECRÃ: CLIENTES
══════════════════════════════════ */
const CLIENTES = [
  { id: 1, nome: "Restaurante Marina", nif: "501234567", local: "Albufeira", tipo: "A", comercial: "João Ferreira", saldo: 2740.80, limite: 8000, ativo: true },
  { id: 2, nome: "Snack Bar Atlântico", nif: "502345678", local: "Quarteira", tipo: "B", comercial: "Daniela Freitas", saldo: 890.00, limite: 4000, ativo: true },
  { id: 3, nome: "Hotel Algarve Palace", nif: "503456789", local: "Faro", tipo: "A", comercial: "Rui Inácio", saldo: 0, limite: 15000, ativo: true },
  { id: 4, nome: "Tasca do Zé", nif: "504567890", local: "Loulé", tipo: "C", comercial: "João Ferreira", saldo: 1200.00, limite: 2000, ativo: false },
];

function EcrãClientes() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>Carteira</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: T.navy, fontFamily: S.display }}>Clientes</h1>
        </div>
        <Btn icon={Plus}>Novo Cliente</Btn>
      </div>
      <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 110px 100px 80px 60px", padding: "10px 20px", background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          {["Cliente", "Tipo", "Comercial", "Saldo", "Limite", "Estado", ""].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{h}</div>
          ))}
        </div>
        {CLIENTES.map((c, i) => {
          const pct = Math.round(c.saldo / c.limite * 100);
          return (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 110px 100px 80px 60px", padding: "14px 20px", borderBottom: i < CLIENTES.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center" }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg + "88"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{c.nome}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{c.local} · NIF {c.nif}</div>
              </div>
              <Badge color={T.orange} small>Tipo {c.tipo}</Badge>
              <div style={{ fontSize: 12, color: T.muted }}>{c.comercial}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.saldo > 0 ? T.red : T.green }}>€{fmt(c.saldo)}</div>
                <div style={{ height: 3, background: T.bg, borderRadius: 2, marginTop: 3, width: 60 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pct > 70 ? T.red : T.green, borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ fontSize: 13, color: T.muted }}>€{fmt(c.limite)}</div>
              <Badge color={c.ativo ? T.green : T.muted} small>{c.ativo ? "Ativo" : "Inativo"}</Badge>
              <Btn variant="secondary" size="sm" icon={Eye}>Ver</Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   ECRÃ: RELATÓRIOS
══════════════════════════════════ */
function EcrãRelatorios() {
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const dados = [42000, 38000, 51000, 47000, 55000, 62000, 71000, 68000, 59000, 53000, 48000, 44000];
  const maxVal = Math.max(...dados);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>Analytics</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: T.navy, fontFamily: S.display }}>Relatórios</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Volume 2025", value: "€622.000", delta: "+12%", up: true, color: T.navy },
          { label: "Clientes Ativos", value: "48", delta: "+3", up: true, color: T.green },
          { label: "Ticket Médio", value: "€1.245", delta: "-5%", up: false, color: T.red },
        ].map((k, i) => (
          <div key={i} style={{ background: T.white, borderRadius: 14, padding: "20px 22px", border: `1px solid ${T.border}`, borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, fontFamily: S.display, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{k.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: k.up ? T.green : T.red }}>
              {k.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{k.delta} vs ano anterior
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: "24px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, fontFamily: S.display, marginBottom: 20 }}>Volume de Vendas 2025 (€)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
          {dados.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace" }}>€{Math.round(v / 1000)}k</div>
              <div style={{ width: "100%", background: `linear-gradient(to top, ${T.navy}, ${T.navyL})`, borderRadius: "4px 4px 0 0", height: `${(v / maxVal) * 120}px` }} />
              <div style={{ fontSize: 10, color: T.muted }}>{meses[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   LAYOUT PRINCIPAL
══════════════════════════════════ */
export default function BackOffice() {
  const [page, setPage] = useState("encomendas");
  const [encPendentes, setEncPendentes] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "encomendas"), (snap) => {
      setEncPendentes(snap.docs.filter(d => d.data().estado === "pendente").length);
    });
    return () => unsub();
  }, []);

  const NAV = [
    { id: "encomendas", icon: ShoppingBag, label: "Encomendas", badge: encPendentes },
    { id: "promocoes", icon: Tag, label: "Promoções" },
    { id: "produtos", icon: Package, label: "Produtos" },
    { id: "clientes", icon: Users, label: "Clientes" },
    { id: "relatorios", icon: BarChart2, label: "Relatórios" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: S.font, background: T.bg }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: T.sidebar, display: "flex", flexDirection: "column", position: "fixed", height: "100vh", top: 0, left: 0, zIndex: 50 }}>
        <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${T.navyL}44` }}>
          <div style={{ fontSize: 8, color: T.red, letterSpacing: 3, fontFamily: "monospace", marginBottom: 4 }}>BACK OFFICE</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "white", fontFamily: S.display }}>EMPRO</div>
          <div style={{ fontSize: 10, color: T.mutedL, marginTop: 2 }}>Emprodalbe, Lda</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {NAV.map(item => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "none", background: active ? `${T.red}22` : "transparent",
                color: active ? "white" : T.mutedL, fontSize: 13, fontWeight: active ? 700 : 500,
                cursor: "pointer", fontFamily: S.font, marginBottom: 2, position: "relative",
                borderLeft: active ? `3px solid ${T.red}` : "3px solid transparent",
              }}>
                <Icon size={16} />{item.label}
                {item.badge > 0 && (
                  <span style={{ marginLeft: "auto", background: T.red, color: "white", fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: `1px solid ${T.navyL}44` }}>
          <div style={{ fontSize: 11, color: T.mutedL, marginBottom: 4 }}>Administrador</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>geral@empro.pt</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ background: T.bgWarm, borderBottom: `1px solid ${T.border}`, padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ fontSize: 13, color: T.muted }}>
            {new Date().toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {encPendentes > 0 && (
              <div style={{ background: `${T.orange}18`, border: `1px solid ${T.orange}44`, borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => setPage("encomendas")}>
                <Bell size={13} color={T.orange} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.orange }}>{encPendentes} pendente{encPendentes > 1 ? "s" : ""}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${T.navy},${T.navyL})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>E</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Admin</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "32px 32px 60px" }}>
          {page === "encomendas" && <EcrãEncomendas />}
          {page === "promocoes" && <EcrãPromoções />}
          {page === "produtos" && <EcrãProdutos />}
          {page === "clientes" && <EcrãClientes />}
          {page === "relatorios" && <EcrãRelatorios />}
        </div>
      </div>
    </div>
  );
}
