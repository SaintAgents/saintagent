export const sourceTypes = {
  news: ['News', '/News'],
  mission: ['Missions', '/MissionDetail'],
  listing: ['Marketplace', '/ListingDetail'],
  course: ['Courses', '/CourseDetail'],
  organization: ['Organizations', '/BusinessEntityProfile'],
  project: ['My Projects', '/Projects'],
  person: ['Saint Agents', '/Profile'],
  mentor: ['Mentors', '/Mentorship'],
  library: ['My Research', '/Intelligence'],
  resource: ['Resource Hub', '/ResourceHub'],
};
export function sourceHref(ref) {
  if (!Object.hasOwn(sourceTypes, ref.kind) || typeof ref.id !== 'string' || !/^[\w-]{1,100}$/.test(ref.id)) return undefined;
  if (ref.kind === 'mentor' || ref.kind === 'person') {
    if (typeof ref.profile_number === 'string' && /^\d{1,20}$/.test(ref.profile_number)) return `/Profile?id=${encodeURIComponent(ref.profile_number)}`;
    return ref.kind === 'mentor' ? '/Mentorship' : '/Profiles';
  }
  if (ref.kind === 'resource') return `/ResourceHub#resource-${encodeURIComponent(ref.id)}`;
  return `${sourceTypes[ref.kind][1]}?${ref.kind === 'library' ? 'study' : 'id'}=${encodeURIComponent(ref.id)}`;
}