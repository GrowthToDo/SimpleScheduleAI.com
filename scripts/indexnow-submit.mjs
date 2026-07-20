// IndexNow submitter for simplescheduleai.com
//
// Pings IndexNow (Bing, Yandex, and partners) with the current sitemap URLs so
// non-Google engines re-crawl changed pages fast. ChatGPT Search and Copilot
// lean on the Bing index, so this is the practical multi-index lever.
//
// Prerequisite: the key file public/<KEY>.txt must be DEPLOYED and reachable at
//   https://simplescheduleai.com/<KEY>.txt
// (IndexNow validates ownership via that file). Run AFTER a deploy.
//
// Reads the LIVE sitemap (not dist/): the publish flow pushes and lets Netlify
// build, so the local dist/ is stale at exactly the moment this runs — a stale
// read silently omits the just-published URL. Live is the truth post-deploy.
//
// Safe to re-run; IndexNow tolerates resubmission. Submits the full sitemap,
// which is well under IndexNow's 10,000-per-request limit.

const HOST = 'simplescheduleai.com';
const KEY = 'ea74743839f47d44baeda349244ae9fc';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap-0.xml`;

const smRes = await fetch(SITEMAP_URL);
if (!smRes.ok) {
  console.error(`Could not fetch live sitemap (${SITEMAP_URL}): HTTP ${smRes.status}`);
  process.exit(1);
}
const xml = await smRes.text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter(Boolean);

if (urlList.length === 0) {
  console.error('No <loc> URLs found in sitemap; nothing to submit.');
  process.exit(1);
}

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

console.log(`IndexNow: submitted ${urlList.length} URLs -> HTTP ${res.status} ${res.statusText}`);
if (res.status !== 200 && res.status !== 202) {
  console.error('Non-success status. Common cause: key file not yet deployed/reachable at ' + KEY_LOCATION);
  process.exit(1);
}
