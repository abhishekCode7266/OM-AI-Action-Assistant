/**
 * OM AI Assistant - Chat & Memory Store
 * Manages multi-chat histories, chronological grouping, search, auto-naming, and cross-chat memory.
 */

class OMChatStore {
  constructor() {
    this.STORAGE_KEY = 'om_conversations_v3';
    this.ACTIVE_CHAT_KEY = 'om_active_chat_id';
    this.MEMORY_KEY = 'om_user_memory_v1';
    this.SETTINGS_KEY = 'om_settings_v2';
    
    this.chats = this.loadChats();
    this.activeChatId = localStorage.getItem(this.ACTIVE_CHAT_KEY) || null;
    this.memory = this.loadMemory();
    this.settings = this.loadSettings();
    this.currentUser = this.loadUser();

    // Ensure at least one active chat exists
    if (!this.activeChatId || !this.getChat(this.activeChatId)) {
      if (this.chats.length > 0) {
        this.activeChatId = this.chats[0].id;
      } else {
        const newChat = this.createChat("New Chat");
        this.activeChatId = newChat.id;
      }
      localStorage.setItem(this.ACTIVE_CHAT_KEY, this.activeChatId);
    }
  }

  getSeedChats() {
    const now = Date.now();
    return [
      {
        id: 'chat-seed-reel',
        title: 'Student Hacks Reel Script',
        mode: 'writing',
        pinned: true,
        createdAt: now - 3600 * 1000 * 1,
        updatedAt: now - 3600 * 1000 * 1,
        messages: [
          {
            id: 'm-reel-1',
            sender: 'user',
            text: 'Create a viral 30-second Instagram Reel script for college students covering 3 powerful productivity hacks.',
            timestamp: new Date(now - 3600 * 1000 * 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-reel-2',
            sender: 'om',
            text: `### 🎬 Viral 30-Second Student Hacks Reel Script\n\n**Hook (0–3s)**: Stop studying for 8 hours straight. Here are 3 science-backed hacks top students use:\n\n1. **The 25/5 Pomodoro Wave (3–10s)**: Work in 25-minute sprints with zero notifications, then take 5 minutes of real screen-free rest.\n2. **Feynman Quick-Teach (10–20s)**: Explain your toughest concept out loud as if teaching a 10-year-old. What you can't simplify, you don't understand yet.\n3. **Active Recall Testing (20–27s)**: Close your textbook and write down everything you remember. This forces neural retrieval paths to lock in memory.\n\n**Call-To-Action (27–30s)**: Save this reel and try it on your next study session! 🚀`,
            reasoning: "1. Optimized pacing for short-form retention.\n2. Included 3 high-impact verified study strategies.",
            verified: true,
            timestamp: new Date(now - 3600 * 1000 * 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      },
      {
        id: 'chat-seed-cuisine',
        title: 'Exploring Diverse American Cuisine',
        mode: 'general',
        pinned: false,
        createdAt: now - 3600 * 1000 * 3,
        updatedAt: now - 3600 * 1000 * 3,
        messages: [
          {
            id: 'm-cuis-1',
            sender: 'user',
            text: 'What are the defining characteristics and regional differences in American cuisine?',
            timestamp: new Date(now - 3600 * 1000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-cuis-2',
            sender: 'om',
            text: `### 🍲 Regional Tapestry of American Cuisine\n\nAmerican culinary tradition is defined by regional heritage and cultural fusion:\n\n* **Southern BBQ & Soul Food**: Slow-smoked brisket in Texas, Carolina vinegar-based pulled pork, and rich buttermilk fried chicken.\n* **New England Seafood**: Clam chowder, butter-poached Maine lobster rolls, and fresh Atlantic cod.\n* **Cajun & Creole (Louisiana)**: Gumbo, jambalaya, and crawfish étouffée with French, African, and Spanish spices.\n* **Tex-Mex & Southwest**: Charred chile peppers, fajitas, and slow-braised carnitas.\n* **Pacific Northwest & California**: Farm-to-table focus on wild salmon, sourdough, and seasonal produce.`,
            reasoning: "1. Structured regional breakdown.\n2. Highlighted cultural influences and signature dishes.",
            verified: true,
            timestamp: new Date(now - 3600 * 1000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      },
      {
        id: 'chat-seed-1',
        title: 'AI Interviewer and Developer Prompts',
        mode: 'career',
        pinned: false,
        createdAt: now - 3600 * 1000 * 5,
        updatedAt: now - 3600 * 1000 * 5,
        messages: [
          {
            id: 'm-1',
            sender: 'user',
            text: 'I want to prepare for a Senior Full-Stack Developer interview. Can you provide 3 challenging STAR questions and ideal answers?',
            timestamp: new Date(now - 3600 * 1000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-2',
            sender: 'om',
            text: `### 🎯 Senior Full-Stack Developer Mock Interview: STAR Questions

Here are three high-frequency behavioral and architectural questions with structured STAR answers:

#### 1. System Scaling Under Peak Traffic
* **Situation**: During a flash sale, our checkout API experienced sudden latency spikes from 120ms to 4.2s.
* **Task**: Identify bottlenecks and scale service throughput without downtime.
* **Action**: Introduced Redis caching for product inventory and deployed horizontal pod autoscalers (HPA) in Kubernetes.
* **Result**: Latency stabilized at 85ms with 99.99% uptime through 50,000 req/sec.

#### 2. Resolving Technical Debt vs Product Delivery
* **Situation**: Legacy monolithic database queries blocked new dashboard feature releases.
* **Task**: Balance engineering refactor with client sprint deadlines.
* **Action**: Implemented read-replicas and async worker queues (BullMQ) to decouple heavy reports.
* **Result**: Shipped the product sprint on schedule while improving query efficiency by 65%.

#### 3. Cross-Functional Engineering Conflict
* **Situation**: Frontend and Backend teams had misaligned GraphQL schema definitions 3 days before release.
* **Task**: Align API contracts quickly without blocking QA.
* **Action**: Facilitated a 45-minute contract review using OpenAPI/GraphQL SDL schema mocks.
* **Result**: Zero regression defects and flawless deployment.`,
            reasoning: "1. Structured interview response using STAR method.\n2. Addressed real-world distributed systems and team collaboration.",
            verified: true,
            timestamp: new Date(now - 3600 * 1000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { stage: 'think', title: 'Review behavioral interview STAR framework', estimate: '30m' },
              { stage: 'plan', title: 'Draft tailored personal project metrics', estimate: '1h' },
              { stage: 'act', title: 'Conduct simulated mock voice interview', estimate: '45m' },
              { stage: 'achieve', title: 'Complete interview readiness assessment', estimate: '15m' }
            ]
          }
        ]
      },
      {
        id: 'chat-seed-2',
        title: 'EduBridge ke Unique Naam ke Ideas',
        mode: 'general',
        pinned: false,
        createdAt: now - 3600 * 1000 * 5,
        updatedAt: now - 3600 * 1000 * 5,
        messages: [
          {
            id: 'm-3',
            sender: 'user',
            text: 'EduBridge jaise innovative education startup ke liye kuch catchy aur modern Hindi-English fusion naam batao.',
            timestamp: new Date(now - 3600 * 1000 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-4',
            sender: 'om',
            text: `### 🚀 EduBridge Ke Liye Top Creative & Modern Brand Names

Yahan education aur skill-building startups ke liye catchy, brandable naam hain:

| Category | Brand Name | Meaning & Vibe |
| :--- | :--- | :--- |
| **Modern Fusion** | **VidyaSetu** | Knowledge bridge, trustworthy aur Indian connection |
| **Tech-Driven** | **LearnNova** | High-velocity next-generation learning platform |
| **Action-Oriented** | **GyaanPath** | Clear career roadmap aur skill development |
| **Youth & Career** | **SkillSetu** | Industry-readiness aur direct placement bridge |
| **Minimalist** | **Praxis Ed** | Hands-on practical knowledge aur projects |

#### 💡 Recommendation:
Agar corporate ya global audience target karni ho toh **SkillSetu** ya **VidyaSetu** sabse strong aur memorable hain!`,
            reasoning: "1. Brand Analysis: Evaluated phonetic appeal, semantic relevance, and domain viability.",
            verified: true,
            timestamp: new Date(now - 3600 * 1000 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      },
      {
        id: 'chat-seed-3',
        title: 'Python Library Management DSA Code',
        mode: 'coding',
        pinned: false,
        createdAt: now - 3600 * 1000 * 12,
        updatedAt: now - 3600 * 1000 * 12,
        messages: [
          {
            id: 'm-5',
            sender: 'user',
            text: 'Write a Python Library Management System using Object-Oriented DSA with search, issue, and return features.',
            timestamp: new Date(now - 3600 * 1000 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-6',
            sender: 'om',
            text: `### 📚 Python Library Management System (OOP & Hash Map DSA)

Here is a clean, production-grade implementation using Python classes, dictionaries for O(1) lookup, and transaction logging:

\`\`\`python
class Book:
    def __init__(self, book_id, title, author):
        self.id = book_id
        self.title = title
        self.author = author
        self.is_issued = False
        self.issued_to = None

class Library:
    def __init__(self, name):
        self.name = name
        self.books = {} # O(1) Lookup by ID
        self.issued_records = []

    def add_book(self, book_id, title, author):
        if book_id in self.books:
            return False, "Book ID already exists."
        self.books[book_id] = Book(book_id, title, author)
        return True, f"'{title}' added successfully."

    def issue_book(self, book_id, student_name):
        book = self.books.get(book_id)
        if not book:
            return False, "Book not found."
        if book.is_issued:
            return False, f"Book is already issued to {book.issued_to}."
        book.is_issued = True
        book.issued_to = student_name
        self.issued_records.append({"book_id": book_id, "student": student_name})
        return True, f"Book '{book.title}' issued to {student_name}."

    def return_book(self, book_id):
        book = self.books.get(book_id)
        if not book or not book.is_issued:
            return False, "Book was not issued."
        book.is_issued = False
        prev_user = book.issued_to
        book.issued_to = None
        return True, f"Book '{book.title}' returned from {prev_user}."

# Sample Execution
lib = Library("National Digital Library")
lib.add_book("B101", "Clean Code", "Robert C. Martin")
lib.add_book("B102", "Introduction to Algorithms (CLRS)", "Cormen")
print(lib.issue_book("B101", "Alex"))
print(lib.return_book("B101"))
\`\`\`

#### Key Architecture Points:
1. **Time Complexity**: O(1) lookup and return via hash-mapped dictionary.
2. **Safety Checks**: Validates double-issuance and non-existent IDs.`,
            reasoning: "1. Designed OOP data contracts.\n2. Implemented O(1) state transitions with robust error handling.",
            verified: true,
            timestamp: new Date(now - 3600 * 1000 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      },
      {
        id: 'chat-seed-4',
        title: 'Troubleshooting GitHub Link 404 Error',
        mode: 'coding',
        pinned: false,
        createdAt: now - 3600 * 1000 * 20,
        updatedAt: now - 3600 * 1000 * 20,
        messages: [
          {
            id: 'm-7',
            sender: 'user',
            text: 'Why does my GitHub Pages deployment show a 404 Not Found error?',
            timestamp: new Date(now - 3600 * 1000 * 20).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-8',
            sender: 'om',
            text: `### 🔧 Troubleshooting GitHub Pages 404 Not Found

A 404 error on GitHub Pages typically stems from three common causes:

1. **Repository Case Sensitivity & Branch Setting**:
   - Ensure your repository settings under **Settings ➔ Pages** have the Source set to **Deploy from a branch** with branch **\`main\`** (or \`gh-pages\`) and folder **\`/ (root)\`**.
2. **Missing \`index.html\` at Root**:
   - GitHub Pages requires an \`index.html\` file located directly in the root directory. If your file is inside a subfolder, it will return 404.
3. **DNS / Propagation Delay**:
   - Newly published Pages take approximately 1–3 minutes to generate SSL certificates and propagate globally.`,
            reasoning: "1. Identified top 3 failure vectors for GitHub Pages deployment.\n2. Outlined clear remediation checklist.",
            verified: true,
            timestamp: new Date(now - 3600 * 1000 * 20).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      },
      {
        id: 'chat-seed-5',
        title: 'Fixing Certificate Internship Date Error',
        mode: 'career',
        pinned: false,
        createdAt: now - 3600 * 1000 * 28,
        updatedAt: now - 3600 * 1000 * 28,
        messages: [
          {
            id: 'm-9',
            sender: 'user',
            text: 'How should I request HR to correct the dates on my internship completion certificate?',
            timestamp: new Date(now - 3600 * 1000 * 28).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-10',
            sender: 'om',
            text: `### ✉️ Formal Email Draft for Certificate Date Correction

**Subject**: Request for Correction in Internship Certificate Dates – [Your Name]

**Dear HR Team,**

I hope this email finds you well.

I would like to sincerely thank you and the entire team for the enriching learning experience during my internship.

Upon reviewing my recently issued Internship Certificate, I noticed a minor typographical error regarding my tenure dates. Could you kindly issue an updated certificate reflecting the correct duration? I have attached the original offer letter for verification.

Thank you very much for your time and assistance.

Warm regards,  
**[Your Name]**`,
            reasoning: "1. Drafted professional corporate correspondence.",
            verified: true,
            timestamp: new Date(now - 3600 * 1000 * 28).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      },
      {
        id: 'chat-seed-6',
        title: 'GitHub पोर्टफोलियो लिंक समस्या समाधान',
        mode: 'coding',
        pinned: false,
        createdAt: now - 3600 * 1000 * 48,
        updatedAt: now - 3600 * 1000 * 48,
        messages: [
          {
            id: 'm-11',
            sender: 'user',
            text: 'GitHub portfolio link open karne par issue aa raha hai, isko solve karne ka checklist do.',
            timestamp: new Date(now - 3600 * 1000 * 48).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-12',
            sender: 'om',
            text: `### 🚀 GitHub Portfolio Link Fix Checklist

Agar aapka live link open nahi ho raha, toh ye 4 points check karein:

1. **Public Visibility**: Repository ko **Public** hona chahiye (**Settings ➔ Danger Zone ➔ Change Visibility**).
2. **GitHub Pages Enabled**: **Settings ➔ Pages** mein jaakar Source ko **Deploy from a branch** aur branch ko **main** set karein.
3. **Repository URL Structure**: Format: \`https://<username>.github.io/<repo-name>/\`
4. **Console Errors**: F12 dabakar check karein ki koi file path galat toh nahi.`,
            reasoning: "1. Hindi-English resolution checklist for GitHub deployment.",
            verified: true,
            timestamp: new Date(now - 3600 * 1000 * 48).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ];
  }

  loadChats() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      if (!parsed || parsed.length === 0 || (parsed.length === 1 && parsed[0].title === 'New Chat' && parsed[0].messages.length === 0)) {
        const seed = this.getSeedChats();
        this.saveChatsDirect(seed);
        return seed;
      }
      return parsed;
    } catch (e) {
      console.warn("Failed to parse chats from localStorage, initializing fresh store", e);
      const seed = this.getSeedChats();
      return seed;
    }
  }

  saveChatsDirect(chats) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {}
  }

  saveChats() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.chats));
    } catch (e) {
      console.error("Error saving chats to localStorage", e);
    }
  }

  togglePinChat(chatId) {
    const chat = this.getChat(chatId);
    if (chat) {
      chat.pinned = !chat.pinned;
      chat.updatedAt = Date.now();
      this.saveChats();
      return chat.pinned;
    }
    return false;
  }

  getNotebooks() {
    try {
      const stored = localStorage.getItem('om_notebooks_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    const defaultNotebooks = [
      {
        id: 'nb-1',
        title: 'Untitled notebook',
        createdAt: Date.now() - 86400000 * 2,
        content: `# Engineering & Architecture Notes\n\nProject: OM AI Action Assistant\nStatus: 100% Operational\n\n### Key Objectives\n1. Autonomous Multi-Agent Workflows (Think -> Plan -> Act -> Achieve)\n2. Real-time Python Code Execution with live terminal output\n3. 3D Spatial CAD Inspection & Assembly simulations\n4. Multimodal Vision & OCR inspection across multiple image attachments\n\n---\n### Scratchpad & Ideas\n- High-velocity WebSockets / WebRTC for live voice streaming\n- GPU-accelerated local WebGL shader pipeline for CAD deconstruction`,
        entries: []
      },
      {
        id: 'nb-2',
        title: 'Copy of Untitled notebook',
        createdAt: Date.now() - 86400000,
        content: `# Multimodal Prompt Engineering & System Blueprint\n\nTarget Environment: Standard Production\nAccess Level: Standard\n\n### Standard Invariants\n- Conversational tone and structured markdown formatting\n- Responsive across desktop, tablet, and mobile displays\n- Verification and actionable step execution`,
        entries: []
      }
    ];
    this.saveNotebooks(defaultNotebooks);
    return defaultNotebooks;
  }

  saveNotebooks(notebooks) {
    try {
      localStorage.setItem('om_notebooks_v1', JSON.stringify(notebooks));
    } catch (e) {}
  }

  createNotebook(title = 'Untitled notebook') {
    const list = this.getNotebooks();
    const cleanTitle = title.trim() || 'Untitled notebook';
    const nb = {
      id: 'nb-' + Date.now(),
      title: cleanTitle,
      createdAt: Date.now(),
      sources: 0,
      notes: 1,
      content: `# ${cleanTitle}\n\nCreated on ${new Date().toLocaleDateString()}.\n\n### Research & Notes\nAdd sources, synthesis, and key insights here.`,
      entries: []
    };
    list.unshift(nb);
    this.saveNotebooks(list);
    return nb;
  }

  deleteNotebook(id) {
    let list = this.getNotebooks().filter(n => n.id !== id);
    this.saveNotebooks(list);
    return list;
  }

  addChatToNotebook(notebookId, chat) {
    const list = this.getNotebooks();
    let target = list.find(n => n.id === notebookId) || list[0];
    if (!target) {
      target = this.createNotebook('My Notebook');
    }
    target.entries = target.entries || [];
    target.sources = (target.sources || 0) + 1;
    target.notes = (target.notes || 0) + 1;
    const chatSnippet = chat.messages ? chat.messages.map(m => `**${m.sender === 'user' ? 'User' : 'OM'}**: ${m.text}`).join('\n\n') : '';
    target.content = (target.content || '') + `\n\n---\n### Attached Conversation: ${chat.title}\n${chatSnippet}`;
    target.entries.push({
      chatId: chat.id,
      title: chat.title,
      addedAt: Date.now(),
      snippet: chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text.slice(0, 200) : ''
    });
    this.saveNotebooks(list);
    return target;
  }

  loadMemory() {
    try {
      const data = localStorage.getItem(this.MEMORY_KEY);
      return data ? JSON.parse(data) : {
        enabled: true,
        facts: [
          { id: 'mem-1', text: "Preferred programming languages: Python, JavaScript, React", created: Date.now() },
          { id: 'mem-2', text: "Target work style: High-velocity, modular, Think-Plan-Act-Achieve", created: Date.now() }
        ]
      };
    } catch (e) {
      return { enabled: true, facts: [] };
    }
  }

  saveMemory() {
    try {
      localStorage.setItem(this.MEMORY_KEY, JSON.stringify(this.memory));
    } catch (e) {}
  }

  loadSettings() {
    const DEFAULT_PROMPT = `Act as Gemini in Live mode, supporting real-time, voice-to-voice communication and seamless switching between voice commands and text inputs, with clear playback and processing. Maintain an overlay view of your chat history for continuous context, and be ready to process live video feeds and screen sharing. Integrate all workspace tools, including the notebook for drafting, Spark for workflow automation, the visual illustration module for image generation and video editing, 3D modeling, and code writing support. Incorporate advanced interface options like the gems and settings sections. Additionally, support real-time language translation, internet search, smart home device control, media playback management, and use the expert guide for complex tasks. Respond naturally and conversationally, avoiding machine-like recitation of instructions.`;

    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      const parsed = data ? JSON.parse(data) : {};
      return {
        apiKey: localStorage.getItem('om_nexus_key') || localStorage.getItem('om_custom_provider_key') || parsed.apiKey || '',
        model: (parsed.model && !parsed.model.includes('gemini')) ? parsed.model : 'nexus-2.0-flash',
        autoSpeech: parsed.autoSpeech !== undefined ? parsed.autoSpeech : false,
        voiceRate: parsed.voiceRate || 1.0,
        voicePitch: parsed.voicePitch || 1.0,
        userPlan: localStorage.getItem('om_user_plan') || parsed.userPlan || 'standard',
        isDeveloper: localStorage.getItem('om_dev_mode') === 'true',
        developerTier: 'Standard',
        systemPrompt: parsed.systemPrompt || DEFAULT_PROMPT,
        theme: 'dark'
      };
    } catch (e) {
      return {
        apiKey: '',
        model: 'nexus-2.0-flash',
        autoSpeech: false,
        voiceRate: 1.0,
        voicePitch: 1.0,
        userPlan: 'standard',
        isDeveloper: false,
        developerTier: 'Standard',
        systemPrompt: DEFAULT_PROMPT,
        theme: 'dark'
      };
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
    if (newSettings.apiKey !== undefined) {
      localStorage.setItem('om_custom_provider_key', newSettings.apiKey);
    }
    if (newSettings.userPlan !== undefined) {
      localStorage.setItem('om_user_plan', newSettings.userPlan);
    }
    if (newSettings.isDeveloper !== undefined) {
      localStorage.setItem('om_dev_mode', newSettings.isDeveloper ? 'true' : 'false');
    }
  }

  loadUser() {
    try {
      const data = localStorage.getItem('om_auth_user_v2');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.name) {
          // Cleanse legacy hardcoded identity overrides from localStorage
          if (parsed.name === 'Udayast' || parsed.addressAs === 'Boss' || parsed.devToken) {
            parsed.name = 'User';
            parsed.displayName = 'User';
            parsed.addressAs = 'User';
            parsed.role = 'user';
            parsed.isDeveloper = false;
            parsed.tier = 'Standard';
            parsed.tierBadge = 'Free';
            parsed.plan = 'standard';
            delete parsed.devToken;
            localStorage.setItem('om_auth_user_v2', JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) {}

    return {
      id: 'usr-guest',
      name: 'User',
      displayName: 'User',
      addressAs: 'User',
      email: 'user@example.com',
      avatar: 'assets/icons/logo.svg',
      role: 'user',
      tier: 'Standard',
      tierBadge: 'Free',
      plan: 'standard',
      location: 'Global',
      isDeveloper: false,
      subscription: {
        name: 'Standard Free Tier',
        status: 'Active',
        price: '$0.00 / Free',
        expires: 'Ongoing',
        tierId: 'standard',
        isUnlimited: false
      }
    };
  }

  saveUser(user) {
    this.currentUser = user;
    try {
      localStorage.setItem('om_auth_user_v2', JSON.stringify(user));
    } catch (e) {}
  }

  signIn(email, password, asDev = false) {
    const cleanName = (email && email.includes('@')) ? email.split('@')[0] : 'User';
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const user = {
      id: 'usr-' + Date.now().toString(36),
      name: formattedName,
      displayName: formattedName,
      addressAs: formattedName,
      email: email || 'user@example.com',
      avatar: 'assets/icons/logo.svg',
      role: asDev ? 'developer' : 'user',
      tier: 'Standard',
      tierBadge: 'Free',
      plan: 'standard',
      location: 'Global',
      isDeveloper: asDev,
      subscription: {
        name: 'Standard Free Tier',
        status: 'Active',
        price: '$0.00 / Free',
        expires: 'Ongoing',
        tierId: 'standard',
        isUnlimited: false
      }
    };
    this.saveUser(user);
    this.saveSettings({ userPlan: 'standard', isDeveloper: asDev });
    return user;
  }

  register(name, email, password) {
    const user = {
      id: 'usr-' + Date.now().toString(36),
      name: name || 'User',
      displayName: name || 'User',
      addressAs: name || 'User',
      email: email || 'user@example.com',
      avatar: 'assets/icons/logo.svg',
      role: 'user',
      tier: 'Standard',
      tierBadge: 'Free',
      plan: 'standard',
      location: 'Global',
      isDeveloper: false,
      subscription: {
        name: 'Standard Free Tier',
        status: 'Active',
        price: '$0.00 / Free',
        expires: 'Ongoing',
        tierId: 'standard',
        isUnlimited: false
      }
    };
    this.saveUser(user);
    this.saveSettings({ userPlan: 'standard', isDeveloper: false });
    return user;
  }

  signOut() {
    const guestUser = {
      id: 'usr-guest',
      name: 'User',
      displayName: 'User',
      addressAs: 'User',
      email: 'user@example.com',
      avatar: 'assets/icons/logo.svg',
      role: 'guest',
      tier: 'Standard',
      tierBadge: 'Free',
      plan: 'standard',
      location: 'Global',
      isDeveloper: false,
      subscription: {
        name: 'Standard Free Tier',
        status: 'Active',
        price: '$0.00 / Free',
        expires: 'Ongoing',
        tierId: 'standard',
        isUnlimited: false
      }
    };
    this.saveUser(guestUser);
    this.saveSettings({ userPlan: 'standard', isDeveloper: false });
    return guestUser;
  }

  upgradePlan(tierId) {
    const tierMap = {
      trial_0: { name: '₹0 Free Trial', price: '₹0 / Starter', tierBadge: 'Free', expires: 'Standard Starter Access' },
      free: { name: '₹0 Free Trial', price: '₹0 / Starter', tierBadge: 'Free', expires: 'Standard Starter Access' },
      trial_3month: { name: '3-Month Free Trial', price: '₹0 / for 90 days', tierBadge: 'Trial', expires: '90 Days from activation' },
      plan_3month: { name: 'Nexus 3-Month Plan', price: '₹199 / 3 Months', tierBadge: '3M', expires: '90 Days auto-renew' },
      plan_1year: { name: 'Nexus 1-Year Standard', price: '₹399 / 1 Year', tierBadge: '1Y', expires: '365 Days auto-renew' },
      plan_1year_pro: { name: 'Nexus 1-Year Pro (All Tools Unlimited)', price: '₹699 / 1 Year', tierBadge: 'PRO', expires: '365 Days auto-renew' },
      pro: { name: 'Nexus 1-Year Pro (All Tools Unlimited)', price: '₹699 / 1 Year', tierBadge: 'PRO', expires: '365 Days auto-renew' },
      ultra: { name: 'Nexus 1-Year Pro (All Tools Unlimited)', price: '₹699 / 1 Year', tierBadge: 'PRO', expires: '365 Days auto-renew' }
    };

    const target = tierMap[tierId] || tierMap.plan_1year_pro;

    this.currentUser.plan = tierId;
    this.currentUser.tier = target.name;
    this.currentUser.tierBadge = target.tierBadge;
    this.currentUser.isDeveloper = false;
    if (tierId === 'trial_3month') {
      this.currentUser.trialStartedAt = Date.now();
    }
    this.currentUser.subscription = {
      name: target.name,
      status: 'Active',
      price: target.price,
      expires: target.expires,
      tierId: tierId,
      isTrial: tierId === 'trial_3month' || tierId === 'trial_0',
      isUnlimited: tierId === 'plan_1year_pro' || tierId === 'pro' || tierId === 'ultra'
    };

    this.saveUser(this.currentUser);
    this.saveSettings({ userPlan: this.currentUser.plan, isDeveloper: false });
    return this.currentUser;
  }

  getTrialInfo() {
    if (this.isDeveloper()) {
      return {
        isDeveloper: true,
        isTrial: false,
        isExpired: false,
        daysRemaining: Infinity,
        label: 'Developer Access'
      };
    }

    const user = this.currentUser;
    if (!user) {
      return { isDeveloper: false, isTrial: false, isExpired: false, daysRemaining: 0, label: 'Guest' };
    }

    if (user.plan === 'plan_1year_pro' || user.plan === 'plan_1year' || user.plan === 'plan_3month' || user.plan === 'pro' || user.plan === 'ultra') {
      const labels = {
        plan_3month: 'Nexus 3-Month Plan (₹199)',
        plan_1year: 'Nexus 1-Year Standard (₹399)',
        plan_1year_pro: 'Nexus 1-Year Pro Unlimited (₹699)',
        pro: 'Nexus 1-Year Pro Unlimited (₹699)',
        ultra: 'Nexus 1-Year Pro Unlimited (₹699)'
      };
      return {
        isDeveloper: false,
        isTrial: false,
        isExpired: false,
        daysRemaining: null,
        label: labels[user.plan] || 'Active Paid Subscription'
      };
    }

    // 3-Month Trial Calculation (90 Days)
    const started = user.trialStartedAt || (Date.now() - 24 * 60 * 60 * 1000);
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - started;
    const remainingDays = Math.max(0, Math.ceil((ninetyDaysMs - elapsed) / (24 * 60 * 60 * 1000)));
    const isExpired = remainingDays <= 0;

    return {
      isDeveloper: false,
      isTrial: true,
      isExpired: isExpired,
      daysRemaining: remainingDays,
      label: isExpired ? '⚠️ 3-Month Free Trial Expired' : `🎁 3-Month Free Trial (${remainingDays} Days Left)`
    };
  }

  isDeveloper() {
    return Boolean(this.currentUser && this.currentUser.role === 'developer' && this.currentUser.isDeveloper === true);
  }

  getUserPlan() {
    if (this.currentUser) return this.currentUser.plan || 'standard';
    return this.settings.userPlan || 'standard';
  }

  activateDeveloperMode() {
    return this.upgradePlan('ultimate');
  }

  createChat(title = "New Chat", mode = "general", projectId = null) {
    const id = 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newChat = {
      id,
      title,
      mode,
      projectId,
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      files: []
    };
    this.chats.unshift(newChat);
    this.activeChatId = id;
    localStorage.setItem(this.ACTIVE_CHAT_KEY, id);
    this.saveChats();
    return newChat;
  }

  getChat(id) {
    return this.chats.find(c => c.id === id) || null;
  }

  getActiveChat() {
    return this.getChat(this.activeChatId);
  }

  setActiveChat(id) {
    if (this.getChat(id)) {
      this.activeChatId = id;
      localStorage.setItem(this.ACTIVE_CHAT_KEY, id);
      return true;
    }
    return false;
  }

  addMessage(chatId, message) {
    const chat = this.getChat(chatId);
    if (!chat) return null;

    const fullMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...message
    };

    chat.messages.push(fullMsg);
    chat.updatedAt = Date.now();

    // Auto-generate title from first user prompt if still default
    if (message.sender === 'user' && (chat.title === 'New Chat' || chat.title.startsWith('Chat #'))) {
      chat.title = this.generateSmartTitle(message.text);
    }

    this.saveChats();
    return fullMsg;
  }

  generateSmartTitle(text) {
    if (!text) return "Conversation";
    let clean = text.replace(/^(explain|write|create|build|how to|can you|help me with|analyze)\s+/i, '').trim();
    if (!clean) clean = text.trim();
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    const words = clean.split(/\s+/).slice(0, 5).join(' ');
    return words.length > 38 ? words.substring(0, 35) + '...' : words;
  }

  updateChatTitle(chatId, newTitle) {
    const chat = this.getChat(chatId);
    if (chat && newTitle.trim()) {
      chat.title = newTitle.trim();
      chat.updatedAt = Date.now();
      this.saveChats();
      return true;
    }
    return false;
  }

  togglePinChat(chatId) {
    const chat = this.getChat(chatId);
    if (chat) {
      chat.pinned = !chat.pinned;
      this.saveChats();
      return chat.pinned;
    }
    return false;
  }

  deleteChat(chatId) {
    const idx = this.chats.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      this.chats.splice(idx, 1);
      if (this.activeChatId === chatId) {
        if (this.chats.length > 0) {
          this.activeChatId = this.chats[0].id;
        } else {
          const fresh = this.createChat("New Chat");
          this.activeChatId = fresh.id;
        }
        localStorage.setItem(this.ACTIVE_CHAT_KEY, this.activeChatId);
      }
      this.saveChats();
      return true;
    }
    return false;
  }

  clearAllChats() {
    this.chats = [];
    const fresh = this.createChat("New Chat");
    this.activeChatId = fresh.id;
    this.saveChats();
    return fresh;
  }

  getGroupedChats(query = '') {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    let filtered = this.chats;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.messages.some(m => m.text && m.text.toLowerCase().includes(q))
      );
    }

    const pinned = [];
    const today = [];
    const yesterday = [];
    const previous7Days = [];
    const older = [];

    filtered.forEach(chat => {
      if (chat.pinned) {
        pinned.push(chat);
        return;
      }
      const age = now - chat.updatedAt;
      if (age < oneDay) {
        today.push(chat);
      } else if (age < 2 * oneDay) {
        yesterday.push(chat);
      } else if (age < sevenDays) {
        previous7Days.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { pinned, today, yesterday, previous7Days, older };
  }

  // Memory operations
  addMemoryFact(text) {
    if (!text || !text.trim()) return null;
    const fact = {
      id: 'mem_' + Date.now(),
      text: text.trim(),
      created: Date.now()
    };
    this.memory.facts.push(fact);
    this.saveMemory();
    return fact;
  }

  deleteMemoryFact(factId) {
    this.memory.facts = this.memory.facts.filter(f => f.id !== factId);
    this.saveMemory();
  }

  toggleMemoryEnabled(enabled) {
    this.memory.enabled = enabled;
    this.saveMemory();
  }

  clearAllMemory() {
    this.memory.facts = [];
    this.saveMemory();
  }

  exportChatAsMarkdown(chatId) {
    const chat = this.getChat(chatId);
    if (!chat) return "";

    let md = `# ${chat.title}\n`;
    md += `*Exported from OM AI Assistant (${new Date().toLocaleString()})*\n`;
    md += `*Tagline: Think. Plan. Act. Achieve.*\n\n---\n\n`;

    chat.messages.forEach(m => {
      const role = m.sender === 'user' ? '👤 User' : '🤖 OM Assistant';
      md += `### ${role} (${m.timestamp})\n\n${m.text}\n\n`;
      if (m.actions && m.actions.length > 0) {
        md += `#### Tasks & Action Items:\n`;
        m.actions.forEach(a => {
          md += `- [ ] [${a.stage ? a.stage.toUpperCase() : 'ACT'}] ${a.title} (${a.estimate || '1d'})\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    return md;
  }

  // =========================================================================
  // Errors & Diagnostics Center (Section 14)
  // =========================================================================
  getErrors() {
    try {
      const data = localStorage.getItem('om_error_logs_v1');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [
      {
        id: 'err_init_1',
        message: 'GitHub Remote Permission: Token missing or read-only scope for repository sync.',
        type: 'Authentication error',
        feature: 'GitHub Integration',
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
        taskId: 'task_gh_sync_01',
        possibleCause: 'GITHUB_TOKEN environment variable not configured or expired personal access token.',
        fixStatus: 'Requires Configuration',
        category: 'auth'
      },
      {
        id: 'err_init_2',
        message: 'Vercel Deployment Preview: No deployment target specified for project root.',
        type: 'Configuration error',
        feature: 'Vercel Deployment',
        timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString(),
        taskId: 'task_vcl_deploy_02',
        possibleCause: 'vercel.json root directory mismatch or missing project link.',
        fixStatus: 'Requires Configuration',
        category: 'config'
      }
    ];
  }

  saveErrors(errors) {
    try {
      localStorage.setItem('om_error_logs_v1', JSON.stringify(errors));
    } catch (e) {}
  }

  logError(errorObj) {
    const errors = this.getErrors();
    const entry = {
      id: 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      message: errorObj.message || 'Unknown runtime error occurred',
      type: errorObj.type || 'Frontend error',
      feature: errorObj.feature || 'General Assistant',
      timestamp: new Date().toLocaleString(),
      taskId: errorObj.taskId || 'task_' + Math.random().toString(36).substring(2, 7),
      possibleCause: errorObj.possibleCause || 'Unexpected exception or network timeout',
      fixStatus: errorObj.fixStatus || 'Unresolved',
      category: errorObj.category || 'frontend'
    };
    errors.unshift(entry);
    if (errors.length > 50) errors.pop();
    this.saveErrors(errors);
    return entry;
  }

  clearErrors() {
    this.saveErrors([]);
  }

  deleteError(id) {
    const errors = this.getErrors().filter(e => e.id !== id);
    this.saveErrors(errors);
    return errors;
  }

  // =========================================================================
  // API Key Management (Section 13)
  // =========================================================================
  getAPIKeys() {
    try {
      const data = localStorage.getItem('om_api_keys_v1');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      OPENAI_API_KEY: '',
      GEMINI_API_KEY: '',
      GITHUB_TOKEN: '',
      VERCEL_TOKEN: ''
    };
  }

  saveAPIKey(provider, key) {
    const keys = this.getAPIKeys();
    keys[provider] = key ? key.trim() : '';
    try {
      localStorage.setItem('om_api_keys_v1', JSON.stringify(keys));
    } catch (e) {}
    return keys;
  }

  getMaskedKey(provider) {
    const keys = this.getAPIKeys();
    const val = keys[provider];
    if (!val) return 'Not Configured';
    if (val.length <= 8) return '••••••••';
    return val.substring(0, 4) + '••••••••' + val.substring(val.length - 4);
  }

  hasKey(provider) {
    const keys = this.getAPIKeys();
    return !!(keys[provider] && keys[provider].trim().length > 0);
  }

  // =========================================================================
  // GitHub & Vercel Integration Config (Sections 11 & 12)
  // =========================================================================
  getGitHubConfig() {
    try {
      const data = localStorage.getItem('om_github_config_v1');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      connected: false,
      username: 'abhishekCode7266',
      repository: 'OM-AI-Action-Assistant',
      branch: 'main',
      lastCommit: '440f6b6',
      lastSynced: new Date().toLocaleDateString()
    };
  }

  saveGitHubConfig(cfg) {
    try {
      localStorage.setItem('om_github_config_v1', JSON.stringify(cfg));
    } catch (e) {}
  }

  getVercelConfig() {
    try {
      const data = localStorage.getItem('om_vercel_config_v1');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      connected: true,
      projectName: 'om-ai-action-assistant',
      environment: 'Production',
      productionUrl: 'https://om-7s6lf1bi4-abhishek-ef1f.vercel.app',
      status: 'Ready',
      lastDeployed: new Date().toLocaleDateString()
    };
  }

  saveVercelConfig(cfg) {
    try {
      localStorage.setItem('om_vercel_config_v1', JSON.stringify(cfg));
    } catch (e) {}
  }

  // =========================================================================
  // File Hub Persistence (Section 10)
  // =========================================================================
  getStoredFiles() {
    try {
      const data = localStorage.getItem('om_files_v1');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [
      {
        id: 'file_starter_1',
        name: 'flutter_architecture_spec.md',
        size: 14200,
        type: 'text/markdown',
        extension: 'md',
        uploadedAt: Date.now() - 86400000,
        summary: 'Architecture specification for Flutter cross-platform applications with state management and clean architecture.'
      },
      {
        id: 'file_starter_2',
        name: 'dataset_analytics_sample.csv',
        size: 28400,
        type: 'text/csv',
        extension: 'csv',
        uploadedAt: Date.now() - 43200000,
        summary: 'Sample tabular dataset containing customer engagement metrics, conversion rates, and time-series indicators.'
      }
    ];
  }

  saveStoredFiles(files) {
    try {
      localStorage.setItem('om_files_v1', JSON.stringify(files));
    } catch (e) {}
  }

  addStoredFile(fileMeta) {
    const files = this.getStoredFiles();
    files.unshift(fileMeta);
    this.saveStoredFiles(files);
    return fileMeta;
  }

  deleteStoredFile(id) {
    const files = this.getStoredFiles().filter(f => f.id !== id);
    this.saveStoredFiles(files);
    return files;
  }

  /* =========================================================================
     Smart Home & IoT Device State (Section 15)
     ========================================================================= */
  getSmartHomeState() {
    try {
      const saved = localStorage.getItem('om_smarthome_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      livingRoomLight: { on: true, brightness: 85, color: '#06b6d4', name: 'Living Room Studio Light' },
      deskLamp: { on: true, brightness: 100, color: '#f59e0b', name: 'Workstation Lamp' },
      thermostat: { temp: 22, mode: 'cool', target: 22, unit: '°C' },
      smartLock: { locked: true, status: 'Armed & Secured' },
      speaker: { playing: false, volume: 70, track: 'Cyberpunk Ambient Synth' },
      activeScene: 'Coding Sprint'
    };
  }

  saveSmartHomeState(state) {
    localStorage.setItem('om_smarthome_state', JSON.stringify(state));
  }

  /* =========================================================================
     Gems State
     ========================================================================= */
  getActiveGem() {
    return localStorage.getItem('om_active_gem') || 'default';
  }

  setActiveGem(gemId) {
    localStorage.setItem('om_active_gem', gemId);
  }

  // =========================================================================
  // Updates & Changelog (Section 16)
  // =========================================================================
  getChangelog() {
    return [
      {
        version: 'v2.6.0',
        date: 'September 2026',
        title: 'Gemini Live Mode & Universal Workspace Integration',
        badge: 'Latest Release',
        features: [
          'Full Gemini Live Mode with real-time voice-to-voice communication and seamless voice/text switching.',
          'Continuous Context Chat History Overlay directly inside the Live Mode HUD and Viewport.',
          'Live Camera Vision and WebRTC Screen Sharing frame analysis and contextual assistance.',
          'Comprehensive Workspace Suite: Interactive Drafting Notebook, Spark Workflow Automation, 3D CAD Studio, and Coding Sandbox.',
          'Advanced Interface: 6 Flagship Gems (Coding, Writing, Research, Spark, Math, Polyglot) plus Custom Gem Creator.',
          'Real-World Capabilities: Multi-Language Translation Studio (20+ langs), Real-Time Web Search, Smart Home IoT Device Matrix, and Synthesized Media Player.'
        ]
      },
      {
        version: 'v2.5.0',
        date: 'September 2026',
        title: 'Full Conversational AI Agent, Task Engine & Real Multi-Tool Suite',
        badge: 'Major Upgrade',
        features: [
          'Goal & Task Engine with automated subtasks breakdown and live progress cards (Think-Plan-Act-Achieve).',
          'Complete Coding Assistant supporting Flutter/Dart, Python, JavaScript, HTML/CSS live preview, SQL, and React.',
          'Natural human-language conversation in English, Hindi, Hinglish, and mixed queries.',
          'Universal Voice Assistant with STT, TTS, dual male/female personas, and voice commands routed to the task engine.',
          'Dedicated File Hub (PDF, CSV, JSON, TXT, Code, Images) with preview, question answering, and summaries.',
          'Dedicated Error & Bug Center with 8 diagnostic categories, retry triggers, and detailed causes.',
          'API Key Management for OpenAI, Gemini, GitHub, and Vercel with zero hardcoding in frontend.',
          'Full Left Sidebar Suite with 11 core interactive tools: New Chat, Search, History, Projects, Files, Coding, Tasks, Voice, Settings, Help, Developer Tools.'
        ]
      },
      {
        version: 'v2.4.0',
        date: 'September 2026',
        title: 'Google Gemini Parity & Real AI Diffusion Studio',
        badge: 'Production',
        features: [
          'High-resolution generative AI image studio powered by Pollinations FLUX diffusion core.',
          'Gemini-style Home screen with suggestion pills and Flash-Lite model selector capsule.',
          'Interactive message toolbar (thumbs up/down, retry, copy, voice playback, more options).',
          'Fixed GitHub Pages serverless routing to live Vercel backend with resilient fallback.'
        ]
      },
      {
        version: 'v2.0.0',
        date: 'September 2026',
        title: 'Nexus Autonomous Multi-Agent Core Release',
        badge: 'Core Engine',
        features: [
          '3D Exploded-view CAD deconstructor for robotics, turbines, and vehicles.',
          'Interactive CRT phosphor Cyber Terminal simulator.',
          'Holographic Neural Thought Canvas dynamic DAG mind map.'
        ]
      }
    ];
  }
}

// Global instance
window.omChatStore = new OMChatStore();

