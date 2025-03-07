// src/config/api-config.ts

/**
 * API Configuration
 * 
 * Controls the behavior of API routes in the presale application.
 */

export const API_CONFIG = {
    // IMPORTANT: Set to false for real transactions
    TEST_MODE: false, 
    
    // Simulation settings for test mode
    SIMULATION: {
      DELAY: 2000, // ms to simulate transaction processing
      SUCCESS_RATE: 0.95, // 95% success rate for testing error handling
    },
  
    // Production settings
    PRODUCTION: {
      MAX_RETRIES: 5,
      RETRY_DELAY: 2000, // ms
      MAX_TIMEOUT: 90000, // 90 seconds
    },
  
    // Minimum balance threshold for presale wallet
    MIN_BALANCE_THRESHOLD: 5000000,
  };