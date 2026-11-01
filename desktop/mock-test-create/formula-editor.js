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
  // 2. INDEKS VA DARAJA SHABLONLARI (KIMYO/BIOLOGIYA UCHUN)
  // ==========================================

  const INDEX_POWER_TOOLS = [
    { label: "xⁿ (Daraja)", value: "^{ }" },
    { label: "xₙ (Indeks)", value: "_{ }" },
    { label: "xⁿₘ (Har ikkala)", value: "^{ }_{ }" },
    { label: "x² (Kvadrat)", value: "^{2}" },
    { label: "x³ (Kub)", value: "^{3}" },
    { label: "+ Zaryad", value: "^{+}" },
    { label: "- Zaryad", value: "^{-}" },
    { label: "2+ Zaryad", value: "^{2+}" },
    { label: "2- Zaryad", value: "^{2-}" },
    { label: "3+ Zaryad", value: "^{3+}" }
  ];

  // ==========================================
  // 3. FANLAR KLAVIATURA BANKLARI
  // ==========================================

  const MATH_PHYSICS_CALCULATOR = [
    // 1-qator: Oliy matematika belgilar
    {label:"∑", value:"\\sum"}, {label:"∫", value:"\\int"}, {label:"∬", value:"\\iint"}, {label:"f(x)", value:"f(x)"},
    {label:"ⁿPᵣ", value:"^{n}P_{r}"}, {label:"ⁿCᵣ", value:"^{n}C_{r}"}, {label:"π", value:"\\pi"}, {label:"i", value:"i"},
    
    // 2-qator
    {label:"°", value:"^{\\circ}"}, {label:"θ", value:"\\theta"}, {label:"e", value:"e"}, {label:"α", value:"\\alpha"},
    {label:"μ", value:"\\mu"}, {label:"σ", value:"\\sigma"}, {label:"[M]", value:"\\begin{matrix} & \\\\ & \\end{matrix}"}, {label:"d/dx", value:"\\frac{d}{dx}"},

    // 3-qator
    {label:"lim", value:"\\lim_{x\\to 0}"}, {label:"∞", value:"\\infty"}, {label:"ln", value:"\\ln("}, {label:"!", value:"!"},
    {label:"x̄", value:"\\bar{x}"}, {label:"log₂", value:"\\log_2("}, {label:"logₙ", value:"\\log_n("}, {label:"xⁿ", value:"^{ }"},

    // 4-qator: Trigonometriya
    {label:"sin", value:"\\sin("}, {label:"cos", value:"\\cos("}, {label:"tan", value:"\\tan("}, {label:"cot", value:"\\cot("},
    {label:"csc", value:"\\csc("}, {label:"sec", value:"\\sec("}, {label:"xʸ", value:"^{ }"}, {label:"eˣ", value:"e^{ }"},

    // 5-qator
    {label:"sin⁻¹", value:"\\arcsin("}, {label:"cos⁻¹", value:"\\arccos("}, {label:"tan⁻¹", value:"\\arctan("}, {label:"Δ", value:"\\Delta"},
    {label:"√", value:"\\sqrt{}"}, {label:"∛", value:"\\sqrt[3]{}"}, {label:"10ˣ", value:"10^{ }"}, {label:"x³", value:"^{3}"},

    // 6-qator: Qavslar
    {label:"(", value:"("}, {label:")", value:")"}, {label:"[", value:"["}, {label:"]", value:"]"},
    {label:"|", value:"|"}, {label:"≤", value:"\\leq"}, {label:"≥", value:"\\geq"}, {label:"=", value:"="},

    // 7, 8, 9-qatorlar: Raqamlar va asosiy amallar
    {label:"x", value:"x"}, {label:"7", value:"7"}, {label:"8", value:"8"}, {label:"9", value:"9"},
    {label:"÷", value:"\\div"}, {label:"^", value:"^"}, {label:"×", value:"\\times"}, {label:"<", value:"<"},

    {label:"y", value:"y"}, {label:"4", value:"4"}, {label:"5", value:"5"}, {label:"6", value:"6"},
    {label:"-", value:"-"}, {label:"+", value:"+"}, {label:"/", value:"/"}, {label:">", value:">"},

    {label:"z", value:"z"}, {label:"1", value:"1"}, {label:"2", value:"2"}, {label:"3", value:"3"},
    {label:",", value:","}, {label:"0", value:"0"}, {label:".", value:"."}, {label:"%", value:"\\%"}
  ];

  const EXTRA_MATH_PHYSICS_SYMBOLS = [
    {label:"≠", value:"\\neq"}, {label:"≈", value:"\\approx"}, {label:"≡", value:"\\equiv"}, {label:"±", value:"\\pm"},
    {label:"∓", value:"\\mp"}, {label:"∈", value:"\\in"}, {label:"∉", value:"\\notin"}, {label:"⊂", value:"\\subset"},
    {label:"⊆", value:"\\subseteq"}, {label:"∪", value:"\\cup"}, {label:"∩", value:"\\cap"}, {label:"∅", value:"\\emptyset"},
    {label:"∀", value:"\\forall"}, {label:"∃", value:"\\exists"}, {label:"⇒", value:"\\Rightarrow"}, {label:"⇔", value:"\\Leftrightarrow"},
    {label:"⊥", value:"\\perp"}, {label:"∥", value:"\\parallel"}, {label:"∠", value:"\\angle"}, {label:"∇", value:"\\nabla"},
    {label:"∂", value:"\\partial"}, {label:"ℏ", value:"\\hbar"}, {label:"ω", value:"\\omega"}, {label:"λ", value:"\\lambda"},
    {label:"ρ", value:"\\rho"}, {label:"ε", value:"\\varepsilon"}, {label:"Ω", value:"\\Omega"}, {label:"γ", value:"\\gamma"}
  ];

  const BANKS = {
    matematika: {
      "Kalkulyator paneli": MATH_PHYSICS_CALCULATOR,
      "Matematik va fizik belgilar": EXTRA_MATH_PHYSICS_SYMBOLS
    },
    fizika: {
      "Kalkulyator paneli": MATH_PHYSICS_CALCULATOR,
      "Matematik va fizik belgilar": EXTRA_MATH_PHYSICS_SYMBOLS
    },
    kimyo_biologiya: {
      "Indeks va daraja": INDEX_POWER_TOOLS,
      "Windows Klaviatura (Lotin)": [
        ..."1234567890-=".split(""),
        ..."qwertyuiop".split(""),
        ..."asdfghjkl".split(""),
        ..."zxcvbnm".split(""),
        ..."QWERTYUIOP".split(""),
        ..."ASDFGHJKL".split(""),
        ..."ZXCVBNM".split(""),
        "+","−","=","(",")","[","]","{","}",".",",","->","\\rightarrow"
      ],
      "Kimyoviy Reaksiyalar va Ionlar": [
        {label:"→", value:"\\rightarrow"}, {label:"⇌", value:"\\rightleftharpoons"},
        {label:"↑", value:"\\uparrow"}, {label:"↓", value:"\\downarrow"},
        {label:"Δ", value:"\\Delta"}, {label:"t°", value:"\\xrightarrow{t^\\circ}"},
        "Na+","K+","Ca2+","Mg2+","Cl-","OH-","SO4(2-)","NO3-","CO3(2-)","PO4(3-)"
      ],
      "Biologik belgilar": [
        {label:"♀", value:"\\female"}, {label:"♂", value:"\\male"},
        {label:"✕ (Turlanish)", value:"\\times"}, {label:"F₁", value:"F_1"},
        {label:"F₂", value:"F_2"}, {label:"P", value:"P"},
        "DNA", "RNA", "mRNA", "tRNA", "ATP", "ADP"
      ],
      "Elementlar": []
    }
  };

  // Elementlarni kimyo-biologiya bo'limiga biriktirish
  BANKS.kimyo_biologiya["Elementlar"] = ELEMENTS.map(item => ({
    type: "element",
    symbol: item[0],
    name: item[1]
  }));

  // Aliaslar (Kimyo va Biologiya so'rovlarini bitta bankka yo'naltirish)
  BANKS.kimyo = BANKS.kimyo_biologiya;
  BANKS.biologiya = BANKS.kimyo_biologiya;

  // ==========================================
  // 4. MATHLIVE VA MUHARRIR HOLATI
  // ==========================================

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

      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", () => reject(new Error("Formula kutubxonasi yuklanmadi.")), { once: true });

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
  // 5. STYLES (Dizayn)
  // ==========================================

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
        padding: 10px; box-sizing: border-box; font-family: Arial, sans-serif;
        box-shadow: 0 20px 50px #000a;
      }
      .fm-head {
        display: flex; justify-content: space-between; align-items: center;
        font-size: 16px; font-weight: bold; margin-bottom: 6px;
      }
      .fm-close {
        width: 32px; height: 32px; border: 0; border-radius: 6px;
        background: #1e3a8a; color: white; font-size: 20px; cursor: pointer;
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
      
      /* Grid tuzilishlari */
      .fm-keys-grid8 {
        display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 4px;
      }
      .fm-keys-grid-win {
        display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 3px;
      }
      .fm-keys-flex {
        display: flex; flex-wrap: wrap; gap: 4px;
      }
      
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
    `;
    document.head.appendChild(style);
  }

  // ==========================================
  // 6. MODAL INTERFEYSI
  // ==========================================

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

      const isWinKeyboard = title.includes("Windows");
      const is8Grid = title.includes("Kalkulyator");

      const grid = document.createElement("div");
      if (is8Grid) {
        grid.className = "fm-keys-grid8";
      } else if (isWinKeyboard) {
        grid.className = "fm-keys-grid-win";
      } else {
        grid.className = "fm-keys-flex";
      }

      items.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "fm-key" + (isWinKeyboard ? " fm-key-win" : "");

        const isObject = typeof item === "object";
        const label = isObject ? (item.label || item.value) : item;
        const value = isObject ? item.value : item;

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
      container.appendChild(section);
    });
  }

  async function open(target, subject) {
    if (!target) return;
    activeTarget = target;
    const key = String(subject).toLowerCase();
    activeSubject = BANKS[key] ? key : "matematika";

    ensureModal();
    modal.hidden = false;

    modal.querySelector("#fm-title").textContent =
      (activeSubject === "kimyo" || activeSubject === "biologiya" || activeSubject === "kimyo_biologiya")
        ? "Kimyo va Biologiya Muharriri"
        : "Matematika va Fizika Kalkulyatori";

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
