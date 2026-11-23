export function myGroupsFilter(email) {
  return { $or: [{ owner_id: email }, { member_ids: { $in: [email] } }] };
}