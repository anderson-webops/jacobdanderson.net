import process from "node:process";

const baseUrl = new URL(process.env.LIVE_SMOKE_BASE_URL || "https://jacobdanderson.net");
const expectedCommit = (process.env.LIVE_SMOKE_EXPECT_COMMIT || "").trim();

async function fetchChecked(pathname, expectedStatus = 200) {
	const url = new URL(pathname, baseUrl);
	const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
	if (response.status !== expectedStatus) {
		throw new Error(`${url} returned ${response.status}; expected ${expectedStatus}.`);
	}
	return response;
}

const homepage = await fetchChecked("/");
const homepageHtml = await homepage.text();
if (!homepageHtml.includes("Jacob Anderson")) throw new Error("Homepage did not render the expected site.");
for (const header of ["content-security-policy", "referrer-policy", "x-content-type-options", "x-frame-options"]) {
	if (!homepage.headers.get(header)) throw new Error(`Homepage is missing ${header}.`);
}

const deployment = await (await fetchChecked("/deployment.json")).json();
if (deployment.service !== "front-end" || deployment.runtime !== "vite-ssg") {
	throw new Error("Deployment metadata does not identify the Vite SSG frontend.");
}
if (expectedCommit && !String(deployment.commit || "").startsWith(expectedCommit)) {
	throw new Error(`Live commit ${deployment.commit || "(missing)"} does not match ${expectedCommit}.`);
}

const manifest = await fetchChecked("/site.webmanifest");
if (!/application\/manifest\+json/i.test(manifest.headers.get("content-type") || "")) {
	throw new Error("Web manifest has the wrong content type.");
}
await fetchChecked("/robots.txt");
await fetchChecked("/sitemap.xml");
await fetchChecked("/api/readyz");
await fetchChecked("/_dbinfo", 404);
await fetchChecked("/accounts/me", 404);

process.stdout.write(`Live smoke ok: ${baseUrl.origin}\n`);
