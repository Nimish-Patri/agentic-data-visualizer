import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MessageSquare, BarChart3, Send, Loader2, RefreshCw } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! Ask me to visualize data from the S&P 500 dataset. For example: "Show me a line chart of the closing prices for CNC"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartConfig, setChartConfig] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error('Network response error');
      
      const data = await response.json();
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.chart_config && data.chart_config.data && data.chart_config.data.length > 0) {
        setChartConfig(data.chart_config);
      }
    } catch (error) {
      console.error("Error communicating with agent:", error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I ran into an error connecting to the backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* LEFT SIDEBAR: Chat Interface */}
      <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-900">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <MessageSquare className="text-blue-500" />
          <h1 className="font-bold text-lg">Agentic Visualizer</h1>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-3 rounded-lg flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="animate-spin h-4 w-4 text-blue-500" />
                Agent is analyzing dataset...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 flex gap-2 bg-slate-950">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a graph (e.g., 'Plot close price for AAP')..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-100"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* RIGHT PANEL: Dynamic Recharts Canvas */}
      <div className="flex-1 flex flex-col p-6 bg-slate-950">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-emerald-500" />
            <h2 className="text-xl font-bold">Interactive Data Canvas</h2>
          </div>
          {chartConfig && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded capitalize">
              Type: {chartConfig.chart_type}
            </span>
          )}
        </div>

        <div className="flex-1 border border-slate-800 rounded-xl bg-slate-900/50 p-6 flex items-center justify-center min-h-[300px]">
          {chartConfig ? (
            <div className="w-full h-full flex flex-col justify-between">
              <h3 className="text-center text-slate-300 font-medium mb-4">{chartConfig.title}</h3>
              
              <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartConfig.chart_type === 'bar' ? (
                    <BarChart data={chartConfig.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '#475569' }} />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name={chartConfig.title} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartConfig.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '#475569' }} />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name={chartConfig.title} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">No active visualization loaded.</p>
              <p className="text-xs text-slate-600">Type a data request in the chat sidebar to generate your first chart.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
