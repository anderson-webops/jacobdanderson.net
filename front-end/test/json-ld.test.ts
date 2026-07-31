import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "../src/utils/json-ld";

describe("serializeJsonLd", () => {
	it("prevents metadata from closing its script element", () => {
		const serialized = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
		expect(serialized).not.toContain("</script>");
		expect(serialized).toContain("\\u003c/script>");
	});
});
