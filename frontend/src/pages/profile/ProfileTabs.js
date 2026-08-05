import React from "react";
import PersonalDetailsTab from "./PersonalDetailsTab";
import Achievements from "./Achievements";
import BookmarksTab from "./BookmarksTab";
import FollowedClubsTab from "./FollowedClubsTab";
import NetworkTab from "./NetworkTab";
import "./ProfileTabs.css";

/**
 * ProfileTabs – Main Tab Container for Active Panel Views.
 * Views: Profile Details | Achievements | Bookmarks | Clubs | Network
 */
function ProfileTabs({
  activeTab = "personalDetails",
  setActiveTab = () => {},
  userDetails,
  onSavePersonalDetails = () => {},
  onDeleteAccount = () => {},
  achievements = [],
  onAddAchievement = () => {},
  onDeleteAchievement = () => {},
  bookmarks = [],
  followedClubs = [],
  following = [],
  followers = [],
  onUnfollowClub = () => {},
  onUnfollow = () => {},
  onRemoveFollower = () => {},
  onUnbookmark = () => {},
}) {
  return (
    <div className="ptab-container">
      {/* 1. PERSONAL DETAILS */}
      {activeTab === "personalDetails" && (
        <PersonalDetailsTab
          userDetails={userDetails}
          onSave={onSavePersonalDetails}
          onDeleteAccount={onDeleteAccount}
        />
      )}

      {/* 2. ACHIEVEMENTS & CERTIFICATES */}
      {activeTab === "achievements" && (
        <Achievements
          achievements={achievements}
          onAdd={onAddAchievement}
          onDelete={onDeleteAchievement}
          editable={true}
        />
      )}

      {/* 3. BOOKMARKS TAB */}
      {activeTab === "bookmarked" && (
        <BookmarksTab
          bookmarks={bookmarks}
          onUnbookmark={onUnbookmark}
        />
      )}

      {/* 4. FOLLOWED CLUBS TAB */}
      {activeTab === "followedClubs" && (
        <FollowedClubsTab
          followedClubs={followedClubs}
          onUnfollowClub={onUnfollowClub}
        />
      )}

      {/* 5. ACADEMIC NETWORK TAB */}
      {activeTab === "network" && (
        <NetworkTab
          following={following}
          followers={followers}
          onUnfollow={onUnfollow}
          onRemoveFollower={onRemoveFollower}
        />
      )}
    </div>
  );
}

export default ProfileTabs;
