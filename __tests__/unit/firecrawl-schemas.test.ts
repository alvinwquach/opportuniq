/**
 * Unit tests for lib/integrations/firecrawl-schemas.ts
 */

import { COST_ESTIMATE_SCHEMA, CONTRACTOR_SCHEMA } from "@/lib/integrations/firecrawl-schemas";

describe("COST_ESTIMATE_SCHEMA", () => {
  it("schema has required proMin and proMax fields", () => {
    expect(COST_ESTIMATE_SCHEMA.required).toContain("proMin");
    expect(COST_ESTIMATE_SCHEMA.required).toContain("proMax");
  });

  it("proMin and proMax are typed as numbers with descriptions", () => {
    expect(COST_ESTIMATE_SCHEMA.properties.proMin.type).toBe("number");
    expect(COST_ESTIMATE_SCHEMA.properties.proMax.type).toBe("number");
    expect(COST_ESTIMATE_SCHEMA.properties.proMin.description).toBeTruthy();
    expect(COST_ESTIMATE_SCHEMA.properties.proMax.description).toBeTruthy();
  });

  it("schema includes costFactors as array of strings", () => {
    const costFactors = COST_ESTIMATE_SCHEMA.properties.costFactors;
    expect(costFactors.type).toBe("array");
    expect(costFactors.items.type).toBe("string");
  });

  it("schema includes timeEstimate with diy and pro subfields", () => {
    const timeEstimate = COST_ESTIMATE_SCHEMA.properties.timeEstimate;
    expect(timeEstimate.type).toBe("object");
    expect(timeEstimate.properties.diy.type).toBe("string");
    expect(timeEstimate.properties.pro.type).toBe("string");
  });

  it("schema includes optional diy cost fields", () => {
    expect(COST_ESTIMATE_SCHEMA.properties.diyMin.type).toBe("number");
    expect(COST_ESTIMATE_SCHEMA.properties.diyMax.type).toBe("number");
    expect(COST_ESTIMATE_SCHEMA.properties.diyAvg.type).toBe("number");
  });

  it("schema includes proAvg as optional number", () => {
    expect(COST_ESTIMATE_SCHEMA.properties.proAvg.type).toBe("number");
    // proAvg is not in required
    expect(COST_ESTIMATE_SCHEMA.required).not.toContain("proAvg");
  });

  it("schema includes sampleSize as number", () => {
    expect(COST_ESTIMATE_SCHEMA.properties.sampleSize.type).toBe("number");
  });
});

describe("CONTRACTOR_SCHEMA", () => {
  it("schema has contractors array", () => {
    expect(CONTRACTOR_SCHEMA.properties.contractors.type).toBe("array");
  });

  it("schema has name as required field in contractor items", () => {
    const items = CONTRACTOR_SCHEMA.properties.contractors.items;
    expect(items.required).toContain("name");
    expect(items.properties.name.type).toBe("string");
  });

  it("schema includes phone, address, rating, reviewCount, specialties", () => {
    const props = CONTRACTOR_SCHEMA.properties.contractors.items.properties;
    expect(props.phone.type).toBe("string");
    expect(props.address.type).toBe("string");
    expect(props.rating.type).toBe("number");
    expect(props.reviewCount.type).toBe("number");
    expect(props.specialties.type).toBe("array");
    expect(props.specialties.items.type).toBe("string");
  });

  it("rating description mentions 1-5 scale", () => {
    expect(CONTRACTOR_SCHEMA.properties.contractors.items.properties.rating.description).toContain("1-5");
  });
});
