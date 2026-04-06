const STORAGE_KEY = 'chatfree_conversations';
const SETTINGS_KEY = 'chatfree_settings';

export function loadConversations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

export function saveConversation(conversation) {
  try {
    const conversations = loadConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

export function deleteConversation(conversationId) {
  try {
    const conversations = loadConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
}

export function loadConversationDetails(conversationId) {
  try {
    const conversations = loadConversations();
    return conversations.find(c => c.id === conversationId) || null;
  } catch (error) {
    console.error('Failed to load conversation details:', error);
    return null;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {};
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

export function exportConversations() {
  try {
    const conversations = loadConversations();
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chatfree-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('Failed to export conversations:', error);
  }
}

export function importConversations(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conversations = JSON.parse(e.target.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
        resolve(conversations);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
