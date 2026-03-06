export default function Loading() {
  return (
    <>
      <style>{`
        :root {
          --c-bg:#EFF7FF; --c-surface:#FFFFFF; --c-surface-2:#E2F0FC;
          --c-border:#C5DCF2; --c-sidebar:#F5FAFE;
        }
        [data-mode="dark"] {
          --c-bg:#081420; --c-surface:#0F1E2D; --c-surface-2:#162435;
          --c-border:#1A3045; --c-sidebar:#0A1825;
        }

        .ld-shell {
          display: flex; width: 100%; height: 100dvh;
          background: var(--c-bg); overflow: hidden;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        /* ── Shimmer keyframe ── */
        @keyframes ldShimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk {
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            var(--c-surface-2) 25%,
            var(--c-border)    50%,
            var(--c-surface-2) 75%
          );
          background-size: 600px 100%;
          animation: ldShimmer 1.4s infinite linear;
        }
        .sk-r { border-radius: 50%; }
        .sk-r10 { border-radius: 10px; }
        .sk-r14 { border-radius: 14px; }

        /* ── Sidebar (desktop only) ── */
        .ld-sidebar {
          display: none;
        }
        @media(min-width:1024px){
          .ld-sidebar {
            display: flex; flex-direction: column;
            width: 224px; flex-shrink: 0; height: 100vh;
            background: var(--c-sidebar); border-right: 1px solid var(--c-border);
            padding: 0;
          }
        }

        .ld-sb-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 16px 14px;
          border-bottom: 1px solid var(--c-border);
        }

        .ld-sb-nav { padding: 12px 10px; display: flex; flex-direction: column; gap: 6px; }
        .ld-sb-lbl { height: 10px; width: 70px; margin: 6px 8px 8px; }

        .ld-sb-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 10px;
        }
        .ld-sb-ic  { width: 30px; height: 30px; flex-shrink: 0; border-radius: 8px; }
        .ld-sb-txt { height: 11px; flex: 1; border-radius: 6px; }

        .ld-sb-footer {
          margin-top: auto; padding: 10px; border-top: 1px solid var(--c-border);
          display: flex; align-items: center; gap: 9px;
        }
        .ld-sb-av   { width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0; }
        .ld-sb-info { flex: 1; display: flex; flex-direction: column; gap: 5px; }

        /* ── Right column ── */
        .ld-right {
          flex: 1; display: flex; flex-direction: column;
          min-width: 0; overflow: hidden;
        }

        /* ── Mobile top bar skeleton ── */
        .ld-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 14px; height: 52px; flex-shrink: 0;
          background: var(--c-surface); border-bottom: 1px solid var(--c-border);
        }
        @media(min-width:1024px){ .ld-bar { display: none; } }
        .ld-bar-left  { display: flex; align-items: center; gap: 10px; }
        .ld-bar-right { display: flex; align-items: center; gap: 8px; }

        /* ── Desktop navbar skeleton ── */
        .ld-navbar {
          display: none;
        }
        @media(min-width:1024px){
          .ld-navbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 24px; height: 56px; flex-shrink: 0;
            background: var(--c-surface); border-bottom: 1px solid var(--c-border);
          }
        }
        .ld-nb-right { display: flex; align-items: center; gap: 8px; }

        /* ── Main content ── */
        .ld-main {
          flex: 1; overflow-y: auto; padding: 24px 16px;
          background: var(--c-bg);
        }
        @media(min-width:640px){ .ld-main { padding: 28px 28px; } }

        .ld-heading { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }

        /* Stats grid */
        .ld-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        @media(min-width:640px){ .ld-stats { grid-template-columns: repeat(4, 1fr); gap: 16px; } }

        .ld-stat-card {
          border-radius: 14px; padding: 18px 16px;
          background: var(--c-surface); border: 1px solid var(--c-border);
          display: flex; flex-direction: column; gap: 10px;
        }

        /* Charts area */
        .ld-charts {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media(min-width:1024px){
          .ld-charts { grid-template-columns: 2fr 1fr; gap: 16px; }
        }

        .ld-chart-card {
          border-radius: 14px; padding: 20px;
          background: var(--c-surface); border: 1px solid var(--c-border);
          display: flex; flex-direction: column; gap: 12px;
        }
        .ld-chart-body { border-radius: 10px; }
      `}</style>

      <div className="ld-shell">

        {/* ── Desktop Sidebar ── */}
        <aside className="ld-sidebar">
          <div className="ld-sb-brand">
            <div className="sk ld-sb-ic" style={{width:32,height:32,borderRadius:9}} />
            <div style={{display:"flex",flexDirection:"column",gap:5,flex:1}}>
              <div className="sk" style={{height:12,width:80,borderRadius:6}} />
              <div className="sk" style={{height:9,width:52,borderRadius:5}} />
            </div>
          </div>

          <div className="ld-sb-nav">
            <div className="sk ld-sb-lbl" />
            {Array(6).fill(0).map((_, i) => (
              <div className="ld-sb-item" key={i}>
                <div className="sk ld-sb-ic" />
                <div className="sk ld-sb-txt" style={{opacity: 1 - i * 0.1}} />
              </div>
            ))}
          </div>

          <div className="ld-sb-footer">
            <div className="sk ld-sb-av" />
            <div className="ld-sb-info">
              <div className="sk" style={{height:10,borderRadius:5}} />
              <div className="sk" style={{height:8,width:"65%",borderRadius:5}} />
            </div>
          </div>
        </aside>

        {/* ── Right column ── */}
        <div className="ld-right">

          {/* Mobile top bar */}
          <div className="ld-bar">
            <div className="ld-bar-left">
              <div className="sk" style={{width:28,height:28,borderRadius:8}} />
              <div className="sk" style={{width:26,height:26,borderRadius:7}} />
              <div className="sk" style={{width:80,height:11,borderRadius:6}} />
            </div>
            <div className="ld-bar-right">
              <div className="sk" style={{width:32,height:32,borderRadius:8}} />
            </div>
          </div>

          {/* Desktop navbar */}
          <div className="ld-navbar">
            <div className="sk" style={{width:160,height:13,borderRadius:6}} />
            <div className="ld-nb-right">
              <div className="sk" style={{width:32,height:32,borderRadius:8}} />
              <div className="sk" style={{width:80,height:32,borderRadius:8}} />
              <div className="sk" style={{width:88,height:32,borderRadius:8}} />
            </div>
          </div>

          {/* Main content */}
          <div className="ld-main">

            {/* Heading */}
            <div className="ld-heading">
              <div className="sk" style={{height:28,width:180,borderRadius:8}} />
              <div className="sk" style={{height:13,width:240,borderRadius:6}} />
            </div>

            {/* Stats */}
            <div className="ld-stats">
              {Array(4).fill(0).map((_, i) => (
                <div className="ld-stat-card" key={i}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div className="sk" style={{height:10,width:"50%",borderRadius:5}} />
                    <div className="sk" style={{width:28,height:28,borderRadius:8}} />
                  </div>
                  <div className="sk" style={{height:22,width:"65%",borderRadius:6}} />
                  <div className="sk" style={{height:8,width:"40%",borderRadius:5}} />
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="ld-charts">
              <div className="ld-chart-card">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div className="sk" style={{height:13,width:120,borderRadius:6}} />
                  <div className="sk" style={{height:28,width:72,borderRadius:8}} />
                </div>
                <div className="sk ld-chart-body" style={{height:200}} />
              </div>
              <div className="ld-chart-card">
                <div className="sk" style={{height:13,width:100,borderRadius:6}} />
                <div className="sk ld-chart-body" style={{height:200}} />
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {Array(3).fill(0).map((_,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="sk" style={{width:10,height:10,borderRadius:3,flexShrink:0}} />
                      <div className="sk" style={{height:9,flex:1,borderRadius:5}} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}