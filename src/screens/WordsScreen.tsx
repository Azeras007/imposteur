import { useState } from 'react';
import { useApp } from '../store/AppStore';
import { Actions, SectionTitle, Topbar } from '../components/ui';
import type { WordPack } from '../types';

const EMOJIS = ['📦', '🔥', '🎯', '🤣', '🍿', '🏠', '🎓', '💼', '🎵', '🐉', '🍺', '🧠'];

export function WordsScreen() {
  const app = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📦');
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const open = openId ? app.allPacks.find((p) => p.id === openId) ?? null : null;
  if (open) return <PackEditor pack={open} onBack={() => setOpenId(null)} />;

  return (
    <div className="screen">
      <Topbar title="Mes mots" onBack={() => app.go('home')} />

      <div className="tiny">
        Un pack est une liste de <b>paires</b> : le mot des civils, et le mot proche donné aux
        imposteurs. Coche un pack dans les paramètres pour qu'il entre dans le tirage.
      </div>

      <SectionTitle>Mes packs</SectionTitle>
      {app.customPacks.length === 0 && (
        <div className="card tight tiny">Aucun pack perso pour l'instant.</div>
      )}
      <div className="stack">
        {app.customPacks.map((p) => (
          <PackRow key={p.id} pack={p} onOpen={() => setOpenId(p.id)} />
        ))}
      </div>

      {creating ? (
        <div className="card stack">
          <div className="label">Nouveau pack</div>
          <input
            type="text"
            value={newName}
            placeholder="Nom du pack (ex : Vannes de la bande)"
            maxLength={28}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="row wrap" style={{ gap: 6 }}>
            {EMOJIS.map((e) => (
              <button key={e} className="chip" data-on={newEmoji === e} onClick={() => setNewEmoji(e)}>
                {e}
              </button>
            ))}
          </div>
          <div className="row">
            <button
              className="btn primary"
              disabled={!newName.trim()}
              onClick={() => {
                const id = app.createPack(newName.trim(), newEmoji);
                setCreating(false);
                setNewName('');
                setOpenId(id);
              }}
            >
              Créer
            </button>
            <button className="btn ghost" onClick={() => setCreating(false)}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button className="btn" onClick={() => setCreating(true)}>
          ＋ Créer un pack
        </button>
      )}

      {importing ? (
        <div className="card stack">
          <div className="label">Importer un pack (JSON)</div>
          <div className="tiny">
            Format : {'{ "name": "Mon pack", "emoji": "🔥", "pairs": [{ "a": "poêle", "b": "casserole" }] }'}
          </div>
          <textarea
            value={importText}
            placeholder='{"name":"...","pairs":[{"a":"...","b":"..."}]}'
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <div className="err">{importError}</div>}
          <div className="row">
            <button
              className="btn primary"
              onClick={() => {
                const e = app.importPack(importText);
                setImportError(e);
                if (!e) {
                  setImporting(false);
                  setImportText('');
                }
              }}
            >
              Importer
            </button>
            <button className="btn ghost" onClick={() => setImporting(false)}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button className="btn ghost sm" style={{ width: '100%' }} onClick={() => setImporting(true)}>
          ⬇︎ Importer un pack JSON
        </button>
      )}

      <SectionTitle>Packs intégrés</SectionTitle>
      <div className="stack">
        {app.allPacks
          .filter((p) => p.builtin)
          .map((p) => (
            <PackRow key={p.id} pack={p} onOpen={() => setOpenId(p.id)} />
          ))}
      </div>

      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={() => app.go('settings')}>
          ✔︎ Terminé
        </button>
      </Actions>
    </div>
  );
}

function PackRow({ pack, onOpen }: { pack: WordPack; onOpen: () => void }) {
  const { settings, setSettings } = useApp();
  const on = settings.activePackIds.includes(pack.id);
  return (
    <div className="card tight between">
      <button
        onClick={onOpen}
        style={{ background: 'none', border: 0, textAlign: 'left', flex: 1, cursor: 'pointer', padding: 0 }}
      >
        <strong style={{ fontSize: 15.5 }}>
          {pack.emoji} {pack.name}
        </strong>
        <div className="tiny">
          {pack.pairs.length} paires{pack.adult ? ' · 18+' : ''}
          {pack.builtin ? ' · intégré' : ''}
        </div>
      </button>
      <button
        className="chip"
        data-on={on}
        onClick={() =>
          setSettings({
            activePackIds: on
              ? settings.activePackIds.filter((x) => x !== pack.id)
              : [...settings.activePackIds, pack.id],
          })
        }
      >
        {on ? '✓ Actif' : 'Inactif'}
      </button>
    </div>
  );
}

function PackEditor({ pack, onBack }: { pack: WordPack; onBack: () => void }) {
  const app = useApp();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const add = () => {
    if (!a.trim() || !b.trim()) return;
    app.addPair(pack.id, a, b);
    setA('');
    setB('');
  };

  const exportJson = JSON.stringify(
    { name: pack.name, emoji: pack.emoji, pairs: pack.pairs.map(({ a: x, b: y }) => ({ a: x, b: y })) },
    null,
    2,
  );

  return (
    <div className="screen">
      <Topbar title={`${pack.emoji} ${pack.name}`} onBack={onBack} />

      {!pack.builtin && (
        <div className="card stack">
          <div className="label">Ajouter une paire</div>
          <div className="tiny">
            Deux mots <b>proches mais distincts</b> — c'est là que le jeu se joue. Ex : poêle /
            casserole, dauphin / requin.
          </div>
          <input
            type="text"
            value={a}
            placeholder="Mot des civils (ex : poêle)"
            autoCapitalize="none"
            onChange={(e) => setA(e.target.value)}
          />
          <input
            type="text"
            value={b}
            placeholder="Mot des imposteurs (ex : casserole)"
            autoCapitalize="none"
            onChange={(e) => setB(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button className="btn primary" onClick={add} disabled={!a.trim() || !b.trim()}>
            ＋ Ajouter
          </button>
        </div>
      )}

      <SectionTitle>
        {pack.pairs.length} paire{pack.pairs.length > 1 ? 's' : ''}
      </SectionTitle>

      <div className="stack">
        {pack.pairs.map((p) => (
          <div key={p.id} className="card tight between">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15 }}>
                <span style={{ color: 'var(--civil)', fontWeight: 700 }}>{p.a}</span>
                <span className="tiny"> vs </span>
                <span style={{ color: 'var(--undercover)', fontWeight: 700 }}>{p.b}</span>
              </div>
            </div>
            {!pack.builtin && (
              <button
                className="iconbtn"
                aria-label="Supprimer"
                onClick={() => app.deletePair(pack.id, p.id)}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
        {pack.pairs.length === 0 && (
          <div className="card tight tiny">Pack vide — ajoute au moins une paire.</div>
        )}
      </div>

      <details className="card tight">
        <summary className="label" style={{ cursor: 'pointer' }}>Exporter en JSON</summary>
        <textarea readOnly value={exportJson} style={{ marginTop: 10 }} />
        <div className="tiny">Copie ce texte pour le partager ou le réimporter ailleurs.</div>
      </details>

      {!pack.builtin && (
        <>
          {confirmDelete ? (
            <div className="card stack">
              <div className="err">Supprimer « {pack.name} » et ses {pack.pairs.length} paires ?</div>
              <div className="row">
                <button
                  className="btn danger"
                  onClick={() => {
                    app.deletePack(pack.id);
                    onBack();
                  }}
                >
                  Oui, supprimer
                </button>
                <button className="btn ghost" onClick={() => setConfirmDelete(false)}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button className="btn danger sm" style={{ width: '100%' }} onClick={() => setConfirmDelete(true)}>
              🗑️ Supprimer le pack
            </button>
          )}
        </>
      )}
      <div style={{ height: 8 }} />
    </div>
  );
}
