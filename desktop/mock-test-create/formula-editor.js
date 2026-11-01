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
  // 2. BO‘LIMLAR VA KATEGORIYALAR (TABS)
  // ==========================================
  const TABS_DATA = {
    matematika: [
      {
        title: "Asosiy & Indeks / Daraja",
        items: [
          { label: "xⁿ (Daraja)", value: "^{ }" },
          { label: "xₙ (Pastki indeks)", value: "_{ }" },
          { label: "xⁿₘ (Ikkovi)", value: "^{ }_{ }" },
          { label: "x²", value: "^{2}" }, { label: "x³", value: "^{3}" },
          { label: "√x", value: "\\sqrt{}" }, { label: "∛x", value: "\\sqrt[3]{}" },
          { label: "a/b (Kasr)", value: "\\frac{}{}" }
        ]
      },
      {
        title: "Oliy Matematika & Analiz",
        items: [
          {label:"∑", value:"\\sum"}, {label:"∫", value:"\\int"}, {label:"∬", value:"\\iint"}, {label:"lim", value:"\\lim_{x\\to 0}"},
          {label:"d/dx", value:"\\frac{d}{dx}"}, {label:"∂", value:"\\partial"}, {label:"∞", value:"\\infty"}, {label:"!", value:"!"},
          {label:"ln", value:"\\ln("}, {label:"log₂", value:"\\log_2("}, {label:"logₙ", value:"\\log_n("}, {label:"eˣ", value:"e^{ }"}
        ]
      },
      {
        title: "Trigonometriya",
        items: [
          {label:"sin", value:"\\sin("}, {label:"cos", value:"\\cos("}, {label:"tan", value:"\\tan("}, {label:"cot", value:"\\cot("},
          {label:"arcsin", value:"\\arcsin("}, {label:"arccos", value:"\\arccos("}, {label:"arctan", value:"\\arctan("}, {label:"°", value:"^{\\circ}"}
        ]
      },
      {
        title: "Belgilar & Solishtirish",
        items: [
          {label:"≠", value:"\\neq"}, {label:"≈", value:"\\approx"}, {label:"≡", value:"\\equiv"}, {label:"±", value:"\\pm"},
          {label:"≤", value:"\\leq"}, {label:"≥", value:"\\geq"}, {label:"∈", value:"\\in"}, {label:"∉", value:"\\notin"},
          {label:"⊂", value:"\\subset"}, {label:"∪", value:"\\cup"}, {label:"∩", value:"\\cap"}, {label:"∅", value:"\\emptyset"}
        ]
      },
      {
        title: "Kalkulyator tugmalari",
        items: [
          "x","y","z","7","8","9","÷","^",
          "4","5","6","-","+","×","<",">",
          "1","2","3",",","0",".","%","=",
          "(",")","[","]","\\pi","\\alpha","\\theta","\\mu"
        ]
      }
    ],
    fizika: [
      {
        title: "Fizik Indeks & Darajalar",
        items: [
          { label: "xⁿ (Daraja)", value: "^{ }" },
          { label: "xₙ (Indeks)", value: "_{ }" },
          { label: "√x", value: "\\sqrt{}" }, { label: "a/b", value: "\\frac{}{}" }
        ]
      },
      {
        title: "Vektorlar & Fizik kattaliklar",
        items: [
          {label:"Δ", value:"\\Delta"}, {label:"∇", value:"\\nabla"}, {label:"ω", value:"\\omega"}, {label:"λ", value:"\\lambda"},
          {label:"ρ", value:"\\rho"}, {label:"ε", value:"\\varepsilon"}, {label:"Ω", value:"\\Omega"}, {label:"γ", value:"\\gamma"},
          {label:"ℏ", value:"\\hbar"}, {label:"σ", value:"\\sigma"}, {label:"μ", value:"\\mu"}, {label:"θ", value:"\\theta"}
        ]
      },
      {
        title: "Kalkulyator tugmalari",
        items: [
          "x","y","z","7","8","9","÷","^",
          "4","5","6","-","+","×","<",">",
          "1","2","3",",","0",".","%","=",
          "(",")","[","]","\\pi","\\int","\\sum","\\pm"
        ]
      }
    ],
    kimyo: [
      {
        title: "Zaryad, Indeks & Daraja",
        items: [
          { label: "xₙ (Indeks)", value: "_{ }" },
          { label: "xⁿ (Daraja)", value: "^{ }" },
          { label: "+ Zaryad", value: "^{+}" }, { label: "- Zaryad", value: "^{-}" },
          { label: "2+ Zaryad", value: "^{2+}" }, { label: "2- Zaryad", value: "^{2-}" },
          { label: "3+ Zaryad", value: "^{3+}" }, { label: "3- Zaryad", value: "^{3-}" }
        ]
      },
      {
        title: "Reaksiyalar & Ionlar",
        items: [
          {label:"→", value:"\\rightarrow"}, {label:"⇌", value:"\\rightleftharpoons"},
          {label:"↑", value:"\\uparrow"}, {label:"↓", value:"\\downarrow"},
          {label:"Δ", value:"\\Delta"}, {label:"t°", value:"\\xrightarrow{t^\\circ}"},
          "Na+","K+","Ca2+","Mg2+","Cl-","OH-","SO4(2-)","NO3-","CO3(2-)","PO4(3-)"
        ]
      },
      {
        title: "Kimyoviy Elementlar (118 ta)",
        items: ELEMENTS.map(item => ({ label: `${item[0]} (${item[1]})`, value: item[0] }))
      }
    ],
    biologiya: [
      {
        title: "Biologik Belgilar & Genetika",
        items: [
          {label:"♀", value:"\\female"}, {label:"♂", value:"\\male"},
          {label:"✕ (Turlanish)", value:"\\times"}, {label:"F₁", value:"F_1"},
          {label:"F₂", value:"F_2"}, {label:"P", value:"P"},
          "DNA", "RNA", "mRNA", "tRNA", "ATP", "ADP"
        ]
      },
      {
        title: "Indeks & Daraja",
        items: [
          { label: "xₙ (Indeks)", value: "_{ }" },
          { label: "xⁿ (Daraja)", value: "^{ }" }
        ]
      }
    ]
  };

  // Aliaslar
  TABS_DATA.kimyo_biologiya = TABS_DATA.kimyo;

  // ==========================================
  // 3. MATHLIVE VA MODAL BOSHQARUVI
  // ==========================================
  let activeTarget = null;
  let activeSubject = "matematika";
  let activeTabIndex = 0;
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
      script.addEventListener("error", () => reject(new Error("MathLive kutubxonasi yuklanmadi.")), { once: true });

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
        width: min(540px, 100%); max-height: 96dvh; overflow-y: auto;
        background: #0f172a; color: white; border-radius: 16px;
        padding: 12px; box-sizing: border-box; font-family: Arial, sans-serif;
        box-shadow: 0 20px 50px #000a;
      }
      .fm-head {
        display: flex; justify-content: space-between; align-items: center;
        font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #38bdf8;
      }
      .fm-close {
        width: 32px; height: 32px; border: 0; border-radius: 8px;
        background: #334155; color: white; font-size: 20px; cursor: pointer;
      }
      .fm-field {
        display: block; width: 100%; min-height: 60px; background: white;
        color: #111827; border-radius: 10px; padding: 8px; font-size: 24px;
        margin-bottom: 10px; box-sizing: border-box; border: none; outline: none;
      }
      /* Klaviatura tepasidagi bo'limlar (Tabs) */
      .fm-tabs {
        display: flex; gap: 4px; overflow-x: auto; padding-bottom: 6px;
        margin-bottom: 8px; border-bottom: 1px solid #334155;
      }
      .fm-tab {
        background: #1e293b; color: #94a3b8; border: 0; border-radius: 6px;
        padding: 6px 12px; font-size: 13px; font-weight: bold; cursor: pointer;
        white-space: nowrap; flex-shrink: 0;
      }
      .fm-tab.active {
        background: #0284c7; color: white;
      }
      .fm-section { margin: 8px 0; }
      .fm-section-title {
        font-size: 12px; font-weight: bold; color: #38bdf8; padding: 4px 2px;
        margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;
      }
      .fm-keys-grid {
        display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px;
      }
      .fm-key {
        min-height: 42px; border: 0; border-radius: 8px;
        background: #1e293b; color: #f8fafc; font-size: 14px; font-weight: bold;
        padding: 4px; cursor: pointer; display: flex; align-items: center;
        justify-content: center; touch-action: manipulation; border: 1px solid #334155;
      }
      .fm-key:active { background: #0284c7; transform: scale(0.96); }
      .fm-key math-field { pointer-events: none; border: 0; background: transparent; font-size: 15px; color: white; }
      .fm-fixed-tools { display: flex; gap: 6px; margin-top: 10px; }
      .fm-fixed-tools button {
        flex: 1; min-height: 38px; border: 0; border-radius: 8px;
        font-size: 14px; font-weight: bold; background: #334155; color: white; cursor: pointer;
      }
      .fm-actions { display: flex; gap: 8px; margin-top: 8px; }
      .fm-actions button {
        flex: 1; min-height: 44px; border: 0; border-radius: 8px;
        font-size: 15px; font-weight: bold; cursor: pointer;
      }
      .fm-cancel { background: #475569; color: white; }
      .fm-save { background: #10b981; color: white; }
      .fm-open {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 38px; height: 38px; margin-left: 4px; border: 0;
        border-radius: 8px; background: #e0f2fe; color: #0369a1;
        font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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
        
        <!-- Klaviatura tepasidagi bo'limlar paneli -->
        <div class="fm-tabs" id="fm-tabs"></div>

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

  function renderContent() {
    const tabsContainer = modal.querySelector("#fm-tabs");
    const sectionsContainer = modal.querySelector("#fm-sections");
    
    tabsContainer.replaceChildren();
    sectionsContainer.replaceChildren();

    const tabsList = TABS_DATA[activeSubject] || TABS_DATA.matematika;

    // Tab tugmalarini yaratish
    tabsList.forEach((tabData, index) => {
      const tabBtn = document.createElement("button");
      tabBtn.type = "button";
      tabBtn.className = "fm-tab" + (index === activeTabIndex ? " active" : "");
      tabBtn.textContent = tabData.title;
      tabBtn.addEventListener("click", () => {
        activeTabIndex = index;
        renderContent();
      });
      tabsContainer.appendChild(tabBtn);
    });

    // Tanlangan tabning elementlarini chiqarish
    const currentTab = tabsList[activeTabIndex] || tabsList[0];
    const section = document.createElement("section");
    section.className = "fm-section";

    const grid = document.createElement("div");
    grid.className = "fm-keys-grid";

    currentTab.items.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fm-key";

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
    sectionsContainer.appendChild(section);
  }

  async function open(target, subject) {
    if (!target) return;
    activeTarget = target;
    const key = String(subject).toLowerCase();
    activeSubject = TABS_DATA[key] ? key : "matematika";
    activeTabIndex = 0;

    ensureModal();
    modal.hidden = false;

    modal.querySelector("#fm-title").textContent =
      (activeSubject === "kimyo" || activeSubject === "biologiya")
        ? "Kimyo va Biologiya Muharriri"
        : "Matematika va Fizika Muharriri";

    try {
      await loadMathLive();
      if (!modal || !activeTarget) return;
      mathfield.value = target.value || "";
      renderContent();
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

  window.FormulaEditor = { open, attach, banks: TABS_DATA, close };

})();
