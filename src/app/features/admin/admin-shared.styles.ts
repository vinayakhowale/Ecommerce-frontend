/** Styles shared by the admin list screens added for banners, orders, creator videos and reviews. */
export const ADMIN_LIST_STYLES = `
  header.page { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 26px; }
  .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
  header.page h1 { font-size: 26px; }
  .form-card { padding: 28px; max-width: 760px; margin-bottom: 24px; }
  .form-card h2 { font-size: 18px; margin-bottom: 18px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .hint { font-size: 12px; color: var(--ink-soft); }
  .upload-btn {
    display: inline-block; padding: 10px 16px; border-radius: 999px; border: 1.5px solid var(--line-strong);
    font-weight: 700; font-size: 13px; cursor: pointer; width: fit-content;
  }
  .error { color: var(--poppy); font-size: 13px; margin-bottom: 12px; }
  .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
  .table-skel { height: 260px; }
  .table { overflow: hidden; }
  .row { display: grid; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--mist-deep, var(--line)); font-size: 13.5px; }
  .row:last-child { border-bottom: none; }
  .row.head { font-weight: 700; color: var(--ink-soft); font-size: 11.5px; text-transform: uppercase; background: var(--mist, var(--paper-deep)); }
  .status { font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 999px; width: fit-content; background: var(--paper-deep); white-space: nowrap; }
  .status.ok { background: var(--jade-wash, var(--vetiver-wash)); color: var(--jade-deep, var(--vetiver-deep)); }
  .status.warn { background: #fff4d6; color: #8a6100; }
  .status.bad { background: var(--poppy-wash, #fde2dd); color: var(--poppy-deep, #a3311c); }
  .row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
  .danger { color: var(--poppy); }
  .muted { color: var(--ink-soft); }
  .small { font-size: 12px; }
  .filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .filters button { border: 1px solid var(--line-strong); background: transparent; border-radius: 999px; padding: 7px 14px; font-size: 12.5px; font-weight: 700; cursor: pointer; color: var(--ink-soft); }
  .filters button.on { background: var(--ink); color: #fff; border-color: var(--ink); }
  .pager { display: flex; justify-content: center; gap: 10px; align-items: center; padding: 16px; font-size: 13px; }
  @media (max-width: 880px) {
    .two-col { grid-template-columns: 1fr; }
    .row { grid-template-columns: 1fr !important; gap: 8px; }
    .row.head { display: none; }
  }
`;
