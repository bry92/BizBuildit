import { businesses, brandingResults, websiteResults, pricingResults, leadResults } from "../drizzle/schema";

interface BusinessPackage {
  business: typeof businesses.$inferSelect;
  branding: typeof brandingResults.$inferSelect | null;
  website: typeof websiteResults.$inferSelect | null;
  pricing: typeof pricingResults.$inferSelect | null;
  leads: typeof leadResults.$inferSelect | null;
}

/**
 * Generate a complete HTML business package
 */
export function generateBusinessHTML(pkg: BusinessPackage): string {
  const { business, branding, website, pricing, leads } = pkg;

  const colorPalette = branding?.colorPalette as Record<string, string> | null;
  const primaryColor = colorPalette?.primary || "#6366f1";
  const secondaryColor = colorPalette?.secondary || "#8b5cf6";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${branding?.businessName || business.name} - Business Package</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            color: white;
            padding: 60px 20px;
            text-align: center;
            margin-bottom: 40px;
            border-radius: 8px;
        }
        
        header h1 {
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .section {
            background: white;
            padding: 40px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            color: ${primaryColor};
            margin-bottom: 20px;
            font-size: 28px;
            border-bottom: 3px solid ${primaryColor};
            padding-bottom: 10px;
        }
        
        .section h3 {
            color: ${secondaryColor};
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .color-palette {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .color-box {
            text-align: center;
        }
        
        .color-swatch {
            width: 100%;
            height: 100px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
        }
        
        .pricing-tiers {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .tier {
            border: 2px solid ${primaryColor};
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .tier h4 {
            font-size: 20px;
            margin-bottom: 10px;
            color: ${primaryColor};
        }
        
        .tier .price {
            font-size: 32px;
            font-weight: bold;
            color: ${secondaryColor};
            margin-bottom: 10px;
        }
        
        .tier p {
            color: #666;
            font-size: 14px;
        }
        
        .ad-copy {
            background: #f3f4f6;
            padding: 15px;
            border-left: 4px solid ${primaryColor};
            margin: 15px 0;
            border-radius: 4px;
        }
        
        .email-template {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 4px;
            margin: 15px 0;
            font-family: monospace;
            white-space: pre-wrap;
            font-size: 13px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .info-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 4px;
        }
        
        .info-box strong {
            color: ${primaryColor};
            display: block;
            margin-bottom: 5px;
        }
        
        footer {
            text-align: center;
            padding: 20px;
            color: #666;
            border-top: 1px solid #ddd;
            margin-top: 40px;
        }
        
        @media print {
            body {
                background: white;
            }
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${branding?.businessName || business.name}</h1>
            <p>${branding?.tagline || "Professional Business Services"}</p>
        </header>
        
        <!-- Business Overview -->
        <div class="section">
            <h2>Business Overview</h2>
            <div class="info-grid">
                <div class="info-box">
                    <strong>Service Type:</strong>
                    ${business.serviceType}
                </div>
                <div class="info-box">
                    <strong>Location:</strong>
                    ${business.location}
                </div>
                <div class="info-box">
                    <strong>Target Market:</strong>
                    ${business.targetMarket || "Not specified"}
                </div>
                <div class="info-box">
                    <strong>Business Goals:</strong>
                    ${business.businessGoals || "Not specified"}
                </div>
            </div>
        </div>
        
        ${
          branding
            ? `
        <!-- Branding -->
        <div class="section">
            <h2>Brand Identity</h2>
            
            <h3>Brand Voice & Tone</h3>
            <p>${branding.brandVoice}</p>
            
            ${
              branding.logoDescription
                ? `
            <h3>Logo Concept</h3>
            <p>${branding.logoDescription}</p>
            `
                : ""
            }
            
            ${
              colorPalette
                ? `
            <h3>Color Palette</h3>
            <div class="color-palette">
                ${Object.entries(colorPalette)
                  .map(
                    ([name, color]) => `
                <div class="color-box">
                    <div class="color-swatch" style="background-color: ${color};"></div>
                    <strong>${name}</strong>
                    <p>${color}</p>
                </div>
                `
                  )
                  .join("")}
            </div>
            `
                : ""
            }
        </div>
        `
            : ""
        }
        
        ${
          website
            ? `
        <!-- Website Content -->
        <div class="section">
            <h2>Website Content</h2>
            
            <h3>Hero Section</h3>
            <h4>${website.heroTitle}</h4>
            <p>${website.heroSubtitle}</p>
            <p>${website.heroDescription}</p>
            
            <h3>Features</h3>
            <p>${website.featuresSectionCopy}</p>
            
            ${
              website.ctaText
                ? `
            <h3>Call to Action</h3>
            <p>${website.ctaText}</p>
            `
                : ""
            }
            
            <h3>SEO Metadata</h3>
            <div class="info-grid">
                <div class="info-box">
                    <strong>Page Title:</strong>
                    ${website.seoTitle}
                </div>
                <div class="info-box">
                    <strong>Meta Description:</strong>
                    ${website.seoDescription}
                </div>
                <div class="info-box">
                    <strong>Keywords:</strong>
                    ${website.seoKeywords}
                </div>
            </div>
        </div>
        `
            : ""
        }
        
        ${
          pricing
            ? `
        <!-- Pricing Strategy -->
        <div class="section">
            <h2>Pricing Strategy</h2>
            
            ${
              pricing.pricingStrategy
                ? `
            <h3>Strategy</h3>
            <p>${pricing.pricingStrategy}</p>
            `
                : ""
            }
            
            ${
              pricing.recommendedTiers
                ? `
            <h3>Recommended Pricing Tiers</h3>
            <div class="pricing-tiers">
                ${(pricing.recommendedTiers as Array<{name: string; price: number; description: string}>)
                  .map(
                    (tier) => `
                <div class="tier">
                    <h4>${tier.name}</h4>
                    <div class="price">$${tier.price}</div>
                    <p>${tier.description}</p>
                </div>
                `
                  )
                  .join("")}
            </div>
            `
                : ""
            }
            
            ${
              pricing.marketBenchmark
                ? `
            <h3>Market Benchmarks</h3>
            <div class="info-grid">
                ${Object.entries(pricing.marketBenchmark as Record<string, number>)
                  .map(
                    ([name, value]) => `
                <div class="info-box">
                    <strong>${name}:</strong>
                    $${value}
                </div>
                `
                  )
                  .join("")}
            </div>
            `
                : ""
            }
        </div>
        `
            : ""
        }
        
        ${
          leads
            ? `
        <!-- Lead Generation -->
        <div class="section">
            <h2>Lead Generation Templates</h2>
            
            ${
              leads.facebookAdCopy
                ? `
            <h3>Facebook Ad Copy</h3>
            <div class="ad-copy">${leads.facebookAdCopy}</div>
            `
                : ""
            }
            
            ${
              leads.googleAdCopy
                ? `
            <h3>Google Ads Copy</h3>
            <div class="ad-copy">${leads.googleAdCopy}</div>
            `
                : ""
            }
            
            ${
              leads.linkedinAdCopy
                ? `
            <h3>LinkedIn Ad Copy</h3>
            <div class="ad-copy">${leads.linkedinAdCopy}</div>
            `
                : ""
            }
            
            ${
              leads.emailSequence
                ? `
            <h3>Email Sequence</h3>
            <div class="email-template">${leads.emailSequence}</div>
            `
                : ""
            }
            
            ${
              leads.smsScript
                ? `
            <h3>SMS Script</h3>
            <div class="ad-copy">${leads.smsScript}</div>
            `
                : ""
            }
            
            ${
              leads.leadMagnetIdeas
                ? `
            <h3>Lead Magnet Ideas</h3>
            <p>${leads.leadMagnetIdeas}</p>
            `
                : ""
            }
        </div>
        `
            : ""
        }
        
        <footer>
            <p>Generated by BizBuildIt on ${new Date().toLocaleDateString()}</p>
            <p>This business package was created using AI-powered tools for branding, websites, pricing, and marketing.</p>
        </footer>
    </div>
</body>
</html>`;
}

/**
 * Generate CSV data for pricing and leads
 */
export function generateBusinessCSV(pkg: BusinessPackage): string {
  const { business, pricing, leads } = pkg;
  const rows: string[] = [];
  const escapeCsvCell = (value: unknown): string => {
    const raw = value == null ? "" : String(value);
    const safe =
      /^[=+\-@\t\r]/.test(raw)
        ? `'${raw}`
        : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const makeCsvRow = (...cells: unknown[]): string =>
    cells.map(escapeCsvCell).join(",");

  // Header
  rows.push(escapeCsvCell("Business Information"));
  rows.push(makeCsvRow("Business Name", business.name));
  rows.push(makeCsvRow("Service Type", business.serviceType));
  rows.push(makeCsvRow("Location", business.location));
  rows.push(makeCsvRow("Target Market", business.targetMarket || "Not specified"));
  rows.push(makeCsvRow("Business Goals", business.businessGoals || "Not specified"));
  rows.push("");

  // Pricing
  if (pricing) {
    rows.push(escapeCsvCell("Pricing Strategy"));
    rows.push(makeCsvRow("Strategy", pricing.pricingStrategy || "Not specified"));
    rows.push("");

    if (pricing.recommendedTiers) {
      rows.push(escapeCsvCell("Pricing Tiers"));
      rows.push(makeCsvRow("Tier Name", "Price", "Description"));
      (pricing.recommendedTiers as Array<{name: string; price: number; description: string}>).forEach(
        (tier) => {
          rows.push(makeCsvRow(tier.name, `$${tier.price}`, tier.description));
        }
      );
      rows.push("");
    }

    if (pricing.marketBenchmark) {
      rows.push(escapeCsvCell("Market Benchmarks"));
      rows.push(makeCsvRow("Category", "Price"));
      Object.entries(pricing.marketBenchmark as Record<string, number>).forEach(([name, value]) => {
        rows.push(makeCsvRow(name, `$${value}`));
      });
      rows.push("");
    }
  }

  // Leads
  if (leads) {
    rows.push(escapeCsvCell("Lead Generation Templates"));
    if (leads.facebookAdCopy) {
      rows.push(makeCsvRow("Facebook Ad Copy", leads.facebookAdCopy));
    }
    if (leads.googleAdCopy) {
      rows.push(makeCsvRow("Google Ads Copy", leads.googleAdCopy));
    }
    if (leads.linkedinAdCopy) {
      rows.push(makeCsvRow("LinkedIn Ad Copy", leads.linkedinAdCopy));
    }
    if (leads.smsScript) {
      rows.push(makeCsvRow("SMS Script", leads.smsScript));
    }
    if (leads.leadMagnetIdeas) {
      rows.push(makeCsvRow("Lead Magnet Ideas", leads.leadMagnetIdeas));
    }
  }

  return rows.join("\n");
}

/**
 * Generate plain text business report
 */
export function generateBusinessReport(pkg: BusinessPackage): string {
  const { business, branding, website, pricing, leads } = pkg;
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push(`BUSINESS PACKAGE: ${branding?.businessName || business.name}`);
  lines.push("=".repeat(80));
  lines.push("");

  lines.push("BUSINESS OVERVIEW");
  lines.push("-".repeat(80));
  lines.push(`Service Type: ${business.serviceType}`);
  lines.push(`Location: ${business.location}`);
  lines.push(`Target Market: ${business.targetMarket || "Not specified"}`);
  lines.push(`Business Goals: ${business.businessGoals || "Not specified"}`);
  lines.push("");

  if (branding) {
    lines.push("BRAND IDENTITY");
    lines.push("-".repeat(80));
    lines.push(`Business Name: ${branding.businessName}`);
    lines.push(`Tagline: ${branding.tagline}`);
    lines.push(`Brand Voice: ${branding.brandVoice}`);
    if (branding.logoDescription) {
      lines.push(`Logo Concept: ${branding.logoDescription}`);
    }
    lines.push("");
  }

  if (website) {
    lines.push("WEBSITE CONTENT");
    lines.push("-".repeat(80));
    lines.push(`Hero Title: ${website.heroTitle}`);
    lines.push(`Hero Subtitle: ${website.heroSubtitle}`);
    lines.push(`Hero Description: ${website.heroDescription}`);
    lines.push(`Features: ${website.featuresSectionCopy}`);
    if (website.ctaText) {
      lines.push(`CTA: ${website.ctaText}`);
    }
    lines.push(`SEO Title: ${website.seoTitle}`);
    lines.push(`SEO Description: ${website.seoDescription}`);
    lines.push(`Keywords: ${website.seoKeywords}`);
    lines.push("");
  }

  if (pricing) {
    lines.push("PRICING STRATEGY");
    lines.push("-".repeat(80));
    if (pricing.pricingStrategy) {
      lines.push(`Strategy: ${pricing.pricingStrategy}`);
    }
    if (pricing.recommendedTiers) {
      lines.push("Recommended Tiers:");
      (pricing.recommendedTiers as Array<{name: string; price: number; description: string}>).forEach((tier) => {
        lines.push(`  - ${tier.name}: $${tier.price} (${tier.description})`);
      });
    }
    lines.push("");
  }

  if (leads) {
    lines.push("LEAD GENERATION TEMPLATES");
    lines.push("-".repeat(80));
    if (leads.facebookAdCopy) {
      lines.push(`Facebook Ad:\n${leads.facebookAdCopy}\n`);
    }
    if (leads.googleAdCopy) {
      lines.push(`Google Ads:\n${leads.googleAdCopy}\n`);
    }
    if (leads.linkedinAdCopy) {
      lines.push(`LinkedIn Ad:\n${leads.linkedinAdCopy}\n`);
    }
    if (leads.emailSequence) {
      lines.push(`Email Sequence:\n${leads.emailSequence}\n`);
    }
    if (leads.smsScript) {
      lines.push(`SMS Script:\n${leads.smsScript}\n`);
    }
  }

  lines.push("=".repeat(80));
  lines.push(`Generated on ${new Date().toLocaleString()}`);
  lines.push("Generated by BizBuildIt");
  lines.push("=".repeat(80));

  return lines.join("\n");
}
