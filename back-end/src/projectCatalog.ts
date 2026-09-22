export const PROJECT_SLUGS = [
	"oscre",
	"industrial-drill-monitoring",
	"glucose-monitoring-research",
	"graphsketcher-desktop",
	"pysynth-unified",
	"ecen-427-http-modules",
	"ece-6100-course-companion",
	"scopecraft",
	"civ-pro-trial-ready",
	"congress-institutional-simulator",
	"constitutional-review-simulator",
	"lobby-capture-simulator",
	"ballot-clarity",
	"is-there-consensus",
	"incan-gold-strategy-tester",
	"zilch-game-family",
	"boggle",
	"cofoundry",
	"np-service-request",
	"operation-opportunity",
	"retroverse",
	"agroindustria-torca",
	"marietta-violin",
	"the-restoration",
	"personal-portfolio",
	"webops-template",
	"classes-with-jacob",
	"instruction-material-library",
	"avasan-classroom-network",
	"audiot",
	"stride"
] as const;

export type ProjectSlug = typeof PROJECT_SLUGS[number];

const projectSlugSet = new Set<string>(PROJECT_SLUGS);

export function isProjectSlug(value: string): value is ProjectSlug {
	return projectSlugSet.has(value);
}
