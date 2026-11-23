import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Only replay single-segment app page names, never query strings, commands, or auth routes.
const allowed = path => /^\/[A-Za-z][A-Za-z0-9-]{0,54}$/.test(path) && !/^\/(admin|login|register|signup|join|mfa|onboarding|reset-password|forgot-password|demologin|welcome|g3dex|gggcrypto)$/i.test(path);
const maxSteps = 25;

export default function DockMacro({settings, save}) {
  const {pathname} = useLocation(), navigate = useNavigate();
  const [record,setRecord] = useState(null), [draft,setDraft] = useState(null), [play,setPlay] = useState(null), [notice,setNotice] = useState('');
  const macros = settings.macros || [];
  useEffect(() => {
    if (!allowed(pathname)) return;
    setRecord(previous => !previous || previous.length >= maxSteps || previous.at(-1) === pathname ? previous : [...previous, pathname]);
  }, [pathname]);
  useEffect(() => {
    if (!play) return;
    const timer = setTimeout(() => {
      if (play.index === play.steps.length) {setPlay(null);setNotice('Replay complete.');return;}
      navigate(play.steps[play.index]);
      setPlay({...play,index:play.index+1});
    }, 1200);
    return () => clearTimeout(timer);
  }, [play,navigate]);
  return <div className="grid gap-2">
    <p>Record page moves within SaintAgent. Replay opens pages only; it does not repeat clicks or submissions.</p>
    {notice && <p role="status">{notice}</p>}
    {record ? <><p role="status">Recording: {record.length}/{maxSteps} steps</p><button onClick={() => {setDraft(record.length ? record : null);setRecord(null);if (!record.length) setNotice('No page visits recorded.');}}>Stop recording</button></> : !draft && !play && <button disabled={macros.length >= 12} onClick={() => {setNotice('');setRecord(allowed(pathname) ? [pathname] : []);}}>Record navigation</button>}
    {draft && <form className="grid gap-2" onSubmit={e => {e.preventDefault();const name = new FormData(e.currentTarget).get('name').trim();if (name) {save({macros:[...macros,{id:crypto.randomUUID(),name,steps:draft}]});setDraft(null);setNotice('Macro saved.');}}}>
      <input name="name" required maxLength={60} aria-label="Macro name" placeholder="Name this macro" pattern=".*\S.*" /><button>Save {draft.length} steps</button><button type="button" onClick={() => setDraft(null)}>Discard</button>
    </form>}
    {play && <><p role="status">Replaying {play.name}: {play.index}/{play.steps.length}</p><button onClick={() => {setPlay(null);setNotice('Replay stopped.');}}>Stop replay</button></>}
    {!macros.length && <p>No saved macros.</p>}
    {macros.map(macro => <div key={macro.id} className="flex flex-wrap items-center gap-2"><strong className="mr-auto">{macro.name} · {macro.steps.length} steps</strong><button disabled={!!(record || draft || play)} onClick={() => {const steps=macro.steps.filter(allowed);if (steps.length) {setNotice('');setPlay({name:macro.name,steps,index:0});}}}>Replay</button><button disabled={!!(record || draft || play)} onClick={() => {if (window.confirm(`Delete ${macro.name}?`)) save({macros:macros.filter(item => item.id !== macro.id)});}}>Delete</button></div>)}
  </div>;
}