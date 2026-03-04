import { useState } from "react";
import {
  Tag, Eye, ShoppingBag, TrendingUp, Gift, Package, Users, BarChart2,
  Settings, Plus, Pencil, Trash2, Star, Calendar, AlertCircle,
  ToggleLeft, ToggleRight, Bell, Search, CheckCircle, XCircle,
  Download, ChevronRight, LayoutDashboard, LogOut, Megaphone
} from "lucide-react";

const T = {
  navy:    "#13294B",
  navyD:   "#0a1a30",
  navyL:   "#1e3d6e",
  navyXL:  "#2a5298",
  red:     "#E73C3E",
  redD:    "#b52d2f",
  redL:    "#ff6b6d",
  bg:      "#f0f2f5",
  white:   "#ffffff",
  text:    "#1a2744",
  muted:   "#6b7fa3",
  border:  "#d0d9e8",
  green:   "#1aab6d",
  orange:  "#f59e0b",
  blue:    "#3b82f6",
};

const PRODUCTS = [
  "Sagres 33cl NR","Super Bock 33cl","Coca-Cola 33cl","Água Monchique 1L",
  "Vinho Verde Gazela","Espumante Murganheira","Lipton Ice Tea 33cl","Red Bull 25cl",
];

const INITIAL_PROMOS = [
  { id: 1, title: "Pack Verão Cerveja",  desc: "Sagres + Super Bock — compre 5 cx, leve 6",  discount: "17% OFF",  type: "percentagem", value: 17,  until: "2025-03-31", active: true,  destaque: true,  tag: "Destaque", products: ["Sagres 33cl NR","Super Bock 33cl"],    views: 142, orders: 38, color: T.red   },
  { id: 2, title: "Promoção Red Bull",   desc: "Red Bull 25cl — desconto em encomendas +10cx", discount: "€0.20/cx", type: "valor",       value: 0.20,until: "2025-04-15", active: true,  destaque: false, tag: "Novo",     products: ["Red Bull 25cl"],                      views: 89,  orders: 21, color: T.blue  },
  { id: 3, title: "Vinho Verde Quintas", desc: "Seleção Vinhos Verdes — +50un",                discount: "10% OFF",  type: "percentagem", value: 10,  until: "2025-04-30", active: true,  destaque: false, tag: "Sazonal",  products: ["Vinho Verde Gazela","Espumante Murganheira"], views: 67,orders: 14, color: T.green },
  { id: 4, title: "Água Verão",          desc: "Água Monchique — desconto em paletes",         discount: "8% OFF",   type: "percentagem", value: 8,   until: "2025-02-28", active: false, destaque: false, tag: "Sazonal",  products: ["Água Monchique 1L"],                   views: 31,  orders: 5,  color: T.orange},
];

const TAGS = ["Destaque","Novo","Sazonal","Flash","Exclusivo"];

const emptyPromo = { title:"", desc:"", type:"percentagem", value:"", until:"", active:true, destaque:false, tag:"Novo", products:[], color: T.red };

function Badge({ children, color, bg }) {
  return (
    <span style={{ background: bg || color+"22", color: color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, fontFamily:"monospace", letterSpacing:0.5 }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={{ background: T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 22px", borderTop:`3px solid ${color}`, flex:1 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize:26, fontWeight:800, color: color, fontFamily:"'Georgia',serif" }}>{value}</div>
      <div style={{ fontSize:12, color: T.muted, marginTop:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color: T.muted, marginTop:4, borderTop:`1px solid ${T.border}`, paddingTop:6 }}>{sub}</div>}
    </div>
  );
}

function PromoCard({ p, onEdit, onToggle, onDelete }) {
  const statusColor = p.active ? T.green : T.muted;
  const expired = new Date(p.until) < new Date();
  return (
    <div style={{
      background: T.white, border:`1px solid ${T.border}`, borderRadius:14,
      overflow:"hidden", transition:"box-shadow .2s",
      boxShadow:"0 1px 4px rgba(0,0,0,.06)",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 20px rgba(19,41,75,.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.06)"}
    >
      {/* Topo colorido */}
      <div style={{ background:`linear-gradient(135deg,${p.color}22,${p.color}08)`, borderBottom:`1px solid ${p.color}33`, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background: p.active && !expired ? T.green : T.muted }} />
          <Badge color={p.color}>{p.tag}</Badge>
          {p.destaque && <Badge color={T.orange} bg={T.orange+"22"}><Star size={9} style={{display:"inline",marginRight:3,verticalAlign:"middle"}} fill={T.orange} />Destaque</Badge>}
          {expired && <Badge color={T.muted}>Expirada</Badge>}
        </div>
        <span style={{ background: p.color+"22", color: p.color, fontWeight:800, fontSize:15, padding:"4px 12px", borderRadius:20, fontFamily:"'Georgia',serif" }}>
          {p.discount}
        </span>
      </div>

      {/* Corpo */}
      <div style={{ padding:"16px 18px" }}>
        <div style={{ fontSize:16, fontWeight:700, color: T.text, marginBottom:6, fontFamily:"'Georgia',serif" }}>{p.title}</div>
        <div style={{ fontSize:13, color: T.muted, marginBottom:12, lineHeight:1.5 }}>{p.desc}</div>

        {/* Produtos */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
          {p.products.map(pr => (
            <span key={pr} style={{ background: T.bg, color: T.muted, fontSize:11, padding:"3px 9px", borderRadius:20, border:`1px solid ${T.border}` }}>{pr}</span>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:16, padding:"10px 0", borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, marginBottom:12 }}>
          <div style={{ textAlign:"center", flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color: T.navy }}>{p.views}</div>
            <div style={{ fontSize:10, color: T.muted, textTransform:"uppercase", letterSpacing:1 }}>Visualizações</div>
          </div>
          <div style={{ width:1, background: T.border }} />
          <div style={{ textAlign:"center", flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color: T.red }}>{p.orders}</div>
            <div style={{ fontSize:10, color: T.muted, textTransform:"uppercase", letterSpacing:1 }}>Encomendas</div>
          </div>
          <div style={{ width:1, background: T.border }} />
          <div style={{ textAlign:"center", flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color: T.green }}>{p.views ? Math.round(p.orders/p.views*100) : 0}%</div>
            <div style={{ fontSize:10, color: T.muted, textTransform:"uppercase", letterSpacing:1 }}>Conversão</div>
          </div>
        </div>

        {/* Validade */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontSize:12, color: T.muted }}>
            <Calendar size={13} color={T.muted} style={{display:"inline",marginRight:5,verticalAlign:"middle"}} />
            Válida até <strong style={{ color: expired ? T.red : T.text }}>{p.until}</strong>
          </span>
        </div>

        {/* Acções */}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => onToggle(p.id)} style={{
            flex:1, padding:"8px", borderRadius:8, border:`1px solid ${p.active ? T.green : T.border}`,
            background: p.active ? T.green+"11" : T.bg, color: p.active ? T.green : T.muted,
            fontSize:12, fontWeight:600, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:5,
          }}>
            {p.active ? <><ToggleRight size={14} />Ativa</> : <><ToggleLeft size={14} />Inativa</>}
          </button>
          <button onClick={() => onEdit(p)} style={{
            flex:1, padding:"8px", borderRadius:8, border:`1px solid ${T.navyL}`,
            background: T.navy+"11", color: T.navy, fontSize:12, fontWeight:600, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:5,
          }}><Pencil size={12} />Editar</button>
          <button onClick={() => onDelete(p.id)} style={{
            width:36, padding:"8px", borderRadius:8, border:`1px solid ${T.red}22`,
            background: T.red+"11", color: T.red, fontSize:12, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,26,48,.6)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background: T.white, borderRadius:18, width:"100%", maxWidth:560, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 64px rgba(0,0,0,.25)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background: T.white, zIndex:1 }}>
          <div style={{ fontSize:18, fontWeight:700, color: T.navy, fontFamily:"'Georgia',serif" }}>{title}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, color: T.muted, cursor:"pointer", padding:4 }}>✕</button>
        </div>
        <div style={{ padding:"24px" }}>{children}</div>
      </div>
    </div>
  );
}

function PromoForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyPromo);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleProduct = (p) => set("products", form.products.includes(p) ? form.products.filter(x=>x!==p) : [...form.products, p]);

  const labelStyle = { fontSize:12, fontWeight:700, color: T.muted, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:6, fontFamily:"monospace" };
  const inputStyle = { width:"100%", padding:"10px 12px", border:`1px solid ${T.border}`, borderRadius:10, fontSize:14, color: T.text, background: T.bg, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* Título */}
      <div>
        <label style={labelStyle}>Título da Promoção</label>
        <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ex: Pack Verão Cerveja" style={inputStyle} />
      </div>

      {/* Descrição */}
      <div>
        <label style={labelStyle}>Descrição</label>
        <textarea value={form.desc} onChange={e=>set("desc",e.target.value)} placeholder="Descreva a promoção..." rows={3}
          style={{ ...inputStyle, resize:"vertical" }} />
      </div>

      {/* Desconto */}
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Tipo de Desconto</label>
          <select value={form.type} onChange={e=>set("type",e.target.value)} style={inputStyle}>
            <option value="percentagem">Percentagem (%)</option>
            <option value="valor">Valor (€)</option>
            <option value="oferta">Oferta (cx)</option>
          </select>
        </div>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Valor</label>
          <input type="number" value={form.value} onChange={e=>set("value",e.target.value)} placeholder="Ex: 10" style={inputStyle} />
        </div>
      </div>

      {/* Validade */}
      <div>
        <label style={labelStyle}>Data de Validade</label>
        <input type="date" value={form.until} onChange={e=>set("until",e.target.value)} style={inputStyle} />
      </div>

      {/* Tag + Cor */}
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Tag</label>
          <select value={form.tag} onChange={e=>set("tag",e.target.value)} style={inputStyle}>
            {TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Cor do Card</label>
          <div style={{ display:"flex", gap:8, marginTop:2 }}>
            {[T.red, T.blue, T.green, T.orange, T.navy].map(c => (
              <div key={c} onClick={() => set("color", c)} style={{
                width:30, height:30, borderRadius:"50%", background:c, cursor:"pointer",
                border: form.color === c ? `3px solid ${T.text}` : `3px solid transparent`,
                boxSizing:"border-box"
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div>
        <label style={labelStyle}>Produtos Abrangidos</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {PRODUCTS.map(p => (
            <div key={p} onClick={() => toggleProduct(p)} style={{
              padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer",
              border:`1px solid ${form.products.includes(p) ? form.color : T.border}`,
              background: form.products.includes(p) ? form.color+"18" : T.bg,
              color: form.products.includes(p) ? form.color : T.muted,
              fontWeight: form.products.includes(p) ? 700 : 400,
            }}>{p}</div>
          ))}
        </div>
      </div>

      {/* Opções */}
      <div style={{ display:"flex", gap:20 }}>
        {[
          { key:"active",   label:"Promoção Ativa" },
          { key:"destaque", label:"Mostrar em Destaque" },
        ].map(opt => (
          <label key={opt.key} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color: T.text }}>
            <input type="checkbox" checked={form[opt.key]} onChange={e=>set(opt.key,e.target.checked)}
              style={{ width:16, height:16, accentColor: T.red }} />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Preview */}
      <div style={{ background: T.navy+"08", border:`1px solid ${T.navy}22`, borderRadius:12, padding:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color: T.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontFamily:"monospace" }}>Pré-visualização na App</div>
        <div style={{ background:"white", borderRadius:10, padding:"12px 14px", border:`1px solid ${form.color}44`, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:form.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
            {form.type === "percentagem" ? <Tag size={18} color={form.color} /> : form.type === "valor" ? <TrendingUp size={18} color={form.color} /> : <Gift size={18} color={form.color} />}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color: T.navy, marginBottom:2 }}>{form.title || "Título da promoção"}</div>
            <div style={{ fontSize:11, color: T.muted }}>Válida até {form.until || "—"}</div>
          </div>
          <div style={{ background:form.color+"22", color:form.color, fontWeight:800, fontSize:13, padding:"4px 10px", borderRadius:20 }}>
            {form.value ? `${form.value}${form.type === "percentagem" ? "% OFF" : form.type === "valor" ? "€" : "cx"}` : "Desconto"}
          </div>
        </div>
      </div>

      {/* Botões */}
      <div style={{ display:"flex", gap:10, paddingTop:4 }}>
        <button onClick={onClose} style={{ flex:1, padding:"12px", borderRadius:10, border:`1px solid ${T.border}`, background: T.bg, color: T.muted, fontSize:14, fontWeight:600, cursor:"pointer" }}>
          Cancelar
        </button>
        <button onClick={() => onSave(form)} style={{ flex:2, padding:"12px", borderRadius:10, border:"none", background: T.red, color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>
          {initial?.id ? "Guardar Alterações" : "Criar Promoção"}
        </button>
      </div>
    </div>
  );
}

// ─── ECRÃ PRODUTOS ───────────────────────────────────────────────────────────
const INITIAL_PRODUCTS = [
  { id:1, name:"Sagres 33cl NR",        category:"Cerveja",       price:0.72, unit:"cx 24un", stock:true,  ref:"SAG-33NR" },
  { id:2, name:"Super Bock 33cl",        category:"Cerveja",       price:0.68, unit:"cx 24un", stock:true,  ref:"SB-33"    },
  { id:3, name:"Coca-Cola 33cl",         category:"Refrigerantes", price:0.58, unit:"cx 24un", stock:true,  ref:"CC-33"    },
  { id:4, name:"Água Monchique 1L",      category:"Água",          price:0.35, unit:"cx 12un", stock:false, ref:"MON-1L"   },
  { id:5, name:"Vinho Verde Gazela",     category:"Vinho",         price:3.20, unit:"un",      stock:true,  ref:"GAZ-VV"   },
  { id:6, name:"Espumante Murganheira",  category:"Espumante",     price:5.80, unit:"un",      stock:true,  ref:"MUR-ESP"  },
  { id:7, name:"Lipton Ice Tea 33cl",    category:"Refrigerantes", price:0.62, unit:"cx 24un", stock:true,  ref:"LIP-33"   },
  { id:8, name:"Red Bull 25cl",          category:"Energéticas",   price:1.45, unit:"cx 24un", stock:true,  ref:"RB-25"    },
];

function ProdutosScreen() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStock = (id) => setProducts(ps => ps.map(p => p.id===id ? {...p, stock:!p.stock} : p));

  const catColor = { Cerveja:T.orange, Refrigerantes:T.blue, Água:"#06b6d4", Vinho:T.red, Espumante:"#8b5cf6", Energéticas:T.green };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <div style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", fontFamily:"monospace", marginBottom:4 }}>Gestão de</div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:800, color:T.navy, fontFamily:"'Georgia',serif" }}>Produtos</h1>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:T.white, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px" }}>
            <Search size={14} color={T.muted} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar produto..." style={{ border:"none", outline:"none", fontSize:13, color:T.text, width:180, background:"transparent" }} />
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div style={{ display:"flex", gap:14, marginBottom:28 }}>
        <StatCard label="Total de Produtos" value={products.length}                                  color={T.navy}   icon={Package}  sub="no catálogo" />
        <StatCard label="Com Stock"          value={products.filter(p=>p.stock).length}              color={T.green}  icon={CheckCircle} sub="disponíveis" />
        <StatCard label="Sem Stock"          value={products.filter(p=>!p.stock).length}             color={T.red}    icon={XCircle}  sub="indisponíveis" />
        <StatCard label="Categorias"         value={[...new Set(products.map(p=>p.category))].length} color={T.blue}  icon={Tag}      sub="famílias" />
      </div>

      {/* Tabela */}
      <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 80px 80px 100px", gap:0, background:T.bg, borderBottom:`1px solid ${T.border}`, padding:"10px 20px" }}>
          {["Produto","Categoria","Ref.","Preço","Un.","Stock"].map(h => (
            <div key={h} style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:1, fontFamily:"monospace" }}>{h}</div>
          ))}
        </div>
        {filtered.map((p,i) => (
          <div key={p.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 80px 80px 100px", gap:0, padding:"14px 20px", borderBottom: i<filtered.length-1 ? `1px solid ${T.border}` : "none", alignItems:"center" }}
            onMouseEnter={e=>e.currentTarget.style.background=T.bg+"88"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{ fontWeight:600, color:T.text, fontSize:14 }}>{p.name}</div>
            <div><span style={{ background:(catColor[p.category]||T.muted)+"22", color:catColor[p.category]||T.muted, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{p.category}</span></div>
            <div style={{ fontSize:12, color:T.muted, fontFamily:"monospace" }}>{p.ref}</div>
            <div style={{ fontWeight:700, color:T.navy }}>€{p.price.toFixed(2)}</div>
            <div style={{ fontSize:12, color:T.muted }}>{p.unit}</div>
            <div>
              <button onClick={()=>toggleStock(p.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, border:`1px solid ${p.stock ? T.green : T.red}`, background:p.stock ? T.green+"11" : T.red+"11", color:p.stock ? T.green : T.red, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                {p.stock ? <><ToggleRight size={12} />Em stock</> : <><ToggleLeft size={12} />Esgotado</>}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:12, fontSize:12, color:T.muted }}>* Preços e stock sincronizados com Primavera ERP</div>
    </div>
  );
}

// ─── ECRÃ CLIENTES ────────────────────────────────────────────────────────────
const CLIENTES = [
  { id:1, name:"Restaurante Marina",   local:"Albufeira",    type:"A", saldo:2740.80, limite:8000, ult:"2025-02-26", encomendas:12, status:"ativo"   },
  { id:2, name:"Café Central",         local:"Loulé",        type:"B", saldo:0,       limite:3000, ult:"2025-02-20", encomendas:8,  status:"ativo"   },
  { id:3, name:"Hotel Algarve Sol",    local:"Faro",         type:"A", saldo:5200.00, limite:15000,ult:"2025-02-15", encomendas:22, status:"ativo"   },
  { id:4, name:"Snack Bar Praia",      local:"Quarteira",    type:"C", saldo:380.00,  limite:1500, ult:"2025-01-30", encomendas:4,  status:"inativo" },
  { id:5, name:"Cervejaria Algarvia",  local:"Portimão",     type:"B", saldo:1100.50, limite:5000, ult:"2025-02-22", encomendas:15, status:"ativo"   },
  { id:6, name:"Tasca do Zé",          local:"Lagos",        type:"C", saldo:0,       limite:2000, ult:"2024-12-10", encomendas:3,  status:"inativo" },
];

function ClientesScreen() {
  const [search, setSearch] = useState("");
  const filtered = CLIENTES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.local.toLowerCase().includes(search.toLowerCase()));
  const totalDivida = CLIENTES.reduce((s,c)=>s+c.saldo,0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <div style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", fontFamily:"monospace", marginBottom:4 }}>Gestão de</div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:800, color:T.navy, fontFamily:"'Georgia',serif" }}>Clientes</h1>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:T.white, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px" }}>
          <Search size={14} color={T.muted} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar cliente..." style={{ border:"none", outline:"none", fontSize:13, color:T.text, width:180, background:"transparent" }} />
        </div>
      </div>

      <div style={{ display:"flex", gap:14, marginBottom:28 }}>
        <StatCard label="Total Clientes"  value={CLIENTES.length}                          color={T.navy}   icon={Users}       sub="na base de dados" />
        <StatCard label="Clientes Ativos" value={CLIENTES.filter(c=>c.status==="ativo").length} color={T.green} icon={CheckCircle} sub="com encomendas recentes" />
        <StatCard label="Dívida Total"    value={`€${totalDivida.toLocaleString("pt-PT",{minimumFractionDigits:2})}`} color={T.red} icon={AlertCircle} sub="em aberto" />
        <StatCard label="Encomendas"      value={CLIENTES.reduce((s,c)=>s+c.encomendas,0)} color={T.blue}   icon={ShoppingBag} sub="total acumulado" />
      </div>

      <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 50px 100px 100px 90px 80px", padding:"10px 20px", background:T.bg, borderBottom:`1px solid ${T.border}` }}>
          {["Cliente","Localidade","Tipo","Saldo","Limite Créd.","Última Enc.","Estado"].map(h=>(
            <div key={h} style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:1, fontFamily:"monospace" }}>{h}</div>
          ))}
        </div>
        {filtered.map((c,i) => {
          const pct = Math.round(c.saldo/c.limite*100);
          return (
            <div key={c.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 50px 100px 100px 90px 80px", padding:"14px 20px", borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none", alignItems:"center" }}
              onMouseEnter={e=>e.currentTarget.style.background=T.bg+"88"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{ fontWeight:600, color:T.text }}>{c.name}</div>
              <div style={{ fontSize:13, color:T.muted }}>{c.local}</div>
              <div><span style={{ background:T.navy+"18", color:T.navy, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700 }}>{c.type}</span></div>
              <div>
                <div style={{ fontWeight:700, color:c.saldo>0?T.red:T.green, fontSize:13 }}>€{c.saldo.toFixed(2)}</div>
                {c.saldo>0 && <div style={{ height:3, background:T.border, borderRadius:2, marginTop:3 }}><div style={{ width:`${Math.min(pct,100)}%`, height:"100%", background:pct>80?T.red:T.orange, borderRadius:2 }} /></div>}
              </div>
              <div style={{ fontSize:13, color:T.muted }}>€{c.limite.toLocaleString("pt-PT")}</div>
              <div style={{ fontSize:12, color:T.muted }}>{c.ult}</div>
              <div><span style={{ background:c.status==="ativo"?T.green+"18":T.muted+"18", color:c.status==="ativo"?T.green:T.muted, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{c.status==="ativo"?"Ativo":"Inativo"}</span></div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:12, fontSize:12, color:T.muted }}>* Dados sincronizados com Primavera ERP</div>
    </div>
  );
}

// ─── ECRÃ RELATÓRIOS ─────────────────────────────────────────────────────────
function RelatoriosScreen() {
  const months = ["Set","Out","Nov","Dez","Jan","Fev"];
  const salesData = [42000,38500,44200,51000,35800,29400];
  const maxSale = Math.max(...salesData);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", fontFamily:"monospace", marginBottom:4 }}>Análise de</div>
        <h1 style={{ margin:0, fontSize:28, fontWeight:800, color:T.navy, fontFamily:"'Georgia',serif" }}>Relatórios</h1>
      </div>

      <div style={{ display:"flex", gap:14, marginBottom:28 }}>
        <StatCard label="Faturação 2025 YTD" value="€65.200"  color={T.navy}   icon={TrendingUp}  sub="jan–fev 2025" />
        <StatCard label="Vs. ano anterior"   value="-8,4%"    color={T.red}    icon={BarChart2}   sub="mesmo período 2024" />
        <StatCard label="Encomendas app"      value="78"       color={T.blue}   icon={ShoppingBag} sub="desde lançamento" />
        <StatCard label="Clientes ativos"     value="4"        color={T.green}  icon={Users}       sub="utilizaram a app" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
        {/* Gráfico vendas */}
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontSize:16, fontWeight:700, color:T.navy, fontFamily:"'Georgia',serif" }}>Faturação Mensal</div>
            <span style={{ fontSize:11, color:T.muted, fontFamily:"monospace" }}>Set 2024 – Fev 2025</span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:160 }}>
            {salesData.map((v,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ fontSize:10, color:T.muted, fontFamily:"monospace" }}>€{Math.round(v/1000)}k</div>
                <div style={{ width:"100%", borderRadius:"6px 6px 0 0", background: i>=4 ? T.red : T.navy+"44", height:`${Math.round(v/maxSale*120)}px`, transition:"height .3s" }} />
                <div style={{ fontSize:11, color:T.muted }}>{months[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, display:"flex", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:2, background:T.navy+"44" }} /><span style={{ fontSize:11, color:T.muted }}>2024</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:2, background:T.red }} /><span style={{ fontSize:11, color:T.muted }}>2025</span></div>
          </div>
        </div>

        {/* Top produtos */}
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
          <div style={{ fontSize:16, fontWeight:700, color:T.navy, fontFamily:"'Georgia',serif", marginBottom:20 }}>Top Produtos</div>
          {[
            { name:"Sagres 33cl NR",      pct:28, val:"€18.2k" },
            { name:"Super Bock 33cl",     pct:22, val:"€14.3k" },
            { name:"Coca-Cola 33cl",      pct:15, val:"€9.8k"  },
            { name:"Red Bull 25cl",       pct:12, val:"€7.8k"  },
            { name:"Vinho Verde Gazela",  pct:9,  val:"€5.9k"  },
          ].map((item,i)=>(
            <div key={i} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:13, color:T.text, fontWeight:500 }}>{item.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:T.navy }}>{item.val}</span>
              </div>
              <div style={{ height:6, background:T.bg, borderRadius:3 }}>
                <div style={{ width:`${item.pct}%`, height:"100%", background:i===0?T.red:T.navy, borderRadius:3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Encomendas app */}
      <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
        <div style={{ fontSize:16, fontWeight:700, color:T.navy, fontFamily:"'Georgia',serif", marginBottom:16 }}>Encomendas via App — Últimas 5</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 100px 90px 80px", gap:0, background:T.bg, borderRadius:8, padding:"8px 16px", marginBottom:8 }}>
          {["Data","Cliente","Total","Produtos","Estado"].map(h=>(
            <div key={h} style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:1, fontFamily:"monospace" }}>{h}</div>
          ))}
        </div>
        {[
          { date:"26 Fev 2025", client:"Restaurante Marina",  total:"€842.50", prods:5, status:"confirmada" },
          { date:"22 Fev 2025", client:"Cervejaria Algarvia", total:"€1.230.00",prods:8, status:"entregue"   },
          { date:"20 Fev 2025", client:"Café Central",        total:"€390.80",  prods:3, status:"entregue"   },
          { date:"15 Fev 2025", client:"Hotel Algarve Sol",   total:"€2.150.00",prods:12,status:"entregue"   },
          { date:"10 Fev 2025", client:"Restaurante Marina",  total:"€590.80",  prods:4, status:"entregue"   },
        ].map((o,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 2fr 100px 90px 80px", padding:"12px 16px", borderBottom:i<4?`1px solid ${T.border}`:"none", alignItems:"center" }}>
            <div style={{ fontSize:13, color:T.muted }}>{o.date}</div>
            <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{o.client}</div>
            <div style={{ fontSize:13, fontWeight:700, color:T.navy }}>{o.total}</div>
            <div style={{ fontSize:12, color:T.muted }}>{o.prods} artigos</div>
            <div><span style={{ background:o.status==="confirmada"?T.orange+"22":T.green+"18", color:o.status==="confirmada"?T.orange:T.green, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{o.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ECRÃ DEFINIÇÕES ─────────────────────────────────────────────────────────
function DefinicoesScreen({ showToast }) {
  const [config, setConfig] = useState({
    emailNotif: true, appAtiva: true, syncAuto: true,
    emailDestino: "geral@empro.pt", syncHours: "6",
    appName: "EMPRO", welcomeMsg: "Bem-vindo à app EMPRO",
  });
  const set = (k,v) => setConfig(c=>({...c,[k]:v}));

  const inputStyle = { width:"100%", padding:"10px 12px", border:`1px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text, background:T.bg, outline:"none", boxSizing:"border-box" };
  const labelStyle = { fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:6, fontFamily:"monospace" };

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", fontFamily:"monospace", marginBottom:4 }}>Configuração do</div>
        <h1 style={{ margin:0, fontSize:28, fontWeight:800, color:T.navy, fontFamily:"'Georgia',serif" }}>Definições</h1>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* App */}
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.navy+"18", display:"flex", alignItems:"center", justifyContent:"center" }}><Settings size={18} color={T.navy} /></div>
            <div style={{ fontSize:16, fontWeight:700, color:T.navy, fontFamily:"'Georgia',serif" }}>Configuração da App</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div><label style={labelStyle}>Nome da App</label><input value={config.appName} onChange={e=>set("appName",e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Mensagem de Boas-vindas</label><input value={config.welcomeMsg} onChange={e=>set("welcomeMsg",e.target.value)} style={inputStyle} /></div>
            {[
              { key:"appAtiva", label:"App disponível para clientes" },
            ].map(opt=>(
              <div key={opt.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderTop:`1px solid ${T.border}` }}>
                <span style={{ fontSize:14, color:T.text }}>{opt.label}</span>
                <button onClick={()=>set(opt.key,!config[opt.key])} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
                  {config[opt.key] ? <ToggleRight size={28} color={T.green} /> : <ToggleLeft size={28} color={T.muted} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notificações */}
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.blue+"18", display:"flex", alignItems:"center", justifyContent:"center" }}><Bell size={18} color={T.blue} /></div>
            <div style={{ fontSize:16, fontWeight:700, color:T.navy, fontFamily:"'Georgia',serif" }}>Notificações</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div><label style={labelStyle}>Email de destino (encomendas)</label><input value={config.emailDestino} onChange={e=>set("emailDestino",e.target.value)} style={inputStyle} /></div>
            {[
              { key:"emailNotif", label:"Receber email por nova encomenda" },
            ].map(opt=>(
              <div key={opt.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderTop:`1px solid ${T.border}` }}>
                <span style={{ fontSize:14, color:T.text }}>{opt.label}</span>
                <button onClick={()=>set(opt.key,!config[opt.key])} style={{ background:"none", border:"none", cursor:"pointer" }}>
                  {config[opt.key] ? <ToggleRight size={28} color={T.green} /> : <ToggleLeft size={28} color={T.muted} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Primavera ERP */}
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.green+"18", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronRight size={18} color={T.green} /></div>
            <div style={{ fontSize:16, fontWeight:700, color:T.navy, fontFamily:"'Georgia',serif" }}>Integração Primavera ERP</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:T.green+"11", border:`1px solid ${T.green}33`, borderRadius:10 }}>
              <CheckCircle size={16} color={T.green} />
              <span style={{ fontSize:13, color:T.green, fontWeight:600 }}>Ligação ativa — Primavera BSS v10</span>
            </div>
            <div><label style={labelStyle}>Sincronização automática (horas)</label>
              <select value={config.syncHours} onChange={e=>set("syncHours",e.target.value)} style={inputStyle}>
                {["1","2","4","6","12","24"].map(h=><option key={h} value={h}>Cada {h}h</option>)}
              </select>
            </div>
            {[
              { key:"syncAuto", label:"Sincronização automática ativa" },
            ].map(opt=>(
              <div key={opt.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderTop:`1px solid ${T.border}` }}>
                <span style={{ fontSize:14, color:T.text }}>{opt.label}</span>
                <button onClick={()=>set(opt.key,!config[opt.key])} style={{ background:"none", border:"none", cursor:"pointer" }}>
                  {config[opt.key] ? <ToggleRight size={28} color={T.green} /> : <ToggleLeft size={28} color={T.muted} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Conta */}
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.red+"18", display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={18} color={T.red} /></div>
            <div style={{ fontSize:16, fontWeight:700, color:T.navy, fontFamily:"'Georgia',serif" }}>Conta de Administrador</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", gap:14, padding:"14px", background:T.bg, borderRadius:12, alignItems:"center" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:T.red, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"white", fontWeight:700 }}>S</div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Susana</div>
                <div style={{ fontSize:12, color:T.muted }}>Administrador · geral@empro.pt</div>
              </div>
            </div>
            <button style={{ padding:"11px", borderRadius:10, border:`1px solid ${T.border}`, background:T.bg, color:T.muted, fontSize:13, fontWeight:600, cursor:"pointer" }}>Alterar Palavra-passe</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop:16, display:"flex", justifyContent:"flex-end" }}>
        <button onClick={()=>showToast("Definições guardadas!")} style={{ padding:"12px 28px", borderRadius:12, border:"none", background:T.red, color:"white", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 14px ${T.red}44` }}>
          Guardar Definições
        </button>
      </div>
    </div>
  );
}

export default function BackOffice() {
  const [page, setPage] = useState("promocoes");
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [modal, setModal] = useState(null); // null | "new" | {editing promo}
  const [filter, setFilter] = useState("todas");
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = T.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (form) => {
    if (modal?.id) {
      setPromos(ps => ps.map(p => p.id === modal.id ? { ...p, ...form, discount: buildDiscount(form) } : p));
      showToast("Promoção atualizada com sucesso!");
    } else {
      const newP = { ...form, id: Date.now(), discount: buildDiscount(form), views: 0, orders: 0 };
      setPromos(ps => [newP, ...ps]);
      showToast("Nova promoção criada!");
    }
    setModal(null);
  };

  const buildDiscount = (f) => {
    if (f.type === "percentagem") return `${f.value}% OFF`;
    if (f.type === "valor") return `€${f.value}/cx`;
    return `+${f.value}cx`;
  };

  const handleToggle = (id) => {
    setPromos(ps => ps.map(p => p.id === id ? { ...p, active: !p.active } : p));
    showToast("Estado atualizado!");
  };

  const handleDelete = () => {
    setPromos(ps => ps.filter(p => p.id !== deleteId));
    setDeleteId(null);
    showToast("Promoção eliminada.", T.red);
  };

  const filtered = promos.filter(p => {
    if (filter === "ativas")   return p.active;
    if (filter === "inativas") return !p.active;
    if (filter === "destaque") return p.destaque;
    return true;
  });

  const stats = {
    total:    promos.length,
    ativas:   promos.filter(p => p.active).length,
    views:    promos.reduce((s,p) => s+p.views, 0),
    orders:   promos.reduce((s,p) => s+p.orders, 0),
  };

  return (
    <div style={{ fontFamily:"'Segoe UI','Helvetica Neue',sans-serif", background: T.bg, minHeight:"100vh", color: T.text }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background: toast.color, color:"white", padding:"12px 20px", borderRadius:12, fontSize:14, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,.2)" }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ position:"fixed", left:0, top:0, bottom:0, width:220, background: T.navyD, display:"flex", flexDirection:"column" }}>
        {/* Logo */}
        <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid ${T.navyL}` }}>
          <div style={{ fontSize:10, color: T.red, letterSpacing:3, fontFamily:"monospace", marginBottom:4 }}>BACK OFFICE</div>
          <div style={{ fontSize:22, fontWeight:800, color:"white", letterSpacing:2, fontFamily:"'Georgia',serif" }}>EMPRO</div>
        </div>

        {/* Nav */}
        <nav style={{ padding:"20px 0", flex:1 }}>
          {[
            { id:"promocoes",  icon: Megaphone, label:"Promoções"  },
            { id:"produtos",   icon: Package,   label:"Produtos"   },
            { id:"clientes",   icon: Users,     label:"Clientes"   },
            { id:"relatorios", icon: BarChart2, label:"Relatórios" },
            { id:"definicoes", icon: Settings,  label:"Definições" },
          ].map((item) => (
            <div key={item.id} onClick={() => setPage(item.id)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 20px",
              background: page===item.id ? T.red+"22" : "transparent",
              borderLeft: page===item.id ? `3px solid ${T.red}` : "3px solid transparent",
              color: page===item.id ? "white" : T.muted, fontSize:14,
              cursor:"pointer", transition:"all .15s",
            }}
              onMouseEnter={e=>{ if(page!==item.id) e.currentTarget.style.background=T.navyL+"44"; }}
              onMouseLeave={e=>{ if(page!==item.id) e.currentTarget.style.background="transparent"; }}
            >
              <item.icon size={16} />{item.label}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:"16px 20px", borderTop:`1px solid ${T.navyL}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background: T.red, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>S</div>
          <div>
            <div style={{ fontSize:13, color:"white", fontWeight:600 }}>Susana</div>
            <div style={{ fontSize:10, color: T.muted }}>Administrador</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft:220, padding:"32px 32px 60px" }}>
        {page === "promocoes" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
              <div>
                <div style={{ fontSize:11, color: T.muted, letterSpacing:2, textTransform:"uppercase", fontFamily:"monospace", marginBottom:4 }}>Gestão de</div>
                <h1 style={{ margin:0, fontSize:28, fontWeight:800, color: T.navy, fontFamily:"'Georgia',serif" }}>Promoções e Campanhas</h1>
              </div>
              <button onClick={() => setModal({})} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 22px", background: T.red, color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 14px ${T.red}55` }}>
                <Plus size={16} /> Nova Promoção
              </button>
            </div>
            <div style={{ display:"flex", gap:14, marginBottom:28 }}>
              <StatCard label="Total de Promoções" value={stats.total}  color={T.navy}   icon={Gift}        sub={`${stats.ativas} ativas`} />
              <StatCard label="Visualizações"      value={stats.views}  color={T.blue}   icon={Eye}         sub="últimos 30 dias" />
              <StatCard label="Encomendas Geradas" value={stats.orders} color={T.red}    icon={ShoppingBag} sub="por promoções" />
              <StatCard label="Taxa de Conversão"  value={stats.views ? Math.round(stats.orders/stats.views*100)+"%" : "—"} color={T.green} icon={TrendingUp} sub="média geral" />
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[
                { key:"todas",    label:"Todas",    count: promos.length },
                { key:"ativas",   label:"Ativas",   count: promos.filter(p=>p.active).length },
                { key:"inativas", label:"Inativas", count: promos.filter(p=>!p.active).length },
                { key:"destaque", label:"Destaque", count: promos.filter(p=>p.destaque).length },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding:"8px 16px", borderRadius:20, border:`1px solid ${filter===f.key ? T.red : T.border}`, background: filter===f.key ? T.red : T.white, color: filter===f.key ? "white" : T.muted, fontSize:13, fontWeight: filter===f.key ? 700 : 400, cursor:"pointer" }}>
                  {f.label} <span style={{ opacity:0.7 }}>({f.count})</span>
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
              {filtered.map(p => (
                <PromoCard key={p.id} p={p} onEdit={setModal} onToggle={handleToggle} onDelete={setDeleteId} />
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 20px", color: T.muted }}>
                  <Gift size={48} color={T.border} style={{margin:"0 auto 12px"}} />
                  <div style={{ fontSize:16 }}>Nenhuma promoção encontrada.</div>
                </div>
              )}
            </div>
          </div>
        )}
        {page === "produtos"   && <ProdutosScreen />}
        {page === "clientes"   && <ClientesScreen />}
        {page === "relatorios" && <RelatoriosScreen />}
        {page === "definicoes" && <DefinicoesScreen showToast={showToast} />}
      </div>

      {/* Modal criar/editar */}
      {modal !== null && (
        <Modal title={modal?.id ? "Editar Promoção" : "Nova Promoção"} onClose={() => setModal(null)}>
          <PromoForm initial={modal?.id ? modal : null} onSave={handleSave} onClose={() => setModal(null)} />
        </Modal>
      )}

      {/* Modal confirmar eliminação */}
      {deleteId && (
        <Modal title="Eliminar Promoção" onClose={() => setDeleteId(null)}>
          <div style={{ textAlign:"center", padding:"10px 0 20px" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:T.red+"18", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Trash2 size={28} color={T.red} />
            </div>
            <div style={{ fontSize:16, color: T.text, marginBottom:8 }}>Tem a certeza que quer eliminar esta promoção?</div>
            <div style={{ fontSize:13, color: T.muted, marginBottom:24 }}>Esta ação não pode ser revertida.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex:1, padding:"12px", borderRadius:10, border:`1px solid ${T.border}`, background: T.bg, color: T.muted, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} style={{ flex:1, padding:"12px", borderRadius:10, border:"none", background: T.red, color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                Sim, Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
