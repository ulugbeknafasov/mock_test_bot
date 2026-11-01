
(function () {
  "use strict";

  // ==========================================
  // 1. KIMYOVIY ELEMENTLAR — 118 TA
  // ==========================================

  const ELEMENTS = [
    ["H","Vodorod"],["He","Geliy"],["Li","Litiy"],["Be","Berilliy"],
    ["B","Bor"],["C","Uglerod"],["N","Azot"],["O","Kislorod"],
    ["F","Ftor"],["Ne","Neon"],["Na","Natriy"],["Mg","Magniy"],
    ["Al","Alyuminiy"],["Si","Kremniy"],["P","Fosfor"],["S","Oltingugurt"],
    ["Cl","Xlor"],["Ar","Argon"],["K","Kaliy"],["Ca","Kalsiy"],
    ["Sc","Skandiy"],["Ti","Titan"],["V","Vanadiy"],["Cr","Xrom"],
    ["Mn","Marganes"],["Fe","Temir"],["Co","Kobalt"],["Ni","Nikel"],
    ["Cu","Mis"],["Zn","Rux"],["Ga","Galliy"],["Ge","Germaniy"],
    ["As","Mishyak"],["Se","Selen"],["Br","Brom"],["Kr","Kripton"],
    ["Rb","Rubidiy"],["Sr","Stronsiy"],["Y","Itriy"],["Zr","Sirkoniy"],
    ["Nb","Niobiy"],["Mo","Molibden"],["Tc","Texnetsiy"],["Ru","Ruteniy"],
    ["Rh","Rodiy"],["Pd","Palladiy"],["Ag","Kumush"],["Cd","Kadmiy"],
    ["In","Indiy"],["Sn","Qalay"],["Sb","Surma"],["Te","Tellur"],
    ["I","Yod"],["Xe","Ksenon"],["Cs","Seziy"],["Ba","Bariy"],
    ["La","Lantan"],["Ce","Seriy"],["Pr","Prazeodim"],["Nd","Neodim"],
    ["Pm","Prometiy"],["Sm","Samariy"],["Eu","Yevropiy"],["Gd","Gadoliniy"],
    ["Tb","Terbiy"],["Dy","Disprosiy"],["Ho","Golmiy"],["Er","Erbiy"],
    ["Tm","Tuliy"],["Yb","Itterbiy"],["Lu","Lyutetsiy"],["Hf","Gafniy"],
    ["Ta","Tantal"],["W","Volfram"],["Re","Reniy"],["Os","Osmiy"],
    ["Ir","Iridiy"],["Pt","Platina"],["Au","Oltin"],["Hg","Simob"],
    ["Tl","Talliy"],["Pb","Qo‘rg‘oshin"],["Bi","Vismut"],["Po","Poloniy"],
    ["At","Astat"],["Rn","Radon"],["Fr","Fransiy"],["Ra","Radiy"],
    ["Ac","Aktiniy"],["Th","Toriy"],["Pa","Protaktiniy"],["U","Uran"],
    ["Np","Neptuniy"],["Pu","Plutoniy"],["Am","Ameritsiy"],["Cm","Kyuriy"],
    ["Bk","Berkliy"],["Cf","Kaliforniy"],["Es","Eynshteyniy"],["Fm","Fermiy"],
    ["Md","Mendeleviy"],["No","Nobeliy"],["Lr","Lourensiy"],["Rf","Rezerfordiy"],
    ["Db","Dubniy"],["Sg","Seaborgiy"],["Bh","Boriy"],["Hs","Hassiy"],
    ["Mt","Meytneriy"],["Ds","Darmshtadtiy"],["Rg","Rentgeniy"],["Cn","Kopernitsiy"],
    ["Nh","Nihoniy"],["Fl","Fleroviy"],["Mc","Moskoviy"],["Lv","Livermoriy"],
    ["Ts","Tennessin"],["Og","Oganesson"]
  ];

  // ==========================================
  // 2. FANLAR UCHUN KLAVIATURA BANKLARI
  // ==========================================

  const COMMON = {
    "Daraja va indeks": [
      {label:"xⁿ",value:"^{ }"},
      {label:"xₙ",value:"_{ }"},
      {label:"xⁿₘ",value:"^{ }_{ }"},
      {label:"Manfiy daraja",value:"^{- }"},
      {label:"Kvadrat",value:"^{2}"},
      {label:"Kub",value:"^{3}"},
      {label:"10 daraja",value:"\\times 10^{ }"}
    ],
    "Kasrlar": [
      {label:"a/b",value:"\\frac{}{}"},
      {label:"d/dx",value:"\\frac{d}{dx}"},
      {label:"∂/∂x",value:"\\frac{\\partial}{\\partial x}"},
      {label:"Δx/Δt",value:"\\frac{\\Delta x}{\\Delta t}"}
    ],
    "Qavslar": [
      "(",")","[","]","\\{","\\}",
      "|","\\|","\\lceil","\\rceil","\\lfloor","\\rfloor"
    ]
  };

  const BANKS = {
    matematika: {
      "Raqamlar": ["0","1","2","3","4","5","6","7","8","9",".",",","+","−","="],
      "Lotin harflari": "abcdefghijklmnopqrstuvwxyz".split("").concat(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
      ),
      "Yunon harflari": [
        "\\alpha","\\Alpha","\\beta","\\Beta","\\gamma","\\Gamma",
        "\\delta","\\Delta","\\epsilon","\\Epsilon","\\zeta","\\Zeta",
        "\\eta","\\Eta","\\theta","\\Theta","\\iota","\\Iota",
        "\\kappa","\\Kappa","\\lambda","\\Lambda","\\mu","\\Mu",
        "\\nu","\\Nu","\\xi","\\Xi","\\pi","\\Pi","\\rho","\\Rho",
        "\\sigma","\\Sigma","\\tau","\\Tau","\\upsilon","\\Upsilon",
        "\\phi","\\Phi","\\chi","\\Chi","\\psi","\\Psi","\\omega","\\Omega"
      ],
      ...COMMON,
      "Trigonometriya": [
        "\\sin(x)","\\cos(x)","\\tan(x)","\\cot(x)",
        "\\sin^{ }(x)","\\cos^{ }(x)","\\tan^{ }(x)","\\cot^{ }(x)",
        "\\arcsin(x)","\\arccos(x)","\\arctan(x)","\\operatorname{arccot}(x)",
        "\\sinh(x)","\\cosh(x)","\\tanh(x)","\\coth(x)",
        "\\pi","\\frac{\\pi}{2}","^{\\circ}"
      ],
      "Integrallar": [
        "\\int",
        "\\int_{ }^{ }",
        "\\iint",
        "\\iiint",
        "\\oint",
        "\\oiint",
        "\\int f(x)\\,dx",
        "\\int_{ }^{ } f(x)\\,dx",
        "\\int_C f(x)\\,dx",
        "\\,dx","\\,dy","\\,dz","\\,dt"
      ],
      "Hosilalar va analiz": [
        "f'(x)","f''(x)","f^{(n)}(x)",
        "\\frac{dy}{dx}","\\frac{d^2y}{dx^2}",
        "\\frac{\\partial f}{\\partial x}",
        "\\frac{\\partial^2 f}{\\partial x^2}",
        "\\lim_{x\\to a}","\\lim_{x\\to\\infty}",
        "\\sum_{i=1}^{n}","\\prod_{i=1}^{n}",
        "\\nabla","\\Delta","\\partial"
      ],
      "Matematik belgilar": [
        "+","−","\\times","\\div","\\cdot","\\pm","\\mp",
        "=","\\neq","\\approx","\\equiv","<",">","\\leq","\\geq",
        "\\infty","\\propto","\\sqrt{}","\\sum","\\prod",
        "\\in","\\notin","\\subset","\\subseteq","\\cup","\\cap",
        "\\emptyset","\\forall","\\exists","\\land","\\lor",
        "\\Rightarrow","\\Leftrightarrow","\\angle","\\perp","\\parallel"
      ]
    },

    fizika: {
      "Raqamlar": ["0","1","2","3","4","5","6","7","8","9",".",",","+","−","="],
      "Lotin harflari": "abcdefghijklmnopqrstuvwxyz".split("").concat(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
      ),
      "Yunon harflari": [
        "\\alpha","\\Alpha","\\beta","\\Beta","\\gamma","\\Gamma",
        "\\delta","\\Delta","\\epsilon","\\zeta","\\eta","\\theta",
        "\\Theta","\\lambda","\\Lambda","\\mu","\\nu","\\xi","\\pi",
        "\\rho","\\sigma","\\tau","\\phi","\\Phi","\\omega","\\Omega"
      ],
      ...COMMON,
      "Mexanika": [
        "F=ma","p=mv","v=\\frac{s}{t}","a=\\frac{v}{t}",
        "E_k=\\frac{mv^2}{2}","E_p=mgh","A=Fs",
        "P=\\frac{A}{t}","F_g=mg","F=\\mu N",
        "\\Delta s","\\Delta t","\\Delta v","g","v_0"
      ],
      "Elektr": [
        "I=\\frac{U}{R}","U=IR","P=UI","R=\\frac{U}{I}",
        "q=It","F=k\\frac{q_1q_2}{r^2}",
        "C=\\frac{q}{U}","W=\\frac{CU^2}{2}",
        "\\varepsilon","\\Omega","\\mu_0","\\varepsilon_0"
      ],
      "Issiqlik": [
        "Q=cm\\Delta T","Q=\\lambda m","Q=rm",
        "\\Delta T","T","t","c","\\eta","R"
      ],
      "Optika va to‘lqinlar": [
        "n=\\frac{c}{v}","\\lambda","\\nu","T=\\frac{1}{\\nu}",
        "v=\\lambda\\nu","\\alpha","\\beta","\\theta","\\varphi",
        "\\sin","\\cos","\\tan"
      ],
      "Fizik kattaliklar va birliklar": [
        "\\mathrm{m}","\\mathrm{s}","\\mathrm{kg}","\\mathrm{N}",
        "\\mathrm{J}","\\mathrm{W}","\\mathrm{Pa}","\\mathrm{V}",
        "\\mathrm{A}","\\mathrm{Hz}","\\mathrm{C}",
        "\\Omega","\\mathrm{K}","\\mathrm{mol}"
      ]
    },

    kimyo: {
      "Raqamlar": ["0","1","2","3","4","5","6","7","8","9",".",",","+","−","="],
      "Lotin harflari": "abcdefghijklmnopqrstuvwxyz".split("").concat(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
      ),
      "Elementlar": [],
      "Reaksiyalar": [
        "\\rightarrow","\\leftarrow","\\rightleftharpoons",
        "\\leftrightarrow","\\Longrightarrow",
        "\\uparrow","\\downarrow","+","=","\\Delta",
        "\\xrightarrow{t^\\circ}",
        "\\xrightarrow{kat.}",
        "\\xrightarrow{p}",
        "\\xrightarrow{h\\nu}"
      ],
      "Ionlar": [
        "Na^+","K^+","Ca^{2+}","Mg^{2+}","Al^{3+}",
        "Fe^{2+}","Fe^{3+}","Cl^-","OH^-","NO_3^-",
        "SO_4^{2-}","CO_3^{2-}","PO_4^{3-}",
        "NH_4^+","H_3O^+","H^+","e^-"
      ],
      "Kimyoviy formulalar": [
        "H_2O","CO_2","O_2","N_2","H_2",
        "NH_3","CH_4","HCl","H_2SO_4",
        "NaOH","CaCO_3","C_6H_{12}O_6",
        "CuSO_4\\cdot 5H_2O"
      ],
      "Kimyoviy bog‘lanish": [
        "—","=","\\equiv","\\cdot",
        "e^-","p^+","n^0","\\delta^+","\\delta^-","\\leftrightarrow"
      ],
      "Kimyoviy hisoblash": [
        "n","m","V","M","C","C_M","\\rho",
        "A_r","M_r","\\omega","R","N_A",
        "pH","pOH","t^\\circ","P"
      ],
      "Izotoplar va boshqa belgilar": [
        "{}^{14}_{6}C","{}^{12}_{6}C",
        "{}^{23}_{11}Na","{}^{35}_{17}Cl",
        "\\Delta","\\uparrow","\\downarrow","\\cdot",
        "(aq)","(s)","(l)","(g)"
      ]
    },

    biologiya: {
      "Raqamlar": ["0","1","2","3","4","5","6","7","8","9",".",",","+","−","="],
      "Lotin harflari": "abcdefghijklmnopqrstuvwxyz".split("").concat(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
      ),
      "Genetika": [
        "AA","Aa","aa","BB","Bb","bb",
        "X^A","X^a","Y","XX","XY",
        "P","G","F_1","F_2","F_3",
        "\\female","\\male","\\times","\\rightarrow",
        "1:1","3:1","1:2:1","9:3:3:1"
      ],
      "DNK va RNK": [
        "DNA","RNA","mRNA","tRNA","rRNA",
        "A","T","G","C","U",
        "A-T","G-C","A-U",
        "5'","3'","ATP","ADP","AMP",
        "NAD","NADH","NADP","NADPH","FAD","FADH_2"
      ],
      "Xromosomalar": [
        "n","2n","3n","4n",
        "XX","XY","X^A","X^a",
        "P","F_1","F_2","G"
      ],
      "Hujayra": [
        "Hujayra","Mitoz","Meyoz","Yadro",
        "Membrana","Sitoplazma","Ribosoma",
        "Mitoxondriya","Xloroplast","Vakuola"
      ],
      "Anatomiya va fiziologiya": [
        "Hb","RBC","WBC","PLT",
        "P","T","V","f","O_2","CO_2","H_2O"
      ],
      "Botanika": [
        "Chl","CO_2","H_2O","O_2",
        "6CO_2+6H_2O","C_6H_{12}O_6",
        "Xlorofill","Xloroplast"
      ],
      "Zoologiya": [
        "\\female","\\male","\\rightarrow",
        "\\times","P","F_1","F_2"
      ],
      "Ekologiya va evolyutsiya": [
        "N","r","t","B","K","E",
        "\\rightarrow","\\approx","\\Delta N","\\Delta t"
      ],
      "Biologik belgilar": [
        "\\female","\\male","\\times","\\rightarrow",
        "\\uparrow","\\downarrow","\\approx",
        "\\mu m","\\%","\\alpha","\\beta","\\gamma",
        "n","2n","3n","4n"
      ]
    }
  };

  // Elementlar ro'yxatini kimyo bankiga qo'shish
  BANKS.kimyo["Elementlar"] = ELEMENTS.map(item => ({
    type: "element",
    symbol: item[0],
    name: item[1]
  }));

  // ==========================================
  // 3. MATHLIVE VA MUHARRIR HOLATI
  // ==========================================

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let mathfield = null;
  let scriptPromise = null;

  function loadMathLive() {
    if (customElements.get("math-field")) {
      return Promise.resolve();
    }

    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="mathlive"]');
      const script = existing || document.createElement("script");

      const onLoad = () => {
        if (customElements.get("math-field")) resolve();
        else reject(new Error("MathLive elementi topilmadi."));
      };

      const onError = () => {
        reject(new Error("Formula kutubxonasi yuklanmadi."));
      };

      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener("error", onError, { once: true });

      if (!existing) {
        script.src = "https://cdn.jsdelivr.net/npm/mathlive";
        document.head.appendChild(script);
      }
    }).catch(error => {
      scriptPromise = null;
      throw error;
    });

    return scriptPromise;
  }

  // ==========================================
  // 4. DIZAYN
  // ==========================================

  function addStyles() {
    if (document.getElementById("formula-editor-styles")) return;

    const style = document.createElement("style");
    style.id = "formula-editor-styles";

    style.textContent = `
      .fm-backdrop {
        position:fixed;
        inset:0;
        z-index:2147483000;
        background:rgba(8,13,25,.68);
        display:flex;
        align-items:flex-end;
        justify-content:center;
        padding:8px;
        box-sizing:border-box;
      }

      .fm-backdrop[hidden] {
        display:none!important;
      }

      .fm-panel {
        width:min(900px,100%);
        max-height:94dvh;
        overflow:auto;
        overscroll-behavior:contain;
        background:#0756b8;
        color:white;
        border-radius:18px;
        padding:12px;
        box-sizing:border-box;
        font-family:Arial,sans-serif;
        box-shadow:0 20px 70px #0008;
      }

      .fm-head {
        display:flex;
        justify-content:space-between;
        align-items:center;
        font-size:18px;
        font-weight:bold;
        margin-bottom:10px;
        position:sticky;
        top:0;
        z-index:5;
        background:#0756b8;
        padding:5px 0;
      }

      .fm-close {
        width:40px;
        height:40px;
        border:0;
        border-radius:9px;
        background:#334155;
        color:white;
        font-size:25px;
      }

      .fm-field {
        display:block;
        width:100%;
        min-height:75px;
        background:white;
        color:#111827;
        border:1px solid #cbd5e1;
        border-radius:12px;
        padding:10px;
        font-size:25px;
        margin-bottom:12px;
        box-sizing:border-box;
      }

      .fm-section {
        margin:13px 0 17px;
      }

      .fm-section-title {
        font-size:15px;
        font-weight:bold;
        padding:9px 3px;
        border-bottom:1px solid #ffffff55;
        margin-bottom:8px;
      }

      .fm-keys {
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:6px;
      }

      .fm-key {
        min-height:45px;
        border:0;
        border-radius:8px;
        background:white;
        color:#12345a;
        font-size:16px;
        font-weight:600;
        padding:5px;
        overflow:hidden;
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        touch-action:manipulation;
      }

      .fm-key:active {
        background:#dbeafe;
        transform:scale(.97);
      }

      .fm-key math-field {
        pointer-events:none;
        border:0;
        background:transparent;
        min-width:0;
        font-size:18px;
      }

      .fm-key.fm-element {
        position:relative;
        min-height:76px;
        flex-direction:column;
        gap:2px;
      }

      .fm-element-number {
        font-size:9px;
        align-self:flex-start;
        color:#64748b;
      }

      .fm-element-symbol {
        font-size:21px;
        font-weight:bold;
      }

      .fm-element-name {
        font-size:9px;
        color:#64748b;
      }

      .fm-element-fields {
        display:flex;
        flex-direction:column;
        gap:2px;
        width:37px;
        position:absolute;
        right:3px;
        top:4px;
      }

      .fm-element-fields input {
        width:100%;
        height:19px;
        min-width:0;
        padding:0 2px;
        box-sizing:border-box;
        border:1px solid #94a3b8;
        border-radius:3px;
        background:white;
        color:#111827;
        font-size:11px;
        text-align:center;
        outline:none;
      }

      .fm-element-fields input:focus {
        border-color:#2563eb;
        box-shadow:0 0 0 1px #2563eb;
      }

      .fm-search {
        width:100%;
        height:40px;
        border:0;
        border-radius:8px;
        padding:8px 10px;
        margin-bottom:8px;
        box-sizing:border-box;
        font-size:15px;
      }

      .fm-fixed-tools {
        position:sticky;
        bottom:0;
        z-index:10;
        display:flex;
        gap:6px;
        padding:8px 0 3px;
        background:#0756b8;
      }

      .fm-fixed-tools button {
        flex:1;
        min-height:45px;
        border:0;
        border-radius:9px;
        font-size:17px;
        font-weight:bold;
        background:#fff;
        color:#12345a;
        touch-action:manipulation;
      }

      .fm-actions {
        display:flex;
        gap:8px;
        position:sticky;
        bottom:0;
        background:#0756b8;
        padding:7px 0 2px;
        z-index:11;
      }

      .fm-actions button {
        flex:1;
        min-height:46px;
        border:0;
        border-radius:10px;
        font-size:15px;
        font-weight:bold;
      }

      .fm-cancel {
        background:#334155;
        color:white;
      }

      .fm-save {
        background:#0f9f82;
        color:white;
      }

      .fm-open {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:40px;
        height:40px;
        margin-left:5px;
        border:0;
        border-radius:9px;
        background:#e0f2fe;
        color:#075985;
        font-weight:bold;
        cursor:pointer;
      }

      @media(max-width:480px) {
        .fm-panel {padding:9px;}
        .fm-keys {grid-template-columns:repeat(4,minmax(0,1fr));}
        .fm-key {min-height:43px;font-size:14px;}
        .fm-element-symbol {font-size:19px;}
        .fm-element-fields {width:32px;}
      }
    `;

    document.head.appendChild(style);
  }

  // ==========================================
  // 5. MODAL
  // ==========================================

  function ensureModal() {
    if (modal) return;

    addStyles();

    modal = document.createElement("div");
    modal.className = "fm-backdrop";
    modal.hidden = true;

    modal.innerHTML = `
      <section class="fm-panel" role="dialog"
        aria-modal="true" aria-label="Formula muharriri">

        <div class="fm-head">
          <span id="fm-title">Formula muharriri</span>
          <button type="button" class="fm-close" id="fm-close">×</button>
        </div>

        <math-field id="fm-field" class="fm-field"
          virtual-keyboard-mode="manual"></math-field>

        <div id="fm-sections"></div>

        <div class="fm-fixed-tools">
          <button type="button" id="fm-backspace" title="O‘chirish">⌫</button>
          <button type="button" id="fm-undo" title="Bekor qilish">↶</button>
          <button type="button" id="fm-redo" title="Qaytarish">↷</button>
          <button type="button" id="fm-clear" title="Tozalash">C</button>
        </div>

        <div class="fm-actions">
          <button type="button" class="fm-cancel" id="fm-cancel">Bekor qilish</button>
          <button type="button" class="fm-save" id="fm-save">Kiritish ✓</button>
        </div>
      </section>
    `;

    document.body.appendChild(modal);
    mathfield = modal.querySelector("#fm-field");

    modal.querySelector("#fm-close").addEventListener("click", close);
    modal.querySelector("#fm-cancel").addEventListener("click", close);
    modal.querySelector("#fm-save").addEventListener("click", save);

    modal.querySelector("#fm-backspace").addEventListener("click", () => {
      try {
        mathfield.executeCommand("deleteBackward");
      } catch (_) {}
      mathfield.focus();
    });

    modal.querySelector("#fm-undo").addEventListener("click", () => {
      try { mathfield.executeCommand("undo"); } catch (_) {}
      mathfield.focus();
    });

    modal.querySelector("#fm-redo").addEventListener("click", () => {
      try { mathfield.executeCommand("redo"); } catch (_) {}
      mathfield.focus();
    });

    modal.querySelector("#fm-clear").addEventListener("click", () => {
      mathfield.value = "";
      mathfield.focus();
    });

    modal.addEventListener("click", ev => {
      if (ev.target === modal) close();
    });

    modal.addEventListener("keydown", ev => {
      if (ev.key === "Escape") close();
    });
  }

  // ==========================================
  // 6. FORMULA KIRITISH
  // ==========================================

  function insertValue(value) {
    if (!mathfield) return;

    try {
      mathfield.focus();

      if (typeof mathfield.insert === "function") {
        mathfield.insert(value);
      } else {
        mathfield.executeCommand(["insert", value]);
      }
    } catch (_) {
      mathfield.value = (mathfield.value || "") + value;
    }
  }

  function renderLabel(button, latex) {
    const mf = document.createElement("math-field");
    mf.setAttribute("read-only", "");
    mf.setAttribute("virtual-keyboard-mode", "off");
    mf.value = latex;
    button.appendChild(mf);
  }

  // ==========================================
  // 7. ELEMENT TUGMALARI
  // ==========================================

  function renderElement(container, element, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fm-key fm-element";
    button.title = element.name;

    const number = document.createElement("span");
    number.className = "fm-element-number";
    number.textContent = index + 1;

    const symbol = document.createElement("span");
    symbol.className = "fm-element-symbol";
    symbol.textContent = element.symbol;

    const name = document.createElement("span");
    name.className = "fm-element-name";
    name.textContent = element.name;

    const fields = document.createElement("span");
    fields.className = "fm-element-fields";

    const power = document.createElement("input");
    power.type = "text";
    power.inputMode = "text";
    power.placeholder = "Daraja";
    power.setAttribute("aria-label", element.symbol + " darajasi");

    const subscript = document.createElement("input");
    subscript.type = "text";
    subscript.inputMode = "text";
    subscript.placeholder = "Indeks";
    subscript.setAttribute("aria-label", element.symbol + " indeksi");

    fields.append(power, subscript);
    button.append(number, symbol, name, fields);

    fields.addEventListener("click", ev => ev.stopPropagation());

    [power, subscript].forEach(input => {
      input.addEventListener("keydown", ev => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          button.click();
        }
      });
    });

    button.addEventListener("click", ev => {
      ev.preventDefault();
      ev.stopPropagation();

      const sup = power.value.trim();
      const sub = subscript.value.trim();

      const validSup = sup && sup !== "1" ? sup : "";
      const validSub = sub && sub !== "1" ? sub : "";

      let latex = "\\mathrm{" + element.symbol + "}";

      if (validSup) {
        latex += "^{" + validSup + "}";
      }

      if (validSub) {
        latex += "_{" + validSub + "}";
      }

      insertValue(latex);

      power.value = "";
      subscript.value = "";
    });

    container.appendChild(button);
  }

  // ==========================================
  // 8. ODDIY KLAVIATURA
  // ==========================================

  function createBasicKeyboard(container) {
    const section = document.createElement("section");
    section.className = "fm-section";

    const title = document.createElement("div");
    title.className = "fm-section-title";
    title.textContent = "Oddiy klaviatura";

    const keys = document.createElement("div");
    keys.className = "fm-keys";

    const letters = [
      ..."qwertyuiop",
      ..."asdfghjkl",
      ..."zxcvbnm",
      ..."QWERTYUIOP",
      ..."ASDFGHJKL",
      ..."ZXCVBNM"
    ];

    const numbers = ["0","1","2","3","4","5","6","7","8","9",
      ".",",","+","−","=","(",")"];

    [...letters, ...numbers].forEach(value => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fm-key";
      button.textContent = value;

      button.addEventListener("click", () => insertValue(value));

      keys.appendChild(button);
    });

    section.append(title, keys);
    container.appendChild(section);
  }

  // ==========================================
  // 9. BO'LIMLARNI BARCHASINI CHIQARISH
  // ==========================================

  function renderSection(container, title, items) {
    const section = document.createElement("section");
    section.className = "fm-section";

    const heading = document.createElement("div");
    heading.className = "fm-section-title";
    heading.textContent = title;

    section.appendChild(heading);

    if (title === "Elementlar") {
      const search = document.createElement("input");
      search.type = "search";
      search.className = "fm-search";
      search.placeholder = "Element nomi yoki belgisi bo‘yicha qidirish...";

      const grid = document.createElement("div");
      grid.className = "fm-keys";

      function showElements(query) {
        grid.replaceChildren();

        ELEMENTS.forEach((item, index) => {
          const searchText = (item[0] + " " + item[1]).toLowerCase();

          if (!query || searchText.includes(query.toLowerCase())) {
            renderElement(grid, {
              symbol: item[0],
              name: item[1]
            }, index);
          }
        });
      }

      search.addEventListener("input", () => {
        showElements(search.value.trim());
      });

      showElements("");

      section.append(search, grid);

    } else {
      const grid = document.createElement("div");
      grid.className = "fm-keys";

      items.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "fm-key";

        const isObject = typeof item === "object";

        const label = isObject
          ? item.label || item.value
          : item;

        const value = isObject
          ? item.value
          : item;

        button.setAttribute("aria-label", String(label));

        if (/[\\^_{}]/.test(String(value))) {
          renderLabel(button, String(value));
        } else {
          button.textContent = String(label);
        }

        button.addEventListener("click", ev => {
          ev.preventDefault();
          ev.stopPropagation();
          insertValue(String(value));
        });

        grid.appendChild(button);
      });

      section.appendChild(grid);
    }

    container.appendChild(section);
  }

  function renderBank() {
    const container = modal.querySelector("#fm-sections");
    container.replaceChildren();

    createBasicKeyboard(container);

    const bank = BANKS[activeSubject] || BANKS.matematika;

    Object.entries(bank).forEach(([title, items]) => {
      renderSection(container, title, items);
    });
  }

  // ==========================================
  // 10. MUHARRIRNI OCHISH
  // ==========================================

  async function open(target, subject) {
    if (!target) return;

    activeTarget = target;

    const selected = String(
      subject || document.body.dataset.subject || "matematika"
    ).toLowerCase();

    activeSubject = BANKS[selected] ? selected : "matematika";

    ensureModal();
    modal.hidden = false;

    modal.querySelector("#fm-title").textContent =
      "Formula muharriri — " +
      activeSubject[0].toUpperCase() +
      activeSubject.slice(1);

    try {
      await loadMathLive();

      if (!modal || !activeTarget) return;

      mathfield.value = target.value || "";

      renderBank();
      mathfield.focus();

    } catch (error) {
      alert(error.message || "Formula muharriri yuklanmadi.");
      close();
    }
  }

  // ==========================================
  // 11. JAVOBNI SAQLASH
  // ==========================================

  function save() {
    if (!activeTarget || !mathfield) {
      close();
      return;
    }

    const latex = typeof mathfield.getValue === "function"
      ? mathfield.getValue("latex")
      : mathfield.value;

    const target = activeTarget;

    target.value = latex || "";

    target.dispatchEvent(new Event("input", { bubbles:true }));
    target.dispatchEvent(new Event("change", { bubbles:true }));

    close();
  }

  function close() {
    if (modal) modal.hidden = true;
    activeTarget = null;
  }

  // ==========================================
  // 12. JAVOB MAYDONIGA ULASH
  // ==========================================

  function attach(target, subject) {
    if (!target || target.dataset.formulaButtonAttached === "1") {
      return;
    }

    target.dataset.formulaButtonAttached = "1";

    const selectedSubject = String(
      subject || document.body.dataset.subject || "matematika"
    ).toLowerCase();

    function openForTarget(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      target.blur();
      open(target, selectedSubject);
    }

    target.addEventListener("click", openForTarget);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "fm-open";
    button.textContent = "∑";
    button.title = "Formula muharririni ochish";
    button.setAttribute("aria-label", "Formula muharririni ochish");

    button.addEventListener("click", openForTarget);

    target.insertAdjacentElement("afterend", button);
  }

  // ==========================================
  // 13. TASHQI SAHIFALAR UCHUN
  // ==========================================

  window.FormulaEditor = {
    open,
    attach,
    banks: BANKS,
    elements: ELEMENTS,
    close
  };

})();
