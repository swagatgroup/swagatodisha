const fs = require('fs');
const path = require('path');

const baseDir = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard';

const files = {
  'SuperAdminDashboard.jsx': `    const sidebarItems = [
        { id: 'dashboard', name: 'Dashboard', icon: <Squares2X2Icon className="mr-3 h-5 w-5" /> },
        { id: 'students', name: 'Our Students', icon: <UsersIcon className="mr-3 h-5 w-5" /> },
        { id: 'direct-students', name: 'Direct Students', icon: <UserPlusIcon className="mr-3 h-5 w-5" /> },
        { id: 'agents', name: 'Agents', icon: <UserGroupIcon className="mr-3 h-5 w-5" /> },
        { id: 'staff', name: 'Staff', icon: <UserIcon className="mr-3 h-5 w-5" /> },
        { id: 'new-registration', name: 'New Registration', icon: <DocumentTextIcon className="mr-3 h-5 w-5" /> },
        { id: 'application-review', name: 'Application Review', icon: <ClipboardDocumentCheckIcon className="mr-3 h-5 w-5" /> },
        { id: 'website-management', name: 'Website Management', icon: <GlobeAltIcon className="mr-3 h-5 w-5" /> },
        { id: 'payment-management', name: 'Payments', icon: <CreditCardIcon className="mr-3 h-5 w-5" /> },
        { id: 'referrals', name: 'Refer & Earn', icon: <MegaphoneIcon className="mr-3 h-5 w-5" /> },
        { id: 'student-password-reset', name: 'Student Password Reset', icon: <KeyIcon className="mr-3 h-5 w-5" /> }
    ];`,
  'StudentDashboard.jsx': `    const sidebarItems = [
        { id: 'registration', name: 'Dashboard', icon: <Squares2X2Icon className="mr-3 h-5 w-5" /> },
        { id: 'applications', name: 'My Application', icon: <DocumentTextIcon className="mr-3 h-5 w-5" /> },
        { id: 'referrals', name: 'Refer & Earn', icon: <MegaphoneIcon className="mr-3 h-5 w-5" /> },
        { id: 'refer_friend', name: 'Refer a Friend', icon: <HeartIcon className="mr-3 h-5 w-5" /> },
        { id: 'payments', name: 'Payments', icon: <CreditCardIcon className="mr-3 h-5 w-5" /> }
    ];`,
  'AgentDashboard.jsx': `  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Squares2X2Icon className="mr-3 h-5 w-5" /> },
    { id: 'referrals', name: 'My Referrals', icon: <UsersIcon className="mr-3 h-5 w-5" /> },
    { id: 'referral_earnings', name: 'Referral Earnings', icon: <CurrencyRupeeIcon className="mr-3 h-5 w-5" /> },
    { id: 'drafts', name: 'Draft Manager', icon: <DocumentTextIcon className="mr-3 h-5 w-5" /> },
    { id: 'new-registration', name: 'New Registration', icon: <UserPlusIcon className="mr-3 h-5 w-5" /> },
    { id: 'marketing', name: 'Marketing Materials', icon: <GlobeAltIcon className="mr-3 h-5 w-5" /> },
    { id: 'student-password-reset', name: 'Student Password Reset', icon: <KeyIcon className="mr-3 h-5 w-5" /> }
  ];`,
  'StaffDashboard.jsx': `    const sidebarItems = [
        { id: 'dashboard', name: 'Dashboard', icon: <Squares2X2Icon className="mr-3 h-5 w-5" /> },
        { id: 'students', name: 'Our Students', icon: <UsersIcon className="mr-3 h-5 w-5" /> },
        { id: 'document-verification', name: 'Document Verification', icon: <ClipboardDocumentCheckIcon className="mr-3 h-5 w-5" /> },
        { id: 'application-review', name: 'Application Review', icon: <ClipboardDocumentCheckIcon className="mr-3 h-5 w-5" /> },
        { id: 'student-password-reset', name: 'Student Password Reset', icon: <KeyIcon className="mr-3 h-5 w-5" /> }
    ];`
};

const importStmt = `import { Squares2X2Icon, UsersIcon, UserGroupIcon, UserIcon, UserPlusIcon, ClipboardDocumentCheckIcon, GlobeAltIcon, CreditCardIcon, MegaphoneIcon, KeyIcon, DocumentTextIcon, HeartIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';\n`;

for (const [filename, newArray] of Object.entries(files)) {
  const filePath = path.join(baseDir, filename);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Inject import
  if (!content.includes('@heroicons/react/24/outline')) {
    const importMatch = content.match(/import [^\n]+;\n/);
    if (importMatch) {
      content = content.replace(importMatch[0], importMatch[0] + importStmt);
    } else {
      content = importStmt + content;
    }
  }

  // Replace sidebarItems
  const match = content.match(/[\s]+const sidebarItems = \[[\s\S]*?\];/);
  if (match) {
    content = content.replace(match[0], '\n' + newArray);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filename);
  }
}
