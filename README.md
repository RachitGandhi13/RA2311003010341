 ---                                                            
  AffordMed — Campus Notification System                         
                                                                 
  AffordMed is a campus notification system that helps students  
  stay informed about important campus activities through        
  intelligent notification prioritization. The system surfaces   
  the most relevant unread notifications — placements, exam      
  results, and events — using a composite priority-ranking       
  algorithm backed by a min-heap data structure.                 
                                                                 
  The project is split into two stages:                          
                                                                 
  - Stage 1 is a Node.js/TypeScript CLI that implements the core 
  priority inbox algorithm. It fetches notifications from a live
  API, scores each one using a composite formula (type weight ×  
  recency scale + epoch timestamp), and maintains a bounded
  min-heap of the top-K notifications. It supports both batch
  processing (O(N log K)) and streaming arrivals (O(log K) per
  notification).
  - Stage 2 is a full-stack web UI built with Next.js, React, and
   Material-UI. It exposes the same algorithm through two pages: 
  a Priority Inbox that displays the top-K ranked notifications
  with configurable K, and an All Notifications page with full   
  pagination and type-based filtering. Features include
  mark-as-read/unread, auto-refresh every 30 seconds, visual rank
   medals for the top 3, color-coded notification types, and a
  responsive mobile layout.

  Tech Stack                                                     
  
  - TypeScript, Node.js                                          
  - React 19, Next.js 16
  - Material-UI (MUI) v9, Emotion
  - Axios                                                        
  - ts-node (Stage 1 dev)
                                                                 
  Priority Scoring Formula
                                                                 
  score = TYPE_WEIGHT × 10,000,000,000 + epoch_seconds(Timestamp)
                                                                 
  TYPE_WEIGHT: Placement = 3, Result = 2, Event = 1
                                                                 
  Type always dominates recency — a Placement always outranks a  
  Result regardless of age — while within the same type, newer
  notifications win.                                             
                  
  Project Structure

  AffordMed-main/
  └── frontend/
      ├── stage1/          # CLI backend — priority algorithm
      │   └── src/                                               
      │       ├── index.ts
      │       ├── api.ts                                         
      │       ├── scorer.ts
      │       ├── priorityQueue.ts                               
      │       ├── logger.ts
      │       └── types.ts
      └── stage2/          # Next.js web UI                      
          ├── app/
          │   ├── priority-inbox/                                
          │   └── all-notifications/
          ├── components/                                        
          │   ├── NotificationCard.tsx
          │   └── NavBar.tsx                                     
          └── lib/
              ├── api.ts
              ├── priorityQueue.ts
              └── theme.ts                                       
   
  Getting Started                                                
                  
  Stage 1:
  cd frontend/stage1
  npm install
  npm run dev                                                    
   
  Stage 2:                                                       
  cd frontend/stage2
  npm install       
  npm run dev
  The web UI runs on http://localhost:3000.

  API                                                            
   
  Notifications are fetched from                                 
  http://20.207.122.201/evaluation-service/notifications. Both
  stages include hardcoded fallback data when the API is         
  unreachable. The Stage 2 API client supports limit, page, and
  notification_type query parameters.

  Notification Data Model

  interface Notification {
    ID: string;
    Type: "Placement" | "Result" | "Event";
    Message: string;                                             
    Timestamp: string; // ISO 8601
  }                    
