(function () {
  "use strict";

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

  const INDEX_POWER_TOOLS = [
    ...["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹","⁺","⁻"].map(value => ({label:value,value})),
    ...["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"].map(value => ({label:value,value})),
    ...["²⁺","²⁻","³⁺","³⁻"].map(value => ({label:value,value}))
  ];

  const MATH_PHYSICS_CALCULATOR = [
    {label:"∑",value:"\\sum"},{label:"∫",value:"\\int"},{label:"∬",value:"\\iint"},{label:"f(x)",value:"f(x)"},
    {label:"ⁿPᵣ",value:"^{n}P_{r}"},{label:"ⁿCᵣ",value:"^{n}C_{r}"},{label:"π",value:"\\pi"},{label:"i",value:"i"},
    {label:"°",value:"^{\\circ}"},{label:"θ",value:"\\theta"},{label:"e",value:"e"},{label:"α",value:"\\alpha"},
    {label:"μ",value:"\\mu"},{label:"σ",value:"\\sigma"},{label:"[M]",value:"\\begin{matrix} & \\\\ & \\end{matrix}"},{label:"d/dx",value:"\\frac{d}{dx}"},
    {label:"lim",value:"\\lim_{x\\to 0}"},{label:"∞",value:"\\infty"},{label:"ln",value:"\\ln("},{label:"!",value:"!"},
    {label:"x̄",value:"\\bar{x}"},{label:"log₂",value:"\\log_2("},{label:"logₙ",value:"\\log_n("},{label:"xⁿ",value:"^{ }"},
    {label:"sin",value:"\\sin("},{label:"cos",value:"\\cos("},{label:"tan",value:"\\tan("},{label:"cot",value:"\\cot("},
    {label:"csc",value:"\\csc("},{label:"sec",value:"\\sec("},{label:"xʸ",value:"^{ }"},{label:"eˣ",value:"e^{ }"},
    {label:"sin⁻¹",value:"\\arcsin("},{label:"cos⁻¹",value:"\\arccos("},{label:"tan⁻¹",value:"\\arctan("},{label:"Δ",value:"\\Delta"},
    {label:"√",value:"\\sqrt{}"},{label:"∛",value:"\\sqrt[3]{}"},{label:"10ˣ",value:"10^{ }"},{label:"x³",value:"^{3}"},
    {label:"(",value:"("},{label:")",value:")"},{label:"[",value:"["},{label:"]",value:"]"},
    {label:"|",value:"|"},{label:"≤",value:"\\leq"},{label:"≥",value:"\\geq"},{label:"=",value:"="},
    {label:"x",value:"x"},{label:"7",value:"7"},{label:"8",value:"8"},{label:"9",value:"9"},
    {label:"÷",value:"\\div"},{label:"^",value:"^"},{label:"×",value:"\\times"},{label:"<",value:"<"},
    {label:"y",value:"y"},{label:"4",value:"4"},{label:"5",value:"5"},{label:"6",value:"6"},
    {label:"-",value:"-"},{label:"+",value:"+"},{label:"/",value:"/"},{label:">",value:">"},
    {label:"z",value:"z"},{label:"1",value:"1"},{label:"2",value:"2"},{label:"3",value:"3"},
    {label:",",value:","},{label:"0",value:"0"},{label:".",value:"."},{label:"%",value:"\\%"}
  ];

  const EXTRA_MATH_PHYSICS_SYMBOLS = [
    {label:"≠",value:"\\neq"},{label:"≈",value:"\\approx"},{label:"≡",value:"\\equiv"},{label:"±",value:"\\pm"},
    {label:"∓",value:"\\mp"},{label:"∈",value:"\\in"},{label:"∉",value:"\\notin"},{label:"⊂",value:"\\subset"},
    {label:"⊆",value:"\\subseteq"},{label:"∪",value:"\\cup"},{label:"∩",value:"\\cap"},{label:"∅",value:"\\emptyset"},
    {label:"∀",value:"\\forall"},{label:"∃",value:"\\exists"},{label:"⇒",value:"\\Rightarrow"},{label:"⇔",value:"\\Leftrightarrow"},
    {label:"⊥",value:"\\perp"},{label:"∥",value:"\\parallel"},{label:"∠",value:"\\angle"},{label:"∇",value:"\\nabla"},
    {label:"∂",value:"\\partial"},{label:"ℏ",value:"\\hbar"},{label:"ω",value:"\\omega"},{label:"λ",value:"\\lambda"},
    {label:"ρ",value:"\\rho"},{label:"ε",value:"\\varepsilon"},{label:"Ω",value:"\\Omega"},{label:"γ",value:"\\gamma"}
  ];

  const CHEMISTRY_SYMBOLS = [
    {label:"→",value:" → "},{label:"⇌",value:" ⇌ "},{label:"↑",value:"↑"},
    {label:"↓",value:"↓"},{label:"Δ",value:"Δ"},{label:"°",value:"°"},
    {label:"·",value:"·"},{label:"±",value:"±"},{label:"=",value:"="},
    {label:"+",value:" + "},{label:"−",value:" − "},{label:"(s)",value:"(s)"},
    {label:"(l)",value:"(l)"},{label:"(g)",value:"(g)"},{label:"(aq)",value:"(aq)"},
    {label:"e⁻",value:"e⁻"},{label:"hν",value:"hν"},{label:"t°",value:"t°"}
  ];

  const CHEMISTRY_IONS = [
    "H⁺","OH⁻","Na⁺","K⁺","Ag⁺","Ca²⁺","Mg²⁺",
    "Ba²⁺","Zn²⁺","Cu²⁺","Fe²⁺","Fe³⁺","Al³⁺",
    "Cl⁻","Br⁻","I⁻","NO₃⁻","SO₄²⁻","SO₃²⁻",
    "CO₃²⁻","HCO₃⁻","PO₄³⁻","NH₄⁺","MnO₄⁻","Cr₂O₇²⁻"
  ];

  const BIOLOGY_SYMBOLS = [
    "♀","♂","×","F₁","F₂","P","DNA","RNA","mRNA","tRNA",
    "ATP","ADP","NAD","NADH","O₂","CO₂","H₂O",
    "α","β","γ","Δ","→","↔","↑","↓",
    "Aa","AA","aa","Xᴬ","Xᵃ","Y","XX","XY"
  ];

  const ELEMENT_BANK = ELEMENTS.map(item => ({
    type:"element", symbol:item[0], name:item[1], value:item[0]
  }));

  const BANKS = {
    matematika: {
      "Kalkulyator paneli": MATH_PHYSICS_CALCULATOR,
      "Matematik va fizik belgilar": EXTRA_MATH_PHYSICS_SYMBOLS
    },
    fizika: {
      "Kalkulyator paneli": MATH_PHYSICS_CALCULATOR,
      "Matematik va fizik belgilar": EXTRA_MATH_PHYSICS_SYMBOLS
    },
    kimyo: {
      "Yuqori indeks va zaryad": INDEX_POWER_TOOLS,
      "Reaksiya va amallar": CHEMISTRY_SYMBOLS,
      "Ionlar": CHEMISTRY_IONS,
      "Elementlar": ELEMENT_BANK
    },
    biologiya: {
      "Yuqori indeks va pastki indeks": INDEX_POWER_TOOLS,
      "Biologik belgilar": BIOLOGY_SYMBOLS,
      "Elementlar": ELEMENT_BANK
    }
  };

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let mathfield = null;
  let scriptPromise = null;

  function loadMathLive() {
    if (customElements.get("math-field")) return Promise.resolve();
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="mathlive"]');
      const script = existing || document.createElement("script");

      script.addEventListener("load", () => resolve(), {once:true});
      script.addEventListener("error", () => reject(new Error("Formula kutubxonasi yuklanmadi.")), {once:true});

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

  function addStyles() {
    if (document.getElementById("formula-editor-styles")) return;

    const style = document.createElement("style");
    style.id = "formula-editor-styles";

    style.textContent = `
      .fm-backdrop {
        position: fixed; inset: 0; z-index: 2147483000;
        background: rgba(8,13,25,.75); display: flex;
        align-items: flex-end; justify-content: center; padding: 4px;
        box-sizing: border-box;
      }
      .fm-backdrop[hidden] { display: none !important; }
      .fm-panel {
        width: min(520px, 100%); max-height: 96dvh; overflow-y: auto;
        background: #0756b8; color: white; border-radius: 14px;
        padding: 10px; box-sizing: border-box; box-shadow: 0 10px 40px #0008;
      }
      .fm-head {
        display: flex; justify-content: space-between; align-items: center;
        font-weight: bold; font-size: 15px; margin-bottom: 8px;
      }
      .fm-close {
        width: 30px; height: 30px; border: 0; border-radius: 50%;
        background: #ffffff22; color: white; font-size: 22px; cursor: pointer;
      }
      .fm-field {
        display: block; width: 100%; min-height: 60px; background: white;
        color: #111827; border-radius: 8px; padding: 6px; font-size: 22px;
        margin-bottom: 8px; box-sizing: border-box; border: none;
      }
      .fm-section { margin: 8px 0; }
      .fm-section-title {
        font-size: 13px; font-weight: bold; padding: 4px 2px;
        border-bottom: 1px solid #ffffff44; margin-bottom: 6px; text-transform: uppercase;
      }
      .fm-keys-grid8 {
        display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 4px;
      }
      .fm-keys-grid-win {
        display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 3px;
      }
      .fm-keys-flex { display: flex; flex-wrap: wrap; gap: 4px; }
      .fm-key {
        min-height: 38px; border: 0; border-radius: 5px;
        background: #ffffff; color: #0756b8; font-size: 13px; font-weight: bold;
        padding: 2px; cursor: pointer; display: flex; align-items: center;
        justify-content: center; touch-action: manipulation;
      }
      .fm-key:active { background: #dbeafe; transform: scale(0.95); }
      .fm-key math-field {
        pointer-events: none; border: 0; background: transparent; font-size: 14px;
      }
      .fm-key-win {
        min-height: 34px; background: #f8fafc; color: #0f172a; font-size: 14px;
      }
      .fm-fixed-tools { display: flex; gap: 4px; margin-top: 8px; }
      .fm-fixed-tools button {
        flex: 1; min-height: 36px; border: 0; border-radius: 6px;
        font-size: 14px; font-weight: bold; background: #1e3a8a; color: white; cursor: pointer;
      }
      .fm-actions { display: flex; gap: 6px; margin-top: 6px; }
      .fm-actions button {
        flex: 1; min-height: 40px; border: 0; border-radius: 6px;
        font-size: 14px; font-weight: bold; cursor: pointer;
      }
      .fm-cancel { background: #334155; color: white; }
      .fm-save { background: #0f9f82; color: white; }
      .fm-open {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 36px; height: 36px; margin-left: 4px; border: 0;
        border-radius: 6px; background: #e0f2fe; color: #075985;
        font-weight: bold; cursor: pointer;
      }
      .fm-elements-grid {
        display: grid;
        grid-template-columns: repeat(10, minmax(0, 1fr));
        gap: 3px;
      }
      .fm-element-key {
        min-height: 36px;
        font-size: 14px;
        background: #ffffff;
        color: #0756b8;
        border: 1px solid #dbeafe;
      }
      .fm-element-key:active { background: #bfdbfe; }
      .fm-key { user-select: none; -webkit-user-select: none; }
      @media (max-width: 380px) {
        .fm-elements-grid { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .fm-key { min-height: 34px; font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    if (modal) return;
    addStyles();

    modal = document.createElement("div");
    modal.className = "fm-backdrop";
    modal.hidden = true;

    modal.innerHTML = `
      <section class="fm-panel" role="dialog" aria-modal="true">
        <div class="fm-head">
          <span id="fm-title">Formula Muharriri</span>
          <button type="button" class="fm-close" id="fm-close">×</button>
        </div>
        <math-field id="fm-field" class="fm-field" virtual-keyboard-mode="manual"></math-field>
        <div id="fm-sections"></div>
        <div class="fm-fixed-tools">
          <button type="button" id="fm-backspace">⌫ O'chirish</button>
          <button type="button" id="fm-clear">C Tozalash</button>
        </div>
        <div class="fm-actions">
          <button type="button" class="fm-cancel" id="fm-cancel">Bekor qilish</button>
          <button type="button" class="fm-save" id="fm-save">Tayyor ✓</button>
        </div>
      </section>
    `;

    document.body.appendChild(modal);
    mathfield = modal.querySelector("#fm-field");

    modal.querySelector("#fm-close").addEventListener("click", close);
    modal.querySelector("#fm-cancel").addEventListener("click", close);
    modal.querySelector("#fm-save").addEventListener("click", save);

    modal.querySelector("#fm-backspace").addEventListener("click", () => {
      try { mathfield.executeCommand("deleteBackward"); } catch (_) {}
      mathfield.focus();
    });

    modal.querySelector("#fm-clear").addEventListener("click", () => {
      mathfield.value = "";
      mathfield.focus();
    });

    modal.addEventListener("click", ev => {
      if (ev.target === modal) close();
    });
  }

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

  function renderBank() {
    const container = modal.querySelector("#fm-sections");
    container.replaceChildren();

    const bank = BANKS[activeSubject] || BANKS.matematika;

    Object.entries(bank).forEach(([title, items]) => {
      const section = document.createElement("section");
      section.className = "fm-section";

      const heading = document.createElement("div");
      heading.className = "fm-section-title";
      heading.textContent = title;
      section.appendChild(heading);

      const isCalculator = title.includes("Kalkulyator");
      const isElements = title.includes("Elementlar");

      const grid = document.createElement("div");
      grid.className = isCalculator ? "fm-keys-grid8" :
        (isElements ? "fm-elements-grid" : "fm-keys-flex");

      items.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "fm-key";

        let label;
        let value;

        if (item && item.type === "element") {
          label = item.symbol;
          value = item.symbol;
          button.title = item.name;
          button.setAttribute("aria-label", item.symbol + " — " + item.name);
          button.classList.add("fm-element-key");
        } else if (typeof item === "object" && item !== null) {
          label = item.label || item.value;
          value = item.value;
        } else {
          label = item;
          value = item;
        }

        button.setAttribute("aria-label", String(label));

        if (
          (activeSubject === "matematika" || activeSubject === "fizika") &&
          /[\\^_{}]/.test(String(value))
        ) {
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
      container.appendChild(section);
    });
  }

  async function open(target, subject) {
    if (!target) return;
    activeTarget = target;

    const key = String(subject || "matematika").toLowerCase().trim();
    activeSubject = BANKS[key] ? key : "matematika";

    ensureModal();
    modal.hidden = false;

    const titles = {
      matematika: "Matematika — MathLive klaviaturasi",
      fizika: "Fizika — MathLive klaviaturasi",
      kimyo: "Kimyo — ChemKey uslubidagi klaviatura",
      biologiya: "Biologiya — maxsus belgilar klaviaturasi"
    };
    modal.querySelector("#fm-title").textContent = titles[activeSubject];

    try {
      await loadMathLive();
      if (!modal || !activeTarget) return;
      mathfield.value = target.value || "";
      renderBank();
      mathfield.focus();
    } catch (error) {
      alert(error.message || "Xatolik yuz berdi.");
      close();
    }
  }

  function save() {
    if (!activeTarget || !mathfield) {
      close();
      return;
    }

    const latex = typeof mathfield.getValue === "function"
      ? mathfield.getValue("latex")
      : mathfield.value;

    activeTarget.value = latex || "";
    activeTarget.dispatchEvent(new Event("input", { bubbles: true }));
    activeTarget.dispatchEvent(new Event("change", { bubbles: true }));
    close();
  }

  function close() {
    if (modal) modal.hidden = true;
    activeTarget = null;
  }

  function attach(target, subject) {
    if (!target || target.dataset.formulaButtonAttached === "1") return;
    target.dataset.formulaButtonAttached = "1";

    const selectedSubject = String(subject || "matematika").toLowerCase();

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
    button.title = "Muharrirni ochish";
    button.addEventListener("click", openForTarget);

    target.insertAdjacentElement("afterend", button);
  }

  window.FormulaEditor = { open, attach, banks: BANKS, close };
})();
