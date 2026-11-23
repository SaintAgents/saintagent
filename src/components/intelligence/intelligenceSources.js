export const sourceTypes = {
  news: ['News', '/News'],
  mission: ['Missions', '/MissionDetail'],
  listing: ['Marketplace', '/ListingDetail'],
  course: ['Courses', '/CourseDetail'],
  organization: ['Organizations', '/BusinessEntityProfile'],
  project: ['My Projects', '/Projects'],
};
export function sourceHref(ref) {
  if (!Object.hasOwn(sourceTypes, ref.kind) || typeof ref.id !== 'string' || !/^[\w-]{1,100}$/.test(ref.id)) return undefined;
  return `${sourceTypes[ref.kind][1]}?id=${encodeURIComponent(ref.id)}`;
}