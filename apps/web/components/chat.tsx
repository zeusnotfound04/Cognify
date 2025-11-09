"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Send, FileText, Code, MapPin, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type VisibilityType = 'private' | 'public' | 'unlisted';

export interface SimpleChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function Chat({
  id,
  initialMessages = [],
  initialChatModel = "gemini-pro",
  initialVisibilityType = "private",
  isReadonly = false,
  autoResume = false,
  initialLastContext,
}: {
  id?: string;
  initialMessages?: SimpleChatMessage[];
  initialChatModel?: string;
  initialVisibilityType?: VisibilityType;
  isReadonly?: boolean;
  autoResume?: boolean;
  initialLastContext?: any;
}) {
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [messages, setMessages] = useState<SimpleChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const searchParams = useSearchParams();

  const suggestedPrompts = [
    "What are the advantages of using Next.js?",
    "Write code to demonstrate Dijkstra's algorithm", 
    "Help me write an essay about Silicon Valley",
    "What is the weather in San Francisco?"
  ];

  const handleSendMessage = (content?: string) => {
    const messageContent = content || input.trim();
    if (!messageContent) return;
    
    const newMessage: SimpleChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response with typing indicator
    setTimeout(() => {
      const aiResponse: SimpleChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a simulated AI response. Your actual AI integration would go here.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <>
      <div className="h-full w-full bg-[#1a1a1a] text-white flex flex-col font-sans">
        {/* Chat Messages */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
          {messages.length === 0 ? (
            <motion.div 
              className="w-full max-w-3xl mx-auto text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Welcome Message */}
              <motion.div 
                className="mb-16" 
                variants={itemVariants}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.h1 
                  className="text-5xl font-bold mb-4 text-white font-heading tracking-tight"
                  variants={itemVariants}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  Hello there!
                </motion.h1>
                <motion.p 
                  className="text-xl text-gray-400 font-sans font-medium tracking-wide"
                  variants={itemVariants}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  How can I help you today?
                </motion.p>
              </motion.div>
              
              {/* Suggested Prompts */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16"
                variants={containerVariants}
              >
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="p-4 text-left bg-[#2a2a2a] hover:bg-[#333333] rounded-lg border border-[#333333] hover:border-[#444444] transition-all duration-200 text-white font-sans font-medium tracking-wide"
                    variants={itemVariants}
                    transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "#333333",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <div className="w-full max-w-4xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    layout
                  >
                    <motion.div 
                      className={`max-w-[80%] ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-2xl rounded-br-md' 
                          : 'bg-[#2a2a2a] text-gray-100 rounded-2xl rounded-bl-md border border-[#333333]'
                      } p-4 font-sans`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed font-medium tracking-wide">{message.content}</p>
                      <div className="text-xs opacity-60 mt-2 font-mono tracking-wider">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-[#2a2a2a] text-gray-100 rounded-2xl rounded-bl-md border border-[#333333] p-4">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input Form */}
        {!isReadonly && (
          <motion.div 
            className="w-full px-6 pb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-full max-w-3xl mx-auto">
              <form onSubmit={handleFormSubmit} className="relative">
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Send a message..."
                    className="w-full bg-[#2a2a2a] text-white placeholder-gray-400 border border-[#333333] rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-sans font-medium tracking-wide"
                  />
                  <motion.button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white disabled:text-gray-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        )}
      </div>

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent className="bg-[#2a2a2a] border-[#333333]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-bold">Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 font-medium">
              This application requires activation of AI Gateway for enhanced features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333333] text-white hover:bg-[#444444] font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCreditCardAlert(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 font-medium"
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
