import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DockNews({ visible }) {
  const news = useQuery({ queryKey: ['dock-news', 4], enabled: visible, queryFn: async () => (await base44.entities.NewsArticle.filter({ is_published: true }, { sort: '-published_date', limit: 4 })).items });
  if (!visible) return null;
  return <div className="dock-links">
    {news.isError ? <><p role="alert">News could not be loaded.</p><button type="button" onClick={() => news.refetch()}>Retry</button></> : news.isPending ? <p role="status">Loading headlines…</p> : news.data.length ? news.data.map(article => <Link key={article.id} to={`/News?id=${encodeURIComponent(article.id)}`}>{article.title}</Link>) : <p>No published headlines.</p>}
    <Link to="/News">All news</Link>
  </div>;
}