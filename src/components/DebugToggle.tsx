'use client';

import React, { useState, useEffect } from 'react';

export function DebugToggle() {
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [networkStatus, setNetworkStatus] = useState<{
    network: string;
    endpoint: string;
    connected: boolean;
  }>({
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'testnet',
    endpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.testnet.solana.com',
    connected: false
  });

  useEffect(() => {
    if (showDebug) {
      // Check connection to RPC endpoint
      const checkConnection = async () => {
        try {
          const response = await fetch(networkStatus.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getHealth',
            }),
          });
          
          const data = await response.json();
          setNetworkStatus(prev => ({
            ...prev,
            connected: data.result === 'ok'
          }));
        } catch (error) {
          setNetworkStatus(prev => ({
            ...prev,
            connected: false
          }));
          console.error('Failed to connect to RPC endpoint:', error);
        }
      };
      
      checkConnection();
      
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        originalConsoleLog(...args);
        setLogs(prev => [...prev, args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')].slice(-20)); // Keep only last 20 logs
      };
      
      return () => {
        console.log = originalConsoleLog;
      };
    }
  }, [showDebug, networkStatus.endpoint]);

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        width: '400px',
        height: '300px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        overflowY: 'auto',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold' }}>Debug Console</span>
        <button 
          onClick={() => setShowDebug(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '10px', padding: '5px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '3px' }}>
        <div>Network: <span style={{ color: '#93C5FD' }}>{networkStatus.network}</span></div>
        <div>Endpoint: <span style={{ color: '#93C5FD' }}>{networkStatus.endpoint}</span></div>
        <div>
          Status: 
          <span style={{ 
            color: networkStatus.connected ? '#34D399' : '#F87171',
            marginLeft: '5px'
          }}>
            {networkStatus.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Console Logs:</div>
      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ opacity: 0.5, fontStyle: 'italic' }}>No logs yet...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ 
              whiteSpace: 'pre-wrap', 
              marginBottom: '4px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '4px'
            }}>
              {log}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
        <button
          onClick={() => setLogs([])}
          style={{
            background: 'rgba(107, 114, 128, 0.5)',
            border: 'none',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
        
        <button
          onClick={() => {
            console.log('⚠️ Test log - ' + new Date().toISOString());
          }}
          style={{
            background: 'rgba(59, 130, 246, 0.5)',
            border: 'none',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Test Log
        </button>
      </div>
    </div>
  );
}