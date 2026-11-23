// =====================================================================
// AVELÃ 😺 — o mascote do Entrelinhas (RNF02)
// ---------------------------------------------------------------------
// Desenhado em SVG puro: leve, nítido em qualquer tamanho e fácil de
// mudar. Para ajustar cores, mexa no objeto CORES abaixo.
//
// Props:
//   tamanho     -> largura/altura em px (padrão 120)
//   variante    -> avatar: classico | leitor | cachecol | laco | noturno | formatura
//   expressao   -> feliz | pensativo | preocupado | dormindo
//   somenteRosto-> recorta só a cabeça (bom para avatares redondos)
//   decorativo  -> true esconde dos leitores de tela
// =====================================================================

const CORES = {
  pelo: '#c8894b', // caramelo
  peloEscuro: '#8a5a33', // marrom avelã
  creme: '#fbf1e2',
  olho: '#3b2416',
  nariz: '#b5675a',
  bochecha: '#e9a88b',
  orelhaInterna: '#e7b79a',
  verde: '#5e7f4e',
  verdeEscuro: '#475f3a',
};

function Olhos({ expressao }) {
  if (expressao === 'dormindo') {
    return (
      <g stroke={CORES.olho} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M42 53 q5 4 10 0" />
        <path d="M68 53 q5 4 10 0" />
      </g>
    );
  }

  const olharY = expressao === 'pensativo' ? -2 : 0;
  const olharX = expressao === 'pensativo' ? 1.5 : 0;

  return (
    <g>
      <ellipse cx={47 + olharX} cy={52 + olharY} rx="4.2" ry="5.2" fill={CORES.olho} />
      <ellipse cx={73 + olharX} cy={52 + olharY} rx="4.2" ry="5.2" fill={CORES.olho} />
      <circle cx={48.6 + olharX} cy={50 + olharY} r="1.6" fill="#fff" />
      <circle cx={74.6 + olharX} cy={50 + olharY} r="1.6" fill="#fff" />
      {expressao === 'preocupado' && (
        <g stroke={CORES.peloEscuro} strokeWidth="2.2" strokeLinecap="round">
          <path d="M41 44 l9 -3.5" />
          <path d="M79 44 l-9 -3.5" />
        </g>
      )}
    </g>
  );
}

function Boca({ expressao }) {
  if (expressao === 'preocupado') {
    return <path d="M55 68 q5 -3 10 0" stroke={CORES.olho} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
  }
  if (expressao === 'pensativo') {
    return <circle cx="60" cy="67" r="1.8" fill={CORES.olho} />;
  }
  return (
    <path
      d="M60 63.5 q-3 4.5 -6.5 1.2 M60 63.5 q3 4.5 6.5 1.2"
      stroke={CORES.olho}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
    />
  );
}

// ---------- Acessórios de cada avatar ----------
function Acessorio({ variante }) {
  switch (variante) {
    case 'leitor':
      return (
        <g stroke={CORES.olho} strokeWidth="2" fill="rgba(255,255,255,0.18)">
          <circle cx="47" cy="52" r="8.5" />
          <circle cx="73" cy="52" r="8.5" />
          <path d="M55.5 51 q4.5 -3 9 0" fill="none" />
        </g>
      );
    case 'cachecol':
      return (
        <g>
          <path d="M33 72 Q60 86 87 72 L87 81 Q60 95 33 81 Z" fill={CORES.verde} />
          <path d="M71 82 l3 20 l9 -2 l-3 -19 z" fill={CORES.verdeEscuro} />
          <path d="M73 92 l8 -1.5 M74 97 l8 -1.5" stroke="#d9e4cf" strokeWidth="1.6" />
        </g>
      );
    case 'laco':
      return (
        <g>
          <path d="M82 27 l-11 -8 v16 z" fill="#d07a5e" />
          <path d="M82 27 l11 -8 v16 z" fill="#d07a5e" />
          <circle cx="82" cy="27" r="3.4" fill="#b0533a" />
        </g>
      );
    case 'noturno':
      return (
        <g>
          <path d="M95 3 a8 8 0 1 0 6.5 12 a6.5 6.5 0 1 1 -6.5 -12 z" fill="#e0b04b" />
          <text x="96" y="36" fontSize="10" fontWeight="700" fill={CORES.peloEscuro} fontFamily="Nunito, sans-serif">
            z
          </text>
          <text x="103" y="27" fontSize="7" fontWeight="700" fill={CORES.peloEscuro} fontFamily="Nunito, sans-serif">
            z
          </text>
        </g>
      );
    case 'formatura':
      return (
        <g>
          <path d="M43 29 v8 q17 7 34 0 v-8" fill="#3b2c22" />
          <path d="M28 25 L60 12 L92 25 L60 38 Z" fill="#2e211a" />
          <path d="M60 25 L86 30 v12" stroke="#e0b04b" strokeWidth="2" fill="none" />
          <circle cx="86" cy="43" r="2.8" fill="#e0b04b" />
        </g>
      );
    default:
      return null;
  }
}

export default function Avela({
  tamanho = 120,
  variante = 'classico',
  expressao,
  somenteRosto = false,
  decorativo = false,
  className = '',
  titulo = 'Avelã, o gatinho do Entrelinhas',
}) {
  const expr = expressao || (variante === 'noturno' ? 'dormindo' : 'feliz');
  const viewBox = somenteRosto ? '18 4 84 84' : '0 0 120 120';

  return (
    <svg
      className={`avela ${className}`}
      width={tamanho}
      height={tamanho}
      viewBox={viewBox}
      role={decorativo ? undefined : 'img'}
      aria-hidden={decorativo || undefined}
      aria-label={decorativo ? undefined : titulo}
    >
      {!somenteRosto && (
        <g className="avela__corpo">
          {/* rabo */}
          <path d="M84 100 C104 102 114 86 104 72" stroke={CORES.pelo} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M106 77 C108 74 106 71 104 72" stroke={CORES.peloEscuro} strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* corpo e barriga */}
          <ellipse cx="60" cy="93" rx="28" ry="22" fill={CORES.pelo} />
          <ellipse cx="60" cy="98" rx="15" ry="13" fill={CORES.creme} />
          {/* patinhas */}
          <ellipse className="avela__pata" cx="49" cy="113" rx="8" ry="5" fill={CORES.creme} />
          <ellipse cx="71" cy="113" rx="8" ry="5" fill={CORES.creme} />
        </g>
      )}

      {/* orelhas */}
      <path d="M30 40 L27 12 Q28 9 31 11 L54 28 Z" fill={CORES.peloEscuro} />
      <path d="M33 34 L31 18 L47 29 Z" fill={CORES.orelhaInterna} />
      <path d="M90 40 L93 12 Q92 9 89 11 L66 28 Z" fill={CORES.peloEscuro} />
      <path d="M87 34 L89 18 L73 29 Z" fill={CORES.orelhaInterna} />

      {/* cabeça */}
      <ellipse cx="60" cy="52" rx="33" ry="28" fill={CORES.pelo} />
      <path
        d="M60 25 v8 M52.5 26.5 l2 6.5 M67.5 26.5 l-2 6.5"
        stroke={CORES.peloEscuro}
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* focinho, bochechas e bigodes */}
      <ellipse cx="60" cy="63" rx="12.5" ry="9" fill={CORES.creme} />
      <circle cx="39" cy="62" r="5" fill={CORES.bochecha} opacity="0.55" />
      <circle cx="81" cy="62" r="5" fill={CORES.bochecha} opacity="0.55" />
      <g stroke={CORES.peloEscuro} strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
        <path d="M45 63 L29 60 M45 66 L29 68" />
        <path d="M75 63 L91 60 M75 66 L91 68" />
      </g>

      <Olhos expressao={expr} />
      <path d="M56.5 59 h7 l-3.5 4 z" fill={CORES.nariz} />
      <Boca expressao={expr} />

      <Acessorio variante={variante} />
    </svg>
  );
}
