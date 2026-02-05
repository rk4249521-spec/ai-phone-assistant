import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsListening(true);
    Speech.speak("Listening...", { language: 'en' });
    
    setTimeout(() => {
      setIsListening(false);
      setUserInput("Try: 'Set alarm for 7 AM' or 'Call John' or 'Open camera'");
    }, 3000);
  };

  const processCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newMessages = [...messages, { role: 'user', content: command }];
    setMessages(newMessages);
    setUserInput('');

    let response = '';
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('alarm') || lowerCommand.includes('wake')) {
      response = "✅ Alarm set successfully! I'll wake you up at the specified time.";
      Speech.speak("Alarm set successfully");
    } else if (lowerCommand.includes('call')) {
      const contact = lowerCommand.replace('call', '').trim();
      response = `📞 Calling ${contact}... Opening dialer now.`;
      Speech.speak(`Calling ${contact}`);
    } else if (lowerCommand.includes('message') || lowerCommand.includes('sms')) {
      response = "💬 Opening messages app to send your text.";
      Speech.speak("Opening messages");
    } else if (lowerCommand.includes('open')) {
      const app = lowerCommand.replace('open', '').trim();
      response = `📱 Opening ${app} app...`;
      Speech.speak(`Opening ${app}`);
    } else if (lowerCommand.includes('weather')) {
      response = "🌤️ Current weather: 25°C, Partly Cloudy. (Connect weather API for live data)";
      Speech.speak("The weather is 25 degrees and partly cloudy");
    } else if (lowerCommand.includes('joke')) {
      response = "😄 Why don't scientists trust atoms? Because they make up everything!";
      Speech.speak(response);
    } else if (lowerCommand.includes('time')) {
      const now = new Date();
      response = `🕐 Current time is ${now.toLocaleTimeString()}`;
      Speech.speak(`The time is ${now.toLocaleTimeString()}`);
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      response = "👋 Hello! I'm your AI assistant. How can I help you?";
      Speech.speak("Hello! How can I help you?");
    } else {
      response = `I understand you said: "${command}". Try: "Set alarm", "Call Mom", "Weather", "Tell me a joke"`;
      Speech.speak("I'm learning to handle more commands");
    }

    setTimeout(() => {
      setMessages([...newMessages, { role: 'assistant', content: response }]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Assistant</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="mic-outline" size={80} color="#007AFF" />
            <Text style={styles.emptyText}>Tap mic to start</Text>
            <Text style={styles.emptySubtext}>Try: "Set alarm" or "Call Mom"</Text>
          </View>
        ) : (
          messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
            </View>
          ))
        )}
        {isProcessing && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator color="#007AFF" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type command..."
          placeholderTextColor="#666"
          value={userInput}
          onChangeText={setUserInput}
          onSubmitEditing={() => processCommand(userInput)}
        />
        
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={startListening}
        >
          <Ionicons name={isListening ? "mic" : "mic-outline"} size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => processCommand(userInput)}
        >
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  messagesContainer: { flex: 1, padding: 15 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#fff', fontSize: 18, marginTop: 20 },
  emptySubtext: { color: '#666', fontSize: 14, marginTop: 10 },
  messageBubble: { padding: 15, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#1c1c1c' },
  messageText: { color: '#fff', fontSize: 16 },
  loadingBubble: { alignSelf: 'flex-start', backgroundColor: '#1c1c1c', padding: 15, borderRadius: 20 },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#1a1a1a', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#2a2a2a', borderRadius: 25, paddingHorizontal: 18, paddingVertical: 12, color: '#fff', fontSize: 15 },
  micButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  micButtonActive: { backgroundColor: '#FF3B30' },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});
