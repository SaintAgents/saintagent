import React from 'react';
import ProjectIntakeWizard from './ProjectIntakeWizard';

// This modal now delegates to the full intake wizard
export default function CreateProjectModal({ open, onClose, currentUser, profile }) {
  return (
    <ProjectIntakeWizard
      open={open}
      onClose={onClose}
      currentUser={currentUser}
      profile={profile}
    />
  );
}