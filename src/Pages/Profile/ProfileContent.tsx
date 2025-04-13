// ProfileContent.jsx
import { useState } from 'react';
import ProfileActions from './Content/ProfileActions';
import ContentTabs from './Content/ContentTabs';
import TabContent from './Content/TabContents';

export default function ProfileContent({ userData }) {
  const [activeTab, setActiveTab] = useState('threads');
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <ProfileActions />
      <ContentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent activeTab={activeTab} />
    </div>
  );
}

