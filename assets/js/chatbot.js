/**
 * AI Chatbot Widget (TeknoCANE Benzeri)
 * Floating button + popup chat
 */

class ChatbotWidget {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.apiUrl = 'http://localhost:3001/api/v1/chatbot';
    this.init();
  }

  init() {
    this.createWidget();
    this.loadSuggestions();
  }

  createWidget() {
    // Chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chatbot-widget';
    chatContainer.className = 'chatbot-widget';
    chatContainer.innerHTML = `
      <div class="chatbot-popup" id="chatbot-popup" style="display: none;">
        <div class="chatbot-header">
          <div class="chatbot-header-left">
            <div class="chatbot-avatar">🤖</div>
            <div>
              <div class="chatbot-title">İşBul Asistan</div>
              <div class="chatbot-status">Çevrimiçi</div>
            </div>
          </div>
          <button class="chatbot-close" id="chatbot-close">✕</button>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="chatbot-message bot">
            <div class="chatbot-message-avatar">🤖</div>
            <div class="chatbot-message-content">
              <div class="chatbot-message-text">Merhaba! 👋 İşBul asistanıyım. Size nasıl yardımcı olabilirim?</div>
            </div>
          </div>
          <div class="chatbot-suggestions" id="chatbot-suggestions"></div>
        </div>
        
        <div class="chatbot-input-container">
          <input 
            type="text" 
            class="chatbot-input" 
            id="chatbot-input" 
            placeholder="Mesajınızı yazın..."
            autocomplete="off"
          />
          <button class="chatbot-send" id="chatbot-send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      
      <button class="chatbot-button" id="chatbot-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chatbot-badge" id="chatbot-badge">AI</span>
      </button>
    `;
    
    document.body.appendChild(chatContainer);

    // Event listeners
    document.getElementById('chatbot-button').addEventListener('click', () => this.toggle());
    document.getElementById('chatbot-close').addEventListener('click', () => this.close());
    document.getElementById('chatbot-send').addEventListener('click', () => this.sendMessage());
    document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const popup = document.getElementById('chatbot-popup');
    popup.style.display = this.isOpen ? 'flex' : 'none';
    
    if (this.isOpen) {
      document.getElementById('chatbot-input').focus();
    }
  }

  close() {
    this.isOpen = false;
    document.getElementById('chatbot-popup').style.display = 'none';
  }

  async loadSuggestions() {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.apiUrl}/suggestions`, { headers });
      const data = await response.json();

      if (data.success && data.data.suggestions) {
        this.renderSuggestions(data.data.suggestions);
      }
    } catch (err) {
      console.error('[Chatbot] Öneriler yüklenemedi:', err);
    }
  }

  renderSuggestions(suggestions) {
    const container = document.getElementById('chatbot-suggestions');
    container.innerHTML = suggestions.map(s => 
      `<button class="chatbot-suggestion" onclick="chatbot.sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
    ).join('');
  }

  sendSuggestion(text) {
    document.getElementById('chatbot-input').value = text;
    this.sendMessage();
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;

    input.value = '';
    input.disabled = true;

    // Kullanıcı mesajını göster
    this.addMessage(message, 'user');

    // Bot "yazıyor..." göster
    this.addTypingIndicator();

    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory,
        }),
      });

      const data = await response.json();

      this.removeTypingIndicator();

      if (data.success && data.data.reply) {
        this.addMessage(data.data.reply, 'bot');
        
        // Konuşma geçmişini güncelle (son 10 mesaj)
        this.conversationHistory.push({ role: 'user', content: message });
        this.conversationHistory.push({ role: 'assistant', content: data.data.reply });
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
      } else {
        this.addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'bot');
      }
    } catch (err) {
      console.error('[Chatbot] Hata:', err);
      this.removeTypingIndicator();
      this.addMessage('Bağlantı hatası. Lütfen tekrar deneyin.', 'bot');
    } finally {
      input.disabled = false;
      input.focus();
    }
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    
    if (sender === 'bot') {
      messageDiv.innerHTML = `
        <div class="chatbot-message-avatar">🤖</div>
        <div class="chatbot-message-content">
          <div class="chatbot-message-text">${this.escapeHtml(text)}</div>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="chatbot-message-content">
          <div class="chatbot-message-text">${this.escapeHtml(text)}</div>
        </div>
      `;
    }

    // Önerilerin üstüne ekle
    const suggestions = document.getElementById('chatbot-suggestions');
    messagesContainer.insertBefore(messageDiv, suggestions);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot';
    typingDiv.id = 'chatbot-typing';
    typingDiv.innerHTML = `
      <div class="chatbot-message-avatar">🤖</div>
      <div class="chatbot-message-content">
        <div class="chatbot-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    
    const suggestions = document.getElementById('chatbot-suggestions');
    messagesContainer.insertBefore(typingDiv, suggestions);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const typing = document.getElementById('chatbot-typing');
    if (typing) typing.remove();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }
}

// Global instance
let chatbot;
document.addEventListener('DOMContentLoaded', () => {
  chatbot = new ChatbotWidget();
});
