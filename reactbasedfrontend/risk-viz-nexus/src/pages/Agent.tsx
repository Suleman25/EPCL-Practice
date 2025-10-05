import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Trash2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { agentService } from '@/services/agentService'
import { workbookService } from '@/services/workbookService'
import { toast } from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: Array<{
    type: string
    content: string
    relevance_score: number
  }>
  suggestions?: string[]
}

const SUGGESTED_PROMPTS = [
  "What are the top safety risks in our facility?",
  "Show me incident trends for the last quarter",
  "How can we improve our safety training program?",
  "What are the most common types of near misses?",
  "Analyze the correlation between training and incidents",
  "What safety metrics should we track?"
]

export function Agent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [lastJson, setLastJson] = useState<any>(null)
  const [selectedSheet, setSelectedSheet] = useState<string | undefined>(undefined)
  const qc = useQueryClient()

  // Load conversation history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('safety-agent-chat')
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
  }, [])

  // Save conversation history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('safety-agent-chat', JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  const askMutation = useMutation({
    mutationFn: agentService.ask,
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: (response.data as any).answer || (response.data as any).response,
        timestamp: new Date().toISOString(),
        sources: (response.data as any).sources,
        suggestions: (response.data as any).suggestions
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: error.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
      toast.error('Failed to get response from AI agent')
    }
  })

  // Fetch workbook sheets and infer a default sheet
  const { data: sheetsPayload } = useQuery({
    queryKey: ['workbook-sheets'],
    queryFn: async () => (await workbookService.getSheets()).data,
    retry: false,
  })

  const defaultSheet = useMemo(() => {
    const names = (sheetsPayload?.sheets || []).map((s: any) => s.name)
    const lower = names.map((n: string) => n.toLowerCase())
    const findBy = (cands: string[]) => {
      for (const c of cands) {
        const exact = lower.findIndex((n: string) => n === c)
        if (exact !== -1) return names[exact]
      }
      for (const c of cands) {
        const idx = lower.findIndex((n: string) => n.includes(c))
        if (idx !== -1) return names[idx]
      }
      return undefined
    }
    return findBy(['incident','incidents']) || findBy(['hazard','hazards']) || names[0]
  }, [sheetsPayload])

  useEffect(() => {
    if (!selectedSheet && defaultSheet) setSelectedSheet(defaultSheet)
  }, [defaultSheet, selectedSheet])

  const handleSendMessage = async (content: string = inputMessage) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Use the new 3-step pipeline: translate -> execute -> explain
    const runOnce = async (retryOnNoWorkbook = true): Promise<void> => {
      if (!defaultSheet) {
        setIsTyping(false)
        toast.error('Please load a workbook first (Workbook page)')
        return
      }
      const sheet = selectedSheet || defaultSheet
      // 1) Translate
      const t = await agentService.translate({ question: content.trim(), sheet })
      const code = t.data.code || ''
      // 2) Execute
      try {
        const ex = await agentService.execute({ code, sheet, question: content.trim() })
        const resultData = ex.data.data
        const resultMeta = ex.data.meta
        setLastJson(resultData)
        // 3) Explain
        const exn = await agentService.explain({ question: content.trim(), data: resultData, meta: resultMeta })
        const expMsg: Message = {
          id: (Date.now()+1).toString(),
          role: 'assistant',
          content: exn.data.explanation,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, expMsg])
        setIsTyping(false)
      } catch (err: any) {
        const detail: string = err?.response?.data?.detail || ''
        // Auto-load example workbook and retry ONCE if not loaded
        if (retryOnNoWorkbook && /No workbook loaded/i.test(detail || '')) {
          try {
            await workbookService.loadExample()
            await qc.invalidateQueries({ queryKey: ['workbook-sheets'] })
            toast.success('Example workbook loaded, retrying...')
            await runOnce(false)
            return
          } catch {}
        }
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: detail || 'Agent pipeline error. Please try again.',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
        toast.error(detail || 'Agent failed')
      }
    }

    try {
      await runOnce(true)
    } catch (e) {
      setIsTyping(false)
      toast.error('Agent failed')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearConversation = () => {
    setMessages([])
    localStorage.removeItem('safety-agent-chat')
    toast.success('Conversation cleared')
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Message copied to clipboard')
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Safety AI Agent</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask questions about your safety data and get AI-powered insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Sheet selector */}
              <select
                className="border rounded px-2 py-1 text-sm"
                value={selectedSheet || ''}
                onChange={(e) => setSelectedSheet(e.target.value || undefined)}
              >
                <option value="" disabled>
                  {sheetsPayload?.sheets?.length ? 'Select sheet' : 'No workbook loaded'}
                </option>
                {(sheetsPayload?.sheets || []).map((s: any) => (
                  <option key={s.id || s.name} value={s.name}>{s.name}</option>
                ))}
              </select>

              {/* Load Example */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await workbookService.loadExample()
                    await qc.invalidateQueries({ queryKey: ['workbook-sheets'] })
                    toast.success('Example workbook loaded')
                  } catch (e) {
                    toast.error('Failed to load example')
                  }
                }}
              >
                Load Example
              </Button>

              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearConversation}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="space-y-2">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">Welcome to Safety AI Agent</h3>
                    <p className="text-muted-foreground">
                      I'm here to help you analyze your safety data and answer questions about incidents, hazards, and safety metrics.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {SUGGESTED_PROMPTS.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-left h-auto p-3 whitespace-normal"
                          onClick={() => handleSendMessage(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] space-y-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {source.type}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {(source.relevance_score * 100).toFixed(0)}% relevant
                                </span>
                              </div>
                              <p className="text-muted-foreground">{source.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Follow-up questions:</p>
                        <div className="space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="text-xs h-auto p-2 text-left justify-start whitespace-normal"
                              onClick={() => handleSendMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {message.role === 'assistant' && (
                        <>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your safety data..."
                disabled={isTyping}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}