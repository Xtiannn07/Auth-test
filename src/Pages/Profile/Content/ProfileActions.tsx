// ProfileActions.jsx
import Button from '../../../Components/UI/Button';

export default function ProfileActions() {
  return (
    <div className="flex px-4 gap-2 mt-2">
      <Button variant="secondary">Edit profile</Button>
      <Button variant="secondary">Share profile</Button>
    </div>
  );
}