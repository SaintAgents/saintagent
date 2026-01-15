/**
 * Data Access Layer (DAL) - Migration-Ready Wrapper
 * 
 * All UI components should ONLY call these functions.
 * When migrating to Supabase, only this file needs to change.
 * 
 * CURRENT: Base44 SDK
 * FUTURE: Supabase SDK (swap implementations below)
 */

import { base44 } from '@/api/base44Client';

// Detect mobile for reduced data fetching
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

// Mobile-optimized limits
const LIMITS = {
  badges: { mobile: 5, desktop: 100 },
  matches: { mobile: 5, desktop: 20 },
  meetings: { mobile: 5, desktop: 10 },
  missions: { mobile: 3, desktop: 10 },
  listings: { mobile: 5, desktop: 10 },
  notifications: { mobile: 10, desktop: 20 },
  challenges: { mobile: 5, desktop: 10 },
  projects: { mobile: 10, desktop: 50 },
  posts: { mobile: 10, desktop: 20 },
};

const getLimit = (type, override) => {
  if (override !== undefined) return override;
  const limits = LIMITS[type];
  if (!limits) return 20;
  return isMobile() ? limits.mobile : limits.desktop;
};

export const dataService = {
  // ==========================================
  // USER PROFILE
  // ==========================================
  
  async getUserProfile(identifier) {
    // identifier can be SA# or email
    const isSA = identifier?.startsWith?.('SA') || /^\d{6}$/.test(identifier);
    const filter = isSA ? { sa_number: identifier } : { user_id: identifier };
    const results = await base44.entities.UserProfile.filter(filter, '-updated_date', 1);
    return results?.[0] || null;
    
    // FUTURE: Supabase
    // const column = isSA ? 'sa_number' : 'user_id';
    // const { data } = await supabase.from('user_profiles').select().eq(column, identifier).single();
    // return data;
  },

  async getUserProfileById(id) {
    return await base44.entities.UserProfile.get(id);
    
    // FUTURE: Supabase
    // const { data } = await supabase.from('user_profiles').select().eq('id', id).single();
    // return data;
  },

  async updateUserProfile(id, data) {
    return await base44.entities.UserProfile.update(id, data);
    
    // FUTURE: Supabase
    // const { data: result } = await supabase.from('user_profiles').update(data).eq('id', id).select().single();
    // return result;
  },

  async listUserProfiles(filters = {}, sort = '-created_date', limit = 50) {
    return await base44.entities.UserProfile.filter(filters, sort, limit);
    
    // FUTURE: Supabase
    // let query = supabase.from('user_profiles').select();
    // Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });
    // const { data } = await query.order('created_date', { ascending: false }).limit(limit);
    // return data;
  },

  // ==========================================
  // BADGES
  // ==========================================
  
  async getBadgesByUser(identifier, limit) {
    const isSA = identifier?.startsWith?.('SA') || /^\d{6}$/.test(identifier);
    const filter = isSA ? { user_id: identifier } : { user_id: identifier };
    return await base44.entities.Badge.filter(filter, '-created_date', getLimit('badges', limit));
    
    // FUTURE: Supabase
    // const { data } = await supabase.from('badges').select().eq('user_id', identifier);
    // return data || [];
  },

  async createBadge(badgeData) {
    return await base44.entities.Badge.create(badgeData);
    
    // FUTURE: Supabase
    // const { data } = await supabase.from('badges').insert(badgeData).select().single();
    // return data;
  },

  async updateBadge(id, data) {
    return await base44.entities.Badge.update(id, data);
  },

  // ==========================================
  // WALLET
  // ==========================================
  
  async getWallet(identifier) {
    const isSA = identifier?.startsWith?.('SA') || /^\d{6}$/.test(identifier);
    const filter = isSA ? { user_id: identifier } : { user_id: identifier };
    const results = await base44.entities.Wallet.filter(filter, '-created_date', 1);
    return results?.[0] || null;
    
    // FUTURE: Supabase
    // const { data } = await supabase.from('wallets').select().eq('user_id', identifier).single();
    // return data;
  },

  async createWallet(walletData) {
    return await base44.entities.Wallet.create(walletData);
  },

  async updateWallet(id, data) {
    return await base44.entities.Wallet.update(id, data);
  },

  // ==========================================
  // GGG TRANSACTIONS
  // ==========================================
  
  async getTransactions(identifier, limit = 50) {
    return await base44.entities.GGGTransaction.filter({ user_id: identifier }, '-created_date', limit);
    
    // FUTURE: Supabase
    // const { data } = await supabase.from('ggg_transactions').select().eq('user_id', identifier).order('created_date', { ascending: false }).limit(limit);
    // return data || [];
  },

  async createTransaction(transactionData) {
    return await base44.entities.GGGTransaction.create(transactionData);
  },

  // ==========================================
  // CHALLENGES
  // ==========================================
  
  async getChallenges(identifier, status = 'active', limit) {
    const filter = status ? { user_id: identifier, status } : { user_id: identifier };
    return await base44.entities.Challenge.filter(filter, '-created_date', getLimit('challenges', limit));
    
    // FUTURE: Supabase
    // let query = supabase.from('challenges').select().eq('user_id', identifier);
    // if (status) query = query.eq('status', status);
    // const { data } = await query.order('created_date', { ascending: false }).limit(limit);
    // return data || [];
  },

  async updateChallenge(id, data) {
    return await base44.entities.Challenge.update(id, data);
  },

  // ==========================================
  // MATCHES
  // ==========================================
  
  async getMatches(identifier, status = 'active', limit) {
    const filter = status ? { user_id: identifier, status } : { user_id: identifier };
    return await base44.entities.Match.filter(filter, '-match_score', getLimit('matches', limit));
    
    // FUTURE: Supabase
    // let query = supabase.from('matches').select().eq('user_id', identifier);
    // if (status) query = query.eq('status', status);
    // const { data } = await query.order('match_score', { ascending: false }).limit(limit);
    // return data || [];
  },

  async createMatch(matchData) {
    return await base44.entities.Match.create(matchData);
  },

  async updateMatch(id, data) {
    return await base44.entities.Match.update(id, data);
  },

  // ==========================================
  // MEETINGS
  // ==========================================
  
  async getMeetings(identifier, filters = {}, limit) {
    const effectiveLimit = getLimit('meetings', limit);
    // Get meetings where user is host or guest
    const asHost = await base44.entities.Meeting.filter({ host_id: identifier, ...filters }, '-scheduled_time', effectiveLimit);
    const asGuest = await base44.entities.Meeting.filter({ guest_id: identifier, ...filters }, '-scheduled_time', effectiveLimit);
    
    // Combine and dedupe
    const all = [...asHost, ...asGuest];
    const unique = all.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
    return unique.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time)).slice(0, effectiveLimit);
    
    // FUTURE: Supabase
    // const { data } = await supabase.from('meetings').select().or(`host_id.eq.${identifier},guest_id.eq.${identifier}`).order('scheduled_time', { ascending: false }).limit(limit);
    // return data || [];
  },

  async createMeeting(meetingData) {
    return await base44.entities.Meeting.create(meetingData);
  },

  async updateMeeting(id, data) {
    return await base44.entities.Meeting.update(id, data);
  },

  // ==========================================
  // MISSIONS
  // ==========================================
  
  async getMissions(filters = {}, limit) {
    return await base44.entities.Mission.filter(filters, '-created_date', getLimit('missions', limit));
    
    // FUTURE: Supabase
    // let query = supabase.from('missions').select();
    // Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });
    // const { data } = await query.order('created_date', { ascending: false }).limit(limit);
    // return data || [];
  },

  async getMissionById(id) {
    return await base44.entities.Mission.get(id);
  },

  async createMission(missionData) {
    return await base44.entities.Mission.create(missionData);
  },

  async updateMission(id, data) {
    return await base44.entities.Mission.update(id, data);
  },

  // ==========================================
  // LISTINGS (MARKETPLACE)
  // ==========================================
  
  async getListings(filters = {}, limit) {
    return await base44.entities.Listing.filter(filters, '-created_date', getLimit('listings', limit));
  },

  async getListingById(id) {
    return await base44.entities.Listing.get(id);
  },

  async createListing(listingData) {
    return await base44.entities.Listing.create(listingData);
  },

  async updateListing(id, data) {
    return await base44.entities.Listing.update(id, data);
  },

  // ==========================================
  // MESSAGES
  // ==========================================
  
  async getMessages(conversationId, limit = 100) {
    return await base44.entities.Message.filter({ conversation_id: conversationId }, 'created_date', limit);
    
    // FUTURE: Supabase
    // const { data } = await supabase.from('messages').select().eq('conversation_id', conversationId).order('created_date', { ascending: true }).limit(limit);
    // return data || [];
  },

  async createMessage(messageData) {
    return await base44.entities.Message.create(messageData);
  },

  async updateMessage(id, data) {
    return await base44.entities.Message.update(id, data);
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  
  async getNotifications(identifier, unreadOnly = false, limit) {
    const filter = unreadOnly ? { user_id: identifier, is_read: false } : { user_id: identifier };
    return await base44.entities.Notification.filter(filter, '-created_date', getLimit('notifications', limit));
  },

  async createNotification(notificationData) {
    return await base44.entities.Notification.create(notificationData);
  },

  async markNotificationRead(id) {
    return await base44.entities.Notification.update(id, { is_read: true });
  },

  // ==========================================
  // CIRCLES
  // ==========================================
  
  async getCircles(filters = {}, limit = 20) {
    return await base44.entities.Circle.filter(filters, '-member_count', limit);
  },

  async getCircleById(id) {
    return await base44.entities.Circle.get(id);
  },

  async createCircle(circleData) {
    return await base44.entities.Circle.create(circleData);
  },

  async updateCircle(id, data) {
    return await base44.entities.Circle.update(id, data);
  },

  // ==========================================
  // POSTS (COMMUNITY FEED)
  // ==========================================
  
  async getPosts(filters = {}, limit) {
    return await base44.entities.Post.filter(filters, '-created_date', getLimit('posts', limit));
  },

  async createPost(postData) {
    return await base44.entities.Post.create(postData);
  },

  async updatePost(id, data) {
    return await base44.entities.Post.update(id, data);
  },

  async deletePost(id) {
    return await base44.entities.Post.delete(id);
  },

  // ==========================================
  // SYNCHRONICITIES
  // ==========================================
  
  async getSynchronicities(identifier, limit = 20) {
    return await base44.entities.Synchronicity.filter({ user_id: identifier }, '-created_date', limit);
  },

  async createSynchronicity(data) {
    return await base44.entities.Synchronicity.create(data);
  },

  // ==========================================
  // ONBOARDING
  // ==========================================
  
  async getOnboardingProgress(identifier) {
    const results = await base44.entities.OnboardingProgress.filter({ user_id: identifier }, '-created_date', 1);
    return results?.[0] || null;
  },

  async createOnboardingProgress(data) {
    return await base44.entities.OnboardingProgress.create(data);
  },

  async updateOnboardingProgress(id, data) {
    return await base44.entities.OnboardingProgress.update(id, data);
  },

  // ==========================================
  // GGG REWARD RULES
  // ==========================================
  
  async getRewardRules(activeOnly = true) {
    const filter = activeOnly ? { is_active: true } : {};
    return await base44.entities.GGGRewardRule.filter(filter, 'action_type', 100);
  },

  async getRewardRule(actionType) {
    const results = await base44.entities.GGGRewardRule.filter({ action_type: actionType, is_active: true }, '-created_date', 1);
    return results?.[0] || null;
  },

  // ==========================================
  // BOOKINGS
  // ==========================================
  
  async getBookings(identifier, role = 'buyer', limit = 20) {
    const filter = role === 'buyer' ? { buyer_id: identifier } : { seller_id: identifier };
    return await base44.entities.Booking.filter(filter, '-created_date', limit);
  },

  async createBooking(bookingData) {
    return await base44.entities.Booking.create(bookingData);
  },

  async updateBooking(id, data) {
    return await base44.entities.Booking.update(id, data);
  },

  // ==========================================
  // TESTIMONIALS
  // ==========================================
  
  async getTestimonials(identifier, direction = 'received', limit = 20) {
    const filter = direction === 'received' ? { to_user_id: identifier } : { from_user_id: identifier };
    return await base44.entities.Testimonial.filter(filter, '-created_date', limit);
  },

  async createTestimonial(testimonialData) {
    return await base44.entities.Testimonial.create(testimonialData);
  },

  // ==========================================
  // FOLLOWS
  // ==========================================
  
  async getFollowers(identifier, limit = 100) {
    return await base44.entities.Follow.filter({ following_id: identifier }, '-created_date', limit);
  },

  async getFollowing(identifier, limit = 100) {
    return await base44.entities.Follow.filter({ follower_id: identifier }, '-created_date', limit);
  },

  async createFollow(followData) {
    return await base44.entities.Follow.create(followData);
  },

  async deleteFollow(id) {
    return await base44.entities.Follow.delete(id);
  },

  // ==========================================
  // BOOSTS
  // ==========================================
  
  async getActiveBoosts(identifier) {
    return await base44.entities.Boost.filter({ user_id: identifier, status: 'active' }, '-created_date', 10);
  },

  async createBoost(boostData) {
    return await base44.entities.Boost.create(boostData);
  },

  async updateBoost(id, data) {
    return await base44.entities.Boost.update(id, data);
  },

  // ==========================================
  // QUESTS
  // ==========================================
  
  async getQuests(identifier, status, limit = 20) {
    const filter = status ? { user_id: identifier, status } : { user_id: identifier };
    return await base44.entities.Quest.filter(filter, '-created_date', limit);
  },

  async createQuest(questData) {
    return await base44.entities.Quest.create(questData);
  },

  async updateQuest(id, data) {
    return await base44.entities.Quest.update(id, data);
  },

  // ==========================================
  // PROJECTS
  // ==========================================
  
  async getProjects(filters = {}, limit) {
    return await base44.entities.Project.filter(filters, '-created_date', getLimit('projects', limit));
  },

  async getProjectById(id) {
    return await base44.entities.Project.get(id);
  },

  async createProject(projectData) {
    return await base44.entities.Project.create(projectData);
  },

  async updateProject(id, data) {
    return await base44.entities.Project.update(id, data);
  },

  // ==========================================
  // TEAMS
  // ==========================================
  
  async getTeams(filters = {}, limit = 20) {
    return await base44.entities.Team.filter(filters, '-created_date', limit);
  },

  async getTeamById(id) {
    return await base44.entities.Team.get(id);
  },

  async createTeam(teamData) {
    return await base44.entities.Team.create(teamData);
  },

  async updateTeam(id, data) {
    return await base44.entities.Team.update(id, data);
  },

  // ==========================================
  // EVENTS
  // ==========================================
  
  async getEvents(filters = {}, limit = 20) {
    return await base44.entities.Event.filter(filters, 'start_time', limit);
  },

  async getEventById(id) {
    return await base44.entities.Event.get(id);
  },

  async createEvent(eventData) {
    return await base44.entities.Event.create(eventData);
  },

  async updateEvent(id, data) {
    return await base44.entities.Event.update(id, data);
  },

  // ==========================================
  // SKILLS
  // ==========================================
  
  async getSkills(identifier) {
    return await base44.entities.Skill.filter({ user_id: identifier }, 'skill_name', 50);
  },

  async createSkill(skillData) {
    return await base44.entities.Skill.create(skillData);
  },

  async updateSkill(id, data) {
    return await base44.entities.Skill.update(id, data);
  },

  async deleteSkill(id) {
    return await base44.entities.Skill.delete(id);
  },

  // ==========================================
  // REFERRALS / AFFILIATES
  // ==========================================
  
  async getReferrals(identifier) {
    return await base44.entities.Referral.filter({ referrer_id: identifier }, '-created_date', 100);
  },

  async getAffiliateCode(identifier) {
    const results = await base44.entities.AffiliateCode.filter({ user_id: identifier }, '-created_date', 1);
    return results?.[0] || null;
  },

  async createAffiliateCode(codeData) {
    return await base44.entities.AffiliateCode.create(codeData);
  },

  // ==========================================
  // LEADERBOARD
  // ==========================================
  
  async getLeaderboardEntries(category, limit = 10) {
    return await base44.entities.LeaderboardEntry.filter({ category }, '-score', limit);
  },

  // ==========================================
  // AUTH HELPERS (uses base44.auth)
  // ==========================================
  
  async getCurrentUser() {
    return await base44.auth.me();
    
    // FUTURE: Supabase
    // const { data: { user } } = await supabase.auth.getUser();
    // return user;
  },

  async updateCurrentUser(data) {
    return await base44.auth.updateMe(data);
    
    // FUTURE: Supabase
    // const { data: result } = await supabase.auth.updateUser({ data });
    // return result;
  },

  async isAuthenticated() {
    return await base44.auth.isAuthenticated();
    
    // FUTURE: Supabase
    // const { data: { session } } = await supabase.auth.getSession();
    // return !!session;
  },

  logout(redirectUrl) {
    return base44.auth.logout(redirectUrl);
    
    // FUTURE: Supabase
    // await supabase.auth.signOut();
    // if (redirectUrl) window.location.href = redirectUrl;
  },

  // ==========================================
  // SUBSCRIPTIONS (Real-time)
  // ==========================================
  
  subscribeToEntity(entityName, callback) {
    return base44.entities[entityName].subscribe(callback);
    
    // FUTURE: Supabase
    // return supabase.channel(entityName).on('postgres_changes', { event: '*', schema: 'public', table: entityName }, callback).subscribe();
  },

  // ==========================================
  // GENERIC OPERATIONS
  // ==========================================
  
  async getEntity(entityName, id) {
    return await base44.entities[entityName].get(id);
  },

  async listEntity(entityName, filters = {}, sort = '-created_date', limit = 50) {
    return await base44.entities[entityName].filter(filters, sort, limit);
  },

  async createEntity(entityName, data) {
    return await base44.entities[entityName].create(data);
  },

  async updateEntity(entityName, id, data) {
    return await base44.entities[entityName].update(id, data);
  },

  async deleteEntity(entityName, id) {
    return await base44.entities[entityName].delete(id);
  },

  async bulkCreateEntity(entityName, dataArray) {
    return await base44.entities[entityName].bulkCreate(dataArray);
  }
};

// Export mobile detection and limits for components that need them
export const isMobileDevice = isMobile;
export const DATA_LIMITS = LIMITS;

export default dataService;