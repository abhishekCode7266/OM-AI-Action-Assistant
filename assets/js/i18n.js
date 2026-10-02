/**
 * OM AI Assistant - Multi-Language Localization Engine (i18n)
 * Supports Independent Interface Language, Conversation Language, and Writing Language.
 * Tagline: "Think. Plan. Act. Achieve."
 */

class OMI18nEngine {
  constructor() {
    this.DEFAULT_LOCALE = 'en';
    this.currentLocale = localStorage.getItem('om_ui_language') || this.DEFAULT_LOCALE;
    this.writingLocale = localStorage.getItem('om_writing_language') || 'en-US';
    this.conversationLocale = localStorage.getItem('om_conversation_language') || localStorage.getItem('om_voice_language') || 'en-US';

    this.dictionaries = {
      en: {
        newChat: "New Chat",
        recentChats: "Recent Chats",
        clearAll: "Clear All",
        terminal: "Terminal",
        export: "Export",
        clearChat: "Clear Chat",
        nexusLive: "Nexus Live",
        thoughtMap: "Thought Map",
        studio3D: "3D Studio",
        settings: "Settings",
        voiceInput: "Voice Input",
        send: "Send",
        stop: "Stop",
        cut: "Cut",
        cutSession: "Cut Session",
        writingTools: "Writing Tools",
        inputPlaceholder: "Ask OM anything, write code, analyze data, or generate images...",
        welcomeHeroTitle: "Think. Plan. Act. Achieve.",
        welcomeHeroDesc: "What would you like to achieve today?",
        plusAttach: "Add attachments or launch tools",
        exportMarkdown: "Export Chat (Markdown)",
        exportDesc: "Download conversation as .md document",
        maleVoice: "Male",
        femaleVoice: "Female",
        writingLanguage: "Writing Language",
        conversationLanguage: "Conversation Language",
        interfaceLanguage: "Interface Language",
        projects: "Projects",
        files: "Files",
        coding: "Coding",
        tasks: "Tasks",
        gems: "Gems",
        translate: "Translate",
        smartHome: "Smart Home",
        mediaPlayer: "Media Player",
        spark: "Spark",
        expertGuide: "Expert Guide",
        help: "Help",
        uploadImage: "Upload Image / Screenshot",
        attachDoc: "Attach Document",
        cameraVision: "Camera Feed Analysis",
        shareScreen: "Share Screen",
        cadDeconstructor: "3D Assemblable Studio",
        notebooks: "AI Notebooks & Sources",
        disclaimer: "OM AI Assistant may make mistakes. Verify critical actions. Think. Plan. Act. Achieve.",
        noMessages: "No messages in context yet. Speak or type to begin!"
      },
      hi: {
        newChat: "नई चैट",
        recentChats: "हालिया चैट",
        clearAll: "सभी हटाएं",
        terminal: "टर्मिनल",
        export: "निर्यात",
        clearChat: "चैट साफ करें",
        nexusLive: "नेक्सस लाइव",
        thoughtMap: "विचार मानचित्र",
        studio3D: "3D स्टूडियो",
        settings: "सेटिंग्स",
        voiceInput: "वॉइस इनपुट",
        send: "भेजें",
        stop: "रोकें",
        cut: "कट",
        cutSession: "सत्र समाप्त करें",
        writingTools: "लेखन उपकरण",
        inputPlaceholder: "OM से कुछ भी पूछें, कोड लिखें, डेटा विश्लेषण करें या इमेज बनाएं...",
        welcomeHeroTitle: "सोचें। योजना बनाएं। कार्य करें। प्राप्त करें।",
        welcomeHeroDesc: "आज आप क्या हासिल करना चाहते हैं?",
        plusAttach: "अटैचमेंट जोड़ें या टूल खोलें",
        exportMarkdown: "चैट निर्यात करें (मार्कडाउन)",
        exportDesc: "सक्रिय बातचीत को .md फ़ाइल में डाउनलोड करें",
        maleVoice: "पुरुष",
        femaleVoice: "महिला",
        writingLanguage: "लेखन भाषा",
        conversationLanguage: "वार्तालाप भाषा",
        interfaceLanguage: "इंटरफ़ेस भाषा",
        projects: "प्रोजेक्ट्स",
        files: "फ़ाइलें",
        coding: "कोडिंग",
        tasks: "कार्य",
        gems: "जेम्स",
        translate: "अनुवाद",
        smartHome: "स्मार्ट होम",
        mediaPlayer: "मीडिया प्लेयर",
        spark: "स्पार्क",
        expertGuide: "विशेषज्ञ गाइड",
        help: "मदद",
        uploadImage: "इमेज / स्क्रीनशॉट अपलोड करें",
        attachDoc: "दस्तावेज़ जोड़ें",
        cameraVision: "कैमरा विज़न विश्लेषण",
        shareScreen: "स्क्रीन साझा करें",
        cadDeconstructor: "3D असेंबलेबल स्टूडियो",
        notebooks: "AI नोटबुक और स्रोत",
        disclaimer: "OM AI Assistant गलतियाँ कर सकता है। महत्वपूर्ण कार्यों की पुष्टि करें। सोचें। योजना बनाएं। कार्य करें। प्राप्त करें।",
        noMessages: "वर्तमान संदर्भ में कोई संदेश नहीं है। बातचीत शुरू करने के लिए बोलें या लिखें!"
      },
      zh: {
        newChat: "新建对话",
        recentChats: "最近对话",
        clearAll: "清除全部",
        terminal: "终端",
        export: "导出",
        clearChat: "清空当前",
        nexusLive: "Nexus 实时语音",
        thoughtMap: "思维导图",
        studio3D: "3D 工作室",
        settings: "设置",
        voiceInput: "语音输入",
        send: "发送",
        stop: "停止",
        cut: "中断",
        cutSession: "结束会话",
        writingTools: "写作工坊",
        inputPlaceholder: "向 OM 提出任何问题、编写代码、分析数据或生成图像...",
        welcomeHeroTitle: "思考。规划。行动。达成。",
        welcomeHeroDesc: "今天您想实现什么目标？",
        plusAttach: "添加附件或启动工具",
        exportMarkdown: "导出对话 (Markdown)",
        exportDesc: "将当前对话下载为 .md 文档",
        maleVoice: "男声",
        femaleVoice: "女声",
        writingLanguage: "写作语言",
        conversationLanguage: "对话语言",
        interfaceLanguage: "界面语言",
        projects: "项目工坊",
        files: "文件中心",
        coding: "代码沙箱",
        tasks: "任务目标",
        gems: "专属智能体",
        translate: "实时翻译",
        smartHome: "智能家居",
        mediaPlayer: "媒体播放",
        spark: "流程编排",
        expertGuide: "专家指南",
        help: "帮助支持",
        uploadImage: "上传图像 / 截图",
        attachDoc: "添加文件附件",
        cameraVision: "光学摄像头分析",
        shareScreen: "共享屏幕分析",
        cadDeconstructor: "3D 结构解构工作室",
        notebooks: "AI 笔记与资料库",
        disclaimer: "OM AI Assistant 可能会产生错误。请核实重要操作。思考。规划。行动。达成。",
        noMessages: "暂无上下文消息。说话或输入文字即可开启对话！"
      },
      es: {
        newChat: "Nuevo Chat",
        recentChats: "Chats Recientes",
        clearAll: "Borrar Todo",
        terminal: "Terminal",
        export: "Exportar",
        clearChat: "Limpiar Chat",
        nexusLive: "Nexus Live",
        thoughtMap: "Mapa Mental",
        studio3D: "Estudio 3D",
        settings: "Ajustes",
        voiceInput: "Entrada de Voz",
        send: "Enviar",
        stop: "Detener",
        cut: "Cortar",
        cutSession: "Cortar Sesión",
        writingTools: "Herramientas de Escritura",
        inputPlaceholder: "Pregunta a OM, escribe código, analiza datos o crea imágenes...",
        welcomeHeroTitle: "Piensa. Planifica. Actúa. Logra.",
        welcomeHeroDesc: "¿Qué deseas lograr hoy?",
        plusAttach: "Añadir adjuntos o herramientas",
        exportMarkdown: "Exportar Chat (Markdown)",
        exportDesc: "Descargar conversación como archivo .md",
        maleVoice: "Masculino",
        femaleVoice: "Femenino",
        writingLanguage: "Idioma de Redacción",
        conversationLanguage: "Idioma de Conversación",
        interfaceLanguage: "Idioma de la Interfaz",
        projects: "Proyectos",
        files: "Archivos",
        coding: "Programación",
        tasks: "Tareas",
        gems: "Gemas AI",
        translate: "Traductor",
        smartHome: "Hogar Inteligente",
        mediaPlayer: "Reproductor",
        spark: "Flujos Spark",
        expertGuide: "Guía Experta",
        help: "Ayuda",
        uploadImage: "Subir Imagen / Captura",
        attachDoc: "Adjuntar Documento",
        cameraVision: "Visión de Cámara",
        shareScreen: "Compartir Pantalla",
        cadDeconstructor: "Estudio CAD 3D",
        notebooks: "Cuadernos y Fuentes",
        disclaimer: "OM AI Assistant puede cometer errores. Verifique acciones críticas.",
        noMessages: "No hay mensajes en contexto todavía. ¡Hable o escriba para comenzar!"
      },
      fr: {
        newChat: "Nouvelle Discussion",
        recentChats: "Discussions Récentes",
        clearAll: "Tout Effacer",
        terminal: "Terminal",
        export: "Exporter",
        clearChat: "Effacer Discussion",
        nexusLive: "Nexus Live",
        thoughtMap: "Carte Mentale",
        studio3D: "Studio 3D",
        settings: "Paramètres",
        voiceInput: "Entrée Vocale",
        send: "Envoyer",
        stop: "Arrêter",
        cut: "Couper",
        cutSession: "Couper Session",
        writingTools: "Outils d'Écriture",
        inputPlaceholder: "Demandez tout à OM, codez, analysez des données...",
        welcomeHeroTitle: "Penser. Planifier. Agir. Réussir.",
        welcomeHeroDesc: "Que souhaitez-vous accomplir aujourd'hui ?",
        plusAttach: "Ajouter des pièces jointes ou outils",
        exportMarkdown: "Exporter la Discussion (Markdown)",
        exportDesc: "Télécharger la conversation en document .md",
        maleVoice: "Homme",
        femaleVoice: "Femme",
        writingLanguage: "Langue d'Écriture",
        conversationLanguage: "Langue de Conversation",
        interfaceLanguage: "Langue de l'Interface",
        projects: "Projets",
        files: "Fichiers",
        coding: "Codage",
        tasks: "Tâches",
        gems: "Gems",
        translate: "Traduire",
        smartHome: "Maison Connectée",
        mediaPlayer: "Lecteur Multimédia",
        spark: "Pipelines Spark",
        expertGuide: "Guide Expert",
        help: "Aide",
        uploadImage: "Téléverser Image / Capture",
        attachDoc: "Joindre un Document",
        cameraVision: "Vision par Caméra",
        shareScreen: "Partager l'Écran",
        cadDeconstructor: "Déconstructeur 3D",
        notebooks: "Carnets et Sources",
        disclaimer: "OM AI Assistant peut faire des erreurs. Vérifiez les actions critiques.",
        noMessages: "Aucun message dans le contexte pour l'instant."
      },
      de: {
        newChat: "Neuer Chat",
        recentChats: "Verlauf",
        clearAll: "Alles Löschen",
        terminal: "Terminal",
        export: "Exportieren",
        clearChat: "Chat Leeren",
        nexusLive: "Nexus Live",
        thoughtMap: "Gedankenkarte",
        studio3D: "3D Studio",
        settings: "Einstellungen",
        voiceInput: "Spracheingabe",
        send: "Senden",
        stop: "Stopp",
        cut: "Beenden",
        cutSession: "Sitzung Beenden",
        writingTools: "Schreibwerkzeuge",
        inputPlaceholder: "Fragen Sie OM alles, programmieren Sie, analysieren Sie Daten...",
        welcomeHeroTitle: "Denken. Planen. Handeln. Erreichen.",
        welcomeHeroDesc: "Was möchten Sie heute erreichen?",
        plusAttach: "Anhänge oder Tools hinzufügen",
        exportMarkdown: "Chat Exportieren (Markdown)",
        exportDesc: "Konversation als .md-Dokument herunterladen",
        maleVoice: "Männlich",
        femaleVoice: "Weiblich",
        writingLanguage: "Schreibsprache",
        conversationLanguage: "Konversationssprache",
        interfaceLanguage: "Benutzeroberflächensprache",
        projects: "Projekte",
        files: "Dateien",
        coding: "Programmierung",
        tasks: "Aufgaben",
        gems: "Gems",
        translate: "Übersetzen",
        smartHome: "Smart Home",
        mediaPlayer: "Mediaplayer",
        spark: "Spark Workflows",
        expertGuide: "Expertenratgeber",
        help: "Hilfe",
        uploadImage: "Bild / Screenshot hochladen",
        attachDoc: "Dokument anhängen",
        cameraVision: "Kamera-Vision",
        shareScreen: "Bildschirm teilen",
        cadDeconstructor: "3D CAD Studio",
        notebooks: "Notizbücher & Quellen",
        disclaimer: "OM AI Assistant kann Fehler machen. Überprüfen Sie kritische Aktionen.",
        noMessages: "Noch keine Nachrichten im Verlauf."
      },
      ja: {
        newChat: "新しいチャット",
        recentChats: "最近のチャット",
        clearAll: "すべてクリア",
        terminal: "ターミナル",
        export: "エクスポート",
        clearChat: "チャットをクリア",
        nexusLive: "Nexus ライブ",
        thoughtMap: "思考マップ",
        studio3D: "3D スタジオ",
        settings: "設定",
        voiceInput: "音声入力",
        send: "送信",
        stop: "停止",
        cut: "切断",
        cutSession: "セッション終了",
        writingTools: "執筆ツール",
        inputPlaceholder: "OMに何でも質問、コード記述、データ分析、画像生成...",
        welcomeHeroTitle: "思考。計画。実行。達成。",
        welcomeHeroDesc: "今日は何を達成しますか？",
        plusAttach: "添付ファイルやツールを追加",
        exportMarkdown: "チャットをエクスポート (Markdown)",
        exportDesc: "アクティブな会話を .md ファイルでダウンロード",
        maleVoice: "男性",
        femaleVoice: "女性",
        writingLanguage: "執筆言語",
        conversationLanguage: "会話言語",
        interfaceLanguage: "インターフェース言語",
        projects: "プロジェクト",
        files: "ファイル",
        coding: "コーディング",
        tasks: "タスク",
        gems: "ジェムズ",
        translate: "翻訳スタジオ",
        smartHome: "スマートホーム",
        mediaPlayer: "メディアプレーヤー",
        spark: "スパーク自動化",
        expertGuide: "エキスパートガイド",
        help: "ヘルプ",
        uploadImage: "画像/スクリーンショットをアップロード",
        attachDoc: "ドキュメントを添付",
        cameraVision: "カメラビジョン分析",
        shareScreen: "画面共有",
        cadDeconstructor: "3D CADスタジオ",
        notebooks: "ノートブックと資料",
        disclaimer: "OM AI Assistant は間違いを犯す可能性があります。重要なアクションを確認してください。",
        noMessages: "コンテキストにメッセージはまだありません。"
      }
    };
  }

  t(key, fallback = '') {
    const dict = this.dictionaries[this.currentLocale] || this.dictionaries[this.DEFAULT_LOCALE];
    if (dict && dict[key]) return dict[key];
    const enDict = this.dictionaries[this.DEFAULT_LOCALE];
    return (enDict && enDict[key]) || fallback || key;
  }

  setInterfaceLanguage(locale) {
    if (!this.dictionaries[locale]) {
      locale = this.DEFAULT_LOCALE;
    }
    this.currentLocale = locale;
    localStorage.setItem('om_ui_language', locale);
    this.applyTranslations();

    // Sync UI select if present
    const uiSelect = document.getElementById('settings-ui-lang-select');
    if (uiSelect) uiSelect.value = locale;

    if (window.omApp && typeof window.omApp.showToast === 'function') {
      window.omApp.showToast(`Interface language set to ${this.getLanguageDisplayName(locale)}`, 'info');
    }
  }

  setWritingLanguage(langCode) {
    this.writingLocale = langCode || 'en-US';
    localStorage.setItem('om_writing_language', this.writingLocale);
    
    const writingSelect = document.getElementById('settings-writing-lang-select');
    if (writingSelect) writingSelect.value = this.writingLocale;

    const dockWritingPill = document.getElementById('capsule-writing-lang-pill');
    if (dockWritingPill) {
      dockWritingPill.textContent = this.getLanguageDisplayName(this.writingLocale);
    }

    if (window.omApp && typeof window.omApp.showToast === 'function') {
      window.omApp.showToast(`Writing language set to ${this.getLanguageDisplayName(this.writingLocale)}`, 'info');
    }
  }

  setConversationLanguage(langCode) {
    this.conversationLocale = langCode || 'en-US';
    localStorage.setItem('om_conversation_language', this.conversationLocale);
    localStorage.setItem('om_voice_language', this.conversationLocale);

    if (window.omVoice) {
      window.omVoice.setLanguage(this.conversationLocale);
    }
    if (window.omJarvisLive) {
      window.omJarvisLive.setLanguage(this.conversationLocale);
    }

    const headerLangSelect = document.getElementById('global-lang-selector');
    if (headerLangSelect) headerLangSelect.value = this.conversationLocale;

    const liveLangSelect = document.getElementById('live-voice-lang-select');
    if (liveLangSelect) liveLangSelect.value = this.conversationLocale;

    const settingsConvSelect = document.getElementById('settings-conv-lang-select');
    if (settingsConvSelect) settingsConvSelect.value = this.conversationLocale;
  }

  getLanguageDisplayName(code) {
    const map = {
      'en': 'English',
      'en-US': 'English (US)',
      'hi': 'हिन्दी (Hindi)',
      'hi-IN': 'हिन्दी (Hindi)',
      'zh': '中文 (Chinese)',
      'zh-CN': '中文 (Chinese)',
      'es': 'Español',
      'es-ES': 'Español',
      'fr': 'Français',
      'fr-FR': 'Français',
      'de': 'Deutsch',
      'de-DE': 'Deutsch',
      'ja': '日本語 (Japanese)',
      'ja-JP': '日本語 (Japanese)'
    };
    return map[code] || code;
  }

  applyTranslations() {
    // 1. Elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const text = this.t(key);
        if (text) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
          } else {
            el.textContent = text;
          }
        }
      }
    });

    // 2. Elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const text = this.t(key);
        if (text) el.title = text;
      }
    });

    // 3. Known critical UI elements
    const newChatBtn = document.getElementById('btn-sidebar-new-chat');
    if (newChatBtn) {
      const span = newChatBtn.querySelector('.nav-item-title') || newChatBtn;
      span.textContent = this.t('newChat', 'New Chat');
    }

    const recentsHeader = document.querySelector('.sidebar-section-header .section-title');
    if (recentsHeader) recentsHeader.textContent = this.t('recentChats', 'Recents');

    const clearAllBtn = document.getElementById('btn-clear-all-history');
    if (clearAllBtn) {
      const span = clearAllBtn.querySelector('span');
      if (span) span.textContent = this.t('clearAll', 'Clear All');
    }

    const sidebarExportBtn = document.getElementById('btn-sidebar-export-chat');
    if (sidebarExportBtn) {
      const span = sidebarExportBtn.querySelector('span');
      if (span) span.textContent = this.t('export', 'Export');
    }

    const headerExportBtn = document.getElementById('btn-export-chat');
    if (headerExportBtn) {
      const label = headerExportBtn.querySelector('.export-btn-label');
      if (label) label.textContent = this.t('export', 'Export');
      headerExportBtn.title = this.t('exportMarkdown', 'Export conversation as Markdown');
    }

    const headerClearBtn = document.getElementById('btn-clear-chat');
    if (headerClearBtn) {
      const span = headerClearBtn.querySelector('span:last-child');
      if (span) span.textContent = this.t('clearChat', 'Clear Chat');
    }

    const terminalBtn = document.getElementById('btn-header-cyber-terminal');
    if (terminalBtn) {
      const span = terminalBtn.querySelector('.header-btn-text');
      if (span) span.textContent = this.t('terminal', 'Terminal');
    }

    const thoughtMapBtn = document.getElementById('btn-header-neural-canvas');
    if (thoughtMapBtn) {
      const span = thoughtMapBtn.querySelector('.header-btn-text');
      if (span) span.textContent = this.t('thoughtMap', 'Thought Map');
    }

    const studio3DBtn = document.getElementById('btn-header-3d-dismantle');
    if (studio3DBtn) {
      const span = studio3DBtn.querySelector('span:last-child');
      if (span) span.textContent = this.t('studio3D', '3D Studio');
    }

    const nexusLiveBtn = document.getElementById('btn-header-nexus-live');
    if (nexusLiveBtn && !window.omJarvisLive?.isActive) {
      nexusLiveBtn.innerHTML = `<span>🎙️ ${this.t('nexusLive', 'Nexus Live')}</span>`;
    }

    const chatInput = document.getElementById('chat-user-input');
    if (chatInput) {
      chatInput.placeholder = this.t('inputPlaceholder', 'Ask OM anything, write code, analyze data, or generate images...');
    }

    const heroTitle = document.querySelector('.welcome-hero-title');
    if (heroTitle) heroTitle.textContent = this.t('welcomeHeroTitle', 'Think. Plan. Act. Achieve.');

    const heroDesc = document.querySelector('.welcome-hero-desc');
    if (heroDesc) heroDesc.textContent = this.t('welcomeHeroDesc', 'What would you like to achieve today?');

    const voiceBtn = document.getElementById('btn-voice-input');
    if (voiceBtn) voiceBtn.title = `${this.t('voiceInput', 'Voice Input')} (Speech-to-Text)`;

    const sendBtn = document.getElementById('btn-chat-send');
    if (sendBtn) sendBtn.title = `${this.t('send', 'Send')} (Enter)`;

    const plusBtn = document.getElementById('btn-capsule-plus');
    if (plusBtn) plusBtn.title = this.t('plusAttach', 'Add attachments or launch tools');

    const disclaimer = document.querySelector('.dock-disclaimer');
    if (disclaimer) disclaimer.textContent = this.t('disclaimer');
  }
}

// Global Singleton
window.omI18n = new OMI18nEngine();
