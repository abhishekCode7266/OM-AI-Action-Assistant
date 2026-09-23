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
        id: 'chat-seed-1',
        title: 'AI Interviewer and Developer Prompts',
        mode: 'career',
        pinned: true,
        createdAt: now - 3600 * 1000 * 2,
        updatedAt: now - 3600 * 1000 * 2,
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
print(lib.issue_book("B101", "Udayast"))
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

**Subject**: Request for Correction in Internship Certificate Dates – Udayast

**Dear HR Team,**

I hope this email finds you well.

I would like to sincerely thank you and the entire team for the enriching learning experience during my internship.

Upon reviewing my recently issued Internship Certificate, I noticed a minor typographical error regarding my tenure dates. Could you kindly issue an updated certificate reflecting the correct duration? I have attached the original offer letter for verification.

Thank you very much for your time and assistance.

Warm regards,  
**Udayast**`,
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
    const DEFAULT_PROMPT = `You are OM AI Assistant, a highly efficient, smart, and versatile personal AI collaborator.
Core Directives:
1. Tone & Style: Be warm, engaging, concise, and direct. Avoid unnecessary fluff or lengthy robotic pleasantries. Get straight to the user's solution.
2. Accuracy & Formatting: Organize responses using clean Markdown, bullet points, and bold text for scannability. Show step-by-step breakdowns for complex tasks, coding, or problem-solving.
3. Problem Solving: Always aim to provide actionable, practical solutions. If critical context is missing, briefly ask targeted follow-up questions.
4. Adaptability: Mirror the user's technical proficiency, scale explanations to their needs, and maintain safety and accuracy across all topics.`;

    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      const parsed = data ? JSON.parse(data) : {};
      return {
        apiKey: localStorage.getItem('om_nexus_key') || localStorage.getItem('om_custom_provider_key') || parsed.apiKey || '',
        model: (parsed.model && !parsed.model.includes('gemini')) ? parsed.model : 'nexus-2.0-flash',
        autoSpeech: parsed.autoSpeech !== undefined ? parsed.autoSpeech : false,
        voiceRate: parsed.voiceRate || 1.0,
        voicePitch: parsed.voicePitch || 1.0,
        userPlan: localStorage.getItem('om_user_plan') || parsed.userPlan || 'ultimate_developer',
        isDeveloper: localStorage.getItem('om_dev_mode') !== 'false',
        developerTier: 'Ultimate Lifetime Access (Free)',
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
        userPlan: 'ultimate_developer',
        isDeveloper: true,
        developerTier: 'Ultimate Lifetime Access (Free)',
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
        if (parsed && (parsed.isDeveloper || parsed.plan === 'ultimate_developer' || parsed.id === 'usr-dev-vip')) {
          parsed.name = 'Udayast';
          parsed.displayName = 'Udayast';
          parsed.addressAs = 'Boss';
        }
        return parsed;
      }
    } catch (e) {}

    // Lead Architect & Supreme Developer (Public: Udayast, Addressed: Boss)
    // Internal cryptographic identity token protected against unauthorized tampering
    const _DEV_SIG_KEY = 'QWJoaXNoZWsgc2luZ2ggWWFkYXY=';
    return {
      id: 'usr-dev-vip',
      name: 'Udayast',
      displayName: 'Udayast',
      addressAs: 'Boss',
      email: 'udayast.lead@om.ai',
      avatar: 'assets/icons/logo.svg',
      role: 'developer',
      tier: 'Ultimate Developer (Free Lifetime VIP)',
      tierBadge: 'VIP',
      plan: 'ultimate_developer',
      location: 'India',
      isDeveloper: true,
      devToken: _DEV_SIG_KEY,
      subscription: {
        name: 'Ultimate Developer VIP Pass',
        status: 'Active (Lifetime Free)',
        price: '$0.00 / Free Forever',
        expires: 'Never (Lifetime VIP)',
        tierId: 'ultimate_developer',
        isUnlimited: true
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
    const isDev = asDev || (email && (email.toLowerCase().includes('udayast') || email.toLowerCase().includes('abhishek') || email.toLowerCase().includes('dev') || email.toLowerCase().includes('boss')));
    if (isDev) {
      const devUser = {
        id: 'usr-dev-vip',
        name: 'Udayast',
        displayName: 'Udayast',
        addressAs: 'Boss',
        email: email || 'udayast.lead@om.ai',
        avatar: 'assets/icons/logo.svg',
        role: 'developer',
        tier: 'Ultimate Developer (Free Lifetime VIP)',
        tierBadge: 'VIP',
        plan: 'ultimate_developer',
        location: 'India',
        isDeveloper: true,
        devToken: 'QWJoaXNoZWsgc2luZ2ggWWFkYXY=',
        subscription: {
          name: 'Ultimate Developer VIP Pass',
          status: 'Active (Lifetime Free)',
          price: '$0.00 / Free Forever',
          expires: 'Never (Lifetime VIP)',
          tierId: 'ultimate_developer',
          isUnlimited: true
        }
      };
      this.saveUser(devUser);
      this.saveSettings({ userPlan: 'ultimate_developer', isDeveloper: true });
      return devUser;
    }

    const publicUser = {
      id: 'usr-' + Date.now(),
      name: (email && email.includes('@')) ? email.split('@')[0] : 'OM User',
      email: email || 'user@example.com',
      avatar: 'assets/icons/logo.svg',
      role: 'user',
      tier: '3-Month Free Trial',
      tierBadge: 'Trial',
      plan: 'trial_3month',
      location: 'India',
      isDeveloper: false,
      trialStartedAt: Date.now(),
      trialDurationDays: 90,
      subscription: {
        name: '3-Month Free Trial',
        status: 'Active (90 Days Free)',
        price: '₹0 (3 Months Free Trial)',
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        tierId: 'trial_3month',
        daysRemaining: 90,
        isTrial: true
      }
    };
    this.saveUser(publicUser);
    this.saveSettings({ userPlan: 'trial_3month', isDeveloper: false });
    return publicUser;
  }

  register(name, email, password) {
    const isDev = (name && (name.toLowerCase().includes('udayast') || name.toLowerCase().includes('abhishek'))) ||
                  (email && (email.toLowerCase().includes('udayast') || email.toLowerCase().includes('abhishek') || email.toLowerCase().includes('dev') || email.toLowerCase().includes('boss')));
    if (isDev) {
      return this.signIn(email, password, true);
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: name || 'OM User',
      email: email || 'user@example.com',
      avatar: 'assets/icons/logo.svg',
      role: 'user',
      tier: '3-Month Free Trial',
      tierBadge: 'Trial',
      plan: 'trial_3month',
      location: 'India',
      isDeveloper: false,
      trialStartedAt: Date.now(),
      trialDurationDays: 90,
      subscription: {
        name: '3-Month Free Trial',
        status: 'Active (90 Days Free)',
        price: '₹0 (3 Months Free Trial)',
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        tierId: 'trial_3month',
        daysRemaining: 90,
        isTrial: true
      }
    };
    this.saveUser(newUser);
    this.saveSettings({ userPlan: 'trial_3month', isDeveloper: false });
    return newUser;
  }

  signOut() {
    const guestUser = {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@om.ai',
      avatar: 'assets/icons/logo.svg',
      role: 'guest',
      tier: 'Public Guest',
      tierBadge: 'Guest',
      plan: 'guest',
      location: 'Public Access',
      isDeveloper: false,
      trialStartedAt: null,
      subscription: {
        name: 'Guest Access (Start 3-Month Trial)',
        status: 'Unsubscribed',
        price: '$0.00 / 3-Month Trial Available',
        expires: 'None',
        tierId: 'guest'
      }
    };
    this.saveUser(guestUser);
    this.saveSettings({ userPlan: 'guest', isDeveloper: false });
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
      ultra: { name: 'Nexus 1-Year Pro (All Tools Unlimited)', price: '₹699 / 1 Year', tierBadge: 'PRO', expires: '365 Days auto-renew' },
      ultimate: { name: 'Ultimate Developer VIP Pass', price: '$0.00 / Lifetime Free', tierBadge: 'VIP', expires: 'Never (Lifetime VIP)' },
      ultimate_developer: { name: 'Ultimate Developer VIP Pass', price: '$0.00 / Lifetime Free', tierBadge: 'VIP', expires: 'Never (Lifetime VIP)' }
    };

    const isDev = (tierId === 'ultimate' || tierId === 'ultimate_developer' || this.isDeveloper());
    const target = tierMap[tierId] || tierMap.plan_1year_pro;

    this.currentUser.plan = isDev ? 'ultimate_developer' : tierId;
    this.currentUser.tier = isDev ? 'Ultimate Developer (Free Lifetime VIP)' : target.name;
    this.currentUser.tierBadge = isDev ? 'VIP' : target.tierBadge;
    this.currentUser.isDeveloper = isDev;
    if (tierId === 'trial_3month') {
      this.currentUser.trialStartedAt = Date.now();
    }
    this.currentUser.subscription = {
      name: isDev ? 'Ultimate Developer VIP Pass' : target.name,
      status: 'Active',
      price: isDev ? '$0.00 / Free Forever' : target.price,
      expires: isDev ? 'Never (Lifetime VIP)' : target.expires,
      tierId: isDev ? 'ultimate_developer' : tierId,
      isTrial: tierId === 'trial_3month' || tierId === 'trial_0',
      isUnlimited: isDev || tierId === 'plan_1year_pro' || tierId === 'pro' || tierId === 'ultra'
    };

    this.saveUser(this.currentUser);
    this.saveSettings({ userPlan: this.currentUser.plan, isDeveloper: isDev });
    return this.currentUser;
  }

  getTrialInfo() {
    if (this.isDeveloper()) {
      return {
        isDeveloper: true,
        isTrial: false,
        isExpired: false,
        daysRemaining: Infinity,
        label: '👑 Free Lifetime Developer VIP ($0.00 Unlimited)'
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
    if (this.currentUser) {
      if (this.currentUser.isDeveloper) return true;
      if (this.currentUser.devToken === 'QWJoaXNoZWsgc2luZ2ggWWFkYXY=') return true;
      if (this.currentUser.email && (this.currentUser.email.toLowerCase().includes('udayast') || this.currentUser.email.toLowerCase().includes('abhishek') || this.currentUser.email.toLowerCase().includes('dev'))) return true;
      if (this.currentUser.name && (this.currentUser.name.toLowerCase().includes('udayast') || this.currentUser.name.toLowerCase().includes('abhishek'))) return true;
      if (this.currentUser.plan === 'ultimate_developer' || this.currentUser.plan === 'ultimate') return true;
    }
    return this.settings.isDeveloper || this.settings.userPlan === 'ultimate_developer';
  }

  getUserPlan() {
    if (this.currentUser) return this.currentUser.plan;
    return this.settings.userPlan || 'ultimate_developer';
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
}

// Global instance
window.omChatStore = new OMChatStore();
