export const folders = ['Agreements','Contracts','Banking','Technology','SOPs','Legal','Financial Models','Marketing','Images','Videos','Other'];
export const titlePattern = text => ({ $regex: text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' });
export const ownerFilter = user => ({ $or: [{ created_by_id: user.id }, { $and: [{ $or: [{ created_by_id: { $exists: false } }, { created_by_id: null }, { created_by_id: '' }] }, { created_by: user.email }] }] });
export const isUploader = (doc, user) => Boolean(user && (doc.created_by_id ? doc.created_by_id === user.id : doc.created_by && doc.created_by === user.email));
export const canEditDocument = (doc, user) => user?.role === 'admin' || isUploader(doc, user);
export const safeFileUrl = value => typeof value === 'string' && /^https?:\/\//i.test(value) ? value : undefined;
export const canSeeProjectFiles = (project, user) => Boolean(user && (user.role === 'admin' || (project.created_by_id ? project.created_by_id === user.id : user.email && project.created_by === user.email)));