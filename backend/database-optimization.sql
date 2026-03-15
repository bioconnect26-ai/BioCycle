-- BioCycle Production Database Optimization Script
-- Run these SQL commands after deployment to optimize performance

-- ============================================================================
-- USER TABLE INDEXES
-- ============================================================================

-- Speed up email lookups (used in login, registration)
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_email_status ON "Users"(email, status);

-- Speed up role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users"(role);

-- Speed up pending user queries
CREATE INDEX IF NOT EXISTS idx_users_status ON "Users"(status);

-- Speed up account lockout checks
CREATE INDEX IF NOT EXISTS idx_users_lockoutUntil ON "Users"(COALESCE("lockoutUntil", TIMESTAMP '1900-01-01'));

-- ============================================================================
-- CYCLE TABLE INDEXES
-- ============================================================================

-- Speed up cycle lookups by creator
CREATE INDEX IF NOT EXISTS idx_cycles_createdBy ON "Cycles"("createdBy");
CREATE INDEX IF NOT EXISTS idx_cycles_updatedBy ON "Cycles"("updatedBy");

-- Speed up category filtering
CREATE INDEX IF NOT EXISTS idx_cycles_categoryId ON "Cycles"("categoryId");

-- Speed up class level filtering
CREATE INDEX IF NOT EXISTS idx_cycles_classLevelId ON "Cycles"("classLevelId");

-- Speed up published cycles lookup
CREATE INDEX IF NOT EXISTS idx_cycles_status ON "Cycles"(status);
CREATE INDEX IF NOT EXISTS idx_cycles_status_classLevelId ON "Cycles"(status, "classLevelId");

-- Speed up date-based queries
CREATE INDEX IF NOT EXISTS idx_cycles_createdAt ON "Cycles"("createdAt" DESC);

-- ============================================================================
-- CYCLE RELATIONSHIPS INDEXES
-- ============================================================================

-- Speed up step lookups within a cycle
CREATE INDEX IF NOT EXISTS idx_cycleSteps_cycleId ON "CycleSteps"("cycleId");

-- Speed up quick facts lookups
CREATE INDEX IF NOT EXISTS idx_quickFacts_cycleId ON "QuickFacts"("cycleId");

-- Speed up flashcards lookups
CREATE INDEX IF NOT EXISTS idx_flashcards_cycleId ON "Flashcards"("cycleId");

-- Speed up quiz questions lookups
CREATE INDEX IF NOT EXISTS idx_quizQuestions_cycleId ON "QuizQuestions"("cycleId");

-- Speed up memory palace lookups
CREATE INDEX IF NOT EXISTS idx_memoryPalaceEntry_cycleId ON "MemoryPalaceEntries"("cycleId");

-- ============================================================================
-- ACTIVITY LOG INDEXES
-- ============================================================================

-- Speed up user activity lookups
CREATE INDEX IF NOT EXISTS idx_activityLogs_userId ON "ActivityLogs"("userId");

-- Speed up recent activity queries
CREATE INDEX IF NOT EXISTS idx_activityLogs_createdAt ON "ActivityLogs"("createdAt" DESC);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Optimize "get active published cycles by class level"
CREATE INDEX IF NOT EXISTS idx_cycles_status_classLevel_active 
  ON "Cycles"(status, "classLevelId", "createdAt" DESC)
  WHERE status = 'published';

-- Optimize "get user's cycles"
CREATE INDEX IF NOT EXISTS idx_cycles_creator_status 
  ON "Cycles"("createdBy", status);

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================
-- This updates table statistics for the query planner

ANALYZE "Users";
ANALYZE "Cycles";
ANALYZE "CycleSteps";
ANALYZE "QuickFacts";
ANALYZE "Flashcards";
ANALYZE "QuizQuestions";
ANALYZE "MemoryPalaceEntries";
ANALYZE "Categories";
ANALYZE "ClassLevels";
ANALYZE "ActivityLogs";

-- ============================================================================
-- VERIFY INDEXES WERE CREATED
-- ============================================================================

-- List all indexes for Users table:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'Users';

-- List all indexes for Cycles table:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'Cycles';

-- ============================================================================
-- PERFORMANCE STATISTICS (Run periodically)
-- ============================================================================

-- Check index usage:
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
*/

-- Check table size:
/*
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/

-- Check slow queries:
/*
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
*/
