# Filter Buttons Implementation for Staff and Agent Dashboards

## Summary
Added direct filter buttons to the Processing Statistics sections in both Staff and Agent dashboards. Clicking these buttons **shows the filtered student table directly on the dashboard** (not redirecting to other tabs).

## Changes Made

### 1. Backend - Processing Stats API (`backend/routes/staffRoutes.js`)
- Added 3 new status counts to the processing stats response:
  - `draftInSession` - Count of DRAFT applications
  - `submittedInSession` - Count of SUBMITTED applications
  - `underReviewInSession` - Count of UNDER_REVIEW applications

### 2. ProcessingStats Component (`frontend/src/components/dashboard/components/ProcessingStats.jsx`)
- Added `onStatClick` prop to handle click events
- Made stat cards clickable for stats that have corresponding filters
- Expanded stats from 4 to 6 status buttons:
  - **Total Students**: `null` (not clickable)
  - **Draft**: `'DRAFT'` (clickable)
  - **Submitted**: `'SUBMITTED'` (clickable)
  - **Under Review**: `'UNDER_REVIEW'` (clickable)
  - **Approved**: `'APPROVED'` (clickable)
  - **Rejected**: `'REJECTED'` (clickable)
- Added hover effects and arrow icons to clickable stats
- Cards now show a right arrow icon and shadow effect on hover
- Changed grid layout from 4 columns to 3 columns to accommodate 6 stats

### 3. Staff Dashboard (`frontend/src/components/dashboard/StaffDashboard.jsx`)
- Added `studentTableFilter` state to track the selected filter
- Created `handleStatClick` function that:
  - Sets the student table filter
  - Stays on the dashboard (no navigation)
- Updated ProcessingStats to pass the `onStatClick` handler
- Updated RecentStudentsTable to accept `initialFilter` prop
- Added new status fields to processing stats state

### 4. RecentStudentsTable Component (`frontend/src/components/dashboard/components/RecentStudentsTable.jsx`)
- Added `initialFilter` prop to set the initial status filter
- Added `useEffect` to sync filter when `initialFilter` changes
- Filter now updates automatically when clicked from Processing Stats

### 5. StudentTable Component (`frontend/src/components/dashboard/components/StudentTable.jsx`)
- Added `initialFilter` prop to set the initial status filter
- Added `useEffect` to sync filter when `initialFilter` changes
- Filter now updates automatically when clicked from stats

### 6. Agent Dashboard (`frontend/src/components/dashboard/AgentDashboard.jsx`)
- Added `studentTableFilter` state to track the selected filter
- Created `handleStatClick` function that:
  - Sets the student table filter
  - Stays on the dashboard (no navigation)
- Converted Pending and Completed stats to be clickable
- Added hover effects and arrow icons
- Updated StudentTable to accept `initialFilter` prop

## User Experience

**Staff Dashboard:**
1. User clicks on "Draft" → Student table filters to show DRAFT students
2. User clicks on "Submitted" → Student table filters to show SUBMITTED students
3. User clicks on "Under Review" → Student table filters to show UNDER_REVIEW students
4. User clicks on "Approved" → Student table filters to show APPROVED students
5. User clicks on "Rejected" → Student table filters to show REJECTED students
6. **All filtering happens on the same page** - no navigation away from dashboard

**Agent Dashboard:**
1. User clicks on "Pending" → Student table filters to show submitted students
2. User clicks on "Completed" → Student table filters to show approved students
3. **All filtering happens on the same page** - no navigation away from dashboard

## Visual Enhancements
- Clickable stat cards show a hover shadow effect
- Arrow icon appears on the right side of clickable stats
- Arrow icon has a subtle opacity animation on hover
- Stats use color-coded values:
  - Gray for Draft
  - Blue for Submitted
  - Yellow for Under Review
  - Green for Approved
  - Red for Rejected
- Non-clickable stats (Total Students) remain visually distinct
- Grid layout optimized for 6 stat cards (3 columns on large screens)

## Technical Notes
- All changes are backward compatible
- No breaking changes to existing functionality
- Filter state is managed at the dashboard level
- Student tables properly sync with the filter from stats
- Backend API returns all 6 status counts
- All linter checks pass without errors
- Filter changes trigger automatic table refresh via useEffect

## Data Flow
1. User clicks a stat button in Processing Stats
2. `handleStatClick` is called with the filter key
3. Dashboard sets `studentTableFilter` state to the filter key
4. RecentStudentsTable/StudentTable receives `initialFilter` prop
5. `useEffect` detects prop change and updates local `filterStatus`
6. Table automatically fetches/redisplays filtered data
7. User sees filtered results on the same page
